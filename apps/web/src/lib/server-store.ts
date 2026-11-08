
const DEFAULT_RBAC_MATRIX: Record<string, Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean; approve: boolean; export: boolean }>> = {
  DIRECTEUR_GENERAL: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: true, export: true },
    projects: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    procurement: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    inventory: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    hr: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    finance: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    maintenance: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    quality: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    workflows: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    admin: { read: true, create: true, update: true, delete: false, approve: true, export: true },
  },
  RESPONSABLE_PROJET: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: false, export: true },
    projects: { read: true, create: true, update: true, delete: false, approve: false, export: true },
    procurement: { read: true, create: true, update: true, delete: false, approve: false, export: false },
    inventory: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    hr: { read: true, create: true, update: false, delete: false, approve: false, export: false },
    finance: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    maintenance: { read: true, create: true, update: false, delete: false, approve: false, export: false },
    quality: { read: true, create: true, update: true, delete: false, approve: false, export: false },
    workflows: { read: true, create: true, update: false, delete: false, approve: false, export: false },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  RESPONSABLE_ACHATS: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    projects: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    procurement: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    inventory: { read: true, create: true, update: true, delete: false, approve: false, export: false },
    hr: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    finance: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    maintenance: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    quality: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    workflows: { read: true, create: true, update: false, delete: false, approve: false, export: false },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  RESPONSABLE_MAGASIN: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    projects: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    procurement: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    inventory: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    hr: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    finance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    maintenance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    quality: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    workflows: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  RESPONSABLE_RH: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    projects: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    procurement: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    inventory: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    hr: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    finance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    maintenance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    quality: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    workflows: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  RESPONSABLE_FINANCIER: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: true, export: true },
    projects: { read: true, create: false, update: true, delete: false, approve: false, export: true },
    procurement: { read: true, create: false, update: false, delete: false, approve: true, export: true },
    inventory: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    hr: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    finance: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    maintenance: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    quality: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    workflows: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  RESPONSABLE_MAINTENANCE: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    projects: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    procurement: { read: true, create: true, update: false, delete: false, approve: false, export: false },
    inventory: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    hr: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    finance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    maintenance: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    quality: { read: true, create: true, update: false, delete: false, approve: false, export: false },
    workflows: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  RESPONSABLE_QUALITE: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    projects: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    procurement: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    inventory: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    hr: { read: true, create: false, update: false, delete: false, approve: false, export: false },
    finance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    maintenance: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    quality: { read: true, create: true, update: true, delete: false, approve: true, export: true },
    workflows: { read: false, create: false, update: false, delete: false, approve: false, export: false },
    admin: { read: false, create: false, update: false, delete: false, approve: false, export: false },
  },
  ADMINISTRATEUR: {
    dashboard: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    projects: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    procurement: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    inventory: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    hr: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    finance: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    maintenance: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    quality: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    workflows: { read: true, create: true, update: true, delete: true, approve: true, export: true },
    admin: { read: true, create: true, update: true, delete: true, approve: true, export: true },
  },
};

import { SystemRole, DepartmentCode, ProjectStatus } from '@silex/shared';

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  title: string;
  role: SystemRole;
  departmentCode: string;
  avatar?: string;
  active: boolean;
  assignedProjects?: string[];
  permissions?: string[];
}

