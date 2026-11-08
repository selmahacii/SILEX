import { SystemRole, DepartmentCode } from '@silex/shared';

export interface MilestoneItem {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  progressWeight: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'VALIDATED' | 'BLOCKED';
}

export interface ServiceOrderItem {
  id: string;
  number: string;
  type: string;
  title: string;
  issuedDate: string;
  status: 'ISSUED' | 'IN_PROGRESS' | 'EXECUTED' | 'CANCELLED';
  description?: string;
  delayImpactDays?: number;
  costImpact?: number;
}

export interface WorkSituationItem {
  id: string;
  number: string;
  periodStart: string;
  periodEnd: string;
  amountHT: number;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  inspector?: string;
}

// ========================================================
// BASE DE DONNÉES VIERGE (0 DATA FACTICE / 0 MOCK DATA)
// Prête pour les saisies réelles de production en micro-détails
// ========================================================

export const DEFAULT_KPIS = {
  activeProjectsCount: 0,
  totalContractValue: 0,
  committedCost: 0,
  actualCost: 0,
  grossMargin: 0,
  pendingApprovalsCount: 0,
  averageProgress: 0,
};

export const DEFAULT_PROJECTS: any[] = [];
export const DEFAULT_WORKFLOWS_INBOX: any[] = [];
export const MOCK_PROCUREMENT_REQUESTS: any[] = [];
export const MOCK_INVENTORY_ITEMS: any[] = [];
export const MOCK_SUPPLIERS: any[] = [];
export const MOCK_PURCHASE_ORDERS: any[] = [];
export const MOCK_WAREHOUSES: any[] = [];
export const MOCK_EMPLOYEES: any[] = [];
export const MOCK_STOCK_MOVEMENTS: any[] = [];
export const MOCK_ASSETS: any[] = [];
export const MOCK_NON_CONFORMITIES: any[] = [];
export const MOCK_COST_DISTRIBUTION: any[] = [];

// 9 Utilisateurs fondamentaux du système (socle d'habilitation RBAC)
export const SYSTEM_USERS = [
  { id: 'usr-dg-001', name: 'Karim Mansouri', email: 'k.mansouri@silex-services.dz', role: 'DIRECTEUR_GENERAL', title: 'Directeur Général', departmentCode: 'DIRECTION_GENERALE' },
  { id: 'usr-rp-002', name: 'Sofiane Belkacem', email: 's.belkacem@silex-services.dz', role: 'RESPONSABLE_PROJET', title: 'Chef de Projets Industriels', departmentCode: 'OPERATIONS_PROJETS' },
  { id: 'usr-ach-003', name: 'Amina Benali', email: 'a.benali@silex-services.dz', role: 'RESPONSABLE_ACHATS', title: 'Responsable Achats & Approvisionnements', departmentCode: 'ACHATS_LOGISTIQUE' },
  { id: 'usr-mag-004', name: 'Tarek Meziani', email: 't.meziani@silex-services.dz', role: 'RESPONSABLE_MAGASIN', title: 'Responsable Magasins & Stocks', departmentCode: 'MAGASIN_STOCKS' },
  { id: 'usr-rh-005', name: 'Samira Haddad', email: 's.haddad@silex-services.dz', role: 'RESPONSABLE_RH', title: 'Responsable Ressources Humaines', departmentCode: 'RESSOURCES_HUMAINES' },
  { id: 'usr-fin-006', name: 'Rachid Bouzid', email: 'r.bouzid@silex-services.dz', role: 'RESPONSABLE_FINANCIER', title: 'Directeur Financier & Contrôle de Gestion', departmentCode: 'FINANCE_COMPTABILITE' },
  { id: 'usr-maint-007', name: 'Yacine Khelifi', email: 'y.khelifi@silex-services.dz', role: 'RESPONSABLE_MAINTENANCE', title: 'Responsable Maintenance & Parc Matériel', departmentCode: 'PARC_MAINTENANCE' },
  { id: 'usr-qhse-008', name: 'Nadia Chaib', email: 'n.chaib@silex-services.dz', role: 'RESPONSABLE_QUALITE', title: 'Responsable QHSE & Conformité', departmentCode: 'QHSE' },
  { id: 'usr-adm-009', name: 'Lyes Hamidi', email: 'admin@silex-services.dz', role: 'ADMINISTRATEUR', title: 'Administrateur Plateforme SILEX', departmentCode: 'INFORMATIQUE_ADMIN' },
];

