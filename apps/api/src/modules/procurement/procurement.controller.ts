import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload, PurchaseRequestStatus, SystemRole } from '@silex/shared';
import { CreatePurchaseRequestDto, AddSupplierQuoteDto, ApprovePurchaseRequestDto } from '@silex/contracts';

@Controller('procurement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcurementController {
  constructor(private procurementService: ProcurementService) {}

  @Get('purchase-requests')
  async getPurchaseRequests(
    @CurrentUser() user: UserSessionPayload,
    @Query('status') status?: PurchaseRequestStatus,
  ) {
    return this.procurementService.getPurchaseRequests(user, status);
  }

  @Get('purchase-requests/:id')
  async getPurchaseRequestById(
    @Param('id') id: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.getPurchaseRequestById(id, user);
  }

  @Post('purchase-requests')
  @Roles(
    SystemRole.RESPONSABLE_PROJET,
    SystemRole.RESPONSABLE_ACHATS,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
  )
  async createPurchaseRequest(
    @Body() body: CreatePurchaseRequestDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.createPurchaseRequest(body, user);
  }

  @Post('quotes')
  @Roles(SystemRole.RESPONSABLE_ACHATS, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async addSupplierQuote(
    @Body() body: AddSupplierQuoteDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.addSupplierQuote(body, user);
  }

  @Post('purchase-requests/:prId/quotes')
  @Roles(SystemRole.RESPONSABLE_ACHATS, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async addSupplierQuoteForPR(
    @Param('prId') prId: string,
    @Body() body: AddSupplierQuoteDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.addSupplierQuote({ ...body, purchaseRequestId: prId }, user);
  }

  @Post('purchase-requests/:id/submit-approval')
  async submitForApproval(
    @Param('id') id: string,
    @Body('recommendedQuoteId') recommendedQuoteId: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.submitForApproval(id, recommendedQuoteId, user);
  }

  @Post('purchase-requests/:id/approve')
  @Roles(SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async approvePurchaseRequest(
    @Param('id') id: string,
    @Body() body: ApprovePurchaseRequestDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.approvePurchaseRequest(id, body, user);
  }

  @Patch('purchase-requests/:id')
  async updatePurchaseRequest(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.updatePurchaseRequest(id, body, user);
  }

  @Post('purchase-requests/:id/reject')
  @Roles(SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async rejectPurchaseRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.rejectPurchaseRequest(id, reason, user);
  }

  @Post('purchase-requests/:id/reexamine')
  @Roles(SystemRole.DIRECTEUR_GENERAL, SystemRole.RESPONSABLE_ACHATS, SystemRole.ADMINISTRATEUR)
  async reexaminePurchaseRequest(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.reexaminePurchaseRequest(id, notes, user);
  }

  @Patch('purchase-requests/:prId/quotes/:quoteId')
  @Roles(SystemRole.RESPONSABLE_ACHATS, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async updateQuoteVariant(
    @Param('prId') _prId: string,
    @Param('quoteId') quoteId: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.updateQuoteVariant(quoteId, body, user);
  }

  @Post('purchase-orders/:id/confirm')
  @Roles(SystemRole.RESPONSABLE_ACHATS, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async confirmPurchaseOrder(
    @Param('id') id: string,
    @Body() body: { supplierAcknowledgmentRef?: string; confirmedDeliveryDate?: string },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.confirmPurchaseOrder(id, body, user);
  }

  @Get('purchase-orders')
  async getPurchaseOrders(@CurrentUser() user: UserSessionPayload) {
    return this.procurementService.getPurchaseOrders(user);
  }

  @Get('suppliers')
  async getSuppliers() {
    return this.procurementService.getSuppliers();
  }

  @Post('suppliers')
  @Roles(SystemRole.RESPONSABLE_ACHATS, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async createSupplier(
    @Body() body: {
      code?: string;
      name: string;
      contactName: string;
      email: string;
      phone: string;
      address: string;
      specialties: string;
      taxId?: string;
    },
  ) {
    return this.procurementService.createSupplier(body);
  }
}
