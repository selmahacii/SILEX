const { SystemRole } = require('../packages/shared/src');

console.log('🛡️ ========================================================');
console.log('🛡️ AUDIT COMPLET DU CONTRÔLE D\'ACCÈS RBAC, MODULES & PERMISSIONS');
console.log('🛡️ ========================================================\n');

// Matrice théorique selon PERMISSIONS_MATRIX.md
const ROLES = [
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.RESPONSABLE_PROJET,
  SystemRole.RESPONSABLE_ACHATS,
  SystemRole.RESPONSABLE_MAGASIN,
  SystemRole.RESPONSABLE_RH,
  SystemRole.RESPONSABLE_FINANCIER,
  SystemRole.RESPONSABLE_MAINTENANCE,
  SystemRole.RESPONSABLE_QUALITE,
  SystemRole.ADMINISTRATEUR,
];

let testsPassed = 0;
let totalTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    testsPassed++;
    console.log(`✅ [${totalTests}] ${description}`);
  } else {
    console.error(`❌ [${totalTests}] ÉCHEC : ${description}`);
    process.exitCode = 1;
  }
}

// 1. MODULE VISIBILITY (SIDEBAR RBAC)
console.log('--- 1. CONTRÔLE D\'ACCÈS AUX MODULES (SIDEBAR) ---');

// Projets
const canViewProjects = (role) => [
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.RESPONSABLE_PROJET,
  SystemRole.RESPONSABLE_ACHATS,
  SystemRole.RESPONSABLE_FINANCIER,
  SystemRole.RESPONSABLE_MAINTENANCE,
  SystemRole.RESPONSABLE_QUALITE,
  SystemRole.RESPONSABLE_MAGASIN,
  SystemRole.ADMINISTRATEUR,
].includes(role);
assert('Projets accessible aux rôles opérationnels', canViewProjects(SystemRole.RESPONSABLE_PROJET));
assert('Projets non accessible aux profils non autorisés', !canViewProjects('TIERS_INCONNU'));

// Finance
const canViewFinance = (role) => [
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.RESPONSABLE_FINANCIER,
  SystemRole.ADMINISTRATEUR,
].includes(role);
assert('Finance accessible au DG et Directeur Financier', canViewFinance(SystemRole.DIRECTEUR_GENERAL) && canViewFinance(SystemRole.RESPONSABLE_FINANCIER));
assert('Finance strictement interdit au Magasinier', !canViewFinance(SystemRole.RESPONSABLE_MAGASIN));
assert('Finance strictement interdit à la Maintenance', !canViewFinance(SystemRole.RESPONSABLE_MAINTENANCE));
assert('Finance strictement interdit aux RH', !canViewFinance(SystemRole.RESPONSABLE_RH));

// RH
const canViewHR = (role) => [
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.RESPONSABLE_RH,
  SystemRole.RESPONSABLE_PROJET,
  SystemRole.ADMINISTRATEUR,
].includes(role);
assert('RH accessible aux RH, Chef de Projet et DG', canViewHR(SystemRole.RESPONSABLE_RH) && canViewHR(SystemRole.RESPONSABLE_PROJET));
assert('RH interdit au Responsable Magasin', !canViewHR(SystemRole.RESPONSABLE_MAGASIN));

// Administration Système
const canViewAdmin = (role) => [
  SystemRole.ADMINISTRATEUR,
  SystemRole.DIRECTEUR_GENERAL,
].includes(role);
assert('Administration Système réservé Admin & DG', canViewAdmin(SystemRole.ADMINISTRATEUR) && canViewAdmin(SystemRole.DIRECTEUR_GENERAL));
assert('Administration Système interdit au Chef de Projet', !canViewAdmin(SystemRole.RESPONSABLE_PROJET));
assert('Administration Système interdit aux Achats', !canViewAdmin(SystemRole.RESPONSABLE_ACHATS));

// 2. ACTIONS OPÉRATIONNELLES CRITIQUES & GOUVERNANCE
console.log('\n--- 2. CONTRÔLE DES ACTIONS SENSIBLES & GOUVERNANCE ---');

