import { SystemRole, DepartmentCode, DEMO_PROFILES, formatCurrencyDA } from '@silex/shared';

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

const DEFAULT_KPIS = {
  activeProjectsCount: 5,
  totalContractValue: 1721500000,
  committedCost: 22557500,
  actualCost: 5070000,
  grossMargin: 25.1,
  pendingApprovalsCount: 2,
  averageProgress: 48.5,
};

const DEFAULT_PROJECTS = [
  {
    id: 'prj-001',
    code: 'PRJ-2026-001',
    name: 'Maintenance Arrêt Unité Raffinage U-100',
    description: 'Remplacement faisceaux tubulaires échangeurs E-101/102, révision vannes HP et épreuves hydrostatiques 150B.',
    clientName: 'SONATRACH / Raffinerie d’Arzew (Oran)',
    sector: 'OIL_GAS',
    siteLocation: 'Zone Industrielle Arzew, Oran',
    status: 'IN_PROGRESS',
    progressPhysical: 52,
    physicalProgress: 52,
    progressFinancial: 45,
    financialProgress: 45,
    budgetAmount: 120500000,
    contractAmount: 145000000,
    committedCost: 18500000,
    actualCost: 4200000,
    startDate: '2026-01-15T00:00:00.000Z',
    contractEndDate: '2026-08-30T00:00:00.000Z',
    manager: {
      id: 'usr-rp-002',
      name: 'Sofiane Belkacem',
      email: 's.belkacem@silex-services.dz',
    },
    teamMembers: [
      { id: 'usr-rp-002', name: 'Sofiane Belkacem', role: 'Ingénieur Chef de Projet' },
      { id: 'usr-sou-01', name: 'Mourad Zitouni', role: 'Soudeur Haute Pression ASME IX' },
      { id: 'usr-cnd-02', name: 'Yacine Khelifi', role: 'Inspecteur CND Niveau II' },
    ],
    milestones: [
      { id: 'm-1', name: 'Mise à disposition et consignation des unités', dueDate: '2026-02-10T00:00:00.000Z', progressWeight: 10, status: 'VALIDATED' },
      { id: 'm-2', name: 'Dépose tuyauteries et extraction faisceaux tubulaires', dueDate: '2026-04-15T00:00:00.000Z', progressWeight: 25, status: 'VALIDATED' },
      { id: 'm-3', name: 'Contrôles CND 100% Radio (RT) & Ressuage (PT)', dueDate: '2026-06-20T00:00:00.000Z', progressWeight: 25, status: 'IN_PROGRESS' },
      { id: 'm-4', name: 'Épreuve hydrostatique 150 Bars Bureau Veritas', dueDate: '2026-07-25T00:00:00.000Z', progressWeight: 20, status: 'PENDING' },
      { id: 'm-5', name: 'Réception provisoire & Levée des réserves', dueDate: '2026-08-30T00:00:00.000Z', progressWeight: 20, status: 'PENDING' },
    ],
    serviceOrders: [
      { id: 'ods-01', number: 'ODS-2026-001', type: 'COMMENCEMENT', title: 'Ordre d’engagement travaux arrêt technique', issuedDate: '2026-01-15T00:00:00.000Z', status: 'EXECUTED' },
      { id: 'ods-02', number: 'ODS-2026-002', type: 'SPECIAL_INSPECTION', title: 'Inspection métallurgique complémentaire piquages HP', issuedDate: '2026-03-20T00:00:00.000Z', status: 'IN_PROGRESS' },
    ],
    workSituations: [
      { id: 'sit-01', number: 'SIT-01', periodStart: '2026-01-15T00:00:00.000Z', periodEnd: '2026-02-28T00:00:00.000Z', amountHT: 25000000, status: 'APPROVED' },
      { id: 'sit-02', number: 'SIT-02', periodStart: '2026-03-01T00:00:00.000Z', periodEnd: '2026-04-30T00:00:00.000Z', amountHT: 32000000, status: 'UNDER_REVIEW' },
    ],
  },
  {
    id: 'prj-002',
    code: 'PRJ-2026-002',
    name: 'Montage Mécanique & Tuyauterie Centrale 2x400MW',
    description: 'Préfabrication et pose réseaux vapeur HP 90 bars, collecteurs inox et révision turbines.',
    clientName: 'SONELGAZ / SPE (Mostaganem)',
    sector: 'POWER_ENERGY',
    siteLocation: 'Centrale Électrique Cap Djinet / Mostaganem',
    status: 'IN_PROGRESS',
    progressPhysical: 42,
    physicalProgress: 42,
    progressFinancial: 38,
    financialProgress: 38,
    budgetAmount: 280000000,
    contractAmount: 340000000,
    committedCost: 28400000,
    actualCost: 6100000,
    startDate: '2026-02-01T00:00:00.000Z',
    contractEndDate: '2026-12-15T00:00:00.000Z',
    manager: {
      id: 'usr-rp-002',
      name: 'Sofiane Belkacem',
      email: 's.belkacem@silex-services.dz',
    },
    teamMembers: [
      { id: 'usr-rp-002', name: 'Sofiane Belkacem', role: 'Ingénieur Chef de Projet' },
      { id: 'usr-mec-01', name: 'Karim Brahimi', role: 'Chef d’équipe Tuyauterie' },
    ],
    milestones: [
      { id: 'm-21', name: 'Homologation des DMOS et QMOS soudeurs ASME IX', dueDate: '2026-02-28T00:00:00.000Z', progressWeight: 15, status: 'VALIDATED' },
      { id: 'm-22', name: 'Préfabrication spools en atelier Rouiba 50%', dueDate: '2026-05-30T00:00:00.000Z', progressWeight: 35, status: 'IN_PROGRESS' },
      { id: 'm-23', name: 'Montage sur site et épreuves hydro 120B', dueDate: '2026-09-30T00:00:00.000Z', progressWeight: 30, status: 'PENDING' },
    ],
    serviceOrders: [],
    workSituations: [],
  },
  {
    id: 'prj-003',
    code: 'PRJ-2026-003',
    name: 'Système HVAC & Traitement d’Air Salle Contrôle',
    description: 'Fourniture et installation de centrales CTA industrielles, régulation HVAC et filtration certifiée.',
    clientName: 'SONATRACH / DP Hassi R’Mel',
    sector: 'OIL_GAS',
    siteLocation: 'Complexe Gazier Hassi R’Mel (Laghouat)',
    status: 'IN_PROGRESS',
    progressPhysical: 65,
    physicalProgress: 65,
    progressFinancial: 60,
    financialProgress: 60,
    budgetAmount: 95000000,
    contractAmount: 118000000,
    committedCost: 12100000,
    actualCost: 2800000,
    startDate: '2026-03-01T00:00:00.000Z',
    contractEndDate: '2026-09-15T00:00:00.000Z',
    manager: {
      id: 'usr-rp-002',
      name: 'Sofiane Belkacem',
      email: 's.belkacem@silex-services.dz',
    },
    teamMembers: [],
    milestones: [],
    serviceOrders: [],
    workSituations: [],
  },
  {
    id: 'prj-004',
    code: 'PRJ-2026-004',
    name: 'Préfabrication Chaudronnerie Ballons & Collecteurs Inox',
    description: 'Chaudronnerie lourde inox 316L et skids de comptage en atelier SILEX Rouiba.',
    clientName: 'FERPHOS / Complexe Sidérurgique El Hadjar',
    sector: 'STEEL_HEAVY_IND',
    siteLocation: 'Atelier de Préfabrication SILEX, Rouiba (Alger)',
    status: 'IN_PROGRESS',
    progressPhysical: 35,
    physicalProgress: 35,
    progressFinancial: 30,
    financialProgress: 30,
    budgetAmount: 165000000,
    contractAmount: 198000000,
    committedCost: 15300000,
    actualCost: 3100000,
    startDate: '2026-03-15T00:00:00.000Z',
    contractEndDate: '2026-11-30T00:00:00.000Z',
    manager: {
      id: 'usr-rp-002',
      name: 'Sofiane Belkacem',
      email: 's.belkacem@silex-services.dz',
    },
    teamMembers: [],
    milestones: [],
    serviceOrders: [],
    workSituations: [],
  },
  {
    id: 'prj-005',
    code: 'PRJ-2026-005',
    name: 'Réfection Broyeur & Tuyauteries Échangeurs Cimenterie',
    description: 'Arrêt annuel broyeur à ciment, blindages et tuyauteries de transport pneumatique.',
    clientName: 'GICA / Cimenterie de Meftah (Blida)',
    sector: 'CEMENT_PLANTS',
    siteLocation: 'Usine de Meftah, W. Blida',
    status: 'IN_PROGRESS',
    progressPhysical: 75,
    physicalProgress: 75,
    progressFinancial: 70,
    financialProgress: 70,
    budgetAmount: 85000000,
    contractAmount: 104000000,
    committedCost: 9800000,
    actualCost: 1950000,
    startDate: '2026-02-15T00:00:00.000Z',
    contractEndDate: '2026-06-15T00:00:00.000Z',
    manager: {
      id: 'usr-rp-002',
      name: 'Sofiane Belkacem',
      email: 's.belkacem@silex-services.dz',
    },
    teamMembers: [],
    milestones: [],
    serviceOrders: [],
    workSituations: [],
  },
];

