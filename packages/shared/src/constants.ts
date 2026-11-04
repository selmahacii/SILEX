import { SystemRole, DepartmentCode } from './enums.js';

export const APP_NAME = 'SILEX ERP';
export const APP_SUBTITLE = 'Industrial Project & Operations Management Platform';
export const COMPANY_NAME = 'SILEX SERVICES';
export const CURRENCY = 'DA';
export const TIMEZONE = 'Africa/Algiers';
export const LOCALE = 'fr-DZ';

export const COLORS = {
  navyPrimary: '#142B45',
  navySecondary: '#203D5A',
  teal: '#0A7F7C',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#E1E6ED',
  textPrimary: '#182433',
  textSecondary: '#697789',
  warning: '#D99B35',
  danger: '#C44747',
  success: '#278363',
};

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  role: SystemRole;
  departmentCode: DepartmentCode;
  avatar: string;
  assignedProjectCodes?: string[];
  description: string;
}

export const DEMO_PROFILES: Record<SystemRole, DemoProfile> = {
  [SystemRole.DIRECTEUR_GENERAL]: {
    id: 'usr-dg-001',
    name: 'Karim Mansouri',
    email: 'k.mansouri@silex-services.dz',
    title: 'Directeur Général',
    role: SystemRole.DIRECTEUR_GENERAL,
    departmentCode: DepartmentCode.DIRECTION_GENERALE,
    avatar: '/avatars/dg.webp',
    description: 'Vision consolidée, approbations stratégiques et pilotage global de l’entreprise.',
  },
  [SystemRole.RESPONSABLE_PROJET]: {
    id: 'usr-rp-002',
    name: 'Sofiane Belkacem',
    email: 's.belkacem@silex-services.dz',
    title: 'Chef de Projets Industriels',
    role: SystemRole.RESPONSABLE_PROJET,
    departmentCode: DepartmentCode.OPERATIONS_PROJETS,
    avatar: '/avatars/rp.webp',
    assignedProjectCodes: ['PRJ-2026-001', 'PRJ-2026-003'],
    description: 'Gestion des chantiers (Tuyauterie/Maintenance), demandes d’achat et situations.',
  },
  [SystemRole.RESPONSABLE_ACHATS]: {
    id: 'usr-ach-003',
    name: 'Amina Benali',
    email: 'a.benali@silex-services.dz',
    title: 'Responsable Achats & Approvisionnements',
    role: SystemRole.RESPONSABLE_ACHATS,
    departmentCode: DepartmentCode.ACHATS_LOGISTIQUE,
    avatar: '/avatars/ach.webp',
    description: 'Consultation des fournisseurs, comparatifs d’offres et bons de commande.',
  },
  [SystemRole.RESPONSABLE_MAGASIN]: {
    id: 'usr-mag-004',
    name: 'Tarek Meziani',
    email: 't.meziani@silex-services.dz',
    title: 'Responsable Magasin & Stocks',
    role: SystemRole.RESPONSABLE_MAGASIN,
    departmentCode: DepartmentCode.MAGASIN_STOCKS,
    avatar: '/avatars/mag.webp',
    description: 'Réceptions marchandises, sorties chantiers, transferts et inventaires.',
  },
  [SystemRole.RESPONSABLE_RH]: {
    id: 'usr-rh-005',
    name: 'Samira Haddad',
    email: 's.haddad@silex-services.dz',
    title: 'Responsable Ressources Humaines',
    role: SystemRole.RESPONSABLE_RH,
    departmentCode: DepartmentCode.RESSOURCES_HUMAINES,
    avatar: '/avatars/rh.webp',
    description: 'Personnel, habilitations soudage/sécurité, présences et affectations.',
  },
  [SystemRole.RESPONSABLE_FINANCIER]: {
    id: 'usr-fin-006',
    name: 'Rachid Bouzid',
    email: 'r.bouzid@silex-services.dz',
    title: 'Directeur Financier',
    role: SystemRole.RESPONSABLE_FINANCIER,
    departmentCode: DepartmentCode.FINANCE_COMPTABILITE,
    avatar: '/avatars/fin.webp',
    description: 'Budgets projets, contrôle des engagements, facturation et créances.',
  },
  [SystemRole.RESPONSABLE_MAINTENANCE]: {
    id: 'usr-maint-007',
    name: 'Yacine Khelifi',
    email: 'y.khelifi@silex-services.dz',
    title: 'Responsable Matériel & Parc',
    role: SystemRole.RESPONSABLE_MAINTENANCE,
    departmentCode: DepartmentCode.PARC_MAINTENANCE,
    avatar: '/avatars/maint.webp',
    description: 'Disponibilité du parc d’engins, postes de soudure et entretiens.',
  },
  [SystemRole.RESPONSABLE_QUALITE]: {
    id: 'usr-qhse-008',
    name: 'Nadia Chaib',
    email: 'n.chaib@silex-services.dz',
    title: 'Responsable QHSE & Conformité',
    role: SystemRole.RESPONSABLE_QUALITE,
    departmentCode: DepartmentCode.QHSE,
    avatar: '/avatars/qhse.webp',
    description: 'Système documentaire, non-conformités, traçabilité soudage et audits.',
  },
  [SystemRole.ADMINISTRATEUR]: {
    id: 'usr-adm-009',
    name: 'Lyes Hamidi',
    email: 'admin@silex-services.dz',
    title: 'Administrateur Système',
    role: SystemRole.ADMINISTRATEUR,
    departmentCode: DepartmentCode.INFORMATIQUE_ADMIN,
    avatar: '/avatars/admin.webp',
    description: 'Gestion des rôles, journal d’audit et maintenance système.',
  },
};
