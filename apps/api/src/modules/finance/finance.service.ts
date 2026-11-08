import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SystemRole, UserSessionPayload } from '@silex/shared';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getFinancialOverview(user?: UserSessionPayload) {
    const where: Prisma.ProjectWhereInput = {};

    // Restriction aux chantiers assignés pour le chef de projet (ABAC)
    if (user?.role === SystemRole.RESPONSABLE_PROJET) {
      where.OR = [
        { assignedUsers: { some: { userId: user.userId } } },
        { managerId: user.userId },
      ];
    }

    const projects = await this.prisma.project.findMany({
      where,
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

  async getProjectCostEntries(projectId: string, user?: UserSessionPayload) {
    if (user?.role === SystemRole.RESPONSABLE_PROJET) {
      const assignment = await this.prisma.userProjectAssignment.findFirst({
        where: {
          userId: user.userId,
          OR: [{ projectId: projectId }, { project: { code: projectId } }],
        },
      });
      const isManager = await this.prisma.project.findFirst({
        where: {
          managerId: user.userId,
          OR: [{ id: projectId }, { code: projectId }],
        },
      });
      if (!assignment && !isManager) {
        throw new ForbiddenException("Accès refusé : vous n'êtes pas affecté au projet demandé.");
      }
    }

    return this.prisma.projectCostEntry.findMany({
      where: {
        OR: [{ projectId }, { project: { code: projectId } }],
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getCostDistribution() {
    const entries = await this.prisma.projectCostEntry.findMany();
    
    const categoryTotals: Record<string, number> = {
      'MATERIEL': 0,
      'MAIN_OEUVRE': 0,
      'SOUS_TRAITANCE': 0,
      'MATERIEL_LOCATIF': 0,
      'AUTRE': 0,
    };

    let grandTotal = 0;
    for (const e of entries) {
      const amt = Number(e.amount);
      const cat = categoryTotals[e.category] !== undefined ? e.category : 'AUTRE';
      categoryTotals[cat] += amt;
      grandTotal += amt;
    }

    const categoryLabels: Record<string, { label: string; color: string }> = {
      'MATERIEL': { label: 'Fournitures & Tuyauterie', color: '#142B45' },
      'MAIN_OEUVRE': { label: 'Main d’œuvre & Soudeurs', color: '#0A7F7C' },
      'MATERIEL_LOCATIF': { label: 'Matériel & Levage', color: '#D99B35' },
      'SOUS_TRAITANCE': { label: 'Sous-traitance & CND', color: '#203D5A' },
      'AUTRE': { label: 'Autres Frais Chantier', color: '#697789' },
    };

    if (grandTotal === 0) {
      return [
        { name: 'Fournitures & Tuyauterie', value: 40, amount: 0, color: '#142B45' },
        { name: 'Main d’œuvre & Soudeurs', value: 35, amount: 0, color: '#0A7F7C' },
        { name: 'Matériel & Levage', value: 15, amount: 0, color: '#D99B35' },
        { name: 'Sous-traitance & CND', value: 10, amount: 0, color: '#203D5A' },
      ];
    }

    return Object.entries(categoryTotals)
      .filter(([_, amt]) => amt > 0)
      .map(([cat, amt]) => ({
        name: categoryLabels[cat]?.label || cat,
        value: Math.round((amt / grandTotal) * 100),
        amount: amt,
        color: categoryLabels[cat]?.color || '#142B45',
      }));
  }

  async recordClientPayment(projectId: string, data: {
    situationId?: string;
    amountTTC?: number;
    amount?: number;
    paymentRef?: string;
    paymentReference?: string;
    paymentMethod?: string;
    bankName?: string;
    notes?: string;
  }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { workSituations: true },
    });
    if (!project) throw new Error('Projet introuvable');

    const paymentAmount = Number(data.amount !== undefined ? data.amount : (data.amountTTC !== undefined ? data.amountTTC : 0));
    const paymentRef = data.paymentReference || data.paymentRef || `VIR-DZ-${Date.now().toString().slice(-4)}`;

    return this.prisma.$transaction(async tx => {
      // Si une situation est liée, la marquer avec la mention d'encaissement
      if (data.situationId) {
        await tx.workSituation.update({
          where: { id: data.situationId },
          data: {
            notes: `${data.notes || ''} | Encaissé: ${paymentAmount} DA le ${new Date().toLocaleDateString('fr-DZ')} (Réf: ${paymentRef})`,
          },
        });
      }

      // Mise à jour de l'avancement financier
      const contractTotal = Number(project.contractAmount);
      let newFinancial = project.financialProgress || 0;
      if (contractTotal > 0) {
        const currentPaid = (contractTotal * ((project.financialProgress || 0) / 100)) + paymentAmount;
        newFinancial = Math.min(100, Math.round((currentPaid / contractTotal) * 1000) / 10);
      }

      const updated = await tx.project.update({
        where: { id: projectId },
        data: {
          financialProgress: newFinancial,
        },
      });

      return {
        success: true,
        project: updated,
        payment: {
          reference: paymentRef,
          amountTTC: paymentAmount,
          date: new Date().toISOString(),
          bank: data.bankName || '',
        },
      };
    });
  }

  async releaseWarrantyRetention(projectId: string, data: {
    amount?: number;
    releasedAmount?: number;
    receptionRef?: string;
    releaseReference?: string;
    notes?: string;
  }) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Projet introuvable');

    const defaultRetention = Number(project.contractAmount) * 0.05;
    const finalAmount = Number(data.amount !== undefined ? data.amount : (data.releasedAmount !== undefined ? data.releasedAmount : defaultRetention));
    const ref = data.receptionRef || data.releaseReference || 'PV-RD-2026';

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        description: `${project.description || ''} | [GARANTIE RESTITUÉE] ${finalAmount} DA libérés suite à PV Réception Définitive: ${ref} (${new Date().toLocaleDateString('fr-DZ')})`,
      },
    });

    return {
      success: true,
      releasedAmount: finalAmount,
      contractAmount: Number(project.contractAmount),
      project: updated,
    };
  }
}
