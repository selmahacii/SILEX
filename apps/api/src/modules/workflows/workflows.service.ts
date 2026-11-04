import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PurchaseRequestStatus, WorkSituationStatus } from '@silex/shared';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async getPendingValidations() {
    // 1. Demandes d'achat en attente d'approbation
    const pendingPRs = await this.prisma.purchaseRequest.findMany({
      where: {
        status: {
          in: [PurchaseRequestStatus.PENDING_APPROVAL, PurchaseRequestStatus.SUBMITTED],
        },
      },
      include: {
        project: { select: { id: true, code: true, name: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        quotes: {
          where: { isRecommended: true },
          include: { supplier: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Situations de travaux soumises
    const pendingSituations = await this.prisma.workSituation.findMany({
      where: {
        status: WorkSituationStatus.SUBMITTED,
      },
      include: {
        project: { select: { id: true, code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = [
      ...pendingPRs.map(pr => {
        const recommended = pr.quotes[0];
        return {
          id: pr.id,
          type: 'PURCHASE_REQUEST' as const,
          reference: pr.reference,
          title: `Demande d'achat matériel pour chantier ${pr.project.code}`,
          requesterName: pr.createdBy.name,
          department: 'Opérations & Projets',
          projectCode: pr.project.code,
          projectName: pr.project.name,
          amountHT: recommended ? recommended.totalAmountHT.toString() : pr.totalEstimatedAmount.toString(),
          urgencyLevel: pr.urgencyLevel,
          status: pr.status,
          date: pr.createdAt.toISOString(),
          recommendedSupplier: recommended ? recommended.supplier.name : undefined,
        };
      }),
      ...pendingSituations.map(sit => ({
        id: sit.id,
        type: 'WORK_SITUATION' as const,
        reference: sit.situationNumber,
        title: `Situation périodique de travaux ${sit.project.code}`,
        requesterName: 'Chef de Chantier',
        department: 'Direction Technique',
        projectCode: sit.project.code,
        projectName: sit.project.name,
        amountHT: sit.amountHT.toString(),
        urgencyLevel: 'NORMAL',
        status: sit.status,
        date: sit.createdAt.toISOString(),
      })),
    ];

    return {
      totalPending: items.length,
      items,
    };
  }
}
