"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SILEX_SOD_RULES = exports.DEMO_PROFILES = exports.SILEX_DOMAINS = exports.COLORS = exports.LOCALE = exports.TIMEZONE = exports.CURRENCY = exports.COMPANY_DESCRIPTION = exports.COMPANY_ESTABLISHED = exports.COMPANY_NAME = exports.APP_SUBTITLE = exports.APP_NAME = void 0;
exports.getRequiredPrApprovalLevel = getRequiredPrApprovalLevel;
exports.getRequiredSupplierInvoiceApprovalLevel = getRequiredSupplierInvoiceApprovalLevel;
exports.isSelfApprovalForbidden = isSelfApprovalForbidden;
const enums_js_1 = require("./enums.js");
exports.APP_NAME = 'SILEX ERP';
exports.APP_SUBTITLE = 'Industrial Project & Operations Management Platform';
exports.COMPANY_NAME = 'SILEX SERVICES';
exports.COMPANY_ESTABLISHED = 'Septembre 2015';
exports.COMPANY_DESCRIPTION = 'Entreprise spécialisée dans les prestations industrielles, la maintenance et l’accompagnement de projets sur l’ensemble du territoire algérien.';
exports.CURRENCY = 'DA';
exports.TIMEZONE = 'Africa/Algiers';
exports.LOCALE = 'fr-DZ';
exports.COLORS = {
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
exports.SILEX_DOMAINS = [
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
];
exports.DEMO_PROFILES = {
    [enums_js_1.SystemRole.DIRECTEUR_GENERAL]: {
        id: 'usr-dg-001',
        name: 'Karim Mansouri',
        email: 'k.mansouri@silex-services.dz',
        title: 'Directeur Général',
        role: enums_js_1.SystemRole.DIRECTEUR_GENERAL,
        departmentCode: enums_js_1.DepartmentCode.DIRECTION_GENERALE,
        avatar: '/avatars/dg.webp',
        description: 'Vision consolidée, approbations stratégiques et pilotage global de l’entreprise.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_PROJET]: {
        id: 'usr-rp-002',
        name: 'Sofiane Belkacem',
        email: 's.belkacem@silex-services.dz',
        title: 'Chef de Projets Industriels',
        role: enums_js_1.SystemRole.RESPONSABLE_PROJET,
        departmentCode: enums_js_1.DepartmentCode.OPERATIONS_PROJETS,
        avatar: '/avatars/rp.webp',
        assignedProjectCodes: [],
        description: 'Gestion des chantiers (Tuyauterie/Maintenance), demandes d’achat et situations.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_ACHATS]: {
        id: 'usr-ach-003',
        name: 'Amina Benali',
        email: 'a.benali@silex-services.dz',
        title: 'Responsable Approvisionnements & Achats',
        role: enums_js_1.SystemRole.RESPONSABLE_ACHATS,
        departmentCode: enums_js_1.DepartmentCode.ACHATS_LOGISTIQUE,
        avatar: '/avatars/ach.webp',
        description: 'Consultation fournisseurs, comparatifs de devis et bons de commande.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_MAGASIN]: {
        id: 'usr-mag-004',
        name: 'Tarek Meziani',
        email: 't.meziani@silex-services.dz',
        title: 'Gestionnaire Magasin Central',
        role: enums_js_1.SystemRole.RESPONSABLE_MAGASIN,
        departmentCode: enums_js_1.DepartmentCode.MAGASIN_STOCKS,
        avatar: '/avatars/mag.webp',
        description: 'Réception bons de livraison, sorties chantiers et tenue des stocks.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_RH]: {
        id: 'usr-rh-005',
        name: 'Samira Haddad',
        email: 's.haddad@silex-services.dz',
        title: 'Responsable RH & Compétences',
        role: enums_js_1.SystemRole.RESPONSABLE_RH,
        departmentCode: enums_js_1.DepartmentCode.RESSOURCES_HUMAINES,
        avatar: '/avatars/rh.webp',
        description: 'Affectations chantiers, habilitations soudage CQS et feuilles de pointage.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_FINANCIER]: {
        id: 'usr-fin-006',
        name: 'Rachid Bouzid',
        email: 'r.bouzid@silex-services.dz',
        title: 'Directeur Financier & Contrôle de Gestion',
        role: enums_js_1.SystemRole.RESPONSABLE_FINANCIER,
        departmentCode: enums_js_1.DepartmentCode.FINANCE_COMPTABILITE,
        avatar: '/avatars/fin.webp',
        description: 'Rentabilité par projet, contrôle des engagements et facturation situations.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_MAINTENANCE]: {
        id: 'usr-mnt-007',
        name: 'Yacine Khelifi',
        email: 'y.khelifi@silex-services.dz',
        title: 'Responsable Matériel & Parc Engins',
        role: enums_js_1.SystemRole.RESPONSABLE_MAINTENANCE,
        departmentCode: enums_js_1.DepartmentCode.PARC_MAINTENANCE,
        avatar: '/avatars/mnt.webp',
        description: 'Disponibilité du parc, contrôle périodique et ordres de travail de maintenance.',
    },
    [enums_js_1.SystemRole.RESPONSABLE_QUALITE]: {
        id: 'usr-qhse-008',
        name: 'Nadia Chaib',
        email: 'n.chaib@silex-services.dz',
        title: 'Responsable Qualité & Sécurité QHSE',
        role: enums_js_1.SystemRole.RESPONSABLE_QUALITE,
        departmentCode: enums_js_1.DepartmentCode.QHSE,
        avatar: '/avatars/qhse.webp',
        description: 'GED technique, DMOS/QMOS, fiches de non-conformité et indicateurs TF/TG.',
    },
    [enums_js_1.SystemRole.ADMINISTRATEUR]: {
        id: 'usr-adm-009',
        name: 'Lyes Hamidi',
        email: 'admin@silex-services.dz',
        title: 'Administrateur Système ERP',
        role: enums_js_1.SystemRole.ADMINISTRATEUR,
        departmentCode: enums_js_1.DepartmentCode.DIRECTION_GENERALE,
        avatar: '/avatars/adm.webp',
        description: 'Gestion des rôles, journal d’audit de sécurité et configuration plateforme.',
    },
};
exports.SILEX_SOD_RULES = {
    // 1. Demandes d'Achat (DA) et Engagements Fournisseurs
    PURCHASE_REQUEST: {
        TIER_1_MAX_DA: 100000,
        TIER_2_MAX_DA: 500000,
        DG_MANDATORY_THRESHOLD_DA: 500000,
        budgetExceededForcesDG: true,
        selfApprovalAllowed: false,
    },
    // 2. Factures Fournisseurs et 3-Way Matching
    SUPPLIER_INVOICE: {
        AUTO_APPROVE_MAX_DA: 500000,
        PM_APPROVAL_MAX_DA: 2000000,
        DG_APPROVAL_THRESHOLD_DA: 2000000,
        priceTolerancePct: 0.5,
        priceToleranceAbsoluteDA: 100,
        selfApprovalAllowed: false,
    },
    // 3. Situations de Travaux et Retenues de Garantie
    WORK_SITUATION: {
        RETENTION_GUARANTEE_PCT: 5.0,
        WARRANTY_RELEASE_ROLE: enums_js_1.SystemRole.DIRECTEUR_GENERAL,
        selfApprovalAllowed: false,
    },
    // 4. Chiffrage Commercial
    COST_SHEET: {
        DG_APPROVAL_MANDATORY: true,
        selfApprovalAllowed: false,
    },
};
function getRequiredPrApprovalLevel(amountHT, budgetExceeded = false) {
    if (budgetExceeded || amountHT > exports.SILEX_SOD_RULES.PURCHASE_REQUEST.DG_MANDATORY_THRESHOLD_DA) {
        return 'DIRECTEUR_GENERAL';
    }
    if (amountHT > exports.SILEX_SOD_RULES.PURCHASE_REQUEST.TIER_1_MAX_DA) {
        return 'RESPONSABLE_PROJET_ET_ACHATS';
    }
    return 'RESPONSABLE_ACHATS';
}
function getRequiredSupplierInvoiceApprovalLevel(amountHT, isMatched = true) {
    if (amountHT > exports.SILEX_SOD_RULES.SUPPLIER_INVOICE.DG_APPROVAL_THRESHOLD_DA) {
        return 'PENDING_DG';
    }
    if (amountHT > exports.SILEX_SOD_RULES.SUPPLIER_INVOICE.AUTO_APPROVE_MAX_DA || !isMatched) {
        return 'PENDING_PM';
    }
    return 'AUTO_APPROVED';
}
function isSelfApprovalForbidden(initiatorId, approverId) {
    if (!initiatorId || !approverId)
        return false;
    return initiatorId === approverId;
}
//# sourceMappingURL=constants.js.map