/**
 * STATEFUL PRODUCTION STORE (Opérationnel, réactif et persistant)
 * Permet l'exécution immédiate de tous les formulaires, boutons,
 * statuts et validations sans aucune donnée factice par défaut.
 */
class StatefulProductionStore {
  private projects: any[] = [];
  private workflows: any[] = [];
  private kpis: any = { ...DEFAULT_KPIS };
  private procurement: any[] = [];
  private inventory: any[] = [];
  private suppliers: any[] = [];
  private purchaseOrders: any[] = [];
  private warehouses: any[] = [];
  private employees: any[] = [];
  private stockMovements: any[] = [];
  private assets: any[] = [];
  private nonConformities: any[] = [];

  constructor() {
    this.initVirginStorage();
  }

  private initVirginStorage() {
    if (typeof window === 'undefined') return;
    try {
      // Si la version vierge n'est pas encore enregistrée, on purge tout résidu factice
      const slateVersion = localStorage.getItem('silex_slate_version');
      if (slateVersion !== 'v3_clean_slate_2026') {
        const keysToRemove = [
          'silex_mock_projects',
          'silex_mock_workflows',
          'silex_mock_kpis',
          'silex_mock_procurement',
          'silex_mock_inventory',
          'silex_mock_suppliers',
          'silex_mock_orders',
          'silex_mock_employees',
          'silex_mock_assets',
          'silex_mock_nc',
          'silex_prod_projects',
          'silex_prod_workflows',
          'silex_prod_kpis',
          'silex_prod_procurement',
          'silex_prod_inventory',
          'silex_prod_suppliers',
          'silex_prod_orders',
          'silex_prod_warehouses',
          'silex_prod_employees',
          'silex_prod_movements',
          'silex_prod_assets',
          'silex_prod_nc',
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('silex_slate_version', 'v3_clean_slate_2026');
      }

      const p = localStorage.getItem('silex_prod_projects');
      if (p) this.projects = JSON.parse(p);

      const w = localStorage.getItem('silex_prod_workflows');
      if (w) this.workflows = JSON.parse(w);

      const k = localStorage.getItem('silex_prod_kpis');
      if (k) this.kpis = JSON.parse(k);

      const pr = localStorage.getItem('silex_prod_procurement');
      if (pr) this.procurement = JSON.parse(pr);

      const inv = localStorage.getItem('silex_prod_inventory');
      if (inv) this.inventory = JSON.parse(inv);

      const sup = localStorage.getItem('silex_prod_suppliers');
      if (sup) this.suppliers = JSON.parse(sup);

      const ord = localStorage.getItem('silex_prod_orders');
      if (ord) this.purchaseOrders = JSON.parse(ord);

      const wh = localStorage.getItem('silex_prod_warehouses');
      if (wh) this.warehouses = JSON.parse(wh);

      const emp = localStorage.getItem('silex_prod_employees');
      if (emp) this.employees = JSON.parse(emp);

      const sm = localStorage.getItem('silex_prod_movements');
      if (sm) this.stockMovements = JSON.parse(sm);

      const ast = localStorage.getItem('silex_prod_assets');
      if (ast) this.assets = JSON.parse(ast);

      const nc = localStorage.getItem('silex_prod_nc');
      if (nc) this.nonConformities = JSON.parse(nc);
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('silex_prod_projects', JSON.stringify(this.projects));
      localStorage.setItem('silex_prod_workflows', JSON.stringify(this.workflows));
      localStorage.setItem('silex_prod_kpis', JSON.stringify(this.kpis));
      localStorage.setItem('silex_prod_procurement', JSON.stringify(this.procurement));
      localStorage.setItem('silex_prod_inventory', JSON.stringify(this.inventory));
      localStorage.setItem('silex_prod_suppliers', JSON.stringify(this.suppliers));
      localStorage.setItem('silex_prod_orders', JSON.stringify(this.purchaseOrders));
      localStorage.setItem('silex_prod_warehouses', JSON.stringify(this.warehouses));
      localStorage.setItem('silex_prod_employees', JSON.stringify(this.employees));
      localStorage.setItem('silex_prod_movements', JSON.stringify(this.stockMovements));
      localStorage.setItem('silex_prod_assets', JSON.stringify(this.assets));
      localStorage.setItem('silex_prod_nc', JSON.stringify(this.nonConformities));
    } catch {
      // ignore
    }
  }

  // ==========================================
  // PROJECTS & CHANTIERS ACTIONS
  // ==========================================
  getProjects() {
    return this.projects;
  }

  getProject(identifier: string) {
    if (!identifier) return null;
    const clean = identifier.toUpperCase();
    return this.projects.find(p => p.code?.toUpperCase() === clean || p.id === identifier) || null;
  }

  addProject(data: any) {
    const code = data.code || `PRJ-2026-${String(this.projects.length + 1).padStart(3, '0')}`;
    const newProj = {
      id: 'prj-' + Date.now(),
      code,
      name: data.name,
      clientName: data.clientName,
      sector: data.sector || 'OIL_AND_GAS',
      siteLocation: data.siteLocation || 'Algérie',
      status: 'PREPARATION',
      progressPhysical: 0,
      physicalProgress: 0,
      progressFinancial: 0,
      financialProgress: 0,
      budgetAmount: Number(data.budgetAmount || 0),
      contractAmount: Number(data.contractAmount || 0),
      committedCost: 0,
      actualCost: 0,
      startDate: data.startDate || new Date().toISOString(),
      contractEndDate: data.contractEndDate || new Date(Date.now() + 180 * 86400000).toISOString(),
      description: data.description || '',
      manager: {
        id: 'usr-rp-002',
        name: 'Sofiane Belkacem',
        email: 's.belkacem@silex-services.dz',
      },
      teamMembers: [],
      milestones: [],
      serviceOrders: [],
      workSituations: [],
    };

    this.projects.unshift(newProj);
    this.recalculateKpis();
    this.saveToStorage();
    return newProj;
  }

  updateProject(idOrCode: string, patch: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      Object.assign(proj, patch);
      this.recalculateKpis();
      this.saveToStorage();
    }
    return proj;
  }

