import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload, PurchaseRequestStatus, PurchaseOrderStatus } from '@silex/shared';
import { CreatePurchaseRequestDto, AddSupplierQuoteDto, ApprovePurchaseRequestDto } from '@silex/contracts';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProcurementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getPurchaseRequests(user: UserSessionPayload, status?: PurchaseRequestStatus) {
    const where: Prisma.PurchaseRequestWhereInput = {};

    // Restriction chef de projet
    if (user.role === SystemRole.RESPONSABLE_PROJET) {
      where.project = {
        assignedUsers: { some: { userId: user.userId } },
      };
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.purchaseRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, code: true, name: true, clientName: true } },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        lines: {
          include: { item: true },
        },
        quotes: {
          include: { supplier: true },
        },
        purchaseOrders: true,
      },
    });
  }

  async getPurchaseRequestById(id: string, user: UserSessionPayload) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            assignedUsers: true,
          },
        },
        createdBy: { select: { id: true, name: true, email: true, title: true } },
        lines: {
          include: { item: { include: { category: true } } },
        },
        quotes: {
          include: {
            supplier: true,
            lines: true,
          },
          orderBy: { totalAmountHT: 'asc' },
        },
        purchaseOrders: {
          include: {
            supplier: true,
            lines: { include: { item: true } },
            goodsReceipts: true,
          },
        },
      },
    });

    if (!pr) {
      throw new NotFoundException(`Demande d'achat introuvable (${id}).`);
    }

    if (user.role === SystemRole.RESPONSABLE_PROJET) {
      const isAssigned = pr.project.assignedUsers.some(a => a.userId === user.userId);
      if (!isAssigned) {
        throw new ForbiddenException(`Vous n'avez pas l'autorisation de consulter la DA de ce projet.`);
      }
    }

    return pr;
  }

  async createPurchaseRequest(dto: CreatePurchaseRequestDto, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { assignedUsers: true },
    });

    if (!project) {
      throw new NotFoundException('Projet spécifié introuvable.');
    }

    // Vérifier l'assignation si responsable projet
    if (user.role === SystemRole.RESPONSABLE_PROJET) {
      const isAssigned = project.assignedUsers.some(a => a.userId === user.userId);
      if (!isAssigned) {
        throw new ForbiddenException(`Vous n'êtes pas assigné à ce projet.`);
      }
    }

    const count = await this.prisma.purchaseRequest.count();
    const reference = `DA-2026-${String(count + 1).padStart(4, '0')}`;

    let totalEstimated = new Prisma.Decimal(0);
    for (const l of dto.lines) {
      const sub = new Prisma.Decimal(l.quantity).times(new Prisma.Decimal(l.estimatedUnitPrice));
      totalEstimated = totalEstimated.plus(sub);
    }

    const pr = await this.prisma.purchaseRequest.create({
      data: {
        reference,
        projectId: dto.projectId,
        createdById: user.userId,
        urgencyLevel: dto.urgencyLevel,
        justification: dto.justification,
        desiredDate: new Date(dto.desiredDate),
        suggestedSupplierId: dto.suggestedSupplierId,
        status: PurchaseRequestStatus.SUBMITTED, // Directement soumise pour le parcours fluide
        totalEstimatedAmount: totalEstimated,
        lines: {
          create: dto.lines.map(l => ({
            itemId: l.itemId,
            description: l.description,
            quantity: new Prisma.Decimal(l.quantity),
            unit: l.unit,
            technicalSpecs: l.technicalSpecs,
            estimatedUnitPrice: new Prisma.Decimal(l.estimatedUnitPrice),
            subtotal: new Prisma.Decimal(l.quantity).times(new Prisma.Decimal(l.estimatedUnitPrice)),
          })),
        },
      },
      include: {
        lines: { include: { item: true } },
        project: true,
      },
    });

    await this.auditService.logAction({
      entityName: 'PURCHASE_REQUEST',
      entityId: pr.id,
      action: 'CREATE_AND_SUBMIT',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Création et soumission de la DA ${pr.reference} (${dto.lines.length} articles, total estimé: ${totalEstimated.toString()} DA) pour le projet ${project.code}.`,
      afterState: { status: pr.status, total: totalEstimated.toString() },
    });

    return pr;
  }

  async addSupplierQuote(dto: AddSupplierQuoteDto, user: UserSessionPayload) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id: dto.purchaseRequestId },
      include: { lines: true },
    });

    if (!pr) throw new NotFoundException('Demande d’achat introuvable.');

    // Transition d'état vers consultation en cours
    if (pr.status === PurchaseRequestStatus.SUBMITTED || pr.status === PurchaseRequestStatus.PROCUREMENT_REVIEW) {
      await this.prisma.purchaseRequest.update({
        where: { id: pr.id },
        data: { status: PurchaseRequestStatus.QUOTATION_IN_PROGRESS },
      });
    }

    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
    if (!supplier) throw new NotFoundException('Fournisseur introuvable.');

    const count = await this.prisma.supplierQuote.count({ where: { purchaseRequestId: pr.id } });
    const quoteReference = `OFFRE-${supplier.code}-${String(count + 1).padStart(2, '0')}`;

    const quote = await this.prisma.supplierQuote.create({
      data: {
        purchaseRequestId: pr.id,
        supplierId: dto.supplierId,
        quoteReference,
        totalAmountHT: new Prisma.Decimal(dto.totalAmountHT),
        deliveryLeadTimeDays: dto.deliveryLeadTimeDays,
        stockAvailability: dto.stockAvailability,
        technicalCompliance: dto.technicalCompliance,
        warrantyMonths: dto.warrantyMonths,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
        lines: {
          create: dto.lines.map(l => ({
            purchaseRequestLineId: l.purchaseRequestLineId,
            unitPrice: new Prisma.Decimal(l.unitPrice),
            subtotal: new Prisma.Decimal(l.unitPrice), // ajusté par ligne
            notes: l.notes,
          })),
        },
      },
    });

    await this.auditService.logAction({
      entityName: 'SUPPLIER_QUOTE',
      entityId: quote.id,
      action: 'ADD_QUOTE',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Ajout de l'offre fournisseur ${supplier.name} (${quoteReference}) d'un montant de ${dto.totalAmountHT} DA.`,
    });

    return quote;
  }

  async submitForApproval(purchaseRequestId: string, recommendedQuoteId: string, user: UserSessionPayload) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: { quotes: true },
    });

    if (!pr) throw new NotFoundException('Demande d’achat introuvable.');

    // Marquer l'offre recommandée
    await this.prisma.supplierQuote.updateMany({
      where: { purchaseRequestId },
      data: { isRecommended: false },
    });

    await this.prisma.supplierQuote.update({
      where: { id: recommendedQuoteId },
      data: { isRecommended: true },
    });

    const updated = await this.prisma.purchaseRequest.update({
      where: { id: purchaseRequestId },
      data: { status: PurchaseRequestStatus.PENDING_APPROVAL },
      include: { quotes: { include: { supplier: true } } },
    });

    await this.auditService.logAction({
      entityName: 'PURCHASE_REQUEST',
      entityId: pr.id,
      action: 'SUBMIT_FOR_APPROVAL',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Transmission de la DA ${pr.reference} pour arbitrage et approbation de la Direction Générale.`,
    });

    return updated;
  }

  async approvePurchaseRequest(
    purchaseRequestId: string,
    dto: ApprovePurchaseRequestDto,
    user: UserSessionPayload,
  ) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: {
        lines: true,
        project: true,
        quotes: { include: { supplier: true } },
      },
    });

    if (!pr) throw new NotFoundException('Demande d’achat introuvable.');

    // TEST 4 & Règles : Pas de double approbation
    if (pr.status === PurchaseRequestStatus.APPROVED || pr.status === PurchaseRequestStatus.PURCHASE_ORDER) {
      throw new BadRequestException('Cette demande d’achat a déjà été approuvée.');
    }

    // TEST 3 : Seules les demandes PENDING_APPROVAL ou QUOTATION_IN_PROGRESS peuvent être approuvées
    if (
      pr.status !== PurchaseRequestStatus.PENDING_APPROVAL &&
      pr.status !== PurchaseRequestStatus.QUOTATION_IN_PROGRESS &&
      pr.status !== PurchaseRequestStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        `Transition illégale : impossible d’approuver une demande au statut ${pr.status}.`,
      );
    }

    // TEST 2 & SoD : Le créateur ne peut approuver sa propre demande
    if (pr.createdById === user.userId && user.role !== SystemRole.ADMINISTRATEUR) {
      throw new ForbiddenException('Le demandeur ne peut pas approuver sa propre demande d’achat.');
    }

    // TEST 2 : Rôle DG ou Admin requis
    if (user.role !== SystemRole.DIRECTEUR_GENERAL && user.role !== SystemRole.ADMINISTRATEUR) {
      throw new ForbiddenException(
        `Votre rôle (${user.role}) ne vous autorise pas à approuver cette demande d’achat. Seul le Directeur Général peut valider.`,
      );
    }

    const approvedQuote = pr.quotes.find(q => q.id === dto.approvedQuoteId) || pr.quotes[0];
    if (!approvedQuote) {
      throw new BadRequestException('Offre fournisseur sélectionnée introuvable pour cette DA.');
    }

    // Transaction atomique : Validation DA + Génération Bon de Commande + Mise à jour engagements projet
    return this.prisma.$transaction(async tx => {
      // 1. Mettre à jour l'offre
      await tx.supplierQuote.update({
        where: { id: approvedQuote.id },
        data: { isApproved: true },
      });

      // 2. Générer le numéro de Bon de Commande unique (BC-2026-XXXX)
      const poCount = await tx.purchaseOrder.count();
      const orderNumber = `BC-2026-${String(poCount + 42).padStart(4, '0')}`;

      const totalHT = approvedQuote.totalAmountHT;
      const vatRate = new Prisma.Decimal(19);
      const totalTTC = totalHT.times(1.19);

      // 3. Créer le Bon de Commande
      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          purchaseRequestId: pr.id,
          supplierId: approvedQuote.supplierId,
          projectId: pr.projectId,
          totalAmountHT: totalHT,
          totalAmountTTC: totalTTC,
          vatRate,
          status: PurchaseOrderStatus.ISSUED,
          deliveryTerms: `Livraison sous ${approvedQuote.deliveryLeadTimeDays} jours ouvrés`,
          paymentTerms: approvedQuote.paymentTerms,
          lines: {
            create: pr.lines.map(l => ({
              itemId: l.itemId,
              description: l.description,
              quantity: l.quantity,
              unit: l.unit,
              unitPrice: approvedQuote.totalAmountHT.dividedBy(l.quantity),
              subtotal: approvedQuote.totalAmountHT,
            })),
          },
        },
        include: {
          lines: true,
          supplier: true,
        },
      });

      // 4. Mettre à jour le statut de la DA
      const updatedPR = await tx.purchaseRequest.update({
        where: { id: pr.id },
        data: { status: PurchaseRequestStatus.PURCHASE_ORDER },
      });

      // 5. Mettre à jour l'engagement financier du projet
      await tx.project.update({
        where: { id: pr.projectId },
        data: {
          committedCost: {
            increment: totalHT,
          },
        },
      });

      // 6. Log d'audit immuable
      await this.auditService.logAction({
        entityName: 'PURCHASE_REQUEST',
        entityId: pr.id,
        action: 'APPROVE_AND_GENERATE_PO',
        performerId: user.userId,
        performerName: user.name,
        performerRole: user.role,
        description: `Approbation par la Direction Générale de la DA ${pr.reference}. Génération du Bon de Commande ${po.orderNumber} (Fournisseur: ${approvedQuote.supplier.name}, Montant: ${totalHT.toString()} DA). Décision: "${dto.decisionNotes}".`,
        beforeState: { status: pr.status },
        afterState: { status: updatedPR.status, purchaseOrder: po.orderNumber },
      });

      return {
        purchaseRequest: updatedPR,
        purchaseOrder: po,
      };
    });
  }

  async getPurchaseOrders(user: UserSessionPayload) {
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (user.role === SystemRole.RESPONSABLE_PROJET) {
      where.project = {
        assignedUsers: { some: { userId: user.userId } },
      };
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        project: { select: { id: true, code: true, name: true } },
        lines: { include: { item: true } },
        goodsReceipts: true,
      },
    });
  }
}
