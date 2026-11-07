import { SystemRole, DepartmentCode } from './enums.js';

export const APP_NAME = 'SILEX ERP';
export const APP_SUBTITLE = 'Industrial Project & Operations Management Platform';
export const COMPANY_NAME = 'SILEX SERVICES';
export const COMPANY_ESTABLISHED = 'Septembre 2015';
export const COMPANY_DESCRIPTION =
  'Entreprise spécialisée dans les prestations industrielles, la maintenance et l’accompagnement de projets sur l’ensemble du territoire algérien.';
export const CURRENCY = 'DA';
export const TIMEZONE = 'Africa/Algiers';
export const LOCALE = 'fr-DZ';

export const COLORS = {
  // Charte officielle SILEX SERVICES (Bleu Royal & Rouge Silex minimaliste)
  silexBlue: '#0B207D',
  silexBlueDark: '#07164D',
  silexBlueLight: '#EFF3FB',
  silexRed: '#E51A1A',
  silexRedLight: '#FEF2F2',
  navyPrimary: '#0B1C38',
  navySecondary: '#162C50',
  teal: '#0A7F7C',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  warning: '#D97706',
  danger: '#E51A1A',
  success: '#16A34A',
};

// Les 5 Domaines d'Activités Officiels de SILEX SERVICES
export const SILEX_DOMAINS = [
  {
    id: 'accompagnement-projets',
    title: 'Accompagnement et réalisation de projets',
    shortTitle: 'Accompagnement Projets',
    description: 'Pilotage clé en main, gestion des délais, ordonnancement et respect strict des engagements QCD (Qualité-Coûts-Délais).',
    color: '#0B207D',
    tag: 'Management Projets',
  },
  {
    id: 'electricite-instrumentation',
    title: 'Électricité & instrumentation',
    shortTitle: 'Électricité & Instrumentation',
    description: 'Câblage industriel, armoires de distribution, automatismes, étalonnage de capteurs et boucles de régulation.',
    color: '#0B207D',
    tag: 'Électricité & Process',
  },
  {
    id: 'froid-industriel',
    title: 'Froid industriel',
    shortTitle: 'Froid Industriel & HVAC',
    description: 'Installations frigorifiques industrielles, centrales de froid, climatisation technique et réseaux de fluide frigorigène.',
    color: '#0B207D',
    tag: 'HVAC & Réfrigération',
  },
  {
    id: 'tuyauterie-chaudronnerie-isolation',
    title: 'Tuyauterie chaudronnerie & isolation',
    shortTitle: 'Tuyauterie & Chaudronnerie',
    description: 'Préfabrication, montage tuyauteries acier/inox HP, soudage certifié ASME IX/ISO 9606, calorifugeage et épreuves 150 bars.',
    color: '#E51A1A',
    tag: 'Tuyauterie & Soudage',
  },
  {
    id: 'maintenance-industrielle',
    title: 'Maintenance industrielle',
    shortTitle: 'Maintenance Industrielle',
    description: 'Arrêts techniques programmés, révision de machines tournantes, maintenance préventive et interventions d’urgence.',
    color: '#E51A1A',
    tag: 'Maintenance & Arrêts',
  },
] as const;

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
    title: 'Responsable Approvisionnements & Achats',
    role: SystemRole.RESPONSABLE_ACHATS,
    departmentCode: DepartmentCode.ACHATS_LOGISTIQUE,
    avatar: '/avatars/ach.webp',
    description: 'Consultation fournisseurs, comparatifs de devis et bons de commande.',
  },
  [SystemRole.RESPONSABLE_MAGASIN]: {
    id: 'usr-mag-004',
    name: 'Tarek Meziani',
    email: 't.meziani@silex-services.dz',
    title: 'Gestionnaire Magasin Central',
    role: SystemRole.RESPONSABLE_MAGASIN,
    departmentCode: DepartmentCode.MAGASIN_STOCKS,
    avatar: '/avatars/mag.webp',
    description: 'Réception bons de livraison, sorties chantiers et tenue des stocks.',
  },
  [SystemRole.RESPONSABLE_RH]: {
    id: 'usr-rh-005',
    name: 'Samira Haddad',
    email: 's.haddad@silex-services.dz',
    title: 'Responsable RH & Compétences',
    role: SystemRole.RESPONSABLE_RH,
    departmentCode: DepartmentCode.RESSOURCES_HUMAINES,
    avatar: '/avatars/rh.webp',
    description: 'Affectations chantiers, habilitations soudage CQS et feuilles de pointage.',
  },
  [SystemRole.RESPONSABLE_FINANCIER]: {
    id: 'usr-fin-006',
    name: 'Rachid Bouzid',
    email: 'r.bouzid@silex-services.dz',
    title: 'Directeur Financier & Contrôle de Gestion',
    role: SystemRole.RESPONSABLE_FINANCIER,
    departmentCode: DepartmentCode.FINANCE_COMPTABILITE,
    avatar: '/avatars/fin.webp',
    description: 'Rentabilité par projet, contrôle des engagements et facturation situations.',
  },
  [SystemRole.RESPONSABLE_MAINTENANCE]: {
    id: 'usr-mnt-007',
    name: 'Yacine Khelifi',
    email: 'y.khelifi@silex-services.dz',
    title: 'Responsable Matériel & Parc Engins',
    role: SystemRole.RESPONSABLE_MAINTENANCE,
    departmentCode: DepartmentCode.PARC_MAINTENANCE,
    avatar: '/avatars/mnt.webp',
    description: 'Disponibilité du parc, contrôle périodique et ordres de travail de maintenance.',
  },
  [SystemRole.RESPONSABLE_QUALITE]: {
    id: 'usr-qhse-008',
    name: 'Nadia Chaib',
    email: 'n.chaib@silex-services.dz',
    title: 'Responsable Qualité & Sécurité QHSE',
    role: SystemRole.RESPONSABLE_QUALITE,
    departmentCode: DepartmentCode.QHSE,
    avatar: '/avatars/qhse.webp',
    description: 'GED technique, DMOS/QMOS, fiches de non-conformité et indicateurs TF/TG.',
  },
  [SystemRole.ADMINISTRATEUR]: {
    id: 'usr-adm-009',
    name: 'Lyes Hamidi',
    email: 'admin@silex-services.dz',
    title: 'Administrateur Système ERP',
    role: SystemRole.ADMINISTRATEUR,
    departmentCode: DepartmentCode.DIRECTION_GENERALE,
    avatar: '/avatars/adm.webp',
    description: 'Gestion des rôles, journal d’audit de sécurité et configuration plateforme.',
  },
};
