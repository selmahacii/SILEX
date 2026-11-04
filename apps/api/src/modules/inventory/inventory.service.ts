import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload, StockMovementType, PurchaseOrderStatus } from '@silex/shared';
import { ReceiveGoodsDto, IssueMaterialToProjectDto } from '@silex/contracts';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getItems(categoryId?: string) {
    const where: Prisma.ItemWhereInput = {};
    if (categoryId) where.categoryId = categoryId;

    return this.prisma.item.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async getWarehouses() {
    return this.prisma.warehouse.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: { stockMovements: true, goodsReceipts: true },
        },
      },
    });
  }

  async getStockMovements(filters?: { warehouseId?: string; itemId?: string; projectId?: string }) {
    const where: Prisma.StockMovementWhereInput = {};
    if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters?.itemId) where.itemId = filters.itemId;
    if (filters?.projectId) where.projectId = filters.projectId;

    return this.prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        item: true,
        warehouse: true,
        purchaseOrder: true,
      },
    });
  }

  /**
   * ÉTAPE 5 DU SCÉNARIO : Réception de marchandises au magasin
   * - Enregistre la réception
   * - Met à jour le stock disponible
   * - Crée un mouvement immuable PURCHASE_RECEIPT
   * - Empêche les doubles réceptions (TEST 5)
   */
  async receiveGoods(dto: ReceiveGoodsDto, user: UserSessionPayload) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id: dto.purchaseOrderId },
      include: {
        lines: { include: { item: true } },
        project: true,
      },
    });

    if (!po) throw new NotFoundException('Bon de commande introuvable.');

    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) throw new NotFoundException('Magasin introuvable.');

    // Rôle magasinier, DG ou Admin requis
    if (
      user.role !== SystemRole.RESPONSABLE_MAGASIN &&
      user.role !== SystemRole.DIRECTEUR_GENERAL &&
      user.role !== SystemRole.ADMINISTRATEUR
    ) {
      throw new ForbiddenException('Seul le responsable magasin peut valider une réception de marchandises.');
    }

    // Vérifier les lignes
    for (const lineDto of dto.lines) {
      const poLine = po.lines.find(l => l.id === lineDto.purchaseOrderLineId);
      if (!poLine) {
        throw new NotFoundException(`Ligne de bon de commande introuvable (${lineDto.purchaseOrderLineId}).`);
      }

      const totalReceived = poLine.quantityReceived.plus(new Prisma.Decimal(lineDto.quantityReceived));
      if (totalReceived.gt(poLine.quantity)) {
        throw new BadRequestException(
          `Quantité reçue excessive pour l'article ${poLine.item.name}. Reçu: ${totalReceived.toString()}, Commandé: ${poLine.quantity.toString()}`,
        );
      }
    }

    return this.prisma.$transaction(async tx => {
      const receiptCount = await tx.goodsReceipt.count();
      const receiptNumber = `REC-2026-${String(receiptCount + 1).padStart(4, '0')}`;

      // 1. Créer le bon de réception
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId: po.id,
          warehouseId: dto.warehouseId,
          receivedById: user.userId,
          deliveryNoteNumber: dto.deliveryNoteNumber,
          notes: dto.notes,
          status: 'VALIDATED',
        },
      });

      // 2. Traiter chaque ligne reçue
      for (const lineDto of dto.lines) {
        const poLine = po.lines.find(l => l.id === lineDto.purchaseOrderLineId)!;
        const qty = new Prisma.Decimal(lineDto.quantityReceived);

        // Enregistrer la ligne de réception
        await tx.goodsReceiptLine.create({
          data: {
            goodsReceiptId: goodsReceipt.id,
            purchaseOrderLineId: poLine.id,
            itemId: poLine.itemId,
            quantityReceived: qty,
          },
        });

        // Mettre à jour la ligne du bon de commande
        await tx.purchaseOrderLine.update({
          where: { id: poLine.id },
          data: {
            quantityReceived: {
              increment: qty,
            },
          },
        });

        // Mettre à jour le stock de l'article
        const updatedItem = await tx.item.update({
          where: { id: poLine.itemId },
          data: {
            currentStock: {
              increment: qty,
            },
            unitCost: poLine.unitPrice, // Mise à jour du dernier coût d'achat
          },
        });

        // Créer le mouvement immuable dans le ledger
        const moveCount = await tx.stockMovement.count();
        const movementNumber = `MVT-2026-${String(moveCount + 1).padStart(5, '0')}`;

        await tx.stockMovement.create({
          data: {
            movementNumber,
            movementType: StockMovementType.PURCHASE_RECEIPT,
            warehouseId: dto.warehouseId,
            itemId: poLine.itemId,
            quantity: qty,
            unitCost: poLine.unitPrice,
            totalCost: qty.times(poLine.unitPrice),
            purchaseOrderId: po.id,
            projectId: po.projectId,
            referenceDocument: `${receiptNumber} (BL Fournisseur: ${dto.deliveryNoteNumber})`,
            notes: `Réception bon de commande ${po.orderNumber}`,
            createdById: user.userId,
          },
        });
      }

      // 3. Mettre à jour le statut du bon de commande
      const refreshedLines = await tx.purchaseOrderLine.findMany({
        where: { purchaseOrderId: po.id },
      });

      const allFullyReceived = refreshedLines.every(l => l.quantityReceived.gte(l.quantity));
      const newStatus = allFullyReceived
        ? PurchaseOrderStatus.RECEIVED
        : PurchaseOrderStatus.PARTIALLY_RECEIVED;

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: newStatus },
      });

      // 4. Log d'audit
      await this.auditService.logAction({
        entityName: 'GOODS_RECEIPT',
        entityId: goodsReceipt.id,
        action: 'RECEIVE_GOODS',
        performerId: user.userId,
        performerName: user.name,
        performerRole: user.role,
        description: `Réception de marchandises ${goodsReceipt.receiptNumber} pour la commande ${po.orderNumber} au magasin ${warehouse.name}. BL: ${dto.deliveryNoteNumber}.`,
      });

      return goodsReceipt;
    });
  }

  /**
   * ÉTAPE 6 DU SCÉNARIO : Sortie de stock vers chantier
   * - Vérifie la disponibilité du stock physique
   * - Refuse toute sortie créant un stock négatif (TEST 6)
   * - Décrémente le stock disponible
   * - Crée un mouvement immuable PROJECT_ISSUE
   * - Enregistre l'affectation matérielle et met à jour le coût réel du projet (TEST 7)
   */
  async issueMaterialToProject(dto: IssueMaterialToProjectDto, user: UserSessionPayload) {
    const item = await this.prisma.item.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Article introuvable.');

    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Projet introuvable.');

    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new NotFoundException('Magasin introuvable.');

    const quantityRequested = new Prisma.Decimal(dto.quantity);

    // TEST 6 : Vérification de la disponibilité stricte (contrôle anti-stock négatif)
    if (item.currentStock.lt(quantityRequested)) {
      throw new BadRequestException(
        `Stock insuffisant pour l'article ${item.name} (${item.code}). Disponible: ${item.currentStock.toString()} ${item.unit}, Demandé: ${quantityRequested.toString()} ${item.unit}. Impossible de générer un stock négatif.`,
      );
    }

    const unitCost = item.unitCost;
    const totalCost = quantityRequested.times(unitCost);

    return this.prisma.$transaction(async tx => {
      // 1. Décrémenter le stock de l'article
      const updatedItem = await tx.item.update({
        where: { id: item.id },
        data: {
          currentStock: {
            decrement: quantityRequested,
          },
        },
      });

      // 2. Créer le mouvement de sortie immuable
      const moveCount = await tx.stockMovement.count();
      const movementNumber = `MVT-2026-${String(moveCount + 1).padStart(5, '0')}`;

      const movement = await tx.stockMovement.create({
        data: {
          movementNumber,
          movementType: StockMovementType.PROJECT_ISSUE,
          warehouseId: dto.warehouseId,
          itemId: item.id,
          quantity: quantityRequested,
          unitCost,
          totalCost,
          projectId: project.id,
          referenceDocument: `BS-${project.code}-${movementNumber}`,
          notes: dto.notes || `Sortie matériel vers chantier ${project.name} (${dto.workZone || 'Zone Travaux'})`,
          createdById: user.userId,
        },
      });

      // 3. Enregistrer l'affectation matérielle au projet
      const allocation = await tx.projectMaterialAllocation.create({
        data: {
          projectId: project.id,
          itemId: item.id,
          warehouseId: dto.warehouseId,
          quantity: quantityRequested,
          unitCost,
          totalCost,
          allocatedById: user.userId,
          workZone: dto.workZone,
        },
      });

      // 4. TEST 7 : Créer l'imputation de coût matière et mettre à jour le coût réel du projet
      await tx.projectCostEntry.create({
        data: {
          projectId: project.id,
          category: 'MATERIEL',
          amount: totalCost,
          sourceModule: 'INVENTORY',
          sourceReferenceId: movement.id,
          description: `Consommation de ${quantityRequested.toString()} ${item.unit} de ${item.name} sur chantier.`,
        },
      });

      await tx.project.update({
        where: { id: project.id },
        data: {
          actualCost: {
            increment: totalCost,
          },
        },
      });

      // 5. Log d'audit
      await this.auditService.logAction({
        entityName: 'STOCK_ISSUE',
        entityId: movement.id,
        action: 'PROJECT_ISSUE',
        performerId: user.userId,
        performerName: user.name,
        performerRole: user.role,
        description: `Sortie de stock ${movement.movementNumber} : ${quantityRequested.toString()} ${item.unit} de ${item.name} affectés au chantier ${project.code}. Coût imputé : ${totalCost.toString()} DA. Stock restant : ${updatedItem.currentStock.toString()} ${item.unit}.`,
      });

      return {
        movement,
        allocation,
        remainingStock: updatedItem.currentStock,
        imputedCost: totalCost,
      };
    });
  }
}
