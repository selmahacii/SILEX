import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProcurementService } from '../procurement/procurement.service';
import { PurchaseRequestStatus, WorkSituationStatus, UserSessionPayload, SystemRole } from '@silex/shared';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private procurementService: ProcurementService,
  ) {}

  async getPendingValidations() {
    // 1. Demandes d'achat en attente d'approbation
    const pendingPRs = await this.prisma.purchaseRequest.findMany({
      where: {
        status: {
          in: [PurchaseRequestStatus.PENDING_APPROVAL, PurchaseRequestStatus.SUBMITTED],
        },
      },
      include: {
        project: { select: { id: true, code: true, name: true, clientName: true, budgetAmount: true, committedCost: true } },
        createdBy: { select: { id: true, name: true, role: true, email: true } },
        lines: { include: { item: true } },
        quotes: {
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
        project: { select: { id: true, code: true, name: true, clientName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = [
      ...pendingPRs.map(pr => {
        const recommended = pr.quotes.find(q => q.isRecommended) || pr.quotes[0];
        const prTotalHT = recommended ? Number(recommended.totalAmountHT) : Number(pr.totalEstimatedAmount || 0);

        return {
          id: pr.id,
          type: 'PURCHASE_REQUEST' as const,
          reference: pr.reference,
          title: `Demande d'achat matériel pour chantier ${pr.project.code}`,
          requesterName: pr.createdBy.name,
          department: 'Opérations & Projets',
          projectCode: pr.project.code,
          projectName: pr.project.name,
          clientName: pr.project.clientName,
          projectBudget: pr.project.budgetAmount ? pr.project.budgetAmount.toString() : '0',
          projectCommitted: pr.project.committedCost ? pr.project.committedCost.toString() : '0',
          amountHT: prTotalHT.toString(),
          urgencyLevel: pr.urgencyLevel,
          status: pr.status,
          date: pr.createdAt.toISOString(),
          justification: pr.justification,
          desiredDate: pr.desiredDate ? pr.desiredDate.toISOString() : undefined,
          lines: pr.lines.map(l => ({
            id: l.id,
            description: l.description,
            quantity: Number(l.quantity),
            unit: l.unit,
            unitPrice: Number(l.estimatedUnitPrice),
            subtotal: Math.round(Number(l.quantity) * Number(l.estimatedUnitPrice)),
            technicalSpecs: l.technicalSpecs,
            itemCode: l.item?.code,
          })),
          quotes: pr.quotes.map(q => ({
            id: q.id,
            quoteReference: q.quoteReference,
            supplierName: q.supplier.name,
            supplierContact: q.supplier.contactName,
            supplierPhone: q.supplier.phone,
            totalAmountHT: Number(q.totalAmountHT),
            deliveryLeadTimeDays: q.deliveryLeadTimeDays,
            paymentTerms: q.paymentTerms,
            warrantyMonths: q.warrantyMonths,
            notes: q.notes,
            isRecommended: q.isRecommended,
          })),
          recommendedSupplier: recommended ? recommended.supplier.name : undefined,
          recommendedQuote: recommended ? {
            id: recommended.id,
            totalAmountHT: Number(recommended.totalAmountHT),
            deliveryLeadTimeDays: recommended.deliveryLeadTimeDays,
            paymentTerms: recommended.paymentTerms,
            warrantyMonths: recommended.warrantyMonths,
            notes: recommended.notes,
          } : undefined,
        };
      }),
      ...pendingSituations.map(sit => {
        const sitAmountHT = Number(sit.amountHT || 0);
        const sitTva = Math.round(sitAmountHT * 0.19);
        const sitRetenueGarantie = Math.round(sitAmountHT * 0.05);
        const sitNetTTC = sitAmountHT + sitTva - sitRetenueGarantie;

        return {
          id: sit.id,
          type: 'WORK_SITUATION' as const,
          reference: sit.situationNumber,
          title: `Situation périodique de travaux ${sit.project.code}`,
          requesterName: 'Chef de Chantier',
          department: 'Direction Technique',
          projectCode: sit.project.code,
          projectName: sit.project.name,
          clientName: sit.project.clientName,
          amountHT: sit.amountHT.toString(),
          vatAmount: sitTva,
          warrantyRetention: sitRetenueGarantie,
          netToPayTTC: sitNetTTC,
          notes: sit.notes,
          urgencyLevel: 'NORMAL',
          status: sit.status,
          date: sit.createdAt.toISOString(),
        };
      }),
    ];

    return {
      totalPending: items.length,
      items,
    };
  }

  async approveItem(itemId: string, type: 'PURCHASE_REQUEST' | 'WORK_SITUATION', notes: string, user: UserSessionPayload) {
    if (type === 'PURCHASE_REQUEST') {
      const pr = await this.prisma.purchaseRequest.findUnique({
        where: { id: itemId },
        include: { quotes: true, project: true },
      });
      if (!pr) throw new NotFoundException('Demande d’achat introuvable');
      let recommendedQuote = pr.quotes.find(q => q.isRecommended) || pr.quotes[0];
      if (!recommendedQuote) {
        const firstSupp = await this.prisma.supplier.findFirst({ where: { active: true } });
        if (firstSupp) {
          recommendedQuote = await this.prisma.supplierQuote.create({
            data: {
              purchaseRequestId: pr.id,
              supplierId: firstSupp.id,
              quoteReference: `OFFRE-BASE-${pr.reference}`,
              totalAmountHT: pr.totalEstimatedAmount,
              deliveryLeadTimeDays: 7,
              stockAvailability: 'IMMEDIATE',
              paymentTerms: 'Virement bancaire 30j fin de mois',
              isRecommended: true,
            },
          });
        } else {
          throw new BadRequestException('Aucune offre fournisseur rattachée pour validation');
        }
      }

      return this.procurementService.approvePurchaseRequest(
        itemId,
        {
          approvedQuoteId: recommendedQuote.id,
          decisionNotes: notes || 'Approbation DG via le centre d’arbitrage',
        },
        user,
      );
    } else {
      const sit = await this.prisma.workSituation.findUnique({ where: { id: itemId } });
      if (!sit) throw new NotFoundException('Situation introuvable');
      return this.prisma.workSituation.update({
        where: { id: itemId },
        data: { status: WorkSituationStatus.APPROVED },
      });
    }
  }

  async rejectItem(itemId: string, type: 'PURCHASE_REQUEST' | 'WORK_SITUATION', reason: string, user: UserSessionPayload) {
    if (type === 'PURCHASE_REQUEST') {
      return this.procurementService.rejectPurchaseRequest(itemId, reason, user);
    } else {
      return this.prisma.workSituation.update({
        where: { id: itemId },
        data: { status: WorkSituationStatus.REJECTED },
      });
    }
  }

  async requestRevision(itemId: string, type: 'PURCHASE_REQUEST' | 'WORK_SITUATION', instructions: string, user: UserSessionPayload) {
    if (type === 'PURCHASE_REQUEST') {
      return this.prisma.purchaseRequest.update({
        where: { id: itemId },
        data: {
          status: PurchaseRequestStatus.QUOTATION_IN_PROGRESS,
          justification: instructions ? `[RÉVISION DEMANDÉE PAR LA DG] : ${instructions}` : undefined,
        },
      });
    } else {
      return this.prisma.workSituation.update({
        where: { id: itemId },
        data: {
          status: WorkSituationStatus.REJECTED,
          notes: instructions ? `[RÉVISION DEMANDÉE] : ${instructions}` : undefined,
        },
      });
    }
  }
}