  adjustProgress(idOrCode: string, physicalProgress: number, financialProgress: number) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      proj.progressPhysical = physicalProgress;
      proj.physicalProgress = physicalProgress;
      proj.progressFinancial = financialProgress;
      proj.financialProgress = financialProgress;
      this.recalculateKpis();
      this.saveToStorage();
    }
    return proj;
  }

  addMilestone(idOrCode: string, milestone: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      if (!proj.milestones) proj.milestones = [];
      const newM = {
        id: 'm-' + Date.now(),
        name: milestone.title || milestone.name,
        description: milestone.description,
        dueDate: milestone.targetDate || milestone.dueDate || new Date().toISOString(),
        progressWeight: Number(milestone.progressWeight || 10),
        status: milestone.status || 'IN_PROGRESS',
      };
      proj.milestones.push(newM);

      const totalWeight = proj.milestones.reduce((acc: number, m: any) => acc + (Number(m.progressWeight) || 0), 0);
      const validatedWeight = proj.milestones
        .filter((m: any) => m.status === 'VALIDATED')
        .reduce((acc: number, m: any) => acc + (Number(m.progressWeight) || 0), 0);
      if (totalWeight > 0) {
        proj.progressPhysical = Math.min(100, Math.round((validatedWeight / totalWeight) * 100));
        proj.physicalProgress = proj.progressPhysical;
      }

      this.saveToStorage();
    }
    return proj;
  }

  addServiceOrder(idOrCode: string, odsData: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      if (!proj.serviceOrders) proj.serviceOrders = [];
      const count = proj.serviceOrders.length + 1;
      const newOds = {
        id: 'ods-' + Date.now(),
        number: `ODS-2026-00${count}`,
        type: odsData.type || 'COMMENCEMENT',
        title: odsData.title || `Ordre de Service N°0${count}`,
        issuedDate: odsData.issueDate || odsData.issuedDate || new Date().toISOString(),
        status: 'ISSUED',
        description: odsData.description,
        delayImpactDays: Number(odsData.delayImpactDays || 0),
        costImpact: Number(odsData.costImpactAmount || odsData.costImpact || 0),
      };
      proj.serviceOrders.unshift(newOds);

      if (newOds.costImpact > 0) {
        proj.committedCost = (Number(proj.committedCost) || 0) + newOds.costImpact;
      }
      this.recalculateKpis();
      this.saveToStorage();
    }
    return proj;
  }

  addWorkSituation(idOrCode: string, sitData: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      if (!proj.workSituations) proj.workSituations = [];
      const count = proj.workSituations.length + 1;
      const amount = Number(sitData.totalAmountHT || sitData.amountHT || 0);
      const newSit = {
        id: 'sit-' + Date.now(),
        number: `SIT-2026-0${count}`,
        periodStart: sitData.periodStart || new Date().toISOString(),
        periodEnd: sitData.periodEnd || new Date().toISOString(),
        amountHT: amount,
        status: 'UNDER_REVIEW',
        inspector: sitData.inspectorName || 'Contrôle Technique / Client',
      };
      proj.workSituations.unshift(newSit);

      // Création automatique du workflow d'approbation financière DG
      this.workflows.unshift({
        id: 'wf-' + Date.now(),
        type: 'WORK_SITUATION',
        reference: newSit.number,
        title: `Situation Périodique N°0${count} - ${proj.name}`,
        requesterName: 'Sofiane Belkacem',
        requesterRole: 'RESPONSABLE_PROJET',
        projectCode: proj.code,
        projectName: proj.name,
        amount: amount,
        createdAt: new Date().toISOString(),
        status: 'PENDING_APPROVAL',
        urgency: 'HIGH',
        description: sitData.notes || 'Attachement contradictoire des travaux sur site.',
      });

      this.recalculateKpis();
      this.saveToStorage();
    }
    return proj;
  }

  addMember(idOrCode: string, memberData: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      if (!proj.teamMembers) proj.teamMembers = [];
      const user = SYSTEM_USERS.find(u => u.id === memberData.userId);
      proj.teamMembers.push({
        id: memberData.userId || 'usr-' + Date.now(),
        name: user?.name || memberData.name || 'Collaborateur Chantier SILEX',
        role: user?.title || memberData.role || 'Intervenant Opérationnel',
      });
      this.saveToStorage();
    }
    return proj;
  }

  // ==========================================
  // WORKFLOWS & DÉCISIONS EXÉCUTIVES
  // ==========================================
  getWorkflows() {
    return {
      items: this.workflows,
      total: this.workflows.length,
    };
  }

  approveWorkflow(wfId: string, notes?: string) {
    const item = this.workflows.find(w => w.id === wfId);
    if (item) {
      item.status = 'APPROVED';
      item.approvedAt = new Date().toISOString();
      item.notes = notes;

      if (item.type === 'WORK_SITUATION') {
        const proj = this.projects.find(p => p.code === item.projectCode);
        if (proj && proj.workSituations) {
          const sit = proj.workSituations.find((s: any) => s.number === item.reference);
          if (sit) sit.status = 'APPROVED';
        }
      }

      this.recalculateKpis();
      this.saveToStorage();
    }
    return { success: true, item };
  }

  rejectWorkflow(wfId: string, reason?: string) {
    const item = this.workflows.find(w => w.id === wfId);
    if (item) {
      item.status = 'REJECTED';
      item.rejectedAt = new Date().toISOString();
      item.reason = reason;

      if (item.type === 'WORK_SITUATION') {
        const proj = this.projects.find(p => p.code === item.projectCode);
        if (proj && proj.workSituations) {
          const sit = proj.workSituations.find((s: any) => s.number === item.reference);
          if (sit) sit.status = 'REJECTED';
        }
      }

      this.recalculateKpis();
      this.saveToStorage();
    }
    return { success: true, item };
  }

  requestRevisionWorkflow(wfId: string, instructions?: string) {
    const item = this.workflows.find(w => w.id === wfId);
    if (item) {
      item.status = 'REVISION_REQUESTED';
      item.instructions = instructions;
      this.saveToStorage();
    }
    return { success: true, item };
  }

  // ==========================================
  // ACHATS & APPROVISIONNEMENTS ACTIONS
  // ==========================================
  getProcurementRequests() {
    return this.procurement;
  }

  createProcurementRequest(data: any) {
    const count = this.procurement.length + 1;
    const newReq = {
      id: 'pr-' + Date.now(),
      code: `DA-2026-00${count}`,
      projectCode: data.projectCode || (this.projects[0]?.code ?? ''),
      projectName: data.projectName || (this.projects[0]?.name ?? ''),
      title: data.title || '',
      requesterName: data.requesterName || '',
      status: 'SUBMITTED',
      estimatedAmount: Number(data.estimatedAmount || 0),
      createdAt: new Date().toISOString(),
      lines: data.lines || [],
    };
    this.procurement.unshift(newReq);

    this.workflows.unshift({
      id: 'wf-' + Date.now(),
      type: 'PURCHASE_REQUEST',
      reference: newReq.code,
      title: newReq.title,
      requesterName: newReq.requesterName,
      requesterRole: 'RESPONSABLE_ACHATS',
      projectCode: newReq.projectCode,
      projectName: newReq.projectName,
      amount: newReq.estimatedAmount,
      createdAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
      urgency: 'HIGH',
      description: data.justification || 'Demande d’achat pour approvisionnement chantier.',
    });

    this.recalculateKpis();
    this.saveToStorage();
    return newReq;
  }

  getSuppliers() {
    return this.suppliers;
  }

  addSupplier(data: any) {
    const newSup = {
      id: 'sup-' + Date.now(),
      name: data.name,
      code: data.code || `FRN-${Date.now().toString().slice(-4)}`,
      category: data.category || 'MATERIAUX',
      taxId: data.taxId || data.nif || 'NIF-DZ-000',
      contactName: data.contactName || '',
      phone: data.phone || '',
      email: data.email || '',
      rating: data.rating || 5,
      active: true,
    };
    this.suppliers.unshift(newSup);
    this.saveToStorage();
    return newSup;
  }

  getPurchaseOrders() {
    return this.purchaseOrders;
  }

  createPurchaseOrder(data: any) {
    const count = this.purchaseOrders.length + 1;
    const newOrder = {
      id: 'po-' + Date.now(),
      code: `BC-2026-00${count}`,
      supplierName: data.supplierName || 'Fournisseur Agréé SILEX',
      projectCode: data.projectCode || '',
      totalHT: Number(data.totalHT || 0),
      totalTTC: Number(data.totalTTC || data.totalHT * 1.19 || 0),
      status: 'EMIS',
      issueDate: new Date().toISOString(),
      lines: data.lines || [],
    };
    this.purchaseOrders.unshift(newOrder);
    this.saveToStorage();
    return newOrder;
  }

  // ==========================================
  // STOCKS & MAGASINS ACTIONS
  // ==========================================
  getInventoryItems() {
    return this.inventory;
  }

  addInventoryItem(data: any) {
    const newItem = {
      id: 'item-' + Date.now(),
      code: data.code || `ART-${Date.now().toString().slice(-4)}`,
      name: data.name,
      categoryCode: data.categoryCode || 'DIVERS',
      currentStock: Number(data.initialStock || data.currentStock || 0),
      minStockLevel: Number(data.minStockLevel || 10),
      unit: data.unit || 'U',
      unitCost: Number(data.unitCost || 0),
    };
    this.inventory.unshift(newItem);
    this.saveToStorage();
    return newItem;
  }

  getWarehouses() {
    return this.warehouses;
  }

  addWarehouse(data: any) {
    const newWh = {
      id: 'wh-' + Date.now(),
      code: data.code || `MAG-${Date.now().toString().slice(-4)}`,
      name: data.name,
      location: data.location || 'Site Industriel SILEX',
      managerName: data.managerName || 'Tarek Meziani',
      active: true,
    };
    this.warehouses.unshift(newWh);
    this.saveToStorage();
    return newWh;
  }

  getStockMovements() {
    return this.stockMovements;
  }

  addInventoryMovement(movement: any) {
    const item = this.inventory.find(i => i.code === movement.itemCode || i.id === movement.itemId);
    const qty = Number(movement.quantity || 0);
    if (item) {
      if (movement.type === 'ENTRY' || movement.type === 'RECEIPT') {
        item.currentStock += qty;
      } else if (movement.type === 'EXIT' || movement.type === 'ISSUE') {
        item.currentStock = Math.max(0, item.currentStock - qty);
      }
    }

    const newMov = {
      id: 'mov-' + Date.now(),
      itemCode: item?.code || movement.itemCode,
      itemName: item?.name || movement.itemName,
      type: movement.type,
      quantity: qty,
      sourceWarehouse: movement.sourceWarehouse || 'MAG-01',
      date: new Date().toISOString(),
      performedBy: 'Tarek Meziani',
    };
    this.stockMovements.unshift(newMov);

    this.saveToStorage();
    return { success: true, item, movement: newMov };
  }

  // ==========================================
  // RESSOURCES HUMAINES ACTIONS
  // ==========================================
  getEmployees() {
    return this.employees;
  }

  addEmployee(data: any) {
    const newEmp = {
      id: 'emp-' + Date.now(),
      matricule: data.matricule || `EMP-${Date.now().toString().slice(-4)}`,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      jobTitle: data.jobTitle || 'Technicien Chantier',
      departmentCode: data.departmentCode || 'OPERATIONS_PROJETS',
      active: true,
      dailyRate: Number(data.dailyRate || 8000),
      certifications: data.certifications || [],
    };
    this.employees.unshift(newEmp);
    this.saveToStorage();
    return newEmp;
  }

  // ==========================================
  // PARC MATÉRIEL & MAINTENANCE ACTIONS
  // ==========================================
  getAssets() {
    return this.assets;
  }

  addAsset(data: any) {
    const newAsset = {
      id: 'ast-' + Date.now(),
      code: data.code || `ENG-${Date.now().toString().slice(-4)}`,
      name: data.name,
      category: data.category || 'ENGIN_LEVAGE',
      model: data.model || '',
      status: 'OPERATIONNEL',
      location: data.location || 'Parc Central SILEX',
      purchaseDate: data.purchaseDate || new Date().toISOString(),
    };
    this.assets.unshift(newAsset);
    this.saveToStorage();
    return newAsset;
  }

  // ==========================================
  // QHSE & NON-CONFORMITÉS ACTIONS
  // ==========================================
  getNonConformities() {
    return this.nonConformities;
  }

  addNonConformity(data: any) {
    const newNC = {
      id: 'nc-' + Date.now(),
      number: `NC-2026-00${this.nonConformities.length + 1}`,
      title: data.title,
      severity: data.severity || 'MAJOR',
      status: 'OPEN',
      projectCode: data.projectCode || '',
      detectedBy: 'Nadia Chaib',
      detectionDate: new Date().toISOString(),
      description: data.description || '',
    };
    this.nonConformities.unshift(newNC);
    this.saveToStorage();
    return newNC;
  }

  // ==========================================
  // RECALCUL DYNAMIQUE DES KPIS
  // ==========================================
  private recalculateKpis() {
    const totalContract = this.projects.reduce((acc, p) => acc + (Number(p.contractAmount) || 0), 0);
    const committed = this.projects.reduce((acc, p) => acc + (Number(p.committedCost) || 0), 0);
    const actual = this.projects.reduce((acc, p) => acc + (Number(p.actualCost) || 0), 0);
    const avgProg = this.projects.length > 0
      ? this.projects.reduce((acc, p) => acc + (Number(p.progressPhysical) || 0), 0) / this.projects.length
      : 0;
    const margin = totalContract > 0 ? ((totalContract - actual) / totalContract) * 100 : 0;

    this.kpis = {
      activeProjectsCount: this.projects.length,
      totalContractValue: totalContract,
      totalProjectBudgets: totalContract,
      committedCost: committed,
      totalCommittedCosts: committed,
      actualCost: actual,
      totalActualCosts: actual,
      grossMargin: Number(margin.toFixed(1)),
      projectedMarginRate: Number(margin.toFixed(1)),
      pendingApprovalsCount: this.workflows.filter(w => w.status === 'PENDING_APPROVAL').length,
      averageProgress: Number(avgProg.toFixed(1)),
    };
  }

  getKpis() {
    this.recalculateKpis();
    return this.kpis;
  }
}

export const mockStore = new StatefulProductionStore();

export const MOCK_KPIS = DEFAULT_KPIS;
export const MOCK_PROJECTS = DEFAULT_PROJECTS;
export const MOCK_WORKFLOWS_INBOX = { items: DEFAULT_WORKFLOWS_INBOX, total: 0 };
