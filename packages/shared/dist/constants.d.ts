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
//# sourceMappingURL=constants.d.ts.map