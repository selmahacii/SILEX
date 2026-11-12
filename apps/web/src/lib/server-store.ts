
const DEFAULT_RBAC_MATRIX: Record<string, Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean; approve: boolean; export: boolean }>> = {
  DIRECTEUR_GENERAL: {
    dashboard: { read: true, create: false, update: false, delete: false, approve: true, export: true },
    commercial: { read: true, create: true, update: true, delete: true, approve: true, export: true },
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
    commercial: { read: true, create: true, update: true, delete: false, approve: false, export: true },
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
    commercial: { read: true, create: false, update: true, delete: false, approve: false, export: true },
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
    commercial: { read: false, create: false, update: false, delete: false, approve: false, export: false },
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
    commercial: { read: true, create: false, update: true, delete: false, approve: false, export: false },
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
    commercial: { read: true, create: false, update: true, delete: false, approve: true, export: true },
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
    commercial: { read: false, create: false, update: false, delete: false, approve: false, export: false },
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
    commercial: { read: true, create: false, update: false, delete: false, approve: false, export: false },
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
    commercial: { read: true, create: true, update: true, delete: true, approve: true, export: true },
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
  assignedUsers?: any[];
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

export interface StoredOpportunity {
  id: string;
  code: string;
  title: string;
  clientName: string;
  sector: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  estimatedAmount: number;
  receivedAt: string;
  submissionDeadline: string;
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  status: 'BROUILLON' | 'EN_ETUDE' | 'DEVIS_ENVOYE' | 'GAGNEE' | 'PERDUE';
  notes?: string;
  assignedCommercialId: string;
  assignedCommercialName: string;
  costSheetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCostSheetLine {
  id: string;
  category: string;
  label: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  notes?: string;
}

export interface StoredCostSheet {
  id: string;
  reference: string;
  opportunityId?: string;
  opportunityCode?: string;
  title: string;
  clientName: string;
  sector: string;
  siteLocation: string;
  currency: 'DZD';
  status:
    | 'BROUILLON'
    | 'EN_ATTENTE_CONTRIBUTIONS'
    | 'EN_COURS_CHIFFRAGE'
    | 'PRETE_POUR_VALIDATION'
    | 'EN_ATTENTE_DG'
    | 'VALIDEE'
    | 'REJETEE'
    | 'MODIFICATION_DEMANDEE'
    | 'SOUMISE_CLIENT'
    | 'GAGNEE'
    | 'PERDUE';
  version: number;

  projectContribution: {
    completed: boolean;
    responsibleId: string;
    responsibleName: string;
    worksDescription: string;
    durationDays: number;
    technicalMeans: string;
    constraints: string;
    lines: StoredCostSheetLine[];
    updatedAt?: string;
  };

  procurementContribution: {
    completed: boolean;
    responsibleId: string;
    responsibleName: string;
    procurementNotes: string;
    equipmentRentalAmount: number;
    subcontractingAmount: number;
    lines: StoredCostSheetLine[];
    updatedAt?: string;
  };

  hrContribution: {
    completed: boolean;
    responsibleId: string;
    responsibleName: string;
    headcount: number;
    mobilizationDays: number;
    teamExpensesAmount: number;
    lines: StoredCostSheetLine[];
    updatedAt?: string;
  };

  financeContribution: {
    completed: boolean;
    responsibleId: string;
    responsibleName: string;
    financingNeedAmount: number;
    cashflowRequirement: string;
    paymentTermsEstimated: string;
    financialRiskRating: 'FAIBLE' | 'MODERE' | 'ELEVE' | 'CRITIQUE';
    financeNotes: string;
    feasibilityOpinion: 'FAVORABLE' | 'RESERVE' | 'DEFAVORABLE';
    updatedAt?: string;
  };

  totalDirectCost: number;
  totalIndirectCost: number;
  totalEstimatedCost: number;
  targetMarginPercent: number;
  proposedSellingPrice: number;
  estimatedMarginValue: number;
  marginRateOnCost: number;
  markupRate: number;

  dgDecision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  dgDecisionNotes?: string;
  dgDecidedAt?: string;
  dgDecidedBy?: string;
  dgVisaSignature?: string;

  quoteCreated: boolean;
  quoteId?: string;
  quoteNumber?: string;
  projectCreated: boolean;
  projectCode?: string;

  history: Array<{
    action: string;
    actor: string;
    role: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCustomerQuote {
  id: string;
  quoteNumber: string;
  costSheetId: string;
  costSheetRef: string;
  opportunityCode?: string;
  clientName: string;
  object: string;
  issueDate: string;
  validUntil: string;
  totalHT: number;
  vatRate: number;
  vatAmount: number;
  totalTTC: number;
  paymentTerms: string;
  deliveryLeadTime: string;
  warrantyTerms: string;
  status: 'BROUILLON' | 'ENVOYE' | 'ACCEPTE' | 'REFUSE';
  acceptedAt?: string;
  acceptedBy?: string;
  createdAt: string;
}

class ServerStore {
  private users: ServerUser[] = [];
  private projects: StoredProject[] = [];
  public workflows: StoredWorkflow[] = [];
  private opportunities: StoredOpportunity[] = [];
  private costSheets: StoredCostSheet[] = [];
  private customerQuotes: StoredCustomerQuote[] = [];
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
  public financePayments: any[] = [];
  private auditLogs: any[] = [];
  private rolePermissions: Record<string, any> = {};

  constructor() {
    this.initBaseline();
  }

  private initBaseline() {
    // 1. Initialiser le SuperAdmin et les utilisateurs de test multi-RBAC
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
      {
        id: 'usr-dg-001',
        name: 'Amine Benali',
        email: 'dg@silex-services.dz',
        title: 'Directeur Général SILEX',
        role: SystemRole.DIRECTEUR_GENERAL,
        departmentCode: DepartmentCode.DIRECTION_GENERALE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-dg-002',
        name: 'Amine Benali (Nominal)',
        email: 'a.benali@silex-services.dz',
        title: 'Directeur Général SILEX',
        role: SystemRole.DIRECTEUR_GENERAL,
        departmentCode: DepartmentCode.DIRECTION_GENERALE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-rp-001',
        name: 'Karim Mansouri',
        email: 'projets@silex-services.dz',
        title: 'Chef de Projets & Conduite de Travaux',
        role: SystemRole.RESPONSABLE_PROJET,
        departmentCode: DepartmentCode.OPERATIONS_PROJETS,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-rp-002',
        name: 'Karim Mansouri (Nominal)',
        email: 'k.mansouri@silex-services.dz',
        title: 'Chef de Projets Industriels',
        role: SystemRole.RESPONSABLE_PROJET,
        departmentCode: DepartmentCode.OPERATIONS_PROJETS,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-ach-001',
        name: 'Farouk Brahimi',
        email: 'achats@silex-services.dz',
        title: 'Responsable Achats & Supply Chain',
        role: SystemRole.RESPONSABLE_ACHATS,
        departmentCode: DepartmentCode.ACHATS_LOGISTIQUE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-ach-002',
        name: 'Farouk Brahimi (Nominal)',
        email: 'f.brahimi@silex-services.dz',
        title: 'Responsable Approvisionnements & Achats',
        role: SystemRole.RESPONSABLE_ACHATS,
        departmentCode: DepartmentCode.ACHATS_LOGISTIQUE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-mag-001',
        name: 'Tarek Meziani',
        email: 'magasin@silex-services.dz',
        title: 'Gestionnaire Magasins & Stocks',
        role: SystemRole.RESPONSABLE_MAGASIN,
        departmentCode: DepartmentCode.MAGASIN_STOCKS,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-mag-002',
        name: 'Tarek Meziani (Nominal)',
        email: 't.meziani@silex-services.dz',
        title: 'Gestionnaire Magasins & Stocks',
        role: SystemRole.RESPONSABLE_MAGASIN,
        departmentCode: DepartmentCode.MAGASIN_STOCKS,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-fin-001',
        name: 'Réda Bouzid',
        email: 'finance@silex-services.dz',
        title: 'Directeur Financier & Contrôle de Gestion',
        role: SystemRole.RESPONSABLE_FINANCIER,
        departmentCode: DepartmentCode.FINANCE_COMPTABILITE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-fin-002',
        name: 'Réda Bouzid (Nominal)',
        email: 'r.bouzid@silex-services.dz',
        title: 'Directeur Financier & Trésorerie',
        role: SystemRole.RESPONSABLE_FINANCIER,
        departmentCode: DepartmentCode.FINANCE_COMPTABILITE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-rh-001',
        name: 'Sabrina Haddad',
        email: 'rh@silex-services.dz',
        title: 'Responsable Ressources Humaines & CQS',
        role: SystemRole.RESPONSABLE_RH,
        departmentCode: DepartmentCode.RESSOURCES_HUMAINES,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-rh-002',
        name: 'Sabrina Haddad (Nominal)',
        email: 's.haddad@silex-services.dz',
        title: 'Responsable RH & Compétences',
        role: SystemRole.RESPONSABLE_RH,
        departmentCode: DepartmentCode.RESSOURCES_HUMAINES,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-mnt-001',
        name: 'Mourad Zitouni',
        email: 'maintenance@silex-services.dz',
        title: 'Responsable Parc Matériel & Maintenance',
        role: SystemRole.RESPONSABLE_MAINTENANCE,
        departmentCode: DepartmentCode.PARC_MAINTENANCE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-mnt-002',
        name: 'Mourad Zitouni (Nominal)',
        email: 'm.zitouni@silex-services.dz',
        title: 'Responsable Maintenance & Parc Engins',
        role: SystemRole.RESPONSABLE_MAINTENANCE,
        departmentCode: DepartmentCode.PARC_MAINTENANCE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-qhse-001',
        name: 'Nadia Chaib',
        email: 'qualite@silex-services.dz',
        title: 'Responsable QHSE & Contrôles CND',
        role: SystemRole.RESPONSABLE_QUALITE,
        departmentCode: DepartmentCode.QHSE,
        avatar: '',
        active: true,
        assignedProjects: [],
        permissions: ['*'],
      },
      {
        id: 'usr-qhse-002',
        name: 'Nadia Chaib (Nominal)',
        email: 'n.chaib@silex-services.dz',
        title: 'Responsable Qualité & Sécurité QHSE',
        role: SystemRole.RESPONSABLE_QUALITE,
        departmentCode: DepartmentCode.QHSE,
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

    // 4. Données de démonstration Commercial & Fiche de Coût
    this.initCommercialBaseline();
  }

  private initCommercialBaseline() {
    this.opportunities = [
      {
        id: 'opp-2026-001',
        code: 'OPP-2026-001',
        title: 'Maintenance préventive d\'une installation industrielle',
        clientName: 'Client Industrie Démo (Sonatrach Raffinerie Skikda)',
        sector: 'OIL_AND_GAS',
        location: 'Zone Industrielle Skikda RA1K',
        contactName: 'M. Mustapha Larbi (Chef Dép. Maintenance)',
        contactEmail: 'm.larbi@sonatrach-skikda.dz',
        contactPhone: '+213 (0) 38 75 22 10',
        estimatedAmount: 48500000,
        receivedAt: '2026-11-01',
        submissionDeadline: '2026-11-25',
        priority: 'HAUTE',
        status: 'EN_ETUDE',
        notes: 'Arrêt technique annuel : Rénovation de 4 lignes tuyauteries HP vapeur 80 bar et échangeurs thermiques avec contrôles CND.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        costSheetId: 'fc-2026-001',
        createdAt: '2026-11-01T08:30:00Z',
        updatedAt: '2026-11-08T10:00:00Z',
      },
      {
        id: 'opp-2026-002',
        code: 'OPP-2026-002',
        title: 'Préfabrication et pose réseau HVAC salle blanche et compresseurs',
        clientName: 'Fertial Algérie (Complexe Ammoniac & Engrais)',
        sector: 'AGROALIMENTAIRE',
        location: 'Zone Industrielle Arzew, Oran',
        contactName: 'M. Djamel Belkacemi (Ingénieur Projets)',
        contactEmail: 'd.belkacemi@fertial-dz.com',
        contactPhone: '+213 (0) 41 48 30 15',
        estimatedAmount: 26000000,
        receivedAt: '2026-11-05',
        submissionDeadline: '2026-11-30',
        priority: 'NORMALE',
        status: 'BROUILLON',
        notes: 'Installation de gaines acier galvanisé calorifugées et groupes frigorifiques 150 kW.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-11-05T09:00:00Z',
        updatedAt: '2026-11-05T09:00:00Z',
      },
    ];

    const initialCostSheet: StoredCostSheet = {
      id: 'fc-2026-001',
      reference: 'FC-2026-001',
      opportunityId: 'opp-2026-001',
      opportunityCode: 'OPP-2026-001',
      title: 'Fiche de Chiffrage Collaboratif — Maintenance préventive installation industrielle',
      clientName: 'Client Industrie Démo (Sonatrach Raffinerie Skikda)',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Zone Industrielle Skikda RA1K',
      currency: 'DZD',
      status: 'PRETE_POUR_VALIDATION',
      version: 1,

      projectContribution: {
        completed: true,
        responsibleId: 'usr-rp-001',
        responsibleName: 'Karim Mansouri (Chef de Projets)',
        worksDescription: 'Démontage tuyauteries usagées, épreuves hydrostatiques 120 bar, préfabrication 400ml tuyauteries Inox 316L DN150/200, montage sur site et contrôles CND.',
        durationDays: 45,
        technicalMeans: '2 Postes TIG orbital, 1 grue mobile 50T, compresseurs d\'épreuve 200 bar, échafaudages agréés.',
        constraints: 'Travaux en zone ATEX 1, arrêt programmé strict de 45 jours sans dépassement possible.',
        lines: [
          { id: 'csl-prj-1', category: 'PREPARATION', label: 'Échafaudages tubulaires, blindage et balisage zone ATEX', quantity: 1, unit: 'Forfait', unitPrice: 1800000, totalAmount: 1800000, notes: 'Montage et PV réception sécuritaire' },
          { id: 'csl-prj-2', category: 'TRAVAUX', label: 'Préfabrication atelier et pose tuyauterie Inox 316L DN150/200', quantity: 400, unit: 'ml', unitPrice: 12000, totalAmount: 4800000, notes: 'Soudage TIG passe de pénétration' },
          { id: 'csl-prj-3', category: 'CONTROLES', label: 'Épreuves hydrauliques 120 bar et contrôles CND (Radiographie 100%)', quantity: 1, unit: 'Forfait', unitPrice: 2200000, totalAmount: 2200000, notes: 'PV contradictoire avec bureau de contrôle' },
        ],
        updatedAt: '2026-11-06T14:30:00Z',
      },

      procurementContribution: {
        completed: true,
        responsibleId: 'usr-ach-001',
        responsibleName: 'Farouk Brahimi (Responsable Achats)',
        procurementNotes: 'Fournitures de tubes ASTM A312 TP316L sch40 et brides forgées ANSI 300# négociées avec certificat matière CCPU 3.1.',
        equipmentRentalAmount: 2400000,
        subcontractingAmount: 1500000,
        lines: [
          { id: 'csl-ach-1', category: 'MATIERES', label: 'Tubes Inox sans soudure ASTM A312 TP316L DN150 sch40', quantity: 400, unit: 'ml', unitPrice: 21250, totalAmount: 8500000, notes: 'Fournisseur SIDERMET Tubing' },
          { id: 'csl-ach-2', category: 'MATIERES', label: 'Coudes 90°, réductions et brides ANSI 300# RTJ', quantity: 60, unit: 'U', unitPrice: 53333.33, totalAmount: 3200000, notes: 'Fournisseur ALFORGE Industrie' },
          { id: 'csl-ach-3', category: 'CONSOMMABLES', label: 'Métal d\'apport TIG ER316L et Gaz Argon haute pureté', quantity: 1, unit: 'Forfait', unitPrice: 1100000, totalAmount: 1100000, notes: 'Bouteilles LINDE Gas DZ' },
          { id: 'csl-ach-4', category: 'LOCATION', label: 'Location grue mobile 50T avec grutier habilité', quantity: 20, unit: 'Jour', unitPrice: 120000, totalAmount: 2400000, notes: 'Engin certifié contrôle annuel' },
        ],
        updatedAt: '2026-11-07T11:00:00Z',
      },

      hrContribution: {
        completed: true,
        responsibleId: 'usr-rh-001',
        responsibleName: 'Sabrina Haddad (Responsable RH)',
        headcount: 12,
        mobilizationDays: 45,
        teamExpensesAmount: 2160000,
        lines: [
          { id: 'csl-rh-1', category: 'MAIN_DOEUVRE', label: 'Soudeurs qualifiés TIG 6G ASME IX (4 pers x 45j)', quantity: 180, unit: 'H/J', unitPrice: 18000, totalAmount: 3240000, notes: 'Qualifications valides CQS' },
          { id: 'csl-rh-2', category: 'MAIN_DOEUVRE', label: 'Tuyauteurs industriels chefs d\'équipe (6 pers x 45j)', quantity: 270, unit: 'H/J', unitPrice: 14000, totalAmount: 3780000, notes: 'Montage et traçage' },
          { id: 'csl-rh-3', category: 'SUPERVISION', label: 'Superviseur Qualité / Inspecteur Soudage IWT (45j)', quantity: 45, unit: 'Jour', unitPrice: 22000, totalAmount: 990000, notes: 'Suivi cahier de soudage' },
          { id: 'csl-rh-4', category: 'SUPERVISION', label: 'Superviseur HSE / Prévention des risques ATEX (45j)', quantity: 45, unit: 'Jour', unitPrice: 16000, totalAmount: 720000, notes: 'Permanence sécurité sur site' },
        ],
        updatedAt: '2026-11-07T16:45:00Z',
      },

      financeContribution: {
        completed: true,
        responsibleId: 'usr-fin-001',
        responsibleName: 'Réda Bouzid (Directeur Financier)',
        financingNeedAmount: 12000000,
        cashflowRequirement: 'Avance sur approvisionnements tubes inox à débloquer en S1 (12 000 000 DA). Couverture par acompte client 30%.',
        paymentTermsEstimated: 'Acompte 30% commande, situations mensuelles à 45 jours fin de mois, retenue de garantie 5% sur 12 mois.',
        financialRiskRating: 'MODERE',
        financeNotes: 'Client solvable, historique de paiement régulier. Retenue de garantie provisionnée. Marge prévisionnelle solide (24.5%).',
        feasibilityOpinion: 'FAVORABLE',
        updatedAt: '2026-11-08T09:30:00Z',
      },

      totalDirectCost: 26090000,
      totalIndirectCost: 3130800,
      totalEstimatedCost: 29220800,
      targetMarginPercent: 24.5,
      proposedSellingPrice: 38700000,
      estimatedMarginValue: 9479200,
      marginRateOnCost: 32.44,
      markupRate: 24.49,

      dgDecision: 'PENDING',
      quoteCreated: false,
      projectCreated: false,

      history: [
        { action: 'CREATION', actor: 'Karim Mansouri', role: 'RESPONSABLE_PROJET', timestamp: '2026-11-02T10:00:00Z', notes: 'Création de la fiche suite à l\'appel d\'offres OPP-2026-001' },
        { action: 'CONTRIBUTION_PROJET', actor: 'Karim Mansouri', role: 'RESPONSABLE_PROJET', timestamp: '2026-11-06T14:30:00Z', notes: 'Métrés et durées techniques complétés (45 jours, 400 ml)' },
        { action: 'CONTRIBUTION_ACHATS', actor: 'Farouk Brahimi', role: 'RESPONSABLE_ACHATS', timestamp: '2026-11-07T11:00:00Z', notes: 'Cotations matières Inox 316L et location grue validées (15.2M DA)' },
        { action: 'CONTRIBUTION_RH', actor: 'Sabrina Haddad', role: 'RESPONSABLE_RH', timestamp: '2026-11-07T16:45:00Z', notes: 'Mobilisation équipe 12 personnes avec soudeurs 6G qualifiés (10.89M DA)' },
        { action: 'CONTRIBUTION_FINANCE', actor: 'Réda Bouzid', role: 'RESPONSABLE_FINANCIER', timestamp: '2026-11-08T09:30:00Z', notes: 'Étude de trésorerie favorable, prix de vente cible 38.7M DA arrêté' },
        { action: 'SUBMIT_TO_DG', actor: 'Karim Mansouri', role: 'RESPONSABLE_PROJET', timestamp: '2026-11-08T10:00:00Z', notes: 'Les 4 contributions sont finalisées. Fiche transmise à la Direction Générale pour arbitrage.' },
      ],
      createdAt: '2026-11-02T10:00:00Z',
      updatedAt: '2026-11-08T10:00:00Z',
    };

    this.costSheets = [initialCostSheet];

    this.workflows.unshift({
      id: 'wf-cs-001',
      code: 'WF-CS-001',
      reference: 'FC-2026-001',
      title: 'Validation Chiffrage & Prix de Vente : Maintenance préventive installation industrielle',
      type: 'COST_SHEET' as any,
      status: 'PENDING_DG',
      priority: 'HIGH',
      initiatorName: 'Karim Mansouri',
      initiatorRole: 'Chef de Projets',
      initiatorDepartment: 'OPERATIONS_PROJETS',
      targetId: 'fc-2026-001',
      targetCode: 'FC-2026-001',
      clientName: 'Client Industrie Démo (Sonatrach Raffinerie Skikda)',
      amountHT: 38700000,
      amountTVA: 7353000,
      amountTTC: 46053000,
      justification: 'Chiffrage collaboratif complet : Coût direct 26.09M DA, Marge prévue 9.48M DA (24.5%). En attente arbitrage DG.',
      items: [
        { label: 'Débours Matières & Sous-traitance', amount: 15200000 },
        { label: 'Main d\'œuvre & Encadrement Chantier', amount: 10890000 },
        { label: 'Frais Généraux & Indirects', amount: 3130800 },
      ],
      supplierOffers: [],
      submittedAt: '2026-11-08T10:00:00Z',
      history: [
        { action: 'SUBMISSION', actor: 'Karim Mansouri', role: 'Chef de Projets', timestamp: '2026-11-08T10:00:00Z', notes: 'Transmission pour visa Direction Générale' },
      ],
    });
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

  updateMilestone(codeOrId: string, milestoneId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    if (!project.milestones) project.milestones = [];
    const milestone = project.milestones.find((m: any) => m.id === milestoneId);
    if (!milestone) return null;

    if (data.status) milestone.status = data.status;
    if (data.status === 'COMPLETED' || data.completed === true) {
      milestone.status = 'COMPLETED';
      milestone.completed = true;
      milestone.completedDate = data.completedDate || new Date().toISOString();
    }
    if (data.title) milestone.title = data.title;
    if (data.description !== undefined) milestone.description = data.description;
    if (data.targetDate) milestone.targetDate = data.targetDate;

    // Recalcul avancement physique basé sur les jalons
    if (project.milestones.length > 0) {
      const completedCount = project.milestones.filter((m: any) => m.status === 'COMPLETED' || m.completed).length;
      const progressPercent = Math.round((completedCount / project.milestones.length) * 100);
      project.physicalProgress = Math.max(project.physicalProgress, progressPercent);
    }

    project.updatedAt = new Date().toISOString();
    this.addAuditLog(
      'UPDATE_MILESTONE',
      'PROJECT_MILESTONE',
      milestoneId,
      `Jalon '${milestone.title}' validé et marqué COMPLETED sur projet ${project.code}`
    );
    return milestone;
  }

  addCostEntry(codeOrId: string, data: any) {
    const project = this.getProject(codeOrId);
    if (!project) return null;
    if (!project.costEntries) project.costEntries = [];
    const entry = {
      id: `cst-${Date.now()}`,
      category: data.category || 'AUTRE',
      amount: Number(data.amount || 0),
      description: data.description || '',
      sourceModule: data.sourceModule || 'MANUAL',
      date: new Date().toISOString(),
    };
    project.costEntries.push(entry);
    project.spentBudget += entry.amount;
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('ADD_COST', 'PROJECT', project.code, `Frais imputé (${entry.category}): ${entry.amount} DA`);
    return entry;
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
      actor: wf.decidedBy || 'Direction Générale',
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
      actor: wf.decidedBy || 'Direction Générale',
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

  getPurchaseRequest(idOrCode: string) {
    return this.purchaseRequests.find(p => p.id === idOrCode || p.code === idOrCode || p.reference === idOrCode) || null;
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

  // ==========================================
  // --- MODULE COMMERCIAL & FICHE DE COÛT ---
  // ==========================================

  getCommercialKpis() {
    const oppCount = this.opportunities.length;
    const activeOpps = this.opportunities.filter(o => o.status !== 'PERDUE');
    const totalPipelineValue = activeOpps.reduce((sum, o) => sum + (o.estimatedAmount || 0), 0);
    const pendingCostSheets = this.costSheets.filter(cs => cs.status === 'EN_ATTENTE_DG' || cs.status === 'PRETE_POUR_VALIDATION');
    const approvedCostSheets = this.costSheets.filter(cs => cs.status === 'VALIDEE' || cs.status === 'SOUMISE_CLIENT' || cs.status === 'GAGNEE');
    const quotesSent = this.customerQuotes.filter(q => q.status === 'ENVOYE');
    const quotesAccepted = this.customerQuotes.filter(q => q.status === 'ACCEPTE');
    const totalWonContractValue = this.costSheets
      .filter(cs => cs.status === 'GAGNEE')
      .reduce((sum, cs) => sum + (cs.proposedSellingPrice || 0), 0);

    const conversionRate = oppCount > 0
      ? Number(((this.opportunities.filter(o => o.status === 'GAGNEE').length / oppCount) * 100).toFixed(1))
      : 0;

    return {
      totalOpportunities: oppCount,
      activeOpportunities: activeOpps.length,
      pipelineValue: totalPipelineValue,
      pendingCostSheetsCount: pendingCostSheets.length,
      approvedCostSheetsCount: approvedCostSheets.length,
      quotesSentCount: quotesSent.length,
      quotesAcceptedCount: quotesAccepted.length,
      totalWonValue: totalWonContractValue,
      conversionRate,
    };
  }

  getOpportunities() {
    return this.opportunities;
  }

  getOpportunity(id: string) {
    return this.opportunities.find(o => o.id === id || o.code === id);
  }

  createOpportunity(data: any, user?: any) {
    const oppNum = String(this.opportunities.length + 1).padStart(3, '0');
    const newOpp: StoredOpportunity = {
      id: `opp-${Date.now()}`,
      code: `OPP-${new Date().getFullYear()}-${oppNum}`,
      title: data.title || 'Nouvelle Opportunité Industrielle',
      clientName: data.clientName || 'Client Industriel',
      sector: data.sector || 'OIL_AND_GAS',
      location: data.location || 'Algérie',
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      estimatedAmount: Number(data.estimatedAmount) || 0,
      receivedAt: data.receivedAt || new Date().toISOString().split('T')[0],
      submissionDeadline: data.submissionDeadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      priority: data.priority || 'NORMALE',
      status: 'BROUILLON',
      notes: data.notes || '',
      assignedCommercialId: user?.id || 'usr-rp-001',
      assignedCommercialName: user?.name || 'Karim Mansouri',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.unshift(newOpp);
    this.addAuditLog('CREATE_OPPORTUNITY', 'COMMERCIAL', newOpp.code, `Création opportunité ${newOpp.code} - ${newOpp.title}`, user);
    return newOpp;
  }

  updateOpportunity(id: string, data: any, user?: any) {
    const opp = this.opportunities.find(o => o.id === id || o.code === id);
    if (!opp) throw new Error('Opportunité introuvable');
    Object.assign(opp, data, { updatedAt: new Date().toISOString() });
    this.addAuditLog('UPDATE_OPPORTUNITY', 'COMMERCIAL', opp.code, `Mise à jour opportunité ${opp.code}`, user);
    return opp;
  }

  getCostSheets() {
    return this.costSheets;
  }

  getCostSheet(id: string) {
    return this.costSheets.find(cs => cs.id === id || cs.reference === id);
  }

  createCostSheet(data: any, user?: any) {
    const num = String(this.costSheets.length + 1).padStart(3, '0');
    const ref = `FC-${new Date().getFullYear()}-${num}`;
    const newSheet: StoredCostSheet = {
      id: `fc-${Date.now()}`,
      reference: ref,
      opportunityId: data.opportunityId,
      opportunityCode: data.opportunityCode,
      title: data.title || 'Fiche de Chiffrage Collaboratif',
      clientName: data.clientName || 'Client Industriel',
      sector: data.sector || 'OIL_AND_GAS',
      siteLocation: data.siteLocation || 'Chantier',
      currency: 'DZD',
      status: 'BROUILLON',
      version: 1,

      projectContribution: {
        completed: false,
        responsibleId: user?.id || 'usr-rp-001',
        responsibleName: user?.name || 'Chef de Projet',
        worksDescription: data.worksDescription || '',
        durationDays: Number(data.durationDays) || 30,
        technicalMeans: '',
        constraints: '',
        lines: [],
      },
      procurementContribution: {
        completed: false,
        responsibleId: 'usr-ach-001',
        responsibleName: 'Farouk Brahimi (Achats)',
        procurementNotes: '',
        equipmentRentalAmount: 0,
        subcontractingAmount: 0,
        lines: [],
      },
      hrContribution: {
        completed: false,
        responsibleId: 'usr-rh-001',
        responsibleName: 'Sabrina Haddad (RH)',
        headcount: 0,
        mobilizationDays: 0,
        teamExpensesAmount: 0,
        lines: [],
      },
      financeContribution: {
        completed: false,
        responsibleId: 'usr-fin-001',
        responsibleName: 'Réda Bouzid (Finance)',
        financingNeedAmount: 0,
        cashflowRequirement: '',
        paymentTermsEstimated: '45 jours fin de mois',
        financialRiskRating: 'FAIBLE',
        financeNotes: '',
        feasibilityOpinion: 'FAVORABLE',
      },

      totalDirectCost: 0,
      totalIndirectCost: 0,
      totalEstimatedCost: 0,
      targetMarginPercent: 20,
      proposedSellingPrice: 0,
      estimatedMarginValue: 0,
      marginRateOnCost: 0,
      markupRate: 0,

      dgDecision: 'PENDING',
      quoteCreated: false,
      projectCreated: false,

      history: [
        {
          action: 'CREATION',
          actor: user?.name || 'Responsable Commercial',
          role: user?.role || 'RESPONSABLE_PROJET',
          timestamp: new Date().toISOString(),
          notes: `Création initiale de la fiche ${ref}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (data.opportunityId) {
      const opp = this.opportunities.find(o => o.id === data.opportunityId || o.code === data.opportunityCode);
      if (opp) {
        opp.costSheetId = newSheet.id;
        opp.status = 'EN_ETUDE';
        opp.updatedAt = new Date().toISOString();
      }
    }

    this.costSheets.unshift(newSheet);
    this.addAuditLog('CREATE_COST_SHEET', 'COMMERCIAL', ref, `Création fiche de coût ${ref} (${newSheet.title})`, user);
    return newSheet;
  }

  updateCostSheetContribution(
    id: string,
    department: 'PROJECT' | 'PROCUREMENT' | 'HR' | 'FINANCE',
    data: any,
    user?: any
  ) {
    const sheet = this.costSheets.find(cs => cs.id === id || cs.reference === id);
    if (!sheet) throw new Error('Fiche de coût introuvable');
    if (sheet.status === 'VALIDEE' && user?.role !== SystemRole.DIRECTEUR_GENERAL && user?.role !== SystemRole.ADMINISTRATEUR) {
      throw new Error('Une fiche de coût validée ne peut être modifiée sans autorisation de la Direction Générale.');
    }

    if (department === 'PROJECT') {
      Object.assign(sheet.projectContribution, data, {
        completed: true,
        responsibleName: user?.name || sheet.projectContribution.responsibleName,
        responsibleId: user?.id || sheet.projectContribution.responsibleId,
        updatedAt: new Date().toISOString(),
      });
      sheet.history.push({
        action: 'UPDATE_PROJECT_CONTRIBUTION',
        actor: user?.name || 'Service Projet',
        role: user?.role || 'RESPONSABLE_PROJET',
        timestamp: new Date().toISOString(),
        notes: 'Mise à jour des estimations techniques et des moyens chantier',
      });
    } else if (department === 'PROCUREMENT') {
      Object.assign(sheet.procurementContribution, data, {
        completed: true,
        responsibleName: user?.name || sheet.procurementContribution.responsibleName,
        responsibleId: user?.id || sheet.procurementContribution.responsibleId,
        updatedAt: new Date().toISOString(),
      });
      sheet.history.push({
        action: 'UPDATE_PROCUREMENT_CONTRIBUTION',
        actor: user?.name || 'Service Achats',
        role: user?.role || 'RESPONSABLE_ACHATS',
        timestamp: new Date().toISOString(),
        notes: 'Mise à jour des cotations matières, fournitures et locations',
      });
    } else if (department === 'HR') {
      Object.assign(sheet.hrContribution, data, {
        completed: true,
        responsibleName: user?.name || sheet.hrContribution.responsibleName,
        responsibleId: user?.id || sheet.hrContribution.responsibleId,
        updatedAt: new Date().toISOString(),
      });
      sheet.history.push({
        action: 'UPDATE_HR_CONTRIBUTION',
        actor: user?.name || 'Service RH',
        role: user?.role || 'RESPONSABLE_RH',
        timestamp: new Date().toISOString(),
        notes: 'Mise à jour des effectifs, compétences et débours main d\'œuvre',
      });
    } else if (department === 'FINANCE') {
      Object.assign(sheet.financeContribution, data, {
        completed: true,
        responsibleName: user?.name || sheet.financeContribution.responsibleName,
        responsibleId: user?.id || sheet.financeContribution.responsibleId,
        updatedAt: new Date().toISOString(),
      });
      if (data.targetMarginPercent !== undefined) {
        sheet.targetMarginPercent = Number(data.targetMarginPercent);
        sheet.proposedSellingPrice = Math.round(
          sheet.totalEstimatedCost > 0
            ? sheet.totalEstimatedCost / (1 - (sheet.targetMarginPercent / 100))
            : 0
        );
      }
      if (data.proposedSellingPrice !== undefined) {
        sheet.proposedSellingPrice = Number(data.proposedSellingPrice);
      }
      sheet.history.push({
        action: 'UPDATE_FINANCE_CONTRIBUTION',
        actor: user?.name || 'Service Finance',
        role: user?.role || 'RESPONSABLE_FINANCIER',
        timestamp: new Date().toISOString(),
        notes: 'Mise à jour étude de rentabilité et besoins de trésorerie',
      });
    }

    this.recalculateCostSheet(sheet);

    if (
      sheet.projectContribution.completed &&
      sheet.procurementContribution.completed &&
      sheet.hrContribution.completed &&
      sheet.financeContribution.completed &&
      sheet.status === 'BROUILLON'
    ) {
      sheet.status = 'PRETE_POUR_VALIDATION';
    }

    sheet.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_COST_SHEET', 'COMMERCIAL', sheet.reference, `Mise à jour contribution ${department} sur ${sheet.reference}`, user);
    return sheet;
  }

  recalculateCostSheet(sheet: StoredCostSheet): void {
    const materialsLinesTotal = (sheet.procurementContribution.lines || []).reduce(
      (sum, line) => sum + (Number(line.totalAmount) || (Number(line.quantity) * Number(line.unitPrice)) || 0),
      0
    );
    const rentals = Number(sheet.procurementContribution.equipmentRentalAmount || 0);
    const subcon = Number(sheet.procurementContribution.subcontractingAmount || 0);
    const totalProcurement = materialsLinesTotal + rentals + subcon;

    const laborLinesTotal = (sheet.hrContribution.lines || []).reduce(
      (sum, line) => sum + (Number(line.totalAmount) || (Number(line.quantity) * Number(line.unitPrice)) || 0),
      0
    );
    const teamExpenses = Number(sheet.hrContribution.teamExpensesAmount || 0);
    const totalLabor = laborLinesTotal;

    sheet.totalDirectCost = Math.round(totalProcurement + totalLabor);
    sheet.totalIndirectCost = Math.round(teamExpenses + (sheet.totalDirectCost * 0.05));
    sheet.totalEstimatedCost = Math.round(sheet.totalDirectCost + sheet.totalIndirectCost);

    const targetMarginPct = Math.max(0, Math.min(90, Number(sheet.targetMarginPercent) || 20));
    sheet.targetMarginPercent = targetMarginPct;

    if (!sheet.proposedSellingPrice || sheet.proposedSellingPrice < sheet.totalEstimatedCost) {
      sheet.proposedSellingPrice = targetMarginPct >= 100
        ? Math.round(sheet.totalEstimatedCost * 1.5)
        : Math.round(sheet.totalEstimatedCost / (1 - (targetMarginPct / 100)));
    }

    sheet.estimatedMarginValue = Math.max(0, sheet.proposedSellingPrice - sheet.totalEstimatedCost);

    sheet.marginRateOnCost = sheet.totalEstimatedCost > 0
      ? Number(((sheet.estimatedMarginValue / sheet.totalEstimatedCost) * 100).toFixed(2))
      : 0;

    sheet.markupRate = sheet.proposedSellingPrice > 0
      ? Number(((sheet.estimatedMarginValue / sheet.proposedSellingPrice) * 100).toFixed(2))
      : 0;
  }

  submitCostSheetToDG(id: string, user?: any) {
    const sheet = this.costSheets.find(cs => cs.id === id || cs.reference === id);
    if (!sheet) throw new Error('Fiche de coût introuvable');
    this.recalculateCostSheet(sheet);
    sheet.status = 'EN_ATTENTE_DG';
    sheet.history.push({
      action: 'SUBMIT_TO_DG',
      actor: user?.name || 'Chef de Projet',
      role: user?.role || 'RESPONSABLE_PROJET',
      timestamp: new Date().toISOString(),
      notes: 'Fiche finalisée et soumise pour validation et visa Direction Générale',
    });

    const existingWf = this.workflows.find(w => w.targetCode === sheet.reference || w.reference === sheet.reference);
    if (!existingWf) {
      this.workflows.unshift({
        id: `wf-cs-${Date.now()}`,
        code: `WF-CS-${Date.now().toString().slice(-4)}`,
        reference: sheet.reference,
        title: `Validation Chiffrage : ${sheet.title}`,
        type: 'COST_SHEET' as any,
        status: 'PENDING_DG',
        priority: 'HIGH',
        initiatorName: user?.name || 'Chef de Projets',
        initiatorRole: user?.role || 'RESPONSABLE_PROJET',
        initiatorDepartment: 'OPERATIONS_PROJETS',
        targetId: sheet.id,
        targetCode: sheet.reference,
        clientName: sheet.clientName,
        amountHT: sheet.proposedSellingPrice,
        amountTVA: Math.round(sheet.proposedSellingPrice * 0.19),
        amountTTC: Math.round(sheet.proposedSellingPrice * 1.19),
        justification: `Chiffrage consolidé : Coût total ${sheet.totalEstimatedCost.toLocaleString('fr-DZ')} DA, Marge prévue ${sheet.estimatedMarginValue.toLocaleString('fr-DZ')} DA (${sheet.targetMarginPercent}%).`,
        items: [
          { label: 'Fournitures & Achats', amount: sheet.procurementContribution.equipmentRentalAmount || 0 },
          { label: 'Main d\'œuvre chantiers', amount: sheet.hrContribution.teamExpensesAmount || 0 },
          { label: 'Coûts Directs Totaux', amount: sheet.totalDirectCost },
        ],
        supplierOffers: [],
        submittedAt: new Date().toISOString(),
        history: [
          { action: 'SUBMISSION', actor: user?.name || 'Chef de Projets', role: user?.role || 'RESPONSABLE_PROJET', timestamp: new Date().toISOString() },
        ],
      });
    }

    this.addAuditLog('SUBMIT_COST_SHEET', 'COMMERCIAL', sheet.reference, `Soumission fiche ${sheet.reference} à la DG`, user);
    return sheet;
  }

  arbitrateCostSheet(id: string, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED', notes: string, targetMarginOrUser?: number | any, maybeUser?: any) {
    const sheet = this.costSheets.find(cs => cs.id === id || cs.reference === id);
    if (!sheet) throw new Error('Fiche de coût introuvable');
    const user = (typeof targetMarginOrUser === 'object' && targetMarginOrUser !== null) ? targetMarginOrUser : maybeUser;
    const targetMargin = typeof targetMarginOrUser === 'number' ? targetMarginOrUser : undefined;

    if (user?.role && user.role !== SystemRole.DIRECTEUR_GENERAL && user.role !== SystemRole.ADMINISTRATEUR) {
      throw new Error('Seule la Direction Générale dispose des prérogatives pour arbitrer une fiche de coût.');
    }

    if (targetMargin !== undefined && targetMargin > 0) {
      sheet.targetMarginPercent = targetMargin;
      if (sheet.totalEstimatedCost > 0) {
        sheet.proposedSellingPrice = Math.round(sheet.totalEstimatedCost / (1 - (targetMargin / 100)));
      }
      this.recalculateCostSheet(sheet);
    }

    sheet.dgDecision = decision;
    sheet.dgDecisionNotes = notes;
    sheet.dgDecidedAt = new Date().toISOString();
    sheet.dgDecidedBy = user?.name || 'Amine Benali (Directeur Général)';
    sheet.dgVisaSignature = `VISA-DG-${Date.now().toString().slice(-6)}-VALIDATED`;

    const isApproved = decision === 'APPROVED' || (decision as string) === 'VALIDEE';
    const isRejected = decision === 'REJECTED' || (decision as string) === 'REJETEE';
    sheet.dgDecision = isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'REVISION_REQUESTED';

    if (isApproved) {
      sheet.status = 'VALIDEE';
    } else if (isRejected) {
      sheet.status = 'REJETEE';
    } else {
      sheet.status = 'MODIFICATION_DEMANDEE';
    }

    sheet.history.push({
      action: `DG_${decision}`,
      actor: user?.name || 'Amine Benali',
      role: user?.role || 'DIRECTEUR_GENERAL',
      timestamp: new Date().toISOString(),
      notes: notes || `Arbitrage DG : ${decision}`,
    });

    const wf = this.workflows.find(w => w.targetCode === sheet.reference || w.reference === sheet.reference);
    if (wf) {
      wf.status = decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'REVISION_REQUESTED';
      wf.decidedAt = new Date().toISOString();
      wf.decidedBy = user?.name || 'Amine Benali (DG)';
      wf.decisionNotes = notes;
    }

    this.addAuditLog('ARBITRATE_COST_SHEET', 'COMMERCIAL', sheet.reference, `Arbitrage DG ${decision} sur ${sheet.reference} (${notes})`, user);
    return sheet;
  }

  createCustomerQuoteFromCostSheet(costSheetId: string, overridesOrUser?: any, maybeUser?: any) {
    const sheet = this.costSheets.find(cs => cs.id === costSheetId || cs.reference === costSheetId);
    if (!sheet) throw new Error('Fiche de coût introuvable');
    if (sheet.status !== 'VALIDEE' && sheet.status !== 'SOUMISE_CLIENT' && sheet.status !== 'GAGNEE') {
      throw new Error('Seule une fiche de coût validée par la DG permet l\'émission d\'un Devis Client officiel.');
    }

    const user = overridesOrUser?.role ? overridesOrUser : maybeUser;
    const overrides = (overridesOrUser && !overridesOrUser.role) ? overridesOrUser : {};

    if (sheet.quoteCreated && sheet.quoteNumber) {
      const existing = this.customerQuotes.find(q => q.quoteNumber === sheet.quoteNumber);
      if (existing) return existing;
    }

    const num = String(this.customerQuotes.length + 1).padStart(3, '0');
    const quoteNum = `DEV-${new Date().getFullYear()}-${num}`;
    const vatRate = 19;
    const vatAmount = Math.round(sheet.proposedSellingPrice * (vatRate / 100));
    const totalTTC = sheet.proposedSellingPrice + vatAmount;

    const newQuote: StoredCustomerQuote & { amountHT?: number; amountTTC?: number; tvaAmount?: number } = {
      id: `dev-${Date.now()}`,
      quoteNumber: quoteNum,
      costSheetId: sheet.id,
      costSheetRef: sheet.reference,
      opportunityCode: sheet.opportunityCode,
      clientName: sheet.clientName,
      object: overrides.scopeSummary || sheet.title,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + (overrides.validityDays || 60) * 86400000).toISOString().split('T')[0],
      totalHT: sheet.proposedSellingPrice,
      amountHT: sheet.proposedSellingPrice,
      vatRate,
      vatAmount,
      tvaAmount: vatAmount,
      totalTTC,
      amountTTC: totalTTC,
      paymentTerms: overrides.paymentTerms || sheet.financeContribution.paymentTermsEstimated || 'Acompte 30% commande, situations mensuelles à 45 jours',
      deliveryLeadTime: `${sheet.projectContribution.durationDays || 45} jours calendaires à compter de l'Ordre de Service`,
      warrantyTerms: overrides.notes || '12 mois de garantie contractuelle pièces et main d\'œuvre après réception provisoire',
      status: 'ENVOYE',
      createdAt: new Date().toISOString(),
    };

    this.customerQuotes.unshift(newQuote);

    sheet.quoteCreated = true;
    sheet.quoteId = newQuote.id;
    sheet.quoteNumber = quoteNum;
    sheet.status = 'SOUMISE_CLIENT';
    sheet.history.push({
      action: 'CREATE_QUOTE',
      actor: user?.name || 'Responsable Commercial',
      role: user?.role || 'RESPONSABLE_PROJET',
      timestamp: new Date().toISOString(),
      notes: `Devis officiel ${quoteNum} généré d'un montant de ${totalTTC.toLocaleString('fr-DZ')} DA TTC.`,
    });

    if (sheet.opportunityId) {
      const opp = this.opportunities.find(o => o.id === sheet.opportunityId || o.code === sheet.opportunityCode);
      if (opp) {
        opp.status = 'DEVIS_ENVOYE';
        opp.updatedAt = new Date().toISOString();
      }
    }

    this.addAuditLog('CREATE_QUOTE', 'COMMERCIAL', quoteNum, `Émission Devis client ${quoteNum} pour ${sheet.clientName}`, user);
    return newQuote;
  }

  getCustomerQuotes() {
    return this.customerQuotes;
  }

  getCustomerQuote(id: string) {
    return this.customerQuotes.find(q => q.id === id || q.quoteNumber === id);
  }

  convertCostSheetToProject(costSheetId: string, user?: any) {
    const sheet = this.costSheets.find(cs => cs.id === costSheetId || cs.reference === costSheetId);
    if (!sheet) throw new Error('Fiche de coût introuvable');
    if (sheet.status !== 'VALIDEE' && sheet.status !== 'SOUMISE_CLIENT' && sheet.status !== 'GAGNEE') {
      throw new Error('Seule une fiche de coût validée par la DG peut être convertie en projet.');
    }

    if (sheet.projectCreated && sheet.projectCode) {
      const existing = this.projects.find(p => p.code === sheet.projectCode);
      if (existing) return existing;
    }

    const projNum = String(this.projects.length + 1).padStart(3, '0');
    const projCode = `PRJ-${new Date().getFullYear()}-${projNum}`;

    const newProject: StoredProject = {
      id: `prj-${Date.now()}`,
      code: projCode,
      name: sheet.title,
      clientName: sheet.clientName,
      sector: sheet.sector,
      siteLocation: sheet.siteLocation,
      status: ProjectStatus.PLANNING,
      riskLevel: sheet.financeContribution.financialRiskRating === 'ELEVE' ? 'HIGH' : 'LOW',
      contractAmount: sheet.proposedSellingPrice,
      budgetAmount: sheet.totalEstimatedCost,
      spentBudget: 0,
      committedBudget: 0,
      physicalProgress: 0,
      financialProgress: 0,
      startDate: new Date().toISOString().split('T')[0],
      contractEndDate: new Date(Date.now() + (sheet.projectContribution.durationDays || 60) * 86400000).toISOString().split('T')[0],
      description: sheet.projectContribution.worksDescription || sheet.title,
      managerId: sheet.projectContribution.responsibleId || 'usr-rp-001',
      managerName: sheet.projectContribution.responsibleName || 'Karim Mansouri',
      milestones: [
        {
          id: `mls-${Date.now()}-1`,
          title: 'Ordre de Service (ODS) & Mobilisation Chantier',
          targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
          orderIndex: 1,
        },
        {
          id: `mls-${Date.now()}-2`,
          title: 'Exécution Travaux Tuyauterie & Contrôles CND',
          targetDate: new Date(Date.now() + (sheet.projectContribution.durationDays || 45) * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
          orderIndex: 2,
        },
        {
          id: `mls-${Date.now()}-3`,
          title: 'Épreuves Hydrauliques & Réception Provisoire',
          targetDate: new Date(Date.now() + ((sheet.projectContribution.durationDays || 45) + 10) * 86400000).toISOString().split('T')[0],
          status: 'PENDING',
          orderIndex: 3,
        },
      ],
      serviceOrders: [],
      workSituations: [],
      members: [],
      costEntries: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.unshift(newProject);

    sheet.projectCreated = true;
    sheet.projectCode = projCode;
    sheet.status = 'GAGNEE';
    sheet.history.push({
      action: 'CONVERT_TO_PROJECT',
      actor: user?.name || 'Direction Générale',
      role: user?.role || 'DIRECTEUR_GENERAL',
      timestamp: new Date().toISOString(),
      notes: `Projet ${projCode} généré automatiquement avec un budget initial de ${sheet.totalEstimatedCost.toLocaleString('fr-DZ')} DA.`,
    });

    if (sheet.opportunityId) {
      const opp = this.opportunities.find(o => o.id === sheet.opportunityId || o.code === sheet.opportunityCode);
      if (opp) {
        opp.status = 'GAGNEE';
        opp.updatedAt = new Date().toISOString();
      }
    }

    this.addAuditLog(
      'CONVERT_COST_SHEET',
      'COMMERCIAL',
      sheet.reference,
      `Conversion automatique de la fiche ${sheet.reference} en Projet ${projCode} (${newProject.name})`,
      user
    );

    return newProject;
  }

}

// Singleton global pour le runtime Next.js (persiste pendant le cycle de vie du conteneur serverless)
const globalForStore = globalThis as unknown as { serverStoreInstance?: ServerStore };
export const serverStore = globalForStore.serverStoreInstance ?? new ServerStore();
if (process.env.NODE_ENV !== 'production') globalForStore.serverStoreInstance = serverStore;
