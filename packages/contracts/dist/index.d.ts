import { SystemRole, DepartmentCode, ProjectStatus, ProjectRiskLevel, IndustrialSector } from '@silex/shared';
export interface LoginRequestDto {
    email: string;
    password: string;
}
export interface DemoSwitchUserRequestDto {
    role: SystemRole;
}
export interface AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: SystemRole;
        departmentCode: DepartmentCode;
        assignedProjectCodes?: string[];
        permissions: string[];
    };
}
export interface ProjectSummaryDto {
    id: string;
    code: string;
    name: string;
    clientName: string;
    sector: IndustrialSector;
    managerName: string;
    managerId: string;
    startDate: string;
    contractEndDate: string;
    contractAmount: string;
    budgetAmount: string;
    committedCost: string;
    actualCost: string;
    physicalProgress: number;
    financialProgress: number;
    status: ProjectStatus;
    riskLevel: ProjectRiskLevel;
}
export interface CreatePurchaseRequestLineDto {
    itemId: string;
    description: string;
    quantity: number;
    unit: string;
    technicalSpecs?: string;
    estimatedUnitPrice: number;
}
export interface CreatePurchaseRequestDto {
    projectId: string;
    urgencyLevel: 'NORMAL' | 'HIGH' | 'CRITICAL';
    justification: string;
    desiredDate: string;
    suggestedSupplierId?: string;
    lines: CreatePurchaseRequestLineDto[];
}
export interface AddSupplierQuoteLineDto {
    purchaseRequestLineId: string;
    unitPrice: number;
    notes?: string;
}
export interface AddSupplierQuoteDto {
    purchaseRequestId: string;
    supplierId: string;
    totalAmountHT: number;
    deliveryLeadTimeDays: number;
    stockAvailability: 'IMMEDIATE' | 'PARTIAL' | 'ORDER_REQUIRED';
    technicalCompliance: boolean;
    warrantyMonths: number;
    paymentTerms: string;
    notes?: string;
    lines: AddSupplierQuoteLineDto[];
}
export interface ApprovePurchaseRequestDto {
    approvedQuoteId: string;
    decisionNotes: string;
}
export interface ReceiveGoodsLineDto {
    purchaseOrderLineId: string;
    quantityReceived: number;
}
export interface ReceiveGoodsDto {
    purchaseOrderId: string;
    warehouseId: string;
    deliveryNoteNumber: string;
    notes?: string;
    lines: ReceiveGoodsLineDto[];
}
export interface IssueMaterialToProjectDto {
    projectId: string;
    warehouseId: string;
    itemId: string;
    quantity: number;
    workZone?: string;
    recipientEmployeeId: string;
    notes?: string;
}
export interface CreateUserDto {
    name: string;
    email: string;
    role: SystemRole;
    departmentCode: DepartmentCode;
    title?: string;
    password?: string;
}
export interface DashboardKPIDto {
    activeProjectsCount: number;
    completedProjectsCount: number;
    delayedProjectsCount: number;
    totalTurnover: string;
    totalProjectBudgets: string;
    totalCommittedCosts: string;
    totalActualCosts: string;
    projectedMarginRate: number;
    clientReceivables: string;
    supplierPayables: string;
    monthlyExpenditure: string;
    pendingApprovalsCount: number;
}
//# sourceMappingURL=index.d.ts.map