const DEFAULT_WORKFLOWS_INBOX = [
  {
    id: 'wf-001',
    type: 'PURCHASE_REQUEST',
    reference: 'DA-2026-0042',
    title: 'Achat Tubes acier A106 Gr.B 6" Sch 80 & Vannes PN40',
    requesterName: 'Sofiane Belkacem',
    requesterRole: 'RESPONSABLE_PROJET',
    projectCode: 'PRJ-2026-001',
    projectName: 'Maintenance Arrêt Unité Raffinage U-100',
    amount: 4850000,
    createdAt: '2026-11-06T14:20:00.000Z',
    status: 'PENDING_APPROVAL',
    urgency: 'HIGH',
    description: 'Fourniture urgente pour tir radiographique et épreuve hydrostatique 150 Bars.',
    lines: [
      { id: 'l-1', itemCode: 'ART-003', designation: 'Tube acier sans soudure ASTM A106 Gr.B 6" Sch 80', quantity: 120, unit: 'M', unitPrice: 11800, totalHT: 1416000 },
      { id: 'l-2', itemCode: 'ART-001', designation: 'Vanne à opercule acier forgé DN100 PN40', quantity: 8, unit: 'U', unitPrice: 14200, totalHT: 113600 },
    ],
  },
  {
    id: 'wf-002',
    type: 'WORK_SITUATION',
    reference: 'SIT-2026-02',
    title: 'Situation Périodique N°02 (Avancement physique 52%)',
    requesterName: 'Sofiane Belkacem',
    requesterRole: 'RESPONSABLE_PROJET',
    projectCode: 'PRJ-2026-001',
    projectName: 'Maintenance Arrêt Unité Raffinage U-100',
    amount: 32000000,
    createdAt: '2026-11-07T09:15:00.000Z',
    status: 'PENDING_APPROVAL',
    urgency: 'MEDIUM',
    description: 'Attachement contradictoire signé par le client SONATRACH DP Hassi Messaoud.',
  },
];

