import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('overview')
  async getOverview() {
    return this.financeService.getFinancialOverview();
  }

  @Get('projects/:projectId/costs')
  async getProjectCostEntries(@Param('projectId') projectId: string) {
    return this.financeService.getProjectCostEntries(projectId);
  }
}
