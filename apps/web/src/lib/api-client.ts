import { SystemRole } from '@silex/shared';
import { AuthResponseDto } from '@silex/contracts';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('silex_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('silex_token', token);
      } else {
        localStorage.removeItem('silex_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('silex_token');
    }
    return this.token;
  }

  private getBaseUrl(): string {
    // 1. Côté serveur (SSR / Server Actions / Server Functions) :
    if (typeof window === 'undefined') {
      const serverUrl =
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:3000');
      return serverUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }

    // 2. Côté navigateur :
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }
    // Par défaut dans le navigateur, les requêtes /api/* vont directement sur la même origine
    return '';
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = this.getBaseUrl();
    const primaryUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}/api${cleanEndpoint}`;

    const currentToken = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(primaryUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        try {
          errorBody = await response.text();
        } catch {
          // ignore
        }
      }
      const message =
        (typeof errorBody === 'object' && (errorBody?.message || errorBody?.error)) ||
        (typeof errorBody === 'string' && errorBody) ||
        `Erreur HTTP ${response.status} sur ${endpoint}`;
      throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const data = await this.post<AuthResponseDto>('/auth/login', { email, password });
    this.setToken(data.accessToken);
    return data;
  }

  async switchDemoRole(role: SystemRole): Promise<AuthResponseDto> {
    const data = await this.post<AuthResponseDto>('/auth/demo-switch', { role });
    this.setToken(data.accessToken);
    return data;
  }

  async getMe() {
    return this.get<any>('/auth/me');
  }
}

export const api = new ApiClient();
