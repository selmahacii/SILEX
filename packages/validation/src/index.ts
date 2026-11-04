import { z } from 'zod';
import { SystemRole } from '@silex/shared';

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères').optional(),
});

export const demoSwitchSchema = z.object({
  role: z.nativeEnum(SystemRole),
});

export const createPurchaseRequestLineSchema = z.object({
  itemId: z.string().min(1, "L'article est requis"),
  description: z.string().min(2, 'La désignation est requise'),
  quantity: z.number().positive('La quantité doit être supérieure à 0'),
  unit: z.string().min(1, "L'unité est requise"),
  technicalSpecs: z.string().optional(),
  estimatedUnitPrice: z.number().nonnegative('Le prix unitaire doit être positif ou nul'),
});

export const createPurchaseRequestSchema = z.object({
  projectId: z.string().min(1, 'Le projet est requis'),
  urgencyLevel: z.enum(['NORMAL', 'HIGH', 'CRITICAL']),
  justification: z.string().min(5, 'Une justification détaillée est obligatoire'),
  desiredDate: z.string().min(1, 'La date souhaitée est obligatoire'),
  suggestedSupplierId: z.string().optional(),
  lines: z.array(createPurchaseRequestLineSchema).min(1, 'Au moins un article est requis dans la demande'),
});

export const addSupplierQuoteSchema = z.object({
  purchaseRequestId: z.string().min(1, 'La demande d’achat est requise'),
  supplierId: z.string().min(1, 'Le fournisseur est requis'),
  totalAmountHT: z.number().positive('Le montant total doit être supérieur à 0'),
  deliveryLeadTimeDays: z.number().int().nonnegative('Le délai en jours doit être positif'),
  stockAvailability: z.enum(['IMMEDIATE', 'PARTIAL', 'ORDER_REQUIRED']),
  technicalCompliance: z.boolean(),
  warrantyMonths: z.number().int().nonnegative(),
  paymentTerms: z.string().min(1, 'Les conditions de paiement sont requises'),
  notes: z.string().optional(),
});

export const approvePurchaseRequestSchema = z.object({
  approvedQuoteId: z.string().min(1, "L'offre sélectionnée est requise"),
  decisionNotes: z.string().min(3, "Une note ou justification d'arbitrage est requise"),
});

export const receiveGoodsSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Le bon de commande est requis'),
  warehouseId: z.string().min(1, 'Le magasin de destination est requis'),
  deliveryNoteNumber: z.string().min(2, 'Le numéro de bon de livraison fournisseur est requis'),
  notes: z.string().optional(),
  lines: z.array(
    z.object({
      purchaseOrderLineId: z.string().min(1),
      quantityReceived: z.number().positive('La quantité reçue doit être positive'),
    })
  ).min(1, 'Au moins une ligne reçue est requise'),
});

export const issueMaterialSchema = z.object({
  projectId: z.string().min(1, 'Le projet de destination est requis'),
  warehouseId: z.string().min(1, 'Le magasin source est requis'),
  itemId: z.string().min(1, "L'article est requis"),
  quantity: z.number().positive('La quantité doit être supérieure à 0'),
  workZone: z.string().optional(),
  recipientEmployeeId: z.string().min(1, 'Le collaborateur récepteur est requis'),
  notes: z.string().optional(),
});