export const MOCK_WAREHOUSES = [
  { id: 'wh-hmd', code: 'MAG-HMD', name: 'Magasin Central Base Sud Hassi Messaoud', location: 'Zone Industrielle Irara, Hassi Messaoud', managerName: 'Tarek Meziani' },
  { id: 'wh-ski', code: 'MAG-SKI', name: 'Magasin Régional Chantier Skikda', location: 'Plateforme Pétrochimique, Skikda', managerName: 'Khaled Bounab' },
  { id: 'wh-rou', code: 'MAG-ROU', name: 'Magasin Principal & Atelier de Préfabrication Rouiba', location: 'Zone Industrielle Voie C, Rouiba (Alger)', managerName: 'Mustapha Touati' },
];

export const MOCK_SUPPLIERS = [
  { id: 'sup-1', code: 'FRN-001', name: 'Sarl Algérie Vannes & Robinetterie', contactName: 'Mourad Cherif', email: 'contact@algerievannes.dz', phone: '+213 21 82 45 10', address: 'Zone Industrielle Dar El Beida, Alger', specialties: 'Robinetterie PN40/PN100, vannes API, clapets pétrole', rating: 4.8 },
  { id: 'sup-2', code: 'FRN-002', name: 'Eurl Comptoir Sidérurgique & Métallurgique', contactName: 'Djamel Hadj', email: 'ventes@siderurgique-est.dz', phone: '+213 38 72 11 00', address: 'Zone Industrielle Chaiba, Annaba', specialties: 'Tubes ASTM A106, tôles chaudronnerie P265GH, profilés', rating: 4.6 },
  { id: 'sup-3', code: 'FRN-003', name: 'Sarl Gaz & Soudure Industrielle DZ', contactName: 'Hocine Kaci', email: 'kaci@gaz-soudure.dz', phone: '+213 29 73 55 20', address: 'Zone Industrielle Irara, Hassi Messaoud', specialties: 'Électrodes E7018, fils TIG, torches, gaz spéciaux', rating: 4.9 },
  { id: 'sup-4', code: 'FRN-004', name: 'Eurl Robinetterie & Brides Industrielles Oran', contactName: 'Nabil Mansour', email: 'contact@rbi-oran.dz', phone: '+213 41 40 18 90', address: 'Zone Industrielle Es Senia, Oran', specialties: 'Brides forgées WNRF/BLRF, visserie B7/2H', rating: 4.4 },
];

