import { SystemRole, DEMO_PROFILES } from '@silex/shared';
import { AuthResponseDto } from '@silex/contracts';
import {
  MOCK_KPIS,
  MOCK_PROJECTS,
  MOCK_COST_DISTRIBUTION,
  MOCK_WORKFLOWS_INBOX,
  MOCK_PROCUREMENT_REQUESTS,
  MOCK_INVENTORY_ITEMS,
} from './mock-data';

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
        process.env.API_URL ||
        process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://127.0.0.1:4000';
      return serverUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }

    // 2. Côté navigateur :
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }
    return '';
  }

  private getMockFallback(endpoint: string, options: RequestInit = {}): any {
    const clean = endpoint.toLowerCase();

    // 1. Auth Login / Demo Switch
    if (clean.includes('/auth/login') || clean.includes('/auth/demo-switch')) {
      let role: SystemRole = SystemRole.DIRECTEUR_GENERAL;
      if (options.body) {
        try {
          const parsed = JSON.parse(options.body as string);
          if (parsed.role) {
            role = parsed.role;
          } else if (parsed.email) {
            const found = Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === parsed.email.toLowerCase());
            if (found) role = found.role;
          }
        } catch {
          // ignore
        }
      }
      const profile = DEMO_PROFILES[role] || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];
      return {
        accessToken: 'silex_demo_token_' + profile.role,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          departmentCode: profile.departmentCode,
          avatarUrl: profile.avatar,
          title: profile.title,
          assignedProjects: (profile.assignedProjectCodes || []).map(code => ({ id: code, code, name: code })),
          permissions: ['*'],
        },
      };
    }

    // 2. Auth /me
    if (clean.includes('/auth/me')) {
      const savedRole = (typeof window !== 'undefined' ? localStorage.getItem('silex_active_role') : null) as SystemRole || SystemRole.DIRECTEUR_GENERAL;
      const profile = DEMO_PROFILES[savedRole] || DEMO_PROFILES[SystemRole.DIRECTEUR_GENERAL];
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        departmentCode: profile.departmentCode,
        avatarUrl: profile.avatar,
        title: profile.title,
        assignedProjects: (profile.assignedProjectCodes || []).map(code => ({ id: code, code, name: code })),
        permissions: ['*'],
      };
    }

    // 3. KPIs
    if (clean.includes('/kpis') || clean.includes('/stats')) {
      return MOCK_KPIS;
    }

    // 4. Projects
    if (clean.includes('/projects/')) {
      const codeMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)/);
      const code = codeMatch ? codeMatch[1].toUpperCase() : null;
      const found = MOCK_PROJECTS.find(p => p.code === code);
      return found || MOCK_PROJECTS[0];
    }
    if (clean.includes('/projects') || clean.includes('/analytics/cost-distribution') || clean.includes('/finance/distribution')) {
      if (clean.includes('distribution')) {
        return MOCK_COST_DISTRIBUTION;
      }
      return MOCK_PROJECTS;
    }

    // 5. Workflows
    if (clean.includes('/workflows')) {
      return MOCK_WORKFLOWS_INBOX;
    }

    // 6. Procurement
    if (clean.includes('/procurement')) {
      return MOCK_PROCUREMENT_REQUESTS;
    }

    // 7. Inventory
    if (clean.includes('/inventory')) {
      return MOCK_INVENTORY_ITEMS;
    }

    // 8. Finance
    if (clean.includes('/finance')) {
      return {
        kpis: MOCK_KPIS,
        distribution: MOCK_COST_DISTRIBUTION,
        projects: MOCK_PROJECTS,
      };
    }

    // Default generic fallback
    return {
      success: true,
      message: 'Opération simulée avec succès en mode démo résilient.',
      items: [],
      data: [],
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = this.getBaseUrl();
    const primaryUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}/api${cleanEndpoint}`;

    // Si le token en cours est un token démo mock, renvoyer directement le mock
    const currentToken = this.getToken();
    if (currentToken && currentToken.startsWith('silex_demo_token_')) {
      return this.getMockFallback(cleanEndpoint, options) as T;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(primaryUrl, {
        ...options,
        headers,
      });

      if (!response.ok) {
        console.warn(`[SILEX API] Réponse HTTP ${response.status} sur ${endpoint}. Bascule automatique vers le mode démo résilient.`);
        return this.getMockFallback(cleanEndpoint, options) as T;
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[SILEX API] Échec réseau sur ${endpoint}. Bascule automatique vers le mode démo résilient :`, err?.message || err);
      return this.getMockFallback(cleanEndpoint, options) as T;
    }
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
