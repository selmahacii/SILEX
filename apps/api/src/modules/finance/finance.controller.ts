import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole, UserSessionPayload } from '@silex/shared';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('overview')
  @Roles(
    SystemRole.RESPONSABLE_FINANCIER,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
    SystemRole.RESPONSABLE_PROJET,
    SystemRole.RESPONSABLE_ACHATS,
    SystemRole.RESPONSABLE_MAINTENANCE,
  )
  async getOverview(@CurrentUser() user: UserSessionPayload) {
    return this.financeService.getFinancialOverview(user);
  }

  @Get('distribution')
  async getDistribution() {
    return this.financeService.getCostDistribution();
  }

  @Get('projects/:projectId/costs')
  @Roles(
    SystemRole.RESPONSABLE_FINANCIER,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
    SystemRole.RESPONSABLE_PROJET,
  )
  async getProjectCostEntries(
    @Param('projectId') projectId: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.financeService.getProjectCostEntries(projectId, user);
  }

  @Post('payments')
  @Roles(
    SystemRole.RESPONSABLE_FINANCIER,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
  )
  async recordClientPayment(
    @Body() body: {
      projectId: string;
      situationId?: string;
      amountTTC: number;
      paymentRef: string;
      paymentMethod?: string;
      bankName?: string;
      notes?: string;
    },
  ) {
    return this.financeService.recordClientPayment(body.projectId, body);
  }

  @Post('warranty-release')
  @Roles(
    SystemRole.RESPONSABLE_FINANCIER,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
  )
  async releaseWarrantyRetention(
    @Body() body: {
      projectId: string;
      amount: number;
      receptionRef: string;
      notes?: string;
    },
  ) {
    return this.financeService.releaseWarrantyRetention(body.projectId, body);
  }
}