export interface StoredProject {
  id: string;
  code: string;
  name: string;
  clientName: string;
  sector: string;
  siteLocation: string;
  status: ProjectStatus | string;
  riskLevel: string;
  contractAmount: number;
  budgetAmount: number;
  spentBudget: number;
  committedBudget: number;
  physicalProgress: number;
  financialProgress: number;
  startDate: string;
  contractEndDate: string;
  description: string;
  objectives?: string;
  managerId?: string;
  managerName?: string;
  milestones: any[];
  serviceOrders: any[];
  workSituations: any[];
  members: any[];
  costEntries: any[];
  documents: any[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredWorkflow {
  id: string;
  code: string;
  reference: string;
  title: string;
  type: 'PURCHASE_REQUEST' | 'WORK_SITUATION' | 'EXPENSE_REPORT' | 'CONTRACT_CHANGE';
  status: 'PENDING_DG' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  initiatorName: string;
  initiatorRole: string;
  initiatorDepartment: string;
  targetId: string;
  targetCode: string;
  projectCode?: string;
  projectName?: string;
  clientName?: string;
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
  justification: string;
  items: any[];
  supplierOffers: any[];
  selectedSupplierName?: string;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
  history: Array<{
    action: string;
    actor: string;
    role: string;
    timestamp: string;
    notes?: string;
  }>;
}

class ServerStore {
  private users: ServerUser[] = [];
  private projects: StoredProject[] = [];
  private workflows: StoredWorkflow[] = [];
  private purchaseRequests: any[] = [];
  private purchaseOrders: any[] = [];
  private suppliers: any[] = [];
  private inventoryItems: any[] = [];
  private warehouses: any[] = [];
  private stockMovements: any[] = [];
  private employees: any[] = [];
  private certifications: any[] = [];
  private attendances: any[] = [];
  private fleetAssets: any[] = [];
  private maintenanceOrders: any[] = [];
  private nonConformities: any[] = [];
  private qualityDocuments: any[] = [];
  private financePayments: any[] = [];
  private auditLogs: any[] = [];
  private rolePermissions: Record<string, any> = {};

  constructor() {
    this.initBaseline();
  }

  private initBaseline() {
    // 1. Initialiser le SEUL ET UNIQUE SuperAdmin
    this.users = [
      {
        id: 'usr-superadmin-001',
        name: 'Super Administrateur SILEX',
        email: 'admin@silex-services.dz',
        title: 'Super Administrateur & Directeur des Systèmes ERP',
        role: SystemRole.ADMINISTRATEUR,
        departmentCode: DepartmentCode.DIRECTION_GENERALE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
    ];

    // 2. Magasins physiques démarrent à zéro (100% dynamiques)
    this.warehouses = [];

    // 3. Matrice RBAC initiale
    this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX));
  }

  deleteUser(id: string) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const removed = this.users.splice(idx, 1)[0];
      this.addAuditLog('DELETE_USER', 'USER', id, `Suppression collaborateur ${removed.name} (${removed.email})`);
      return true;
    }
    return false;
  }

  getRolePermissions() {
    if (!this.rolePermissions || Object.keys(this.rolePermissions).length === 0) {
      this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX));
    }
    return this.rolePermissions;
  }

  updateRolePermissions(role: string, permissions: any) {
    if (!this.rolePermissions) {
      this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX));
    }
    this.rolePermissions[role] = permissions;
    this.addAuditLog('UPDATE_RBAC', 'SECURITY', role, `Mise à jour matrice RBAC rôle ${role}`);
    return this.rolePermissions[role];
  }

  // --- AUDIT ---
  addAuditLog(action: string, entityType: string, entityId: string, details: string, user?: any) {
    const log = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entityType,
      entityId,
      details,
      userName: user?.name || 'Direction Générale SILEX',
      userRole: user?.role || 'DIRECTEUR_GENERAL',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    return log;
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  // --- USERS ---
  getUsers() {
    return this.users;
  }

  getUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByRole(role: SystemRole) {
    return this.users.find(u => u.role === role) || this.users[0];
  }

  createUser(data: any) {
    const newUser: ServerUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      title: data.title || 'Collaborateur',
      role: data.role || SystemRole.RESPONSABLE_PROJET,
      departmentCode: data.departmentCode || DepartmentCode.OPERATIONS_PROJETS,
      active: data.active ?? true,
      assignedProjects: [],
      permissions: ['*'],
    };
    this.users.push(newUser);
    this.addAuditLog('CREATE_USER', 'USER', newUser.id, `Création utilisateur ${newUser.name} (${newUser.email})`);
    return newUser;
  }

  updateUser(id: string, data: any) {
    const user = this.getUserById(id);
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.title) user.title = data.title;
    if (data.role) user.role = data.role;
    if (data.departmentCode) user.departmentCode = data.departmentCode;
    if (typeof data.active === 'boolean') user.active = data.active;
    this.addAuditLog('UPDATE_USER', 'USER', user.id, `Mise à jour utilisateur ${user.name}`);
    return user;
  }

  // --- PROJECTS ---
  getProjects() {
    return this.projects;
  }

  getProject(codeOrId: string) {
    return this.projects.find(p => p.code === codeOrId || p.id === codeOrId);
  }

  createProject(data: any) {
    const code = data.code || `PRJ-2026-${String(this.projects.length + 1).padStart(3, '0')}`;
    const newProject: StoredProject = {
      id: `prj-${Date.now()}`,
      code,
      name: data.name || 'Projet Industriel Sans Titre',
      clientName: data.clientName || 'Client Industriel',
      sector: data.sector || 'OIL_AND_GAS',
      siteLocation: data.siteLocation || 'Site Industriel Algérie',
      status: data.status || ProjectStatus.IN_PROGRESS,
      riskLevel: data.riskLevel || 'LOW',
      contractAmount: Number(data.contractAmount) || 0,
      budgetAmount: Number(data.budgetAmount) || 0,
      spentBudget: 0,
      committedBudget: 0,
      physicalProgress: 0,
      financialProgress: 0,
      startDate: data.startDate || new Date().toISOString(),
      contractEndDate: data.contractEndDate || new Date(Date.now() + 90 * 86400000).toISOString(),
      description: data.description || '',
      objectives: data.objectives || '',
      managerId: data.managerId || this.users[1]?.id,
      managerName: this.users.find(u => u.id === data.managerId)?.name || 'Karim Mansouri',
      milestones: [],
      serviceOrders: [],
      workSituations: [],
      members: [],
      costEntries: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);
    this.addAuditLog('CREATE_PROJECT', 'PROJECT', newProject.code, `Création projet ${newProject.code} - ${newProject.name}`);
    return newProject;
  }

  updateProject(codeOrId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    if (data.name) project.name = data.name;
    if (data.clientName) project.clientName = data.clientName;
    if (data.sector) project.sector = data.sector;
    if (data.siteLocation) project.siteLocation = data.siteLocation;
    if (data.status) project.status = data.status;
    if (data.riskLevel) project.riskLevel = data.riskLevel;
    if (data.contractAmount !== undefined) project.contractAmount = Number(data.contractAmount);
    if (data.budgetAmount !== undefined) project.budgetAmount = Number(data.budgetAmount);
    if (data.description !== undefined) project.description = data.description;
    if (data.objectives !== undefined) project.objectives = data.objectives;
    if (data.startDate) project.startDate = data.startDate;
    if (data.contractEndDate) project.contractEndDate = data.contractEndDate;
    if (data.managerId) {
      project.managerId = data.managerId;
      project.managerName = this.users.find(u => u.id === data.managerId)?.name || project.managerName;
    }
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_PROJECT', 'PROJECT', project.code, `Mise à jour projet ${project.code}`);
    return project;
  }

  updateProgress(codeOrId: string, physical: number, financial: number) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    project.physicalProgress = Math.min(100, Math.max(0, physical));
    project.financialProgress = Math.min(100, Math.max(0, financial));
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_PROGRESS', 'PROJECT', project.code, `Avancement mis à jour : Physique ${physical}%, Financier ${financial}%`);
    return project;
  }

    assignMemberToProject(codeOrId: string, userId: string) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    if (!project.assignedUsers) project.assignedUsers = [];
    const u = this.users.find(usr => usr.id === userId);
    const existing = project.assignedUsers.find((a: any) => a.userId === userId);
    if (existing) return existing;
    const assignment = {
      id: `asgn-${Date.now()}`,
      userId,
      projectId: project.id,
      user: u || { id: userId, name: 'Collaborateur', role: 'OPERATIONS' },
      assignedAt: new Date().toISOString(),
    };
    project.assignedUsers.push(assignment);
    if (Array.isArray(project.members)) project.members.push(assignment);
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('ASSIGN_PROJECT_MEMBER', 'PROJECT', project.code, `Affectation de ${assignment.user?.name || userId} au projet ${project.code}`);
    return assignment;
  }

  removeMemberFromProject(codeOrId: string, userId: string) {
    const project = this.getProject(codeOrId);
    if (!project) return { success: false };
    if (project.assignedUsers) {
      project.assignedUsers = project.assignedUsers.filter((a: any) => a.userId !== userId && a.user?.id !== userId);
    }
    if (project.members) {
      project.members = project.members.filter((a: any) => a.userId !== userId && a.id !== userId);
    }
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('REMOVE_PROJECT_MEMBER', 'PROJECT', project.code, `Retrait du collaborateur ${userId} du projet ${project.code}`);
    return { success: true };
  }

  addMilestone(codeOrId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    const milestone = {
      id: `mls-${Date.now()}`,
      title: data.title || 'Jalon Chantier',
      description: data.description || '',
      weight: Number(data.weight) || 10,
      targetDate: data.targetDate || new Date().toISOString(),
      completed: false,
      deliverable: data.deliverable || data.livrable || '',
      controlOrg: data.controlOrg || '',
      supervisor: data.supervisor || '',
      budgetCost: Number(data.budgetCost) || 0,
      createdAt: new Date().toISOString(),
    };
    project.milestones.push(milestone);
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('ADD_MILESTONE', 'PROJECT', project.code, `Jalon ajouté : ${milestone.title}`);
    return milestone;
  }

  addServiceOrder(codeOrId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    const ods = {
      id: `ods-${Date.now()}`,
      orderNumber: data.orderNumber || `ODS-${project.code}-${String(project.serviceOrders.length + 1).padStart(2, '0')}`,
      type: data.type || 'DEMARRAGE',
      description: data.description || '',
      delayDays: Number(data.delayDays || data.delayImpact || 0),
      costImpact: Number(data.costImpact || 0),
      clientRef: data.clientRef || '',
      signatory: data.signatory || '',
      status: 'SIGNE',
      effectiveDate: data.effectiveDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    project.serviceOrders.push(ods);
    if (ods.costImpact > 0) {
      project.contractAmount += ods.costImpact;
    }
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('ADD_SERVICE_ORDER', 'PROJECT', project.code, `ODS émis : ${ods.orderNumber} (${ods.type})`);
    return ods;
  }

  addWorkSituation(codeOrId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    const sitNumber = `SIT-${project.code}-${String(project.workSituations.length + 1).padStart(2, '0')}`;
    const totalHT = Number(data.totalHT || data.amountHT || 0);
    const retenueGarantie = totalHT * 0.05;
    const tva = totalHT * 0.19;
    const totalTTC = totalHT - retenueGarantie + tva;

    const situation = {
      id: `sit-${Date.now()}`,
      situationNumber: sitNumber,
      periodStart: data.periodStart || new Date().toISOString(),
      periodEnd: data.periodEnd || new Date().toISOString(),
      status: 'SOUMIS',
      amountHT: totalHT,
      retenueGarantie,
      amountTVA: tva,
      amountTTC: totalTTC,
      cumulatedAmountHT: (project.workSituations.reduce((sum, s) => sum + s.amountHT, 0) + totalHT),
      pvRef: data.pvRef || '',
      inspector: data.inspector || '',
      notes: data.notes || '',
      lines: data.lines || [],
      createdAt: new Date().toISOString(),
    };
    project.workSituations.push(situation);

    // INTERCONNEXION DIRECTE : Crée automatiquement le workflow d'approbation QCD dans /workflows
    const wf = this.createWorkflow({
      title: `Situation de Travaux ${sitNumber} — ${project.name}`,
      reference: sitNumber,
      type: 'WORK_SITUATION',
      priority: 'NORMAL',
      targetId: situation.id,
      targetCode: sitNumber,
      projectCode: project.code,
      projectName: project.name,
      clientName: project.clientName,
      amountHT: totalHT,
      amountTVA: tva,
      amountTTC: totalTTC,
      justification: `Attachement contradictoire et PV de constat des travaux réalisés sur le chantier ${project.code}.`,
      items: (situation.lines || []).map((l: any) => ({
        designation: l.designation || 'Prestation de travaux',
        quantity: l.periodQty || l.quantity || 1,
        unit: l.unit || 'U',
        unitPrice: l.unitPrice || 0,
        totalHT: (Number(l.periodQty || 1) * Number(l.unitPrice || 0)),
      })),
      initiatorName: 'Karim Mansouri',
      initiatorRole: 'RESPONSABLE_PROJET',
      initiatorDepartment: 'OPERATIONS_PROJETS',
    });

    this.addAuditLog('ADD_WORK_SITUATION', 'PROJECT', project.code, `Situation ${sitNumber} soumise (Workflow ${wf.code} initié)`);
    return situation;
  }

  addMember(codeOrId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    const member = {
      id: `mbr-${Date.now()}`,
      userId: data.userId,
      name: data.name || this.users.find(u => u.id === data.userId)?.name || 'Collaborateur',
      role: data.role || 'COLLABORATEUR',
      title: data.title || '',
      joinedAt: new Date().toISOString(),
    };
    project.members.push(member);
    return member;
  }

  getProjectKpis() {
    const totalProjects = this.projects.length;
    const activeProjects = this.projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const totalContractValue = this.projects.reduce((acc, p) => acc + (p.contractAmount || 0), 0);
    const totalBudgetAllocated = this.projects.reduce((acc, p) => acc + (p.budgetAmount || 0), 0);
    const totalSpent = this.projects.reduce((acc, p) => acc + (p.spentBudget || 0), 0);
    const avgPhysicalProgress = totalProjects > 0
      ? Math.round(this.projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects)
      : 0;

    return {
      totalProjects,
      activeProjects,
      totalContractValue,
      totalBudgetAllocated,
      totalSpent,
      avgPhysicalProgress,
      activeProjectsCount: activeProjects,
      totalBudget: totalBudgetAllocated,
      totalContracted: totalContractValue,
      clientReceivables: this.calculateClientReceivables(),
      supplierPayables: this.calculateSupplierPayables(),
      monthlyExpenditure: totalSpent,
    };
  }

  // --- WORKFLOWS (Circuit QCD) ---
  getWorkflows() {
    return this.workflows;
  }

  getWorkflow(id: string) {
    return this.workflows.find(w => w.id === id || w.code === id || w.reference === id);
  }

  createWorkflow(data: Partial<StoredWorkflow>) {
    const code = `WF-${String(this.workflows.length + 1).padStart(4, '0')}`;
    const wf: StoredWorkflow = {
      id: `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code,
      reference: data.reference || code,
      title: data.title || 'Dossier d’approbation',
      type: data.type || 'PURCHASE_REQUEST',
      status: 'PENDING_DG',
      priority: data.priority || 'NORMAL',
      initiatorName: data.initiatorName || 'Karim Mansouri',
      initiatorRole: data.initiatorRole || 'RESPONSABLE_PROJET',
      initiatorDepartment: data.initiatorDepartment || 'OPERATIONS_PROJETS',
      targetId: data.targetId || '',
      targetCode: data.targetCode || '',
      projectCode: data.projectCode || '',
      projectName: data.projectName || '',
      clientName: data.clientName || '',
      amountHT: Number(data.amountHT) || 0,
      amountTVA: Number(data.amountTVA) || 0,
      amountTTC: Number(data.amountTTC) || 0,
      justification: data.justification || '',
      items: data.items || [],
      supplierOffers: data.supplierOffers || [],
      selectedSupplierName: data.selectedSupplierName || '',
      submittedAt: new Date().toISOString(),
      history: [
        {
          action: 'SOUMISSION',
          actor: data.initiatorName || 'Responsable Projet',
          role: data.initiatorRole || 'RESPONSABLE_PROJET',
          timestamp: new Date().toISOString(),
          notes: 'Dossier soumis pour arbitrage circuit QCD',
        },
      ],
    };
    this.workflows.unshift(wf);
    return wf;
  }

  approveWorkflow(id: string, notes: string = '', user?: any) {
    const wf = this.getWorkflow(id);
    if (!wf) return null;
    wf.status = 'APPROVED';
    wf.decidedAt = new Date().toISOString();
    wf.decidedBy = user?.name || 'Amine Benali (DG)';
    wf.decisionNotes = notes || 'Approbation Direction Générale accordée.';
    wf.history.push({
      action: 'APPROBATION',
      actor: wf.decidedBy,
      role: user?.role || 'DIRECTEUR_GENERAL',
      timestamp: new Date().toISOString(),
      notes: wf.decisionNotes,
    });

    // INTERCONNEXION : Si le workflow est lié à une DA, on valide la DA et on génère le Bon de Commande (BC) !
    if (wf.type === 'PURCHASE_REQUEST' && wf.targetId) {
      const pr = this.purchaseRequests.find(p => p.id === wf.targetId || p.code === wf.targetCode);
      if (pr) {
        pr.status = 'APPROVED';
        // Émission automatique du Bon de Commande (BC)
        this.createPurchaseOrder({
          projectId: pr.projectId,
          projectCode: pr.projectCode,
          purchaseRequestId: pr.id,
          purchaseRequestCode: pr.code,
          supplierId: pr.selectedSupplierId || (this.suppliers[0]?.id || 'supp-default'),
          supplierName: pr.selectedSupplierName || (this.suppliers[0]?.name || 'Fournisseur Qualifié SILEX'),
          totalHT: pr.amountHT,
          vatAmount: pr.amountTVA,
          totalTTC: pr.amountTTC,
          items: pr.items,
        });
      }
    }

    // INTERCONNEXION : Si le workflow est lié à une Situation de Travaux
    if (wf.type === 'WORK_SITUATION' && wf.projectCode) {
      const proj = this.getProject(wf.projectCode);
      if (proj) {
        const sit = proj.workSituations.find(s => s.id === wf.targetId || s.situationNumber === wf.targetCode);
        if (sit) {
          sit.status = 'VALIDE';
          proj.spentBudget += sit.amountHT;
        }
      }
    }

    this.addAuditLog('APPROVE_WORKFLOW', 'WORKFLOW', wf.code, `Dossier ${wf.reference} approuvé. ${notes}`, user);
    return wf;
  }

  rejectWorkflow(id: string, reason: string = '', user?: any) {
    const wf = this.getWorkflow(id);
    if (!wf) return null;
    wf.status = 'REJECTED';
    wf.decidedAt = new Date().toISOString();
    wf.decidedBy = user?.name || 'Amine Benali (DG)';
    wf.decisionNotes = reason;
    wf.history.push({
      action: 'REJET',
      actor: wf.decidedBy,
      role: user?.role || 'DIRECTEUR_GENERAL',
      timestamp: new Date().toISOString(),
      notes: reason,
    });

    if (wf.type === 'PURCHASE_REQUEST' && wf.targetId) {
      const pr = this.purchaseRequests.find(p => p.id === wf.targetId || p.code === wf.targetCode);
      if (pr) pr.status = 'REJECTED';
    }
    this.addAuditLog('REJECT_WORKFLOW', 'WORKFLOW', wf.code, `Dossier ${wf.reference} rejeté. Motif: ${reason}`, user);
    return wf;
  }

  requestRevisionWorkflow(id: string, instructions: string = '', user?: any) {
    const wf = this.getWorkflow(id);
    if (!wf) return null;
    wf.status = 'REVISION_REQUESTED';
    wf.decisionNotes = instructions;
    wf.history.push({
      action: 'DEMANDE_REVISION',
      actor: user?.name || 'Amine Benali (DG)',
      role: user?.role || 'DIRECTEUR_GENERAL',
      timestamp: new Date().toISOString(),
      notes: instructions,
    });
    this.addAuditLog('REVISE_WORKFLOW', 'WORKFLOW', wf.code, `Dossier ${wf.reference} renvoyé pour réexamen. Notes: ${instructions}`, user);
    return wf;
  }

  // --- PROCUREMENT (Demandes d'Achat, Fournisseurs & Bons de Commande) ---
  getPurchaseRequests() {
    return this.purchaseRequests;
  }

  createPurchaseRequest(data: any) {
    const code = `DA-2026-${String(this.purchaseRequests.length + 1).padStart(4, '0')}`;
    const project = this.getProject(data.projectId);
    const amountHT = Number(data.totalHT || data.amountHT || data.estimatedAmount || 0);
    const vatRate = Number(data.vatRate || 19);
    const vatAmount = amountHT * (vatRate / 100);
    const totalTTC = amountHT + vatAmount;

    const pr = {
      id: `pr-${Date.now()}`,
      code,
      projectId: data.projectId,
      projectCode: project?.code || data.projectCode || 'CH-GEN-01',
      projectName: project?.name || 'Chantier Industriel',
      requestedById: data.requestedById || this.users[1]?.id,
      requestedByName: this.users.find(u => u.id === data.requestedById)?.name || 'Karim Mansouri',
      category: data.category || 'TUYAUTERIE',
      urgency: data.urgency || 'NORMAL',
      status: 'PENDING',
      desiredDeliveryDate: data.desiredDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      deliveryLocation: data.deliveryLocation || 'Magasin Central Arzew',
      amountHT,
      vatRate,
      amountTVA: vatAmount,
      amountTTC: totalTTC,
      justification: data.justification || '',
      certificationsRequired: {
        ccpu31: !!data.reqCertCcpu31,
        cndReport: !!data.reqCndReport,
        coc: !!data.reqCoc,
        atexFds: !!data.reqAtexFds,
      },
      items: data.items || [],
      selectedSupplierId: data.selectedSupplierId || '',
      selectedSupplierName: data.selectedSupplierName || '',
      createdAt: new Date().toISOString(),
    };
    this.purchaseRequests.unshift(pr);

    // INTERCONNEXION DIRECTE : Génère automatiquement le workflow dans /workflows (Inbox DG)
    this.createWorkflow({
      title: `Demande d’Achat ${code} — ${pr.projectName}`,
      reference: code,
      type: 'PURCHASE_REQUEST',
      priority: pr.urgency as any,
      targetId: pr.id,
      targetCode: pr.code,
      projectCode: pr.projectCode,
      projectName: pr.projectName,
      clientName: project?.clientName || 'Sonatrach / Client',
      amountHT,
      amountTVA: vatAmount,
      amountTTC: totalTTC,
      justification: pr.justification || `Approvisionnement matériel pour ${pr.projectName}`,
      items: pr.items,
      initiatorName: pr.requestedByName,
      initiatorRole: 'RESPONSABLE_PROJET',
      initiatorDepartment: 'OPERATIONS_PROJETS',
    });

    this.addAuditLog('CREATE_PURCHASE_REQUEST', 'PROCUREMENT', pr.code, `DA ${pr.code} créée (${amountHT.toLocaleString()} DA HT)`);
    return pr;
  }

  getSuppliers() {
    return this.suppliers;
  }

  createSupplier(data: any) {
    const code = `FOURN-${String(this.suppliers.length + 1).padStart(3, '0')}`;
    const supplier = {
      id: `supp-${Date.now()}`,
      code,
      name: data.name,
      contactName: data.contactName || '',
      phone: data.phone || '',
      email: data.email || '',
      taxId: data.taxId || data.nif || '',
      tradeRegistryNumber: data.tradeRegistryNumber || data.rc || '',
      bankRIB: data.bankRIB || '',
      address: data.address || '',
      rating: data.rating || 4,
      specialties: data.specialties || [],
      createdAt: new Date().toISOString(),
    };
    this.suppliers.push(supplier);
    this.addAuditLog('CREATE_SUPPLIER', 'PROCUREMENT', supplier.code, `Fournisseur créé : ${supplier.name}`);
    return supplier;
  }

  getPurchaseOrders() {
    return this.purchaseOrders;
  }

  createPurchaseOrder(data: any) {
    const code = `BC-2026-${String(this.purchaseOrders.length + 1).padStart(4, '0')}`;
    const po = {
      id: `po-${Date.now()}`,
      code,
      projectId: data.projectId,
      projectCode: data.projectCode,
      purchaseRequestId: data.purchaseRequestId,
      purchaseRequestCode: data.purchaseRequestCode,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      status: 'ISSUED',
      totalHT: Number(data.totalHT || 0),
      vatAmount: Number(data.vatAmount || 0),
      totalTTC: Number(data.totalTTC || 0),
      items: data.items || [],
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.purchaseOrders.unshift(po);
    this.addAuditLog('CREATE_PURCHASE_ORDER', 'PROCUREMENT', po.code, `Bon de Commande ${po.code} émis (${po.totalTTC.toLocaleString()} DA TTC)`);
    return po;
  }

  // --- INVENTORY (Articles, Magasins & Mouvements) ---
  getWarehouses() {
    return this.warehouses;
  }

  createWarehouse(data: any) {
    const code = data.code || `MAG-${String(this.warehouses.length + 1).padStart(2, '0')}`;
    const wh = {
      id: `wh-${Date.now()}`,
      code,
      name: data.name,
      location: data.location || '',
      type: data.type || 'CHANTIER',
      capacityM2: Number(data.capacityM2 || 500),
      responsibleName: data.responsibleName || 'Tarek Meziani',
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.warehouses.push(wh);
    this.addAuditLog('CREATE_WAREHOUSE', 'INVENTORY', wh.code, `Magasin créé : ${wh.name}`);
    return wh;
  }

  getInventoryItems() {
    return this.inventoryItems;
  }

  createInventoryItem(data: any) {
    const code = data.code || `ART-2026-${String(this.inventoryItems.length + 1).padStart(3, '0')}`;
    const item = {
      id: `itm-${Date.now()}`,
      code,
      name: data.name,
      description: data.description || '',
      category: data.category || 'TUYAUTERIE',
      unit: data.unit || 'UNITE',
      unitCost: Number(data.unitCost || 0),
      minStock: Number(data.minStock || 0),
      currentStock: Number(data.currentStock || 0),
      warehouseId: data.warehouseId || this.warehouses[0]?.id,
      warehouseName: this.warehouses.find(w => w.id === data.warehouseId)?.name || 'Magasin Central Arzew',
      location: data.location || 'Rayon A',
      createdAt: new Date().toISOString(),
    };
    this.inventoryItems.push(item);
    this.addAuditLog('CREATE_ITEM', 'INVENTORY', item.code, `Article référencé : ${item.name} (${item.code})`);
    return item;
  }

  getStockMovements() {
    return this.stockMovements;
  }

  recordStockMovement(data: any) {
    const mvtNumber = `MVT-${Date.now()}`;
    const item = this.inventoryItems.find(i => i.id === data.itemId);
    const qty = Number(data.quantity || 0);
    const isEntry = data.type === 'ENTRY' || data.type === 'RECEPTION';

    if (item) {
      if (isEntry) {
        item.currentStock += qty;
      } else {
        item.currentStock = Math.max(0, item.currentStock - qty);
      }
    }

    const movement = {
      id: `mvt-${Date.now()}`,
      movementNumber: mvtNumber,
      itemId: data.itemId,
      itemCode: item?.code || data.itemCode || '',
      itemName: item?.name || data.itemName || '',
      type: data.type || 'ENTRY',
      quantity: qty,
      warehouseId: data.warehouseId || this.warehouses[0]?.id,
      warehouseName: this.warehouses.find(w => w.id === data.warehouseId)?.name || 'Magasin Central Arzew',
      projectId: data.projectId || '',
      projectCode: this.getProject(data.projectId)?.code || '',
      documentRef: data.documentRef || data.deliveryNoteNumber || '',
      batchNumber: data.batchNumber || '',
      performedByName: data.performedByName || 'Tarek Meziani (Magasinier)',
      timestamp: new Date().toISOString(),
    };
    this.stockMovements.unshift(movement);
    this.addAuditLog('STOCK_MOVEMENT', 'INVENTORY', movement.movementNumber, `${isEntry ? 'Entrée' : 'Sortie'} de ${qty} ${item?.unit || 'U'} pour ${item?.name || 'article'}`);
    return movement;
  }

  // --- HR (Collaborateurs, Certifications & Pointages) ---
  getEmployees() {
    return this.employees;
  }

  createEmployee(data: any) {
    const matricule = `MAT-${String(this.employees.length + 1).padStart(4, '0')}`;
    const emp = {
      id: `emp-${Date.now()}`,
      matricule,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Collaborateur SILEX',
      title: data.title || 'Technicien Chantier',
      email: data.email || '',
      phone: data.phone || '',
      contractType: data.contractType || 'CHANTIER',
      dailyRate: Number(data.baseRate || data.dailyRate || 5500),
      active: true,
      certifications: [],
      createdAt: new Date().toISOString(),
    };
    this.employees.push(emp);
    this.addAuditLog('CREATE_EMPLOYEE', 'HR', emp.matricule, `Collaborateur embauché : ${emp.name} (${emp.title})`);
    return emp;
  }

  getCertifications() {
    return this.certifications;
  }

  createCertification(data: any) {
    const cert = {
      id: `cert-${Date.now()}`,
      employeeId: data.employeeId,
      name: data.name,
      certificateNumber: data.certificateNumber || data.certNumber || '',
      standard: data.standard || 'ASME IX',
      issuingBody: data.issuingBody || 'Bureau Veritas',
      issuedDate: data.issuedDate || new Date().toISOString(),
      expiryDate: data.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString(),
      status: 'VALIDE',
      createdAt: new Date().toISOString(),
    };
    this.certifications.push(cert);
    this.addAuditLog('CREATE_CERTIFICATION', 'HR', cert.certificateNumber, `Certification enregistrée : ${cert.name}`);
    return cert;
  }

  getAttendances() {
    return this.attendances;
  }

  recordAttendance(data: any) {
    const att = {
      id: `att-${Date.now()}`,
      employeeId: data.employeeId,
      projectId: data.projectId,
      date: data.date || new Date().toISOString(),
      hoursWorked: Number(data.hoursWorked || 8),
      overtimeHours: Number(data.overtimeHours || 0),
      type: data.type || 'PRESENT',
      allowanceAmount: Number(data.allowance || 0),
      createdAt: new Date().toISOString(),
    };
    this.attendances.push(att);
    return att;
  }

  // --- FLEET & MAINTENANCE ---
  getFleetAssets() {
    return this.fleetAssets;
  }

  createFleetAsset(data: any) {
    const code = data.code || `EQP-${String(this.fleetAssets.length + 1).padStart(3, '0')}`;
    const asset = {
      id: `ast-${Date.now()}`,
      code,
      name: data.name,
      type: data.type || 'ENGIN',
      brand: data.brand || '',
      model: data.model || '',
      serialNumber: data.serialNumber || '',
      matricule: data.matricule || '',
      status: 'DISPONIBLE',
      operatingHours: Number(data.operatingHours || 0),
      currentLocation: data.currentLocation || 'Base Centrale Arzew',
      assignedProjectId: data.assignedProjectId || '',
      createdAt: new Date().toISOString(),
    };
    this.fleetAssets.push(asset);
    this.addAuditLog('CREATE_ASSET', 'MAINTENANCE', asset.code, `Équipement enregistré : ${asset.name} (${asset.code})`);
    return asset;
  }

  getMaintenanceOrders() {
    return this.maintenanceOrders;
  }

  createMaintenanceOrder(data: any) {
    const code = `OT-2026-${String(this.maintenanceOrders.length + 1).padStart(4, '0')}`;
    const order = {
      id: `ot-${Date.now()}`,
      code,
      assetId: data.assetId,
      assetName: this.fleetAssets.find(a => a.id === data.assetId)?.name || 'Équipement',
      type: data.type || 'PREVENTIVE',
      priority: data.priority || 'MEDIUM',
      status: 'PLANIFIE',
      description: data.description || '',
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      estimatedCost: Number(data.orderCost || data.estimatedCost || 0),
      technician: data.technician || 'Technicien SILEX',
      createdAt: new Date().toISOString(),
    };
    this.maintenanceOrders.unshift(order);
    this.addAuditLog('CREATE_MAINTENANCE_ORDER', 'MAINTENANCE', order.code, `Ordre de travail ${order.code} créé pour ${order.assetName}`);
    return order;
  }

  // --- QUALITY & QHSE ---
  getNonConformities() {
    return this.nonConformities;
  }

  createNonConformity(data: any) {
    const code = `FNC-2026-${String(this.nonConformities.length + 1).padStart(3, '0')}`;
    const nc = {
      id: `nc-${Date.now()}`,
      code,
      title: data.title || 'Fiche de Non-Conformité',
      description: data.description || '',
      severity: data.severity || 'MAJEURE',
      status: 'OUVERTE',
      detectedBy: data.detectedBy || 'Inspecteur CND SILEX',
      projectId: data.projectId,
      projectCode: this.getProject(data.projectId)?.code || '',
      correctiveAction: data.correctiveAction || '',
      correctiveActionResp: data.correctiveActionResp || '',
      createdAt: new Date().toISOString(),
    };
    this.nonConformities.unshift(nc);
    this.addAuditLog('CREATE_NON_CONFORMITY', 'QUALITY', nc.code, `FNC ouverte : ${nc.code} - ${nc.title}`);
    return nc;
  }

  getQualityDocuments() {
    return this.qualityDocuments;
  }

  createQualityDocument(data: any) {
    const doc = {
      id: `doc-${Date.now()}`,
      docNumber: data.docNumber || `DOC-2026-${String(this.qualityDocuments.length + 1).padStart(3, '0')}`,
      title: data.title,
      category: data.category || 'PROCEDURE',
      author: data.author || 'Direction Technique SILEX',
      version: data.version || '1.0',
      status: 'VALIDE',
      createdAt: new Date().toISOString(),
    };
    this.qualityDocuments.push(doc);
    return doc;
  }

  // --- FINANCE (Synthèse, Encaissements & Retenues) ---
  recordPayment(data: any) {
    const payment = {
      id: `pay-${Date.now()}`,
      projectId: data.projectId,
      amount: Number(data.amount || 0),
      paymentReference: data.paymentReference || `VIR-${Date.now()}`,
      bankName: data.bankName || 'BEA Agence Entreprises',
      paymentDate: data.paymentDate || new Date().toISOString(),
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    this.financePayments.push(payment);
    const proj = this.getProject(data.projectId);
    this.addAuditLog('RECORD_PAYMENT', 'FINANCE', payment.paymentReference, `Encaissement de ${payment.amount.toLocaleString()} DA enregistré pour ${proj?.code || 'Projet'}`);
    return payment;
  }

  getFinanceOverview() {
    let totalContracted = 0;
    let totalBilled = 0;
    let totalWarrantyHeld = 0;

    const projectOverviews = this.projects.map(p => {
      totalContracted += (p.contractAmount || 0);
      const projectBilled = p.workSituations.reduce((sum, s) => sum + (s.amountHT || 0), 0);
      const projectWarranty = p.workSituations.reduce((sum, s) => sum + (s.retenueGarantie || 0), 0);
      totalBilled += projectBilled;
      totalWarrantyHeld += projectWarranty;

      const projectPaid = this.financePayments
        .filter(pay => pay.projectId === p.id)
        .reduce((sum, pay) => sum + (pay.amount || 0), 0);

      const marginDA = Math.max(0, (p.contractAmount || 0) - (p.budgetAmount || 0));
      const marginRate = p.contractAmount > 0 ? ((marginDA / p.contractAmount) * 100).toFixed(1) : '0';

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        clientName: p.clientName,
        contractAmount: p.contractAmount,
        budgetAmount: p.budgetAmount,
        billedAmount: projectBilled,
        paidAmount: projectPaid,
        pendingAmount: Math.max(0, projectBilled - projectPaid),
        warrantyHeld: projectWarranty,
        marginDA,
        marginRate,
        status: p.status,
      };
    });

    const totalCollected = this.financePayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const pendingCollection = Math.max(0, totalBilled - totalCollected);
    const totalPOExpenditure = this.purchaseOrders.reduce((sum, po) => sum + (po.totalHT || 0), 0);
    const treasuryBalance = totalCollected - totalPOExpenditure;

    return {
      kpis: {
        totalContracted,
        totalBilled,
        totalCollected,
        pendingCollection,
        warrantyHeld: totalWarrantyHeld,
        treasuryBalance,
      },
      summary: {
        totalBilled,
        totalCollected,
        pendingCollection,
        warrantyHeld: totalWarrantyHeld,
        treasuryBalance,
      },
      projects: projectOverviews,
      distribution: this.getCostDistribution(),
    };
  }

  getCostDistribution() {
    let tuyauterie = 0;
    let sousTraitance = 0;
    let consommables = 0;
    let mainDoeuvre = 0;

    for (const po of this.purchaseOrders) {
      tuyauterie += po.totalHT || 0;
    }
    for (const p of this.projects) {
      sousTraitance += p.spentBudget || 0;
    }
    for (const att of this.attendances) {
      mainDoeuvre += (att.hoursWorked * 800) + (att.allowanceAmount || 0);
    }

    const total = tuyauterie + sousTraitance + consommables + mainDoeuvre;
    if (total === 0) return [];

    return [
      { name: 'Fournitures & Tuyauterie', value: tuyauterie, fill: '#0B207D' },
      { name: 'Sous-traitance & CND', value: sousTraitance, fill: '#E51A1A' },
      { name: 'Main d’œuvre Chantier', value: mainDoeuvre, fill: '#16A34A' },
    ].filter(d => d.value > 0);
  }

  private calculateClientReceivables(): number {
    let billed = 0;
    for (const p of this.projects) {
      billed += p.workSituations.reduce((sum, s) => sum + (s.amountHT || 0), 0);
    }
    const collected = this.financePayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    return Math.max(0, billed - collected);
  }

  private calculateSupplierPayables(): number {
    return this.purchaseOrders.reduce((sum, po) => sum + (po.totalHT || 0), 0);
  }
}

// Singleton global pour le runtime Next.js (persiste pendant le cycle de vie du conteneur serverless)
const globalForStore = globalThis as unknown as { serverStoreInstance?: ServerStore };
export const serverStore = globalForStore.serverStoreInstance ?? new ServerStore();
if (process.env.NODE_ENV !== 'production') globalForStore.serverStoreInstance = serverStore;
