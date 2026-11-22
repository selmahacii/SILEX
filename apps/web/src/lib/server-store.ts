
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

import { SystemRole, DepartmentCode, ProjectStatus, getRequiredPrApprovalLevel, getRequiredSupplierInvoiceApprovalLevel, isSelfApprovalForbidden } from '@silex/shared';

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


export interface StoredProjectTask {
  id: string;
  code: string;
  name: string;
  description: string;
  projectId: string;
  milestoneId?: string;
  assignedToId?: string;
  assignedToName?: string;
  team?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours: number;
  actualHours: number;
  priority: 'FAIBLE' | 'NORMALE' | 'ELEVEE' | 'CRITIQUE';
  status: 'A_FAIRE' | 'EN_COURS' | 'EN_ATTENTE' | 'BLOQUEE' | 'TERMINEE' | 'ANNULEE';
  progress: number;
  dependencies: string[];
  observations?: string;
  isDelayed?: boolean;
}

export interface StoredContractItem {
  id: string;
  itemCode: string;
  designation: string;
  unit: string;
  contractQty: number;
  realizedQty: number;
  validatedQty: number;
  unitPrice: number;
  weightPercentage: number;
  progress: number;
  dateMeasured?: string;
  measuredBy?: string;
  notes?: string;
}

export interface StoredDailyReport {
  id: string;
  reportNumber: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  siteLocation: string;
  date: string;
  weatherConditions: 'ENSOLEILLE' | 'VENTEUX' | 'PLUIE' | 'CHALEUR_EXTREME' | 'AUTRE';
  siteCondition: string;
  preparedById: string;
  preparedByName: string;
  verifiedById?: string;
  verifiedByName?: string;
  status: 'BROUILLON' | 'SOUMIS' | 'EN_REVUE' | 'VALIDE' | 'REJETE';
  manpower: Array<{
    trade: string;
    plannedCount: number;
    presentCount: number;
    hoursWorked: number;
    notes?: string;
  }>;
  activities: Array<{
    id?: string;
    designation: string;
    taskId?: string;
    plannedQty: number;
    realizedQty: number;
    unit: string;
    workersCount: number;
    hoursSpent: number;
    observations: string;
  }>;
  equipmentUsed: Array<{
    equipmentName: string;
    quantity: number;
    hoursUsed: number;
    condition: 'BON' | 'MOYEN' | 'EN_PANNE';
    notes?: string;
  }>;
  materialsConsumed: Array<{
    itemId?: string;
    designation: string;
    quantity: number;
    unit: string;
    stockMovementRef?: string;
    notes?: string;
  }>;
  incidents: Array<{
    type: 'SECURITE' | 'TECHNIQUE' | 'QUALITE' | 'METEO' | 'AUTRE';
    description: string;
    severity: 'MINEURE' | 'MOYENNE' | 'GRAVE';
    actionTaken: string;
    time: string;
    supervisor: string;
  }>;
  generalObservations?: string;
  visaChantier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSituationReport {
  id: string;
  reportNumber: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  periodStart: string;
  periodEnd: string;
  reportDate: string;
  preparedByName: string;
  physicalStatus: {
    plannedProgress: number;
    actualProgress: number;
    completedTasksCount: number;
    delayedTasksCount: number;
    summary: string;
  };
  financialStatus: {
    initialBudget: number;
    revisedBudget: number;
    committedCost: number;
    actualCost: number;
    billedAmount: number;
    forecastAtCompletion: number;
    budgetVariance: number;
  };
  logisticsStatus: {
    criticalProcurementNeeds: string;
    pendingOrdersCount: number;
    stockAlertsCount: number;
  };
  hrStatus: {
    mobilizedHeadcount: number;
    totalHoursWorked: number;
    absentCount: number;
    additionalNeeds: string;
  };
  risksStatus: {
    openConstraintsCount: number;
    criticalRisksSummary: string;
    correctiveActions: any[];
  };
  generalAppraisal: string;
  createdAt: string;
}

export interface StoredProjectConstraint {
  id: string;
  reference: string;
  projectId: string;
  projectCode: string;
  dateDetected: string;
  type: 'TECHNIQUE' | 'APPROVISIONNEMENT' | 'RH' | 'FINANCIER' | 'PLANNING' | 'CONTRACTUEL' | 'QUALITE' | 'SECURITE' | 'METEO';
  description: string;
  impact: string;
  severity: 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'BLOQUANTE';
  assignedToName: string;
  assignedToId?: string;
  correctiveAction: string;
  deadline: string;
  status: 'OUVERTE' | 'EN_COURS' | 'EN_ATTENTE' | 'RESOLUE' | 'CLOTUREE';
  resolvedDate?: string;
  linkedTaskId?: string;
  linkedDailyReportId?: string;
  createdAt: string;
}

export interface StoredHseIncident {
  id: string;
  reference: string;
  projectId: string;
  projectCode: string;
  incidentDate: string;
  type: 'INCIDENT' | 'PRESQUE_ACCIDENT' | 'OBSERVATION_SECURITE' | 'INSPECTION_HSE' | 'NON_CONFORMITE_QUALITE';
  severity: 'MINEURE' | 'SIGNIFICATIVE' | 'MAJEURE' | 'CRITIQUE';
  locationZone: string;
  description: string;
  immediateAction: string;
  correctiveAction: string;
  responsibleName: string;
  deadline: string;
  status: 'OUVERT' | 'EN_TRAITEMENT' | 'RESOLU' | 'CLOTURE';
  closedDate?: string;
  createdAt: string;
}

export interface StoredProject {
  id: string;
  code: string;
  name: string;
  clientName: string;
  sector: string;
  siteLocation: string;
  wilaya?: string;
  pole?: string;
  contractType?: string;
  status: ProjectStatus | string;
  riskLevel: string;
  contractAmount: number;
  budgetAmount: number;
  revisedBudget?: number;
  spentBudget: number;
  committedBudget: number;
  actualCost?: number;
  committedCost?: number;
  eacCost?: number;
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
  contractReference?: string;
  clientPoNumber?: string;
  costSheetId?: string;
  costSheetRef?: string;
  tvaRate?: number;
  retentionRate?: number;
  contractItems: StoredContractItem[];
  tasks: StoredProjectTask[];
  dailyReports: StoredDailyReport[];
  situationReports: StoredSituationReport[];
  constraints: StoredProjectConstraint[];
  hseIncidents: StoredHseIncident[];
  allocations: any[];
  purchaseOrders: any[];
  nonConformities: any[];
  timesheets?: StoredProjectTimesheet[];
  pvrp?: {
    status: 'NON_EMIS' | 'RESERVES_EN_COURS' | 'VALIDE_SANS_RESERVE' | 'VALIDE_RESERVES_LEVEES';
    pvDate: string;
    signedByClient: boolean;
    clientSignatory?: string;
    reservesCount: number;
    reservesLifted: boolean;
    notes?: string;
  };
  pvrd?: {
    status: 'NON_EMIS' | 'EN_GARANTIE_12M' | 'VALIDE_DEFINITIF';
    pvDate?: string;
    warrantyEndDate?: string;
    signedByClient: boolean;
    guaranteeReleased: boolean;
    retentionRefundedDA: number;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoredProjectTimesheet {
  id: string;
  projectCode: string;
  date: string;
  workerName: string;
  corpsEtat: 'SOUDEUR_ASME' | 'TUYAUTEUR_ISO' | 'MONTEUR_ECHAFAUDEUR' | 'CHEF_EQUIPE' | 'CONTROLEUR_CND' | 'MANOEUVRE';
  workerQualification: string;
  normalHours: number;
  overtimeHours: number;
  weatherHours: number;
  hourlyRate: number;
  totalCostDA: number;
  taskRef?: string;
  productivityRatio?: number;
  status: 'VALIDE' | 'SOUMIS' | 'VISE_CHEF';
}

export interface StoredWorkflow {
  id: string;
  code: string;
  reference: string;
  title: string;
  type: 'PURCHASE_REQUEST' | 'WORK_SITUATION' | 'EXPENSE_REPORT' | 'CONTRACT_CHANGE' | 'COST_SHEET';
  status: 'PENDING' | 'PENDING_DG' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'SUBMITTED' | 'PRETE_POUR_VALIDATION';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  initiatorId?: string;
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
  requiredApprovalRole?: string;
  requiredApprovalLevel?: string;
  budgetExceeded?: boolean;
  stockAvailableWarning?: boolean;
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
  status:
    | 'NOUVELLE'
    | 'QUALIFIEE'
    | 'VISITE_TECHNIQUE'
    | 'CHIFFRAGE'
    | 'VALIDATION_INTERNE'
    | 'OFFRE_SOUMISE'
    | 'NEGOCIATION'
    | 'GAGNEE'
    | 'PERDUE'
    | 'ANNULEE'
    | 'BROUILLON'
    | 'EN_ETUDE'
    | 'DEVIS_ENVOYE';
  winProbability?: number;
  notes?: string;
  assignedCommercialId: string;
  assignedCommercialName: string;
  costSheetId?: string;
  lossReason?: string;
  cancellationReason?: string;
  siteVisitDate?: string;
  technicalReportNotes?: string;
  stageHistory?: Array<{
    fromStage: string;
    toStage: string;
    changedAt: string;
    changedBy: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCostSheetRevisionSnapshot {
  version: number;
  createdAt: string;
  author: string;
  role: string;
  reason: string;
  totalDirectCost: number;
  totalIndirectCost: number;
  totalEstimatedCost: number;
  proposedSellingPrice: number;
  estimatedMarginValue: number;
  targetMarginPercent: number;
  marginRateOnCost: number;
  markupRate: number;
  status: string;
  projectContribution: any;
  procurementContribution: any;
  hrContribution: any;
  financeContribution: any;
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
    | 'A_REVISER'
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
  decision?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  decisionNotes?: string;
  decisionDate?: string;

  quoteCreated: boolean;
  quoteId?: string;
  quoteNumber?: string;
  projectCreated: boolean;
  projectCode?: string;

  revisions?: StoredCostSheetRevisionSnapshot[];

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

export interface StoredClientSatisfactionSurvey {
  id: string;
  reference: string; // SAT-YYYY-NNN
  clientName: string;
  projectCode?: string;
  projectName?: string;
  contactName: string;
  contactEmail?: string;
  surveyDate: string;
  qualityScore: number;       // 1-10
  scheduleScore: number;      // 1-10
  hseScore: number;           // 1-10
  responsivenessScore: number;// 1-10
  recommendationScore: number;// 1-10
  overallScorePercent: number;// Moyenne / 10 * 100
  overallScore?: number;
  appreciation: 'EXCELLENT' | 'SATISFAISANT' | 'MOYEN' | 'A_AMELIORER';
  comments?: string;
  clientSignatory?: string;
  recordedBy?: string;
  createdAt: string;
}


// ============================================================================
// PHASE 4: TYPES ET INTERFACES ACHATS, APPROVISIONNEMENT & STOCKS
// ============================================================================

export interface StoredNeedRequest {
  id: string;
  reference: string;          // ex: EB-2026-001
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  siteLocation?: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  department: string;
  title: string;
  justification: string;
  category: 'TUYAUTERIE' | 'SOUDAGE' | 'MECANIQUE' | 'HVAC' | 'EPI_SECURITE' | 'OUTILLAGE' | 'LOCATION_ENGIN' | 'SOUS_TRAITANCE';
  priority: 'NORMALE' | 'URGENTE' | 'CRITIQUE';
  desiredDate: string;
  status: 'BROUILLON' | 'SOUMISE' | 'VALIDEE' | 'CONVERTIE_EN_DA' | 'REJETEE';
  items: Array<{
    id: string;
    itemId?: string;
    itemCode?: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice?: number;
    resourceType: 'CONSOMMABLE' | 'ARTICLE_STOCKABLE' | 'EQUIPEMENT' | 'LOCATION' | 'SOUS_TRAITANCE';
    technicalSpecs?: string;
  }>;
  convertedPrId?: string;
  convertedPrCode?: string;
  validatorName?: string;
  validationDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredRfqOffer {
  id: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  unitPriceHT: number;
  totalPriceHT: number;
  deliveryLeadTimeDays: number;
  paymentTerms: string;
  warrantyMonths: number;
  certificationsProvided: {
    ccpu31: boolean;
    cndReport: boolean;
    coc: boolean;
    atex: boolean;
  };
  technicalComplianceRating: number; // 0 to 100
  qualityRating: number;             // 0 to 100
  notes?: string;
  submittedAt: string;
  isEliminated?: boolean;
  eliminationReason?: string;
  tcoScore?: number;
}

export interface StoredRfqConsultation {
  id: string;
  reference: string;          // ex: RFQ-2026-001
  title: string;
  purchaseRequestId: string;
  purchaseRequestCode: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  issueDate: string;
  closingDate: string;
  status: 'OUVERTE' | 'OFFRES_RECUES' | 'EVALUEE' | 'CLOTUREE';
  invitedSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    contactEmail?: string;
    status: 'INVITE' | 'REPONDU' | 'DECLINE';
  }>;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    technicalRequirements?: string;
  }>;
  offers: StoredRfqOffer[];
  selectedSupplierId?: string;
  selectedSupplierName?: string;
  selectionJustification?: string;
  selectedAt?: string;
  createdAt: string;
}

export interface TcoCriteriaConfig {
  costWeight: number;            // e.g. 35%
  technicalWeight: number;       // e.g. 25%
  leadTimeWeight: number;        // e.g. 20%
  qualityWeight: number;         // e.g. 10%
  warrantyWeight: number;        // e.g. 10%
  mandatoryCcpuRequired: boolean;
}

export interface StoredTcoComparison {
  id: string;
  rfqId: string;
  rfqReference: string;
  purchaseRequestCode: string;
  projectName?: string;
  evaluationDate: string;
  evaluatedByName: string;
  criteriaConfig: TcoCriteriaConfig;
  supplierScores: Array<{
    supplierId: string;
    supplierName: string;
    totalAmountHT: number;
    deliveryDays: number;
    costScore: number;
    leadTimeScore: number;
    technicalScore: number;
    qualityScore: number;
    warrantyScore: number;
    overallTcoScore: number;
    rank: number;
    isEliminated: boolean;
    eliminationReason?: string;
  }>;
  selectedSupplierId?: string;
  selectedSupplierName?: string;
  decisionJustification?: string;
  status: 'EN_COURS' | 'VALIDE_ACHATS' | 'APPROUVE_DG';
  dgVisaSignature?: string;
  dgApprovedAt?: string;
}

export interface StoredSupplierContract {
  id: string;
  contractNumber: string;     // ex: CTR-FOU-2026-001
  supplierId: string;
  supplierName: string;
  title: string;
  contractType: 'FOURNITURE_CADRE' | 'LOCATION_ENGINS' | 'SOUS_TRAITANCE_CND' | 'MAINTENANCE_TIERCE';
  projectId?: string;
  projectCode?: string;
  totalAmountHT: number;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  retentionGuaranteePercent?: number;
  penaltiesTerms?: string;
  status: 'ACTIF' | 'EN_REVISION' | 'EXPIRE' | 'RESILIE';
  signedBySilex: string;
  signedBySupplier: string;
  documents: Array<{ name: string; url?: string; uploadedAt: string }>;
  createdAt: string;
}

export interface StoredGoodsReceipt {
  id: string;
  receiptNumber: string;      // ex: BR-2026-001
  purchaseOrderId: string;
  purchaseOrderCode: string;
  supplierId: string;
  supplierName: string;
  deliveryNoteNumber: string; // Numéro Bon de Livraison (BL) Fournisseur
  receiptDate: string;
  warehouseId: string;
  warehouseName: string;
  receiverName: string;
  projectId?: string;
  projectCode?: string;
  status: 'PARTIEL' | 'COMPLET' | 'AVEC_RESERVES' | 'CONFORME' | 'CONFORME_AVEC_RESERVES' | 'REJETE';
  qualityInspection: {
    inspectorName: string;
    inspectionDate: string;
    overallStatus: 'CONFORME' | 'NON_CONFORME' | 'ACCEPTE_SOUS_RESERVES' | 'REFUSE';
    ccpuVerified: boolean;
    cndReportAttached: boolean;
    observations?: string;
  };
  lines: Array<{
    id: string;
    itemId?: string;
    itemCode?: string;
    description: string;
    orderedQuantity: number;
    previouslyReceivedQuantity: number;
    deliveredQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    remainingQuantity: number;
    rejectionReason?: string;
    unit: string;
    unitPriceHT: number;
    heatNumber?: string;
    batchNumber?: string;
    ccpuCertificateRef?: string;
    storageLocation?: string;
  }>;
  totalAcceptedAmountHT: number;
  warehouseLocation?: string;
  isQuarantined?: boolean;
  quarantineWarehouseLocation?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface StoredBonDeSortie {
  id: string;
  bonNumber: string;          // ex: BSM-2026-0001
  date: string;
  warehouseId: string;
  warehouseName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  siteLocation: string;
  wbsCategory: string;
  recipientName: string;
  driverName?: string;
  vehicleMatricule?: string;
  items: Array<{
    itemId: string;
    code: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    heatNumber?: string;
    batchNumber?: string;
  }>;
  totalAmountDA: number;
  status: 'EMIS' | 'EN_TRANSIT' | 'RECEPTIONNE_CONFORME' | 'RESERVES_SIGNALEES' | 'ANNULE';
  createdAt: string;
}

export interface StoredPhysicalInventory {
  id: string;
  inventoryNumber: string;    // ex: INV-2026-001
  warehouseId: string;
  warehouseName: string;
  inventoryDate: string;
  responsibleName: string;
  status: 'EN_COMPTAGE' | 'EN_CONTROLE' | 'EN_VALIDATION_DG' | 'VALIDE' | 'CLOTURE';
  itemsCounted: Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    unit: string;
    unitCostDA: number;
    theoreticalStock: number;
    physicalCount: number;
    discrepancyQuantity: number; // physical - theoretical
    discrepancyValueDA: number;  // discrepancyQuantity * unitCostDA
    discrepancyReason?: string;
  }>;
  totalTheoreticalValueDA: number;
  totalPhysicalValueDA: number;
  totalVarianceValueDA: number;
  dgApprovedAt?: string;
  dgApprovedBy?: string;
  adjustmentMovementReferences?: string[];
  createdAt: string;
}

export interface StoredSupplierEvaluation {
  id: string;
  evaluationNumber: string;   // ex: EVAL-2026-001
  supplierId: string;
  supplierName: string;
  period: string;             // ex: T3-2026 ou Annuelle 2026
  evaluatorName: string;
  evaluatorRole: string;
  evaluationDate: string;
  scores: {
    deliveryPunctuality: number;  // /30 (Respect des délais)
    qualityCompliance: number;    // /30 (Qualité & CCPU 3.1)
    quantityAccuracy: number;     // /15 (Conformité des quantités)
    responsiveness: number;       // /15 (Réactivité & Support)
    commercialPricing: number;    // /10 (Compétitivité tarifaire)
  };
  totalScore: number;             // /100
  starRating: number;             // 1 to 5 stars
  classification: 'STRATEGIQUE_A' | 'QUALIFIE_B' | 'SOUS_VIGILANCE_C' | 'SUSPENDU_D';
  comments: string;
  recommendedAction: 'MAINTIEN' | 'DEVELOPPEMENT' | 'AUDIT_REQUIS' | 'SUSPENSION';
  createdAt: string;
}

// ============================================================================
// PHASE 5 : MODULE 04 RESSOURCES HUMAINES & MOBILITÉ INDUSTRIELLE
// ============================================================================

export type EmployeeIndustrialStatus = 'ACTIF' | 'EN_MISSION' | 'EN_CONGE' | 'EN_FORMATION' | 'INACTIF' | 'SORTI';

export interface StoredIndustrialCertification {
  id: string;
  employeeId: string;
  employeeMatricule: string;
  employeeName: string;
  type: 'QUALIFICATION_SOUDAGE_CQS' | 'HABILITATION_ELECTRIQUE' | 'SECURITE_ESPACE_CONFINE' | 'TRAVAIL_EN_HAUTEUR' | 'VISITE_MEDICALE_APTITUDE' | 'FORMATION_CONTINUE';
  certName: string;
  certificateNumber: string;
  issuingBody: string; // Ex: Bureau Veritas, TÜV, Apave, Médecine du Travail
  issueDate: string;
  expiryDate: string;
  status: 'VALIDE' | 'EN_ATTENTE_VERIFICATION' | 'REJETE' | 'EXPIRE';
  // Spécifications de soudage (CQS)
  weldingProcess?: string; // Ex: 141 (TIG), 111 (SMAW / ARC), 135 (MAG)
  weldingStandard?: string; // Ex: ASME IX, API 1104, EN ISO 9606-1
  weldingPosition?: string; // Ex: 6G, 1G-4G, H-L045
  baseMaterial?: string; // Ex: P1 (Acier Carbone A106 Gr.B), P8 (Inox 316L)
  dimensionRange?: string; // Ex: Tubes OD 2" à 12", ép. 3 à 25 mm
  // Contrôle & Audit documentaire
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  attachmentUrl?: string;
}

export interface StoredEmploymentContract {
  id: string;
  reference: string; // CTR-RH-YYYY-NNN
  employeeId: string;
  employeeMatricule: string;
  employeeName: string;
  contractType: 'CDI' | 'CDD_CHANTIER' | 'STAGIAIRE' | 'FIDELITE';
  title: string;
  startDate: string;
  endDate?: string;
  trialPeriodMonths: number;
  monthlyBaseSalaryDA: number;
  dailyAllowanceDA?: number;
  loyaltyBonusDA?: number;
  projectCode?: string;
  siteLocation?: string;
  specialClauses?: string;
  status: 'ACTIF' | 'ECHU' | 'RESILIE';
  signedByEmployee: boolean;
  signedByDG: boolean;
  createdAt: string;
}

export interface StoredSocialDeclaration {
  id: string;
  reference: string; // DEC-CNAS-YYYY-NNN
  type: 'ATS' | 'ACCIDENT_TRAVAIL' | 'BORDEREAU_CNAS' | 'DAS_ANNUELLE';
  period: string; // ex: 2026-T1, 2026-M11
  employeeId?: string;
  employeeMatricule?: string;
  employeeName?: string;
  declarationDate: string;
  grossBaseDA?: number;
  employeeContributionDA?: number; // 9%
  employerContributionDA?: number; // 26%
  totalContributionDA?: number; // 35%
  accidentDate?: string;
  accidentTime?: string;
  accidentSite?: string;
  injuryDescription?: string;
  witnesses?: string;
  workStoppageDays?: number;
  status: 'BROUILLON' | 'TRANSMIS' | 'VALIDE_CNAS';
  notes?: string;
  createdAt: string;
}

export interface StoredLeaveRequest {
  id: string;
  reference: string; // LV-YYYY-NNN
  employeeId: string;
  employeeMatricule: string;
  employeeName: string;
  title: string;
  leaveType: 'CONGE_PAYE' | 'RECUPERATION_ROTATION_SUD' | 'MALADIE' | 'EVENEMENT_FAMILIAL' | 'SANS_SOLDE';
  startDate: string;
  endDate: string;
  durationDays: number;
  reason?: string;
  status: 'SOUMIS' | 'VISE_RH' | 'ACCORDE_DG' | 'REFUSE' | 'ANNULE';
  submittedAt: string;
  rhVisaSignature?: string;
  rhVisaDate?: string;
  rhReviewerName?: string;
  dgVisaSignature?: string;
  dgVisaDate?: string;
  refusalReason?: string;
  certificateNumber?: string; // Titre de congé officiel
}

export interface StoredMissionOrder {
  id: string;
  missionNumber: string; // MIS-YYYY-NNN
  employeeId: string;
  employeeMatricule: string;
  employeeName: string;
  title: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  destinationSite: string; // Ex: Zone Industrielle Skikda RA1K, Base Hassi Messaoud
  purpose: string; // Ex: Supervision épreuves hydrauliques 45 bars
  startDate: string;
  endDate: string;
  durationDays: number;
  transportMode: 'VEHICULE_SERVICE' | 'AVION' | 'TRANSPORT_COMMUN' | 'VEHICULE_CLIENT';
  vehiclePlate?: string;
  advanceAmountDA: number;
  dailyAllowanceDA: number;
  totalEstimatedCostDA: number;
  status: 'BROUILLON' | 'VISE_RH' | 'APPROUVE_DG' | 'CLOTURE';
  dgVisaSignature?: string;
  dgVisaDate?: string;
  createdAt: string;
}

export interface StoredRecruitmentRequest {
  id: string;
  reference: string; // REC-YYYY-NNN
  projectId: string;
  projectCode: string;
  projectName: string;
  requestedBy: string;
  requestedRole: string; // Ex: Soudeur Haute Pression 6G Radio, Tuyauteur Industriel ISO
  headcountNeeded: number;
  contractType: 'CHANTIER' | 'CDD' | 'INTERIM';
  requiredQualifications: string[];
  startDate: string;
  durationMonths: number;
  justification: string;
  priority: 'NORMALE' | 'URGENTE' | 'CRITIQUE';
  status: 'SOUMIS' | 'APPROUVE_DG' | 'EN_RECRUTEMENT' | 'POURVU' | 'REJETE';
  dgApprovalDate?: string;
  candidatesCount: number;
  createdAt: string;
}

export interface StoredRotationCycle {
  id: string;
  rotationCode: string; // ROT-HMD-4X4
  siteName: string; // Base de Vie SILEX Hassi Messaoud
  type: '4X4' | '6X2' | '3X3';
  workDays: number;
  restDays: number;
  cycleStartDate: string;
  assignedEmployeeIds: string[];
  status: 'ACTIF' | 'SUSPENDU';
  notes: string;
}

export interface StoredSalaryRubricConfig {
  code: string; // R100, R200, etc.
  label: string;
  type: 'GAIN' | 'RETENUE';
  isVariable: boolean;
  baseFormula: string;
  isCnasSubject: boolean;
  isIrgSubject: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  regulatoryReference: string;
  status: 'VALIDEE' | 'EN_REVISION';
}

export interface StoredPayslipDemo {
  id: string;
  slipNumber: string; // BS-DEMO-2026-NNN
  employeeId: string;
  employeeMatricule: string;
  employeeName: string;
  title: string;
  department: string;
  periodMonth: number;
  periodYear: number;
  workedDays: number;
  workedHours: number;
  overtimeHours50: number;
  overtimeHours100: number;
  // Rubriques
  baseSalaryDA: number;
  iepAmountDA: number;
  siteBasketAmountDA: number;
  transportAmountDA: number;
  nuisanceAmountDA: number;
  zoneSouthAllowanceDA: number;
  overtimeAmountDA: number;
  grossSalaryDA: number;
  cnasDeduction9Pct: number;
  // Décomposition Cotisations Sociales & Patronales
  cnasBaseDA?: number;
  cnasEmployerBreakdown?: {
    assurancesSocialesEmployer26Pct: number; // 26%
    maladieMaterniteInvaliditeDeces: number; // 12.5%
    vieillesseRetraite: number;              // 10.0%
    accidentsTravailMaladiesProf: number;    // 1.25%
    assuranceChomage: number;                // 1.0%
    retraiteAnticipee: number;               // 0.25%
    oeuvresSocialesFOS: number;              // 1.0% (Contribution Fonds Œuvres Sociales)
    totalEmployerContribution: number;       // 26% (CNAS) + 1% (FOS) = 27%
  };
  cnasEmployeeBreakdown?: {
    assurancesSocialesEmployee9Pct: number; // 9%
    maladieMaterniteInvaliditeDeces: number; // 1.5%
    vieillesseRetraite: number;              // 6.75%
    assuranceChomage: number;                // 0.5%
    retraiteAnticipee: number;               // 0.25%
  };
  taxableSalaryDA: number;
  rawIrg?: number;
  firstIrgRebate?: number;
  secondIrgRebate?: number;
  irgTaxAmountDA: number;
  netPayableDA: number;
  isDemoSimulation: true;
  calculatedAt: string;
}



export interface StoredFinancialAccount {
  id: string;
  code: string; // CPT-BEA-01, CPT-BEA-01
  name: string;
  type: 'BANQUE_COURANT' | 'BANQUE_INVESTISSEMENT' | 'CAISSE_SIEGE' | 'CAISSE_CHANTIER';
  bankName: string;
  ribNumber: string;
  currency: 'DZD' | 'EUR' | 'USD';
  initialBalance: number;
  currentBalance: number;
  isDemoAccount: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CashTransactionType =
  | 'ENCAISSEMENT_CLIENT'
  | 'DECAISSEMENT_FOURNISSEUR'
  | 'PAIEMENT_SALAIRES'
  | 'PAIEMENT_CHARGES_SOCIALES'
  | 'VIREMENT_INTERNE_EMIS'
  | 'VIREMENT_INTERNE_RECU'
  | 'LIBERATION_RETENUE_GARANTIE'
  | 'FRAIS_BANCAIRES'
  | 'AVANCE_CHANTIER';

export interface StoredCashTransaction {
  id: string;
  transactionNumber: string; // FLX-2026-NNN
  transactionDate: string;
  type: CashTransactionType;
  amount: number;
  accountId: string;
  accountCode: string;
  counterpartAccountId?: string;
  counterpartAccountCode?: string;
  customerInvoiceId?: string;
  customerInvoiceNumber?: string;
  supplierInvoiceId?: string;
  supplierInvoiceNumber?: string;
  projectId?: string;
  projectCode?: string;
  referenceDocument?: string;
  paymentMethod: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'LETTRE_DE_CHANGE';
  category: string;
  notes?: string;
  performedById: string;
  performedByName: string;
  status: 'VALIDE' | 'ANNULE';
  idempotencyKey?: string;
  isDemoTransaction?: boolean;
  createdAt: string;
}

export type CustomerInvoiceStatus = 'BROUILLON' | 'EMISE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'LITIGE' | 'ANNULEE';

export interface StoredCustomerInvoice {
  id: string;
  invoiceNumber: string; // FAC-2026-NNN
  clientId: string;
  clientName: string;
  projectId: string;
  projectCode: string;
  projectName?: string;
  workSituationId?: string;
  workSituationNumber?: string;
  commercialQuoteId?: string;
  issueDate: string;
  dueDate: string;
  amountHT: number;
  vatRate: number; // e.g. 19, 9, 0
  vatAmount: number;
  retentionRate: number; // e.g. 5, 10, 0
  retentionAmount: number;
  amountTTC: number; // (amountHT - retentionAmount) + vatAmount
  netReceivableAmount: number; // Montant exigible immédiat = amountTTC
  paidAmount: number;
  remainingAmount: number;
  warrantyHeldAmount: number; // Retenue de garantie (exigible à PVRD)
  warrantyReleasedAmount: number;
  status: CustomerInvoiceStatus;
  paymentTerms: string;
  notes?: string;
  isDemoInvoice?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SupplierInvoiceMatchingStatus = 'CONFORME_3_WAY' | 'ECART_PRIX' | 'ECART_QUANTITE' | 'SANS_RECEPTION' | 'NON_VERIFIE';
export type SupplierInvoiceStatus = 'A_APPROUVER' | 'APPROUVEE' | 'EN_COURS_DE_PAIEMENT' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'REJETEE';

export interface StoredSupplierInvoice {
  id: string;
  internalReference: string; // FAC-FOU-2026-NNN
  invoiceNumber: string; // Numéro facture du fournisseur externe
  supplierId: string;
  supplierName: string;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  goodsReceiptId?: string;
  goodsReceiptCode?: string;
  goodsReceiptIds?: string[]; // Multi-BR support
  projectId?: string;
  projectCode?: string;
  invoiceDate: string;
  dueDate: string;
  amountHT: number;
  vatRate: number;
  vatAmount: number;
  amountTTC: number;
  paidAmount: number;
  remainingAmount: number;
  invoicedQuantityTotal?: number;
  remainingQuantityToInvoice?: number;
  matchingStatus: SupplierInvoiceMatchingStatus;
  matchingDetails?: {
    poAmountHT: number;
    grTotalHT: number;
    priceVarianceDA: number;
    qtyVariancePct: number;
    notes?: string;
  };
  approvalThresholdStatus?: 'AUTO_APPROVED' | 'PENDING_PM' | 'PENDING_DG' | 'APPROVED';
  status: SupplierInvoiceStatus;
  paymentTerms: string;
  notes?: string;
  isDemoInvoice?: boolean;
  lineMatchings?: StoredInvoiceLineMatching[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredInvoiceLineMatching {
  id: string;
  supplierInvoiceId: string;
  supplierInvoiceLineId?: string;
  purchaseOrderId: string;
  purchaseOrderLineId: string;
  goodsReceiptId: string;
  goodsReceiptLineId: string;
  quantityMatched: number;
  unitPriceMatched: number;
  amountMatchedHT: number;
  priceVarianceDA: number;
  status: 'CONFORME' | 'DEROGATION' | 'EN_ATTENTE' | 'ANNULE';
  derogationReason?: string;
  derogationApprovedById?: string;
  derogationApprovedByName?: string;
  matchedAt: string;
  matchedById: string;
  matchedByName: string;
  notes?: string;
}

export interface StoredFinancialConfig {
  defaultVatRate: number; // 19%
  defaultRetentionRate: number; // 5%
  defaultWarrantyDurationMonths: number; // 12 mois
  pmApprovalThresholdDA: number; // 500,000 DA
  dgApprovalThresholdDA: number; // 2,000,000 DA
  allowedPaymentTermsDays: number[]; // [30, 45, 60, 90]
  vatRegimes: Array<{ code: string; label: string; rate: number }>;
  priceToleranceAbsoluteDA: number; // Ex: 100 DA
  priceToleranceRelativePct: number; // Ex: 1%
  qtyTolerancePct: number; // Ex: 0%
  allowAutoApprovalOnMatch: boolean;
}

// ============================================================================
// PHASE G : QUALITÉ, QHSE, GED TECHNIQUE & WELD BOOK UNITAIRE (ASME IX / ISO 9606)
// ============================================================================

export interface StoredWeldJoint {
  id: string;
  jointNumber: string; // Ex: J-01-VAP-HP, J-05-VAPEUR-HP
  projectId?: string;
  projectCode: string;
  projectName: string;
  lineIso: string; // Ex: ISO-316L-DN150-SCH80, ISO-A106-DN200-SCH80
  spoolId?: string; // Ex: SPL-01, SPL-04
  diameterNominal?: string; // Ex: DN150 (6"), DN200 (8")
  thicknessMm?: number; // Ex: 7.11, 12.7
  material: string; // Ex: Inox 316L (Nuance Z2CND17-12), Acier Carbone ASTM A106 Gr.B
  heatNumberPipe?: string; // Ex: HEAT-A106-99412
  heatNumberFitting?: string; // Ex: HEAT-ELB-A234-8831
  welderName: string; // Ex: Amar Bouzid
  welderStamp: string; // Ex: S-02
  welderCqsRef?: string; // Ex: CQS-BV-2026-088
  weldingProcess: string; // Ex: 141 (TIG) racine + 111 (SMAW / ARC) remplissage
  dmosRef: string; // Ex: DMOS-01-ASME-IX
  weldDate: string; // Ex: 2026-02-14
  visualInspection: {
    status: 'CONFORME' | 'NON_CONFORME';
    inspectorName: string;
    date: string;
    notes?: string;
  };
  cndInspection: {
    type: '100% Ressuage PT + 100% Radio RT' | '100% Ressuage (PT)' | 'Contrôle Ultrasons (UT) + Ressuage' | 'Examen Visuel VT + Épreuve Hydro' | string;
    requiredRatePercent: number; // Ex: 100% ou 10%
    status: 'CONFORME' | 'A_REPARER' | 'COUPE' | 'EN_ATTENTE_CND';
    cndReportRef?: string; // Ex: RAP-RT-2026-018
    filmRef?: string; // Ex: FLM-RT-8841
    controlDate?: string;
    controllingBody: string; // Ex: Bureau Veritas Algérie (COFREND II)
    defectType?: string; // Ex: Inclusion de laitier, Caniveau, Soufflure
  };
  repairHistory?: Array<{
    repairIndex: number;
    repairDate: string;
    repairWelderStamp: string;
    repairDmosRef: string;
    postRepairCndStatus: 'CONFORME' | 'NON_CONFORME';
    postRepairReportRef?: string;
    notes?: string;
  }>;
  status: 'CONFORME' | 'EN_ATTENTE_CND' | 'A_REPARER' | 'REPARE_CONFORME' | 'REJETE' | 'LIBERE_EPREUVE';
  createdAt: string;
}

export interface StoredNonConformityAction {
  id: string;
  description: string;
  responsible: string;
  targetDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
}

export interface StoredNonConformity {
  id: string;
  ncNumber: string; // Ex: FNC-2026-001
  code: string;     // Alias pour compatibilité
  title: string;
  description: string;
  severity: 'MINEURE' | 'MAJEURE' | 'CRITIQUE';
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CORRECTIVE_ACTION_PENDING' | 'RESOLVED' | 'CLOSED';
  detectedBy: string;
  detectedDate: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  project?: { id: string; code: string; name: string };
  weldJointId?: string;
  weldJointNumber?: string;
  rootCause?: string; // Analyse 5M / Ishikawa, Explication métallurgique
  resolutionNotes?: string;
  closeType?: 'VISA_CND' | 'DEROGATION_CLIENT' | 'SCRAP_REBUT' | 'INVESTIGATION' | string;
  closedBy?: string;
  closedDate?: string;
  actions: StoredNonConformityAction[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredQualityDocRevision {
  revision: string;
  changeNotes: string;
  author: string;
  date: string;
}

export interface StoredQualityDocument {
  id: string;
  docNumber: string; // Ex: DOC-2026-001, MOS-WPS-2026-614
  title: string;
  category: 'PROCEDURE' | 'DMOS' | 'QMOS' | 'PAQ' | 'CND' | string;
  author: string;
  version: string;
  status: 'VALIDE' | 'EN_REVISION' | 'OBSOLETE' | 'APPROUVE';
  revisions: StoredQualityDocRevision[];
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class ServerStore {
  private users: ServerUser[] = [];
  private projects: StoredProject[] = [];
  public workflows: StoredWorkflow[] = [];
  private opportunities: StoredOpportunity[] = [];
  private costSheets: StoredCostSheet[] = [];
  private customerQuotes: StoredCustomerQuote[] = [];
  private clientSatisfactionSurveys: StoredClientSatisfactionSurvey[] = [];
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
  private nonConformities: StoredNonConformity[] = [];
  private qualityDocuments: StoredQualityDocument[] = [];
  private weldJoints: StoredWeldJoint[] = [];
  public financePayments: any[] = [];
  private auditLogs: any[] = [];
  private rolePermissions: Record<string, any> = {};

  // Données Phase 6 : Finance & Trésorerie Démo Isolée & Interconnexion
  private financialAccounts: StoredFinancialAccount[] = [];
  private cashTransactions: StoredCashTransaction[] = [];
  private customerInvoices: StoredCustomerInvoice[] = [];
  private supplierInvoices: StoredSupplierInvoice[] = [];
  private invoiceLineMatchings: StoredInvoiceLineMatching[] = [];
  private financialConfig: StoredFinancialConfig = {
    defaultVatRate: 19,
    defaultRetentionRate: 5,
    defaultWarrantyDurationMonths: 12,
    pmApprovalThresholdDA: 500000,
    dgApprovalThresholdDA: 2000000,
    allowedPaymentTermsDays: [30, 45, 60, 90],
    vatRegimes: [
      { code: 'NORMAL', label: 'Régime Normal Standard (19%)', rate: 19 },
      { code: 'REDUIT', label: 'Taux Réduit (9%)', rate: 9 },
      { code: 'EXONERE_ANDI', label: 'Exonération Conventionnelle ANDI / ANSEJ (0%)', rate: 0 },
    ],
    priceToleranceAbsoluteDA: 100,
    priceToleranceRelativePct: 0.5,
    qtyTolerancePct: 0,
    allowAutoApprovalOnMatch: true,
  };

  // Données Phase 5 : RH Industrielles, Compétences CQS, Mobilité & Paie
  private industrialCertifications: StoredIndustrialCertification[] = [];
  private leaveRequests: StoredLeaveRequest[] = [];
  private missionOrders: StoredMissionOrder[] = [];
  private recruitmentRequests: StoredRecruitmentRequest[] = [];
  private employmentContracts: StoredEmploymentContract[] = [];
  private socialDeclarations: StoredSocialDeclaration[] = [];
  private rotationCycles: StoredRotationCycle[] = [];
  private salaryRubrics: StoredSalaryRubricConfig[] = [];

  // Données Phase 4 : Achats, RFQ, TCO, Stocks & Inventaires
  private needRequests: StoredNeedRequest[] = [];
  private rfqConsultations: StoredRfqConsultation[] = [];
  private tcoComparisons: StoredTcoComparison[] = [];
  private supplierContracts: StoredSupplierContract[] = [];
  private goodsReceipts: StoredGoodsReceipt[] = [];
  private bonsDeSortie: StoredBonDeSortie[] = [];
  private physicalInventories: StoredPhysicalInventory[] = [];
  private supplierEvaluations: StoredSupplierEvaluation[] = [];
  private tcoConfig: TcoCriteriaConfig = {
    costWeight: 35,
    technicalWeight: 25,
    leadTimeWeight: 20,
    qualityWeight: 10,
    warrantyWeight: 10,
    mandatoryCcpuRequired: true,
  };
  private approvalThresholds = {
    pmThresholdDA: 500000,
    procurementHeadThresholdDA: 2000000,
    dgThresholdDA: 10000000,
  };

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

    // 2. Matrice RBAC initiale
    this.rolePermissions = JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX));

    // 3. Initialisation des données industrielles exemplaires et réalistes
    this.initProjectsBaseline();
    this.initCommercialBaseline();
    this.initProcurementBaseline();
    this.initHrBaseline();
    this.initFinanceBaseline();
  }


  private initProjectsBaseline() {
    const proj: StoredProject = {
      id: 'prj-2026-001',
      code: 'PRJ-2026-001',
      name: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Zone Industrielle Skikda RA1K',
      wilaya: 'Skikda',
      pole: 'Tuyauterie & Chaudronnerie',
      contractType: 'FORFAITAIRE',
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: 'LOW',
      contractAmount: 48500000,
      budgetAmount: 36800000,
      revisedBudget: 36800000,
      spentBudget: 14200000,
      committedBudget: 22400000,
      physicalProgress: 44,
      financialProgress: 38,
      startDate: '2026-10-01',
      contractEndDate: '2026-12-15',
      description: 'Arrêt technique annuel : Dépose, préfabrication atelier, montage sur site et épreuves hydrauliques à 45 bars des collecteurs vapeur haute pression avec contrôles CND.',
      objectives: 'Sécuriser le redémarrage de l\'unité de craquage catalytique dans le respect strict des jalons QCD et zéro accident de travail.',
      managerId: 'usr-rp-001',
      managerName: 'Amine Khelifi (Chef de Projet)',
      contractReference: 'CTR-SONATRACH-2026-042',
      clientPoNumber: 'BC-SKIKDA-2026-88',
      // no initial mock cost sheet
      tvaRate: 19,
      retentionRate: 5,
      milestones: [
        {
          id: 'mls-001',
          title: 'ODS N°01 & Mobilisation de la base de vie',
          targetDate: '2026-10-07',
          status: 'COMPLETED',
          completed: true,
          completedDate: '2026-10-06',
          weight: 15,
        },
        {
          id: 'mls-002',
          title: 'Dépose & Préfabrication des 45 spools tuyauterie HP',
          targetDate: '2026-11-05',
          status: 'COMPLETED',
          completed: true,
          completedDate: '2026-11-04',
          weight: 35,
        },
        {
          id: 'mls-003',
          title: 'Montage sur site des lignes & Contrôles CND radio',
          targetDate: '2026-11-28',
          status: 'IN_PROGRESS',
          completed: false,
          weight: 30,
        },
        {
          id: 'mls-004',
          title: 'Épreuves hydrauliques à 45 bars & PV de réception provisoire',
          targetDate: '2026-12-12',
          status: 'PENDING',
          completed: false,
          weight: 20,
        },
      ],
      serviceOrders: [
        {
          id: 'ods-2026-001',
          orderNumber: 'ODS-PRJ-2026-001-01',
          type: 'DEMARRAGE',
          description: 'Ordre de service de démarrage officiel des travaux sur site.',
          effectiveDate: '2026-10-01',
          status: 'SIGNE',
          delayDays: 0,
          costImpact: 0,
          clientRef: 'SONATRACH/DP/RA1K/2026',
          signatory: 'M. Mustapha Larbi (Chef Dép. Maintenance)',
        },
      ],
      workSituations: [
        {
          id: 'sit-2026-001',
          situationNumber: 'SIT-PRJ-2026-001-01',
          periodStart: '2026-10-01',
          periodEnd: '2026-10-31',
          status: 'VALIDE',
          amountHT: 16975000,
          retenueGarantie: 848750,
          amountTVA: 3225250,
          amountTTC: 19351500,
          cumulatedAmountHT: 16975000,
          pvRef: 'PV-ATTEST-SKIKDA-01',
          inspector: 'Bureau de Contrôle Veritas Algérie',
          lines: [
            { designation: 'Préfabrication spools atelier', unit: 'ml', contractQty: 450, periodQty: 180, unitPrice: 20000, totalHT: 3600000 },
            { designation: 'Montage sur rack Sud', unit: 'ml', contractQty: 450, periodQty: 80, unitPrice: 20000, totalHT: 1600000 },
          ],
          createdAt: '2026-10-31T17:00:00Z',
        },
      ],
      members: [
        { id: 'mbr-1', userId: 'usr-rp-001', name: 'Amine Khelifi', role: 'RESPONSABLE_PROJET', title: 'Directeur de Projet' },
        { id: 'mbr-2', userId: 'usr-chf-001', name: 'Karim Mansouri', role: 'CONDUCTEUR_TRAVAUX', title: 'Chef de Chantier' },
        { id: 'mbr-3', userId: 'usr-qhse-001', name: 'Nadia Chaib', role: 'RESPONSABLE_QUALITE', title: 'Ingénieure CQS & HSE' },
      ],
      costEntries: [
        { id: 'cst-001', category: 'ACHATS', amount: 8400000, description: 'Fourniture tubes acier carbone A106 Gr B', sourceModule: 'PROCUREMENT', date: '2026-10-10' },
        { id: 'cst-002', category: 'MAIN_DOEUVRE', amount: 3600000, description: 'Débours équipe tuyauterie & soudage M1', sourceModule: 'HR', date: '2026-10-31' },
        { id: 'cst-003', category: 'LOCATION', amount: 2200000, description: 'Location grue mobile 50T Liebherr 18 jours', sourceModule: 'MAINTENANCE', date: '2026-10-25' },
      ],
      documents: [
        { id: 'doc-001', name: 'Contrat de Marché N°CTR-2026-042', type: 'CONTRAT', size: '2.4 MB', uploadDate: '2026-10-01' },
        { id: 'doc-002', name: 'Permis de Feu & Plan de Prévention ATEX', type: 'HSE', size: '1.1 MB', uploadDate: '2026-10-02' },
        { id: 'doc-003', name: 'Cahier de Soudage & QMOS/DMOS approuvés', type: 'QUALITE', size: '4.8 MB', uploadDate: '2026-10-05' },
      ],
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [
        { id: 'alc-1', itemCode: 'TUB-A106-DN150', itemName: 'Tubes acier carbone A106 Gr B sch 80', quantity: 220, unit: 'ml', allocatedAt: '2026-10-08' },
        { id: 'alc-2', itemCode: 'VAN-HP-DN150', itemName: 'Vannes à opercule classe 600', quantity: 12, unit: 'u', allocatedAt: '2026-10-12' },
      ],
      purchaseOrders: [
        { id: 'po-1', orderNumber: 'BC-2026-014', supplierName: 'Tubacex Algérie', amount: 8400000, status: 'LIVRE', expectedDeliveryDate: '2026-10-18' },
        { id: 'po-2', orderNumber: 'BC-2026-022', supplierName: 'PetroValve SPA', amount: 3200000, status: 'COMMANDE', expectedDeliveryDate: '2026-11-20' },
      ],
      nonConformities: [],
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-11-10T14:30:00Z',
    };

    this.ensureProjectDefaults(proj);
    this.projects.push(proj);

    const proj2: StoredProject = {
      id: 'prj-2026-002',
      code: 'PRJ-2026-002',
      name: 'Montage mécanique & tuyauterie circuits vapeur centrale 2x400MW',
      clientName: 'Sonelgaz Production Électricité (SPE)',
      sector: 'ENERGIE',
      siteLocation: 'Centrale Thermique de Kais',
      wilaya: 'Khenchela',
      pole: 'Tuyauterie & Chaudronnerie',
      contractType: 'BORDEREAU_PRIX',
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: 'MEDIUM',
      contractAmount: 125000000,
      budgetAmount: 104000000,
      revisedBudget: 104000000,
      spentBudget: 65200000,
      committedBudget: 78500000,
      physicalProgress: 64,
      financialProgress: 62.7,
      startDate: '2025-09-01',
      contractEndDate: '2026-11-30',
      description: 'Montage des circuits eau d’alimentation, vapeur BP/MP, tuyauterie inox de refroidissement condenseur et calorifugeage.',
      objectives: 'Épreuves hydrauliques 60 bar sans réserve, conformité DESP / CODAP.',
      managerId: 'usr-rp-001',
      managerName: 'Karim Mansouri (Chef de Projet)',
      contractReference: 'CTR-SONELGAZ-SPE-2025-018',
      clientPoNumber: 'BC-KAIS-2025-114',
      tvaRate: 19,
      retentionRate: 5,
      milestones: [],
      serviceOrders: [],
      workSituations: [],
      members: [],
      costEntries: [],
      documents: [],
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [],
      purchaseOrders: [],
      nonConformities: [],
      createdAt: '2025-09-01T08:00:00Z',
      updatedAt: '2026-11-10T14:30:00Z',
    };
    this.ensureProjectDefaults(proj2);
    this.projects.push(proj2);

    const proj3: StoredProject = {
      id: 'prj-2026-003',
      code: 'PRJ-2026-003',
      name: 'Système HVAC, CTA 15000 m³/h et filtration surpressurisée salle de contrôle',
      clientName: 'Fertial Algérie (Complexe Ammoniac & Engrais)',
      sector: 'CHIMIE',
      siteLocation: 'Zone Industrielle Arzew',
      wilaya: 'Oran',
      pole: 'HVAC & Climatisation Industrielle',
      contractType: 'FORFAITAIRE',
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: 'LOW',
      contractAmount: 22000000,
      budgetAmount: 18500000,
      revisedBudget: 18500000,
      spentBudget: 7800000,
      committedBudget: 9200000,
      physicalProgress: 42,
      financialProgress: 42.1,
      startDate: '2026-02-01',
      contractEndDate: '2026-07-31',
      description: 'Installation de 2 centrales CTA 15000 m3/h, réseau gaines spiralées acier galva, contrôle d’ambiance et climatisation salle serveurs.',
      objectives: 'Garantir une surpression salle de contrôle de 50 Pa avec filtration chimique.',
      managerId: 'usr-rp-001',
      managerName: 'Karim Mansouri (Chef de Projet)',
      contractReference: 'CTR-FERTIAL-2026-009',
      clientPoNumber: 'BC-ARZEW-2026-44',
      tvaRate: 19,
      retentionRate: 5,
      milestones: [],
      serviceOrders: [],
      workSituations: [],
      members: [],
      costEntries: [],
      documents: [],
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [],
      purchaseOrders: [],
      nonConformities: [],
      createdAt: '2026-02-01T08:00:00Z',
      updatedAt: '2026-11-10T14:30:00Z',
    };
    this.ensureProjectDefaults(proj3);
    this.projects.push(proj3);

    const proj4: StoredProject = {
      id: 'prj-2026-004',
      code: 'PRJ-2026-004',
      name: 'Préfabrication chaudronnerie 4 ballons séparateurs Inox 304L & collecteurs',
      clientName: 'SIDER El Hadjar SPA',
      sector: 'SIDERURGIE',
      siteLocation: 'Complexe Sidérurgique El Hadjar',
      wilaya: 'Annaba',
      pole: 'Tuyauterie & Chaudronnerie',
      contractType: 'FORFAITAIRE',
      status: ProjectStatus.PLANNING,
      riskLevel: 'LOW',
      contractAmount: 38000000,
      budgetAmount: 32000000,
      revisedBudget: 32000000,
      spentBudget: 1200000,
      committedBudget: 4500000,
      physicalProgress: 12,
      financialProgress: 3.8,
      startDate: '2026-04-01',
      contractEndDate: '2026-09-15',
      description: 'Fabrication en atelier Rouiba de 4 ballons séparateurs inox 304L diam 1600mm et 12 collecteurs de distribution vapeur.',
      objectives: 'Contrôles CND 100% radio des soudures longitudinales et circulaires.',
      managerId: 'usr-rp-001',
      managerName: 'Amine Khelifi (Chef de Projet)',
      contractReference: 'CTR-SIDER-2026-031',
      clientPoNumber: 'BC-HADJAR-2026-12',
      tvaRate: 19,
      retentionRate: 5,
      milestones: [],
      serviceOrders: [],
      workSituations: [],
      members: [],
      costEntries: [],
      documents: [],
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [],
      purchaseOrders: [],
      nonConformities: [],
      createdAt: '2026-04-01T08:00:00Z',
      updatedAt: '2026-11-10T14:30:00Z',
    };
    this.ensureProjectDefaults(proj4);
    this.projects.push(proj4);

    const proj5: StoredProject = {
      id: 'prj-2026-005',
      code: 'PRJ-2026-005',
      name: 'Réfection viroles blindées broyeur & tuyauteries dépoussiérage filtres',
      clientName: 'GICA — Société des Ciments de Ain Touta (SCMAT)',
      sector: 'CIMENTERIE',
      siteLocation: 'Cimenterie Ain Touta',
      wilaya: 'Batna',
      pole: 'Maintenance Industrielle & Mécanique',
      contractType: 'FORFAITAIRE',
      status: ProjectStatus.COMPLETED,
      riskLevel: 'LOW',
      contractAmount: 18500000,
      budgetAmount: 15800000,
      revisedBudget: 15800000,
      spentBudget: 15400000,
      committedBudget: 15400000,
      physicalProgress: 100,
      financialProgress: 97.5,
      startDate: '2025-06-01',
      contractEndDate: '2025-12-15',
      description: 'Changement des couronnes dentées, remplacement viroles blindées et tuyauteries de dépoussiérage filtre à manches.',
      objectives: 'Réception définitive prononcée sans réserve technique.',
      managerId: 'usr-rp-001',
      managerName: 'Amine Khelifi (Chef de Projet)',
      contractReference: 'CTR-GICA-SCMAT-2025-07',
      clientPoNumber: 'BC-SCMAT-2025-83',
      tvaRate: 19,
      retentionRate: 5,
      milestones: [],
      serviceOrders: [],
      workSituations: [],
      members: [],
      costEntries: [],
      documents: [],
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [],
      purchaseOrders: [],
      nonConformities: [],
      createdAt: '2025-06-01T08:00:00Z',
      updatedAt: '2026-11-10T14:30:00Z',
    };
    this.ensureProjectDefaults(proj5);
    this.projects.push(proj5);
  }

  private initCommercialBaseline() {
    this.seedCommercialTestBaseline();
    this.initQualityBaseline();
    this.clientSatisfactionSurveys = [
      {
        id: 'sat-2026-001',
        reference: 'SAT-2026-001',
        clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        contactName: 'M. Mustapha Larbi (Chef Dép. Maintenance)',
        contactEmail: 'm.larbi@sonatrach-skikda.dz',
        surveyDate: '2026-11-15',
        qualityScore: 9.2,
        scheduleScore: 9.0,
        hseScore: 9.8,
        responsivenessScore: 9.0,
        recommendationScore: 10,
        overallScorePercent: 92.5,
        overallScore: 92.5,
        appreciation: 'EXCELLENT',
        comments: 'Excellente maîtrise technique du soudage TIG 6G sous contraintes ATEX. Respect rigoureux des protocoles HSE Sonatrach.',
        clientSignatory: 'M. Mustapha Larbi',
        recordedBy: 'Karim Mansouri',
        createdAt: '2026-11-15T14:00:00Z',
      },
      {
        id: 'sat-2026-002',
        reference: 'SAT-2026-002',
        clientName: 'Fertial Algérie (Complexe Ammoniac & Engrais)',
        projectCode: 'PRJ-2026-003',
        projectName: 'Système HVAC & Traitement d’Air Salle Contrôle',
        contactName: 'M. Djamel Belkacemi (Ingénieur Projets)',
        contactEmail: 'd.belkacemi@fertial-dz.com',
        surveyDate: '2026-11-10',
        qualityScore: 8.8,
        scheduleScore: 8.5,
        hseScore: 9.2,
        responsivenessScore: 9.0,
        recommendationScore: 9,
        overallScorePercent: 88.8,
        overallScore: 88.8,
        appreciation: 'EXCELLENT',
        comments: 'Équipe réactive, bonne gestion des interfaces techniques.',
        clientSignatory: 'M. Djamel Belkacemi',
        recordedBy: 'Karim Mansouri',
        createdAt: '2026-11-10T11:30:00Z',
      },
      {
        id: 'sat-2026-003',
        reference: 'SAT-2026-003',
        clientName: 'Lafarge Holcim Cimenterie Oggaz',
        projectCode: 'PRJ-2026-005',
        projectName: 'Réfection Broyeur & Tuyauteries Échangeurs Cimenterie',
        contactName: 'M. Ali Khedidja (Directeur d\'Usine)',
        contactEmail: 'a.khedidja@lafarge-dz.com',
        surveyDate: '2026-11-05',
        qualityScore: 9.0,
        scheduleScore: 9.2,
        hseScore: 9.5,
        responsivenessScore: 9.2,
        recommendationScore: 10,
        overallScorePercent: 91.8,
        overallScore: 91.8,
        appreciation: 'EXCELLENT',
        comments: 'Chantier livré avant délai avec zéro réserve lors de l\'épreuve de charge.',
        clientSignatory: 'M. Ali Khedidja',
        recordedBy: 'Karim Mansouri',
        createdAt: '2026-11-05T16:00:00Z',
      },
    ];
  }

  public seedCommercialTestBaseline() {
    this.opportunities = [
      {
        id: 'opp-2026-001',
        code: 'OPP-2026-001',
        title: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
        sector: 'OIL_AND_GAS',
        location: 'Zone Industrielle Skikda RA1K',
        contactName: 'M. Mustapha Larbi (Chef Dép. Maintenance)',
        contactEmail: 'm.larbi@sonatrach-skikda.dz',
        contactPhone: '+213 (0) 38 75 22 10',
        estimatedAmount: 38700000,
        receivedAt: '2026-11-01',
        submissionDeadline: '2026-11-25',
        priority: 'HAUTE',
        status: 'VALIDATION_INTERNE',
        winProbability: 65,
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
        status: 'QUALIFIEE',
        winProbability: 20,
        notes: 'Installation de gaines acier galvanisé calorifugées et groupes frigorifiques 150 kW.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-11-05T09:00:00Z',
        updatedAt: '2026-11-05T09:00:00Z',
      },
      {
        id: 'opp-2026-003',
        code: 'OPP-2026-003',
        title: 'Inspection métallurgique et épreuves décennales ballons de séparation',
        clientName: 'Sonelgaz Production Électricité (SPE)',
        sector: 'ENERGIE',
        location: 'Centrale Thermique de Kais, Wilaya de Khenchela',
        contactName: 'M. Yacine Benmoussa (Directeur de Centrale)',
        contactEmail: 'y.benmoussa@spe.sonelgaz.dz',
        contactPhone: '+213 (0) 32 41 12 00',
        estimatedAmount: 18500000,
        receivedAt: '2026-11-08',
        submissionDeadline: '2026-12-05',
        priority: 'HAUTE',
        status: 'NEGOCIATION',
        winProbability: 85,
        notes: 'Visite contradictoire effectuée. Négociation commerciale finale des conditions de garantie et d\'astreinte.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-11-08T11:00:00Z',
        updatedAt: '2026-11-12T15:00:00Z',
      },
      {
        id: 'opp-2026-004',
        code: 'OPP-2026-004',
        title: 'Liaison vapeur et manifold de distribution zone sucrière',
        clientName: 'Cevital Agro-Industrie Béjaïa',
        sector: 'AGROALIMENTAIRE',
        location: 'Zone Portuaire Arrière-Port, Béjaïa',
        contactName: 'M. Sofiane Guellil (Chef Service Énergie)',
        contactEmail: 's.guellil@cevital.dz',
        contactPhone: '+213 (0) 34 21 44 80',
        estimatedAmount: 14500000,
        receivedAt: '2026-11-12',
        submissionDeadline: '2026-12-10',
        priority: 'NORMALE',
        status: 'NOUVELLE',
        winProbability: 10,
        notes: 'Opportunité identifiée suite à consultation directe client pour extension ligne process.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-11-12T09:00:00Z',
        updatedAt: '2026-11-12T09:00:00Z',
      },
      {
        id: 'opp-2026-005',
        code: 'OPP-2026-005',
        title: 'Chaudronnerie et réfection virole broyeur cru cimenterie',
        clientName: 'Lafarge Holcim Cimenterie Oggaz',
        sector: 'CIMENTERIE',
        location: 'Usine d\'Oggaz, Wilaya de Mascara',
        contactName: 'M. Abdelkrim Saidi (Resp. Arrêts)',
        contactEmail: 'a.saidi@lafarge.dz',
        contactPhone: '+213 (0) 45 80 12 34',
        estimatedAmount: 22000000,
        receivedAt: '2026-11-04',
        submissionDeadline: '2026-12-02',
        priority: 'HAUTE',
        status: 'VISITE_TECHNIQUE',
        winProbability: 35,
        siteVisitDate: '2026-11-10',
        technicalReportNotes: 'Relevé de cotes contradictoire effectué. Épaisseur résiduelle 18mm au lieu de 25mm requise.',
        notes: 'Visite sur site effectuée le 10/11/2026. Cahier des charges technique en cours de finalisation.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-11-04T10:00:00Z',
        updatedAt: '2026-11-10T17:00:00Z',
      },
      {
        id: 'opp-2026-006',
        code: 'OPP-2026-006',
        title: 'Préfabrication spools tuyauterie collecteur gaz HP 120 bar',
        clientName: 'GCB - Direction Régionale Sud',
        sector: 'OIL_AND_GAS',
        location: 'Base Industrielle Hassi Messaoud, Ouargla',
        contactName: 'M. Khaled Boukhalfa (Dir. Projets)',
        contactEmail: 'k.boukhalfa@gcb.dz',
        contactPhone: '+213 (0) 29 73 11 22',
        estimatedAmount: 31000000,
        receivedAt: '2026-11-06',
        submissionDeadline: '2026-12-15',
        priority: 'HAUTE',
        status: 'CHIFFRAGE',
        winProbability: 50,
        notes: 'Études et métrés en cours avec le bureau d\'études interne. Débours métallurgie Inox 316L demandés aux Achats.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-11-06T14:00:00Z',
        updatedAt: '2026-11-09T16:00:00Z',
      },
      {
        id: 'opp-2026-007',
        code: 'OPP-2026-007',
        title: 'Pose collecteur torche et canalisation gaz 16 pouces',
        clientName: 'Cosider Canalisations',
        sector: 'OIL_AND_GAS',
        location: 'Zone Industrielle Oued Smar, Alger',
        contactName: 'M. Mourad Cheniti (Chef de Projet)',
        contactEmail: 'm.cheniti@cosider-canalisations.dz',
        contactPhone: '+213 (0) 23 92 10 00',
        estimatedAmount: 42000000,
        receivedAt: '2026-10-25',
        submissionDeadline: '2026-11-20',
        priority: 'URGENTE',
        status: 'OFFRE_SOUMISE',
        winProbability: 75,
        notes: 'Offre technico-commerciale complète déposée sous pli fermé le 12/11/2026.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-10-25T08:00:00Z',
        updatedAt: '2026-11-12T14:00:00Z',
      },
      {
        id: 'opp-2026-008',
        code: 'OPP-2026-008',
        title: 'Revamping système d\'injection eau sous pression',
        clientName: 'Sonatrach DP Hassi Messaoud',
        sector: 'OIL_AND_GAS',
        location: 'Champ Pétrolier Hassi Messaoud',
        contactName: 'M. Rachid Hamidi (Chef Dép. Travaux Neufs)',
        contactEmail: 'r.hamidi@sonatrach-hmd.dz',
        contactPhone: '+213 (0) 29 74 50 00',
        estimatedAmount: 48500000,
        receivedAt: '2026-09-15',
        submissionDeadline: '2026-10-15',
        priority: 'HAUTE',
        status: 'GAGNEE',
        winProbability: 100,
        notes: 'Notification formelle d\'attribution de marché reçue. Conversion en projet PRJ-2026-001 effectuée.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-09-15T09:00:00Z',
        updatedAt: '2026-10-20T11:00:00Z',
      },
      {
        id: 'opp-2026-009',
        code: 'OPP-2026-009',
        title: 'Remplacement gaines dépoussiérage filtre à manches',
        clientName: 'Société des Ciments de Biskra (SCB)',
        sector: 'CIMENTERIE',
        location: 'Branche Ciments, Biskra',
        contactName: 'M. Ali Khedidja (Directeur d\'Usine)',
        contactEmail: 'a.khedidja@scb-biskra.dz',
        contactPhone: '+213 (0) 33 71 88 90',
        estimatedAmount: 19000000,
        receivedAt: '2026-10-01',
        submissionDeadline: '2026-10-28',
        priority: 'BASSE',
        status: 'PERDUE',
        winProbability: 0,
        lossReason: 'CONCURRENT_MOINS_DISANT',
        notes: 'Dossier non retenu par la commission. Concurrent local moins-disant de 14% sur le lot montage.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-11-02T16:00:00Z',
      },
      {
        id: 'opp-2026-010',
        code: 'OPP-2026-010',
        title: 'Rénovation circuit d\'eau glacée et CTA salles blanches',
        clientName: 'ENIE Entreprise Nationale des Industries Électroniques',
        sector: 'AUTRE_INDUSTRIE',
        location: 'Complexe Électronique, Sidi Bel Abbès',
        contactName: 'M. Nabil Taleb (Dir. Maintenance)',
        contactEmail: 'n.taleb@enie-dz.com',
        contactPhone: '+213 (0) 48 54 20 10',
        estimatedAmount: 8500000,
        receivedAt: '2026-10-10',
        submissionDeadline: '2026-11-05',
        priority: 'BASSE',
        status: 'ANNULEE',
        winProbability: 0,
        cancellationReason: 'APPEL_OFFRES_INFRUCTUEUX',
        notes: 'Consultation déclarée infructueuse et reportée au budget d\'investissement 2027.',
        assignedCommercialId: 'usr-rp-001',
        assignedCommercialName: 'Karim Mansouri',
        createdAt: '2026-10-10T11:00:00Z',
        updatedAt: '2026-11-06T15:00:00Z',
      },
    ];

    const initialCostSheet: StoredCostSheet = {
      id: 'fc-2026-001',
      reference: 'FC-2026-001',
      opportunityId: 'opp-2026-001',
      opportunityCode: 'OPP-2026-001',
      title: 'Fiche de Chiffrage Collaboratif — Rénovation tuyauteries HP vapeur 80 bar',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Zone Industrielle Skikda RA1K',
      currency: 'DZD',
      status: 'PRETE_POUR_VALIDATION',
      version: 1,

      projectContribution: {
        completed: true,
        responsibleId: 'usr-rp-001',
        responsibleName: 'Karim Mansouri (Chef de Projets)',
        worksDescription: 'Dépose tuyauteries usagées, épreuves hydrostatiques 120 bar, préfabrication 400ml tuyauteries Inox 316L DN150/200, montage sur site et contrôles CND.',
        durationDays: 45,
        technicalMeans: '2 Postes TIG orbital, 1 grue mobile 50T, compresseurs d\'épreuve 200 bar, échafaudages agréés zone ATEX.',
        constraints: 'Travaux en zone ATEX 1, arrêt programmé strict de 45 jours sans dépassement possible.',
        lines: [
          { id: 'csl-prj-1', category: 'PREPARATION', label: 'Échafaudages tubulaires et balisage zone ATEX (400 m²)', quantity: 400, unit: 'm²', unitPrice: 0, totalAmount: 0, notes: 'Montage et PV réception sécuritaire (débours valorisés par Achats & RH)' },
          { id: 'csl-prj-2', category: 'TRAVAUX', label: 'Préfabrication atelier et pose tuyauterie Inox 316L DN150/200 (400 ml)', quantity: 400, unit: 'ml', unitPrice: 0, totalAmount: 0, notes: 'Soudage TIG passe de pénétration (débours valorisés par Achats & RH)' },
          { id: 'csl-prj-3', category: 'CONTROLES', label: 'Épreuves hydrauliques 120 bar et contrôles CND (Radiographie 100% + Ressuage)', quantity: 1, unit: 'Forfait', unitPrice: 0, totalAmount: 0, notes: 'PV contradictoire avec bureau de contrôle' },
        ],
        updatedAt: '2026-11-06T14:30:00Z',
      },

      procurementContribution: {
        completed: true,
        responsibleId: 'usr-ach-001',
        responsibleName: 'Farouk Brahimi (Responsable Achats)',
        procurementNotes: 'Fournitures de tubes ASTM A312 TP316L sch40 et brides forgées ANSI 300# négociées avec certificat matière CCPU 3.1. Location grue 50T incluse.',
        equipmentRentalAmount: 2400000,
        subcontractingAmount: 0,
        lines: [
          { id: 'csl-ach-1', category: 'MATIERES', label: 'Tubes Inox sans soudure ASTM A312 TP316L DN150 sch40', quantity: 400, unit: 'ml', unitPrice: 21250, totalAmount: 8500000, notes: 'Fournisseur SIDERMET Tubing (Certificat 3.1)' },
          { id: 'csl-ach-2', category: 'MATIERES', label: 'Coudes 90°, réductions et brides ANSI 300# RTJ', quantity: 60, unit: 'U', unitPrice: 53333.33, totalAmount: 3200000, notes: 'Fournisseur ALFORGE Industrie' },
          { id: 'csl-ach-3', category: 'CONSOMMABLES', label: 'Métal d\'apport TIG ER316L et Gaz Argon haute pureté', quantity: 1, unit: 'Forfait', unitPrice: 1100000, totalAmount: 1100000, notes: 'Bouteilles LINDE Gas DZ' },
          { id: 'csl-ach-4', category: 'LOCATION', label: 'Location grue mobile 50T avec grutier habilité (20 j)', quantity: 20, unit: 'Jour', unitPrice: 120000, totalAmount: 2400000, notes: 'Engin certifié contrôle annuel' },
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
          { id: 'csl-rh-5', category: 'FRAIS_DE_VIE', label: 'Frais de mission, hébergement et restauration équipe (12 pers x 45j)', quantity: 1, unit: 'Forfait', unitPrice: 2160000, totalAmount: 2160000, notes: 'Base de vie Skikda' },
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
        financeNotes: 'Client solvable, historique de paiement régulier. Retenue de garantie provisionnée. Marge prévisionnelle solide (24.49%).',
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

      revisions: [],

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
    this.customerQuotes = [];

    // Enregistrement du workflow correspondant dans le circuit d'arbitrage DG
    const existingWf = this.workflows.find(w => w.targetId === 'fc-2026-001' || w.reference === 'FC-2026-001');
    if (!existingWf) {
      this.workflows.unshift({
        id: 'wf-cs-001',
        code: 'WF-CS-001',
        reference: 'FC-2026-001',
        title: 'Validation Chiffrage & Prix de Vente : Rénovation tuyauteries HP vapeur 80 bar',
        type: 'COST_SHEET' as any,
        status: 'PENDING_DG',
        priority: 'HIGH',
        initiatorName: 'Karim Mansouri',
        initiatorRole: 'Chef de Projets',
        initiatorDepartment: 'OPERATIONS_PROJETS',
        targetId: 'fc-2026-001',
        targetCode: 'FC-2026-001',
        clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
        amountHT: 38700000,
        amountTVA: 7353000,
        amountTTC: 46053000,
        justification: 'Chiffrage collaboratif réconcilié : Coûts directs 26.09M DA, Frais indirects 3.13M DA, Marge prévue 9.48M DA (24.49%). En attente arbitrage DG.',
        items: [
          { label: 'Débours Matières & Fournitures Achats', amount: 15200000 },
          { label: 'Main d\'œuvre & Encadrement RH Chantier', amount: 10890000 },
          { label: 'Frais Généraux & Indirects (12%)', amount: 3130800 },
        ],
        supplierOffers: [],
        submittedAt: '2026-11-08T10:00:00Z',
        history: [
          { action: 'SUBMISSION', actor: 'Karim Mansouri', role: 'Chef de Projets', timestamp: '2026-11-08T10:00:00Z', notes: 'Transmission pour visa Direction Générale' },
        ],
      });
    }
  }

  private initQualityBaseline() {
    this.qualityDocuments = [
      {
        id: 'doc-001',
        docNumber: 'DOC-2026-001',
        title: 'Manuel d\'Assurance Qualité & Procédures Générales QHSE (ISO 9001:2015)',
        category: 'PAQ',
        author: 'Direction Qualité & QHSE SILEX',
        version: '3.2',
        status: 'APPROUVE',
        revisions: [
          { revision: '3.0', changeNotes: 'Édition initiale triennale du système de management de la qualité', author: 'Direction Qualité SILEX', date: '2024-01-10' },
          { revision: '3.2', changeNotes: 'Audit de recertification Sonatrach & Bureau Veritas', author: 'Direction Qualité SILEX', date: '2026-01-10' },
        ],
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2026-01-10T14:00:00Z',
      },
      {
        id: 'doc-002',
        docNumber: 'DOC-2026-002',
        title: 'Descriptif de Mode Opératoire de Soudage DMOS-01 (TIG 141 racine + SMAW 111 remplissage)',
        category: 'DMOS',
        author: 'Ingénieur Matériaux & Soudage (IWE SILEX)',
        version: '2.0',
        status: 'VALIDE',
        revisions: [
          { revision: '1.0', changeNotes: 'Création initiale sur acier au carbone A106 Gr.B', author: 'Ingénieur IWE SILEX', date: '2025-05-12' },
          { revision: '2.0', changeNotes: 'Qualification sur nuance A106 Gr.B et P91 selon ASME IX / Sonatrach GS-EP-EXP-103', author: 'Ingénieur IWE SILEX', date: '2026-01-15' },
        ],
        createdAt: '2025-05-12T09:00:00Z',
        updatedAt: '2026-01-15T11:00:00Z',
      },
      {
        id: 'doc-003',
        docNumber: 'DOC-2026-003',
        title: 'Qualification de Mode Opératoire de Soudage QMOS-2025-089 (ASME IX / Sonatrach GS-EP-EXP-103)',
        category: 'QMOS',
        author: 'Bureau Veritas Algérie (Organisme Tiers)',
        version: '1.0',
        status: 'APPROUVE',
        revisions: [
          { revision: '1.0', changeNotes: 'Procès-verbal d\'essais mécaniques et micrographie contradictoire BV / Sonatrach', author: 'Bureau Veritas Algérie', date: '2025-11-20' },
        ],
        createdAt: '2025-11-20T10:00:00Z',
        updatedAt: '2025-11-20T10:00:00Z',
      },
      {
        id: 'doc-004',
        docNumber: 'DOC-2026-004',
        title: 'Procédure de Contrôle Non-Destructif CND-PT-RT-01 (Ressuage & Radiographie X/Gamma)',
        category: 'CND',
        author: 'Responsable Contrôle CND (COFREND II SILEX)',
        version: '2.1',
        status: 'VALIDE',
        revisions: [
          { revision: '2.0', changeNotes: 'Standardisation des critères d\'acceptabilité ASME Section V & B31.3', author: 'Responsable CND', date: '2025-08-10' },
          { revision: '2.1', changeNotes: 'Intégration du protocole radioprotection zone balisée Sonatrach', author: 'Responsable CND', date: '2026-01-08' },
        ],
        createdAt: '2025-08-10T08:00:00Z',
        updatedAt: '2026-01-08T16:00:00Z',
      },
      {
        id: 'doc-005',
        docNumber: 'DOC-2026-005',
        title: 'Plan d\'Assurance Qualité PAQ-PRJ-2026-001 (Chantier Rénovation Tuyauteries HP Skikda)',
        category: 'PAQ',
        author: 'Karim Mansouri (Chef de Projet SILEX)',
        version: '1.1',
        status: 'VALIDE',
        revisions: [
          { revision: '1.0', changeNotes: 'Soumission initiale au Maître d\'Ouvrage', author: 'Karim Mansouri', date: '2026-09-25' },
          { revision: '1.1', changeNotes: 'Levée des remarques client et visa bon pour exécution RA1K', author: 'Karim Mansouri', date: '2026-10-02' },
        ],
        createdAt: '2026-09-25T11:00:00Z',
        updatedAt: '2026-10-02T15:00:00Z',
      },
    ];

    this.weldJoints = [
      {
        id: 'weld-001',
        jointNumber: 'J-01-VAP-HP',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        lineIso: 'ISO-A106-DN200-SCH80',
        spoolId: 'SPL-01',
        diameterNominal: 'DN200 (8")',
        thicknessMm: 12.7,
        material: 'Acier Carbone ASTM A106 Gr.B',
        heatNumberPipe: 'HEAT-A106-99412',
        heatNumberFitting: 'HEAT-ELB-A234-8831',
        welderName: 'Amar Bouzid',
        welderStamp: 'S-02',
        welderCqsRef: 'CQS-BV-2026-088',
        weldingProcess: 'TIG 141 (racine) + SMAW 111 (remplissage)',
        dmosRef: 'DMOS-01-ASME-IX',
        weldDate: '2026-10-15',
        visualInspection: {
          status: 'CONFORME',
          inspectorName: 'Mustapha Kaci (Inspecteur VT)',
          date: '2026-10-15',
          notes: 'Aspect régulier, pénétration complète, surépaisseur conforme 1.5mm',
        },
        cndInspection: {
          type: '100% Ressuage PT + 100% Radio RT',
          requiredRatePercent: 100,
          status: 'CONFORME',
          cndReportRef: 'RAP-RT-2026-018',
          filmRef: 'FLM-RT-8841',
          controlDate: '2026-10-16',
          controllingBody: 'Bureau Veritas Algérie (COFREND II)',
        },
        status: 'LIBERE_EPREUVE',
        createdAt: '2026-10-15T14:00:00Z',
      },
      {
        id: 'weld-002',
        jointNumber: 'J-02-VAP-HP',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        lineIso: 'ISO-A106-DN200-SCH80',
        spoolId: 'SPL-01',
        diameterNominal: 'DN200 (8")',
        thicknessMm: 12.7,
        material: 'Acier Carbone ASTM A106 Gr.B',
        heatNumberPipe: 'HEAT-A106-99412',
        welderName: 'Amar Bouzid',
        welderStamp: 'S-02',
        welderCqsRef: 'CQS-BV-2026-088',
        weldingProcess: 'TIG 141 (racine) + SMAW 111 (remplissage)',
        dmosRef: 'DMOS-01-ASME-IX',
        weldDate: '2026-10-16',
        visualInspection: {
          status: 'CONFORME',
          inspectorName: 'Mustapha Kaci',
          date: '2026-10-16',
        },
        cndInspection: {
          type: '100% Ressuage PT + 100% Radio RT',
          requiredRatePercent: 100,
          status: 'CONFORME',
          cndReportRef: 'RAP-RT-2026-019',
          filmRef: 'FLM-RT-8842',
          controlDate: '2026-10-17',
          controllingBody: 'Bureau Veritas Algérie (COFREND II)',
        },
        status: 'LIBERE_EPREUVE',
        createdAt: '2026-10-16T16:00:00Z',
      },
      {
        id: 'weld-003',
        jointNumber: 'J-03-INX-GNL',
        projectId: 'prj-2026-002',
        projectCode: 'PRJ-2026-002',
        projectName: 'Montage mécanique & tuyauterie circuits vapeur centrale 2x400MW',
        lineIso: 'ISO-316L-DN150-SCH40S',
        spoolId: 'SPL-02',
        diameterNominal: 'DN150 (6")',
        thicknessMm: 7.11,
        material: 'Inox 316L (Nuance Z2CND17-12)',
        heatNumberPipe: 'HEAT-INOX-77341',
        welderName: 'Nabil Meziani',
        welderStamp: 'S-05',
        welderCqsRef: 'CQS-TUV-2025-104',
        weldingProcess: 'TIG 141 intégral (racine + remplissage)',
        dmosRef: 'DMOS-02-INOX-ASME-IX',
        weldDate: '2026-10-20',
        visualInspection: {
          status: 'CONFORME',
          inspectorName: 'Rachid Benaissa',
          date: '2026-10-20',
        },
        cndInspection: {
          type: '100% Ressuage (PT)',
          requiredRatePercent: 100,
          status: 'CONFORME',
          cndReportRef: 'RAP-PT-2026-031',
          controlDate: '2026-10-21',
          controllingBody: 'COFREND II SILEX',
        },
        status: 'CONFORME',
        createdAt: '2026-10-20T11:00:00Z',
      },
      {
        id: 'weld-004',
        jointNumber: 'J-04-INX-GNL',
        projectId: 'prj-2026-002',
        projectCode: 'PRJ-2026-002',
        projectName: 'Montage mécanique & tuyauterie circuits vapeur centrale 2x400MW',
        lineIso: 'ISO-316L-DN150-SCH40S',
        spoolId: 'SPL-02',
        diameterNominal: 'DN150 (6")',
        thicknessMm: 7.11,
        material: 'Inox 316L (Nuance Z2CND17-12)',
        heatNumberPipe: 'HEAT-INOX-77341',
        heatNumberFitting: 'HEAT-ELB-316L-771',
        welderName: 'Nabil Meziani',
        welderStamp: 'S-05',
        welderCqsRef: 'CQS-TUV-2025-104',
        weldingProcess: 'TIG 141',
        dmosRef: 'DMOS-02-INOX-ASME-IX',
        weldDate: '2026-10-22',
        visualInspection: {
          status: 'NON_CONFORME',
          inspectorName: 'Rachid Benaissa',
          date: '2026-10-22',
          notes: 'Défaut d’aspect caniveau visible en position 3G',
        },
        cndInspection: {
          type: '100% Ressuage PT + 100% Radio RT',
          requiredRatePercent: 100,
          status: 'CONFORME',
          cndReportRef: 'RAP-RT-2026-025-R1',
          filmRef: 'FLM-RT-8901',
          controlDate: '2026-10-24',
          controllingBody: 'Bureau Veritas Algérie (COFREND II)',
          defectType: 'Caniveau et porosité initiale résolus par réparation',
        },
        repairHistory: [
          {
            repairIndex: 1,
            repairDate: '2026-10-23',
            repairWelderStamp: 'S-02',
            repairDmosRef: 'DMOS-REP-01',
            postRepairCndStatus: 'CONFORME',
            postRepairReportRef: 'RAP-RT-2026-025-R1',
            notes: 'Gougeage mécanique du défaut, meulage à blanc, ressuage intermédiaire vierge, réfection passe TIG sous argon pur et radio 100% conforme.',
          },
        ],
        status: 'REPARE_CONFORME',
        createdAt: '2026-10-22T09:00:00Z',
      },
      {
        id: 'weld-005',
        jointNumber: 'J-05-VAPEUR-HP',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        lineIso: 'ISO-316L-DN150-SCH80',
        spoolId: 'SPL-03',
        diameterNominal: 'DN150 (6")',
        thicknessMm: 11.0,
        material: 'Inox 316L (Nuance Z2CND17-12)',
        welderName: 'Amar Bouzid',
        welderStamp: 'S-02',
        welderCqsRef: 'CQS-BV-2026-088',
        weldingProcess: 'TIG 141 racine + SMAW 111 remplissage',
        dmosRef: 'DMOS-01 (TIG 141 racine + SMAW 111)',
        weldDate: '2026-11-05',
        visualInspection: {
          status: 'CONFORME',
          inspectorName: 'Mustapha Kaci',
          date: '2026-11-05',
        },
        cndInspection: {
          type: '100% Ressuage PT + 100% Radio RT',
          requiredRatePercent: 100,
          status: 'EN_ATTENTE_CND',
          controllingBody: 'Bureau Veritas Algérie (COFREND II)',
        },
        status: 'EN_ATTENTE_CND',
        createdAt: '2026-11-05T15:30:00Z',
      },
    ];

    this.nonConformities = [
      {
        id: 'nc-001',
        ncNumber: 'FNC-2026-001',
        code: 'FNC-2026-001',
        title: 'Inclusion de laitier et caniveau détecté sur le joint soudé J-04 ligne Inox 316L',
        description: 'Lors du contrôle radiographique systématique (tir radio n° FLM-RT-8901), détection d’un caniveau continu de 25 mm et porosité interne non admissible selon code ASME B31.3 Catégorie Fluide Sévère.',
        severity: 'MAJEURE',
        status: 'CLOSED',
        detectedBy: 'Inspecteur CND Bureau Veritas Algérie (COFREND II)',
        detectedDate: '2026-10-22T17:00:00Z',
        projectId: 'prj-2026-002',
        projectCode: 'PRJ-2026-002',
        projectName: 'Montage mécanique & tuyauterie circuits vapeur centrale 2x400MW',
        project: { id: 'prj-2026-002', code: 'PRJ-2026-002', name: 'Montage mécanique & tuyauterie circuits vapeur centrale 2x400MW' },
        weldJointNumber: 'J-04-INX-GNL',
        rootCause: 'Vitesse d’avance excessive lors de la première passe de remplissage et instabilité du débit d’argon de protection.',
        resolutionNotes: 'Réfection complète du cordon selon DMOS-REP-01 par soudeur qualifié S-02 (Amar Bouzid). Contrôle CND contradictoire par radio RT rapport RAP-RT-2026-025-R1 100% conforme sans aucun défaut résiduel.',
        closeType: 'Visa CND Conforme',
        closedBy: 'Direction Qualité SILEX',
        closedDate: '2026-10-24T18:00:00Z',
        actions: [
          {
            id: 'act-001',
            description: 'Gougeage complet du cordon défectueux et reprise de passe sous contrôle direct',
            responsible: 'Chef d’équipe Soudage & Responsable CND',
            targetDate: '2026-10-23',
            completedDate: '2026-10-23',
            status: 'COMPLETED',
          },
          {
            id: 'act-002',
            description: 'Sensibilisation des soudeurs au respect du débit de gaz de chambrage (Argon pur 99.99%)',
            responsible: 'Superviseur QHSE',
            targetDate: '2026-10-25',
            completedDate: '2026-10-25',
            status: 'COMPLETED',
          },
        ],
        createdAt: '2026-10-22T17:30:00Z',
        updatedAt: '2026-10-24T18:00:00Z',
      },
      {
        id: 'nc-002',
        ncNumber: 'FNC-2026-002',
        code: 'FNC-2026-002',
        title: 'Absence de certificat matière CCPU 3.1 sur lot de coudes 90° ASTM A234 WPB',
        description: 'Lors de la réception magasin du bon de livraison BL-PETRO-2026-088, le lot de 15 coudes DN200 ne présentait pas le certificat CCPU 3.1 original visé. Mise en zone quarantaine immédiate.',
        severity: 'CRITIQUE',
        status: 'UNDER_INVESTIGATION',
        detectedBy: 'Magasinier Central & Responsable Contrôle Réception SILEX',
        detectedDate: '2026-11-02T10:00:00Z',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        project: { id: 'prj-2026-001', code: 'PRJ-2026-001', name: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques' },
        rootCause: 'Fournisseur PETRO-PIPE ALGERIE a omis de joindre la liasse documentaire avec le bordereau de transport.',
        actions: [
          {
            id: 'act-003',
            description: 'Blocage physique en zone quarantaine et mise en demeure formelle du fournisseur pour transmission CCPU 3.1',
            responsible: 'Responsable Achats & Approvisionnements',
            targetDate: '2026-11-12',
            status: 'IN_PROGRESS',
          },
        ],
        createdAt: '2026-11-02T10:30:00Z',
        updatedAt: '2026-11-02T10:30:00Z',
      },
    ];
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
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [],
      purchaseOrders: [],
      nonConformities: [],
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
    const totalInitialBudget = this.projects.reduce((acc, p) => acc + (p.budgetAmount || 0), 0);
    const totalRevisedBudget = this.projects.reduce((acc, p) => acc + (p.revisedBudget || p.budgetAmount || 0), 0);
    const totalSpent = this.projects.reduce((acc, p) => acc + (p.spentBudget || p.actualCost || 0), 0);
    const totalCommitted = this.projects.reduce((acc, p) => acc + (p.committedBudget || p.committedCost || 0), 0);
    const totalEac = this.projects.reduce((acc, p) => acc + ((p.spentBudget || p.actualCost || 0) + Math.max(0, (p.revisedBudget || p.budgetAmount || 0) - (p.spentBudget || p.actualCost || 0))), 0);
    const avgPhysicalProgress = totalProjects > 0
      ? Math.round(this.projects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects)
      : 0;

    // Calcul rigoureux des marges selon les règles industrielles algériennes
    // Marge prévisionnelle = Marché HT - Budget révisé
    const projectedMarginDA = totalContractValue > 0 && totalRevisedBudget > 0
      ? totalContractValue - totalRevisedBudget
      : 0;
    const projectedMarginRate = totalContractValue > 0 && totalRevisedBudget > 0
      ? Number(((projectedMarginDA / totalContractValue) * 100).toFixed(1))
      : null;

    // Taux de marque = Marge prévisionnelle / Coût budgété
    const markupRate = totalRevisedBudget > 0
      ? Number(((projectedMarginDA / totalRevisedBudget) * 100).toFixed(1))
      : null;

    // Marge réalisée = (Avancement physique pondéré * Marché HT) - Coûts réels consommés
    const earnedValue = this.projects.reduce((acc, p) => acc + ((p.contractAmount || 0) * (p.physicalProgress || 0) / 100), 0);
    const realizedMarginDA = earnedValue - totalSpent;
    const realizedMarginRate = earnedValue > 0
      ? Number(((realizedMarginDA / earnedValue) * 100).toFixed(1))
      : null;

    const pendingApprovalsCount = this.getWorkflowsInbox().length;

    return {
      totalProjects,
      activeProjects,
      totalContractValue,
      totalInitialBudget,
      totalRevisedBudget,
      totalBudgetAllocated: totalRevisedBudget,
      totalBudget: totalRevisedBudget,
      totalProjectBudgets: totalRevisedBudget,
      totalSpent,
      totalActualCosts: totalSpent,
      totalCommitted,
      totalCommittedCosts: totalCommitted,
      totalEac,
      avgPhysicalProgress,
      activeProjectsCount: activeProjects,
      totalTurnover: totalContractValue,
      totalContracted: totalContractValue,
      projectedMarginDA,
      projectedMarginRate,
      markupRate,
      realizedMarginDA,
      realizedMarginRate,
      pendingApprovalsCount,
      clientReceivables: this.calculateClientReceivables(),
      supplierPayables: this.calculateSupplierPayables(),
      monthlyExpenditure: totalSpent,
    };
  }

  // --- WORKFLOWS (Circuit QCD & Décisions DG) ---
  getWorkflows(filter?: { status?: string; type?: string; pendingOnly?: boolean }) {
    if (filter?.pendingOnly) {
      return this.getWorkflowsInbox();
    }
    if (filter?.status) {
      return this.workflows.filter(w => w.status === filter.status);
    }
    return this.workflows;
  }

  getWorkflowsInbox(): StoredWorkflow[] {
    return (this.workflows || []).filter(w =>
      w.status === 'PENDING' ||
      w.status === 'PENDING_DG' ||
      w.status === 'PENDING_APPROVAL' ||
      w.status === 'SUBMITTED' ||
      w.status === 'PRETE_POUR_VALIDATION'
    );
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

    // Règle SoD : Interdiction stricte de l'auto-approbation
    if (user?.id && wf.initiatorId && isSelfApprovalForbidden(wf.initiatorId, user.id)) {
      throw new Error(`[SoD Violation] L'initiateur ${wf.initiatorName || wf.initiatorId} ne peut pas approuver son propre dossier (${wf.reference}).`);
    }

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

    // INTERCONNEXION : Si le workflow est lié à une Fiche de Chiffrage Commerciale (FC)
    if (wf.type === 'COST_SHEET') {
      const sheet = this.costSheets.find(cs => cs.id === wf.targetId || cs.reference === wf.targetCode || cs.reference === wf.reference);
      if (sheet) {
        sheet.status = 'VALIDEE';
        sheet.decision = 'APPROVED';
        sheet.decisionNotes = notes || 'Approbation Direction Générale accordée.';
        sheet.decisionDate = new Date().toISOString();
        sheet.history.push({
          action: 'ARBITRAGE_DG',
          actor: wf.decidedBy || 'Direction Générale',
          role: user?.role || 'DIRECTEUR_GENERAL',
          timestamp: new Date().toISOString(),
          notes: notes || 'Fiche de coût validée par la Direction Générale',
        });
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

    if (wf.type === 'COST_SHEET') {
      const sheet = this.costSheets.find(cs => cs.id === wf.targetId || cs.reference === wf.targetCode || cs.reference === wf.reference);
      if (sheet) {
        sheet.status = 'REJETEE';
        sheet.decision = 'REJECTED';
        sheet.decisionNotes = reason;
        sheet.history.push({
          action: 'REJET_DG',
          actor: wf.decidedBy || 'Direction Générale',
          role: user?.role || 'DIRECTEUR_GENERAL',
          timestamp: new Date().toISOString(),
          notes: reason,
        });
      }
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

    if (wf.type === 'COST_SHEET') {
      const sheet = this.costSheets.find(cs => cs.id === wf.targetId || cs.reference === wf.targetCode || cs.reference === wf.reference);
      if (sheet) {
        sheet.status = 'A_REVISER';
        sheet.decision = 'REVISION_REQUESTED';
        sheet.decisionNotes = instructions;
        sheet.history.push({
          action: 'DEMANDE_REVISION_DG',
          actor: user?.name || 'Amine Benali (DG)',
          role: user?.role || 'DIRECTEUR_GENERAL',
          timestamp: new Date().toISOString(),
          notes: instructions,
        });
      }
    }
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

  createPurchaseRequest(data: any, user?: any) {
    const rawItems = Array.isArray(data.items) ? data.items : (Array.isArray(data.lines) ? data.lines : []);
    if (!rawItems.length) {
      throw new Error('Une demande d\'achat doit comporter au moins un article ou fourniture.');
    }
    for (const it of rawItems) {
      const q = Number(it.quantity || 0);
      if (q <= 0) {
        throw new Error(`Quantité invalide (${q}) pour l'article ${it.name || it.description || 'demandé'}. La quantité doit être strictement positive.`);
      }
    }

    // Association obligatoire : Projet ou Compte de Frais Généraux
    if (!data.projectId && !data.projectCode && !data.generalExpenseAccount) {
      throw new Error('Une demande d\'achat doit impérativement être rattachée à un chantier/projet ou à un compte de frais généraux.');
    }

    const code = `DA-2026-${String(this.purchaseRequests.length + 1).padStart(4, '0')}`;
    const project = this.getProject(data.projectId) || (data.projectCode ? this.getProject(data.projectCode) : null);

    let amountHT = Number(data.totalHT || data.amountHT || data.estimatedAmount || 0);
    if (amountHT <= 0 && rawItems.length > 0) {
      amountHT = rawItems.reduce((acc: number, l: any) => acc + (Number(l.quantity || 1) * Number(l.estimatedUnitPrice !== undefined ? l.estimatedUnitPrice : (l.unitPrice || 0))), 0);
    }
    if (amountHT <= 0) {
      throw new Error('Le montant total HT estimé de la demande d\'achat doit être strictement positif.');
    }

    const vatRate = Number(data.vatRate !== undefined ? data.vatRate : 19);
    const vatAmount = amountHT * (vatRate / 100);
    const totalTTC = amountHT + vatAmount;

    // Contrôle de la disponibilité budgétaire chantier
    let budgetExceeded = false;
    let budgetExceededAmount = 0;
    let projectRemainingBudget = 0;
    if (project) {
      const budgetAmount = Number(project.revisedBudget || project.budgetAmount || 0);
      const committed = Number(project.committedBudget || project.committedCost || 0);
      const spent = Number(project.spentBudget || project.actualCost || 0);
      projectRemainingBudget = Math.max(0, budgetAmount - (committed + spent));
      if (budgetAmount > 0 && amountHT > projectRemainingBudget) {
        budgetExceeded = true;
        budgetExceededAmount = amountHT - projectRemainingBudget;
      }
    }

    // Recherche automatique dans le stock magasin existant
    const stockWarnings: Array<{ itemId: string; itemCode: string; itemName: string; requestedQty: number; availableStock: number }> = [];
    for (const it of rawItems) {
      const stockItem = this.inventoryItems.find(i =>
        (it.itemId && i.id === it.itemId) ||
        (it.itemCode && i.code === it.itemCode) ||
        (it.name && i.name.toLowerCase().includes(String(it.name).toLowerCase())) ||
        (it.description && i.name.toLowerCase().includes(String(it.description).toLowerCase()))
      );
      if (stockItem && (stockItem.currentStock || 0) >= Number(it.quantity || 0)) {
        stockWarnings.push({
          itemId: stockItem.id,
          itemCode: stockItem.code,
          itemName: stockItem.name,
          requestedQty: Number(it.quantity || 0),
          availableStock: stockItem.currentStock || 0,
        });
      }
    }
    const stockAvailableWarning = stockWarnings.length > 0;

    // Matrice d'approbation à 3 seuils SoD centralisée (@silex/shared)
    const requiredApprovalLevel = getRequiredPrApprovalLevel(amountHT, budgetExceeded);

    const pr = {
      id: `pr-${Date.now()}`,
      code,
      projectId: project?.id || data.projectId || '',
      projectCode: project?.code || data.projectCode || (data.generalExpenseAccount ? 'COMPTE-FRAIS-GEN' : 'CH-GEN-01'),
      projectName: project?.name || (data.generalExpenseAccount ? `Frais Généraux (${data.generalExpenseAccount})` : 'Chantier Industriel'),
      generalExpenseAccount: data.generalExpenseAccount,
      requestedById: user?.id || data.requestedById || this.users[1]?.id,
      requestedByName: user?.name || this.users.find(u => u.id === data.requestedById)?.name || 'Karim Mansouri',
      category: data.category || 'TUYAUTERIE',
      urgency: data.urgency || data.urgencyLevel || 'NORMAL',
      status: 'PENDING',
      desiredDeliveryDate: data.desiredDeliveryDate || data.desiredDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      deliveryLocation: data.deliveryLocation || 'Magasin Central Arzew',
      amountHT,
      vatRate,
      amountTVA: vatAmount,
      amountTTC: totalTTC,
      budgetExceeded,
      budgetExceededAmount,
      projectRemainingBudget,
      stockAvailableWarning,
      stockAvailableItems: stockWarnings,
      requiredApprovalLevel,
      justification: data.justification || '',
      certificationsRequired: {
        ccpu31: !!data.reqCertCcpu31 || !!data.ccpu31,
        cndReport: !!data.reqCndReport || !!data.cndReport,
        coc: !!data.reqCoc || !!data.coc,
        atexFds: !!data.reqAtexFds || !!data.atexFds,
      },
      items: rawItems,
      lines: rawItems,
      selectedSupplierId: data.selectedSupplierId || '',
      selectedSupplierName: data.selectedSupplierName || '',
      createdAt: new Date().toISOString(),
    };
    this.purchaseRequests.unshift(pr);

    // INTERCONNEXION DIRECTE : Génère automatiquement le workflow dans /workflows (Inbox DG)
    this.createWorkflow({
      title: `Demande d’Achat ${code} — ${pr.projectName} [Seuil: ${requiredApprovalLevel}]`,
      reference: code,
      type: 'PURCHASE_REQUEST',
      priority: pr.urgency as any,
      targetId: pr.id,
      targetCode: pr.code,
      projectCode: pr.projectCode,
      projectName: pr.projectName,
      clientName: project?.clientName || 'Sonatrach / Client Industriel',
      amountHT,
      amountTVA: vatAmount,
      amountTTC: totalTTC,
      justification: pr.justification || `Approvisionnement matériel pour ${pr.projectName}`,
      items: pr.items,
      initiatorName: pr.requestedByName,
      initiatorRole: 'RESPONSABLE_PROJET',
      initiatorDepartment: 'OPERATIONS_PROJETS',
      requiredApprovalRole: requiredApprovalLevel === 'DIRECTEUR_GENERAL' ? SystemRole.DIRECTEUR_GENERAL : (requiredApprovalLevel === 'RESPONSABLE_PROJET_ET_ACHATS' ? SystemRole.RESPONSABLE_ACHATS : SystemRole.RESPONSABLE_ACHATS),
    });

    this.addAuditLog('CREATE_PURCHASE_REQUEST', 'PROCUREMENT', pr.code, `DA ${pr.code} créée (${amountHT.toLocaleString()} DA HT, Seuil: ${requiredApprovalLevel})`, user);
    return pr;
  }

  getSuppliers() {
    return this.suppliers;
  }

  getSupplier(idOrCode: string) {
    return this.suppliers.find(s => s.id === idOrCode || s.code === idOrCode);
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

  getPurchaseOrder(idOrCode: string) {
    return this.purchaseOrders.find(p => p.id === idOrCode || p.code === idOrCode);
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

  getInventoryItem(idOrCode: string) {
    return this.inventoryItems.find(i => i.id === idOrCode || i.code === idOrCode);
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

    // ============================================================================
  // PHASE 5: INITIALISATION BASELINE RESSOURCES HUMAINES & MOBILITÉ INDUSTRIELLE
  // ============================================================================

  private initHrBaseline() {
    // 12 Collaborateurs Fictifs de Démonstration (Zéro donnée réelle)
    this.employees = [
      {
        id: 'EMP-2026-001',
        matricule: 'MAT-2026-001',
        firstName: 'Ahmed',
        lastName: 'Benyahia',
        name: 'Ahmed Benyahia',
        title: 'Chef de Chantier Tuyauterie Industrielle',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CDI',
        dailyRate: 9500,
        monthlyBaseSalaryDA: 135000,
        yearsOfExperience: 14,
        siteAssignment: 'Zone Industrielle Skikda RA1K',
        rotationCycle: '6X2',
        status: 'ACTIF',
        phone: '+213 550 00 00 01',
        email: 'ahmed.benyahia@silex-services.dz',
        hireDate: '2016-03-15',
        active: true,
      },
      {
        id: 'EMP-2026-002',
        matricule: 'MAT-2026-002',
        firstName: 'Karim',
        lastName: 'Mebarki',
        name: 'Karim Mebarki',
        title: 'Soudeur Haute Pression TIG / ARC 6G (Radio 100%)',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CDI',
        dailyRate: 8500,
        monthlyBaseSalaryDA: 110000,
        yearsOfExperience: 11,
        siteAssignment: 'Zone Industrielle Skikda RA1K',
        rotationCycle: '6X2',
        status: 'ACTIF',
        phone: '+213 550 00 00 02',
        email: 'karim.mebarki@silex-services.dz',
        hireDate: '2018-06-01',
        active: true,
      },
      {
        id: 'EMP-2026-003',
        matricule: 'MAT-2026-003',
        firstName: 'Mourad',
        lastName: 'Bouzid',
        name: 'Mourad Bouzid',
        title: 'Tuyauteur Industriel Qualifié Isométrique',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CDI',
        dailyRate: 7500,
        monthlyBaseSalaryDA: 95000,
        yearsOfExperience: 8,
        siteAssignment: 'Zone Industrielle Skikda RA1K',
        rotationCycle: '6X2',
        status: 'ACTIF',
        phone: '+213 550 00 00 03',
        email: 'mourad.bouzid@silex-services.dz',
        hireDate: '2020-02-10',
        active: true,
      },
      {
        id: 'EMP-2026-004',
        matricule: 'MAT-2026-004',
        firstName: 'Farid',
        lastName: 'Zitouni',
        name: 'Farid Zitouni',
        title: 'Superviseur Qualité & Sécurité HSE Chantier',
        department: 'HSE_QUALITE',
        contractType: 'CDI',
        dailyRate: 9000,
        monthlyBaseSalaryDA: 125000,
        yearsOfExperience: 10,
        siteAssignment: 'Zone Industrielle Skikda RA1K',
        rotationCycle: '6X2',
        status: 'ACTIF',
        phone: '+213 550 00 00 04',
        email: 'farid.zitouni@silex-services.dz',
        hireDate: '2019-09-01',
        active: true,
      },
      {
        id: 'EMP-2026-005',
        matricule: 'MAT-2026-005',
        firstName: 'Yacine',
        lastName: 'Brahimi',
        name: 'Yacine Brahimi',
        title: 'Soudeur TIG Pipe & Inox 316L (ASME IX)',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CHANTIER',
        dailyRate: 8000,
        monthlyBaseSalaryDA: 105000,
        yearsOfExperience: 7,
        siteAssignment: 'Base de Vie SILEX Hassi Messaoud',
        rotationCycle: '4X4',
        status: 'ACTIF',
        phone: '+213 550 00 00 05',
        email: 'yacine.brahimi@silex-services.dz',
        hireDate: '2022-04-15',
        active: true,
      },
      {
        id: 'EMP-2026-006',
        matricule: 'MAT-2026-006',
        firstName: 'Tarek',
        lastName: 'Meziani',
        name: 'Tarek Meziani',
        title: 'Gestionnaire Magasin Central & Logistique',
        department: 'ACHATS_LOGISTIQUE',
        contractType: 'CDI',
        dailyRate: 6500,
        monthlyBaseSalaryDA: 85000,
        yearsOfExperience: 9,
        siteAssignment: 'Magasin Central Arzew & Base Logistique',
        rotationCycle: 'LOCAL',
        status: 'ACTIF',
        phone: '+213 550 00 00 06',
        email: 'tarek.meziani@silex-services.dz',
        hireDate: '2019-11-01',
        active: true,
      },
      {
        id: 'EMP-2026-007',
        matricule: 'MAT-2026-007',
        firstName: 'Rachid',
        lastName: 'Ghezzal',
        name: 'Rachid Ghezzal',
        title: 'Monteur-Ajusteur Équipements Sous Pression',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CDD',
        dailyRate: 6000,
        monthlyBaseSalaryDA: 78000,
        yearsOfExperience: 5,
        siteAssignment: 'Zone Industrielle Skikda RA1K',
        rotationCycle: '6X2',
        status: 'ACTIF',
        phone: '+213 550 00 00 07',
        email: 'rachid.ghezzal@silex-services.dz',
        hireDate: '2023-01-10',
        active: true,
      },
      {
        id: 'EMP-2026-008',
        matricule: 'MAT-2026-008',
        firstName: 'Samir',
        lastName: 'Cherfaoui',
        name: 'Samir Cherfaoui',
        title: 'Tuyauteur Traceur Atelier & Chantier',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CDI',
        dailyRate: 7200,
        monthlyBaseSalaryDA: 92000,
        yearsOfExperience: 8,
        siteAssignment: 'Magasin Central Arzew & Base Logistique',
        rotationCycle: 'LOCAL',
        status: 'ACTIF',
        phone: '+213 550 00 00 08',
        email: 'samir.cherfaoui@silex-services.dz',
        hireDate: '2021-05-20',
        active: true,
      },
      {
        id: 'EMP-2026-009',
        matricule: 'MAT-2026-009',
        firstName: 'Djamel',
        lastName: 'Belkacem',
        name: 'Djamel Belkacem',
        title: 'Électromécanicien Maintenance Outillage & Vireurs',
        department: 'MAINTENANCE_MATERIEL',
        contractType: 'CDI',
        dailyRate: 6800,
        monthlyBaseSalaryDA: 88000,
        yearsOfExperience: 6,
        siteAssignment: 'Magasin Central Arzew & Base Logistique',
        rotationCycle: 'LOCAL',
        status: 'ACTIF',
        phone: '+213 550 00 00 09',
        email: 'djamel.belkacem@silex-services.dz',
        hireDate: '2022-09-01',
        active: true,
      },
      {
        id: 'EMP-2026-010',
        matricule: 'MAT-2026-010',
        firstName: 'Mustapha',
        lastName: 'Benali',
        name: 'Mustapha Benali',
        title: 'Ingénieur Travaux & Conduite de Projets',
        department: 'DIRECTION_TECHNIQUE',
        contractType: 'CDI',
        dailyRate: 11000,
        monthlyBaseSalaryDA: 160000,
        yearsOfExperience: 12,
        siteAssignment: 'Siège Social & Chantiers Nationaux',
        rotationCycle: 'LOCAL',
        status: 'ACTIF',
        phone: '+213 550 00 00 10',
        email: 'mustapha.benali@silex-services.dz',
        hireDate: '2017-01-05',
        active: true,
      },
      {
        id: 'EMP-2026-011',
        matricule: 'MAT-2026-011',
        firstName: 'Nabil',
        lastName: 'Khelil',
        name: 'Nabil Khelil',
        title: 'Aide-Monteur Tuyauteur Chantier',
        department: 'OPERATIONS_PROJETS',
        contractType: 'CHANTIER',
        dailyRate: 4800,
        monthlyBaseSalaryDA: 62000,
        yearsOfExperience: 3,
        siteAssignment: 'Base de Vie SILEX Hassi Messaoud',
        rotationCycle: '4X4',
        status: 'ACTIF',
        phone: '+213 550 00 00 11',
        email: 'nabil.khelil@silex-services.dz',
        hireDate: '2024-02-01',
        active: true,
      },
      {
        id: 'EMP-2026-012',
        matricule: 'MAT-2026-012',
        firstName: 'Sofiane',
        lastName: 'Mansour',
        name: 'Sofiane Mansour',
        title: 'Opérateur Contrôle CND & Épreuves Hydrostatiques',
        department: 'HSE_QUALITE',
        contractType: 'CDI',
        dailyRate: 8800,
        monthlyBaseSalaryDA: 118000,
        yearsOfExperience: 9,
        siteAssignment: 'Zone Industrielle Skikda RA1K',
        rotationCycle: '6X2',
        status: 'ACTIF',
        phone: '+213 550 00 00 12',
        email: 'sofiane.mansour@silex-services.dz',
        hireDate: '2020-10-15',
        active: true,
      },
    ];

    // Certifications Industrielles & Qualifications CQS Vérifiées
    this.industrialCertifications = [
      {
        id: 'cqs-001',
        employeeId: 'EMP-2026-002',
        employeeMatricule: 'MAT-2026-002',
        employeeName: 'Karim Mebarki',
        type: 'QUALIFICATION_SOUDAGE_CQS',
        certName: 'CQS Soudeur HP 6G - Tubes ASTM A106 Gr.B (Procédé 141/111)',
        certificateNumber: 'CQS-BV-2025-9981',
        issuingBody: 'Bureau Veritas Algérie SPA',
        issueDate: '2025-06-15',
        expiryDate: '2027-06-14',
        status: 'VALIDE',
        weldingProcess: '141 (TIG) passe de pénétration + 111 (SMAW / ARC basique)',
        weldingStandard: 'ASME IX / Sonatrach GS-EP-EXP-103',
        weldingPosition: '6G fixe inclinée à 45°',
        baseMaterial: 'P1 Acier Carbone haute température (Gr.B)',
        dimensionRange: 'Diamètre extérieur > 2" (50.8 mm), épaisseur 3.5 à 24 mm',
        verifiedBy: 'Farid Zitouni (Superviseur HSE / Qualité)',
        verifiedAt: '2025-06-20T10:00:00.000Z',
      },
      {
        id: 'cqs-002',
        employeeId: 'EMP-2026-005',
        employeeMatricule: 'MAT-2026-005',
        employeeName: 'Yacine Brahimi',
        type: 'QUALIFICATION_SOUDAGE_CQS',
        certName: 'CQS TIG Tube Inox Austénitique 316L (Procédé 141)',
        certificateNumber: 'CQS-TUV-2025-4412',
        issuingBody: 'TÜV Rheinland Algérie',
        issueDate: '2025-04-10',
        expiryDate: '2027-04-09',
        status: 'VALIDE',
        weldingProcess: '141 TIG orbital manuel sous gaz inerte Argon pur',
        weldingStandard: 'EN ISO 9606-1 / ASME IX',
        weldingPosition: '6G',
        baseMaterial: 'P8 Acier Inoxydable 316L',
        dimensionRange: 'Diamètre 1" à 8", épaisseur 2.0 à 12.5 mm',
        verifiedBy: 'Farid Zitouni',
        verifiedAt: '2025-04-15T09:30:00.000Z',
      },
      {
        id: 'cqs-003',
        employeeId: 'EMP-2026-004',
        employeeMatricule: 'MAT-2026-004',
        employeeName: 'Farid Zitouni',
        type: 'HABILITATION_ELECTRIQUE',
        certName: 'Habilitation Électrique Travaux Hors Tension B2V / BR / H0V',
        certificateNumber: 'HAB-ELEC-2026-081',
        issuingBody: 'Centre National de Formation Industrielle (CNFI)',
        issueDate: '2026-01-15',
        expiryDate: '2029-01-14',
        status: 'VALIDE',
        verifiedBy: 'Direction Technique SILEX',
        verifiedAt: '2026-01-20T14:00:00.000Z',
      },
      {
        id: 'cqs-004',
        employeeId: 'EMP-2026-001',
        employeeMatricule: 'MAT-2026-001',
        employeeName: 'Ahmed Benyahia',
        type: 'SECURITE_ESPACE_CONFINE',
        certName: 'Supervision des Interventions en Espaces Confinés & Milieu ATEX',
        certificateNumber: 'SEC-ATEX-2025-119',
        issuingBody: 'Institut Algérien du Pétrole (IAP)',
        issueDate: '2025-03-01',
        expiryDate: '2027-02-28',
        status: 'VALIDE',
        verifiedBy: 'Directeur Général SILEX',
        verifiedAt: '2025-03-05T11:00:00.000Z',
      },
      {
        id: 'cqs-005',
        employeeId: 'EMP-2026-012',
        employeeMatricule: 'MAT-2026-012',
        employeeName: 'Sofiane Mansour',
        type: 'VISITE_MEDICALE_APTITUDE',
        certName: 'Aptitude Médicale Annuelle Travaux Industriels & Hauteur',
        certificateNumber: 'MED-TRAV-2026-0045',
        issuingBody: 'Service de Médecine du Travail Wilaya de Skikda',
        issueDate: '2026-01-10',
        expiryDate: '2027-01-09',
        status: 'VALIDE',
        verifiedBy: 'Responsable RH SILEX',
        verifiedAt: '2026-01-12T09:00:00.000Z',
      },
    ];

    // Cycles de Rotation Industriels
    this.rotationCycles = [
      {
        id: 'rot-001',
        rotationCode: 'ROT-HMD-4X4',
        siteName: 'Base de Vie SILEX Hassi Messaoud & Installations Pétrolières',
        type: '4X4',
        workDays: 28,
        restDays: 28,
        cycleStartDate: '2026-10-01',
        assignedEmployeeIds: ['EMP-2026-005', 'EMP-2026-011'],
        status: 'ACTIF',
        notes: 'Rotation standard Sud : 4 semaines de travail 7j/7 puis 4 semaines de repos de récupération.',
      },
      {
        id: 'rot-002',
        rotationCode: 'ROT-SKI-6X2',
        siteName: 'Chantier Rénovation Tuyauteries Raffinerie Skikda RA1K',
        type: '6X2',
        workDays: 42,
        restDays: 14,
        cycleStartDate: '2026-10-01',
        assignedEmployeeIds: ['EMP-2026-001', 'EMP-2026-002', 'EMP-2026-003', 'EMP-2026-004', 'EMP-2026-007', 'EMP-2026-012'],
        status: 'ACTIF',
        notes: 'Régime Arrêt Technique Est : 6 semaines intensives sur site, 2 semaines de récupération.',
      },
    ];

    // Architecture des Rubriques Salariales Conformes Réglementation 2026
    this.salaryRubrics = [
      {
        code: 'R100',
        label: 'Salaire de Base Mensuel Conventionnel',
        type: 'GAIN',
        isVariable: false,
        baseFormula: 'Taux Horaire x 173.33h (SNMG 2026: 24 000 DA base)',
        isCnasSubject: true,
        isIrgSubject: true,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Décret présidentiel n° 26-01 du 07/01/2026 (SNMG)',
        status: 'VALIDEE',
      },
      {
        code: 'R110',
        label: 'Indemnité d\'Expérience Professionnelle (IEP)',
        type: 'GAIN',
        isVariable: false,
        baseFormula: 'Salaire de Base x Ancienneté x 1.5%',
        isCnasSubject: true,
        isIrgSubject: true,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Convention collective d\'entreprise Silex Services',
        status: 'VALIDEE',
      },
      {
        code: 'R120',
        label: 'Heures Supplémentaires Majorées à 50% (HS 50)',
        type: 'GAIN',
        isVariable: true,
        baseFormula: 'Taux Horaire x Heures HS x 1.5',
        isCnasSubject: true,
        isIrgSubject: true,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Loi 90-11 sur les relations de travail, art. 32',
        status: 'VALIDEE',
      },
      {
        code: 'R125',
        label: 'Heures Supplémentaires Nuit / Vendredi 100% (HS 100)',
        type: 'GAIN',
        isVariable: true,
        baseFormula: 'Taux Horaire x Heures HS x 2.0',
        isCnasSubject: true,
        isIrgSubject: true,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Loi 90-11 sur les relations de travail, art. 33',
        status: 'VALIDEE',
      },
      {
        code: 'R150',
        label: 'Indemnité de Panier de Chantier (Restauration)',
        type: 'GAIN',
        isVariable: true,
        baseFormula: '800 DA x Jours Travaillés sur Chantier',
        isCnasSubject: false, // Exonéré CNAS selon plafond fiscal
        isIrgSubject: false,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Instruction fiscale DGI & Barème frais professionnels',
        status: 'VALIDEE',
      },
      {
        code: 'R160',
        label: 'Indemnité de Transport Chantier',
        type: 'GAIN',
        isVariable: false,
        baseFormula: 'Forfait 5 000 DA / mois',
        isCnasSubject: false,
        isIrgSubject: false,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Barème professionnel transport',
        status: 'VALIDEE',
      },
      {
        code: 'R170',
        label: 'Indemnité de Nuisance & Risque Métallurgie',
        type: 'GAIN',
        isVariable: false,
        baseFormula: 'Forfait mensuel travaux en milieu confiné / chaud',
        isCnasSubject: true,
        isIrgSubject: true,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Accord d\'établissement travaux dangereux',
        status: 'VALIDEE',
      },
      {
        code: 'R180',
        label: 'Prime d\'Isolement & Zone Sud Hassi Messaoud',
        type: 'GAIN',
        isVariable: true,
        baseFormula: '1 200 DA / jour de présence sur base Sud',
        isCnasSubject: true,
        isIrgSubject: true,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Régime fiscal des zones Sud (Loi de Finances)',
        status: 'VALIDEE',
      },
      {
        code: 'R500',
        label: 'Cotisation Sécurité Sociale CNAS (Part Ouvrière 9%)',
        type: 'RETENUE',
        isVariable: true,
        baseFormula: 'Assiette Cotisable CNAS x 9.00%',
        isCnasSubject: false,
        isIrgSubject: false,
        effectiveFrom: '2015-09-03',
        regulatoryReference: 'Décret exécutif n° 15-236 du 03/09/2015 (JO n° 49)',
        status: 'VALIDEE',
      },
      {
        code: 'R600',
        label: 'Retenue à la Source IRG (Barème Progressif Mensuel)',
        type: 'RETENUE',
        isVariable: true,
        baseFormula: 'Barème progressif LF avec abattement 40% plafonné [1000, 1500] DA',
        isCnasSubject: false,
        isIrgSubject: false,
        effectiveFrom: '2026-01-01',
        regulatoryReference: 'Direction Générale des Impôts — Barème IRG Traitements & Salaires',
        status: 'VALIDEE',
      },
    ];

    // Exemples initiaux de Congés, Missions et Recrutements
    this.leaveRequests = [
      {
        id: 'lv-001',
        reference: 'LV-2026-001',
        employeeId: 'EMP-2026-003',
        employeeMatricule: 'MAT-2026-003',
        employeeName: 'Mourad Bouzid',
        title: 'Congé annuel de détente',
        leaveType: 'CONGE_PAYE',
        startDate: '2026-11-20',
        endDate: '2026-11-26',
        durationDays: 7,
        reason: 'Congé annuel de détente après phase de préfabrication',
        status: 'ACCORDE_DG',
        submittedAt: '2026-11-05T08:00:00.000Z',
        rhVisaSignature: 'VISA-RH-LV-001-OK',
        rhVisaDate: '2026-11-06T10:00:00.000Z',
        rhReviewerName: 'Responsable RH SILEX',
        dgVisaSignature: 'VISA-DG-LV-001-ACCORDE',
        dgVisaDate: '2026-11-07T14:30:00.000Z',
        certificateNumber: 'TC-2026-001',
      },
    ];

    this.missionOrders = [
      {
        id: 'mis-001',
        missionNumber: 'MIS-2026-001',
        employeeId: 'EMP-2026-010',
        employeeMatricule: 'MAT-2026-010',
        employeeName: 'Mustapha Benali',
        title: 'Supervision technique & contradictoire client Skikda',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar',
        destinationSite: 'Zone Industrielle Skikda RA1K',
        purpose: 'Assister au contrôle radiographique des soudures spools et réunion d\'avancement avec Sonatrach',
        startDate: '2026-11-15',
        endDate: '2026-11-18',
        durationDays: 4,
        transportMode: 'VEHICULE_SERVICE',
        vehiclePlate: '04821-126-31',
        advanceAmountDA: 40000,
        dailyAllowanceDA: 6500,
        totalEstimatedCostDA: 66000,
        status: 'APPROUVE_DG',
        dgVisaSignature: 'VISA-DG-MIS-001-VALIDE',
        dgVisaDate: '2026-11-10T16:00:00.000Z',
        createdAt: '2026-11-09T09:00:00.000Z',
      },
    ];

    this.recruitmentRequests = [
      {
        id: 'rec-001',
        reference: 'REC-2026-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar',
        requestedBy: 'Amine Khelifi (Chef de Projet)',
        requestedRole: 'Soudeur TIG / ARC Haute Pression 6G',
        headcountNeeded: 3,
        contractType: 'CHANTIER',
        requiredQualifications: ['CQS ASME IX 6G', 'Radio 100%', 'Aptitude médicale travaux chauds'],
        startDate: '2026-11-25',
        durationMonths: 2,
        justification: 'Accélération cadence de soudage collecteurs pour respecter jalon ODS N°03 avant redémarrage unité',
        priority: 'URGENTE',
        status: 'APPROUVE_DG',
        dgApprovalDate: '2026-11-08T11:00:00.000Z',
        candidatesCount: 5,
        createdAt: '2026-11-07T10:00:00.000Z',
      },
    ];

    this.employmentContracts = [];
    this.socialDeclarations = [];
  }


  // ============================================================================
  // PHASE 5: MÉTHODES MÉTIER RESSOURCES HUMAINES & MOBILITÉ INDUSTRIELLE
  // ============================================================================

  // --- CERTIFICATIONS INDUSTRIELLES & QUALIFICATIONS CQS ---
  getIndustrialCertifications(employeeId?: string): StoredIndustrialCertification[] {
    if (employeeId) {
      return this.industrialCertifications.filter(c => c.employeeId === employeeId);
    }
    return this.industrialCertifications;
  }

  createIndustrialCertification(data: any, user?: any): StoredIndustrialCertification {
    const emp = this.employees.find(e => e.id === data.employeeId || e.matricule === data.employeeMatricule);
    const newCert: StoredIndustrialCertification = {
      id: `cqs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employeeId: emp ? emp.id : (data.employeeId || 'EMP-2026-001'),
      employeeMatricule: emp ? emp.matricule : (data.employeeMatricule || 'MAT-2026-001'),
      employeeName: emp ? emp.name : (data.employeeName || 'Collaborateur SILEX'),
      type: data.type || 'QUALIFICATION_SOUDAGE_CQS',
      certName: data.certName || 'Qualification Soudage CQS',
      certificateNumber: data.certificateNumber || `CQS-${Date.now()}`,
      issuingBody: data.issuingBody || 'Bureau Veritas Algérie',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate || new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
      status: 'EN_ATTENTE_VERIFICATION',
      weldingProcess: data.weldingProcess,
      weldingStandard: data.weldingStandard,
      weldingPosition: data.weldingPosition,
      baseMaterial: data.baseMaterial,
      dimensionRange: data.dimensionRange,
      attachmentUrl: data.attachmentUrl,
    };

    this.industrialCertifications.unshift(newCert);
    this.addAuditLog('CREATE_CERTIFICATION', 'HR', newCert.certificateNumber, `Nouvelle qualification soumise pour ${newCert.employeeName}`, user);
    return newCert;
  }

  auditIndustrialCertification(id: string, decision: 'VALIDE' | 'REJETE', motif?: string, user?: any): StoredIndustrialCertification {
    const cert = this.industrialCertifications.find(c => c.id === id);
    if (!cert) throw new Error('Certification industrielle introuvable');

    cert.status = decision;
    cert.verifiedBy = user?.name || 'Responsable Contrôle Qualité / HSE';
    cert.verifiedAt = new Date().toISOString();
    if (decision === 'REJETE') {
      cert.rejectionReason = motif || 'Non-conformité aux exigences documentaires ou domaine de validité non respecté';
    }

    this.addAuditLog('AUDIT_CERTIFICATION', 'HR', cert.certificateNumber, `Qualification ${cert.certificateNumber} auditée: ${decision}`, user);
    return cert;
  }

  // --- DEMANDES DE CONGÉS & TITRES DE CONGÉ A4 ---
  getLeaveRequests(employeeId?: string): StoredLeaveRequest[] {
    if (employeeId) {
      return this.leaveRequests.filter(l => l.employeeId === employeeId);
    }
    return this.leaveRequests;
  }

  createLeaveRequest(data: any, user?: any): StoredLeaveRequest {
    const emp = this.employees.find(e => e.id === data.employeeId || e.matricule === data.employeeMatricule) || this.employees[0];
    const lvNum = String(this.leaveRequests.length + 1).padStart(3, '0');
    const lvRef = `LV-${new Date().getFullYear()}-${lvNum}`;

    const newLv: StoredLeaveRequest = {
      id: `lv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reference: lvRef,
      employeeId: emp.id,
      employeeMatricule: emp.matricule,
      employeeName: emp.name,
      title: data.title || `Demande de ${data.leaveType || 'congé'}`,
      leaveType: data.leaveType || 'CONGE_PAYE',
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays: Number(data.durationDays || 1),
      reason: data.reason || '',
      status: 'SOUMIS',
      submittedAt: new Date().toISOString(),
    };

    this.leaveRequests.unshift(newLv);
    this.addAuditLog('CREATE_LEAVE_REQUEST', 'HR', lvRef, `Demande de congé ${lvRef} soumise pour ${emp.name}`, user);
    return newLv;
  }

  approveLeaveRH(id: string, user?: any): StoredLeaveRequest {
    const lv = this.leaveRequests.find(l => l.id === id);
    if (!lv) throw new Error('Demande de congé introuvable');
    if (lv.status !== 'SOUMIS') throw new Error('Seule une demande au statut SOUMIS peut recevoir le visa RH');

    lv.status = 'VISE_RH';
    lv.rhVisaSignature = `VISA-RH-LV-${Date.now()}-OK`;
    lv.rhVisaDate = new Date().toISOString();
    lv.rhReviewerName = user?.name || 'Responsable Ressources Humaines';

    this.addAuditLog('VISA_RH_LEAVE', 'HR', lv.reference, `Visa RH apposé sur ${lv.reference}`, user);
    return lv;
  }

  approveLeaveDG(id: string, user?: any): StoredLeaveRequest {
    const lv = this.leaveRequests.find(l => l.id === id);
    if (!lv) throw new Error('Demande de congé introuvable');
    if (lv.status !== 'VISE_RH') throw new Error('La demande doit obligatoirement avoir reçu le visa RH préalable');

    lv.status = 'ACCORDE_DG';
    lv.dgVisaSignature = `VISA-DG-LV-${Date.now()}-ACCORDE`;
    lv.dgVisaDate = new Date().toISOString();
    lv.certificateNumber = `TC-${new Date().getFullYear()}-${String(this.leaveRequests.length).padStart(3, '0')}`;

    // Mise à jour statut employé
    const emp = this.employees.find(e => e.id === lv.employeeId);
    if (emp) emp.status = 'EN_CONGE';

    this.addAuditLog('APPROVE_LEAVE_DG', 'HR', lv.reference, `Congé ${lv.reference} accordé par la DG. Titre de congé émis : ${lv.certificateNumber}`, user);
    return lv;
  }

  // --- ORDRES DE MISSION & DÉPLACEMENTS CHANTIERS ---
  getMissionOrders(employeeId?: string): StoredMissionOrder[] {
    if (employeeId) {
      return this.missionOrders.filter(m => m.employeeId === employeeId);
    }
    return this.missionOrders;
  }

  createMissionOrder(data: any, user?: any): StoredMissionOrder {
    const emp = this.employees.find(e => e.id === data.employeeId || e.matricule === data.employeeMatricule) || this.employees[0];
    const project = data.projectId ? this.getProject(data.projectId) : undefined;
    const misNum = String(this.missionOrders.length + 1).padStart(3, '0');
    const misRef = `MIS-${new Date().getFullYear()}-${misNum}`;

    const durationDays = Number(data.durationDays || 1);
    const dailyAllowanceDA = Number(data.dailyAllowanceDA || 6500);
    const advanceAmountDA = Number(data.advanceAmountDA || 30000);
    const totalEstimatedCostDA = (durationDays * dailyAllowanceDA) + advanceAmountDA;

    const mission: StoredMissionOrder = {
      id: `mis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      missionNumber: misRef,
      employeeId: emp.id,
      employeeMatricule: emp.matricule,
      employeeName: emp.name,
      title: data.title || `Ordre de Mission ${misRef}`,
      projectId: project?.id || data.projectId,
      projectCode: project?.code || data.projectCode,
      projectName: project?.name || data.projectName || 'Chantier Industriel SILEX',
      destinationSite: data.destinationSite || project?.siteLocation || 'Site d\'intervention',
      purpose: data.purpose || 'Intervention technique de tuyauterie/soudage',
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays,
      transportMode: data.transportMode || 'VEHICULE_SERVICE',
      vehiclePlate: data.vehiclePlate || '04821-126-31',
      advanceAmountDA,
      dailyAllowanceDA,
      totalEstimatedCostDA,
      status: 'VISE_RH',
      createdAt: new Date().toISOString(),
    };

    this.missionOrders.unshift(mission);
    this.addAuditLog('CREATE_MISSION_ORDER', 'HR', misRef, `Ordre de mission ${misRef} créé pour ${emp.name}`, user);
    return mission;
  }

  approveMissionOrderDG(id: string, user?: any): StoredMissionOrder {
    const mis = this.missionOrders.find(m => m.id === id);
    if (!mis) throw new Error('Ordre de mission introuvable');

    mis.status = 'APPROUVE_DG';
    mis.dgVisaSignature = `VISA-DG-MIS-${Date.now()}-VALIDE`;
    mis.dgVisaDate = new Date().toISOString();

    const emp = this.employees.find(e => e.id === mis.employeeId);
    if (emp) emp.status = 'EN_MISSION';

    this.addAuditLog('APPROVE_MISSION_DG', 'HR', mis.missionNumber, `Ordre de mission ${mis.missionNumber} validé par la DG`, user);
    return mis;
  }

  // --- BESOINS EN RECRUTEMENT / RENFORT CHANTIER ---
  getRecruitmentRequests(projectId?: string): StoredRecruitmentRequest[] {
    if (projectId) {
      return this.recruitmentRequests.filter(r => r.projectId === projectId);
    }
    return this.recruitmentRequests;
  }

  createRecruitmentRequest(data: any, user?: any): StoredRecruitmentRequest {
    const project = data.projectId ? this.getProject(data.projectId) : undefined;
    const recNum = String(this.recruitmentRequests.length + 1).padStart(3, '0');
    const recRef = `REC-${new Date().getFullYear()}-${recNum}`;

    const rec: StoredRecruitmentRequest = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reference: recRef,
      projectId: project?.id || data.projectId || 'prj-2026-001',
      projectCode: project?.code || data.projectCode || 'PRJ-2026-001',
      projectName: project?.name || data.projectName || 'Chantier SILEX',
      requestedBy: user?.name || data.requestedBy || 'Responsable Projet',
      requestedRole: data.requestedRole || 'Tuyauteur Industriel Qualifié',
      headcountNeeded: Number(data.headcountNeeded || 1),
      contractType: data.contractType || 'CHANTIER',
      requiredQualifications: Array.isArray(data.requiredQualifications) ? data.requiredQualifications : ['CQS Soudage / ISO'],
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      durationMonths: Number(data.durationMonths || 1),
      justification: data.justification || '',
      priority: data.priority || 'NORMALE',
      status: 'SOUMIS',
      candidatesCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.recruitmentRequests.unshift(rec);
    this.addAuditLog('CREATE_RECRUITMENT_REQUEST', 'HR', recRef, `Besoin recrutement ${recRef} émis pour ${rec.requestedRole}`, user);
    return rec;
  }

  approveRecruitmentRequestDG(id: string, user?: any): StoredRecruitmentRequest {
    const rec = this.recruitmentRequests.find(r => r.id === id);
    if (!rec) throw new Error('Demande de recrutement introuvable');

    rec.status = 'APPROUVE_DG';
    rec.dgApprovalDate = new Date().toISOString();

    this.addAuditLog('APPROVE_RECRUITMENT_DG', 'HR', rec.reference, `Besoin de renfort ${rec.reference} validé par la DG`, user);
    return rec;
  }

  // --- CYCLES DE ROTATION SUD (4x4, 6x2) ---
  getRotationCycles(): StoredRotationCycle[] {
    return this.rotationCycles;
  }

  assignEmployeeToRotation(rotationId: string, employeeId: string, user?: any): StoredRotationCycle {
    const rot = this.rotationCycles.find(r => r.id === rotationId || r.rotationCode === rotationId);
    if (!rot) throw new Error('Cycle de rotation introuvable');

    if (!rot.assignedEmployeeIds.includes(employeeId)) {
      rot.assignedEmployeeIds.push(employeeId);
    }

    const emp = this.employees.find(e => e.id === employeeId);
    if (emp) emp.rotationCycle = rot.type;

    this.addAuditLog('ASSIGN_ROTATION', 'HR', rot.rotationCode, `Collaborateur ${emp?.name || employeeId} affecté à la rotation ${rot.rotationCode}`, user);
    return rot;
  }

  // --- RUBRIQUES SALARIALES & MOTEUR DE SIMULATION PAIE DEMO 2026 ---
  getSalaryRubrics(): StoredSalaryRubricConfig[] {
    return this.salaryRubrics;
  }

  calculatePayslipDemo(employeeId: string, options: {
    periodMonth?: number;
    periodYear?: number;
    workedDays?: number;
    overtimeHours50?: number;
    overtimeHours100?: number;
  } = {}): StoredPayslipDemo {
    const emp = this.employees.find(e => e.id === employeeId || e.matricule === employeeId) || this.employees[0];
    const month = options.periodMonth || (new Date().getMonth() + 1);
    const year = options.periodYear || new Date().getFullYear();

    const baseSalary = Number(emp.monthlyBaseSalaryDA || 85000);
    const hourlyRate = Math.round((baseSalary / 173.33) * 100) / 100; // Base 40h/semaine = 173.33h/mois
    const expYears = Number(emp.yearsOfExperience || 5);

    // R110 : IEP = Salaire de base x Années x 1.5%
    const iepAmountDA = Math.round(baseSalary * expYears * 0.015);

    // Heures Supplémentaires
    const hs50Count = Number(options.overtimeHours50 || 0);
    const hs100Count = Number(options.overtimeHours100 || 0);
    const hsAmountDA = Math.round((hs50Count * hourlyRate * 1.5) + (hs100Count * hourlyRate * 2.0));

    // Nuisance et Risque (milieu industriel haute pression / chaud)
    const nuisanceAmountDA = 12000;

    // Assiette Soumise à Cotisation CNAS (Part Ouvrière 9%)
    const cnasBaseDA = baseSalary + iepAmountDA + hsAmountDA + nuisanceAmountDA;
    const cnasDeduction9Pct = Math.round(cnasBaseDA * 0.09); // Décret 15-236 : 9%

    // Primes et Indemnités Non Cotisables CNAS
    const workedDays = Number(options.workedDays || 22);
    const siteBasketAmountDA = workedDays * 800; // 800 DA / jour de panier
    const transportAmountDA = 5000; // 5 000 DA forfait transport

    // Prime de Zone Sud si affectation Hassi Messaoud
    const isSouth = (emp.siteAssignment || '').includes('Hassi Messaoud') || emp.rotationCycle === '4X4';
    const zoneSouthAllowanceDA = isSouth ? (workedDays * 1200) : 0;

    // Salaire Brut Global
    const grossSalaryDA = cnasBaseDA + siteBasketAmountDA + transportAmountDA + zoneSouthAllowanceDA;

    // Salaire Imposable à l'IRG = Assiette CNAS - Cotisation CNAS 9% (+ indemnités imposables)
    // Selon CGI : Panier et transport justifiés non imposables dans les limites légales
    const taxableSalaryDA = Math.max(0, cnasBaseDA - cnasDeduction9Pct + (zoneSouthAllowanceDA * 0.5));

    // ========================================================================
    // CALCUL OFFICIEL DE L'IRG SELON LE BARÈME PROGRESSIF ET LES CIRCULAIRES DGI
    // ========================================================================
    // Tranches du barème progressif mensuel :
    // - 0 à 20 000 DA : 0%
    // - 20 001 à 40 000 DA : 23%
    // - 40 001 à 80 000 DA : 27%
    // - 80 001 à 160 000 DA : 30%
    // - 160 001 à 320 000 DA : 33%
    // - Supérieur à 320 000 DA : 35%
    let rawIrg = 0;
    if (taxableSalaryDA > 20000) {
      if (taxableSalaryDA <= 40000) {
        rawIrg = (taxableSalaryDA - 20000) * 0.23;
      } else if (taxableSalaryDA <= 80000) {
        rawIrg = (20000 * 0.23) + ((taxableSalaryDA - 40000) * 0.27);
      } else if (taxableSalaryDA <= 160000) {
        rawIrg = (20000 * 0.23) + (40000 * 0.27) + ((taxableSalaryDA - 80000) * 0.30);
      } else if (taxableSalaryDA <= 320000) {
        rawIrg = (20000 * 0.23) + (40000 * 0.27) + (80000 * 0.30) + ((taxableSalaryDA - 160000) * 0.33);
      } else {
        rawIrg = (20000 * 0.23) + (40000 * 0.27) + (80000 * 0.30) + (160000 * 0.33) + ((taxableSalaryDA - 320000) * 0.35);
      }
    }

    let firstRebate = 0;
    let secondRebate = 0;
    let irgTaxAmountDA = 0;

    // Condition d'exonération totale : salaires imposables <= 30 000 DA
    if (taxableSalaryDA <= 30000) {
      irgTaxAmountDA = 0;
      firstRebate = 0;
      secondRebate = 0;
    } else {
      // 1. Premier abattement général de 40% plafonné entre 1 000 DA (plancher) et 1 500 DA (plafond)
      firstRebate = Math.max(1000, Math.min(1500, rawIrg * 0.40));
      const irgAfterFirst = Math.max(0, rawIrg - firstRebate);

      // 2. Deuxième abattement spécifique DGI pour salaires entre 30 001 et 35 000 DA :
      // Formule légale DGI : IRG = IRG_apres_premier x (137/51) - (27925/8)
      if (taxableSalaryDA > 30000 && taxableSalaryDA < 35000) {
        const calculatedWithSecond = (irgAfterFirst * (137 / 51)) - (27925 / 8);
        irgTaxAmountDA = Math.max(0, Math.round(calculatedWithSecond));
        secondRebate = Math.max(0, Math.round(irgAfterFirst - irgTaxAmountDA));
      } else {
        irgTaxAmountDA = Math.round(irgAfterFirst);
      }
    }

    // Décomposition des cotisations sociales CNAS selon la Loi 83-11 et 83-12 et Décret 15-236
    // Assiette cotisable : cnasBaseDA
    const cnasEmployeeBreakdown = {
      assurancesSocialesEmployee9Pct: cnasDeduction9Pct,
      maladieMaterniteInvaliditeDeces: Math.round(cnasBaseDA * 0.015), // 1.5%
      vieillesseRetraite: Math.round(cnasBaseDA * 0.0675),              // 6.75%
      assuranceChomage: Math.round(cnasBaseDA * 0.005),                 // 0.5%
      retraiteAnticipee: Math.round(cnasBaseDA * 0.0025),               // 0.25%
    };

    const cnasEmployerBreakdown = {
      assurancesSocialesEmployer26Pct: Math.round(cnasBaseDA * 0.26),  // 26% légal CNAS
      maladieMaterniteInvaliditeDeces: Math.round(cnasBaseDA * 0.125), // 12.5%
      vieillesseRetraite: Math.round(cnasBaseDA * 0.100),              // 10.0%
      accidentsTravailMaladiesProf: Math.round(cnasBaseDA * 0.0125),   // 1.25%
      assuranceChomage: Math.round(cnasBaseDA * 0.010),                // 1.0%
      retraiteAnticipee: Math.round(cnasBaseDA * 0.0025),              // 0.25%
      oeuvresSocialesFOS: Math.round(cnasBaseDA * 0.010),              // 1.0% contribution FOS employeur
      totalEmployerContribution: Math.round(cnasBaseDA * 0.27),       // 26% CNAS + 1% FOS
    };

    // Net à Payer
    const netPayableDA = grossSalaryDA - cnasDeduction9Pct - irgTaxAmountDA;

    const slipNum = `BS-DEMO-${year}-${String(month).padStart(2, '0')}-${emp.matricule}`;

    const payslip: StoredPayslipDemo = {
      id: `bs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slipNumber: slipNum,
      employeeId: emp.id,
      employeeMatricule: emp.matricule,
      employeeName: emp.name,
      title: emp.title,
      department: emp.department || 'OPERATIONS_PROJETS',
      periodMonth: month,
      periodYear: year,
      workedDays,
      workedHours: 173,
      overtimeHours50: hs50Count,
      overtimeHours100: hs100Count,
      baseSalaryDA: baseSalary,
      iepAmountDA,
      siteBasketAmountDA,
      transportAmountDA,
      nuisanceAmountDA,
      zoneSouthAllowanceDA,
      overtimeAmountDA: hsAmountDA,
      grossSalaryDA,
      cnasBaseDA,
      cnasDeduction9Pct,
      cnasEmployeeBreakdown,
      cnasEmployerBreakdown,
      taxableSalaryDA,
      rawIrg: Math.round(rawIrg),
      firstIrgRebate: Math.round(firstRebate),
      secondIrgRebate: Math.round(secondRebate),
      irgTaxAmountDA,
      netPayableDA,
      isDemoSimulation: true,
      calculatedAt: new Date().toISOString(),
    };

    return payslip;
  }

  // --- KPIS RESSOURCES HUMAINES & MOBILITÉ ---
  getHrKpis() {
    const totalEmployees = this.employees.length;
    const activeEmployees = this.employees.filter(e => e.active && e.status !== 'INACTIF' && e.status !== 'SORTI').length;
    const onMissionCount = this.employees.filter(e => e.status === 'EN_MISSION').length;
    const onLeaveCount = this.employees.filter(e => e.status === 'EN_CONGE').length;
    
    // Taux de certifications valides
    const totalCerts = this.industrialCertifications.length;
    const validCerts = this.industrialCertifications.filter(c => c.status === 'VALIDE').length;
    const certComplianceRate = totalCerts > 0 ? Math.round((validCerts / totalCerts) * 100) : 100;

    // Missions actives
    const pendingMissionsCount = this.missionOrders.filter(m => m.status === 'VISE_RH').length;
    const approvedMissionsCount = this.missionOrders.filter(m => m.status === 'APPROUVE_DG').length;

    // Congés en attente DG
    const pendingLeavesCount = this.leaveRequests.filter(l => l.status === 'VISE_RH' || l.status === 'SOUMIS').length;

    // Recrutements chantiers ouverts
    const openRecruitmentsCount = this.recruitmentRequests.filter(r => r.status === 'SOUMIS' || r.status === 'APPROUVE_DG').length;

    return {
      totalEmployees,
      activeEmployees,
      onMissionCount,
      onLeaveCount,
      totalCertifications: totalCerts,
      validCertifications: validCerts,
      certComplianceRate,
      pendingMissionsCount,
      approvedMissionsCount,
      pendingLeavesCount,
      openRecruitmentsCount,
    };
  }

  // --- CONTRATS DE TRAVAIL NORMALISÉS (CDI, CDD, STAGIAIRE, FIDÉLITÉ) ---
  getEmploymentContracts(employeeId?: string): StoredEmploymentContract[] {
    if (employeeId) {
      return this.employmentContracts.filter(c => c.employeeId === employeeId);
    }
    return this.employmentContracts;
  }

  createEmploymentContract(data: any, user?: any): StoredEmploymentContract {
    const emp = this.employees.find(e => e.id === data.employeeId || e.matricule === data.employeeMatricule);
    const num = String(this.employmentContracts.length + 1).padStart(3, '0');
    const ref = `CTR-RH-${new Date().getFullYear()}-${num}`;

    const newContract: StoredEmploymentContract = {
      id: `ctr-${Date.now()}`,
      reference: ref,
      employeeId: emp ? emp.id : (data.employeeId || 'EMP-001'),
      employeeMatricule: emp ? emp.matricule : (data.employeeMatricule || 'MAT-001'),
      employeeName: emp ? (emp.name || `${emp.firstName} ${emp.lastName}`) : (data.employeeName || 'Collaborateur'),
      contractType: data.contractType || 'CDI',
      title: data.title || (emp ? emp.title : 'Technicien Supérieur'),
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate,
      trialPeriodMonths: Number(data.trialPeriodMonths ?? 3),
      monthlyBaseSalaryDA: Number(data.monthlyBaseSalaryDA || (emp ? (emp.dailyBaseRate || 5000) * 22 : 60000)),
      dailyAllowanceDA: Number(data.dailyAllowanceDA || 1500),
      loyaltyBonusDA: Number(data.loyaltyBonusDA || 0),
      projectCode: data.projectCode,
      siteLocation: data.siteLocation || 'Base Opérationnelle & Chantiers Nationaux',
      specialClauses: data.specialClauses || '',
      status: 'ACTIF',
      signedByEmployee: true,
      signedByDG: true,
      createdAt: new Date().toISOString(),
    };

    this.employmentContracts.unshift(newContract);
    this.addAuditLog('CREATE_EMPLOYMENT_CONTRACT', 'HR', ref, `Contrat ${newContract.contractType} établi pour ${newContract.employeeName}`, user);
    return newContract;
  }

  // --- DÉCLARATIONS SOCIALES & FISCALES (CNAS, CASNOS, ATS, ACCIDENTS) ---
  getSocialDeclarations(type?: string): StoredSocialDeclaration[] {
    if (type) {
      return this.socialDeclarations.filter(d => d.type === type);
    }
    return this.socialDeclarations;
  }

  createSocialDeclaration(data: any, user?: any): StoredSocialDeclaration {
    const num = String(this.socialDeclarations.length + 1).padStart(3, '0');
    const ref = `DEC-CNAS-${new Date().getFullYear()}-${num}`;

    const gross = Number(data.grossBaseDA || 0);
    const empContrib = Math.round(gross * 0.09);
    const emplContrib = Math.round(gross * 0.26);
    const totContrib = empContrib + emplContrib;

    const newDec: StoredSocialDeclaration = {
      id: `dec-${Date.now()}`,
      reference: ref,
      type: data.type || 'ATS',
      period: data.period || `${new Date().getFullYear()}-M${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      employeeId: data.employeeId,
      employeeMatricule: data.employeeMatricule,
      employeeName: data.employeeName,
      declarationDate: data.declarationDate || new Date().toISOString().split('T')[0],
      grossBaseDA: gross,
      employeeContributionDA: empContrib,
      employerContributionDA: emplContrib,
      totalContributionDA: totContrib,
      accidentDate: data.accidentDate,
      accidentTime: data.accidentTime,
      accidentSite: data.accidentSite,
      injuryDescription: data.injuryDescription,
      witnesses: data.witnesses,
      workStoppageDays: Number(data.workStoppageDays || 0),
      status: data.status || 'TRANSMIS',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.socialDeclarations.unshift(newDec);
    this.addAuditLog('SOCIAL_DECLARATION', 'HR', ref, `Déclaration sociale ${newDec.type} enregistrée pour la période ${newDec.period}`, user);
    return newDec;
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

  // --- QUALITY, QHSE, GED & WELD BOOK UNITAIRE ---
  getNonConformities(projectId?: string): StoredNonConformity[] {
    if (projectId) {
      return this.nonConformities.filter(nc => nc.projectId === projectId || nc.projectCode === projectId);
    }
    return this.nonConformities;
  }

  getNonConformity(idOrCode: string): StoredNonConformity | undefined {
    return this.nonConformities.find(nc => nc.id === idOrCode || nc.ncNumber === idOrCode || nc.code === idOrCode);
  }

  createNonConformity(data: any, user?: any): StoredNonConformity {
    const nextNum = this.nonConformities.length + 1;
    const ncNumber = data.ncNumber || `FNC-2026-${String(nextNum).padStart(3, '0')}`;
    
    let projectObj: { id: string; code: string; name: string } | undefined = undefined;
    let projId = data.projectId;
    let projCode = data.projectCode;
    let projName = data.projectName;

    if (projId || projCode) {
      const p = this.getProject(projId || projCode);
      if (p) {
        projId = p.id;
        projCode = p.code;
        projName = p.name;
        projectObj = { id: p.id, code: p.code, name: p.name };
      }
    }

    const initialActions: StoredNonConformityAction[] = [];
    if (Array.isArray(data.actions) && data.actions.length > 0) {
      initialActions.push(...data.actions);
    } else if (data.correctiveAction) {
      initialActions.push({
        id: `act-${Date.now()}-01`,
        description: data.correctiveAction,
        responsible: data.correctiveActionResp || 'Chef de Chantier',
        targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
      });
    }

    const nc: StoredNonConformity = {
      id: `nc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ncNumber,
      code: ncNumber,
      title: data.title || 'Fiche de Non-Conformité',
      description: data.description || '',
      severity: data.severity || 'MAJEURE',
      status: (data.status as any) || 'OPEN',
      detectedBy: data.detectedBy || user?.name || 'Inspecteur CND SILEX',
      detectedDate: data.detectedDate || new Date().toISOString(),
      projectId: projId,
      projectCode: projCode,
      projectName: projName,
      project: projectObj,
      weldJointNumber: data.weldJointNumber,
      rootCause: data.rootCause || '',
      resolutionNotes: data.resolutionNotes || '',
      closeType: data.closeType,
      actions: initialActions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.nonConformities.unshift(nc);
    this.addAuditLog('CREATE_NON_CONFORMITY', 'QUALITY', nc.ncNumber, `FNC ouverte : ${nc.ncNumber} - ${nc.title} (Gravité ${nc.severity})`, user);
    return nc;
  }

  updateNonConformityStatus(idOrCode: string, updateData: any, user?: any): StoredNonConformity {
    const nc = this.getNonConformity(idOrCode);
    if (!nc) {
      throw new Error(`Fiche de non-conformité introuvable : ${idOrCode}`);
    }

    if (updateData.status) {
      nc.status = updateData.status;
      if (updateData.status === 'CLOSED') {
        nc.closedBy = user?.name || 'Direction Qualité SILEX';
        nc.closedDate = new Date().toISOString();
      }
    }

    if (updateData.closeType) {
      nc.closeType = updateData.closeType;
    }

    if (updateData.resolutionNotes) {
      nc.resolutionNotes = updateData.resolutionNotes;
      if (!nc.rootCause) {
        nc.rootCause = updateData.resolutionNotes;
      }
    }

    if (updateData.rootCause) {
      nc.rootCause = updateData.rootCause;
    }

    nc.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_NON_CONFORMITY_STATUS', 'QUALITY', nc.ncNumber, `Statut FNC ${nc.ncNumber} mis à jour : ${nc.status} (${nc.closeType || 'Clôture directe'})`, user);
    return nc;
  }

  addNonConformityAction(idOrCode: string, actionData: any, user?: any): { action: StoredNonConformityAction; nonConformity: StoredNonConformity } {
    const nc = this.getNonConformity(idOrCode);
    if (!nc) {
      throw new Error(`Fiche de non-conformité introuvable : ${idOrCode}`);
    }

    const action: StoredNonConformityAction = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: actionData.description || 'Action corrective d\'éradication',
      responsible: actionData.responsible || 'Responsable Qualité Chantier',
      targetDate: actionData.targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: actionData.status || 'IN_PROGRESS',
    };

    if (!nc.actions) nc.actions = [];
    nc.actions.push(action);

    if (nc.status === 'OPEN') {
      nc.status = 'UNDER_INVESTIGATION';
    }

    nc.updatedAt = new Date().toISOString();
    this.addAuditLog('ADD_NON_CONFORMITY_ACTION', 'QUALITY', nc.ncNumber, `Action corrective ajoutée sur ${nc.ncNumber} : ${action.description} (${action.responsible})`, user);
    return { action, nonConformity: nc };
  }

  getQualityDocuments(category?: string): StoredQualityDocument[] {
    if (category) {
      return this.qualityDocuments.filter(d => d.category?.toUpperCase() === category.toUpperCase());
    }
    return this.qualityDocuments;
  }

  getQualityDocument(idOrNumber: string): StoredQualityDocument | undefined {
    return this.qualityDocuments.find(d => d.id === idOrNumber || d.docNumber === idOrNumber);
  }

  createQualityDocument(data: any, user?: any): StoredQualityDocument {
    const nextNum = this.qualityDocuments.length + 1;
    const docNumber = data.docNumber || `DOC-2026-${String(nextNum).padStart(3, '0')}`;
    const initialVersion = data.version || '1.0';

    const doc: StoredQualityDocument = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      docNumber,
      title: data.title || 'Procédure Qualité SILEX',
      category: data.category || 'PROCEDURE',
      author: data.author || user?.name || 'Direction Technique SILEX',
      version: initialVersion,
      status: data.status || 'VALIDE',
      revisions: [
        {
          revision: initialVersion,
          changeNotes: data.changeNotes || 'Édition initiale enregistrée dans la GED',
          author: data.author || user?.name || 'Direction Technique SILEX',
          date: new Date().toISOString().split('T')[0],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.qualityDocuments.push(doc);
    this.addAuditLog('CREATE_QUALITY_DOC', 'QUALITY', doc.docNumber, `Document qualité déposé en GED : ${doc.docNumber} - ${doc.title} (v${doc.version})`, user);
    return doc;
  }

  addQualityDocumentRevision(idOrNumber: string, revData: any, user?: any): StoredQualityDocument {
    const doc = this.getQualityDocument(idOrNumber);
    if (!doc) {
      throw new Error(`Document qualité introuvable : ${idOrNumber}`);
    }

    const newRev = revData.version || revData.revision || `${(parseFloat(doc.version) + 0.1).toFixed(1)}`;
    const revisionItem: StoredQualityDocRevision = {
      revision: newRev,
      changeNotes: revData.changeNotes || 'Mise à jour et révision technique',
      author: revData.author || user?.name || 'Direction Technique SILEX',
      date: revData.date || new Date().toISOString().split('T')[0],
    };

    if (!doc.revisions) doc.revisions = [];
    doc.revisions.push(revisionItem);
    doc.version = newRev;
    doc.updatedAt = new Date().toISOString();

    this.addAuditLog('UPDATE_QUALITY_DOC_REVISION', 'QUALITY', doc.docNumber, `Nouvelle révision ${newRev} pour ${doc.docNumber} : ${revisionItem.changeNotes}`, user);
    return doc;
  }

  // --- WELD BOOK & SOUDURES INDUSTRIELLES (ASME IX / ISO 9606) ---
  getWeldJoints(projectId?: string): StoredWeldJoint[] {
    if (projectId) {
      return this.weldJoints.filter(w => w.projectId === projectId || w.projectCode === projectId);
    }
    return this.weldJoints;
  }

  getWeldJoint(idOrNumber: string): StoredWeldJoint | undefined {
    return this.weldJoints.find(w => w.id === idOrNumber || w.jointNumber === idOrNumber);
  }

  createWeldJoint(data: any, user?: any): StoredWeldJoint {
    const nextIdx = this.weldJoints.length + 1;
    const jointNumber = data.jointNumber || `J-${String(nextIdx).padStart(2, '0')}-SOUDL`;

    let projId = data.projectId;
    let projCode = data.projectCode;
    let projName = data.projectName;

    if (projId || projCode) {
      const p = this.getProject(projId || projCode);
      if (p) {
        projId = p.id;
        projCode = p.code;
        projName = p.name;
      }
    }

    if (!projCode) projCode = 'PRJ-2026-001';
    if (!projName) projName = 'Chantier Rénovation Tuyauteries';

    const visualStatus = data.visualInspection?.status || (data.status === 'REJETE' ? 'NON_CONFORME' : 'CONFORME');
    const cndStatus = data.cndInspection?.status || (data.status === 'EN_ATTENTE_CND' ? 'EN_ATTENTE_CND' : 'CONFORME');

    const weld: StoredWeldJoint = {
      id: data.id || `weld-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jointNumber,
      projectId: projId,
      projectCode: projCode,
      projectName: projName,
      lineIso: data.lineIso || 'ISO-DN150-STD',
      spoolId: data.spoolId || 'SPL-01',
      diameterNominal: data.diameterNominal || 'DN150 (6")',
      thicknessMm: Number(data.thicknessMm) || 7.11,
      material: data.material || 'Acier Carbone ASTM A106 Gr.B',
      heatNumberPipe: data.heatNumberPipe || '',
      heatNumberFitting: data.heatNumberFitting || '',
      welderName: data.welderName || data.welder || 'Amar Bouzid',
      welderStamp: data.welderStamp || 'S-02',
      welderCqsRef: data.welderCqsRef || 'CQS-BV-2026-088',
      weldingProcess: data.weldingProcess || 'TIG 141 racine + SMAW 111 remplissage',
      dmosRef: data.dmosRef || data.dmos || 'DMOS-01-ASME-IX',
      weldDate: data.weldDate || data.date || new Date().toISOString().split('T')[0],
      visualInspection: {
        status: visualStatus,
        inspectorName: data.visualInspection?.inspectorName || data.inspector || user?.name || 'Inspecteur VT SILEX',
        date: data.visualInspection?.date || new Date().toISOString().split('T')[0],
        notes: data.visualInspection?.notes || 'Contrôle visuel d\'aspect géométrique',
      },
      cndInspection: {
        type: data.cndInspection?.type || data.cnd || data.cndType || '100% Ressuage PT + 100% Radio RT',
        requiredRatePercent: data.cndInspection?.requiredRatePercent || 100,
        status: cndStatus,
        cndReportRef: data.cndInspection?.cndReportRef || data.cndReportRef,
        filmRef: data.cndInspection?.filmRef || data.filmRef,
        controlDate: data.cndInspection?.controlDate || (cndStatus !== 'EN_ATTENTE_CND' ? new Date().toISOString().split('T')[0] : undefined),
        controllingBody: data.cndInspection?.controllingBody || data.inspector || 'Bureau Veritas Algérie (COFREND II)',
        defectType: data.cndInspection?.defectType || data.defectType,
      },
      repairHistory: data.repairHistory || [],
      status: (data.status as any) || (cndStatus === 'EN_ATTENTE_CND' ? 'EN_ATTENTE_CND' : 'CONFORME'),
      createdAt: new Date().toISOString(),
    };

    this.weldJoints.unshift(weld);
    this.addAuditLog('CREATE_WELD_JOINT', 'QUALITY', weld.jointNumber, `Joint de soudure ${weld.jointNumber} consigné au Weld Book (${weld.lineIso}, nuance ${weld.material}, soudeur ${weld.welderStamp})`, user);
    return weld;
  }

  recordWeldCndResult(idOrNumber: string, data: any, user?: any): StoredWeldJoint {
    const weld = this.getWeldJoint(idOrNumber);
    if (!weld) {
      throw new Error(`Joint de soudure introuvable : ${idOrNumber}`);
    }

    const cndStatus: 'CONFORME' | 'A_REPARER' | 'COUPE' | 'EN_ATTENTE_CND' = data.status || 'CONFORME';

    weld.cndInspection = {
      type: data.type || weld.cndInspection.type,
      requiredRatePercent: data.requiredRatePercent ?? weld.cndInspection.requiredRatePercent,
      status: cndStatus,
      cndReportRef: data.cndReportRef || weld.cndInspection.cndReportRef || `RAP-RT-${Date.now().toString().slice(-4)}`,
      filmRef: data.filmRef || weld.cndInspection.filmRef,
      controlDate: data.controlDate || new Date().toISOString().split('T')[0],
      controllingBody: data.controllingBody || weld.cndInspection.controllingBody,
      defectType: data.defectType || (cndStatus === 'A_REPARER' ? 'Défaut interne' : undefined),
    };

    if (cndStatus === 'CONFORME') {
      weld.status = 'CONFORME';
    } else if (cndStatus === 'A_REPARER') {
      weld.status = 'A_REPARER';

      if (data.autoCreateFnc) {
        this.createNonConformity({
          title: `Défaut CND sur joint ${weld.jointNumber} (${data.defectType || 'Inclusion/Porosité'})`,
          description: `Contrôle CND ${weld.cndInspection.type} non-conforme : ${data.defectType || 'Défaut de compacité'}. Rapport ${weld.cndInspection.cndReportRef}, contrôlé par ${weld.cndInspection.controllingBody}.`,
          severity: 'MAJEURE',
          detectedBy: weld.cndInspection.controllingBody,
          projectId: weld.projectId,
          projectCode: weld.projectCode,
          weldJointNumber: weld.jointNumber,
        }, user);
      }
    } else if (cndStatus === 'COUPE') {
      weld.status = 'REJETE';
    }

    this.addAuditLog('RECORD_WELD_CND_RESULT', 'QUALITY', weld.jointNumber, `Contrôle CND enregistré pour ${weld.jointNumber} : ${cndStatus} (${weld.cndInspection.type}, rapport ${weld.cndInspection.cndReportRef || 'N/A'})`, user);
    return weld;
  }

  recordWeldRepair(idOrNumber: string, data: any, user?: any): StoredWeldJoint {
    const weld = this.getWeldJoint(idOrNumber);
    if (!weld) {
      throw new Error(`Joint de soudure introuvable : ${idOrNumber}`);
    }

    if (!weld.repairHistory) weld.repairHistory = [];
    const repairIndex = weld.repairHistory.length + 1;
    const postCndStatus: 'CONFORME' | 'NON_CONFORME' = data.postRepairCndStatus || 'CONFORME';

    const repairItem = {
      repairIndex,
      repairDate: data.repairDate || new Date().toISOString().split('T')[0],
      repairWelderStamp: data.repairWelderStamp || 'S-02',
      repairDmosRef: data.repairDmosRef || 'DMOS-REP-01',
      postRepairCndStatus: postCndStatus,
      postRepairReportRef: data.postRepairReportRef || `RAP-RT-REP-${repairIndex}`,
      notes: data.notes || 'Gougeage complet du cordon défectueux et reprise de passe sous flux protecteur argon',
    };

    weld.repairHistory.push(repairItem);

    if (postCndStatus === 'CONFORME') {
      weld.status = 'REPARE_CONFORME';
      weld.cndInspection.status = 'CONFORME';
      weld.cndInspection.cndReportRef = repairItem.postRepairReportRef;
    } else {
      weld.status = 'A_REPARER';
      weld.cndInspection.status = 'A_REPARER';
    }

    this.addAuditLog('RECORD_WELD_REPAIR', 'QUALITY', weld.jointNumber, `Réparation n°${repairIndex} consignée pour joint ${weld.jointNumber} : CND post-réparation ${postCndStatus}`, user);
    return weld;
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

  getFinanceOverview(options?: { includeDemo?: boolean }) {
    const includeDemo = options?.includeDemo !== undefined ? options.includeDemo : true;

    // Filtrer les comptes et transactions selon le contexte DEMO / PRODUCTION
    const relevantAccounts = this.financialAccounts.filter(a => includeDemo || !a.isDemoAccount);
    const relevantInvoices = this.customerInvoices.filter(i => includeDemo || !i.isDemoInvoice);
    const relevantSupplierInvoices = this.supplierInvoices.filter(i => includeDemo || !i.isDemoInvoice);
    const relevantTransactions = this.cashTransactions.filter(t => {
      const acc = this.financialAccounts.find(a => a.id === t.accountId);
      return includeDemo || !acc?.isDemoAccount;
    });

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

    // Calcul de trésorerie réel basé sur les comptes filtrés
    const actualCashBalance = relevantAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

    const totalCollected = relevantTransactions
      .filter(t => t.type === 'ENCAISSEMENT_CLIENT' && t.status === 'VALIDE')
      .reduce((sum, pay) => sum + (pay.amount || 0), 0);

    const clientReceivables = relevantInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
    const supplierPayables = relevantSupplierInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);

    const pendingCollection = Math.max(0, totalBilled - totalCollected);
    const totalPOExpenditure = this.purchaseOrders.reduce((sum, po) => sum + (po.totalHT || 0), 0);
    const treasuryBalance = actualCashBalance > 0 ? actualCashBalance : (totalCollected - totalPOExpenditure);

    return {
      kpis: {
        totalContracted,
        totalBilled,
        totalCollected,
        pendingCollection,
        warrantyHeld: totalWarrantyHeld,
        treasuryBalance,
        actualCashBalance,
        clientReceivables,
        supplierPayables,
        workingCapitalNeed: clientReceivables - supplierPayables,
      },
      summary: {
        totalBilled,
        totalCollected,
        pendingCollection,
        warrantyHeld: totalWarrantyHeld,
        treasuryBalance,
        actualCashBalance,
        clientReceivables,
        supplierPayables,
      },
      projects: projectOverviews,
      distribution: this.getCostDistribution(),
      isDemoIncluded: includeDemo,
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
    if (this.customerInvoices && this.customerInvoices.length > 0) {
      return this.customerInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
    }
    let billed = 0;
    for (const p of this.projects) {
      billed += p.workSituations.reduce((sum, s) => sum + (s.amountHT || 0), 0);
    }
    const collected = this.financePayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    return Math.max(0, billed - collected);
  }

  private calculateSupplierPayables(): number {
    if (this.supplierInvoices && this.supplierInvoices.length > 0) {
      return this.supplierInvoices.reduce((sum, inv) => sum + (inv.remainingAmount || 0), 0);
    }
    return this.purchaseOrders.reduce((sum, po) => sum + (po.totalHT || 0), 0);
  }

  // ==========================================

  // ==========================================
  // --- MODULE 06 : FINANCE, TRÉSORERIE & COMPTABILITÉ CLIENT/FOURNISSEUR ---
  // ==========================================

  private initFinanceBaseline() {
    // 1. Comptes bancaires et caisses Démo (Strictement isolés)
    this.financialAccounts = [
      {
        id: 'cpt-demo-01',
        code: 'CPT-BEA-01',
        name: 'Compte Courant Exploitation BEA Arzew',
        type: 'BANQUE_COURANT',
        bankName: 'Banque Extérieure d’Algérie (BEA) — Agence Arzew',
        ribNumber: '002 00050 0500123456 78',
        currency: 'DZD',
        initialBalance: 45000000,
        currentBalance: 45000000,
        isDemoAccount: false,
        isActive: true,
        notes: 'Compte principal pour les règlements clients et fournisseurs industriels Démo',
        createdAt: '2026-10-01T08:00:00Z',
        updatedAt: '2026-11-10T12:00:00Z',
      },
      {
        id: 'cpt-demo-02',
        code: 'CPT-BNA-02',
        name: 'Compte Investissement & Équipements BNA Oran',
        type: 'BANQUE_INVESTISSEMENT',
        bankName: 'Banque Nationale d’Algérie (BNA) — Agence Oran',
        ribNumber: '001 00010 0100987654 32',
        currency: 'DZD',
        initialBalance: 25000000,
        currentBalance: 25000000,
        isDemoAccount: false,
        isActive: true,
        notes: 'Ligne de financement Démo dédiée aux acquisitions machines et outillages HP',
        createdAt: '2026-10-01T08:00:00Z',
        updatedAt: '2026-11-10T12:00:00Z',
      },
      {
        id: 'cpt-demo-03',
        code: 'CPT-REG-03',
        name: 'Caisse Régie Chantier Skikda RA1K',
        type: 'CAISSE_CHANTIER',
        bankName: 'Caisse Menues Dépenses Chantier Skikda',
        ribNumber: 'N/A (Caisse physique Démo)',
        currency: 'DZD',
        initialBalance: 1500000,
        currentBalance: 1500000,
        isDemoAccount: false,
        isActive: true,
        notes: 'Avances et frais de vie déboursés sur le chantier Skikda Démo',
        createdAt: '2026-10-05T08:00:00Z',
        updatedAt: '2026-11-10T12:00:00Z',
      },
    ];

    // 2. Factures Clients Démo issues de situations contractuelles
    this.customerInvoices = [
      {
        id: 'fac-cli-2026-001',
        invoiceNumber: 'FAC-2026-001',
        clientId: 'cli-sonatrach-skikda',
        clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        workSituationId: 'sit-001',
        workSituationNumber: 'SIT-PRJ-2026-001-01',
        issueDate: '2026-10-25',
        dueDate: '2026-12-09', // 45 jours
        amountHT: 12000000,
        vatRate: 19,
        vatAmount: 2280000,
        retentionRate: 5,
        retentionAmount: 600000,
        amountTTC: 13680000, // (12M - 0.6M) + 2.28M
        netReceivableAmount: 13680000,
        paidAmount: 8000000,
        remainingAmount: 5680000,
        warrantyHeldAmount: 600000,
        warrantyReleasedAmount: 0,
        status: 'PARTIELLEMENT_PAYEE',
        paymentTerms: '45 jours fin de mois par virement bancaire',
        notes: 'Situation N°1 d’avancement préfabrication tuyauterie Skikda',
        isDemoInvoice: true,
        createdAt: '2026-10-25T10:00:00Z',
        updatedAt: '2026-11-02T14:30:00Z',
      },
      {
        id: 'fac-cli-2026-002',
        invoiceNumber: 'FAC-2026-002',
        clientId: 'cli-fertial-arzew',
        clientName: 'Fertial Algérie (Complexe Ammoniac & Engrais)',
        projectId: 'prj-2026-002',
        projectCode: 'PRJ-2026-002',
        projectName: 'Installation HVAC salle blanche & compresseurs',
        workSituationId: 'sit-002',
        workSituationNumber: 'SIT-PRJ-2026-002-01',
        issueDate: '2026-11-02',
        dueDate: '2026-12-17',
        amountHT: 8500000,
        vatRate: 19,
        vatAmount: 1615000,
        retentionRate: 5,
        retentionAmount: 425000,
        amountTTC: 9690000,
        netReceivableAmount: 9690000,
        paidAmount: 0,
        remainingAmount: 9690000,
        warrantyHeldAmount: 425000,
        warrantyReleasedAmount: 0,
        status: 'EMISE',
        paymentTerms: '45 jours fin de mois',
        notes: 'Situation N°1 pose des gaines et supports',
        isDemoInvoice: true,
        createdAt: '2026-11-02T11:00:00Z',
        updatedAt: '2026-11-02T11:00:00Z',
      },
    ];

    // 3. Factures Fournisseurs Démo avec 3-way matching
    this.supplierInvoices = [
      {
        id: 'fac-fou-2026-001',
        internalReference: 'FAC-FOU-2026-001',
        invoiceNumber: 'TCX-DZ-2026-884',
        supplierId: 'sup-001',
        supplierName: 'Tubacex Algérie SPA',
        purchaseOrderId: 'po-1',
        purchaseOrderCode: 'BC-2026-014',
        goodsReceiptId: 'rec-001',
        goodsReceiptCode: 'BR-2026-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        invoiceDate: '2026-10-20',
        dueDate: '2026-11-19', // 30 jours
        amountHT: 8400000,
        vatRate: 19,
        vatAmount: 1596000,
        amountTTC: 9996000,
        paidAmount: 9996000,
        remainingAmount: 0,
        matchingStatus: 'CONFORME_3_WAY',
        matchingDetails: {
          poAmountHT: 8400000,
          grTotalHT: 8400000,
          priceVarianceDA: 0,
          qtyVariancePct: 0,
          notes: '3-way match parfait (BC-2026-014 / BR-2026-001 / Facture)',
        },
        approvalThresholdStatus: 'APPROVED',
        status: 'PAYEE',
        paymentTerms: '30 jours date de facture',
        notes: 'Paiement intégral effectué par virement BEA',
        isDemoInvoice: true,
        createdAt: '2026-10-20T09:00:00Z',
        updatedAt: '2026-10-28T16:00:00Z',
      },
      {
        id: 'fac-fou-2026-002',
        internalReference: 'FAC-FOU-2026-002',
        invoiceNumber: 'PV-DZ-9941',
        supplierId: 'sup-002',
        supplierName: 'PetroValve SPA',
        purchaseOrderId: 'po-2',
        purchaseOrderCode: 'BC-2026-022',
        goodsReceiptId: 'rec-002',
        goodsReceiptCode: 'BR-2026-002',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        invoiceDate: '2026-11-05',
        dueDate: '2026-12-05',
        amountHT: 3200000,
        vatRate: 19,
        vatAmount: 608000,
        amountTTC: 3808000,
        paidAmount: 0,
        remainingAmount: 3808000,
        matchingStatus: 'CONFORME_3_WAY',
        matchingDetails: {
          poAmountHT: 3200000,
          grTotalHT: 3200000,
          priceVarianceDA: 0,
          qtyVariancePct: 0,
          notes: 'Conforme au bon de commande et à la réception magasin',
        },
        approvalThresholdStatus: 'APPROVED',
        status: 'APPROUVEE',
        paymentTerms: '30 jours',
        notes: 'Facture validée par le PM, programmée pour décaissement',
        isDemoInvoice: true,
        createdAt: '2026-11-05T14:00:00Z',
        updatedAt: '2026-11-06T10:00:00Z',
      },
    ];

    // 4. Mouvements de Trésorerie Démo initiaux
    this.cashTransactions = [
      {
        id: 'flx-2026-001',
        transactionNumber: 'DEMO-FLX-2026-001',
        transactionDate: '2026-10-28',
        type: 'DECAISSEMENT_FOURNISSEUR',
        amount: 9996000,
        accountId: 'cpt-demo-01',
        accountCode: 'CPT-BEA-01',
        supplierInvoiceId: 'fac-fou-2026-001',
        supplierInvoiceNumber: 'TCX-DZ-2026-884',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        referenceDocument: 'VIR-BEA-2026-1028',
        paymentMethod: 'VIREMENT',
        category: 'Règlement Fournisseur Tuyauterie',
        notes: 'Règlement facture Tubacex BC-2026-014',
        performedById: 'usr-fin-001',
        performedByName: 'Réda Bouzid (Finance)',
        status: 'VALIDE',
        idempotencyKey: 'idemp-flx-001',
        createdAt: '2026-10-28T16:00:00Z',
      },
      {
        id: 'flx-2026-002',
        transactionNumber: 'DEMO-FLX-2026-002',
        transactionDate: '2026-11-02',
        type: 'ENCAISSEMENT_CLIENT',
        amount: 8000000,
        accountId: 'cpt-demo-01',
        accountCode: 'CPT-BEA-01',
        customerInvoiceId: 'fac-cli-2026-001',
        customerInvoiceNumber: 'FAC-2026-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        referenceDocument: 'VIR-CLIENT-SONATRACH-88',
        paymentMethod: 'VIREMENT',
        category: 'Acompte / Situation Client N°1',
        notes: 'Premier encaissement partiel sur Situation 1 Skikda',
        performedById: 'usr-fin-001',
        performedByName: 'Réda Bouzid (Finance)',
        status: 'VALIDE',
        idempotencyKey: 'idemp-flx-002',
        createdAt: '2026-11-02T14:30:00Z',
      },
    ];

    // Ajuster le solde du compte courant BEA suite aux mouvements initiaux:
    // Solde initial = 45M, - 9.996M (fournisseur) + 8M (client) = 43,004,000 DA
    const bea = this.financialAccounts.find(a => a.id === 'cpt-demo-01');
    if (bea) {
      bea.currentBalance = bea.initialBalance - 9996000 + 8000000;
    }
  }

  // --- CONFIGURATION FINANCIÈRE ---
  getFinancialConfig(): StoredFinancialConfig {
    return this.financialConfig;
  }

  updateFinancialConfig(data: Partial<StoredFinancialConfig>, user?: any): StoredFinancialConfig {
    if (user?.role !== SystemRole.DIRECTEUR_GENERAL && user?.role !== SystemRole.ADMINISTRATEUR) {
      throw new Error('Seule la Direction Générale ou l’Administrateur peut modifier la configuration financière.');
    }
    Object.assign(this.financialConfig, data);
    this.addAuditLog('UPDATE_FINANCE_CONFIG', 'FINANCE', 'CONFIG', 'Mise à jour des paramètres financiers globaux', user);
    return this.financialConfig;
  }

  // --- COMPTES FINANCIERS & TRÉSORERIE ---
  getFinancialAccounts(filter?: { includeDemo?: boolean }): StoredFinancialAccount[] {
    if (!filter?.includeDemo) {
      return this.financialAccounts.filter(a => !a.isDemoAccount && !a.code?.startsWith('DEMO-'));
    }
    return this.financialAccounts;
  }

  getFinancialAccount(idOrCode: string): StoredFinancialAccount | undefined {
    return this.financialAccounts.find(a => a.id === idOrCode || a.code === idOrCode);
  }

  createFinancialAccount(data: any, user?: any): StoredFinancialAccount {
    const isDG = user?.role === SystemRole.DIRECTEUR_GENERAL || user?.role === SystemRole.ADMINISTRATEUR;
    if (!isDG && user?.role !== SystemRole.RESPONSABLE_FINANCIER) {
      throw new Error('Droits insuffisants pour créer un compte financier.');
    }

    const code = data.code || `CPT-${Date.now().toString().slice(-4)}`;
    const newAccount: StoredFinancialAccount = {
      id: data.id || `cpt-${Date.now()}`,
      code,
      name: data.name || 'Nouveau Compte Bancaire / Caisse',
      type: data.type || 'BANQUE_COURANT',
      bankName: data.bankName || 'Banque Démo',
      ribNumber: data.ribNumber || '',
      currency: data.currency || 'DZD',
      initialBalance: Number(data.initialBalance || 0),
      currentBalance: Number(data.initialBalance || 0),
      isDemoAccount: data.isDemoAccount !== undefined ? Boolean(data.isDemoAccount) : false,
      isActive: true,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.financialAccounts.push(newAccount);
    this.addAuditLog('CREATE_FINANCIAL_ACCOUNT', 'FINANCE', newAccount.code, `Création compte financier ${newAccount.code} (${newAccount.name})`, user);
    return newAccount;
  }

  // --- MOUVEMENTS DE TRÉSORERIE & TRANSACTIONS ---
  getCashTransactions(filter?: { accountId?: string; projectId?: string; type?: string; includeDemo?: boolean }): StoredCashTransaction[] {
    let list = this.cashTransactions;
    if (!filter?.includeDemo) {
      list = list.filter(t => !t.isDemoTransaction && !t.accountCode?.startsWith('DEMO-') && !t.id?.startsWith('tx-demo-'));
    }
    if (filter?.accountId) list = list.filter(t => t.accountId === filter.accountId || t.counterpartAccountId === filter.accountId);
    if (filter?.projectId) list = list.filter(t => t.projectId === filter.projectId);
    if (filter?.type) list = list.filter(t => t.type === filter.type);
    return list;
  }

  recordCashTransaction(data: any, user?: any): StoredCashTransaction {
    const account = this.getFinancialAccount(data.accountId);
    if (!account) throw new Error('Compte financier source introuvable');

    // Vérification idempotence si une clé est fournie
    if (data.idempotencyKey) {
      const existing = this.cashTransactions.find(t => t.idempotencyKey === data.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const amount = Number(data.amount || 0);
    if (amount <= 0) throw new Error('Le montant de la transaction doit être strictement positif');

    const type: CashTransactionType = data.type;
    const txNum = data.transactionNumber || `FLX-${new Date().getFullYear()}-${String(this.cashTransactions.length + 1).padStart(4, '0')}`;

    // Impact sur le solde
    if (type === 'ENCAISSEMENT_CLIENT' || type === 'VIREMENT_INTERNE_RECU' || type === 'LIBERATION_RETENUE_GARANTIE') {
      account.currentBalance += amount;
    } else {
      // Décaissement, paiement, virement émis
      if (account.currentBalance < amount && account.type.startsWith('CAISSE')) {
        throw new Error(`Solde de caisse insuffisant (Disponible: ${account.currentBalance.toLocaleString()} DA)`);
      }
      account.currentBalance -= amount;
    }
    account.updatedAt = new Date().toISOString();

    const tx: StoredCashTransaction = {
      id: data.id || `flx-${Date.now()}`,
      transactionNumber: txNum,
      transactionDate: data.transactionDate || new Date().toISOString().split('T')[0],
      type,
      amount,
      accountId: account.id,
      accountCode: account.code,
      counterpartAccountId: data.counterpartAccountId,
      counterpartAccountCode: data.counterpartAccountCode,
      customerInvoiceId: data.customerInvoiceId,
      customerInvoiceNumber: data.customerInvoiceNumber,
      supplierInvoiceId: data.supplierInvoiceId,
      supplierInvoiceNumber: data.supplierInvoiceNumber,
      projectId: data.projectId,
      projectCode: data.projectCode,
      referenceDocument: data.referenceDocument || '',
      paymentMethod: data.paymentMethod || 'VIREMENT',
      category: data.category || 'Mouvement Trésorerie',
      notes: data.notes || '',
      performedById: user?.id || 'usr-fin-001',
      performedByName: user?.name || 'Responsable Financier',
      status: 'VALIDE',
      idempotencyKey: data.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    this.cashTransactions.unshift(tx);
    this.addAuditLog('RECORD_CASH_TRANSACTION', 'FINANCE', tx.transactionNumber, `${type} de ${amount.toLocaleString()} DA sur compte ${account.code}`, user);
    return tx;
  }

  // Virement interne atomique (Double-entry internal transfer)
  transferBetweenAccounts(data: { sourceAccountId: string; destinationAccountId: string; amount: number; notes?: string; idempotencyKey?: string }, user?: any) {
    const source = this.getFinancialAccount(data.sourceAccountId);
    const dest = this.getFinancialAccount(data.destinationAccountId);
    if (!source || !dest) throw new Error('Compte source ou compte destination introuvable');
    if (source.id === dest.id) throw new Error('Impossible de transférer vers le même compte');

    const amount = Number(data.amount || 0);
    if (amount <= 0) throw new Error('Le montant du virement doit être strictement positif');
    if (source.currentBalance < amount) {
      throw new Error(`Solde insuffisant sur ${source.name} (Solde: ${source.currentBalance.toLocaleString()} DA, Demandé: ${amount.toLocaleString()} DA)`);
    }

    // Débit du compte source
    source.currentBalance -= amount;
    source.updatedAt = new Date().toISOString();

    // Crédit du compte destination
    dest.currentBalance += amount;
    dest.updatedAt = new Date().toISOString();

    const transferRef = `TRF-${Date.now()}`;

    const txDebit: StoredCashTransaction = {
      id: `flx-out-${Date.now()}`,
      transactionNumber: `FLX-${new Date().getFullYear()}-${String(this.cashTransactions.length + 1).padStart(4, '0')}`,
      transactionDate: new Date().toISOString().split('T')[0],
      type: 'VIREMENT_INTERNE_EMIS',
      amount,
      accountId: source.id,
      accountCode: source.code,
      counterpartAccountId: dest.id,
      counterpartAccountCode: dest.code,
      paymentMethod: 'VIREMENT',
      category: 'Virement de compte à compte',
      referenceDocument: transferRef,
      notes: data.notes || `Transfert vers ${dest.name}`,
      performedById: user?.id || 'usr-fin-001',
      performedByName: user?.name || 'Responsable Financier',
      status: 'VALIDE',
      idempotencyKey: data.idempotencyKey ? `${data.idempotencyKey}-debit` : undefined,
      createdAt: new Date().toISOString(),
    };

    const txCredit: StoredCashTransaction = {
      id: `flx-in-${Date.now() + 1}`,
      transactionNumber: `FLX-${new Date().getFullYear()}-${String(this.cashTransactions.length + 2).padStart(4, '0')}`,
      transactionDate: new Date().toISOString().split('T')[0],
      type: 'VIREMENT_INTERNE_RECU',
      amount,
      accountId: dest.id,
      accountCode: dest.code,
      counterpartAccountId: source.id,
      counterpartAccountCode: source.code,
      paymentMethod: 'VIREMENT',
      category: 'Virement de compte à compte',
      referenceDocument: transferRef,
      notes: data.notes || `Transfert depuis ${source.name}`,
      performedById: user?.id || 'usr-fin-001',
      performedByName: user?.name || 'Responsable Financier',
      status: 'VALIDE',
      idempotencyKey: data.idempotencyKey ? `${data.idempotencyKey}-credit` : undefined,
      createdAt: new Date().toISOString(),
    };

    this.cashTransactions.unshift(txCredit);
    this.cashTransactions.unshift(txDebit);

    this.addAuditLog('INTERNAL_TRANSFER', 'FINANCE', transferRef, `Virement de ${amount.toLocaleString()} DA de ${source.code} vers ${dest.code}`, user);
    return { success: true, transferRef, amount, sourceAccount: source, destinationAccount: dest };
  }

  // --- FACTURATION CLIENT ---
  getCustomerInvoices(filter?: { projectId?: string; status?: string; includeDemo?: boolean }): StoredCustomerInvoice[] {
    let list = this.customerInvoices;
    if (!filter?.includeDemo) {
      list = list.filter(i => !i.isDemoInvoice && !i.id?.startsWith('fac-demo-') && !i.id?.startsWith('inv-demo-'));
    }
    if (filter?.projectId) list = list.filter(i => i.projectId === filter.projectId);
    if (filter?.status) list = list.filter(i => i.status === filter.status);
    return list;
  }

  getCustomerInvoice(idOrNum: string): StoredCustomerInvoice | undefined {
    return this.customerInvoices.find(i => i.id === idOrNum || i.invoiceNumber === idOrNum);
  }

  createCustomerInvoice(data: any, user?: any): StoredCustomerInvoice {
    const invNum = data.invoiceNumber || `FAC-${new Date().getFullYear()}-${String(this.customerInvoices.length + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let proj: StoredProject | undefined;
    if (data.projectId || data.projectCode) {
      proj = this.projects.find(p => p.id === data.projectId || p.code === data.projectCode);
    }

    const amountHT = Number(data.amountHT || 0);
    const vatRate = data.vatRate !== undefined ? Number(data.vatRate) : (proj?.tvaRate !== undefined ? Number(proj.tvaRate) : this.financialConfig.defaultVatRate);
    // Prévalence stricte des conditions contractuelles du marché sur le taux par défaut légal (5%)
    const retentionRate = data.retentionRate !== undefined
      ? Number(data.retentionRate)
      : (proj?.retentionRate !== undefined ? Number(proj.retentionRate) : this.financialConfig.defaultRetentionRate);

    // Retenue de garantie calculée sur le montant HT (ex: 5%)
    const retentionAmount = Math.round((amountHT * retentionRate) / 100);
    // TVA légale (19% en Algérie)
    const vatAmount = Math.round((amountHT * vatRate) / 100);
    // Net exigible = (Montant HT - Retenue) + TVA
    const netReceivableAmount = (amountHT - retentionAmount) + vatAmount;

    const newInvoice: StoredCustomerInvoice = {
      id: `fac-cli-${Date.now()}`,
      invoiceNumber: invNum,
      clientId: data.clientId || 'cli-001',
      clientName: data.clientName || proj?.clientName || 'Client Industriel',
      projectId: proj?.id || data.projectId || '',
      projectCode: proj?.code || data.projectCode || '',
      projectName: proj?.name,
      workSituationId: data.workSituationId,
      workSituationNumber: data.workSituationNumber,
      commercialQuoteId: data.commercialQuoteId,
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      amountHT,
      vatRate,
      vatAmount,
      retentionRate,
      retentionAmount,
      amountTTC: netReceivableAmount,
      netReceivableAmount,
      paidAmount: 0,
      remainingAmount: netReceivableAmount,
      warrantyHeldAmount: retentionAmount,
      warrantyReleasedAmount: 0,
      status: 'EMISE',
      paymentTerms: data.paymentTerms || '45 jours fin de mois',
      notes: data.notes || '',
      isDemoInvoice: data.isDemoInvoice !== undefined ? Boolean(data.isDemoInvoice) : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.customerInvoices.unshift(newInvoice);

    // Mettre à jour la situation de travaux si liée
    if (proj && data.workSituationId) {
      const sit = (proj.workSituations || []).find((s: any) => s.id === data.workSituationId || s.situationNumber === data.workSituationNumber);
      if (sit) {
        sit.status = 'FACTURE';
        sit.invoiceNumber = newInvoice.invoiceNumber;
      }
    }

    this.addAuditLog('CREATE_CUSTOMER_INVOICE', 'FINANCE', newInvoice.invoiceNumber, `Émission facture client ${newInvoice.invoiceNumber} (${netReceivableAmount.toLocaleString()} DA)`, user);
    return newInvoice;
  }

  recordCustomerPayment(invoiceId: string, data: { amount: number; accountId: string; referenceDocument?: string; paymentDate?: string; notes?: string; idempotencyKey?: string }, user?: any) {
    const invoice = this.getCustomerInvoice(invoiceId);
    if (!invoice) throw new Error('Facture client introuvable');

    const paymentAmount = Number(data.amount || 0);
    if (paymentAmount <= 0) throw new Error('Le montant du paiement doit être supérieur à zéro');
    if (paymentAmount > invoice.remainingAmount) {
      throw new Error(`Le montant (${paymentAmount.toLocaleString()} DA) dépasse le solde restant dû (${invoice.remainingAmount.toLocaleString()} DA)`);
    }

    const account = this.getFinancialAccount(data.accountId);
    if (!account) throw new Error('Compte financier récepteur introuvable');

    // 1. Enregistrer le mouvement de trésorerie
    const tx = this.recordCashTransaction({
      type: 'ENCAISSEMENT_CLIENT',
      amount: paymentAmount,
      accountId: account.id,
      customerInvoiceId: invoice.id,
      customerInvoiceNumber: invoice.invoiceNumber,
      projectId: invoice.projectId,
      projectCode: invoice.projectCode,
      referenceDocument: data.referenceDocument || `VIR-CLI-${invoice.invoiceNumber}`,
      paymentMethod: 'VIREMENT',
      category: `Encaissement Facture Client ${invoice.invoiceNumber}`,
      notes: data.notes || `Règlement client ${invoice.clientName}`,
      idempotencyKey: data.idempotencyKey,
    }, user);

    // 2. Mettre à jour la facture
    invoice.paidAmount += paymentAmount;
    invoice.remainingAmount = Math.max(0, invoice.netReceivableAmount - invoice.paidAmount);
    if (invoice.remainingAmount === 0) {
      invoice.status = 'PAYEE';
    } else {
      invoice.status = 'PARTIELLEMENT_PAYEE';
    }
    invoice.updatedAt = new Date().toISOString();

    // 3. Synchroniser également la table legacy financePayments pour cohérence globale
    this.financePayments.push({
      id: `pay-${Date.now()}`,
      projectId: invoice.projectId,
      amount: paymentAmount,
      paymentReference: data.referenceDocument || tx.transactionNumber,
      bankName: account.bankName,
      paymentDate: data.paymentDate || new Date().toISOString(),
      notes: data.notes || `Règlement facture ${invoice.invoiceNumber}`,
      createdAt: new Date().toISOString(),
    });

    this.addAuditLog('RECORD_CUSTOMER_PAYMENT', 'FINANCE', invoice.invoiceNumber, `Encaissement de ${paymentAmount.toLocaleString()} DA sur facture ${invoice.invoiceNumber}`, user);
    return { invoice, transaction: tx };
  }

  releaseWarrantyRetention(invoiceId: string, data: { amount?: number; accountId: string; referenceDocument?: string; notes?: string }, user?: any) {
    const invoice = this.getCustomerInvoice(invoiceId);
    if (!invoice) throw new Error('Facture client introuvable');

    const availableWarranty = invoice.warrantyHeldAmount - invoice.warrantyReleasedAmount;
    if (availableWarranty <= 0) throw new Error('Aucune retenue de garantie disponible pour libération sur cette facture');

    const releaseAmount = data.amount ? Number(data.amount) : availableWarranty;
    if (releaseAmount > availableWarranty) {
      throw new Error(`Le montant demandé (${releaseAmount} DA) dépasse la retenue disponible (${availableWarranty} DA)`);
    }

    const account = this.getFinancialAccount(data.accountId);
    if (!account) throw new Error('Compte financier introuvable');

    const tx = this.recordCashTransaction({
      type: 'LIBERATION_RETENUE_GARANTIE',
      amount: releaseAmount,
      accountId: account.id,
      customerInvoiceId: invoice.id,
      customerInvoiceNumber: invoice.invoiceNumber,
      projectId: invoice.projectId,
      projectCode: invoice.projectCode,
      referenceDocument: data.referenceDocument || `PVRD-${invoice.invoiceNumber}`,
      paymentMethod: 'VIREMENT',
      category: 'Libération Retenue de Garantie (PVRD)',
      notes: data.notes || 'Levée des réserves et réception définitive',
    }, user);

    invoice.warrantyReleasedAmount += releaseAmount;
    invoice.updatedAt = new Date().toISOString();

    this.addAuditLog('RELEASE_WARRANTY', 'FINANCE', invoice.invoiceNumber, `Libération retenue de garantie : ${releaseAmount.toLocaleString()} DA sur ${invoice.invoiceNumber}`, user);
    return { invoice, transaction: tx, releasedAmount: releaseAmount };
  }

  // --- FACTURATION FOURNISSEUR & 3-WAY MATCHING (BC vs BR vs Facture LIGNE PAR LIGNE) ---
  getSupplierInvoices(filter?: { supplierId?: string; projectId?: string; status?: string; includeDemo?: boolean }): StoredSupplierInvoice[] {
    let list = this.supplierInvoices;
    if (!filter?.includeDemo) {
      list = list.filter(i => !i.isDemoInvoice && !i.id?.startsWith('fac-fou-demo-'));
    }
    if (filter?.supplierId) list = list.filter(i => i.supplierId === filter.supplierId);
    if (filter?.projectId) list = list.filter(i => i.projectId === filter.projectId);
    if (filter?.status) list = list.filter(i => i.status === filter.status);
    return list;
  }

  getSupplierInvoice(idOrRef: string): StoredSupplierInvoice | undefined {
    return this.supplierInvoices.find(i => i.id === idOrRef || i.internalReference === idOrRef || i.invoiceNumber === idOrRef);
  }

  getInvoiceLineMatchings(filter?: { supplierInvoiceId?: string; purchaseOrderId?: string; goodsReceiptId?: string; status?: string }): StoredInvoiceLineMatching[] {
    let list = this.invoiceLineMatchings;
    if (filter?.supplierInvoiceId) list = list.filter(m => m.supplierInvoiceId === filter.supplierInvoiceId);
    if (filter?.purchaseOrderId) list = list.filter(m => m.purchaseOrderId === filter.purchaseOrderId);
    if (filter?.goodsReceiptId) list = list.filter(m => m.goodsReceiptId === filter.goodsReceiptId);
    if (filter?.status) list = list.filter(m => m.status === filter.status);
    return list;
  }

  createSupplierInvoice(data: any, user?: any): StoredSupplierInvoice {
    const internalRef = `FAC-FOU-${new Date().getFullYear()}-${String(this.supplierInvoices.length + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const invoiceId = data.id || `fac-fou-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const po = this.purchaseOrders.find((p: any) => p.id === data.purchaseOrderId || p.orderNumber === data.purchaseOrderCode || p.code === data.purchaseOrderCode);
    const amountHT = Number(data.amountHT || 0);
    const vatRate = data.vatRate !== undefined ? Number(data.vatRate) : this.financialConfig.defaultVatRate;
    const vatAmount = Math.round((amountHT * vatRate) / 100);
    const amountTTC = amountHT + vatAmount;

    // 1. Identification des réceptions cibles (BRs)
    let candidateGrs: any[] = [];
    if (data.goodsReceiptIds && Array.isArray(data.goodsReceiptIds) && data.goodsReceiptIds.length > 0) {
      candidateGrs = this.goodsReceipts.filter(g => data.goodsReceiptIds.includes(g.id) || data.goodsReceiptIds.includes(g.receiptNumber));
    } else if (data.goodsReceiptId || data.goodsReceiptCode) {
      candidateGrs = this.goodsReceipts.filter(g => (data.goodsReceiptId && g.id === data.goodsReceiptId) || (data.goodsReceiptCode && g.receiptNumber === data.goodsReceiptCode));
    } else if (po) {
      candidateGrs = this.goodsReceipts.filter(g => g.purchaseOrderId === po.id);
    }

    const absTolerance = this.financialConfig.priceToleranceAbsoluteDA !== undefined ? this.financialConfig.priceToleranceAbsoluteDA : 100;
    const relTolerance = this.financialConfig.priceToleranceRelativePct !== undefined ? this.financialConfig.priceToleranceRelativePct : 0.5;

    let matchingStatus: SupplierInvoiceMatchingStatus = 'NON_VERIFIE';
    let priceVarianceDA = 0;
    let qtyVariancePct = 0;
    let matchingNotes = '';
    const generatedMatchings: StoredInvoiceLineMatching[] = [];

    // 2. Vérification présence de réceptions physiques
    if (candidateGrs.length === 0) {
      matchingStatus = 'SANS_RECEPTION';
      matchingNotes = 'Aucun Bon de Réception physique (BR) associé à cette commande ou référence';
    } else {
      // Analyse ligne par ligne des réceptions disponibles
      const brLinesWithAvailability: Array<{
        brId: string;
        brNumber: string;
        brLineId: string;
        poLineId: string;
        itemId: string;
        unitPriceExpected: number;
        receivedQty: number;
        alreadyMatchedQty: number;
        availableQty: number;
      }> = [];

      for (const grItem of candidateGrs) {
        for (const line of grItem.lines || []) {
          const brLineId = line.id || `${grItem.id}-line-0`;
          const poLineId = (line as any).purchaseOrderLineId || (po?.lines?.[0]?.id) || 'pol-default';
          const recQty = Number(line.acceptedQuantity || line.deliveredQuantity || (line as any).quantityReceived || 0);

          // Cumul des quantités déjà rapprochées sur cette ligne de ce BR spécifique par des factures valides
          const alreadyMatched = this.invoiceLineMatchings
            .filter(m => m.goodsReceiptId === grItem.id && m.goodsReceiptLineId === brLineId && m.status !== 'ANNULE')
            .reduce((sum, m) => sum + Number(m.quantityMatched), 0);

          const available = Math.max(0, recQty - alreadyMatched);

          const poLine = (po?.lines || po?.items || []).find((pl: any) => pl.id === poLineId || (line.itemId && pl.itemId === line.itemId));
          const expectedUnitPrice = poLine ? Number(poLine.unitPrice || 0) : Number(line.unitPriceHT || 0);

          brLinesWithAvailability.push({
            brId: grItem.id,
            brNumber: grItem.receiptNumber,
            brLineId,
            poLineId,
            itemId: line.itemId || 'itm-default',
            unitPriceExpected: expectedUnitPrice,
            receivedQty: recQty,
            alreadyMatchedQty: alreadyMatched,
            availableQty: available,
          });
        }
      }

      const totalAvailableOnGrs = brLinesWithAvailability.reduce((sum, b) => sum + b.availableQty, 0);

      // Quantité demandée sur la facture
      let invoiceQuantityRequested = Number(data.quantity || 0);
      if (!invoiceQuantityRequested && data.lines && Array.isArray(data.lines) && data.lines.length > 0) {
        invoiceQuantityRequested = data.lines.reduce((s: number, l: any) => s + Number(l.quantity || 0), 0);
      }
      if (!invoiceQuantityRequested && brLinesWithAvailability.length > 0) {
        // Si la quantité n'est pas spécifiée, la facture est imputée sur la totalité des réceptions disponibles
        invoiceQuantityRequested = totalAvailableOnGrs;
      }

      if (totalAvailableOnGrs <= 0) {
        matchingStatus = 'ECART_QUANTITE';
        matchingNotes = `Attention : Les réceptions associées ont déjà été intégralement imputées (Reliquat disponible : 0). Risque de double facturation.`;
      } else if (invoiceQuantityRequested > totalAvailableOnGrs) {
        matchingStatus = 'ECART_QUANTITE';
        qtyVariancePct = totalAvailableOnGrs > 0 ? ((invoiceQuantityRequested - totalAvailableOnGrs) / totalAvailableOnGrs) * 100 : 100;
        matchingNotes = `Dépassement quantitatif : Quantité facturée (${invoiceQuantityRequested}) supérieure à la quantité réceptionnée disponible (${totalAvailableOnGrs}).`;
      } else {
        // Allocation quantitative ligne par ligne (FIFO sur les disponibilités des réceptions)
        let remainingToAllocate = invoiceQuantityRequested;
        let hasPriceError = false;
        let maxPriceVariance = 0;

        for (const candidate of brLinesWithAvailability) {
          if (remainingToAllocate <= 0) break;
          if (candidate.availableQty <= 0) continue;

          const allocQty = Math.min(candidate.availableQty, remainingToAllocate);
          remainingToAllocate -= allocQty;

          const invoicedUnitPrice = data.unitPrice !== undefined 
            ? Number(data.unitPrice) 
            : (invoiceQuantityRequested > 0 ? (amountHT / invoiceQuantityRequested) : candidate.unitPriceExpected);

          const unitPriceDiff = invoicedUnitPrice - candidate.unitPriceExpected;
          const lineVarianceDA = Math.abs(unitPriceDiff) * allocQty;
          const variancePct = candidate.unitPriceExpected > 0 ? (Math.abs(unitPriceDiff) / candidate.unitPriceExpected) * 100 : 0;

          if (Math.abs(unitPriceDiff) > absTolerance && variancePct > relTolerance) {
            hasPriceError = true;
            maxPriceVariance = Math.max(maxPriceVariance, lineVarianceDA);
          }

          generatedMatchings.push({
            id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            supplierInvoiceId: invoiceId,
            purchaseOrderId: po?.id || '',
            purchaseOrderLineId: candidate.poLineId,
            goodsReceiptId: candidate.brId,
            goodsReceiptLineId: candidate.brLineId,
            quantityMatched: allocQty,
            unitPriceMatched: invoicedUnitPrice,
            amountMatchedHT: allocQty * invoicedUnitPrice,
            priceVarianceDA: lineVarianceDA,
            status: 'CONFORME',
            matchedAt: new Date().toISOString(),
            matchedById: user?.id || 'usr-fin-001',
            matchedByName: user?.name || 'Responsable Financier SILEX',
          });
        }

        if (hasPriceError) {
          matchingStatus = 'ECART_PRIX';
          priceVarianceDA = maxPriceVariance;
          matchingNotes = `Écart de prix unitaire constaté par rapport au bon de commande (${priceVarianceDA.toLocaleString()} DA > tolérance ${absTolerance} DA / ${relTolerance}%)`;
          generatedMatchings.forEach(m => m.status = 'EN_ATTENTE');
        } else {
          matchingStatus = 'CONFORME_3_WAY';
          matchingNotes = `3-way matching validé ligne par ligne : ${invoiceQuantityRequested} unités rapprochées sans écart significatif.`;
        }
      }
    }

    // Calcul du cumul facturé et du reliquat restant sur le bon de commande
    const allPoMatchings = this.invoiceLineMatchings.filter(m => m.purchaseOrderId === po?.id && m.status !== 'ANNULE');
    const existingInvoicedQty = allPoMatchings.reduce((sum, m) => sum + m.quantityMatched, 0);
    const newMatchedQty = matchingStatus === 'CONFORME_3_WAY' ? generatedMatchings.reduce((sum, m) => sum + m.quantityMatched, 0) : 0;
    const invoicedQuantityTotal = existingInvoicedQty + newMatchedQty;

    const poTotalOrderedQty = po ? (po.lines || po.items || []).reduce((sum: number, l: any) => sum + Number(l.quantity || 0), 0) : 0;
    const remainingQuantityToInvoice = Math.max(0, poTotalOrderedQty - invoicedQuantityTotal);

    // Seuil d'approbation SoD centralisé (@silex/shared)
    let approvalThresholdStatus: 'AUTO_APPROVED' | 'PENDING_PM' | 'PENDING_DG' | 'APPROVED' = getRequiredSupplierInvoiceApprovalLevel(amountHT, true);

    const newInvoice: StoredSupplierInvoice = {
      id: invoiceId,
      internalReference: internalRef,
      invoiceNumber: data.invoiceNumber || `FOU-${Date.now().toString().slice(-4)}`,
      supplierId: data.supplierId || po?.supplierId || 'sup-001',
      supplierName: data.supplierName || po?.supplierName || 'Fournisseur',
      purchaseOrderId: po?.id || data.purchaseOrderId || '',
      purchaseOrderCode: po?.orderNumber || po?.code || data.purchaseOrderCode || '',
      goodsReceiptId: candidateGrs[0]?.id || data.goodsReceiptId,
      goodsReceiptCode: candidateGrs[0]?.receiptNumber || data.goodsReceiptCode,
      goodsReceiptIds: candidateGrs.map(g => g.id),
      projectId: po?.projectId || data.projectId,
      projectCode: po?.projectCode || data.projectCode,
      invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      amountHT,
      vatRate,
      vatAmount,
      amountTTC,
      paidAmount: 0,
      remainingAmount: amountTTC,
      invoicedQuantityTotal,
      remainingQuantityToInvoice,
      matchingStatus,
      matchingDetails: {
        poAmountHT: po ? (po.totalHT || po.amount || 0) : 0,
        grTotalHT: candidateGrs.reduce((acc, g) => acc + (g.lines || []).reduce((sa: number, l: any) => sa + ((l.acceptedQuantity || l.deliveredQuantity || l.quantityReceived || 0) * (l.unitPriceHT || 0)), 0), 0),
        priceVarianceDA,
        qtyVariancePct,
        notes: matchingNotes,
      },
      approvalThresholdStatus,
      status: matchingStatus === 'CONFORME_3_WAY' && approvalThresholdStatus === 'AUTO_APPROVED' ? 'APPROUVEE' : 'A_APPROUVER',
      paymentTerms: data.paymentTerms || '30 jours date de facture',
      notes: data.notes || '',
      isDemoInvoice: data.isDemoInvoice !== undefined ? Boolean(data.isDemoInvoice) : false,
      lineMatchings: generatedMatchings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.supplierInvoices.unshift(newInvoice);

    // Enregistrer les matchings si conformes
    if (matchingStatus === 'CONFORME_3_WAY') {
      this.invoiceLineMatchings.push(...generatedMatchings);
    }

    if (po && newInvoice.status === 'APPROUVEE' && remainingQuantityToInvoice === 0) {
      po.invoiceStatus = 'FACTURE';
    }

    this.addAuditLog('CREATE_SUPPLIER_INVOICE', 'FINANCE', newInvoice.internalReference, `Enregistrement facture fournisseur ${newInvoice.internalReference} (${matchingStatus})`, user);
    return newInvoice;
  }

  cancelSupplierInvoice(idOrRef: string, reason: string, user?: any): StoredSupplierInvoice {
    const inv = this.getSupplierInvoice(idOrRef);
    if (!inv) throw new Error('Facture fournisseur introuvable');
    inv.status = 'REJETEE';
    inv.notes = (inv.notes ? inv.notes + ' | ' : '') + `Annulée/Rejetée: ${reason}`;

    // Libérer les lignes de réception rapprochées en annulant leurs matchings
    this.invoiceLineMatchings
      .filter(m => m.supplierInvoiceId === inv.id)
      .forEach(m => {
        m.status = 'ANNULE';
        m.notes = `Rapprochement annulé: ${reason}`;
      });

    this.addAuditLog('CANCEL_SUPPLIER_INVOICE', 'FINANCE', inv.internalReference, `Annulation facture fournisseur: ${reason}`, user);
    return inv;
  }

  approveSupplierInvoiceWithDerogation(idOrRef: string, derogationReason: string, user: any): StoredSupplierInvoice {
    const inv = this.getSupplierInvoice(idOrRef);
    if (!inv) throw new Error('Facture fournisseur introuvable');
    inv.status = 'APPROUVEE';
    inv.approvalThresholdStatus = 'APPROVED';
    inv.notes = (inv.notes ? inv.notes + ' | ' : '') + `Approuvée sous dérogation: ${derogationReason}`;

    // Mettre à jour les matchings en statut DEROGATION
    if (inv.lineMatchings && inv.lineMatchings.length > 0) {
      for (const m of inv.lineMatchings) {
        m.status = 'DEROGATION';
        m.derogationReason = derogationReason;
        m.derogationApprovedById = user?.id || 'usr-dg-001';
        m.derogationApprovedByName = user?.name || 'Direction Générale';
        
        // Si le matching n'était pas encore enregistré dans la liste principale, on l'ajoute
        if (!this.invoiceLineMatchings.some(ex => ex.id === m.id)) {
          this.invoiceLineMatchings.push(m);
        }
      }
    }

    this.addAuditLog('APPROVE_DEROGATION', 'FINANCE', inv.internalReference, `Approbation sous dérogation: ${derogationReason}`, user);
    return inv;
  }

  // --- MÉTHODES DE ROLLBACK DE SÉCURITÉ EN CAS D'ÉCHEC DE BASE DE DONNÉES ---
  rollbackFinancialAccount(id: string) {
    this.financialAccounts = this.financialAccounts.filter(a => a.id !== id);
  }

  rollbackCashTransaction(id: string) {
    const tx = this.cashTransactions.find(t => t.id === id);
    if (tx) {
      // Annuler l'impact sur le solde
      const acc = this.getFinancialAccount(tx.accountId);
      if (acc) {
        if (tx.type.includes('ENCAISSEMENT')) acc.currentBalance -= tx.amount;
        if (tx.type.includes('DECAISSEMENT')) acc.currentBalance += tx.amount;
      }
      this.cashTransactions = this.cashTransactions.filter(t => t.id !== id);
    }
  }

  rollbackCustomerInvoice(id: string) {
    this.customerInvoices = this.customerInvoices.filter(i => i.id !== id);
  }

  rollbackSupplierInvoice(id: string) {
    this.supplierInvoices = this.supplierInvoices.filter(i => i.id !== id);
    this.invoiceLineMatchings = this.invoiceLineMatchings.filter(m => m.supplierInvoiceId !== id);
  }

  recordSupplierPayment(invoiceId: string, data: { amount: number; accountId: string; referenceDocument?: string; paymentDate?: string; notes?: string; idempotencyKey?: string }, user?: any) {
    const invoice = this.getSupplierInvoice(invoiceId);
    if (!invoice) throw new Error('Facture fournisseur introuvable');

    if (invoice.status === 'REJETEE' || invoice.status === 'A_APPROUVER') {
      throw new Error(`Impossible de payer une facture au statut ${invoice.status}. Une approbation préalable est requise.`);
    }

    const paymentAmount = Number(data.amount || 0);
    if (paymentAmount <= 0) throw new Error('Le montant du paiement doit être supérieur à zéro');
    if (paymentAmount > invoice.remainingAmount) {
      throw new Error(`Le montant (${paymentAmount.toLocaleString()} DA) dépasse la dette restante (${invoice.remainingAmount.toLocaleString()} DA)`);
    }

    const account = this.getFinancialAccount(data.accountId);
    if (!account) throw new Error('Compte financier émetteur introuvable');

    // 1. Enregistrer le décaissement de trésorerie (vérifie la solvabilité)
    const tx = this.recordCashTransaction({
      type: 'DECAISSEMENT_FOURNISSEUR',
      amount: paymentAmount,
      accountId: account.id,
      supplierInvoiceId: invoice.id,
      supplierInvoiceNumber: invoice.invoiceNumber,
      projectId: invoice.projectId,
      projectCode: invoice.projectCode,
      referenceDocument: data.referenceDocument || `VIR-FOU-${invoice.internalReference}`,
      paymentMethod: 'VIREMENT',
      category: `Règlement Fournisseur ${invoice.supplierName}`,
      notes: data.notes || `Paiement facture ${invoice.invoiceNumber}`,
      idempotencyKey: data.idempotencyKey,
    }, user);

    // 2. Mettre à jour la dette fournisseur
    invoice.paidAmount += paymentAmount;
    invoice.remainingAmount = Math.max(0, invoice.amountTTC - invoice.paidAmount);
    if (invoice.remainingAmount === 0) {
      invoice.status = 'PAYEE';
    } else {
      invoice.status = 'PARTIELLEMENT_PAYEE';
    }
    invoice.updatedAt = new Date().toISOString();

    // NOTE SÉCURITÉ ANTI-DOUBLE-COMPTE :
    // Le paiement de la dette fournisseur ne génère PAS de StoredCostEntry sur le projet.
    // Le coût du projet a déjà été imputé lors de l'engagement (BC) ou de la réception physique (BR/Sortie stock).

    this.addAuditLog('RECORD_SUPPLIER_PAYMENT', 'FINANCE', invoice.internalReference, `Décaissement de ${paymentAmount.toLocaleString()} DA en règlement de ${invoice.internalReference}`, user);
    return { invoice, transaction: tx };
  }

  // --- BALANCE ÂGÉE & ÉCHÉANCIER CLIENT / FOURNISSEUR ---
  getAgedTrialBalance(filter?: { includeDemo?: boolean }) {
    const today = new Date().getTime();
    const includeDemo = filter?.includeDemo === true;

    const relevantCustomerInvoices = this.customerInvoices.filter(i => includeDemo || (!i.isDemoInvoice && !i.id?.startsWith('fac-demo-') && !i.id?.startsWith('inv-demo-')));
    const relevantSupplierInvoices = this.supplierInvoices.filter(i => includeDemo || (!i.isDemoInvoice && !i.id?.startsWith('fac-fou-demo-')));

    const clientBuckets = { current: 0, days30: 0, days60: 0, days90Plus: 0, total: 0 };
    for (const inv of relevantCustomerInvoices) {
      if (inv.remainingAmount <= 0) continue;
      const due = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((today - due) / (1000 * 86400));

      if (diffDays <= 0) clientBuckets.current += inv.remainingAmount;
      else if (diffDays <= 30) clientBuckets.days30 += inv.remainingAmount;
      else if (diffDays <= 60) clientBuckets.days60 += inv.remainingAmount;
      else clientBuckets.days90Plus += inv.remainingAmount;
      clientBuckets.total += inv.remainingAmount;
    }

    const supplierBuckets = { current: 0, days30: 0, days60: 0, days90Plus: 0, total: 0 };
    for (const inv of relevantSupplierInvoices) {
      if (inv.remainingAmount <= 0) continue;
      const due = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((today - due) / (1000 * 86400));

      if (diffDays <= 0) supplierBuckets.current += inv.remainingAmount;
      else if (diffDays <= 30) supplierBuckets.days30 += inv.remainingAmount;
      else if (diffDays <= 60) supplierBuckets.days60 += inv.remainingAmount;
      else supplierBuckets.days90Plus += inv.remainingAmount;
      supplierBuckets.total += inv.remainingAmount;
    }

    const bfrDA = clientBuckets.total - supplierBuckets.total;
    return {
      clients: clientBuckets,
      suppliers: supplierBuckets,
      customerAging: clientBuckets,
      supplierAging: supplierBuckets,
      workingCapitalRequirement: {
        customerReceivablesTotal: clientBuckets.total,
        supplierPayablesTotal: supplierBuckets.total,
        bfrDA,
        status: bfrDA > 0 ? 'BESOIN_NET' : 'RESSOURCE_NETTE',
        isDemoIncluded: includeDemo,
      },
      netWorkingCapitalNeed: bfrDA, // BFR simplifié (Créances - Dettes)
      isDemoIncluded: includeDemo,
    };
  }

  // --- RENTABILITÉ RÉELLE PAR PROJET (SYNTHÈSE MULTI-MODULES) ---
  getProjectProfitability(projectIdOrCode: string) {
    const proj = this.projects.find(p => p.id === projectIdOrCode || p.code === projectIdOrCode);
    if (!proj) return null;

    // 1. Chiffre d'Affaires Contractuel et Facturé
    const contractAmount = proj.contractAmount || 0;
    const billedSituationsHT = (proj.workSituations || []).reduce((sum: number, s: any) => sum + (s.amountHT || 0), 0);
    const clientInvoicesHT = this.customerInvoices
      .filter(i => i.projectId === proj.id || i.projectCode === proj.code)
      .reduce((sum, i) => sum + i.amountHT, 0);

    const actualBilledHT = clientInvoicesHT > 0 ? clientInvoicesHT : billedSituationsHT;

    // Encaissements réels constatés
    const collectedTTC = this.cashTransactions
      .filter(t => (t.projectId === proj.id || t.projectCode === proj.code) && t.type === 'ENCAISSEMENT_CLIENT' && t.status === 'VALIDE')
      .reduce((sum, t) => sum + t.amount, 0);

    // 2. Décomposition des Coûts Réels par Source (Sans double comptage)
    // Coûts Fournitures & Matières Réceptionnées (BR validés)
    const materialsCost = this.goodsReceipts
      .filter(gr => gr.projectId === proj.id || gr.projectCode === proj.code)
      .reduce((sum, gr) => sum + gr.lines.reduce((acc, l) => acc + ((l.acceptedQuantity || l.deliveredQuantity || 0) * (l.unitPriceHT || 0)), 0), 0);

    // Coûts Main d'Œuvre Chantier (Pointages réels)
    const laborCost = this.attendances
      .filter(att => att.projectId === proj.id)
      .reduce((sum, att) => sum + ((att.hoursWorked || 0) * 800) + (att.allowanceAmount || 0), 0);

    // Sous-traitance & Frais Généraux imputés sur le projet
    const directOtherExpenses = (proj.costEntries || [])
      .filter((c: any) => c.category !== 'MATIERE_STOCK') // Évite doublon avec consommations stock
      .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

    const totalRealDirectCost = materialsCost + laborCost + directOtherExpenses;
    const estimatedBudget = proj.budgetAmount || 0;

    // Marge Réelle Dégagée sur le Réalisé
    const grossMarginDA = actualBilledHT - totalRealDirectCost;
    const grossMarginPercent = actualBilledHT > 0 ? Number(((grossMarginDA / actualBilledHT) * 100).toFixed(2)) : 0;

    // Engagements restants (BC émis non encore réceptionnés)
    const committedNotDelivered = this.purchaseOrders
      .filter((po: any) => (po.projectId === proj.id || po.projectCode === proj.code) && po.status !== 'LIVRE' && po.status !== 'ANNULE')
      .reduce((sum: number, po: any) => sum + (po.totalHT || po.amount || 0), 0);

    return {
      projectId: proj.id,
      projectCode: proj.code,
      projectName: proj.name,
      clientName: proj.clientName,
      contractAmount,
      estimatedBudget,
      actualBilledHT,
      collectedTTC,
      realCosts: {
        materials: materialsCost,
        labor: laborCost,
        otherExpenses: directOtherExpenses,
        totalDirectCost: totalRealDirectCost,
      },
      committedRemaining: committedNotDelivered,
      projectedFinalCost: totalRealDirectCost + committedNotDelivered,
      grossMarginDA,
      grossMarginPercent,
      budgetVarianceDA: estimatedBudget - (totalRealDirectCost + committedNotDelivered),
      isProfitable: grossMarginDA >= 0,
    };
  }

  // --- MODULE COMMERCIAL & FICHE DE COÛT ---
  // ==========================================

  getCommercialKpis() {
    const oppCount = this.opportunities.length;
    const activeOpps = this.opportunities.filter(o => o.status !== 'PERDUE' && o.status !== 'ANNULEE');
    const totalPipelineValue = activeOpps.reduce((sum, o) => sum + (o.estimatedAmount || 0), 0);
    const inNegotiationOpps = this.opportunities.filter(o => o.status === 'NEGOCIATION');
    const inNegotiationValue = inNegotiationOpps.reduce((sum, o) => sum + (o.estimatedAmount || 0), 0);
    const inCostingOpps = this.opportunities.filter(o => o.status === 'CHIFFRAGE' || o.status === 'VALIDATION_INTERNE');
    const inCostingValue = inCostingOpps.reduce((sum, o) => sum + (o.estimatedAmount || 0), 0);

    const pendingCostSheets = this.costSheets.filter(cs => cs.status === 'EN_ATTENTE_DG' || cs.status === 'PRETE_POUR_VALIDATION');
    const approvedCostSheets = this.costSheets.filter(cs => cs.status === 'VALIDEE' || cs.status === 'SOUMISE_CLIENT' || cs.status === 'GAGNEE');
    const quotesSent = this.customerQuotes.filter(q => q.status === 'ENVOYE');
    const quotesAccepted = this.customerQuotes.filter(q => q.status === 'ACCEPTE');
    const totalWonContractValue = this.costSheets
      .filter(cs => cs.status === 'GAGNEE')
      .reduce((sum, cs) => sum + (cs.proposedSellingPrice || 0), 0);
    const wonOpportunitiesCount = this.opportunities.filter(o => o.status === 'GAGNEE').length;

    const conversionRate = oppCount > 0
      ? Number(((wonOpportunitiesCount / oppCount) * 100).toFixed(1))
      : 0;

    const weightedPipelineValue = Math.round(
      activeOpps.reduce((sum, o) => {
        const prob = o.winProbability
          ? o.winProbability / 100
          : o.status === 'NEGOCIATION' ? 0.75
          : o.status === 'VALIDATION_INTERNE' || o.status === 'OFFRE_SOUMISE' ? 0.60
          : o.status === 'QUALIFIEE' ? 0.40
          : 0.20;
        return sum + (o.estimatedAmount || 0) * prob;
      }, 0)
    );

    const stagesBreakdown: Record<string, { count: number; value: number }> = {
      NOUVELLE: { count: 0, value: 0 },
      QUALIFIEE: { count: 0, value: 0 },
      VISITE_TECHNIQUE: { count: 0, value: 0 },
      CHIFFRAGE: { count: 0, value: 0 },
      VALIDATION_INTERNE: { count: 0, value: 0 },
      OFFRE_SOUMISE: { count: 0, value: 0 },
      NEGOCIATION: { count: 0, value: 0 },
      GAGNEE: { count: 0, value: 0 },
      PERDUE: { count: 0, value: 0 },
      ANNULEE: { count: 0, value: 0 },
    };

    for (const opp of this.opportunities) {
      const st = (opp.status as string) || 'NOUVELLE';
      if (!stagesBreakdown[st]) stagesBreakdown[st] = { count: 0, value: 0 };
      stagesBreakdown[st].count += 1;
      stagesBreakdown[st].value += (opp.estimatedAmount || 0);
    }

    return {
      totalOpportunities: oppCount,
      activeOpportunities: activeOpps.length,
      openOpportunities: activeOpps.length,
      pipelineValue: totalPipelineValue,
      weightedPipelineValue,
      inNegotiationCount: inNegotiationOpps.length,
      inNegotiationValue,
      inCostingCount: inCostingOpps.length,
      inCostingValue,
      pendingCostSheetsCount: pendingCostSheets.length,
      approvedCostSheetsCount: approvedCostSheets.length,
      validatedCostSheetsCount: approvedCostSheets.length,
      quotesSentCount: quotesSent.length,
      quotesAcceptedCount: quotesAccepted.length,
      totalWonValue: totalWonContractValue,
      wonOpportunitiesCount,
      conversionRate,
      stagesBreakdown,
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

  updateOpportunityStage(id: string, newStage: string, data: any = {}, user?: any) {
    const opp = this.opportunities.find(o => o.id === id || o.code === id);
    if (!opp) throw new Error('Opportunité introuvable');

    const validStages = [
      'NOUVELLE',
      'QUALIFIEE',
      'VISITE_TECHNIQUE',
      'CHIFFRAGE',
      'VALIDATION_INTERNE',
      'OFFRE_SOUMISE',
      'NEGOCIATION',
      'GAGNEE',
      'PERDUE',
      'ANNULEE',
    ];
    if (!validStages.includes(newStage)) {
      throw new Error(`Étape invalide : "${newStage}". Étapes autorisées : ${validStages.join(', ')}`);
    }

    if (newStage === 'PERDUE') {
      const reason = data.lossReason || data.reason || '';
      if (!reason || reason.trim() === '') {
        throw new Error('Un motif formel de perte de dossier (lossReason) est obligatoire pour classer une affaire en PERDUE.');
      }
      opp.lossReason = reason;
    }

    if (newStage === 'ANNULEE') {
      const reason = data.cancellationReason || data.reason || '';
      if (!reason || reason.trim() === '') {
        throw new Error('Un motif d\'annulation ou d\'infructuosité (cancellationReason) est obligatoire pour classer une affaire en ANNULEE.');
      }
      opp.cancellationReason = reason;
    }

    if (newStage === 'VISITE_TECHNIQUE' && data.siteVisitDate) {
      opp.siteVisitDate = data.siteVisitDate;
    }
    if (data.technicalReportNotes) {
      opp.technicalReportNotes = data.technicalReportNotes;
    }

    const defaultProbabilities: Record<string, number> = {
      NOUVELLE: 10,
      QUALIFIEE: 20,
      VISITE_TECHNIQUE: 35,
      CHIFFRAGE: 50,
      VALIDATION_INTERNE: 65,
      OFFRE_SOUMISE: 75,
      NEGOCIATION: 85,
      GAGNEE: 100,
      PERDUE: 0,
      ANNULEE: 0,
    };

    const prevStage = opp.status;
    opp.status = newStage as any;
    opp.winProbability = typeof data.winProbability === 'number'
      ? data.winProbability
      : (defaultProbabilities[newStage] ?? opp.winProbability ?? 20);

    opp.stageHistory = opp.stageHistory || [];
    opp.stageHistory.push({
      fromStage: prevStage,
      toStage: newStage,
      changedAt: new Date().toISOString(),
      changedBy: user?.name || 'Commercial SILEX',
      notes: data.notes || data.lossReason || data.cancellationReason || `Transition de l'étape ${prevStage} vers ${newStage}`,
    });
    opp.updatedAt = new Date().toISOString();

    this.addAuditLog(
      'UPDATE_OPPORTUNITY_STAGE',
      'COMMERCIAL',
      opp.code,
      `Passage de l'opportunité ${opp.code} à l'étape ${newStage} (${opp.winProbability}%)`,
      user
    );
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
    const ref = data.reference || `FC-${new Date().getFullYear()}-${num}`;
    const newSheet: StoredCostSheet = {
      id: data.id || `fc-${Date.now()}`,
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

      revisions: [],

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
    if (sheet.status === 'VALIDEE') {
      throw new Error(`Cette fiche de chiffrage (version V${sheet.version}.0) a été formellement approuvée par la Direction Générale et est verrouillée. Veuillez créer une révision (V${sheet.version + 1}.0) pour toute modification ou renégociation.`);
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
      // FIL ROUGE DÉMO : Création automatique immédiate du Projet Chantier
      const projectCode = 'PRJ-' + (sheet.reference || '2026-001').replace('FC-', '');
      let linkedProject = this.projects.find(p => p.code === projectCode || (p as any).costSheetId === sheet.id);
      if (!linkedProject) {
        linkedProject = {
          id: 'proj-' + sheet.id,
          code: projectCode,
          name: sheet.title || `Chantier ${sheet.clientName}`,
          description: `Projet issu de la Fiche de Coût ${sheet.reference} validée par la Direction Générale.`,
          clientName: sheet.clientName,
          sector: (sheet.sector as any) || 'OIL_AND_GAS',
          managerId: 'usr-rp-001',
          managerName: sheet.projectContribution?.responsibleName || 'Karim Mansouri',
          siteLocation: sheet.siteLocation || 'Zone Industrielle Skikda RA1K',
          wilaya: 'Skikda',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
          contractAmountHT: Number(sheet.proposedSellingPrice || 38700000),
          budgetAllocatedHT: Number(sheet.totalEstimatedCost || 29220800),
          budgetRevision: Number(sheet.totalEstimatedCost || 29220800),
          committedCost: 0,
          actualCost: 0,
          eacCost: Number(sheet.totalEstimatedCost || 29220800),
          physicalProgress: 0,
          financialProgress: 0,
          status: 'MOBILIZATION' as any,
          riskLevel: 'LOW' as any,
          costSheetId: sheet.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any;
        if (linkedProject) {
          this.projects.unshift(linkedProject);
        }
      }
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

  createCostSheetRevision(id: string, reason: string, user?: any) {
    const sheet = this.costSheets.find(cs => cs.id === id || cs.reference === id);
    if (!sheet) throw new Error('Fiche de coût introuvable');

    const snapshot: StoredCostSheetRevisionSnapshot = {
      version: sheet.version,
      createdAt: sheet.updatedAt || sheet.createdAt,
      author: user?.name || sheet.history[sheet.history.length - 1]?.actor || 'Chef de Projet',
      role: user?.role || 'RESPONSABLE_PROJET',
      reason: reason || `Révision version V${sheet.version}.0 suite aux négociations commerciales`,
      totalDirectCost: sheet.totalDirectCost,
      totalIndirectCost: sheet.totalIndirectCost,
      totalEstimatedCost: sheet.totalEstimatedCost,
      proposedSellingPrice: sheet.proposedSellingPrice,
      estimatedMarginValue: sheet.estimatedMarginValue,
      targetMarginPercent: sheet.targetMarginPercent,
      marginRateOnCost: sheet.marginRateOnCost,
      markupRate: sheet.markupRate,
      status: sheet.status,
      projectContribution: JSON.parse(JSON.stringify(sheet.projectContribution)),
      procurementContribution: JSON.parse(JSON.stringify(sheet.procurementContribution)),
      hrContribution: JSON.parse(JSON.stringify(sheet.hrContribution)),
      financeContribution: JSON.parse(JSON.stringify(sheet.financeContribution)),
    };

    sheet.revisions = sheet.revisions || [];
    sheet.revisions.push(snapshot);

    sheet.version += 1;
    sheet.status = 'A_REVISER';
    sheet.dgDecision = 'PENDING';
    delete sheet.dgDecisionNotes;
    delete sheet.dgDecidedAt;
    delete sheet.dgDecidedBy;
    delete sheet.dgVisaSignature;

    sheet.history.push({
      action: 'CREATE_REVISION',
      actor: user?.name || 'Chef de Projets',
      role: user?.role || 'RESPONSABLE_PROJET',
      timestamp: new Date().toISOString(),
      notes: `Archivage version V${snapshot.version}.0 et création de la révision V${sheet.version}.0 : ${reason}`,
    });

    sheet.updatedAt = new Date().toISOString();
    this.addAuditLog(
      'CREATE_COST_SHEET_REVISION',
      'COMMERCIAL',
      sheet.reference,
      `Création révision V${sheet.version}.0 pour la fiche ${sheet.reference} : ${reason}`,
      user
    );
    return sheet;
  }

  compareCostSheetVersions(id: string, vA: number, vB: number) {
    const sheet = this.costSheets.find(cs => cs.id === id || cs.reference === id);
    if (!sheet) throw new Error('Fiche de coût introuvable');

    const getVersionData = (v: number): StoredCostSheetRevisionSnapshot => {
      if (v === sheet.version) {
        return {
          version: sheet.version,
          createdAt: sheet.updatedAt,
          author: sheet.history[sheet.history.length - 1]?.actor || 'Chef de Projet',
          role: sheet.history[sheet.history.length - 1]?.role || 'RESPONSABLE_PROJET',
          reason: 'Version active courante',
          totalDirectCost: sheet.totalDirectCost,
          totalIndirectCost: sheet.totalIndirectCost,
          totalEstimatedCost: sheet.totalEstimatedCost,
          proposedSellingPrice: sheet.proposedSellingPrice,
          estimatedMarginValue: sheet.estimatedMarginValue,
          targetMarginPercent: sheet.targetMarginPercent,
          marginRateOnCost: sheet.marginRateOnCost,
          markupRate: sheet.markupRate,
          status: sheet.status,
          projectContribution: sheet.projectContribution,
          procurementContribution: sheet.procurementContribution,
          hrContribution: sheet.hrContribution,
          financeContribution: sheet.financeContribution,
        };
      }
      const rev = (sheet.revisions || []).find(r => r.version === v);
      if (!rev) throw new Error(`Version V${v} introuvable dans l'historique de la fiche ${sheet.reference}`);
      return rev;
    };

    const dataA = getVersionData(vA);
    const dataB = getVersionData(vB);

    const deltas = {
      deltaSellingPrice: dataB.proposedSellingPrice - dataA.proposedSellingPrice,
      deltaSellingPricePct: dataA.proposedSellingPrice > 0
        ? Number((((dataB.proposedSellingPrice - dataA.proposedSellingPrice) / dataA.proposedSellingPrice) * 100).toFixed(2))
        : 0,
      deltaDirectCost: dataB.totalDirectCost - dataA.totalDirectCost,
      deltaIndirectCost: dataB.totalIndirectCost - dataA.totalIndirectCost,
      deltaEstimatedCost: dataB.totalEstimatedCost - dataA.totalEstimatedCost,
      deltaEstimatedCostPct: dataA.totalEstimatedCost > 0
        ? Number((((dataB.totalEstimatedCost - dataA.totalEstimatedCost) / dataA.totalEstimatedCost) * 100).toFixed(2))
        : 0,
      deltaMarginValue: dataB.estimatedMarginValue - dataA.estimatedMarginValue,
      deltaMarginRateOnCost: Number((dataB.marginRateOnCost - dataA.marginRateOnCost).toFixed(2)),
      deltaMarkupRate: Number((dataB.markupRate - dataA.markupRate).toFixed(2)),
      deltaTargetMarginPercent: Number((dataB.targetMarginPercent - dataA.targetMarginPercent).toFixed(2)),
    };

    return {
      reference: sheet.reference,
      title: sheet.title,
      clientName: sheet.clientName,
      versionA: dataA,
      versionB: dataB,
      deltas,
    };
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

  // --- ENQUÊTES DE SATISFACTION CLIENT (COM-12 / PAGE 5/14) ---
  getClientSatisfactionSurveys(projectCode?: string): StoredClientSatisfactionSurvey[] {
    if (projectCode) {
      return this.clientSatisfactionSurveys.filter(s => s.projectCode === projectCode);
    }
    return this.clientSatisfactionSurveys;
  }

  createClientSatisfactionSurvey(data: any, user?: any): StoredClientSatisfactionSurvey {
    const num = String(this.clientSatisfactionSurveys.length + 1).padStart(3, '0');
    const ref = `SAT-${new Date().getFullYear()}-${num}`;

    const qScore = Math.max(1, Math.min(10, Number(data.qualityScore || 8)));
    const sScore = Math.max(1, Math.min(10, Number(data.scheduleScore || 8)));
    const hScore = Math.max(1, Math.min(10, Number(data.hseScore || 9)));
    const rScore = Math.max(1, Math.min(10, Number(data.responsivenessScore || 8)));
    const recScore = Math.max(1, Math.min(10, Number(data.recommendationScore || 9)));

    // Moyenne pondérée sur 10 -> %
    const avgScore = (qScore * 0.25) + (sScore * 0.25) + (hScore * 0.20) + (rScore * 0.15) + (recScore * 0.15);
    const overallScorePercent = Number((avgScore * 10).toFixed(1));

    let appreciation: 'EXCELLENT' | 'SATISFAISANT' | 'MOYEN' | 'A_AMELIORER' = 'SATISFAISANT';
    if (overallScorePercent >= 85) appreciation = 'EXCELLENT';
    else if (overallScorePercent >= 70) appreciation = 'SATISFAISANT';
    else if (overallScorePercent >= 50) appreciation = 'MOYEN';
    else appreciation = 'A_AMELIORER';

    const newSurvey: StoredClientSatisfactionSurvey = {
      id: `sat-${Date.now()}`,
      reference: ref,
      clientName: data.clientName || 'Client Industriel',
      projectCode: data.projectCode,
      projectName: data.projectName,
      contactName: data.contactName || 'Responsable Client',
      contactEmail: data.contactEmail,
      surveyDate: data.surveyDate || new Date().toISOString().split('T')[0],
      qualityScore: qScore,
      scheduleScore: sScore,
      hseScore: hScore,
      responsivenessScore: rScore,
      recommendationScore: recScore,
      overallScorePercent,
      overallScore: overallScorePercent,
      appreciation,
      comments: data.comments || '',
      clientSignatory: data.clientSignatory || data.contactName || '',
      recordedBy: user?.name || 'Service Commercial',
      createdAt: new Date().toISOString(),
    };

    this.clientSatisfactionSurveys.unshift(newSurvey);
    this.addAuditLog('CLIENT_SATISFACTION_SURVEY', 'COMMERCIAL', ref, `Enquête de satisfaction client enregistrée pour ${newSurvey.clientName} (Note: ${overallScorePercent}%)`, user);
    return newSurvey;
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
      contractItems: [],
      tasks: [],
      dailyReports: [],
      situationReports: [],
      constraints: [],
      hseIncidents: [],
      allocations: [],
      purchaseOrders: [],
      nonConformities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.ensureProjectDefaults(newProject);
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

  // =========================================================================
  // MODULE 02 PROJET — METHODES INDUSTRIELLES COMPLETES (PHASE 3)
  // =========================================================================

  ensureProjectDefaults(p: StoredProject) {
    if (!p.contractItems || p.contractItems.length === 0) {
      p.contractItems = [
        {
          id: `item-${p.id}-1`,
          itemCode: 'LOT-01',
          designation: 'Tuyauterie industrielle HP & Remplacement collecteurs A106',
          unit: 'ml',
          contractQty: 450,
          realizedQty: 220,
          validatedQty: 200,
          unitPrice: 20000,
          weightPercentage: 40,
          progress: 44.4,
          dateMeasured: new Date().toISOString().split('T')[0],
          measuredBy: p.managerName || 'Chef de Chantier',
          notes: 'Métré contradictoire attachement N°01 validé Sonatrach',
        },
        {
          id: `item-${p.id}-2`,
          itemCode: 'LOT-02',
          designation: 'Fourniture & Montage robinetterie HP et clapets DN150/200',
          unit: 'u',
          contractQty: 25,
          realizedQty: 12,
          validatedQty: 12,
          unitPrice: 200000,
          weightPercentage: 25,
          progress: 48,
          dateMeasured: new Date().toISOString().split('T')[0],
          measuredBy: p.managerName || 'Superviseur Mécanique',
          notes: 'Vannes reçues et posées sur rack principal',
        },
        {
          id: `item-${p.id}-3`,
          itemCode: 'LOT-03',
          designation: 'Préfabrication charpente métallique et supports de lignes',
          unit: 'T',
          contractQty: 18,
          realizedQty: 10,
          validatedQty: 9,
          unitPrice: 350000,
          weightPercentage: 15,
          progress: 50,
          dateMeasured: new Date().toISOString().split('T')[0],
          measuredBy: 'Amine Khelifi (Resp. Projet)',
          notes: 'Supports ancrés et peints selon spécification CQS',
        },
        {
          id: `item-${p.id}-4`,
          itemCode: 'LOT-04',
          designation: 'Contrôles Non Destructifs CND (Radio/Ressuage) & Épreuves Hydrauliques',
          unit: 'forfait',
          contractQty: 1,
          realizedQty: 0.35,
          validatedQty: 0.3,
          unitPrice: 5500000,
          weightPercentage: 20,
          progress: 30,
          dateMeasured: new Date().toISOString().split('T')[0],
          measuredBy: 'Nadia Chaib (QHSE)',
          notes: 'Tirs radio réalisés sur 42 joints soudés - 0 défaut',
        },
      ];
    }

    if (!p.tasks || p.tasks.length === 0) {
      p.tasks = [
        {
          id: `tsk-${p.id}-1`,
          code: 'TSK-01',
          name: 'Mise en place base de vie & sécurisation chantier ATEX',
          description: 'Installation baraquements, balisage zone, obtention permis de feu Sonatrach et vérification explosimètres.',
          projectId: p.id,
          assignedToId: 'usr-rp-001',
          assignedToName: 'Karim Mansouri (Conducteur)',
          team: 'Équipe HSE & Sécurité',
          plannedStartDate: p.startDate,
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 7 * 86400000).toISOString().split('T')[0],
          actualStartDate: p.startDate,
          actualEndDate: new Date(new Date(p.startDate).getTime() + 6 * 86400000).toISOString().split('T')[0],
          estimatedHours: 120,
          actualHours: 110,
          priority: 'CRITIQUE',
          status: 'TERMINEE',
          progress: 100,
          dependencies: [],
          observations: 'Permis de travail N°2026-PT-04 délivré.',
          isDelayed: false,
        },
        {
          id: `tsk-${p.id}-2`,
          code: 'TSK-02',
          name: 'Montage échafaudages de service Layher autour des collecteurs',
          description: 'Échafaudages tubulaires hauteur 14m avec plinthes, trappes d\'accès et filets pare-gravats.',
          projectId: p.id,
          assignedToId: 'usr-chf-001',
          assignedToName: 'Mourad Zitouni (Superviseur)',
          team: 'Équipe Échafaudeurs',
          plannedStartDate: new Date(new Date(p.startDate).getTime() + 6 * 86400000).toISOString().split('T')[0],
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 18 * 86400000).toISOString().split('T')[0],
          actualStartDate: new Date(new Date(p.startDate).getTime() + 6 * 86400000).toISOString().split('T')[0],
          actualEndDate: new Date(new Date(p.startDate).getTime() + 17 * 86400000).toISOString().split('T')[0],
          estimatedHours: 240,
          actualHours: 235,
          priority: 'ELEVEE',
          status: 'TERMINEE',
          progress: 100,
          dependencies: ['TSK-01'],
          observations: 'PV de réception échafaudage signé conforme.',
          isDelayed: false,
        },
        {
          id: `tsk-${p.id}-3`,
          code: 'TSK-03',
          name: 'Préfabrication spools tuyauterie DN150/200 atelier Annaba',
          description: 'Débit, chanfreinage, pointage et soudage TIG/ARC 6G sur vireurs.',
          projectId: p.id,
          assignedToId: 'usr-rp-001',
          assignedToName: 'Amine Khelifi (Chef Projet)',
          team: 'Atelier Chaudronnerie SILEX',
          plannedStartDate: new Date(new Date(p.startDate).getTime() + 10 * 86400000).toISOString().split('T')[0],
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 35 * 86400000).toISOString().split('T')[0],
          actualStartDate: new Date(new Date(p.startDate).getTime() + 10 * 86400000).toISOString().split('T')[0],
          estimatedHours: 520,
          actualHours: 380,
          priority: 'CRITIQUE',
          status: 'EN_COURS',
          progress: 75,
          dependencies: ['TSK-01'],
          observations: '32 spools sur 45 achevés et contrôlés radio.',
          isDelayed: false,
        },
        {
          id: `tsk-${p.id}-4`,
          code: 'TSK-04',
          name: 'Dépose tuyauteries usagées & transport vers zone ferraille',
          description: 'Déboulonnage brides, découpe thermique contrôlée sous jet d\'azote.',
          projectId: p.id,
          assignedToId: 'usr-chf-001',
          assignedToName: 'Karim Mansouri',
          team: 'Équipe Démontage',
          plannedStartDate: new Date(new Date(p.startDate).getTime() + 20 * 86400000).toISOString().split('T')[0],
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 32 * 86400000).toISOString().split('T')[0],
          actualStartDate: new Date(new Date(p.startDate).getTime() + 20 * 86400000).toISOString().split('T')[0],
          estimatedHours: 280,
          actualHours: 210,
          priority: 'ELEVEE',
          status: 'EN_COURS',
          progress: 60,
          dependencies: ['TSK-02'],
          observations: 'Zone 1 et 2 entièrement dégagées.',
          isDelayed: false,
        },
        {
          id: `tsk-${p.id}-5`,
          code: 'TSK-05',
          name: 'Pose et raccordement sur site des nouveaux spools',
          description: 'Levage à la grue 50T, alignement laser, soudage des joints de position.',
          projectId: p.id,
          assignedToId: 'usr-rp-001',
          assignedToName: 'Amine Khelifi',
          team: 'Équipe Montage Tuyauterie',
          plannedStartDate: new Date(new Date(p.startDate).getTime() + 30 * 86400000).toISOString().split('T')[0],
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 55 * 86400000).toISOString().split('T')[0],
          estimatedHours: 640,
          actualHours: 120,
          priority: 'CRITIQUE',
          status: 'EN_COURS',
          progress: 25,
          dependencies: ['TSK-03', 'TSK-04'],
          observations: 'Joints J-01 à J-14 soudés.',
          isDelayed: false,
        },
        {
          id: `tsk-${p.id}-6`,
          code: 'TSK-06',
          name: 'Contrôles CND radio 100% et ressuage resine',
          description: 'Contrôle gammagraphie Iridium 192 de nuit avec périmètre de sécurité 30m.',
          projectId: p.id,
          assignedToId: 'usr-qhse-001',
          assignedToName: 'Nadia Chaib (QHSE)',
          team: 'Sous-traitance CND spécialisée',
          plannedStartDate: new Date(new Date(p.startDate).getTime() + 45 * 86400000).toISOString().split('T')[0],
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 65 * 86400000).toISOString().split('T')[0],
          estimatedHours: 160,
          actualHours: 0,
          priority: 'CRITIQUE',
          status: 'A_FAIRE',
          progress: 0,
          dependencies: ['TSK-05'],
          observations: 'Plan de tir approuvé par l\'autorité de sûreté radiologique.',
          isDelayed: false,
        },
        {
          id: `tsk-${p.id}-7`,
          code: 'TSK-07',
          name: 'Épreuve hydraulique à 45 bars et réception provisoire',
          description: 'Remplissage eau désminéralisée, montée en pression par paliers, PV contradictoire.',
          projectId: p.id,
          assignedToId: 'usr-rp-001',
          assignedToName: 'Amine Khelifi',
          team: 'Équipe Essais & Réception',
          plannedStartDate: new Date(new Date(p.startDate).getTime() + 60 * 86400000).toISOString().split('T')[0],
          plannedEndDate: new Date(new Date(p.startDate).getTime() + 75 * 86400000).toISOString().split('T')[0],
          estimatedHours: 180,
          actualHours: 0,
          priority: 'CRITIQUE',
          status: 'A_FAIRE',
          progress: 0,
          dependencies: ['TSK-06'],
          observations: 'Manomètres étalonnés certifiés.',
          isDelayed: false,
        },
      ];
    }

    if (!p.dailyReports || p.dailyReports.length === 0) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      p.dailyReports = [
        {
          id: `rjc-${p.id}-01`,
          reportNumber: `RJC-${p.code}-001`,
          projectId: p.id,
          projectCode: p.code,
          projectName: p.name,
          clientName: p.clientName,
          siteLocation: p.siteLocation,
          date: yesterday,
          weatherConditions: 'ENSOLEILLE',
          siteCondition: 'Bonne, sol sec, accès sécurisé zone 100',
          preparedById: 'usr-chf-001',
          preparedByName: 'Karim Mansouri (Chef de Chantier)',
          verifiedById: 'usr-rp-001',
          verifiedByName: 'Amine Khelifi (Resp. Projet)',
          status: 'VALIDE',
          manpower: [
            { trade: 'Chef de chantier', plannedCount: 1, presentCount: 1, hoursWorked: 10, notes: 'Supervision continue' },
            { trade: 'Superviseur tuyauterie', plannedCount: 2, presentCount: 2, hoursWorked: 20, notes: 'Contrôle alignement spools' },
            { trade: 'Tuyauteurs qualifiés', plannedCount: 8, presentCount: 8, hoursWorked: 80, notes: 'Ajustage et boulonnage' },
            { trade: 'Soudeurs certifiés 6G TIG/ARC', plannedCount: 6, presentCount: 6, hoursWorked: 60, notes: 'Soudage joints J-10 à J-14' },
            { trade: 'Animateur HSE dédié', plannedCount: 1, presentCount: 1, hoursWorked: 10, notes: 'Surveillance ATEX et permis de feu' },
            { trade: 'Manoeuvres & Échafaudeurs', plannedCount: 4, presentCount: 4, hoursWorked: 40, notes: 'Manutention et bardage' },
          ],
          activities: [
            {
              id: 'act-1',
              designation: 'Levage et mise en place spools DN200 rack Sud',
              taskId: 'TSK-05',
              plannedQty: 4,
              realizedQty: 4,
              unit: 'spool',
              workersCount: 6,
              hoursSpent: 30,
              observations: 'Manœuvre exécutée avec grue 50T sans incident.',
            },
            {
              id: 'act-2',
              designation: 'Soudage en position de 4 joints circulaires DN150 sch 80',
              taskId: 'TSK-05',
              plannedQty: 4,
              realizedQty: 4,
              unit: 'joint',
              workersCount: 4,
              hoursSpent: 28,
              observations: 'Soudure ARC/TIG passes de racine et remplissage terminées.',
            },
            {
              id: 'act-3',
              designation: 'Broyage et nettoyage des chanfreins zone collecteur B',
              taskId: 'TSK-04',
              plannedQty: 6,
              realizedQty: 6,
              unit: 'chanfrein',
              workersCount: 2,
              hoursSpent: 12,
              observations: 'Contrôle ressuage visuel favorable.',
            },
          ],
          equipmentUsed: [
            { equipmentName: 'Grue mobile 50T Liebherr', quantity: 1, hoursUsed: 8, condition: 'BON', notes: 'Inspection journalière OK' },
            { equipmentName: 'Postes à souder Miller TIG/ARC 400A', quantity: 6, hoursUsed: 9, condition: 'BON', notes: 'Mise à la terre vérifiée' },
            { equipmentName: 'Compresseur de chantier Atlas Copco 12 bars', quantity: 1, hoursUsed: 7, condition: 'BON', notes: 'Alimentation meuleuses' },
          ],
          materialsConsumed: [
            { itemId: 'art-001', designation: 'Tubes acier carbone A106 Gr B sch 80 DN150', quantity: 36, unit: 'ml', stockMovementRef: 'SM-2026-088', notes: 'Bordereau sortie magasin N°88' },
            { itemId: 'art-002', designation: 'Électrodes basiques E7018 diamètre 3.2mm', quantity: 15, unit: 'kg', stockMovementRef: 'SM-2026-089', notes: 'Étuve à 350°C respectée' },
            { itemId: 'art-003', designation: 'Boulonnerie B7/2H diamètre 3/4" x 90mm', quantity: 64, unit: 'u', stockMovementRef: 'SM-2026-090', notes: 'Graissage au cuivre' },
          ],
          incidents: [
            {
              type: 'SECURITE',
              description: 'Presque-accident : chute d\'une clé à molette retenue par longe antichute.',
              severity: 'MINEURE',
              actionTaken: 'Rappel des consignes de travail en hauteur lors du quart d\'heure sécurité.',
              time: '14:20',
              supervisor: 'Nadia Chaib (HSE)',
            },
          ],
          generalObservations: 'Cadence de travail excellente. Avancement en avance de 1.5 jour sur le jalon contractuel J2.',
          visaChantier: 'VISA-CHEF-CHANTIER-VALIDATED-2026',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    }

    if (!p.situationReports || p.situationReports.length === 0) {
      p.situationReports = [
        {
          id: `rsp-${p.id}-01`,
          reportNumber: `RSP-${p.code}-001`,
          projectId: p.id,
          projectCode: p.code,
          projectName: p.name,
          clientName: p.clientName,
          periodStart: p.startDate,
          periodEnd: new Date(new Date(p.startDate).getTime() + 30 * 86400000).toISOString().split('T')[0],
          reportDate: new Date().toISOString().split('T')[0],
          preparedByName: p.managerName || 'Amine Khelifi (Resp. Projet)',
          physicalStatus: {
            plannedProgress: 42,
            actualProgress: p.physicalProgress || 44,
            completedTasksCount: 2,
            delayedTasksCount: 0,
            summary: 'Travaux de tuyauterie en ligne avec les engagements QCD. Phase dépose et préfabrication achevées dans les délais.',
          },
          financialStatus: {
            initialBudget: p.budgetAmount,
            revisedBudget: p.budgetAmount,
            committedCost: p.committedBudget || Math.round(p.budgetAmount * 0.55),
            actualCost: p.spentBudget || Math.round(p.budgetAmount * 0.38),
            billedAmount: Math.round(p.contractAmount * 0.35),
            forecastAtCompletion: p.budgetAmount,
            budgetVariance: 0,
          },
          logisticsStatus: {
            criticalProcurementNeeds: 'Fourniture de 8 vannes de purge spéciales sous 12 jours.',
            pendingOrdersCount: 2,
            stockAlertsCount: 0,
          },
          hrStatus: {
            mobilizedHeadcount: 22,
            totalHoursWorked: 2840,
            absentCount: 1,
            additionalNeeds: '2 soudeurs 6G supplémentaires requis pour la phase d\'épreuve hydro.',
          },
          risksStatus: {
            openConstraintsCount: 1,
            criticalRisksSummary: 'Co-activité temporaire avec l\'équipe instrumentation du client.',
            correctiveActions: [
              { action: 'Coordination journalière à 07h30 avec le chef d\'unité Sonatrach', responsible: 'Karim Mansouri', status: 'EN_COURS' },
            ],
          },
          generalAppraisal: 'Chantier sous excellente maîtrise opérationnelle, zéro accident avec arrêt, relation client constructive.',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (!p.constraints || p.constraints.length === 0) {
      p.constraints = [
        {
          id: `ctr-${p.id}-1`,
          reference: `CTR-${p.code}-01`,
          projectId: p.id,
          projectCode: p.code,
          dateDetected: p.startDate,
          type: 'APPROVISIONNEMENT',
          description: 'Délai d\'acheminement des brides forgées classe 600 depuis l\'importateur rallongé de 4 jours.',
          impact: 'Risque de décalage du montage sur le rack Sud.',
          severity: 'ELEVEE',
          assignedToName: 'Farouk Brahimi (Achats)',
          correctiveAction: 'Dépannage d\'urgence via transfert inter-chantiers depuis le magasin central Annaba.',
          deadline: new Date(new Date(p.startDate).getTime() + 10 * 86400000).toISOString().split('T')[0],
          status: 'RESOLUE',
          resolvedDate: new Date(new Date(p.startDate).getTime() + 8 * 86400000).toISOString().split('T')[0],
          createdAt: p.startDate,
        },
        {
          id: `ctr-${p.id}-2`,
          reference: `CTR-${p.code}-02`,
          projectId: p.id,
          projectCode: p.code,
          dateDetected: new Date(new Date(p.startDate).getTime() + 15 * 86400000).toISOString().split('T')[0],
          type: 'SECURITE',
          description: 'Présence d\'émissions résiduelles de vapeurs d\'hydrocarbures lors de l\'ouverture du circuit collecteur B.',
          impact: 'Interdiction temporaire des travaux par point chaud (soudage / meulage).',
          severity: 'BLOQUANTE',
          assignedToName: 'Nadia Chaib (HSE)',
          correctiveAction: 'Pose de ballons obturateurs et inertage à l\'azote par l\'exploitant avec vérification explosimètre.',
          deadline: new Date(new Date(p.startDate).getTime() + 18 * 86400000).toISOString().split('T')[0],
          status: 'RESOLUE',
          resolvedDate: new Date(new Date(p.startDate).getTime() + 17 * 86400000).toISOString().split('T')[0],
          createdAt: new Date(new Date(p.startDate).getTime() + 15 * 86400000).toISOString().split('T')[0],
        },
        {
          id: `ctr-${p.id}-3`,
          reference: `CTR-${p.code}-03`,
          projectId: p.id,
          projectCode: p.code,
          dateDetected: new Date().toISOString().split('T')[0],
          type: 'RH',
          description: 'Besoin de 2 tuyauteurs supplémentaires certifiés pour anticiper le raccordement de la boucle Nord.',
          impact: 'Garantir la date cible d\'épreuve hydro sans recours aux heures supplémentaires excessives.',
          severity: 'MOYENNE',
          assignedToName: 'Sabrina Haddad (RH)',
          correctiveAction: 'Mobilisation de 2 opérateurs qualifiés de la base Annaba dès lundi matin.',
          deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          status: 'EN_COURS',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (!p.hseIncidents || p.hseIncidents.length === 0) {
      p.hseIncidents = [
        {
          id: `hse-${p.id}-1`,
          reference: `HSE-${p.code}-01`,
          projectId: p.id,
          projectCode: p.code,
          incidentDate: new Date(new Date(p.startDate).getTime() + 12 * 86400000).toISOString().split('T')[0],
          type: 'PRESQUE_ACCIDENT',
          severity: 'SIGNIFICATIVE',
          locationZone: 'Zone 100 - Tour de distillation T-101',
          description: 'Désolidarisation d\'une pince de levage à vide lors de la descente du palan. Aucun blessé.',
          immediateAction: 'Arrêt immédiat de la manœuvre et remplacement de la pince par un modèle certifié à verrouillage automatique.',
          correctiveAction: 'Inspection et contrôle CND magnétoscopie de tous les apparaux de levage du chantier.',
          responsibleName: 'Nadia Chaib (QHSE)',
          deadline: new Date(new Date(p.startDate).getTime() + 15 * 86400000).toISOString().split('T')[0],
          status: 'CLOTURE',
          closedDate: new Date(new Date(p.startDate).getTime() + 14 * 86400000).toISOString().split('T')[0],
          createdAt: new Date(new Date(p.startDate).getTime() + 12 * 86400000).toISOString(),
        },
        {
          id: `hse-${p.id}-2`,
          reference: `HSE-${p.code}-02`,
          projectId: p.id,
          projectCode: p.code,
          incidentDate: new Date().toISOString().split('T')[0],
          type: 'INSPECTION_HSE',
          severity: 'MINEURE',
          locationZone: 'Atelier de préfabrication temporaire chantier',
          description: 'Inspection périodique de sécurité : vérification des extincteurs CO2 et des harnais de sécurité.',
          immediateAction: 'Remplacement d\'un extincteur dont la goupille était corrodée.',
          correctiveAction: 'Registre de vérification semestrielle émargé sans réserve.',
          responsibleName: 'Karim Mansouri (Chef de Chantier)',
          deadline: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          status: 'EN_TRAITEMENT',
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (!p.timesheets || p.timesheets.length === 0) {
      p.timesheets = [
        {
          id: `ts-${p.id}-1`,
          projectCode: p.code,
          date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          workerName: 'Mourad Zitouni',
          corpsEtat: 'SOUDEUR_ASME',
          workerQualification: 'ASME IX 6G TIG/SMAW (Acier Carbone & Inox)',
          normalHours: 8,
          overtimeHours: 2,
          weatherHours: 0,
          hourlyRate: 1400,
          totalCostDA: 8 * 1400 + 2 * (1400 * 1.5),
          taskRef: 'TSK-05',
          productivityRatio: 1.05,
          status: 'VALIDE',
        },
        {
          id: `ts-${p.id}-2`,
          projectCode: p.code,
          date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          workerName: 'Khaled Benyahia',
          corpsEtat: 'TUYAUTEUR_ISO',
          workerQualification: 'Tuyauteur Industriel Qualifié N3 (Iso & Traçage)',
          normalHours: 8,
          overtimeHours: 1,
          weatherHours: 0,
          hourlyRate: 1250,
          totalCostDA: 8 * 1250 + 1 * (1250 * 1.5),
          taskRef: 'TSK-04',
          productivityRatio: 0.98,
          status: 'VALIDE',
        },
        {
          id: `ts-${p.id}-3`,
          projectCode: p.code,
          date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          workerName: 'Abdelghani Touati',
          corpsEtat: 'MONTEUR_ECHAFAUDEUR',
          workerQualification: 'Monteur Échafaudeur Certifié R408',
          normalHours: 8,
          overtimeHours: 0,
          weatherHours: 0,
          hourlyRate: 950,
          totalCostDA: 8 * 950,
          taskRef: 'TSK-02',
          productivityRatio: 1.00,
          status: 'VALIDE',
        },
        {
          id: `ts-${p.id}-4`,
          projectCode: p.code,
          date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
          workerName: 'Yacine Khelifi',
          corpsEtat: 'CONTROLEUR_CND',
          workerQualification: 'COFREND Niveau 2 RT / PT / UT',
          normalHours: 8,
          overtimeHours: 3,
          weatherHours: 0,
          hourlyRate: 1800,
          totalCostDA: 8 * 1800 + 3 * (1800 * 1.5),
          taskRef: 'TSK-06',
          productivityRatio: 1.12,
          status: 'VALIDE',
        },
      ];
    }

    if (!p.pvrp) {
      if (p.status === ProjectStatus.COMPLETED) {
        p.pvrp = {
          status: 'VALIDE_RESERVES_LEVEES',
          pvDate: p.contractEndDate || '2026-01-28',
          signedByClient: true,
          clientSignatory: 'Directeur des Opérations / Client',
          reservesCount: 2,
          reservesLifted: true,
          notes: 'Réception provisoire prononcée avec succès suite aux épreuves réglementaires. 2 réserves mineures de retouche peinture levées.',
        };
      } else {
        p.pvrp = {
          status: 'NON_EMIS',
          pvDate: '',
          signedByClient: false,
          reservesCount: 0,
          reservesLifted: false,
          notes: 'En cours d\'exécution - Réception provisoire à organiser après épreuve hydrostatique.',
        };
      }
    }

    if (!p.pvrd) {
      if (p.status === ProjectStatus.COMPLETED) {
        p.pvrd = {
          status: 'EN_GARANTIE_12M',
          warrantyEndDate: new Date(new Date(p.contractEndDate || '2026-01-28').getTime() + 365 * 86400000).toISOString().split('T')[0],
          signedByClient: false,
          guaranteeReleased: false,
          retentionRefundedDA: 0,
          notes: 'Période de garantie de 12 mois en cours. Libération de la retenue de 5% soumise à signature contradictoire PVRD sans réserve.',
        };
      } else {
        p.pvrd = {
          status: 'NON_EMIS',
          signedByClient: false,
          guaranteeReleased: false,
          retentionRefundedDA: 0,
          notes: 'Non applicable en phase travaux.',
        };
      }
    }
  }

  getProjectTimesheets(codeOrId: string): StoredProjectTimesheet[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    return project.timesheets || [];
  }

  createProjectTimesheet(codeOrId: string, data: any, user?: any): StoredProjectTimesheet {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const normalHours = Number(data.normalHours) || 0;
    const overtimeHours = Number(data.overtimeHours) || 0;
    const weatherHours = Number(data.weatherHours) || 0;
    const hourlyRate = Number(data.hourlyRate) || 1200;
    const totalCostDA = normalHours * hourlyRate + overtimeHours * (hourlyRate * 1.5) + weatherHours * (hourlyRate * 0.75);

    const newTs: StoredProjectTimesheet = {
      id: `ts-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectCode: project.code,
      date: data.date || new Date().toISOString().split('T')[0],
      workerName: data.workerName || 'Intervenant Chantier',
      corpsEtat: data.corpsEtat || 'SOUDEUR_ASME',
      workerQualification: data.workerQualification || 'Qualifié Chantier',
      normalHours,
      overtimeHours,
      weatherHours,
      hourlyRate,
      totalCostDA,
      taskRef: data.taskRef || 'TSK-01',
      productivityRatio: Number(data.productivityRatio) || 1.0,
      status: data.status || 'VALIDE',
    };

    if (!project.timesheets) project.timesheets = [];
    project.timesheets.unshift(newTs);

    project.spentBudget = (project.spentBudget || 0) + totalCostDA;
    if (!project.costEntries) project.costEntries = [];
    project.costEntries.push({
      id: `cst-mo-${Date.now()}`,
      category: 'MAIN_DOEUVRE',
      amount: totalCostDA,
      description: `Pointage MO: ${newTs.workerName} (${normalHours}h HN + ${overtimeHours}h HS)`,
      sourceModule: 'HR',
      date: newTs.date,
    });

    project.updatedAt = new Date().toISOString();
    this.addAuditLog('RECORD_TIMESHEET', 'PROJECT', project.code, `Pointage ${newTs.workerName} (${newTs.normalHours + newTs.overtimeHours}h) enregistré (${totalCostDA.toLocaleString()} DA)`, user);
    return newTs;
  }

  updateProjectReception(codeOrId: string, data: any, user?: any) {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    if (data.type === 'PVRP') {
      project.pvrp = {
        status: data.status || 'VALIDE_SANS_RESERVE',
        pvDate: data.pvDate || new Date().toISOString().split('T')[0],
        signedByClient: data.signedByClient !== undefined ? data.signedByClient : true,
        clientSignatory: data.clientSignatory || 'Direction Client',
        reservesCount: Number(data.reservesCount) || 0,
        reservesLifted: data.reservesLifted !== undefined ? data.reservesLifted : (Number(data.reservesCount) === 0),
        notes: data.notes || 'PV de Réception Provisoire prononcé avec succès.',
      };
      project.updatedAt = new Date().toISOString();
      this.addAuditLog('SIGN_PVRP', 'PROJECT', project.code, `PV de Réception Provisoire (PVRP) enregistré - Statut: ${project.pvrp.status}`, user);
      return project.pvrp;
    }

    if (data.type === 'PVRD') {
      const retentionAmount = Number(project.contractAmount || 0) * ((project.retentionRate || 5) / 100);
      project.pvrd = {
        status: data.status || 'VALIDE_DEFINITIF',
        pvDate: data.pvDate || new Date().toISOString().split('T')[0],
        warrantyEndDate: data.warrantyEndDate || new Date().toISOString().split('T')[0],
        signedByClient: true,
        guaranteeReleased: true,
        retentionRefundedDA: retentionAmount,
        notes: data.notes || `PV de Réception Définitive validé. Restitution ordonnancée de la retenue de garantie (${retentionAmount.toLocaleString()} DA).`,
      };
      project.updatedAt = new Date().toISOString();
      this.addAuditLog('SIGN_PVRD', 'PROJECT', project.code, `PV de Réception Définitive (PVRD) validé avec libération de la retenue de garantie (${retentionAmount.toLocaleString()} DA)`, user);
      return project.pvrd;
    }

    return null;
  }

  // --- TACHES DE CHANTIER (PLANNING OPERATIONNEL) ---

  getProjectTasks(codeOrId: string): StoredProjectTask[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    const today = new Date().toISOString().split('T')[0];
    return (project.tasks || []).map(t => ({
      ...t,
      isDelayed: t.status !== 'TERMINEE' && t.status !== 'ANNULEE' && t.plannedEndDate < today,
    }));
  }

  createProjectTask(codeOrId: string, data: any, user?: any): StoredProjectTask {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const taskNum = String((project.tasks || []).length + 1).padStart(2, '0');
    const taskCode = data.code || `TSK-${taskNum}`;

    const newTask: StoredProjectTask = {
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: taskCode,
      name: data.name || 'Nouvelle Tâche',
      description: data.description || '',
      projectId: project.id,
      milestoneId: data.milestoneId,
      assignedToId: data.assignedToId,
      assignedToName: data.assignedToName || user?.name || 'Chef d\'équipe',
      team: data.team || 'Équipe Chantier',
      plannedStartDate: data.plannedStartDate || new Date().toISOString().split('T')[0],
      plannedEndDate: data.plannedEndDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      actualStartDate: data.actualStartDate,
      actualEndDate: data.actualEndDate,
      estimatedHours: Number(data.estimatedHours) || 8,
      actualHours: Number(data.actualHours) || 0,
      priority: data.priority || 'NORMALE',
      status: data.status || 'A_FAIRE',
      progress: Math.min(100, Math.max(0, Number(data.progress) || 0)),
      dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
      observations: data.observations || '',
      isDelayed: false,
    };

    project.tasks.push(newTask);
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('CREATE_TASK', 'PROJECT', project.code, `Tâche ${taskCode} (${newTask.name}) créée sur le chantier ${project.code}`, user);
    return newTask;
  }

  updateProjectTask(codeOrId: string, taskId: string, data: any, user?: any): StoredProjectTask {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const task = project.tasks.find(t => t.id === taskId || t.code === taskId);
    if (!task) throw new Error('Tâche introuvable');

    if (data.name) task.name = data.name;
    if (data.description !== undefined) task.description = data.description;
    if (data.assignedToId) task.assignedToId = data.assignedToId;
    if (data.assignedToName) task.assignedToName = data.assignedToName;
    if (data.team) task.team = data.team;
    if (data.plannedStartDate) task.plannedStartDate = data.plannedStartDate;
    if (data.plannedEndDate) task.plannedEndDate = data.plannedEndDate;
    if (data.actualStartDate) task.actualStartDate = data.actualStartDate;
    if (data.actualEndDate) task.actualEndDate = data.actualEndDate;
    if (data.estimatedHours !== undefined) task.estimatedHours = Number(data.estimatedHours);
    if (data.actualHours !== undefined) task.actualHours = Number(data.actualHours);
    if (data.priority) task.priority = data.priority;
    if (data.dependencies) task.dependencies = data.dependencies;
    if (data.observations !== undefined) task.observations = data.observations;

    if (data.status) {
      task.status = data.status;
      if (data.status === 'TERMINEE') {
        task.progress = 100;
        if (!task.actualEndDate) task.actualEndDate = new Date().toISOString().split('T')[0];
      }
    }

    if (data.progress !== undefined) {
      task.progress = Math.min(100, Math.max(0, Number(data.progress)));
      if (task.progress === 100 && task.status !== 'TERMINEE') {
        task.status = 'TERMINEE';
        if (!task.actualEndDate) task.actualEndDate = new Date().toISOString().split('T')[0];
      }
    }

    project.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_TASK', 'PROJECT', project.code, `Tâche ${task.code} mise à jour (Statut: ${task.status}, ${task.progress}%)`, user);
    return task;
  }

  deleteProjectTask(codeOrId: string, taskId: string, user?: any) {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const idx = project.tasks.findIndex(t => t.id === taskId || t.code === taskId);
    if (idx === -1) throw new Error('Tâche introuvable');
    const removed = project.tasks.splice(idx, 1)[0];
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('DELETE_TASK', 'PROJECT', project.code, `Tâche ${removed.code} supprimée`, user);
    return { success: true };
  }

  // --- SUIVI DE L'AVANCEMENT PHYSIQUE PONDERE ---

  getContractItems(codeOrId: string): StoredContractItem[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    return project.contractItems || [];
  }

  updateContractItem(codeOrId: string, itemId: string, data: any, user?: any): StoredContractItem {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const item = project.contractItems.find(i => i.id === itemId || i.itemCode === itemId);
    if (!item) throw new Error('Prestation contractuelle introuvable');

    if (data.realizedQty !== undefined) item.realizedQty = Number(data.realizedQty);
    if (data.validatedQty !== undefined) item.validatedQty = Number(data.validatedQty);
    if (data.weightPercentage !== undefined) item.weightPercentage = Number(data.weightPercentage);
    if (data.notes !== undefined) item.notes = data.notes;
    item.dateMeasured = new Date().toISOString().split('T')[0];
    item.measuredBy = user?.name || item.measuredBy;

    if (item.contractQty > 0) {
      item.progress = Math.min(100, Math.round((item.validatedQty / item.contractQty) * 1000) / 10);
    }

    this.recalculateWeightedPhysicalProgress(project);

    project.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_CONTRACT_ITEM', 'PROJECT', project.code, `Métré validé sur ${item.itemCode} (${item.validatedQty}/${item.contractQty} ${item.unit})`, user);
    return item;
  }

  recalculateWeightedPhysicalProgress(projectOrCode: StoredProject | string): number {
    const project = typeof projectOrCode === 'string' ? this.getProject(projectOrCode) : projectOrCode;
    if (!project) return 0;
    this.ensureProjectDefaults(project);

    const items = project.contractItems || [];
    if (items.length === 0) return project.physicalProgress || 0;

    const totalWeight = items.reduce((sum, it) => sum + (it.weightPercentage || 0), 0);
    let weightedSum = 0;

    for (const it of items) {
      const completionRatio = it.contractQty > 0 ? Math.min(1, it.validatedQty / it.contractQty) : 0;
      const weight = totalWeight > 0 ? (it.weightPercentage / totalWeight) : (1 / items.length);
      weightedSum += completionRatio * weight;
    }

    const calculatedProgress = Math.round(weightedSum * 100);
    project.physicalProgress = calculatedProgress;
    return calculatedProgress;
  }

  // --- RAPPORTS JOURNALIERS DE CHANTIER (DAILY SITE REPORTS) ---

  getDailyReports(codeOrId: string): StoredDailyReport[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    return project.dailyReports || [];
  }

  getDailyReport(codeOrId: string, reportId: string): StoredDailyReport | undefined {
    const project = this.getProject(codeOrId);
    if (!project) return undefined;
    this.ensureProjectDefaults(project);
    return project.dailyReports.find(r => r.id === reportId || r.reportNumber === reportId);
  }

  createDailyReport(codeOrId: string, data: any, user?: any): StoredDailyReport {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const reportNum = String((project.dailyReports || []).length + 1).padStart(3, '0');
    const reportRef = `RJC-${project.code}-${reportNum}`;

    const newReport: StoredDailyReport = {
      id: `rjc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportNumber: reportRef,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      clientName: project.clientName,
      siteLocation: project.siteLocation,
      date: data.date || new Date().toISOString().split('T')[0],
      weatherConditions: data.weatherConditions || 'ENSOLEILLE',
      siteCondition: data.siteCondition || 'Site opérationnel',
      preparedById: user?.id || 'usr-chf-001',
      preparedByName: user?.name || 'Chef de Chantier',
      status: 'SOUMIS',
      manpower: Array.isArray(data.manpower) ? data.manpower : [],
      activities: Array.isArray(data.activities) ? data.activities : [],
      equipmentUsed: Array.isArray(data.equipmentUsed) ? data.equipmentUsed : [],
      materialsConsumed: Array.isArray(data.materialsConsumed) ? data.materialsConsumed : [],
      incidents: Array.isArray(data.incidents) ? data.incidents : [],
      generalObservations: data.generalObservations || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    project.dailyReports.unshift(newReport);

    if (newReport.materialsConsumed && newReport.materialsConsumed.length > 0) {
      for (const mat of newReport.materialsConsumed) {
        if (mat.itemId && mat.quantity > 0) {
          try {
            this.recordProjectStockConsumption(project.code, {
              itemId: mat.itemId,
              quantity: mat.quantity,
              unit: mat.unit,
              reason: `Consommation sur rapport journalier ${reportRef}`,
            }, user);
          } catch (e) {
            // continue
          }
        }
      }
    }

    project.updatedAt = new Date().toISOString();
    this.addAuditLog('CREATE_DAILY_REPORT', 'PROJECT', project.code, `Rapport journalier ${reportRef} saisi pour le ${newReport.date}`, user);
    return newReport;
  }

  updateDailyReport(codeOrId: string, reportId: string, data: any, user?: any): StoredDailyReport {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const report = project.dailyReports.find(r => r.id === reportId || r.reportNumber === reportId);
    if (!report) throw new Error('Rapport journalier introuvable');
    if (report.status === 'VALIDE' && user?.role !== SystemRole.DIRECTEUR_GENERAL && user?.role !== SystemRole.ADMINISTRATEUR) {
      throw new Error('Un rapport journalier validé ne peut être modifié sans autorisation de la Direction Générale.');
    }

    if (data.weatherConditions) report.weatherConditions = data.weatherConditions;
    if (data.siteCondition) report.siteCondition = data.siteCondition;
    if (data.manpower) report.manpower = data.manpower;
    if (data.activities) report.activities = data.activities;
    if (data.equipmentUsed) report.equipmentUsed = data.equipmentUsed;
    if (data.materialsConsumed) report.materialsConsumed = data.materialsConsumed;
    if (data.incidents) report.incidents = data.incidents;
    if (data.generalObservations !== undefined) report.generalObservations = data.generalObservations;

    report.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_DAILY_REPORT', 'PROJECT', project.code, `Mise à jour rapport journalier ${report.reportNumber}`, user);
    return report;
  }

  validateDailyReport(codeOrId: string, reportId: string, user?: any): StoredDailyReport {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const report = project.dailyReports.find(r => r.id === reportId || r.reportNumber === reportId);
    if (!report) throw new Error('Rapport journalier introuvable');

    report.status = 'VALIDE';
    report.verifiedById = user?.id || 'usr-rp-001';
    report.verifiedByName = user?.name || 'Responsable Projet';
    report.visaChantier = `VISA-PROJET-${Date.now().toString().slice(-6)}-VALIDE`;
    report.updatedAt = new Date().toISOString();

    this.addAuditLog('VALIDATE_DAILY_REPORT', 'PROJECT', project.code, `Validation officielle rapport journalier ${report.reportNumber}`, user);
    return report;
  }

  // --- RAPPORTS DE SITUATION PERIODIQUES ---

  getSituationReports(codeOrId: string): StoredSituationReport[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    return project.situationReports || [];
  }

  createSituationReport(codeOrId: string, data: any, user?: any): StoredSituationReport {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const reportNum = String((project.situationReports || []).length + 1).padStart(3, '0');
    const reportRef = `RSP-${project.code}-${reportNum}`;

    const openConstraints = (project.constraints || []).filter(c => c.status !== 'RESOLUE' && c.status !== 'CLOTUREE');
    const completedTasks = (project.tasks || []).filter(t => t.status === 'TERMINEE').length;
    const delayedTasks = (project.tasks || []).filter(t => t.isDelayed).length;

    const newReport: StoredSituationReport = {
      id: `rsp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportNumber: reportRef,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      clientName: project.clientName,
      periodStart: data.periodStart || project.startDate,
      periodEnd: data.periodEnd || new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      preparedByName: user?.name || project.managerName || 'Responsable Projet',
      physicalStatus: {
        plannedProgress: Number(data.plannedProgress) || project.physicalProgress || 50,
        actualProgress: project.physicalProgress || 0,
        completedTasksCount: completedTasks,
        delayedTasksCount: delayedTasks,
        summary: data.physicalSummary || `Avancement physique global de ${project.physicalProgress}%. ${completedTasks} tâches achevées.`,
      },
      financialStatus: {
        initialBudget: project.budgetAmount,
        revisedBudget: project.budgetAmount,
        committedCost: project.committedBudget || 0,
        actualCost: project.spentBudget || 0,
        billedAmount: project.workSituations ? project.workSituations.reduce((sum, s) => sum + (s.amountHT || 0), 0) : 0,
        forecastAtCompletion: project.budgetAmount,
        budgetVariance: project.budgetAmount - (project.spentBudget || 0),
      },
      logisticsStatus: {
        criticalProcurementNeeds: data.criticalProcurementNeeds || 'Aucune rupture critique de stock signalée.',
        pendingOrdersCount: (this.purchaseOrders || []).filter(po => po.projectCode === project.code && po.status !== 'LIVRE').length,
        stockAlertsCount: 0,
      },
      hrStatus: {
        mobilizedHeadcount: data.mobilizedHeadcount || 20,
        totalHoursWorked: data.totalHoursWorked || 1600,
        absentCount: data.absentCount || 0,
        additionalNeeds: data.additionalNeeds || 'Effectifs en adéquation avec la charge.',
      },
      risksStatus: {
        openConstraintsCount: openConstraints.length,
        criticalRisksSummary: data.criticalRisksSummary || (openConstraints.length > 0 ? `${openConstraints.length} contrainte(s) active(s) sous suivi.` : 'Tous les risques sous contrôle.'),
        correctiveActions: openConstraints.map(c => ({ action: c.correctiveAction, responsible: c.assignedToName, status: c.status })),
      },
      generalAppraisal: data.generalAppraisal || 'Exécution conforme aux règles de l\'art et exigences contractuelles.',
      createdAt: new Date().toISOString(),
    };

    project.situationReports.unshift(newReport);
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('CREATE_SITUATION_REPORT', 'PROJECT', project.code, `Rapport de situation périodique ${reportRef} généré`, user);
    return newReport;
  }

  // --- REGISTRE DES CONTRAINTES ET DIFFICULTES ---

  getProjectConstraints(codeOrId: string): StoredProjectConstraint[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    return project.constraints || [];
  }

  createProjectConstraint(codeOrId: string, data: any, user?: any): StoredProjectConstraint {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const ctrNum = String((project.constraints || []).length + 1).padStart(2, '0');
    const ctrRef = `CTR-${project.code}-${ctrNum}`;

    const newConstraint: StoredProjectConstraint = {
      id: `ctr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reference: ctrRef,
      projectId: project.id,
      projectCode: project.code,
      dateDetected: data.dateDetected || new Date().toISOString().split('T')[0],
      type: data.type || 'TECHNIQUE',
      description: data.description || '',
      impact: data.impact || '',
      severity: data.severity || 'MOYENNE',
      assignedToName: data.assignedToName || user?.name || 'Chef de Chantier',
      assignedToId: data.assignedToId,
      correctiveAction: data.correctiveAction || '',
      deadline: data.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: data.status || 'OUVERTE',
      linkedTaskId: data.linkedTaskId,
      linkedDailyReportId: data.linkedDailyReportId,
      createdAt: new Date().toISOString(),
    };

    project.constraints.unshift(newConstraint);
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('CREATE_CONSTRAINT', 'PROJECT', project.code, `Contrainte ${ctrRef} signalée (Gravité: ${newConstraint.severity})`, user);
    return newConstraint;
  }

  updateProjectConstraint(codeOrId: string, constraintId: string, data: any, user?: any): StoredProjectConstraint {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const ctr = project.constraints.find(c => c.id === constraintId || c.reference === constraintId);
    if (!ctr) throw new Error('Contrainte introuvable');

    if (data.description !== undefined) ctr.description = data.description;
    if (data.impact !== undefined) ctr.impact = data.impact;
    if (data.severity) ctr.severity = data.severity;
    if (data.assignedToName) ctr.assignedToName = data.assignedToName;
    if (data.correctiveAction !== undefined) ctr.correctiveAction = data.correctiveAction;
    if (data.deadline) ctr.deadline = data.deadline;
    if (data.status) {
      ctr.status = data.status;
      if (data.status === 'RESOLUE' || data.status === 'CLOTUREE') {
        ctr.resolvedDate = new Date().toISOString().split('T')[0];
      }
    }

    project.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_CONSTRAINT', 'PROJECT', project.code, `Contrainte ${ctr.reference} mise à jour (Statut: ${ctr.status})`, user);
    return ctr;
  }

  // --- QUALITE ET SECURITE HSE ---

  getHseIncidents(codeOrId: string): StoredHseIncident[] {
    const project = this.getProject(codeOrId);
    if (!project) return [];
    this.ensureProjectDefaults(project);
    return project.hseIncidents || [];
  }

  createHseIncident(codeOrId: string, data: any, user?: any): StoredHseIncident {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const hseNum = String((project.hseIncidents || []).length + 1).padStart(2, '0');
    const hseRef = `HSE-${project.code}-${hseNum}`;

    const newHse: StoredHseIncident = {
      id: `hse-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reference: hseRef,
      projectId: project.id,
      projectCode: project.code,
      incidentDate: data.incidentDate || new Date().toISOString().split('T')[0],
      type: data.type || 'OBSERVATION_SECURITE',
      severity: data.severity || 'MINEURE',
      locationZone: data.locationZone || project.siteLocation,
      description: data.description || '',
      immediateAction: data.immediateAction || '',
      correctiveAction: data.correctiveAction || '',
      responsibleName: data.responsibleName || user?.name || 'Responsable HSE',
      deadline: data.deadline || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'OUVERT',
      createdAt: new Date().toISOString(),
    };

    project.hseIncidents.unshift(newHse);
    project.updatedAt = new Date().toISOString();
    this.addAuditLog('CREATE_HSE_INCIDENT', 'PROJECT', project.code, `Événement HSE ${hseRef} enregistré (${newHse.type} - ${newHse.severity})`, user);
    return newHse;
  }

  updateHseIncident(codeOrId: string, incidentId: string, data: any, user?: any): StoredHseIncident {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');
    this.ensureProjectDefaults(project);

    const hse = project.hseIncidents.find(h => h.id === incidentId || h.reference === incidentId);
    if (!hse) throw new Error('Incident HSE introuvable');

    if (data.description) hse.description = data.description;
    if (data.immediateAction) hse.immediateAction = data.immediateAction;
    if (data.correctiveAction) hse.correctiveAction = data.correctiveAction;
    if (data.status) {
      hse.status = data.status;
      if (data.status === 'RESOLU' || data.status === 'CLOTURE') {
        hse.closedDate = new Date().toISOString().split('T')[0];
      }
    }

    project.updatedAt = new Date().toISOString();
    this.addAuditLog('UPDATE_HSE_INCIDENT', 'PROJECT', project.code, `Événement HSE ${hse.reference} mis à jour (Statut: ${hse.status})`, user);
    return hse;
  }

  // --- INTERCONNEXION AVEC ACHATS & STOCKS ---

  createProjectPurchaseRequest(codeOrId: string, data: any, user?: any) {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');

    const num = String((this.purchaseRequests || []).length + 1).padStart(3, '0');
    const daRef = `DA-${new Date().getFullYear()}-${num}`;

    const pr = {
      id: `pr-${Date.now()}`,
      requestNumber: daRef,
      code: daRef,
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      initiatorId: user?.id || 'usr-rp-001',
      initiatorName: user?.name || 'Chef de Projet',
      initiatorRole: user?.role || 'RESPONSABLE_PROJET',
      departmentCode: 'OPERATIONS_PROJETS',
      neededDate: data.neededDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      purpose: data.purpose || `Approvisionnement chantier ${project.code} (${project.name})`,
      status: 'SOUMISE',
      priority: data.priority || 'NORMALE',
      totalEstimated: Number(data.totalEstimated || 0),
      lines: Array.isArray(data.lines) ? data.lines : [
        {
          id: `prl-${Date.now()}`,
          itemCode: data.itemCode || 'FOURNITURE',
          designation: data.designation || 'Fourniture chantier',
          quantity: Number(data.quantity) || 1,
          unit: data.unit || 'U',
          estimatedUnitPrice: Number(data.estimatedUnitPrice) || Number(data.totalEstimated) || 0,
        }
      ],
      createdAt: new Date().toISOString(),
    };

    if (!this.purchaseRequests) this.purchaseRequests = [];
    this.purchaseRequests.unshift(pr);

    if (pr.totalEstimated > 0) {
      project.committedBudget = (project.committedBudget || 0) + pr.totalEstimated;
    }

    this.addAuditLog('CREATE_PURCHASE_REQUEST', 'PROCUREMENT', daRef, `Demande d'achat ${daRef} émise depuis le chantier ${project.code}`, user);
    return pr;
  }

  // ============================================================================
  // PHASE 4: INITIALISATION BASELINE ACHATS & STOCKS INDUSTRIELS
  // ============================================================================

  private initProcurementBaseline() {
    // 1. Fournisseurs Industriels Homologués
    this.suppliers = [
      {
        id: 'supp-001',
        code: 'FOURN-001',
        name: 'Batimetal Tuyauteries Algérie',
        category: 'TUYAUTERIE',
        contactName: 'Mohamed Brahimi',
        phone: '+213 21 89 45 12',
        email: 'commercial@batimetal-tuyauterie.dz',
        taxId: '001616010899981',
        tradeRegistryNumber: '16/00-0987654B16',
        bankRIB: '001 00234 0123456789 45 (BEA Alger)',
        address: 'Zone Industrielle Oued Smar, Lot 14, Alger',
        rating: 4.8,
        status: 'ACTIF',
        specialties: ['Tuyauterie sans soudure ASTM A106 Gr.B', 'Coudes forgés ASTM A234', 'Brides ANSI 300#'],
        createdAt: '2026-01-15T08:00:00.000Z',
      },
      {
        id: 'supp-002',
        code: 'FOURN-002',
        name: 'Maghreb Tubes & Raccords Industriels',
        category: 'TUYAUTERIE',
        contactName: 'Nabil Saidi',
        phone: '+213 41 56 78 90',
        email: 'ventes@maghreb-tubes.dz',
        taxId: '001831010778899',
        tradeRegistryNumber: '31/00-1122334B18',
        bankRIB: '002 00111 0987654321 89 (BNA Oran)',
        address: 'Zone Industrielle Es-Sénia, Hangar B3, Oran',
        rating: 4.5,
        status: 'ACTIF',
        specialties: ['Raccords forgés ASTM A105', 'Robinetterie HP', 'Vannes à guillotine'],
        createdAt: '2026-02-10T09:00:00.000Z',
      },
      {
        id: 'supp-003',
        code: 'FOURN-003',
        name: 'Techno-Weld Algérie & Consommables',
        category: 'SOUDAGE',
        contactName: 'Kamel Bensaada',
        phone: '+213 21 67 23 45',
        email: 'contact@technoweld.dz',
        taxId: '002016010445566',
        tradeRegistryNumber: '16/00-5544332B20',
        bankRIB: '003 00888 1234567890 23 (CPA Rouiba)',
        address: 'Zone Industrielle Rouiba, Voie C, Alger',
        rating: 4.7,
        status: 'ACTIF',
        specialties: ['Électrodes basiques E7018', 'Fils TIG ER70S-6', 'Postes inverter Miller', 'Meules 230mm'],
        createdAt: '2026-02-15T10:00:00.000Z',
      },
      {
        id: 'supp-004',
        code: 'FOURN-004',
        name: 'Sarl Levage Lourd & Manutention Sud',
        category: 'LOCATION_ENGINS',
        contactName: 'Djamel Zergoun',
        phone: '+213 29 73 11 22',
        email: 'operations@levage-sud.dz',
        taxId: '001930010332211',
        tradeRegistryNumber: '30/00-7788991B19',
        bankRIB: '004 00555 4567890123 67 (BDL Hassi Messaoud)',
        address: 'Zone Industrielle Irara, Hassi Messaoud, Ouargla',
        rating: 4.2,
        status: 'ACTIF',
        specialties: ['Grues télescopiques 50T-200T', 'Chariots élévateurs tout-terrain', 'Porte-chars'],
        createdAt: '2026-03-01T08:30:00.000Z',
      },
      {
        id: 'supp-005',
        code: 'FOURN-005',
        name: 'Contrôle Industriel CND Algérie (Bureau Veritas Partenaire)',
        category: 'SOUS_TRAITANCE',
        contactName: 'Abdelkader Mezouar',
        phone: '+213 21 78 99 00',
        email: 'cnd@controle-algerie.dz',
        taxId: '001716010556677',
        tradeRegistryNumber: '16/00-9988776B17',
        bankRIB: '001 00444 8901234567 12 (BEA Hydra)',
        address: 'Cité DNC, Bâtiment 4, Hydra, Alger',
        rating: 4.9,
        status: 'ACTIF',
        specialties: ['Tirs radiographiques RT 100%', 'Ressuage PT', 'Ultrasons phased array', 'Agrément Sonatrach'],
        createdAt: '2026-01-20T11:00:00.000Z',
      },
      {
        id: 'supp-006',
        code: 'FOURN-006',
        name: 'Apex Sécurité & Équipements ATEX',
        category: 'EPI_SECURITE',
        contactName: 'Leila Kaced',
        phone: '+213 21 54 32 10',
        email: 'sales@apex-securite.dz',
        taxId: '002116010667788',
        tradeRegistryNumber: '16/00-4455667B21',
        bankRIB: '005 00999 2345678901 99 (BADR Blida)',
        address: 'Boulevard des Martyrs, Blida',
        rating: 3.8,
        status: 'EN_EVALUATION',
        specialties: ['Harnais antichute ATEX', 'Masques ventilés', 'Combinaisons ignifugées Nomex'],
        createdAt: '2026-04-12T14:00:00.000Z',
      },
    ];

    // 2. Magasins & Entrepôts Physiques Multi-Sites
    this.warehouses = [
      {
        id: 'wh-001',
        code: 'MAG-01',
        name: 'Magasin Central Arzew & Base Logistique',
        location: 'Zone Industrielle Arzew, Oran',
        type: 'CENTRAL',
        capacityM2: 3500,
        responsibleName: 'Tarek Meziani (Gestionnaire Magasin)',
        active: true,
        createdAt: '2026-01-05T08:00:00.000Z',
      },
      {
        id: 'wh-002',
        code: 'MAG-02',
        name: 'Dépôt Régional Skikda RA1K',
        location: 'Zone Industrielle Skikda, Raffinerie RA1K',
        type: 'SECONDAIRE',
        capacityM2: 1800,
        responsibleName: 'Yacine Khelifi (Superviseur Logistique Est)',
        active: true,
        createdAt: '2026-01-10T08:00:00.000Z',
      },
      {
        id: 'wh-003',
        code: 'MAG-03',
        name: 'Magasin Chantier Hassi Messaoud',
        location: 'Base de Vie SILEX, Hassi Messaoud',
        type: 'CHANTIER',
        capacityM2: 800,
        responsibleName: 'Mourad Zitouni (Responsable Base)',
        active: true,
        createdAt: '2026-02-01T08:00:00.000Z',
      },
    ];

    // 3. Articles & Catalogue Industriel
    this.inventoryItems = [
      {
        id: 'itm-001',
        code: 'ART-TUY-001',
        name: 'Tube acier carbone sans soudure Sch 40 DN150 (ASTM A106 Gr.B)',
        description: 'Tuyauterie haute pression vapeur 80 bar avec certificat matière CCPU 3.1 EN 10204',
        category: 'TUYAUTERIE',
        resourceType: 'ARTICLE_STOCKABLE',
        unit: 'ml',
        unitCost: 18500,
        minStock: 50,
        currentStock: 180,
        reservedStock: 45,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Allée T-01, Rack Lourd',
        batchNumber: 'LOT-A106-2026-01',
        supplierId: 'supp-001',
        supplierName: 'Batimetal Tuyauteries Algérie',
        createdAt: '2026-01-15T09:00:00.000Z',
      },
      {
        id: 'itm-002',
        code: 'ART-TUY-002',
        name: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
        description: 'Raccord forgé à souder bout-à-bout pour collecteur vapeur haute pression',
        category: 'TUYAUTERIE',
        resourceType: 'ARTICLE_STOCKABLE',
        unit: 'U',
        unitCost: 14000,
        minStock: 20,
        currentStock: 65,
        reservedStock: 15,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Allée T-03, Bac B12',
        supplierId: 'supp-001',
        supplierName: 'Batimetal Tuyauteries Algérie',
        createdAt: '2026-01-15T09:30:00.000Z',
      },
      {
        id: 'itm-003',
        code: 'ART-TUY-003',
        name: 'Bride à collerette Welding Neck Class 300 DN150',
        description: 'Bride forgée ASTM A105 face surélevée RF conforme ASME B16.5',
        category: 'TUYAUTERIE',
        resourceType: 'ARTICLE_STOCKABLE',
        unit: 'U',
        unitCost: 22500,
        minStock: 15,
        currentStock: 40,
        reservedStock: 10,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Allée T-03, Bac B14',
        supplierId: 'supp-002',
        supplierName: 'Maghreb Tubes & Raccords Industriels',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'itm-004',
        code: 'ART-TUY-004',
        name: 'Joint spirométallique inox 316L DN150 CL300',
        description: 'Joint avec anneau de centrage acier carbone et garniture graphite expansé',
        category: 'TUYAUTERIE',
        resourceType: 'CONSOMMABLE',
        unit: 'U',
        unitCost: 3800,
        minStock: 30,
        currentStock: 85,
        reservedStock: 20,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Rayon Joints J-02',
        supplierId: 'supp-002',
        supplierName: 'Maghreb Tubes & Raccords Industriels',
        createdAt: '2026-01-16T11:00:00.000Z',
      },
      {
        id: 'itm-005',
        code: 'ART-SOU-001',
        name: 'Électrodes basiques E7018 diam 3.2mm',
        description: 'Baguettes de soudage enrobées pour aciers au carbone, étuvage 350°C requis',
        category: 'SOUDAGE',
        resourceType: 'CONSOMMABLE',
        unit: 'kg',
        unitCost: 1200,
        minStock: 100,
        currentStock: 450,
        reservedStock: 80,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Armoire Chauffante S-01',
        supplierId: 'supp-003',
        supplierName: 'Techno-Weld Algérie & Consommables',
        createdAt: '2026-01-18T10:00:00.000Z',
      },
      {
        id: 'itm-006',
        code: 'ART-SOU-002',
        name: 'Fil de soudage TIG ER70S-6 diam 2.4mm',
        description: 'Baguettes d\'apport TIG pour passes de pénétration sur tuyauterie haute pression',
        category: 'SOUDAGE',
        resourceType: 'CONSOMMABLE',
        unit: 'kg',
        unitCost: 1950,
        minStock: 50,
        currentStock: 120,
        reservedStock: 30,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Rayon TIG S-03',
        supplierId: 'supp-003',
        supplierName: 'Techno-Weld Algérie & Consommables',
        createdAt: '2026-01-18T11:00:00.000Z',
      },
      {
        id: 'itm-007',
        code: 'ART-EQU-001',
        name: 'Poste à souder autonome Miller Big Blue 400A',
        description: 'Groupe autonome de soudage diesel insonorisé pour chantiers en extérieur',
        category: 'OUTILLAGE',
        resourceType: 'EQUIPEMENT',
        unit: 'U',
        unitCost: 850000,
        minStock: 2,
        currentStock: 6,
        reservedStock: 4,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Parc Matériel Zone Extérieure',
        supplierId: 'supp-003',
        supplierName: 'Techno-Weld Algérie & Consommables',
        createdAt: '2026-01-20T14:00:00.000Z',
      },
      {
        id: 'itm-008',
        code: 'ART-LOC-001',
        name: 'Location Grue mobile télescopique 50T Liebherr',
        description: 'Mise à disposition avec grutier certifié CACES pour opérations de levage lourd',
        category: 'LOCATION_ENGIN',
        resourceType: 'LOCATION',
        unit: 'Jours',
        unitCost: 120000,
        minStock: 0,
        currentStock: 0,
        reservedStock: 0,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Service Non Stockable',
        supplierId: 'supp-004',
        supplierName: 'Sarl Levage Lourd & Manutention Sud',
        createdAt: '2026-02-01T09:00:00.000Z',
      },
      {
        id: 'itm-009',
        code: 'ART-STR-001',
        name: 'Prestation Contrôle CND Radiographie RT 100%',
        description: 'Contrôles non destructifs gamma sur soudures HP selon code ASME B31.3',
        category: 'SOUS_TRAITANCE',
        resourceType: 'SOUS_TRAITANCE',
        unit: 'Forfait',
        unitCost: 450000,
        minStock: 0,
        currentStock: 0,
        reservedStock: 0,
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        location: 'Prestation Externe',
        supplierId: 'supp-005',
        supplierName: 'Contrôle Industriel CND Algérie (Bureau Veritas Partenaire)',
        createdAt: '2026-02-05T09:00:00.000Z',
      },
    ];

    // 4. Expressions de Besoin (EB)
    this.needRequests = [
      {
        id: 'eb-001',
        reference: 'EB-2026-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        siteLocation: 'Zone Industrielle Skikda RA1K',
        requesterId: 'usr-rp-001',
        requesterName: 'Karim Mansouri',
        requesterRole: 'Chef de Projets & Conduite de Travaux',
        department: 'OPERATIONS_PROJETS',
        title: 'Fourniture coudes HP et joints spirométalliques pour arrêt craqueur Skikda',
        justification: 'Remplacement des spools corrodés sur la ligne de vapeur 80 bar du réacteur principal',
        category: 'TUYAUTERIE',
        priority: 'NORMALE',
        desiredDate: '2026-10-25',
        status: 'CONVERTIE_EN_DA',
        items: [
          {
            id: 'ebl-01',
            itemId: 'itm-002',
            itemCode: 'ART-TUY-002',
            description: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
            quantity: 20,
            unit: 'U',
            estimatedUnitPrice: 14000,
            resourceType: 'ARTICLE_STOCKABLE',
            technicalSpecs: 'Épaisseur Sch 40, chanfrein à souder 37.5°, CCPU 3.1 obligatoire',
          },
          {
            id: 'ebl-02',
            itemId: 'itm-004',
            itemCode: 'ART-TUY-004',
            description: 'Joint spirométallique inox 316L DN150 CL300',
            quantity: 30,
            unit: 'U',
            estimatedUnitPrice: 3800,
            resourceType: 'CONSOMMABLE',
            technicalSpecs: 'Graphite expansé haute température 450°C',
          },
        ],
        convertedPrId: 'pr-da-2026-001',
        convertedPrCode: 'DA-2026-001',
        validatorName: 'Farouk Brahimi (Resp. Achats)',
        validationDate: '2026-10-18T11:00:00.000Z',
        createdAt: '2026-10-16T08:30:00.000Z',
        updatedAt: '2026-10-18T11:00:00.000Z',
      },
      {
        id: 'eb-002',
        reference: 'EB-2026-002',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        siteLocation: 'Zone Industrielle Skikda RA1K',
        requesterId: 'usr-rp-001',
        requesterName: 'Mourad Zitouni (Chef d\'équipe)',
        requesterRole: 'Responsable Chantier',
        department: 'OPERATIONS_PROJETS',
        title: 'Renfort consommables soudage TIG et disques meulage zone haute pression',
        justification: 'Accélération des cadences de préfabrication atelier pour respecter le jalon ODS 02',
        category: 'SOUDAGE',
        priority: 'URGENTE',
        desiredDate: '2026-11-20',
        status: 'SOUMISE',
        items: [
          {
            id: 'ebl-03',
            itemId: 'itm-006',
            itemCode: 'ART-SOU-002',
            description: 'Fil de soudage TIG ER70S-6 diam 2.4mm',
            quantity: 40,
            unit: 'kg',
            estimatedUnitPrice: 1950,
            resourceType: 'CONSOMMABLE',
          },
        ],
        createdAt: '2026-11-10T14:20:00.000Z',
        updatedAt: '2026-11-10T14:20:00.000Z',
      },
    ];

    // 5. Demande d'Achat (DA) issue de l'EB-001
    this.purchaseRequests = [
      {
        id: 'pr-da-2026-001',
        code: 'DA-2026-001',
        reference: 'DA-2026-001',
        needRequestReference: 'EB-2026-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        requestedById: 'usr-rp-001',
        requestedByName: 'Karim Mansouri',
        category: 'TUYAUTERIE',
        urgency: 'NORMAL',
        status: 'PO_GENERATED',
        desiredDeliveryDate: '2026-11-05',
        deliveryLocation: 'Zone Industrielle Skikda RA1K',
        amountHT: 640000,
        vatRate: 19,
        amountTVA: 121600,
        amountTTC: 761600,
        justification: 'Fourniture coudes acier carbone ANSI B16.9 et joints CL300 pour Skikda',
        certificationsRequired: {
          ccpu31: true,
          cndReport: true,
          coc: true,
          atexFds: false,
        },
        items: [
          {
            id: 'pri-01',
            itemId: 'itm-002',
            itemCode: 'ART-TUY-002',
            description: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
            quantity: 20,
            unit: 'U',
            unitPrice: 14000,
            totalPrice: 280000,
          },
          {
            id: 'pri-02',
            itemId: 'itm-003',
            itemCode: 'ART-TUY-003',
            description: 'Bride à collerette Welding Neck Class 300 DN150',
            quantity: 16,
            unit: 'U',
            unitPrice: 22500,
            totalPrice: 360000,
          },
        ],
        selectedSupplierId: 'supp-001',
        selectedSupplierName: 'Batimetal Tuyauteries Algérie',
        createdAt: '2026-10-18T14:00:00.000Z',
      },
    ];

    // 6. Consultation Fournisseurs (RFQ) & Comparatif TCO
    this.rfqConsultations = [
      {
        id: 'rfq-001',
        reference: 'RFQ-2026-001',
        title: 'Consultation Fournisseurs Tuyauteries & Raccords Forgés Skikda RA1K',
        purchaseRequestId: 'pr-da-2026-001',
        purchaseRequestCode: 'DA-2026-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        issueDate: '2026-10-19',
        closingDate: '2026-10-24',
        status: 'CLOTUREE',
        invitedSuppliers: [
          { supplierId: 'supp-001', supplierName: 'Batimetal Tuyauteries Algérie', status: 'REPONDU' },
          { supplierId: 'supp-002', supplierName: 'Maghreb Tubes & Raccords Industriels', status: 'REPONDU' },
          { supplierId: 'supp-006', supplierName: 'Fournisseur Généraliste Non Agréé', status: 'REPONDU' },
        ],
        items: [
          { description: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB', quantity: 20, unit: 'U' },
          { description: 'Bride à collerette Welding Neck Class 300 DN150', quantity: 16, unit: 'U' },
        ],
        offers: [
          {
            id: 'off-01',
            supplierId: 'supp-001',
            supplierCode: 'FOURN-001',
            supplierName: 'Batimetal Tuyauteries Algérie',
            unitPriceHT: 17777,
            totalPriceHT: 640000,
            deliveryLeadTimeDays: 7,
            paymentTerms: '30 jours fin de mois après réception conforme',
            warrantyMonths: 12,
            certificationsProvided: { ccpu31: true, cndReport: true, coc: true, atex: true },
            technicalComplianceRating: 95,
            qualityRating: 92,
            notes: 'Matière d\'origine ArcelorMittal avec traçabilité complète de coulée',
            submittedAt: '2026-10-21T10:00:00.000Z',
            isEliminated: false,
            tcoScore: 92.4,
          },
          {
            id: 'off-02',
            supplierId: 'supp-002',
            supplierCode: 'FOURN-002',
            supplierName: 'Maghreb Tubes & Raccords Industriels',
            unitPriceHT: 19166,
            totalPriceHT: 690000,
            deliveryLeadTimeDays: 5,
            paymentTerms: '45 jours virement bancaire',
            warrantyMonths: 18,
            certificationsProvided: { ccpu31: true, cndReport: true, coc: true, atex: true },
            technicalComplianceRating: 90,
            qualityRating: 88,
            notes: 'Stock disponible immédiatement sur magasin Oran',
            submittedAt: '2026-10-22T14:30:00.000Z',
            isEliminated: false,
            tcoScore: 88.1,
          },
          {
            id: 'off-03',
            supplierId: 'supp-006',
            supplierCode: 'FOURN-006',
            supplierName: 'Fournisseur Généraliste Non Agréé',
            unitPriceHT: 16111,
            totalPriceHT: 580000,
            deliveryLeadTimeDays: 21,
            paymentTerms: 'Comptant à la livraison',
            warrantyMonths: 6,
            certificationsProvided: { ccpu31: false, cndReport: false, coc: false, atex: false },
            technicalComplianceRating: 40,
            qualityRating: 50,
            notes: 'Prix le plus bas mais certificat matière CCPU 3.1 absent',
            submittedAt: '2026-10-23T09:15:00.000Z',
            isEliminated: true,
            eliminationReason: 'ÉLIMINÉ : Certificat CCPU 3.1 EN 10204 obligatoire manquant (Exigence de sécurité Sonatrach RA1K)',
            tcoScore: 0,
          },
        ],
        selectedSupplierId: 'supp-001',
        selectedSupplierName: 'Batimetal Tuyauteries Algérie',
        selectionJustification: 'Meilleur score TCO (92.4/100). Conformité technique 95%, CCPU 3.1 fourni et délai de 7 jours parfaitement compatible avec le jalon ODS 02.',
        selectedAt: '2026-10-25T11:00:00.000Z',
        createdAt: '2026-10-19T08:00:00.000Z',
      },
    ];

    // 7. Comparateur TCO Validé
    this.tcoComparisons = [
      {
        id: 'tco-001',
        rfqId: 'rfq-001',
        rfqReference: 'RFQ-2026-001',
        purchaseRequestCode: 'DA-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        evaluationDate: '2026-10-25',
        evaluatedByName: 'Farouk Brahimi (Resp. Achats)',
        criteriaConfig: {
          costWeight: 35,
          technicalWeight: 25,
          leadTimeWeight: 20,
          qualityWeight: 10,
          warrantyWeight: 10,
          mandatoryCcpuRequired: true,
        },
        supplierScores: [
          {
            supplierId: 'supp-001',
            supplierName: 'Batimetal Tuyauteries Algérie',
            totalAmountHT: 640000,
            deliveryDays: 7,
            costScore: 90.6,
            leadTimeScore: 71.4,
            technicalScore: 95.0,
            qualityScore: 92.0,
            warrantyScore: 66.7,
            overallTcoScore: 92.4,
            rank: 1,
            isEliminated: false,
          },
          {
            supplierId: 'supp-002',
            supplierName: 'Maghreb Tubes & Raccords Industriels',
            totalAmountHT: 690000,
            deliveryDays: 5,
            costScore: 84.1,
            leadTimeScore: 100.0,
            technicalScore: 90.0,
            qualityScore: 88.0,
            warrantyScore: 100.0,
            overallTcoScore: 88.1,
            rank: 2,
            isEliminated: false,
          },
          {
            supplierId: 'supp-006',
            supplierName: 'Fournisseur Généraliste Non Agréé',
            totalAmountHT: 580000,
            deliveryDays: 21,
            costScore: 100.0,
            leadTimeScore: 23.8,
            technicalScore: 40.0,
            qualityScore: 50.0,
            warrantyScore: 33.3,
            overallTcoScore: 0.0,
            rank: 3,
            isEliminated: true,
            eliminationReason: 'ÉLIMINÉ : Certificat CCPU 3.1 EN 10204 obligatoire manquant',
          },
        ],
        selectedSupplierId: 'supp-001',
        selectedSupplierName: 'Batimetal Tuyauteries Algérie',
        decisionJustification: 'Attribution motivée : Respect strict des exigences CND et délai garanti 7j',
        status: 'APPROUVE_DG',
        dgVisaSignature: 'VISA-DG-TCO-2026-9812-OK',
        dgApprovedAt: '2026-10-25T15:30:00.000Z',
      },
    ];

    // 8. Bon de Commande (BC) issu du TCO
    this.purchaseOrders = [
      {
        id: 'po-001',
        code: 'BC-2026-001',
        poNumber: 'BC-2026-001',
        purchaseRequestId: 'pr-da-2026-001',
        purchaseRequestCode: 'DA-2026-001',
        rfqReference: 'RFQ-2026-001',
        supplierId: 'supp-001',
        supplierName: 'Batimetal Tuyauteries Algérie',
        supplierCode: 'FOURN-001',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
        status: 'CONFIRMED',
        totalHT: 640000,
        vatAmount: 121600,
        totalTTC: 761600,
        deliveryLeadTimeDays: 7,
        paymentTerms: '30 jours fin de mois après réception conforme',
        deliveryLocation: 'Zone Industrielle Skikda RA1K',
        items: [
          {
            itemId: 'itm-002',
            itemCode: 'ART-TUY-002',
            description: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
            quantity: 20,
            receivedQuantity: 16, // Réception partielle
            remainingQuantity: 4,
            unit: 'U',
            unitPrice: 14000,
            totalPrice: 280000,
          },
          {
            itemId: 'itm-003',
            itemCode: 'ART-TUY-003',
            description: 'Bride à collerette Welding Neck Class 300 DN150',
            quantity: 16,
            receivedQuantity: 16, // Réception complète
            remainingQuantity: 0,
            unit: 'U',
            unitPrice: 22500,
            totalPrice: 360000,
          },
        ],
        issuedAt: '2026-10-26T09:00:00.000Z',
        createdAt: '2026-10-26T09:00:00.000Z',
      },
    ];

    // 9. Bon de Réception (BR) avec contrôle qualité
    this.goodsReceipts = [
      {
        id: 'br-001',
        receiptNumber: 'BR-2026-001',
        purchaseOrderId: 'po-001',
        purchaseOrderCode: 'BC-2026-001',
        supplierId: 'supp-001',
        supplierName: 'Batimetal Tuyauteries Algérie',
        deliveryNoteNumber: 'BL-BATIMETAL-8891',
        receiptDate: '2026-11-02',
        warehouseId: 'wh-002',
        warehouseName: 'Dépôt Régional Skikda RA1K',
        receiverName: 'Yacine Khelifi (Superviseur Logistique)',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        status: 'PARTIEL',
        qualityInspection: {
          inspectorName: 'Nadia Chaib (Resp. QHSE)',
          inspectionDate: '2026-11-02T14:00:00.000Z',
          overallStatus: 'CONFORME',
          ccpuVerified: true,
          cndReportAttached: true,
          observations: 'Contrôle dimensionnel conforme. Clichés radio et certificats de coulée vérifiés conformes.',
        },
        lines: [
          {
            id: 'brl-01',
            itemId: 'itm-002',
            itemCode: 'ART-TUY-002',
            description: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
            orderedQuantity: 20,
            previouslyReceivedQuantity: 0,
            deliveredQuantity: 16,
            acceptedQuantity: 16,
            rejectedQuantity: 0,
            remainingQuantity: 4,
            unit: 'U',
            unitPriceHT: 14000,
            heatNumber: 'LOT-A234-WPB-44',
            batchNumber: 'LOT-A234-WPB-44',
            ccpuCertificateRef: 'CCPU-A234-3.1-102',
            storageLocation: 'Dépôt Régional Skikda RA1K - Rack Tuyauterie B-02',
          },
          {
            id: 'brl-02',
            itemId: 'itm-003',
            itemCode: 'ART-TUY-003',
            description: 'Bride à collerette Welding Neck Class 300 DN150',
            orderedQuantity: 16,
            previouslyReceivedQuantity: 0,
            deliveredQuantity: 16,
            acceptedQuantity: 16,
            rejectedQuantity: 0,
            remainingQuantity: 0,
            unit: 'U',
            unitPriceHT: 22500,
            heatNumber: 'LOT-WN300-2026-09',
            batchNumber: 'LOT-WN300-2026-09',
            ccpuCertificateRef: 'CCPU-WN300-3.1-014',
            storageLocation: 'Dépôt Régional Skikda RA1K - Palette Brides C-01',
          },
        ],
        totalAcceptedAmountHT: 584000,
        createdAt: '2026-11-02T15:00:00.000Z',
      },
    ];

    // 9.5 Bons de Sortie Magasin (BSM) & Imputation Analytique
    this.bonsDeSortie = [
      {
        id: 'bsm-001',
        bonNumber: 'BSM-2026-0001',
        date: '2026-11-04',
        warehouseId: 'wh-002',
        warehouseName: 'Dépôt Régional Skikda RA1K',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        projectName: 'Revamping Unité 100 — Raffinerie Skikda RA1K',
        clientName: 'Sonatrach Downstream',
        siteLocation: 'Zone Industrielle Skikda',
        wbsCategory: 'TUYAUTERIE',
        recipientName: 'Tahar Benaissa (Chef d\'équipe Tuyauterie)',
        driverName: 'Kamel Rezgui',
        vehicleMatricule: '04592-126-21',
        items: [
          {
            itemId: 'itm-002',
            code: 'ART-TUY-002',
            name: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB',
            quantity: 8,
            unit: 'U',
            unitCost: 14000,
            totalCost: 112000,
            heatNumber: 'LOT-A234-WPB-44',
            batchNumber: 'LOT-A234-WPB-44',
          },
          {
            itemId: 'itm-003',
            code: 'ART-TUY-003',
            name: 'Bride à collerette Welding Neck Class 300 DN150',
            quantity: 8,
            unit: 'U',
            unitCost: 22500,
            totalCost: 180000,
            heatNumber: 'LOT-WN300-2026-09',
            batchNumber: 'LOT-WN300-2026-09',
          },
        ],
        totalAmountDA: 292000,
        status: 'RECEPTIONNE_CONFORME',
        createdAt: '2026-11-04T09:30:00.000Z',
      },
    ];

    // 10. Contrats Fournisseurs
    this.supplierContracts = [
      {
        id: 'ctr-001',
        contractNumber: 'CTR-FOU-2026-001',
        supplierId: 'supp-001',
        supplierName: 'Batimetal Tuyauteries Algérie',
        title: 'Contrat-Cadre de Fourniture de Tuyauteries Hautes Pressions et Raccords Spéciaux',
        contractType: 'FOURNITURE_CADRE',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        totalAmountHT: 18500000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        paymentTerms: 'Règlement à 30 jours fin de mois avec retenue de garantie 5%',
        retentionGuaranteePercent: 5,
        penaltiesTerms: '1% par semaine de retard plafonné à 10%',
        status: 'ACTIF',
        signedBySilex: 'Amine Benali (Directeur Général)',
        signedBySupplier: 'Mohamed Brahimi (Directeur Commercial Batimetal)',
        documents: [
          { name: 'Convention_Cadre_Batimetal_2026_Signee.pdf', uploadedAt: '2026-01-02T10:00:00.000Z' },
          { name: 'Bareme_Prix_Unitaires_2026.pdf', uploadedAt: '2026-01-02T10:00:00.000Z' },
        ],
        createdAt: '2026-01-02T08:00:00.000Z',
      },
      {
        id: 'ctr-002',
        contractNumber: 'CTR-FOU-2026-002',
        supplierId: 'supp-005',
        supplierName: 'Contrôle Industriel CND Algérie (Bureau Veritas Partenaire)',
        title: 'Contrat de Sous-Traitance Contrôles Non Destructifs et Tirs Radiographiques',
        contractType: 'SOUS_TRAITANCE_CND',
        projectId: 'prj-2026-001',
        projectCode: 'PRJ-2026-001',
        totalAmountHT: 4800000,
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        paymentTerms: 'À présentation du rapport contradictoire agréé',
        retentionGuaranteePercent: 0,
        penaltiesTerms: 'Intervention sous 24h sur site exigée',
        status: 'ACTIF',
        signedBySilex: 'Karim Mansouri (Chef de Projets)',
        signedBySupplier: 'Abdelkader Mezouar (Gérant)',
        documents: [
          { name: 'Contrat_CND_Skikda_2026.pdf', uploadedAt: '2026-10-01T14:00:00.000Z' },
        ],
        createdAt: '2026-10-01T09:00:00.000Z',
      },
    ];

    // 11. Inventaires Physiques
    this.physicalInventories = [
      {
        id: 'inv-001',
        inventoryNumber: 'INV-2026-001',
        warehouseId: 'wh-001',
        warehouseName: 'Magasin Central Arzew & Base Logistique',
        inventoryDate: '2026-06-30',
        responsibleName: 'Tarek Meziani (Gestionnaire Magasin)',
        status: 'CLOTURE',
        itemsCounted: [
          {
            itemId: 'itm-001',
            itemCode: 'ART-TUY-001',
            itemName: 'Tube acier carbone sans soudure Sch 40 DN150',
            unit: 'ml',
            unitCostDA: 18500,
            theoreticalStock: 180,
            physicalCount: 182,
            discrepancyQuantity: 2,
            discrepancyValueDA: 37000,
            discrepancyReason: 'Surplus suite à reliquat d\'un chantier restitué sans bon de retour immédiat',
          },
          {
            itemId: 'itm-005',
            itemCode: 'ART-SOU-001',
            itemName: 'Électrodes basiques E7018 diam 3.2mm',
            unit: 'kg',
            unitCostDA: 1200,
            theoreticalStock: 450,
            physicalCount: 450,
            discrepancyQuantity: 0,
            discrepancyValueDA: 0,
            discrepancyReason: 'Stock parfaitement conforme',
          },
        ],
        totalTheoreticalValueDA: 3870000,
        totalPhysicalValueDA: 3907000,
        totalVarianceValueDA: 37000,
        dgApprovedAt: '2026-07-02T10:00:00.000Z',
        dgApprovedBy: 'Amine Benali (DG)',
        adjustmentMovementReferences: ['MVT-AJUST-2026-001'],
        createdAt: '2026-06-30T17:00:00.000Z',
      },
    ];

    // 12. Évaluations Fournisseurs
    this.supplierEvaluations = [
      {
        id: 'eval-001',
        evaluationNumber: 'EVAL-2026-001',
        supplierId: 'supp-001',
        supplierName: 'Batimetal Tuyauteries Algérie',
        period: 'T3-2026',
        evaluatorName: 'Farouk Brahimi',
        evaluatorRole: 'Responsable Achats & Supply Chain',
        evaluationDate: '2026-10-30',
        scores: {
          deliveryPunctuality: 28,  // /30
          qualityCompliance: 29,    // /30
          quantityAccuracy: 15,     // /15
          responsiveness: 14,       // /15
          commercialPricing: 8,     // /10
        },
        totalScore: 94,
        starRating: 5,
        classification: 'STRATEGIQUE_A',
        comments: 'Fournisseur d\'excellence. Zéro défaut sur les certificats CCPU 3.1. Livraison anticipée de 24h sur le chantier RA1K.',
        recommendedAction: 'DEVELOPPEMENT',
        createdAt: '2026-10-30T16:00:00.000Z',
      },
    ];
  }

  // ============================================================================
  // MÉTHODES EXPRESSIONS DE BESOIN (EB)
  // ============================================================================

  getNeedRequests(projectId?: string): StoredNeedRequest[] {
    if (projectId) {
      return this.needRequests.filter(eb => eb.projectId === projectId || eb.projectCode === projectId);
    }
    return this.needRequests;
  }

  getNeedRequest(idOrRef: string): StoredNeedRequest | undefined {
    return this.needRequests.find(eb => eb.id === idOrRef || eb.reference === idOrRef);
  }

  createNeedRequest(data: any, user?: any): StoredNeedRequest {
    const project = data.projectId ? this.getProject(data.projectId) : undefined;
    const ebNum = String(this.needRequests.length + 1).padStart(3, '0');
    const ebRef = "EB-" + new Date().getFullYear() + "-" + ebNum;

    const newEb: StoredNeedRequest = {
      id: "eb-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      reference: ebRef,
      projectId: project?.id || data.projectId,
      projectCode: project?.code || data.projectCode,
      projectName: project?.name || data.projectName || 'Chantier Industriel SILEX',
      siteLocation: project?.siteLocation || data.siteLocation || 'Site d\'intervention',
      requesterId: user?.id || 'usr-rp-001',
      requesterName: user?.name || data.requesterName || 'Chef de Chantier',
      requesterRole: user?.role || 'RESPONSABLE_PROJET',
      department: user?.departmentCode || 'OPERATIONS_PROJETS',
      title: data.title || 'Besoin matériel chantier',
      justification: data.justification || '',
      category: data.category || 'TUYAUTERIE',
      priority: data.priority || 'NORMALE',
      desiredDate: data.desiredDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'SOUMISE',
      items: Array.isArray(data.items) ? data.items.map((it: any, idx: number) => ({
        id: "ebl-" + Date.now() + "-" + idx,
        itemId: it.itemId,
        itemCode: it.itemCode,
        description: it.description || 'Fourniture industrielle',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'U',
        estimatedUnitPrice: Number(it.estimatedUnitPrice) || 0,
        resourceType: it.resourceType || 'ARTICLE_STOCKABLE',
        technicalSpecs: it.technicalSpecs || '',
      })) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.needRequests.unshift(newEb);
    this.addAuditLog('CREATE_NEED_REQUEST', 'PROCUREMENT', ebRef, 'Expression de besoin ' + ebRef + ' créée pour ' + newEb.projectName, user);
    return newEb;
  }

  validateNeedRequest(id: string, user?: any): StoredNeedRequest {
    const eb = this.getNeedRequest(id);
    if (!eb) throw new Error('Expression de besoin introuvable');
    eb.status = 'VALIDEE';
    eb.validatorName = user?.name || 'Responsable Achats';
    eb.validationDate = new Date().toISOString();
    eb.updatedAt = new Date().toISOString();
    this.addAuditLog('VALIDATE_NEED_REQUEST', 'PROCUREMENT', eb.reference, 'EB ' + eb.reference + ' validée par les Achats', user);
    return eb;
  }

  convertNeedRequestToPR(id: string, user?: any): { needRequest: StoredNeedRequest; purchaseRequest: any } {
    const eb = this.getNeedRequest(id);
    if (!eb) throw new Error('Expression de besoin introuvable');

    const totalHT = eb.items.reduce((sum, it) => sum + (it.quantity * (it.estimatedUnitPrice || 0)), 0);
    const prData = {
      projectId: eb.projectId,
      projectCode: eb.projectCode,
      category: eb.category,
      urgency: eb.priority === 'CRITIQUE' ? 'URGENT' : (eb.priority === 'URGENTE' ? 'HIGH' : 'NORMAL'),
      desiredDeliveryDate: eb.desiredDate,
      deliveryLocation: eb.siteLocation,
      totalHT,
      vatRate: 19,
      justification: "Issue de l'Expression de Besoin " + eb.reference + " : " + eb.justification,
      items: eb.items.map(it => ({
        itemId: it.itemId,
        itemCode: it.itemCode,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.estimatedUnitPrice || 0,
        totalPrice: it.quantity * (it.estimatedUnitPrice || 0),
      })),
    };

    const pr = this.createPurchaseRequest(prData);
    eb.status = 'CONVERTIE_EN_DA';
    eb.convertedPrId = pr.id;
    eb.convertedPrCode = pr.code;
    eb.updatedAt = new Date().toISOString();

    this.addAuditLog('CONVERT_EB_TO_DA', 'PROCUREMENT', eb.reference, 'EB ' + eb.reference + ' convertie en DA ' + pr.code, user);
    return { needRequest: eb, purchaseRequest: pr };
  }

  // ============================================================================
  // MÉTHODES CONSULTATIONS RFQ & COMPARATEUR TCO MULTICRITÈRES
  // ============================================================================

  getRfqConsultations(): StoredRfqConsultation[] {
    return this.rfqConsultations;
  }

  getRfqConsultation(idOrRef: string): StoredRfqConsultation | undefined {
    return this.rfqConsultations.find(r => r.id === idOrRef || r.reference === idOrRef);
  }

  createRfqConsultation(data: any, user?: any): StoredRfqConsultation {
    const rfqNum = String(this.rfqConsultations.length + 1).padStart(3, '0');
    const rfqRef = "RFQ-" + new Date().getFullYear() + "-" + rfqNum;

    const newRfq: StoredRfqConsultation = {
      id: "rfq-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      reference: rfqRef,
      title: data.title || ("Consultation Fournisseurs " + rfqRef),
      purchaseRequestId: data.purchaseRequestId,
      purchaseRequestCode: data.purchaseRequestCode || 'DA-2026',
      projectId: data.projectId,
      projectCode: data.projectCode,
      projectName: data.projectName,
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      closingDate: data.closingDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'OUVERTE',
      invitedSuppliers: Array.isArray(data.invitedSuppliers) ? data.invitedSuppliers : [],
      items: Array.isArray(data.items) ? data.items : [],
      offers: [],
      createdAt: new Date().toISOString(),
    };

    this.rfqConsultations.unshift(newRfq);
    this.addAuditLog('CREATE_RFQ', 'PROCUREMENT', rfqRef, 'Consultation ' + rfqRef + ' ouverte pour la DA ' + newRfq.purchaseRequestCode, user);
    return newRfq;
  }

  addOfferToRfq(rfqId: string, offerData: any, user?: any): StoredRfqOffer {
    const rfq = this.getRfqConsultation(rfqId);
    if (!rfq) throw new Error('Consultation RFQ introuvable');

    const supplier = this.suppliers.find(s => s.id === offerData.supplierId || s.code === offerData.supplierId);

    // Vérification critère éliminatoire (ex: CCPU 3.1 obligatoire)
    const isEliminated = this.tcoConfig.mandatoryCcpuRequired && !offerData.certificationsProvided?.ccpu31;
    const eliminationReason = isEliminated ? 'ÉLIMINÉ : Certificat matière CCPU 3.1 EN 10204 obligatoire manquant' : undefined;

    const offer: StoredRfqOffer = {
      id: "off-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      supplierId: supplier?.id || offerData.supplierId,
      supplierCode: supplier?.code || offerData.supplierCode || 'FOURN',
      supplierName: supplier?.name || offerData.supplierName || 'Fournisseur Candidat',
      unitPriceHT: Number(offerData.unitPriceHT) || 0,
      totalPriceHT: Number(offerData.totalPriceHT) || 0,
      deliveryLeadTimeDays: Number(offerData.deliveryLeadTimeDays) || 7,
      paymentTerms: offerData.paymentTerms || '30 jours fin de mois',
      warrantyMonths: Number(offerData.warrantyMonths) || 12,
      certificationsProvided: {
        ccpu31: !!offerData.certificationsProvided?.ccpu31,
        cndReport: !!offerData.certificationsProvided?.cndReport,
        coc: !!offerData.certificationsProvided?.coc,
        atex: !!offerData.certificationsProvided?.atex,
      },
      technicalComplianceRating: Number(offerData.technicalComplianceRating) || 85,
      qualityRating: Number(offerData.qualityRating) || 85,
      notes: offerData.notes || '',
      submittedAt: new Date().toISOString(),
      isEliminated,
      eliminationReason,
    };

    rfq.offers.push(offer);
    if (rfq.status === 'OUVERTE') rfq.status = 'OFFRES_RECUES';

    this.addAuditLog('ADD_RFQ_OFFER', 'PROCUREMENT', rfq.reference, 'Offre reçue de ' + offer.supplierName + ' (' + offer.totalPriceHT.toLocaleString() + ' DA HT)', user);
    return offer;
  }

  calculateTcoComparison(rfqId: string, customConfig?: Partial<TcoCriteriaConfig>, user?: any): StoredTcoComparison {
    const rfq = this.getRfqConsultation(rfqId);
    if (!rfq) throw new Error('Consultation RFQ introuvable');
    if (rfq.offers.length === 0) throw new Error('Aucune offre enregistrée sur cette consultation');

    const config: TcoCriteriaConfig = {
      ...this.tcoConfig,
      ...(customConfig || {}),
    };

    const validOffers = rfq.offers.filter(o => !o.isEliminated);
    const minPrice = validOffers.length > 0 ? Math.min(...validOffers.map(o => o.totalPriceHT)) : 1;
    const minDays = validOffers.length > 0 ? Math.min(...validOffers.map(o => o.deliveryLeadTimeDays)) : 1;

    const supplierScores = rfq.offers.map(offer => {
      if (offer.isEliminated) {
        return {
          supplierId: offer.supplierId,
          supplierName: offer.supplierName,
          totalAmountHT: offer.totalPriceHT,
          deliveryDays: offer.deliveryLeadTimeDays,
          costScore: 0,
          leadTimeScore: 0,
          technicalScore: 0,
          qualityScore: 0,
          warrantyScore: 0,
          overallTcoScore: 0,
          rank: 99,
          isEliminated: true,
          eliminationReason: offer.eliminationReason,
        };
      }

      // Normalisation directionnelle :
      // - Coût : à minimiser (minPrice / Price * 100)
      const costScore = Math.round((minPrice / offer.totalPriceHT) * 100 * 10) / 10;
      // - Délais : à minimiser (minDays / Days * 100)
      const leadTimeScore = Math.round((minDays / offer.deliveryLeadTimeDays) * 100 * 10) / 10;
      // - Technique, Qualité, Garantie : à maximiser
      const technicalScore = Math.min(100, Math.max(0, offer.technicalComplianceRating));
      const qualityScore = Math.min(100, Math.max(0, offer.qualityRating));
      const warrantyScore = Math.min(100, Math.round((offer.warrantyMonths / 18) * 100));

      const overallTcoScore = Math.round((
        (costScore * config.costWeight) +
        (technicalScore * config.technicalWeight) +
        (leadTimeScore * config.leadTimeWeight) +
        (qualityScore * config.qualityWeight) +
        (warrantyScore * config.warrantyWeight)
      ) / 100 * 10) / 10;

      offer.tcoScore = overallTcoScore;

      return {
        supplierId: offer.supplierId,
        supplierName: offer.supplierName,
        totalAmountHT: offer.totalPriceHT,
        deliveryDays: offer.deliveryLeadTimeDays,
        costScore,
        leadTimeScore,
        technicalScore,
        qualityScore,
        warrantyScore,
        overallTcoScore,
        rank: 1, // assigné après tri
        isEliminated: false,
      };
    });

    // Classement des offres non éliminées
    const sorted = supplierScores
      .filter(s => !s.isEliminated)
      .sort((a, b) => b.overallTcoScore - a.overallTcoScore);

    sorted.forEach((item, idx) => { item.rank = idx + 1; });

    const selected = sorted[0];

    const comparison: StoredTcoComparison = {
      id: "tco-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      rfqId: rfq.id,
      rfqReference: rfq.reference,
      purchaseRequestCode: rfq.purchaseRequestCode,
      projectName: rfq.projectName,
      evaluationDate: new Date().toISOString().split('T')[0],
      evaluatedByName: user?.name || 'Responsable Achats',
      criteriaConfig: config,
      supplierScores,
      selectedSupplierId: selected?.supplierId,
      selectedSupplierName: selected?.supplierName,
      decisionJustification: selected
        ? ("Meilleur score TCO global (" + selected.overallTcoScore + "/100) après élimination des offres non conformes.")
        : 'Aucune offre conforme',
      status: 'VALIDE_ACHATS',
    };

    this.tcoComparisons.unshift(comparison);
    rfq.status = 'EVALUEE';
    rfq.selectedSupplierId = comparison.selectedSupplierId;
    rfq.selectedSupplierName = comparison.selectedSupplierName;
    rfq.selectionJustification = comparison.decisionJustification;
    rfq.selectedAt = new Date().toISOString();

    this.addAuditLog('EVALUATE_TCO', 'PROCUREMENT', rfq.reference, 'Comparateur TCO calculé pour ' + rfq.reference + '. 1er: ' + selected?.supplierName + ' (' + selected?.overallTcoScore + '/100)', user);
    return comparison;
  }

  approveTcoDG(tcoId: string, notes?: string, user?: any): StoredTcoComparison {
    const tco = this.tcoComparisons.find(t => t.id === tcoId);
    if (!tco) throw new Error('Évaluation TCO introuvable');

    tco.status = 'APPROUVE_DG';
    tco.dgVisaSignature = "VISA-DG-TCO-" + Date.now() + "-APPROVED";
    tco.dgApprovedAt = new Date().toISOString();
    if (notes) tco.decisionJustification += ' | Note DG: ' + notes;

    const rfq = this.getRfqConsultation(tco.rfqId);
    if (rfq) rfq.status = 'CLOTUREE';

    this.addAuditLog('APPROVE_TCO_DG', 'PROCUREMENT', tco.rfqReference, 'Sélection TCO approuvée par la DG pour ' + tco.selectedSupplierName, user);
    return tco;
  }

  // ============================================================================
  // MÉTHODES BONS DE COMMANDE (BC) & GESTION DES ENGAGEMENTS
  // ============================================================================

  createPurchaseOrderFromTco(tcoId: string, user?: any) {
    const tco = this.tcoComparisons.find(t => t.id === tcoId);
    if (!tco) throw new Error('Évaluation TCO introuvable');
    if (tco.status !== 'APPROUVE_DG' && tco.status !== 'VALIDE_ACHATS') {
      throw new Error('L\'évaluation TCO doit être validée avant émission du bon de commande');
    }

    const rfq = this.getRfqConsultation(tco.rfqId);
    const winningOffer = rfq?.offers.find(o => o.supplierId === tco.selectedSupplierId);
    const pr = this.getPurchaseRequest(tco.purchaseRequestCode);

    const poCode = "BC-" + new Date().getFullYear() + "-" + String(this.purchaseOrders.length + 1).padStart(4, '0');
    const totalHT = winningOffer ? winningOffer.totalPriceHT : (pr?.amountHT || 500000);
    const vatAmount = totalHT * 0.19;
    const totalTTC = totalHT + vatAmount;

    const po = {
      id: "po-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      code: poCode,
      poNumber: poCode,
      purchaseRequestId: pr?.id,
      purchaseRequestCode: tco.purchaseRequestCode,
      rfqReference: tco.rfqReference,
      tcoId: tco.id,
      supplierId: tco.selectedSupplierId,
      supplierName: tco.selectedSupplierName,
      projectId: pr?.projectId,
      projectCode: pr?.projectCode,
      projectName: pr?.projectName,
      status: 'CONFIRMED',
      totalHT,
      vatAmount,
      totalTTC,
      deliveryLeadTimeDays: winningOffer?.deliveryLeadTimeDays || 7,
      paymentTerms: winningOffer?.paymentTerms || '30 jours fin de mois',
      deliveryLocation: pr?.deliveryLocation || 'Magasin Central Arzew',
      items: pr?.items ? pr.items.map((it: any) => ({
        ...it,
        receivedQuantity: 0,
        remainingQuantity: it.quantity,
      })) : [],
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.purchaseOrders.unshift(po);

    // RÈGLE FINANCIÈRE STRICTE : L'engagement budgétaire intervient lors de l'approbation du BC
    if (pr?.projectCode) {
      const project = this.getProject(pr.projectCode);
      if (project) {
        project.committedBudget = (project.committedBudget || 0) + totalHT;
      }
    }

    if (pr) pr.status = 'PO_GENERATED';

    this.addAuditLog('CREATE_PO_FROM_TCO', 'PROCUREMENT', poCode, 'Bon de commande ' + poCode + ' émis à ' + po.supplierName + ' (' + totalHT.toLocaleString() + ' DA HT). Budget engagé actualisé.', user);
    return po;
  }

  // ============================================================================
  // MÉTHODES BONS DE RÉCEPTION (BR) AVEC RÉCEPTIONS PARTIELLES & QUALITÉ
  // ============================================================================

  getGoodsReceipts(poCodeOrId?: string): StoredGoodsReceipt[] {
    if (poCodeOrId) {
      return this.goodsReceipts.filter(br => br.purchaseOrderId === poCodeOrId || br.purchaseOrderCode === poCodeOrId);
    }
    return this.goodsReceipts;
  }

  recordGoodsReceipt(data: any, user?: any): StoredGoodsReceipt {
    if (!data.deliveryNoteNumber || !String(data.deliveryNoteNumber).trim()) {
      throw new Error('Le numéro de BL (Bon de Livraison) fournisseur est obligatoire pour enregistrer une réception.');
    }
    if (!data.warehouseId && !data.warehouseLocation) {
      throw new Error('Le magasin de destination ou emplacement de stockage est obligatoire.');
    }

    const po = this.purchaseOrders.find(p => p.id === data.purchaseOrderId || p.id === data.orderId || p.code === data.purchaseOrderCode || p.code === data.orderCode || p.poNumber === data.purchaseOrderCode || p.poNumber === data.orderCode);
    if (!po) throw new Error('Bon de commande introuvable pour cette réception');

    const brNum = String(this.goodsReceipts.length + 1).padStart(3, '0');
    const brRef = "BR-" + new Date().getFullYear() + "-" + brNum;
    const warehouse = this.warehouses.find(w => w.id === data.warehouseId || w.code === data.warehouseId) || this.warehouses[0];

    const rawLines = data.lines || data.items || [];
    if (!rawLines.length) {
      throw new Error('La réception doit comporter au moins un article.');
    }

    const conformityStatus = data.conformityStatus || data.inspectionStatus || data.qualityInspection?.overallStatus || 'CONFORME';
    const isGlobalReject = conformityStatus === 'REJETE' || conformityStatus === 'REFUSE' || conformityStatus === 'NON_CONFORME';

    let totalAcceptedAmountHT = 0;
    let hasRemainingLines = false;
    let hasRejections = isGlobalReject;

    const processedLines = rawLines.map((line: any, idx: number) => {
      const poLine = (po.items || []).find((it: any) => it.itemId === line.itemId || it.itemCode === line.itemCode) || (po.items || [])[idx];
      const orderedQty = Number(poLine?.quantity || line.orderedQuantity || 0);
      const previouslyReceived = Number(poLine?.receivedQuantity || 0);
      const deliveredQty = Number(line.deliveredQuantity || line.receivedQuantity || 0);

      const rejectedQty = isGlobalReject ? deliveredQty : Number(line.rejectedQuantity || 0);
      const acceptedQty = isGlobalReject ? 0 : Math.max(0, deliveredQty - rejectedQty);

      if (rejectedQty > 0) hasRejections = true;

      // Traçabilité aciers industriels (ASTM, Inox, DN150, Brides, Tubes, Coudes, etc.)
      const desc = (line.description || poLine?.description || line.name || '').toLowerCase();
      const isCriticalSteel = /astm|a106|inox|316l|tuyauterie|acier|bride|coude|sch 40|dn150|dn\d+/i.test(desc);
      const heatNum = line.heatNumber || line.batchNumber || data.heatNumber || data.batchNumber || '';
      const ccpuRef = line.ccpuCertificateRef || data.ccpuCertificateRef || (data.ccpuVerified || data.qualityInspection?.ccpuVerified ? 'CCPU-3.1-VERIFIE' : '');

      if (isCriticalSteel && acceptedQty > 0) {
        if (!heatNum) {
          throw new Error(`Traçabilité obligatoire : Le numéro de coulée (Heat Number) ou numéro de lot est obligatoire pour les aciers industriels (${line.description || poLine?.description}).`);
        }
        if (!ccpuRef && !data.ccpuVerified && !data.qualityInspection?.ccpuVerified) {
          throw new Error(`Conformité CCPU 3.1 requise : Le certificat matière CCPU 3.1 EN 10204 est obligatoire pour (${line.description || poLine?.description}).`);
        }
      }

      if (rejectedQty > 0 && !line.rejectionReason && !data.rejectionReason && !data.qualityInspection?.observations) {
        throw new Error(`Un motif de rejet explicite est obligatoire pour les articles rejetés (${line.description || poLine?.description}).`);
      }

      const unitPrice = Number(poLine?.unitPrice || line.unitPriceHT || 0);
      totalAcceptedAmountHT += acceptedQty * unitPrice;

      const newRemaining = Math.max(0, orderedQty - (previouslyReceived + acceptedQty));
      if (newRemaining > 0) hasRemainingLines = true;

      // Mise à jour de la ligne du bon de commande
      if (poLine) {
        poLine.receivedQuantity = previouslyReceived + acceptedQty;
        poLine.remainingQuantity = newRemaining;
      }

      // Stock physique : SEULEMENT les quantités acceptées sont intégrées au stock disponible
      if (acceptedQty > 0 && (line.itemId || line.itemCode)) {
        const item = this.inventoryItems.find(i => i.id === line.itemId || i.code === line.itemCode);
        if (item) {
          item.currentStock = (item.currentStock || 0) + acceptedQty;
          if (heatNum) item.batchNumber = heatNum;
        }

        const mvtRef = `MVT-REC-${Date.now()}-${idx}`;
        this.stockMovements.unshift({
          id: `sm-${Date.now()}-${idx}`,
          movementNumber: mvtRef,
          type: 'PURCHASE_RECEIPT',
          itemId: line.itemId || item?.id || 'ART',
          itemCode: item?.code || line.itemCode || 'ART',
          itemName: item?.name || line.description || 'Article réceptionné',
          quantity: acceptedQty,
          unit: item?.unit || line.unit || 'U',
          warehouseId: warehouse?.id || 'wh-001',
          warehouseName: warehouse?.name || 'Magasin Central',
          projectId: po.projectId,
          projectCode: po.projectCode,
          documentRef: brRef,
          batchNumber: heatNum,
          performedByName: user?.name || data.receiverName || 'Gestionnaire Magasin',
          timestamp: new Date().toISOString(),
        } as any);
      }

      return {
        id: `brl-${Date.now()}-${idx}`,
        itemId: line.itemId,
        itemCode: line.itemCode,
        description: line.description || poLine?.description || 'Fourniture',
        orderedQuantity: orderedQty,
        previouslyReceivedQuantity: previouslyReceived,
        deliveredQuantity: deliveredQty,
        acceptedQuantity: acceptedQty,
        rejectedQuantity: rejectedQty,
        remainingQuantity: newRemaining,
        rejectionReason: rejectedQty > 0 ? (line.rejectionReason || data.rejectionReason || 'Non-conformité dimensionnelle / métallurgique') : undefined,
        unit: line.unit || poLine?.unit || 'U',
        unitPriceHT: unitPrice,
        heatNumber: heatNum || undefined,
        batchNumber: heatNum || undefined,
        ccpuCertificateRef: ccpuRef || undefined,
        storageLocation: line.storageLocation || (rejectedQty > 0 && acceptedQty === 0 ? 'Zone Quarantaine Litige Fournisseur' : (warehouse?.name || 'Magasin Central')),
      };
    });

    const isComplete = !hasRemainingLines && !hasRejections;
    po.status = isComplete ? 'RECEIVED' : (hasRejections && totalAcceptedAmountHT === 0 ? 'PENDING' : 'PARTIALLY_RECEIVED');

    const resolvedStatus = isGlobalReject ? 'REJETE' : (hasRejections ? 'CONFORME_AVEC_RESERVES' : (isComplete ? 'COMPLET' : 'PARTIEL'));

    const newBr: StoredGoodsReceipt = {
      id: `br-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      receiptNumber: brRef,
      purchaseOrderId: po.id,
      purchaseOrderCode: po.code,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      deliveryNoteNumber: String(data.deliveryNoteNumber).trim(),
      receiptDate: data.receiptDate || new Date().toISOString().split('T')[0],
      warehouseId: warehouse?.id || 'wh-001',
      warehouseName: warehouse?.name || 'Magasin Central',
      receiverName: user?.name || data.receiverName || 'Magasinier Réceptionnaire',
      projectId: po.projectId,
      projectCode: po.projectCode,
      status: resolvedStatus as any,
      qualityInspection: {
        inspectorName: data.inspectorName || data.qualityInspection?.inspectorName || user?.name || 'Superviseur Contrôle Qualité',
        inspectionDate: new Date().toISOString(),
        overallStatus: (isGlobalReject ? 'REFUSE' : (hasRejections ? 'ACCEPTE_SOUS_RESERVES' : 'CONFORME')) as any,
        ccpuVerified: !!data.ccpuVerified || !!data.qualityInspection?.ccpuVerified,
        cndReportAttached: !!data.cndReportAttached || !!data.qualityInspection?.cndReportAttached,
        observations: data.qualityObservations || data.rejectionReason || (hasRejections ? 'Réception acceptée sous réserves / lots rejetés en quarantaine.' : 'Contrôle réception conforme aux spécifications contractuelles.'),
      },
      lines: processedLines,
      totalAcceptedAmountHT,
      isQuarantined: hasRejections,
      quarantineWarehouseLocation: hasRejections ? 'Zone Quarantaine - Litige Fournisseur' : undefined,
      rejectionReason: hasRejections ? (data.rejectionReason || 'Articles rejetés placés en quarantaine magasin') : undefined,
      createdAt: new Date().toISOString(),
    };

    this.goodsReceipts.unshift(newBr);
    this.addAuditLog('RECORD_GOODS_RECEIPT', 'INVENTORY', brRef, `Bon de réception ${brRef} enregistré pour la commande ${po.code} (Statut: ${newBr.status})`, user);
    return newBr;
  }

  // ============================================================================
  // MÉTHODES BONS DE SORTIE MAGASIN (BSM) & IMPUTATION ANALYTIQUE CHANTIER
  // ============================================================================

  getBonsDeSortie(projectId?: string): StoredBonDeSortie[] {
    if (projectId) {
      return this.bonsDeSortie.filter(b => b.projectId === projectId || b.projectCode === projectId);
    }
    return this.bonsDeSortie;
  }

  getBonDeSortie(idOrNumber: string): StoredBonDeSortie | null {
    return this.bonsDeSortie.find(b => b.id === idOrNumber || b.bonNumber === idOrNumber) || null;
  }

  createBonDeSortie(data: any, user?: any): StoredBonDeSortie {
    if (!data.projectId && !data.projectCode) {
      throw new Error('Le chantier ou projet destinataire est obligatoire pour émettre un bon de sortie.');
    }
    if (!data.recipientName || !String(data.recipientName).trim()) {
      throw new Error('Le nom du destinataire (chef de chantier / superviseur) est obligatoire pour le bon de sortie.');
    }
    if (!data.wbsCategory || !String(data.wbsCategory).trim()) {
      throw new Error('Le lot / catégorie WBS de travaux est obligatoire pour l\'imputation analytique.');
    }

    const project = this.getProject(data.projectId) || this.getProject(data.projectCode);
    if (!project) {
      throw new Error('Chantier destinataire introuvable.');
    }

    const warehouse = this.warehouses.find(w => w.id === data.warehouseId || w.code === data.warehouseId) || this.warehouses[0];
    
    // Support multi-articles ou article unique
    let rawItems: any[] = [];
    if (Array.isArray(data.items) && data.items.length > 0) {
      rawItems = data.items;
    } else if (Array.isArray(data.lines) && data.lines.length > 0) {
      rawItems = data.lines;
    } else if (data.itemId) {
      rawItems = [{ itemId: data.itemId, quantity: data.quantity, batchNumber: data.batchNumber }];
    }

    if (!rawItems.length) {
      throw new Error('Le bon de sortie doit comporter au moins un article à déstocker.');
    }

    const bonNumber = data.bonNumber || `BSM-2026-${String(this.bonsDeSortie.length + 1).padStart(4, '0')}`;
    let totalAmountDA = 0;

    const processedItems = rawItems.map((line: any, idx: number) => {
      const itm = this.inventoryItems.find(i => i.id === line.itemId || i.code === line.code || i.code === line.itemCode);
      const reqQty = Number(line.quantity || 0);
      if (reqQty <= 0) {
        throw new Error(`Quantité invalide (${reqQty}) pour l'article ${line.name || line.code || idx + 1}.`);
      }
      if (itm) {
        if (Number(itm.currentStock || 0) < reqQty) {
          throw new Error(`Stock physique insuffisant pour l'article ${itm.name} (${itm.code}). En stock: ${itm.currentStock}, Demandé: ${reqQty}`);
        }
      }

      const unitCost = Number(itm?.unitCost || line.unitCost || 0);
      const lineCost = reqQty * unitCost;
      totalAmountDA += lineCost;

      // Décrémenter le stock physique magasin
      if (itm) {
        itm.currentStock = Math.max(0, (itm.currentStock || 0) - reqQty);
      }

      // Enregistrer le mouvement de stock officiel (ISSUE)
      const mvtRef = `MVT-BSM-${Date.now()}-${idx}`;
      this.stockMovements.unshift({
        id: `sm-bsm-${Date.now()}-${idx}`,
        movementNumber: mvtRef,
        type: 'ISSUE',
        itemId: itm?.id || line.itemId || `itm-${idx}`,
        itemCode: itm?.code || line.code || 'ART',
        itemName: itm?.name || line.name || 'Article déstocké',
        quantity: -reqQty,
        unit: itm?.unit || line.unit || 'U',
        warehouseId: warehouse?.id || 'wh-001',
        warehouseName: warehouse?.name || 'Magasin Central',
        projectId: project.id,
        projectCode: project.code,
        documentRef: bonNumber,
        batchNumber: line.batchNumber || line.heatNumber || itm?.batchNumber || '',
        performedByName: user?.name || data.recipientName || 'Magasinier',
        timestamp: new Date().toISOString(),
      } as any);

      return {
        itemId: itm?.id || line.itemId || `itm-${idx}`,
        code: itm?.code || line.code || 'ART',
        name: itm?.name || line.name || 'Article',
        quantity: reqQty,
        unit: itm?.unit || line.unit || 'U',
        unitCost,
        totalCost: lineCost,
        heatNumber: line.heatNumber || itm?.batchNumber,
        batchNumber: line.batchNumber || itm?.batchNumber,
      };
    });

    // IMPUTATION ANALYTIQUE DIRECTE SUR LE CHANTIER
    project.spentBudget = (project.spentBudget || 0) + totalAmountDA;
    project.actualCost = (project.actualCost || 0) + totalAmountDA;
    if (!project.costEntries) project.costEntries = [];
    project.costEntries.push({
      id: `cost-bsm-${Date.now()}`,
      date: data.date || new Date().toISOString().split('T')[0],
      category: 'FOURNITURES',
      description: `Sortie Magasin ${bonNumber} — ${processedItems.map(i => `${i.quantity} ${i.unit} ${i.name}`).slice(0, 2).join(', ')} [Lot ${data.wbsCategory}]`,
      amount: totalAmountDA,
      reference: bonNumber,
      approved: true,
      createdAt: new Date().toISOString(),
    });

    const bsm: StoredBonDeSortie = {
      id: `bsm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      bonNumber,
      date: data.date || new Date().toISOString().split('T')[0],
      warehouseId: warehouse?.id || 'wh-001',
      warehouseName: warehouse?.name || 'Magasin Central',
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      clientName: project.clientName || 'Client Industriel',
      siteLocation: project.siteLocation || 'Site Chantier',
      wbsCategory: data.wbsCategory,
      recipientName: data.recipientName,
      driverName: data.driverName || 'Chauffeur Expéditeur Silex',
      vehicleMatricule: data.vehicleMatricule || 'Matricule Véhicule Logistique',
      items: processedItems,
      totalAmountDA,
      status: (data.status as any) || 'EN_TRANSIT',
      createdAt: new Date().toISOString(),
    };

    this.bonsDeSortie.unshift(bsm);
    this.addAuditLog('CREATE_BON_DE_SORTIE', 'INVENTORY', bonNumber, `BSM ${bonNumber} émis pour ${project.code} (${totalAmountDA.toLocaleString()} DA PUMP)`, user);
    return bsm;
  }

  // ============================================================================
  // TRAÇABILITÉ MATIÈRE & ACIERS CRITIQUES (LIFECYCLE COMPLET)
  // ============================================================================

  getMaterialTraceability(query: string) {
    if (!query || !query.trim()) {
      return { query: '', found: false, receipts: [], issues: [], purchaseOrders: [], movements: [], timeline: [] };
    }
    const q = query.trim().toLowerCase();

    // 1. Articles correspondants
    const matchedItems = this.inventoryItems.filter(i =>
      i.code.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      (i.batchNumber && i.batchNumber.toLowerCase().includes(q))
    );

    // 2. Bons de réception correspondants (Heat number, CCPU, BL, PO)
    const matchedReceipts = this.goodsReceipts.filter(gr =>
      gr.receiptNumber.toLowerCase().includes(q) ||
      gr.deliveryNoteNumber.toLowerCase().includes(q) ||
      gr.purchaseOrderCode.toLowerCase().includes(q) ||
      gr.lines.some(l =>
        l.description.toLowerCase().includes(q) ||
        (l.itemCode && l.itemCode.toLowerCase().includes(q)) ||
        (l.heatNumber && l.heatNumber.toLowerCase().includes(q)) ||
        (l.batchNumber && l.batchNumber.toLowerCase().includes(q)) ||
        (l.ccpuCertificateRef && l.ccpuCertificateRef.toLowerCase().includes(q))
      )
    );

    // 3. Bons de sortie correspondants (BSM, Heat number, Lot, WBS, Project)
    const matchedIssues = this.bonsDeSortie.filter(bsm =>
      bsm.bonNumber.toLowerCase().includes(q) ||
      bsm.projectCode.toLowerCase().includes(q) ||
      bsm.projectName.toLowerCase().includes(q) ||
      bsm.wbsCategory.toLowerCase().includes(q) ||
      bsm.items.some(it =>
        it.name.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        (it.heatNumber && it.heatNumber.toLowerCase().includes(q)) ||
        (it.batchNumber && it.batchNumber.toLowerCase().includes(q))
      )
    );

    // 4. Commandes fournisseurs
    const matchedPOs = this.purchaseOrders.filter(po =>
      po.code.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q) ||
      (po.items || []).some((it: any) =>
        (it.name && it.name.toLowerCase().includes(q)) ||
        (it.itemCode && it.itemCode.toLowerCase().includes(q))
      )
    );

    // 5. Mouvements de stock
    const matchedMovements = this.stockMovements.filter(sm =>
      sm.movementNumber.toLowerCase().includes(q) ||
      sm.documentRef.toLowerCase().includes(q) ||
      sm.itemName.toLowerCase().includes(q) ||
      (sm.batchNumber && sm.batchNumber.toLowerCase().includes(q))
    );

    // Timeline Chronologique Industrielle
    const timeline: Array<{
      step: 'COMMANDE' | 'RECEPTION_CCPU' | 'STOCK_MAGASIN' | 'BON_DE_SORTIE' | 'CHANTIER_IMPUTATION';
      date: string;
      title: string;
      reference: string;
      details: string;
      actor: string;
      badgeColor: string;
    }> = [];

    matchedPOs.forEach(po => {
      timeline.push({
        step: 'COMMANDE',
        date: po.createdAt || po.issueDate || '2026-01-15',
        title: `Commande Fournisseur ${po.code}`,
        reference: po.code,
        details: `Fournisseur : ${po.supplierName} • Total : ${(po.totalAmountHT || 0).toLocaleString()} DA HT`,
        actor: po.issuedByName || 'Acheteur SILEX',
        badgeColor: 'bg-blue-100 text-blue-800',
      });
    });

    matchedReceipts.forEach(gr => {
      const heatNums = gr.lines.map(l => l.heatNumber || l.batchNumber).filter(Boolean).join(', ');
      const ccpu = gr.lines.map(l => l.ccpuCertificateRef).filter(Boolean).join(', ') || (gr.qualityInspection.ccpuVerified ? 'CCPU 3.1 Vérifié Conforme' : 'Non spécifié');
      timeline.push({
        step: 'RECEPTION_CCPU',
        date: gr.receiptDate || gr.createdAt,
        title: `Réception & Contrôle Qualité ${gr.receiptNumber}`,
        reference: gr.receiptNumber,
        details: `BL Fournisseur: ${gr.deliveryNoteNumber} • Coulée: ${heatNums || 'LOT-2026'} • Certificat: ${ccpu} • Inspecteur: ${gr.qualityInspection.inspectorName}`,
        actor: gr.receiverName,
        badgeColor: 'bg-emerald-100 text-emerald-800',
      });
    });

    matchedIssues.forEach(bsm => {
      timeline.push({
        step: 'BON_DE_SORTIE',
        date: bsm.date || bsm.createdAt,
        title: `Bon de Sortie Magasin ${bsm.bonNumber}`,
        reference: bsm.bonNumber,
        details: `Destinataire: ${bsm.recipientName} • Chantier: ${bsm.projectCode} (${bsm.projectName}) • WBS: ${bsm.wbsCategory} • Valeur PUMP: ${bsm.totalAmountDA.toLocaleString()} DA`,
        actor: bsm.driverName || 'Logistique SILEX',
        badgeColor: 'bg-purple-100 text-purple-800',
      });
      timeline.push({
        step: 'CHANTIER_IMPUTATION',
        date: bsm.date || bsm.createdAt,
        title: `Imputation Analytique Chantier ${bsm.projectCode}`,
        reference: `IMP-${bsm.bonNumber}`,
        details: `Coût réel projet incrémenté de +${bsm.totalAmountDA.toLocaleString()} DA HT sur le lot ${bsm.wbsCategory}`,
        actor: 'Contrôle de Gestion Chantier',
        badgeColor: 'bg-amber-100 text-amber-800',
      });
    });

    return {
      query,
      found: matchedReceipts.length > 0 || matchedIssues.length > 0 || matchedPOs.length > 0 || matchedItems.length > 0,
      matchedItems,
      receipts: matchedReceipts,
      issues: matchedIssues,
      purchaseOrders: matchedPOs,
      movements: matchedMovements,
      timeline: timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }

  // ============================================================================
  // MÉTHODES CONTRATS FOURNISSEURS
  // ============================================================================

  getSupplierContracts(supplierId?: string): StoredSupplierContract[] {
    if (supplierId) {
      return this.supplierContracts.filter(c => c.supplierId === supplierId);
    }
    return this.supplierContracts;
  }

  createSupplierContract(data: any, user?: any): StoredSupplierContract {
    const ctrNum = String(this.supplierContracts.length + 1).padStart(3, '0');
    const ctrRef = "CTR-FOU-" + new Date().getFullYear() + "-" + ctrNum;

    const contract: StoredSupplierContract = {
      id: "ctr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      contractNumber: ctrRef,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      title: data.title || 'Contrat Fournisseur Industriel',
      contractType: data.contractType || 'FOURNITURE_CADRE',
      projectId: data.projectId,
      projectCode: data.projectCode,
      totalAmountHT: Number(data.totalAmountHT) || 0,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      paymentTerms: data.paymentTerms || '30 jours fin de mois',
      retentionGuaranteePercent: Number(data.retentionGuaranteePercent) || 0,
      penaltiesTerms: data.penaltiesTerms || '1% par semaine de retard',
      status: 'ACTIF',
      signedBySilex: data.signedBySilex || user?.name || 'Direction Générale SILEX',
      signedBySupplier: data.signedBySupplier || 'Représentant Légal Fournisseur',
      documents: Array.isArray(data.documents) ? data.documents : [],
      createdAt: new Date().toISOString(),
    };

    this.supplierContracts.unshift(contract);
    this.addAuditLog('CREATE_SUPPLIER_CONTRACT', 'PROCUREMENT', ctrRef, 'Contrat fournisseur ' + ctrRef + ' créé avec ' + contract.supplierName, user);
    return contract;
  }

  // ============================================================================
  // MÉTHODES INVENTAIRES PHYSIQUES & AJUSTEMENTS
  // ============================================================================

  getPhysicalInventories(warehouseId?: string): StoredPhysicalInventory[] {
    if (warehouseId) {
      return this.physicalInventories.filter(inv => inv.warehouseId === warehouseId);
    }
    return this.physicalInventories;
  }

  createPhysicalInventory(warehouseIdOrData: string | any, responsibleName?: string, user?: any): StoredPhysicalInventory {
    const targetWhId = typeof warehouseIdOrData === 'object' ? warehouseIdOrData.warehouseId : warehouseIdOrData;
    const targetResponsible = typeof warehouseIdOrData === 'object' ? (warehouseIdOrData.responsibleName || user?.name) : responsibleName;
    const wh = this.warehouses.find(w => w.id === targetWhId || w.code === targetWhId) || this.warehouses[0];
    const invNum = String(this.physicalInventories.length + 1).padStart(3, '0');
    const invRef = "INV-" + new Date().getFullYear() + "-" + invNum;

    const whItems = this.inventoryItems.filter(i => !i.warehouseId || i.warehouseId === wh?.id);
    const countedItems = whItems.map(item => ({
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      unit: item.unit || 'U',
      unitCostDA: item.unitCost || item.averageCostPrice || 1000,
      theoreticalStock: item.currentStock || 0,
      physicalCount: item.currentStock || 0,
      discrepancyQuantity: 0,
      discrepancyValueDA: 0,
      discrepancyReason: '',
    }));

    const totalTheo = countedItems.reduce((acc, it) => acc + (it.theoreticalStock * it.unitCostDA), 0);

    const inv: StoredPhysicalInventory = {
      id: "inv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      inventoryNumber: invRef,
      warehouseId: wh?.id || 'wh-001',
      warehouseName: wh?.name || 'Magasin Central',
      inventoryDate: new Date().toISOString().split('T')[0],
      responsibleName: responsibleName || user?.name || 'Gestionnaire Magasin',
      status: 'EN_COMPTAGE',
      itemsCounted: countedItems,
      totalTheoreticalValueDA: totalTheo,
      totalPhysicalValueDA: totalTheo,
      totalVarianceValueDA: 0,
      createdAt: new Date().toISOString(),
    };

    this.physicalInventories.unshift(inv);
    this.addAuditLog('CREATE_PHYSICAL_INVENTORY', 'INVENTORY', invRef, 'Session d\'inventaire ' + invRef + ' ouverte pour ' + inv.warehouseName, user);
    return inv;
  }

  submitInventoryCount(invId: string, counts: Array<{ itemId: string; physicalCount: number; reason?: string }>, user?: any): StoredPhysicalInventory {
    const inv = this.physicalInventories.find(i => i.id === invId);
    if (!inv) throw new Error('Session d\'inventaire introuvable');

    let totalPhysical = 0;
    let totalVariance = 0;

    inv.itemsCounted.forEach(item => {
      const countedEntry = counts.find(c => c.itemId === item.itemId);
      if (countedEntry !== undefined) {
        item.physicalCount = Number(countedEntry.physicalCount);
        item.discrepancyQuantity = item.physicalCount - item.theoreticalStock;
        item.discrepancyValueDA = item.discrepancyQuantity * item.unitCostDA;
        if (countedEntry.reason) item.discrepancyReason = countedEntry.reason;
      }
      totalPhysical += item.physicalCount * item.unitCostDA;
      totalVariance += item.discrepancyValueDA;
    });

    inv.totalPhysicalValueDA = totalPhysical;
    inv.totalVarianceValueDA = totalVariance;
    inv.status = 'EN_VALIDATION_DG';

    this.addAuditLog('SUBMIT_INVENTORY_COUNT', 'INVENTORY', inv.inventoryNumber, 'Comptage d\'inventaire ' + inv.inventoryNumber + ' soumis. Écart global : ' + totalVariance.toLocaleString() + ' DA', user);
    return inv;
  }

  validateAndAdjustInventoryDG(invId: string, user?: any): StoredPhysicalInventory {
    const inv = this.physicalInventories.find(i => i.id === invId);
    if (!inv) throw new Error('Session d\'inventaire introuvable');

    const mvtRefs: string[] = [];

    // Régularisation autorisée : création des mouvements d'ajustement
    inv.itemsCounted.forEach(itemEntry => {
      if (itemEntry.discrepancyQuantity !== 0) {
        const item = this.inventoryItems.find(i => i.id === itemEntry.itemId);
        if (item) {
          item.currentStock = itemEntry.physicalCount; // Alignement physique
        }

        const mvtRef = "MVT-AJUST-" + inv.inventoryNumber + "-" + itemEntry.itemCode;
        mvtRefs.push(mvtRef);

        this.stockMovements.unshift({
          id: "sm-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          movementNumber: mvtRef,
          type: 'INVENTORY_ADJUSTMENT',
          itemId: itemEntry.itemId,
          itemCode: itemEntry.itemCode,
          itemName: itemEntry.itemName,
          quantity: Math.abs(itemEntry.discrepancyQuantity),
          unit: itemEntry.unit,
          warehouseId: inv.warehouseId,
          warehouseName: inv.warehouseName,
          documentRef: inv.inventoryNumber,
          reason: itemEntry.discrepancyReason || ('Régularisation inventaire annuel ' + inv.inventoryNumber),
          performedByName: user?.name || 'Direction Générale (Validation)',
          timestamp: new Date().toISOString(),
        } as any);
      }
    });

    inv.status = 'CLOTURE';
    inv.dgApprovedAt = new Date().toISOString();
    inv.dgApprovedBy = user?.name || 'Directeur Général SILEX';
    inv.adjustmentMovementReferences = mvtRefs;

    this.addAuditLog('APPROVE_INVENTORY_DG', 'INVENTORY', inv.inventoryNumber, 'Inventaire ' + inv.inventoryNumber + ' validé et stocks réalignés par la DG', user);
    return inv;
  }

  // ============================================================================
  // MÉTHODES ÉVALUATION FOURNISSEURS
  // ============================================================================

  getSupplierEvaluations(supplierId?: string): StoredSupplierEvaluation[] {
    if (supplierId) {
      return this.supplierEvaluations.filter(e => e.supplierId === supplierId);
    }
    return this.supplierEvaluations;
  }

  recordSupplierEvaluation(data: any, user?: any): StoredSupplierEvaluation {
    const supplier = this.suppliers.find(s => s.id === data.supplierId || s.code === data.supplierId);
    if (!supplier) throw new Error('Fournisseur introuvable');

    const evalNum = String(this.supplierEvaluations.length + 1).padStart(3, '0');
    const evalRef = "EVAL-" + new Date().getFullYear() + "-" + evalNum;

    let punctuality = 25;
    let quality = 25;
    let quantity = 12;
    let response = 12;
    let pricing = 8;
    let totalScore = 0;

    if (data.qualityScore !== undefined || data.deliveryScore !== undefined) {
      const q = Number(data.qualityScore || 80);
      const d = Number(data.deliveryScore || 80);
      const p = Number(data.priceCompetitivenessScore || 80);
      const r = Number(data.responsivenessScore || 80);
      totalScore = Math.round(q * 0.35 + d * 0.30 + p * 0.20 + r * 0.15);
      quality = Math.round(q * 0.35);
      punctuality = Math.round(d * 0.30);
      pricing = Math.round(p * 0.20);
      response = Math.round(r * 0.15);
      quantity = 0;
    } else {
      punctuality = Number(data.scores?.deliveryPunctuality || 25);
      quality = Number(data.scores?.qualityCompliance || 25);
      quantity = Number(data.scores?.quantityAccuracy || 12);
      response = Number(data.scores?.responsiveness || 12);
      pricing = Number(data.scores?.commercialPricing || 8);
      totalScore = Math.min(100, punctuality + quality + quantity + response + pricing);
    }
    const starRating = Math.max(1, Math.min(5, Math.round(totalScore / 20)));

    let classification: StoredSupplierEvaluation['classification'] = 'QUALIFIE_B';
    if (totalScore >= 90) classification = 'STRATEGIQUE_A';
    else if (totalScore < 70 && totalScore >= 50) classification = 'SOUS_VIGILANCE_C';
    else if (totalScore < 50) classification = 'SUSPENDU_D';

    // Mise à jour de la note globale du fournisseur
    supplier.rating = starRating;
    if (classification === 'SUSPENDU_D') supplier.status = 'SUSPENDU';

    const evaluation: StoredSupplierEvaluation = {
      id: "eval-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      evaluationNumber: evalRef,
      supplierId: supplier.id,
      supplierName: supplier.name,
      period: data.period || 'T3-2026',
      evaluatorName: user?.name || data.evaluatorName || 'Responsable Achats & Supply Chain',
      evaluatorRole: user?.role || 'RESPONSABLE_ACHATS',
      evaluationDate: new Date().toISOString().split('T')[0],
      scores: {
        deliveryPunctuality: punctuality,
        qualityCompliance: quality,
        quantityAccuracy: quantity,
        responsiveness: response,
        commercialPricing: pricing,
      },
      totalScore,
      starRating,
      classification,
      comments: data.comments || 'Évaluation périodique régulière',
      recommendedAction: data.recommendedAction || (totalScore >= 80 ? 'DEVELOPPEMENT' : 'MAINTIEN'),
      createdAt: new Date().toISOString(),
    };

    this.supplierEvaluations.unshift(evaluation);
    this.addAuditLog('EVALUATE_SUPPLIER', 'PROCUREMENT', evalRef, 'Évaluation de ' + supplier.name + ' enregistrée (Score: ' + totalScore + '/100, Rang: ' + classification + ')', user);
    return evaluation;
  }

  updateSupplierStatus(supplierId: string, status: 'ACTIF' | 'EN_EVALUATION' | 'SUSPENDU' | 'INACTIF', reason?: string, user?: any) {
    const supplier = this.suppliers.find(s => s.id === supplierId || s.code === supplierId);
    if (!supplier) throw new Error('Fournisseur introuvable');

    supplier.status = status;
    this.addAuditLog('UPDATE_SUPPLIER_STATUS', 'PROCUREMENT', supplier.code, 'Statut fournisseur ' + supplier.name + ' passé à ' + status + (reason ? (' (Motif: ' + reason + ')') : ''), user);
    return supplier;
  }

  // ============================================================================
  // MÉTHODES CONSOLIDATION KPIS ACHATS & STOCKS
  // ============================================================================

  getProcurementKpis() {
    const totalRequests = this.purchaseRequests.length;
    const pendingRequests = this.purchaseRequests.filter(r => r.status === 'PENDING' || r.status === 'SUBMITTED').length;
    const approvedRequests = this.purchaseRequests.filter(r => r.status === 'APPROVED' || r.status === 'PO_GENERATED').length;
    const openRfqs = this.rfqConsultations.filter(r => r.status === 'OUVERTE' || r.status === 'OFFRES_RECUES').length;
    const totalOrders = this.purchaseOrders.length;
    const totalOrderAmountHT = this.purchaseOrders.reduce((sum, po) => sum + (po.totalHT || 0), 0);
    const activeSuppliers = this.suppliers.filter(s => s.status === 'ACTIF').length;
    const avgEvaluationScore = this.supplierEvaluations.length > 0
      ? Math.round(this.supplierEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / this.supplierEvaluations.length)
      : 88;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      openRfqs,
      totalOrders,
      totalOrderAmountHT,
      activeSuppliers,
      avgEvaluationScore,
    };
  }

  getInventoryKpis() {
    const totalItems = this.inventoryItems.length;
    const totalStockValueDA = this.inventoryItems.reduce((sum, it) => sum + ((it.currentStock || 0) * (it.unitCost || 0)), 0);
    const underMinStockCount = this.inventoryItems.filter(it => (it.currentStock || 0) <= (it.minStock || 0)).length;
    const totalWarehouses = this.warehouses.length;
    const totalMovements = this.stockMovements.length;
    const recentMovementsCount = this.stockMovements.slice(0, 10).length;

    return {
      totalItems,
      totalStockValueDA,
      underMinStockCount,
      totalWarehouses,
      totalMovements,
      recentMovementsCount,
    };
  }


  recordProjectStockConsumption(codeOrId: string, data: any, user?: any) {
    const project = this.getProject(codeOrId);
    if (!project) throw new Error('Projet introuvable');

    const smRef = `SM-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const qty = Number(data.quantity) || 0;
    const item = (this.inventoryItems || []).find((i: any) => i.id === data.itemId || i.code === data.itemId);

    if (item && item.currentStock !== undefined) {
      item.currentStock = Math.max(0, item.currentStock - qty);
    }

    const costAmount = (item?.averageCostPrice || data.unitPrice || 1000) * qty;

    project.spentBudget = (project.spentBudget || 0) + costAmount;
    if (!project.costEntries) project.costEntries = [];
    project.costEntries.push({
      id: `cst-${Date.now()}`,
      category: 'MATIERE_STOCK',
      amount: costAmount,
      description: `Consommation stock ${item?.name || data.designation || 'Article'} (Réf: ${smRef})`,
      sourceModule: 'INVENTORY',
      date: new Date().toISOString(),
    });

    const movement = {
      id: `sm-${Date.now()}`,
      movementNumber: smRef,
      type: 'SORTIE_CHANTIER',
      itemId: item?.id || data.itemId,
      itemCode: item?.code || 'ART',
      itemName: item?.name || data.designation || 'Article de stock',
      quantity: qty,
      unit: item?.unit || data.unit || 'U',
      projectId: project.id,
      projectCode: project.code,
      destinationSite: project.siteLocation,
      reason: data.reason || `Consommation directe sur le chantier ${project.code}`,
      performedBy: user?.name || 'Magasinier Chantier',
      timestamp: new Date().toISOString(),
    };

    if (!this.stockMovements) this.stockMovements = [];
    this.stockMovements.unshift(movement as any);

    this.addAuditLog('STOCK_CONSUMPTION', 'INVENTORY', smRef, `Sortie stock ${qty} ${movement.unit} vers chantier ${project.code}`, user);
    return movement;
  }

}

// Singleton global pour le runtime Next.js (persiste pendant le cycle de vie du conteneur serverless)
const globalForStore = globalThis as unknown as { serverStoreInstance?: ServerStore };
export const serverStore = globalForStore.serverStoreInstance ?? new ServerStore();
if (process.env.NODE_ENV !== 'production') globalForStore.serverStoreInstance = serverStore;
