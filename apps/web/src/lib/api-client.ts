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
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Dans le navigateur, utiliser les requêtes relatives (/api/...) via le rewrite Next.js
    // pour garantir la compatibilité même origine et éviter tout conflit CORS / ports
    if (typeof window !== 'undefined') {
      return '';
    }
    // Côté serveur (SSR), joindre directement l'API locale
    return 'http://127.0.0.1:4000';
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = this.getBaseUrl();
    const primaryUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}/api${cleanEndpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let lastError: any = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(primaryUrl, {
          ...options,
          headers,
        });

        if (!response.ok) {
          let errorMessage = 'Une erreur est survenue';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = response.statusText || 'Erreur serveur';
          }

          if (response.status === 401) {
            this.setToken(null);
          }

          throw new Error(errorMessage);
        }

        return await response.json();
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err?.message === 'string'
            ? err.message
            : err?.type
            ? `Erreur de communication (${err.type})`
            : 'Erreur réseau ou connexion interrompue';

        const errorObj = err instanceof Error ? err : new Error(message);
        lastError = errorObj;

        // Si c'est une erreur métier / statut HTTP (rejet 4xx/5xx avec message explicite), ne pas retenter
        const isNetworkError =
          !errorObj.message ||
          errorObj.message.includes('fetch') ||
          errorObj.message.includes('network') ||
          errorObj.message.includes('Failed to fetch') ||
          errorObj.name === 'TypeError' ||
          errorObj.name === 'AbortError';

        if (!isNetworkError) {
          throw errorObj;
        }

        // Si c'est une coupure réseau transitoire ou redémarrage de l'API, attendre et retenter
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Impossible de joindre le serveur API SILEX.');
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