export const MOCK_PURCHASE_ORDERS = [
  {
    id: 'po-01',
    poNumber: 'BC-2026-0051',
    code: 'BC-2026-0051',
    supplierName: 'Sarl Algérie Vannes & Robinetterie',
    supplier: { id: 'sup-1', name: 'Sarl Algérie Vannes & Robinetterie' },
    projectCode: 'PRJ-2026-001',
    projectName: 'Maintenance Arrêt Unité Raffinage U-100',
    totalAmountHT: 4850000,
    totalAmountTTC: 5771500,
    status: 'CONFIRMED',
    issuedDate: '2026-11-04T10:00:00.000Z',
    items: [
      { id: 'poi-1', itemId: '1', code: 'ART-001', name: 'Vanne à opercule acier forgé DN100 PN40', quantity: 8, unitCost: 14200, unit: 'U' },
    ],
  },
];

export const MOCK_EMPLOYEES = [
  { id: 'usr-rp-002', name: 'Sofiane Belkacem', email: 's.belkacem@silex-services.dz', role: 'RESPONSABLE_PROJET', departmentCode: 'OPERATIONS_PROJETS', title: 'Ingénieur Chef de Projets Industriels' },
  { id: 'usr-dg-001', name: 'Karim Mansouri', email: 'k.mansouri@silex-services.dz', role: 'DIRECTEUR_GENERAL', departmentCode: 'DIRECTION_GENERALE', title: 'Directeur Général' },
  { id: 'usr-ach-003', name: 'Amina Benali', email: 'a.benali@silex-services.dz', role: 'RESPONSABLE_ACHATS', departmentCode: 'ACHATS_LOGISTIQUE', title: 'Responsable Approvisionnements & Achats' },
  { id: 'usr-mag-004', name: 'Tarek Meziani', email: 't.meziani@silex-services.dz', role: 'RESPONSABLE_MAGASIN', departmentCode: 'MAGASIN_STOCKS', title: 'Gestionnaire Magasin Central' },
  { id: 'usr-rh-005', name: 'Samira Haddad', email: 's.haddad@silex-services.dz', role: 'RESPONSABLE_RH', departmentCode: 'RESSOURCES_HUMAINES', title: 'Responsable RH & Compétences' },
  { id: 'usr-sou-01', name: 'Mourad Zitouni', email: 'm.zitouni@silex-services.dz', role: 'OPERATEUR_CHANTIER', departmentCode: 'OPERATIONS_PROJETS', title: 'Soudeur Haute Pression ASME IX' },
  { id: 'usr-cnd-02', name: 'Yacine Khelifi', email: 'y.khelifi@silex-services.dz', role: 'RESPONSABLE_QUALITE', departmentCode: 'QHSE', title: 'Inspecteur CND Niveau II' },
];

