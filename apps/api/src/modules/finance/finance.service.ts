import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getFinancialOverview() {
    const projects = await this.prisma.project.findMany({
      include: {
        costEntries: true,
      },
    });

    let totalContract = new Prisma.Decimal(0);
    let totalBudget = new Prisma.Decimal(0);
    let totalCommitted = new Prisma.Decimal(0);
    let totalActual = new Prisma.Decimal(0);

    const projectBreakdowns = projects.map(p => {
      totalContract = totalContract.plus(p.contractAmount);
      totalBudget = totalBudget.plus(p.budgetAmount);
      totalCommitted = totalCommitted.plus(p.committedCost);
      totalActual = totalActual.plus(p.actualCost);

      const margin = p.contractAmount.gt(0)
        ? p.contractAmount.minus(p.budgetAmount).dividedBy(p.contractAmount).times(100).toNumber()
        : 0;

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        clientName: p.clientName,
        contractAmount: p.contractAmount.toString(),
        budgetAmount: p.budgetAmount.toString(),
        committedCost: p.committedCost.toString(),
        actualCost: p.actualCost.toString(),
        marginRate: Math.round(margin * 10) / 10,
        costEntriesCount: p.costEntries.length,
      };
    });

    return {
      totals: {
        contractAmount: totalContract.toString(),
        budgetAmount: totalBudget.toString(),
        committedCost: totalCommitted.toString(),
        actualCost: totalActual.toString(),
        globalMarginRate: totalContract.gt(0)
          ? Math.round(totalContract.minus(totalBudget).dividedBy(totalContract).times(100).toNumber() * 10) / 10
          : 0,
      },
      projects: projectBreakdowns,
    };
  }

  async getProjectCostEntries(projectId: string) {
    return this.prisma.projectCostEntry.findMany({
      where: { projectId },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
