import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload, PurchaseRequestStatus } from '@silex/shared';
import { CreatePurchaseRequestDto, AddSupplierQuoteDto, ApprovePurchaseRequestDto } from '@silex/contracts';

@Controller('procurement')
@UseGuards(JwtAuthGuard)
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
  async createPurchaseRequest(
    @Body() body: CreatePurchaseRequestDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.createPurchaseRequest(body, user);
  }

  @Post('quotes')
  async addSupplierQuote(
    @Body() body: AddSupplierQuoteDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.addSupplierQuote(body, user);
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
  async approvePurchaseRequest(
    @Param('id') id: string,
    @Body() body: ApprovePurchaseRequestDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.procurementService.approvePurchaseRequest(id, body, user);
  }

  @Get('purchase-orders')
  async getPurchaseOrders(@CurrentUser() user: UserSessionPayload) {
    return this.procurementService.getPurchaseOrders(user);
  }
}