export const MOCK_STOCK_MOVEMENTS = [
  {
    id: 'mvt-01',
    type: 'ENTRY',
    itemCode: 'ART-001',
    itemName: 'Vanne à opercule acier forgé DN100 PN40',
    quantity: 10,
    warehouseName: 'Magasin Central Base Sud Hassi Messaoud',
    reference: 'BR-2026-081',
    timestamp: '2026-11-05T11:00:00.000Z',
  },
  {
    id: 'mvt-02',
    type: 'EXIT',
    itemCode: 'ART-002',
    itemName: 'Tube acier sans soudure ASTM A106 Gr.B 4" Sch 40',
    quantity: 15,
    warehouseName: 'Magasin Central Base Sud Hassi Messaoud',
    reference: 'BS-2026-142',
    timestamp: '2026-11-06T15:30:00.000Z',
  },
];

export const MOCK_COST_DISTRIBUTION = [
  { name: 'Tuyauterie, Soudage & Matériaux', value: 45, color: '#0B207D' },
  { name: 'Main d’œuvre & Soudeurs ASME', value: 30, color: '#0A7F7C' },
  { name: 'Froid, HVAC & Électricité', value: 15, color: '#D99B35' },
  { name: 'Sous-traitance & Contrôles CND', value: 10, color: '#E51A1A' },
];

export const MOCK_PROCUREMENT_REQUESTS = [
  {
    id: 'pr-01',
    code: 'DA-2026-0042',
    projectCode: 'PRJ-2026-001',
    projectName: 'Maintenance Arrêt Unité Raffinage U-100',
    title: 'Achat Tubes acier A106 Gr.B 6" Sch 80 & Vannes PN40',
    requesterName: 'Sofiane Belkacem',
    status: 'SUBMITTED',
    estimatedAmount: 4850000,
    createdAt: '2026-11-06T14:20:00.000Z',
    lines: [
      { id: 'l-1', itemCode: 'ART-003', itemName: 'Tube acier sans soudure ASTM A106 Gr.B 6" Sch 80', quantity: 120, unit: 'M', estimatedPrice: 11800 },
      { id: 'l-2', itemCode: 'ART-001', itemName: 'Vanne à opercule acier forgé DN100 PN40', quantity: 8, unit: 'U', estimatedPrice: 14200 },
    ],
  },
  {
    id: 'pr-02',
    code: 'DA-2026-0039',
    projectCode: 'PRJ-2026-002',
    projectName: 'Montage Mécanique & Tuyauterie Centrale 2x400MW',
    title: 'Consommables de soudage et brides WNRF Cl300',
    requesterName: 'Sofiane Belkacem',
    status: 'APPROVED',
    estimatedAmount: 2150000,
    createdAt: '2026-11-02T10:00:00.000Z',
  },
];

export const MOCK_INVENTORY_ITEMS = [
  { id: '1', code: 'ART-001', name: 'Vanne à opercule acier forgé DN100 PN40', categoryCode: 'ROBINETTERIE', currentStock: 25, minStockLevel: 10, unit: 'U', unitCost: 14200 },
  { id: '2', code: 'ART-002', name: 'Tube acier sans soudure ASTM A106 Gr.B 4" Sch 40', categoryCode: 'TUYAUTERIE', currentStock: 180, minStockLevel: 50, unit: 'M', unitCost: 6500 },
  { id: '3', code: 'ART-003', name: 'Tube acier sans soudure ASTM A106 Gr.B 6" Sch 80', categoryCode: 'TUYAUTERIE', currentStock: 95, minStockLevel: 30, unit: 'M', unitCost: 11800 },
  { id: '4', code: 'ART-004', name: 'Vanne à boisseau sphérique inox 316L DN50 PN16', categoryCode: 'ROBINETTERIE', currentStock: 18, minStockLevel: 8, unit: 'U', unitCost: 9800 },
  { id: '5', code: 'ART-005', name: 'Bride à collerette WNRF Class 300 4" Sch 40', categoryCode: 'BRIDES_FIX', currentStock: 64, minStockLevel: 20, unit: 'U', unitCost: 4200 },
  { id: '6', code: 'ART-009', name: 'Électrodes enrobées basiques E7018 diam 3.2mm', categoryCode: 'SOUDAGE', currentStock: 450, minStockLevel: 100, unit: 'KG', unitCost: 850 },
  { id: '7', code: 'ART-010', name: 'Fil d’apport TIG acier ER70S-6 diam 2.4mm', categoryCode: 'SOUDAGE', currentStock: 210, minStockLevel: 50, unit: 'KG', unitCost: 1200 },
];

