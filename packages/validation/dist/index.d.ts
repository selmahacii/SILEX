import { z } from 'zod';
import { SystemRole } from '@silex/shared';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const demoSwitchSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof SystemRole>;
}, "strip", z.ZodTypeAny, {
    role: SystemRole;
}, {
    role: SystemRole;
}>;
export declare const createPurchaseRequestLineSchema: z.ZodObject<{
    itemId: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    technicalSpecs: z.ZodOptional<z.ZodString>;
    estimatedUnitPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    itemId: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
    technicalSpecs?: string | undefined;
}, {
    itemId: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
    technicalSpecs?: string | undefined;
}>;
export declare const createPurchaseRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    urgencyLevel: z.ZodEnum<["NORMAL", "HIGH", "CRITICAL"]>;
    justification: z.ZodString;
    desiredDate: z.ZodString;
    suggestedSupplierId: z.ZodOptional<z.ZodString>;
    lines: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        technicalSpecs: z.ZodOptional<z.ZodString>;
        estimatedUnitPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        itemId: string;
        description: string;
        quantity: number;
        unit: string;
        estimatedUnitPrice: number;
        technicalSpecs?: string | undefined;
    }, {
        itemId: string;
        description: string;
        quantity: number;
        unit: string;
        estimatedUnitPrice: number;
        technicalSpecs?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    urgencyLevel: "NORMAL" | "HIGH" | "CRITICAL";
    justification: string;
    desiredDate: string;
    lines: {
        itemId: string;
        description: string;
        quantity: number;
        unit: string;
        estimatedUnitPrice: number;
        technicalSpecs?: string | undefined;
    }[];
    suggestedSupplierId?: string | undefined;
}, {
    projectId: string;
    urgencyLevel: "NORMAL" | "HIGH" | "CRITICAL";
    justification: string;
    desiredDate: string;
    lines: {
        itemId: string;
        description: string;
        quantity: number;
        unit: string;
        estimatedUnitPrice: number;
        technicalSpecs?: string | undefined;
    }[];
    suggestedSupplierId?: string | undefined;
}>;
export declare const addSupplierQuoteSchema: z.ZodObject<{
    purchaseRequestId: z.ZodString;
    supplierId: z.ZodString;
    totalAmountHT: z.ZodNumber;
    deliveryLeadTimeDays: z.ZodNumber;
    stockAvailability: z.ZodEnum<["IMMEDIATE", "PARTIAL", "ORDER_REQUIRED"]>;
    technicalCompliance: z.ZodBoolean;
    warrantyMonths: z.ZodNumber;
    paymentTerms: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    purchaseRequestId: string;
    supplierId: string;
    totalAmountHT: number;
    deliveryLeadTimeDays: number;
    stockAvailability: "IMMEDIATE" | "PARTIAL" | "ORDER_REQUIRED";
    technicalCompliance: boolean;
    warrantyMonths: number;
    paymentTerms: string;
    notes?: string | undefined;
}, {
    purchaseRequestId: string;
    supplierId: string;
    totalAmountHT: number;
    deliveryLeadTimeDays: number;
    stockAvailability: "IMMEDIATE" | "PARTIAL" | "ORDER_REQUIRED";
    technicalCompliance: boolean;
    warrantyMonths: number;
    paymentTerms: string;
    notes?: string | undefined;
}>;
export declare const approvePurchaseRequestSchema: z.ZodObject<{
    approvedQuoteId: z.ZodString;
    decisionNotes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    approvedQuoteId: string;
    decisionNotes: string;
}, {
    approvedQuoteId: string;
    decisionNotes: string;
}>;
export declare const receiveGoodsSchema: z.ZodObject<{
    purchaseOrderId: z.ZodString;
    warehouseId: z.ZodString;
    deliveryNoteNumber: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    lines: z.ZodArray<z.ZodObject<{
        purchaseOrderLineId: z.ZodString;
        quantityReceived: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        purchaseOrderLineId: string;
        quantityReceived: number;
    }, {
        purchaseOrderLineId: string;
        quantityReceived: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    lines: {
        purchaseOrderLineId: string;
        quantityReceived: number;
    }[];
    purchaseOrderId: string;
    warehouseId: string;
    deliveryNoteNumber: string;
    notes?: string | undefined;
}, {
    lines: {
        purchaseOrderLineId: string;
        quantityReceived: number;
    }[];
    purchaseOrderId: string;
    warehouseId: string;
    deliveryNoteNumber: string;
    notes?: string | undefined;
}>;
export declare const issueMaterialSchema: z.ZodObject<{
    projectId: z.ZodString;
    warehouseId: z.ZodString;
    itemId: z.ZodString;
    quantity: z.ZodNumber;
    workZone: z.ZodOptional<z.ZodString>;
    recipientEmployeeId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    itemId: string;
    quantity: number;
    projectId: string;
    warehouseId: string;
    recipientEmployeeId: string;
    notes?: string | undefined;
    workZone?: string | undefined;
}, {
    itemId: string;
    quantity: number;
    projectId: string;
    warehouseId: string;
    recipientEmployeeId: string;
    notes?: string | undefined;
    workZone?: string | undefined;
}>;
//# sourceMappingURL=index.d.ts.map