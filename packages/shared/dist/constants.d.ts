import { SystemRole, DepartmentCode } from './enums.js';
export declare const APP_NAME = "SILEX ERP";
export declare const APP_SUBTITLE = "Industrial Project & Operations Management Platform";
export declare const COMPANY_NAME = "SILEX SERVICES";
export declare const COMPANY_ESTABLISHED = "Septembre 2015";
export declare const COMPANY_DESCRIPTION = "Entreprise sp\u00E9cialis\u00E9e dans les prestations industrielles, la maintenance et l\u2019accompagnement de projets sur l\u2019ensemble du territoire alg\u00E9rien.";
export declare const CURRENCY = "DA";
export declare const TIMEZONE = "Africa/Algiers";
export declare const LOCALE = "fr-DZ";
export declare const COLORS: {
    silexBlue: string;
    silexBlueDark: string;
    silexBlueLight: string;
    silexRed: string;
    silexRedLight: string;
    navyPrimary: string;
    navySecondary: string;
    teal: string;
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    warning: string;
    danger: string;
    success: string;
};
export declare const SILEX_DOMAINS: readonly [{
    readonly id: "accompagnement-projets";
    readonly title: "Accompagnement et réalisation de projets";
    readonly shortTitle: "Accompagnement Projets";
    readonly description: "Pilotage clé en main, gestion des délais, ordonnancement et respect strict des engagements QCD (Qualité-Coûts-Délais).";
    readonly color: "#0B207D";
    readonly tag: "Management Projets";
}, {
    readonly id: "electricite-instrumentation";
    readonly title: "Électricité & instrumentation";
    readonly shortTitle: "Électricité & Instrumentation";
    readonly description: "Câblage industriel, armoires de distribution, automatismes, étalonnage de capteurs et boucles de régulation.";
    readonly color: "#0B207D";
    readonly tag: "Électricité & Process";
}, {
    readonly id: "froid-industriel";
    readonly title: "Froid industriel";
    readonly shortTitle: "Froid Industriel & HVAC";
    readonly description: "Installations frigorifiques industrielles, centrales de froid, climatisation technique et réseaux de fluide frigorigène.";
    readonly color: "#0B207D";
    readonly tag: "HVAC & Réfrigération";
}, {
    readonly id: "tuyauterie-chaudronnerie-isolation";
    readonly title: "Tuyauterie chaudronnerie & isolation";
    readonly shortTitle: "Tuyauterie & Chaudronnerie";
    readonly description: "Préfabrication, montage tuyauteries acier/inox HP, soudage certifié ASME IX/ISO 9606, calorifugeage et épreuves 150 bars.";
    readonly color: "#E51A1A";
    readonly tag: "Tuyauterie & Soudage";
}, {
    readonly id: "maintenance-industrielle";
    readonly title: "Maintenance industrielle";
    readonly shortTitle: "Maintenance Industrielle";
    readonly description: "Arrêts techniques programmés, révision de machines tournantes, maintenance préventive et interventions d’urgence.";
    readonly color: "#E51A1A";
    readonly tag: "Maintenance & Arrêts";
}];
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
export declare const DEMO_PROFILES: Record<SystemRole, DemoProfile>;
export interface SoDRuleDefinition {
    type: string;
    sourceConfig: string;
    lowerThresholdDA: number;
    upperThresholdDA: number;
    baseAmount: 'HT' | 'TTC';
    pmLevel: string;
    procurementLevel: string;
    dafLevel: string;
    dgLevel: string;
    budgetExceededRule: string;
    selfApprovalForbidden: boolean;
    dualValidationRequired: boolean;
}
export declare const SILEX_SOD_RULES: {
    readonly PURCHASE_REQUEST: {
        readonly TIER_1_MAX_DA: 100000;
        readonly TIER_2_MAX_DA: 500000;
        readonly DG_MANDATORY_THRESHOLD_DA: 500000;
        readonly budgetExceededForcesDG: true;
        readonly selfApprovalAllowed: false;
    };
    readonly SUPPLIER_INVOICE: {
        readonly AUTO_APPROVE_MAX_DA: 500000;
        readonly PM_APPROVAL_MAX_DA: 2000000;
        readonly DG_APPROVAL_THRESHOLD_DA: 2000000;
        readonly priceTolerancePct: 0.5;
        readonly priceToleranceAbsoluteDA: 100;
        readonly selfApprovalAllowed: false;
    };
    readonly WORK_SITUATION: {
        readonly RETENTION_GUARANTEE_PCT: 5;
        readonly WARRANTY_RELEASE_ROLE: SystemRole.DIRECTEUR_GENERAL;
        readonly selfApprovalAllowed: false;
    };
    readonly COST_SHEET: {
        readonly DG_APPROVAL_MANDATORY: true;
        readonly selfApprovalAllowed: false;
    };
};
export declare function getRequiredPrApprovalLevel(amountHT: number, budgetExceeded?: boolean): 'RESPONSABLE_ACHATS' | 'RESPONSABLE_PROJET_ET_ACHATS' | 'DIRECTEUR_GENERAL';
export declare function getRequiredSupplierInvoiceApprovalLevel(amountHT: number, isMatched?: boolean): 'AUTO_APPROVED' | 'PENDING_PM' | 'PENDING_DG';
export declare function isSelfApprovalForbidden(initiatorId?: string, approverId?: string): boolean;
//# sourceMappingURL=constants.d.ts.map