/**
 * MOCK STATEFUL REACTIVE STORE
 * Persists user actions in LocalStorage so that all buttons, modals, and status updates work dynamically!
 */
class StatefulMockStore {
  private projects: any[] = DEFAULT_PROJECTS;
  private workflows: any[] = DEFAULT_WORKFLOWS_INBOX;
  private kpis: any = DEFAULT_KPIS;
  private procurement: any[] = MOCK_PROCUREMENT_REQUESTS;
  private inventory: any[] = MOCK_INVENTORY_ITEMS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedProjects = localStorage.getItem('silex_mock_projects');
      if (storedProjects) this.projects = JSON.parse(storedProjects);

      const storedWorkflows = localStorage.getItem('silex_mock_workflows');
      if (storedWorkflows) this.workflows = JSON.parse(storedWorkflows);

      const storedKpis = localStorage.getItem('silex_mock_kpis');
      if (storedKpis) this.kpis = JSON.parse(storedKpis);

      const storedProc = localStorage.getItem('silex_mock_procurement');
      if (storedProc) this.procurement = JSON.parse(storedProc);

      const storedInv = localStorage.getItem('silex_mock_inventory');
      if (storedInv) this.inventory = JSON.parse(storedInv);
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('silex_mock_projects', JSON.stringify(this.projects));
      localStorage.setItem('silex_mock_workflows', JSON.stringify(this.workflows));
      localStorage.setItem('silex_mock_kpis', JSON.stringify(this.kpis));
      localStorage.setItem('silex_mock_procurement', JSON.stringify(this.procurement));
      localStorage.setItem('silex_mock_inventory', JSON.stringify(this.inventory));
    } catch {
      // ignore
    }
  }

  getProjects() {
    return this.projects;
  }

  getProject(identifier: string) {
    const clean = identifier.toUpperCase();
    return this.projects.find(p => p.code?.toUpperCase() === clean || p.id === identifier) || this.projects[0];
  }

  updateProject(idOrCode: string, patch: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      Object.assign(proj, patch);
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
        progressWeight: milestone.progressWeight || 15,
        status: milestone.status || 'IN_PROGRESS',
      };
      proj.milestones.push(newM);

      // Recalculer l'avancement physique en fonction des jalons
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
        title: odsData.title || 'Ordre de service',
        issuedDate: odsData.issuedDate || new Date().toISOString(),
        status: 'ISSUED',
        description: odsData.description,
        delayImpactDays: odsData.delayImpactDays || 0,
        costImpact: odsData.costImpact || 0,
      };
      proj.serviceOrders.unshift(newOds);

      if (odsData.costImpact) {
        proj.committedCost = (Number(proj.committedCost) || 0) + Number(odsData.costImpact);
      }
      this.saveToStorage();
    }
    return proj;
  }

  addWorkSituation(idOrCode: string, sitData: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      if (!proj.workSituations) proj.workSituations = [];
      const count = proj.workSituations.length + 1;
      const amount = Number(sitData.totalAmountHT || sitData.amountHT || 2500000);
      const newSit = {
        id: 'sit-' + Date.now(),
        number: `SIT-2026-0${count}`,
        periodStart: sitData.periodStart || new Date().toISOString(),
        periodEnd: sitData.periodEnd || new Date().toISOString(),
        amountHT: amount,
        status: 'UNDER_REVIEW',
        inspector: sitData.inspectorName || 'Contrôle Technique',
      };
      proj.workSituations.unshift(newSit);

      // Ajouter automatiquement un workflow d'approbation DG
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

      this.kpis.pendingApprovalsCount = this.workflows.filter(w => w.status === 'PENDING_APPROVAL').length;
      this.saveToStorage();
    }
    return proj;
  }

  addCost(idOrCode: string, costData: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      const amount = Number(costData.amount || 0);
      proj.actualCost = (Number(proj.actualCost) || 0) + amount;
      this.kpis.actualCost = (Number(this.kpis.actualCost) || 0) + amount;
      this.saveToStorage();
    }
    return proj;
  }

  addMember(idOrCode: string, memberData: any) {
    const proj = this.getProject(idOrCode);
    if (proj) {
      if (!proj.teamMembers) proj.teamMembers = [];
      const user = Object.values(DEMO_PROFILES).find(p => p.id === memberData.userId);
      proj.teamMembers.push({
        id: memberData.userId || 'usr-' + Date.now(),
        name: user?.name || 'Collaborateur Chantier SILEX',
        role: user?.title || 'Intervenant Opérationnel',
      });
      this.saveToStorage();
    }
    return proj;
  }

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

      // Si c'est une situation de travaux, mettre à jour le projet
      if (item.type === 'WORK_SITUATION') {
        const proj = this.projects.find(p => p.code === item.projectCode);
        if (proj && proj.workSituations) {
          const sit = proj.workSituations.find((s: any) => s.number === item.reference);
          if (sit) sit.status = 'APPROVED';
        }
      }

      this.kpis.pendingApprovalsCount = this.workflows.filter(w => w.status === 'PENDING_APPROVAL').length;
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
      this.kpis.pendingApprovalsCount = this.workflows.filter(w => w.status === 'PENDING_APPROVAL').length;
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

  getKpis() {
    this.kpis.pendingApprovalsCount = this.workflows.filter(w => w.status === 'PENDING_APPROVAL').length;
    return this.kpis;
  }

  getProcurementRequests() {
    return this.procurement;
  }

  createProcurementRequest(data: any) {
    const count = this.procurement.length + 1;
    const newReq = {
      id: 'pr-' + Date.now(),
      code: `DA-2026-00${count}`,
      projectCode: data.projectCode || 'PRJ-2026-001',
      projectName: data.projectName || 'Projet Chantier SILEX',
      title: data.title || 'Demande d’achat fournitures & équipements',
      requesterName: data.requesterName || 'Sofiane Belkacem',
      status: 'SUBMITTED',
      estimatedAmount: Number(data.estimatedAmount || 1500000),
      createdAt: new Date().toISOString(),
      lines: data.lines || [],
    };
    this.procurement.unshift(newReq);

    // Ajouter un workflow
    this.workflows.unshift({
      id: 'wf-' + Date.now(),
      type: 'PURCHASE_REQUEST',
      reference: newReq.code,
      title: newReq.title,
      requesterName: newReq.requesterName,
      requesterRole: 'RESPONSABLE_PROJET',
      projectCode: newReq.projectCode,
      projectName: newReq.projectName,
      amount: newReq.estimatedAmount,
      createdAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
      urgency: 'HIGH',
      description: data.justification || 'Demande d’achat urgente pour approvisionnement chantier.',
    });

    this.kpis.pendingApprovalsCount = this.workflows.filter(w => w.status === 'PENDING_APPROVAL').length;
    this.saveToStorage();
    return newReq;
  }

  getInventoryItems() {
    return this.inventory;
  }

  getWarehouses() {
    return MOCK_WAREHOUSES;
  }

  getSuppliers() {
    return MOCK_SUPPLIERS;
  }

  getPurchaseOrders() {
    return MOCK_PURCHASE_ORDERS;
  }

  getEmployees() {
    return MOCK_EMPLOYEES;
  }

  getStockMovements() {
    return MOCK_STOCK_MOVEMENTS;
  }

  addInventoryMovement(movement: any) {
    const item = this.inventory.find(i => i.code === movement.itemCode || i.id === movement.itemId);
    if (item) {
      const qty = Number(movement.quantity || 0);
      if (movement.type === 'ENTRY' || movement.type === 'RECEIPT') {
        item.currentStock += qty;
      } else if (movement.type === 'EXIT' || movement.type === 'ISSUE') {
        item.currentStock = Math.max(0, item.currentStock - qty);
      }
      this.saveToStorage();
    }
    return { success: true, item };
  }
}

export const mockStore = new StatefulMockStore();

export const MOCK_KPIS = DEFAULT_KPIS;
export const MOCK_PROJECTS = DEFAULT_PROJECTS;
export const MOCK_WORKFLOWS_INBOX = { items: DEFAULT_WORKFLOWS_INBOX, total: DEFAULT_WORKFLOWS_INBOX.length };
