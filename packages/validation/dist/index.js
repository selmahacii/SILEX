"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueMaterialSchema = exports.receiveGoodsSchema = exports.approvePurchaseRequestSchema = exports.addSupplierQuoteSchema = exports.createPurchaseRequestSchema = exports.createPurchaseRequestLineSchema = exports.demoSwitchSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const shared_1 = require("@silex/shared");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Adresse email invalide'),
    password: zod_1.z
        .string({ required_error: 'Le mot de passe est obligatoire' })
        .min(1, 'Le mot de passe ne peut pas être vide')
        .min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});
exports.demoSwitchSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(shared_1.SystemRole),
});
exports.createPurchaseRequestLineSchema = zod_1.z.object({
    itemId: zod_1.z.string().min(1, "L'article est requis"),
    description: zod_1.z.string().min(2, 'La désignation est requise'),
    quantity: zod_1.z.number().positive('La quantité doit être supérieure à 0'),
    unit: zod_1.z.string().min(1, "L'unité est requise"),
    technicalSpecs: zod_1.z.string().optional(),
    estimatedUnitPrice: zod_1.z.number().nonnegative('Le prix unitaire doit être positif ou nul'),
});
exports.createPurchaseRequestSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Le projet est requis'),
    urgencyLevel: zod_1.z.enum(['NORMAL', 'HIGH', 'CRITICAL']),
    justification: zod_1.z.string().min(5, 'Une justification détaillée est obligatoire'),
    desiredDate: zod_1.z.string().min(1, 'La date souhaitée est obligatoire'),
    suggestedSupplierId: zod_1.z.string().optional(),
    lines: zod_1.z.array(exports.createPurchaseRequestLineSchema).min(1, 'Au moins un article est requis dans la demande'),
});
exports.addSupplierQuoteSchema = zod_1.z.object({
    purchaseRequestId: zod_1.z.string().min(1, 'La demande d’achat est requise'),
    supplierId: zod_1.z.string().min(1, 'Le fournisseur est requis'),
    totalAmountHT: zod_1.z.number().positive('Le montant total doit être supérieur à 0'),
    deliveryLeadTimeDays: zod_1.z.number().int().nonnegative('Le délai en jours doit être positif'),
    stockAvailability: zod_1.z.enum(['IMMEDIATE', 'PARTIAL', 'ORDER_REQUIRED']),
    technicalCompliance: zod_1.z.boolean(),
    warrantyMonths: zod_1.z.number().int().nonnegative(),
    paymentTerms: zod_1.z.string().min(1, 'Les conditions de paiement sont requises'),
    notes: zod_1.z.string().optional(),
});
exports.approvePurchaseRequestSchema = zod_1.z.object({
    approvedQuoteId: zod_1.z.string().min(1, "L'offre sélectionnée est requise"),
    decisionNotes: zod_1.z.string().min(3, "Une note ou justification d'arbitrage est requise"),
});
exports.receiveGoodsSchema = zod_1.z.object({
    purchaseOrderId: zod_1.z.string().min(1, 'Le bon de commande est requis'),
    warehouseId: zod_1.z.string().min(1, 'Le magasin de destination est requis'),
    deliveryNoteNumber: zod_1.z.string().min(2, 'Le numéro de bon de livraison fournisseur est requis'),
    notes: zod_1.z.string().optional(),
    lines: zod_1.z.array(zod_1.z.object({
        purchaseOrderLineId: zod_1.z.string().min(1),
        quantityReceived: zod_1.z.number().positive('La quantité reçue doit être positive'),
    })).min(1, 'Au moins une ligne reçue est requise'),
});
exports.issueMaterialSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Le projet de destination est requis'),
    warehouseId: zod_1.z.string().min(1, 'Le magasin source est requis'),
    itemId: zod_1.z.string().min(1, "L'article est requis"),
    quantity: zod_1.z.number().positive('La quantité doit être supérieure à 0'),
    workZone: zod_1.z.string().optional(),
    recipientEmployeeId: zod_1.z.string().min(1, 'Le collaborateur récepteur est requis'),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map