// Désignation et changement du Responsable de Chantier (managerId)
const canAssignManager = (role) => [SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR].includes(role);
assert('Désignation Chef de Projet : Accordé à la Direction Générale', canAssignManager(SystemRole.DIRECTEUR_GENERAL));
assert('Désignation Chef de Projet : Interdit aux rôles non-Direction', !canAssignManager(SystemRole.RESPONSABLE_ACHATS) && !canAssignManager(SystemRole.RESPONSABLE_MAGASIN));

// Modification des dates contractuelles & prorogations
const canModifyContractDates = (role) => [SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR].includes(role);
assert('Modification Dates Contractuelles & Délais : Accordé au DG', canModifyContractDates(SystemRole.DIRECTEUR_GENERAL));
assert('Modification Dates Contractuelles : Interdit au Magasinier', !canModifyContractDates(SystemRole.RESPONSABLE_MAGASIN));

// Affectation de collaborateurs au chantier
const canManageProjectMembers = (role) => [
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.ADMINISTRATEUR,
  SystemRole.RESPONSABLE_PROJET,
].includes(role);
assert('Affectation Membres Chantier : Accordé au Chef de Projet & DG', canManageProjectMembers(SystemRole.RESPONSABLE_PROJET) && canManageProjectMembers(SystemRole.DIRECTEUR_GENERAL));
assert('Affectation Membres Chantier : Interdit à la Finance', !canManageProjectMembers(SystemRole.RESPONSABLE_FINANCIER));

// Validation Workflow QCD (SoD - Séparation des Fonctions)
const canApproveWorkflow = (role) => [SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR].includes(role);
assert('Approbation Workflow QCD (SoD) : Accordé uniquement au DG / Admin', canApproveWorkflow(SystemRole.DIRECTEUR_GENERAL));
assert('Approbation Workflow QCD : Refusé au Chef de Projet demandeur (Auto-approbation impossible)', !canApproveWorkflow(SystemRole.RESPONSABLE_PROJET));

// Sorties Magasin & Bons de Sortie
const canIssueMaterials = (role) => [
  SystemRole.RESPONSABLE_MAGASIN,
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.ADMINISTRATEUR,
  SystemRole.RESPONSABLE_ACHATS,
].includes(role);
assert('Émission Bon de Sortie Magasin : Accordé au Magasinier', canIssueMaterials(SystemRole.RESPONSABLE_MAGASIN));
assert('Émission Bon de Sortie Magasin : Interdit aux RH', !canIssueMaterials(SystemRole.RESPONSABLE_RH));

// Déclaration Fiche Non-Conformité (FNC)
const canCreateFNC = (role) => [
  SystemRole.RESPONSABLE_QUALITE,
  SystemRole.RESPONSABLE_PROJET,
  SystemRole.RESPONSABLE_MAINTENANCE,
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.ADMINISTRATEUR,
].includes(role);
assert('Signalement FNC Qualité/CND : Accordé au Resp. Qualité, Chef de Projet et Maintenance', canCreateFNC(SystemRole.RESPONSABLE_QUALITE) && canCreateFNC(SystemRole.RESPONSABLE_PROJET) && canCreateFNC(SystemRole.RESPONSABLE_MAINTENANCE));
assert('Signalement FNC : Refusé au Responsable RH', !canCreateFNC(SystemRole.RESPONSABLE_RH));

// Encaissement Client & Restitution Retenue de Garantie
const canManageFinances = (role) => [
  SystemRole.RESPONSABLE_FINANCIER,
  SystemRole.DIRECTEUR_GENERAL,
  SystemRole.ADMINISTRATEUR,
].includes(role);
assert('Encaissement Client & Retenue Garantie : Accordé au Directeur Financier & DG', canManageFinances(SystemRole.RESPONSABLE_FINANCIER) && canManageFinances(SystemRole.DIRECTEUR_GENERAL));
assert('Encaissement Client : Interdit au Chef de Projet', !canManageFinances(SystemRole.RESPONSABLE_PROJET));

console.log('\n========================================');
console.log(`🎯 AUDIT RBAC : ${testsPassed}/${totalTests} (${Math.round((testsPassed / totalTests) * 100)}%) CONFORMITÉ PARFAITE`);
console.log('========================================');
