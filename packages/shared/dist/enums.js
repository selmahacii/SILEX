"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalStatus = exports.NonConformityStatus = exports.NonConformitySeverity = exports.DocumentCategory = exports.MaintenanceStatus = exports.MaintenanceType = exports.AssetStatus = exports.AssetType = exports.WorkSituationStatus = exports.ServiceOrderStatus = exports.ServiceOrderType = exports.StockMovementType = exports.PurchaseOrderStatus = exports.PurchaseRequestStatus = exports.ProjectRiskLevel = exports.ProjectStatus = exports.IndustrialSector = exports.DepartmentCode = exports.SystemRole = void 0;
var SystemRole;
(function (SystemRole) {
    SystemRole["DIRECTEUR_GENERAL"] = "DIRECTEUR_GENERAL";
    SystemRole["RESPONSABLE_PROJET"] = "RESPONSABLE_PROJET";
    SystemRole["RESPONSABLE_ACHATS"] = "RESPONSABLE_ACHATS";
    SystemRole["RESPONSABLE_MAGASIN"] = "RESPONSABLE_MAGASIN";
    SystemRole["RESPONSABLE_RH"] = "RESPONSABLE_RH";
    SystemRole["RESPONSABLE_FINANCIER"] = "RESPONSABLE_FINANCIER";
    SystemRole["RESPONSABLE_MAINTENANCE"] = "RESPONSABLE_MAINTENANCE";
    SystemRole["RESPONSABLE_QUALITE"] = "RESPONSABLE_QUALITE";
    SystemRole["ADMINISTRATEUR"] = "ADMINISTRATEUR";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
var DepartmentCode;
(function (DepartmentCode) {
    DepartmentCode["DIRECTION_GENERALE"] = "DIRECTION_GENERALE";
    DepartmentCode["OPERATIONS_PROJETS"] = "OPERATIONS_PROJETS";
    DepartmentCode["ACHATS_LOGISTIQUE"] = "ACHATS_LOGISTIQUE";
    DepartmentCode["MAGASIN_STOCKS"] = "MAGASIN_STOCKS";
    DepartmentCode["RESSOURCES_HUMAINES"] = "RESSOURCES_HUMAINES";
    DepartmentCode["FINANCE_COMPTABILITE"] = "FINANCE_COMPTABILITE";
    DepartmentCode["PARC_MAINTENANCE"] = "PARC_MAINTENANCE";
    DepartmentCode["QHSE"] = "QHSE";
    DepartmentCode["INFORMATIQUE_ADMIN"] = "INFORMATIQUE_ADMIN";
})(DepartmentCode || (exports.DepartmentCode = DepartmentCode = {}));
var IndustrialSector;
(function (IndustrialSector) {
    IndustrialSector["OIL_AND_GAS"] = "OIL_AND_GAS";
    IndustrialSector["ENERGIE"] = "ENERGIE";
    IndustrialSector["AGROALIMENTAIRE"] = "AGROALIMENTAIRE";
    IndustrialSector["SIDERURGIE"] = "SIDERURGIE";
    IndustrialSector["CIMENTERIE"] = "CIMENTERIE";
    IndustrialSector["AUTRE_INDUSTRIE"] = "AUTRE_INDUSTRIE";
})(IndustrialSector || (exports.IndustrialSector = IndustrialSector = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "PLANNING";
    ProjectStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProjectStatus["ON_HOLD"] = "ON_HOLD";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectRiskLevel;
(function (ProjectRiskLevel) {
    ProjectRiskLevel["LOW"] = "LOW";
    ProjectRiskLevel["MEDIUM"] = "MEDIUM";
    ProjectRiskLevel["HIGH"] = "HIGH";
    ProjectRiskLevel["CRITICAL"] = "CRITICAL";
})(ProjectRiskLevel || (exports.ProjectRiskLevel = ProjectRiskLevel = {}));
var PurchaseRequestStatus;
(function (PurchaseRequestStatus) {
    PurchaseRequestStatus["DRAFT"] = "DRAFT";
    PurchaseRequestStatus["SUBMITTED"] = "SUBMITTED";
    PurchaseRequestStatus["PROCUREMENT_REVIEW"] = "PROCUREMENT_REVIEW";
    PurchaseRequestStatus["QUOTATION_IN_PROGRESS"] = "QUOTATION_IN_PROGRESS";
    PurchaseRequestStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    PurchaseRequestStatus["APPROVED"] = "APPROVED";
    PurchaseRequestStatus["PURCHASE_ORDER"] = "PURCHASE_ORDER";
    PurchaseRequestStatus["PARTIALLY_RECEIVED"] = "PARTIALLY_RECEIVED";
    PurchaseRequestStatus["RECEIVED"] = "RECEIVED";
    PurchaseRequestStatus["INVOICE_REVIEW"] = "INVOICE_REVIEW";
    PurchaseRequestStatus["CLOSED"] = "CLOSED";
    PurchaseRequestStatus["REJECTED"] = "REJECTED";
    PurchaseRequestStatus["CANCELLED"] = "CANCELLED";
})(PurchaseRequestStatus || (exports.PurchaseRequestStatus = PurchaseRequestStatus = {}));
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "DRAFT";
    PurchaseOrderStatus["ISSUED"] = "ISSUED";
    PurchaseOrderStatus["CONFIRMED"] = "CONFIRMED";
    PurchaseOrderStatus["PARTIALLY_RECEIVED"] = "PARTIALLY_RECEIVED";
    PurchaseOrderStatus["RECEIVED"] = "RECEIVED";
    PurchaseOrderStatus["INVOICED"] = "INVOICED";
    PurchaseOrderStatus["CANCELLED"] = "CANCELLED";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
var StockMovementType;
(function (StockMovementType) {
    StockMovementType["PURCHASE_RECEIPT"] = "PURCHASE_RECEIPT";
    StockMovementType["PROJECT_ISSUE"] = "PROJECT_ISSUE";
    StockMovementType["WAREHOUSE_TRANSFER"] = "WAREHOUSE_TRANSFER";
    StockMovementType["RETURN"] = "RETURN";
    StockMovementType["INVENTORY_ADJUSTMENT"] = "INVENTORY_ADJUSTMENT";
})(StockMovementType || (exports.StockMovementType = StockMovementType = {}));
var ServiceOrderType;
(function (ServiceOrderType) {
    ServiceOrderType["DEMARRAGE"] = "DEMARRAGE";
    ServiceOrderType["ARRET"] = "ARRET";
    ServiceOrderType["REPRISE"] = "REPRISE";
    ServiceOrderType["MODIFICATION_PERIMETRE"] = "MODIFICATION_PERIMETRE";
})(ServiceOrderType || (exports.ServiceOrderType = ServiceOrderType = {}));
var ServiceOrderStatus;
(function (ServiceOrderStatus) {
    ServiceOrderStatus["DRAFT"] = "DRAFT";
    ServiceOrderStatus["ISSUED"] = "ISSUED";
    ServiceOrderStatus["ACCEPTED"] = "ACCEPTED";
    ServiceOrderStatus["REJECTED"] = "REJECTED";
})(ServiceOrderStatus || (exports.ServiceOrderStatus = ServiceOrderStatus = {}));
var WorkSituationStatus;
(function (WorkSituationStatus) {
    WorkSituationStatus["DRAFT"] = "DRAFT";
    WorkSituationStatus["SUBMITTED"] = "SUBMITTED";
    WorkSituationStatus["VERIFIED"] = "VERIFIED";
    WorkSituationStatus["APPROVED"] = "APPROVED";
    WorkSituationStatus["REJECTED"] = "REJECTED";
    WorkSituationStatus["INVOICED"] = "INVOICED";
})(WorkSituationStatus || (exports.WorkSituationStatus = WorkSituationStatus = {}));
var AssetType;
(function (AssetType) {
    AssetType["VEHICULE"] = "VEHICULE";
    AssetType["ENGIN_LEVAGE"] = "ENGIN_LEVAGE";
    AssetType["MACHINE_OUTIL"] = "MACHINE_OUTIL";
    AssetType["POSTE_SOUDURE"] = "POSTE_SOUDURE";
    AssetType["GROUPE_ELECTROGENE"] = "GROUPE_ELECTROGENE";
    AssetType["EQUIPEMENT_HVAC"] = "EQUIPEMENT_HVAC";
})(AssetType || (exports.AssetType = AssetType = {}));
var AssetStatus;
(function (AssetStatus) {
    AssetStatus["OPERATIONAL"] = "OPERATIONAL";
    AssetStatus["MAINTENANCE"] = "MAINTENANCE";
    AssetStatus["OUT_OF_SERVICE"] = "OUT_OF_SERVICE";
    AssetStatus["DECOMMISSIONED"] = "DECOMMISSIONED";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "PREVENTIVE";
    MaintenanceType["CORRECTIVE"] = "CORRECTIVE";
})(MaintenanceType || (exports.MaintenanceType = MaintenanceType = {}));
var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["SCHEDULED"] = "SCHEDULED";
    MaintenanceStatus["IN_PROGRESS"] = "IN_PROGRESS";
    MaintenanceStatus["COMPLETED"] = "COMPLETED";
    MaintenanceStatus["CANCELLED"] = "CANCELLED";
})(MaintenanceStatus || (exports.MaintenanceStatus = MaintenanceStatus = {}));
var DocumentCategory;
(function (DocumentCategory) {
    DocumentCategory["CONTRAT"] = "CONTRAT";
    DocumentCategory["PROCEDURE"] = "PROCEDURE";
    DocumentCategory["INSTRUCTION"] = "INSTRUCTION";
    DocumentCategory["DOSSIER_TECHNIQUE"] = "DOSSIER_TECHNIQUE";
    DocumentCategory["DOCUMENT_CLIENT"] = "DOCUMENT_CLIENT";
    DocumentCategory["DOCUMENT_PROJET"] = "DOCUMENT_PROJET";
    DocumentCategory["DOCUMENT_FOURNISSEUR"] = "DOCUMENT_FOURNISSEUR";
    DocumentCategory["DOCUMENT_RH"] = "DOCUMENT_RH";
    DocumentCategory["DOCUMENT_QUALITE"] = "DOCUMENT_QUALITE";
})(DocumentCategory || (exports.DocumentCategory = DocumentCategory = {}));
var NonConformitySeverity;
(function (NonConformitySeverity) {
    NonConformitySeverity["MINEURE"] = "MINEURE";
    NonConformitySeverity["MAJEURE"] = "MAJEURE";
    NonConformitySeverity["CRITIQUE"] = "CRITIQUE";
})(NonConformitySeverity || (exports.NonConformitySeverity = NonConformitySeverity = {}));
var NonConformityStatus;
(function (NonConformityStatus) {
    NonConformityStatus["OPEN"] = "OPEN";
    NonConformityStatus["UNDER_INVESTIGATION"] = "UNDER_INVESTIGATION";
    NonConformityStatus["CORRECTIVE_ACTION_PENDING"] = "CORRECTIVE_ACTION_PENDING";
    NonConformityStatus["CLOSED"] = "CLOSED";
})(NonConformityStatus || (exports.NonConformityStatus = NonConformityStatus = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
    ApprovalStatus["CHANGES_REQUESTED"] = "CHANGES_REQUESTED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
//# sourceMappingURL=enums.js.map