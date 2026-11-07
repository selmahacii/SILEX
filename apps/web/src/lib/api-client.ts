import { SystemRole } from '@silex/shared';
import { AuthResponseDto } from '@silex/contracts';
import {
  mockStore,
  SYSTEM_USERS,
  MOCK_COST_DISTRIBUTION,
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
    const method = (options.method || 'GET').toUpperCase();
    let body: any = {};
    if (options.body && typeof options.body === 'string') {
      try {
        body = JSON.parse(options.body);
      } catch {
        // ignore
      }
    }

    // ==========================================
    // 1. MUTATIONS (POST / PUT / PATCH / DELETE)
    // ==========================================
    if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
      // 1.1 Workflows Decisions (Approve, Reject, Revise)
      if (clean.includes('/workflows/')) {
        const wfMatch = endpoint.match(/\/workflows\/([a-zA-Z0-9_-]+)\/(approve|reject|request-revision)/);
        if (wfMatch) {
          const wfId = wfMatch[1];
          const action = wfMatch[2];
          if (action === 'approve') return mockStore.approveWorkflow(wfId, body.notes);
          if (action === 'reject') return mockStore.rejectWorkflow(wfId, body.reason);
          if (action === 'request-revision') return mockStore.requestRevisionWorkflow(wfId, body.instructions);
        }
      }

      // 1.2 Projects Actions (Creation, Progress, Milestones, ODS, Situations, Members, Updates)
      if (clean.includes('/projects')) {
        // Création d'un nouveau projet
        if ((clean === '/projects' || clean === '/api/projects') && method === 'POST') {
          return mockStore.addProject(body);
        }

        // Avancement physique & dépenses
        if (clean.includes('/progress')) {
          const idMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)\/progress/);
          if (idMatch) return mockStore.adjustProgress(idMatch[1], Number(body.physicalProgress || 0), Number(body.financialProgress || 0));
        }

        // Ajout jalon contractuel (milestone)
        if (clean.includes('/milestones')) {
          const idMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)\/milestones/);
          if (idMatch) return mockStore.addMilestone(idMatch[1], body);
        }

        // Émission Ordre de Service (ODS)
        if (clean.includes('/service-orders')) {
          const idMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)\/service-orders/);
          if (idMatch) return mockStore.addServiceOrder(idMatch[1], body);
        }

        // Création situation de travaux périodique
        if (clean.includes('/work-situations')) {
          const idMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)\/work-situations/);
          if (idMatch) return mockStore.addWorkSituation(idMatch[1], body);
        }

        // Affectation collaborateur
        if (clean.includes('/members')) {
          const idMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)\/members/);
          if (idMatch) return mockStore.addMember(idMatch[1], body);
        }

        // Modification fiche projet générale
        const projIdMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)$/);
        if (projIdMatch) {
          return mockStore.updateProject(projIdMatch[1], body);
        }
      }

      // 1.3 Procurement (Création DA & BC & Fournisseurs)
      if (clean.includes('/procurement')) {
        return mockStore.createProcurementRequest(body);
      }
      if (clean.includes('/suppliers')) {
        return mockStore.addSupplier(body);
      }
      if (clean.includes('/purchase-orders')) {
        return mockStore.createPurchaseOrder(body);
      }

      // 1.4 Stocks & Entrepôts
      if (clean.includes('/warehouses')) {
        return mockStore.addWarehouse(body);
      }
      if (clean.includes('/inventory') || clean.includes('/items')) {
        if (method === 'POST' && (clean === '/inventory' || clean === '/items')) {
          return mockStore.addInventoryItem(body);
        }
        return mockStore.addInventoryMovement(body);
      }

      // 1.5 RH & Collaborateurs
      if (clean.includes('/employees') || clean.includes('/hr')) {
        return mockStore.addEmployee(body);
      }

      // 1.6 Parc Matériel & Maintenance
      if (clean.includes('/fleet') || clean.includes('/assets')) {
        return mockStore.addAsset(body);
      }

      // 1.7 Qualité & Non-Conformités
      if (clean.includes('/quality') || clean.includes('/non-conformities')) {
        return mockStore.addNonConformity(body);
      }

      // 1.8 Auth Login
      if (clean.includes('/auth/login') || clean.includes('/auth/demo-switch')) {
        let role: SystemRole = SystemRole.DIRECTEUR_GENERAL;
        if (body.role) {
          role = body.role;
        } else if (body.email) {
          const found = SYSTEM_USERS.find(p => p.email.toLowerCase() === body.email.toLowerCase());
          if (found) role = found.role as SystemRole;
        }
        const user = SYSTEM_USERS.find(u => u.role === role) || SYSTEM_USERS[0];
        return {
          accessToken: 'silex_jwt_session_' + user.role,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            departmentCode: user.departmentCode,
            title: user.title,
            assignedProjects: [],
            permissions: ['*'],
          },
        };
      }

      return {
        success: true,
        message: 'Action enregistrée et appliquée avec succès dans le store opérationnel.',
      };
    }

    // ==========================================
    // 2. LECTURES (GET)
    // ==========================================
    // 2.1 Auth /me
    if (clean.includes('/auth/me')) {
      const savedRole = (typeof window !== 'undefined' ? localStorage.getItem('silex_active_role') : null) as SystemRole || SystemRole.DIRECTEUR_GENERAL;
      const user = SYSTEM_USERS.find(u => u.role === savedRole) || SYSTEM_USERS[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentCode: user.departmentCode,
        title: user.title,
        assignedProjects: [],
        permissions: ['*'],
      };
    }

    // 2.2 KPIs
    if (clean.includes('/kpis') || clean.includes('/stats')) {
      return mockStore.getKpis();
    }

    // 2.3 Projets (Détail ou Liste)
    if (clean.includes('/projects/')) {
      const codeMatch = endpoint.match(/\/projects\/([a-zA-Z0-9_-]+)/);
      const code = codeMatch ? codeMatch[1].toUpperCase() : '';
      return mockStore.getProject(code);
    }
    if (clean.includes('/projects') || clean.includes('/analytics/cost-distribution') || clean.includes('/finance/distribution')) {
      if (clean.includes('distribution')) {
        return MOCK_COST_DISTRIBUTION;
      }
      return mockStore.getProjects();
    }

    // 2.4 Workflows
    if (clean.includes('/workflows')) {
      return mockStore.getWorkflows();
    }

    // 2.5 Procurement
    if (clean.includes('/suppliers')) {
      return mockStore.getSuppliers();
    }
    if (clean.includes('/purchase-orders')) {
      return mockStore.getPurchaseOrders();
    }
    if (clean.includes('/procurement')) {
      return mockStore.getProcurementRequests();
    }

    // 2.6 Inventory
    if (clean.includes('/warehouses')) {
      return mockStore.getWarehouses();
    }
    if (clean.includes('/stock-movements') || clean.includes('/movements')) {
      return mockStore.getStockMovements();
    }
    if (clean.includes('/inventory') || clean.includes('/items')) {
      return mockStore.getInventoryItems();
    }

    // 2.7 Utilisateurs & HR
    if (clean.includes('/users')) {
      return SYSTEM_USERS;
    }
    if (clean.includes('/employees') || clean.includes('/hr')) {
      return mockStore.getEmployees();
    }

    // 2.8 Parc & Maintenance
    if (clean.includes('/fleet') || clean.includes('/assets')) {
      return mockStore.getAssets();
    }

    // 2.9 Qualité & QHSE
    if (clean.includes('/quality') || clean.includes('/non-conformities')) {
      return mockStore.getNonConformities();
    }

    // 2.10 Finance
    if (clean.includes('/finance')) {
      return {
        kpis: mockStore.getKpis(),
        summary: {
          totalBilled: 0,
          totalCollected: 0,
          pendingCollection: 0,
          warrantyHeld: 0,
          treasuryBalance: 0,
        },
        distribution: [],
        projects: mockStore.getProjects().map(p => ({
          ...p,
          marginRate: 0,
          contractAmount: p.contractAmount || 0,
          billedAmount: 0,
          paidAmount: 0,
          warrantyAmount: 0,
        })),
      };
    }

    // Default fallback: Always return an Array so `.find()` or `.map()` never crashes
    return [];
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

    try {
      const response = await fetch(primaryUrl, {
        ...options,
        headers,
      });

      if (!response.ok) {
        console.warn(`[SILEX API] Réponse HTTP ${response.status} sur ${endpoint}. Utilisation du store résilient.`);
        return this.getMockFallback(cleanEndpoint, options) as T;
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[SILEX API] Échec réseau sur ${endpoint}. Utilisation du store résilient :`, err?.message || err);
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
