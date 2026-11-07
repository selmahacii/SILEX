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
    if (!dto?.purchaseOrderId) throw new BadRequestException('ID du bon de commande requis.');
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
        const movementNumber = `MVT-2026-${String(moveCount + 1).padStart(5, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

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

      return tx.goodsReceipt.findUnique({
        where: { id: goodsReceipt.id },
        include: {
          lines: { include: { item: true } },
          warehouse: true,
          purchaseOrder: true,
        },
      });
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
      // 1. Décrémentation atomique conditionnelle SQL (garantie anti-concurrence)
      const updateResult = await tx.item.updateMany({
        where: {
          id: item.id,
          currentStock: {
            gte: quantityRequested,
          },
        },
        data: {
          currentStock: {
            decrement: quantityRequested,
          },
        },
      });

      if (updateResult.count === 0) {
        const freshItem = await tx.item.findUnique({ where: { id: item.id } });
        const avail = freshItem ? freshItem.currentStock.toString() : '0';
        throw new BadRequestException(
          `Stock insuffisant pour l'article ${item.name} (${item.code}). Disponible: ${avail} ${item.unit}, Demandé: ${quantityRequested.toString()} ${item.unit}. Impossible de générer un stock négatif.`,
        );
      }

      const updatedItem = await tx.item.findUniqueOrThrow({ where: { id: item.id } });

      // 2. Créer le mouvement de sortie immuable
      const moveCount = await tx.stockMovement.count();
      const movementNumber = `MVT-2026-${String(moveCount + 1).padStart(5, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

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

  async createItem(data: {
    code?: string;
    name: string;
    description: string;
    categoryId?: string;
    unit: string;
    minStockLevel?: number;
    currentStock?: number;
    unitCost?: number;
  }, user: UserSessionPayload) {
    let categoryId = data.categoryId;
    if (!categoryId) {
      const defaultCat = await this.prisma.itemCategory.findFirst();
      categoryId = defaultCat ? defaultCat.id : undefined;
    }
    if (!categoryId) {
      const newCat = await this.prisma.itemCategory.create({
        data: { code: 'CAT-GEN', name: 'Fournitures Générales' },
      });
      categoryId = newCat.id;
    }

    const count = await this.prisma.item.count();
    const code = data.code || `ART-2026-${String(count + 1).padStart(3, '0')}`;

    const item = await this.prisma.item.create({
      data: {
        code,
        name: data.name,
        description: data.description,
        categoryId,
        unit: data.unit || 'U',
        minStockLevel: data.minStockLevel || 10,
        currentStock: data.currentStock || 0,
        unitCost: data.unitCost || 0,
        active: true,
      },
      include: { category: true },
    });

    await this.auditService.logAction({
      entityName: 'ITEM',
      entityId: item.id,
      action: 'CREATE_ITEM',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Création de l'article ${item.code} - ${item.name} dans l'inventaire.`,
    });

    return item;
  }

  async createWarehouse(data: {
    code?: string;
    name: string;
    location: string;
    managerName: string;
  }, user: UserSessionPayload) {
    const count = await this.prisma.warehouse.count();
    const code = data.code || `MAG-2026-${String(count + 1).padStart(2, '0')}`;

    const warehouse = await this.prisma.warehouse.create({
      data: {
        code,
        name: data.name,
        location: data.location,
        managerName: data.managerName,
        active: true,
      },
    });

    await this.auditService.logAction({
      entityName: 'WAREHOUSE',
      entityId: warehouse.id,
      action: 'CREATE_WAREHOUSE',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Création du magasin ${warehouse.code} - ${warehouse.name} (${warehouse.location}).`,
    });

    return warehouse;
  }

  async adjustStock(
    dto: {
      warehouseId: string;
      itemId: string;
      newQuantity: number;
      reason: string;
      notes?: string;
    },
    user: UserSessionPayload,
  ) {
    const item = await this.prisma.item.findUnique({ where: { id: dto.itemId } });
    if (!item) throw new NotFoundException('Article introuvable');

    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new NotFoundException('Magasin introuvable');

    const targetQty = new Prisma.Decimal(dto.newQuantity);
    if (targetQty.lt(0)) {
      throw new BadRequestException('Le stock ne peut pas être négatif');
    }

    const delta = targetQty.minus(item.currentStock);
    const unitCost = item.unitCost;
    const totalCost = delta.abs().times(unitCost);

    return this.prisma.$transaction(async tx => {
      await tx.item.update({
        where: { id: item.id },
        data: { currentStock: targetQty },
      });

      const moveCount = await tx.stockMovement.count();
      const movementNumber = `MVT-2026-${String(moveCount + 1).padStart(5, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const movement = await tx.stockMovement.create({
        data: {
          movementNumber,
          movementType: StockMovementType.INVENTORY_ADJUSTMENT,
          warehouseId: dto.warehouseId,
          itemId: dto.itemId,
          quantity: delta,
          unitCost,
          totalCost,
          referenceDocument: `REG-INV-${Date.now().toString().slice(-4)}`,
          notes: `Régularisation inventaire: ${dto.reason}. Ancien stock: ${item.currentStock.toString()} -> Nouveau stock: ${targetQty.toString()}. ${dto.notes || ''}`,
          createdById: user.userId,
        },
      });

      await this.auditService.logAction({
        entityName: 'STOCK_MOVEMENT',
        entityId: movement.id,
        action: 'INVENTORY_ADJUSTMENT',
        performerId: user.userId,
        performerName: user.name,
        performerRole: user.role,
        description: `Ajustement d'inventaire sur l'article ${item.name} (${item.code}): Ancien ${item.currentStock} -> Nouveau ${targetQty} ${item.unit}. Motif: ${dto.reason}`,
      });

      return {
        item: await tx.item.findUnique({ where: { id: item.id } }),
        movement,
      };
    });
  }

  async transferBetweenWarehouses(
    dto: {
      sourceWarehouseId: string;
      destinationWarehouseId?: string;
      targetWarehouseId?: string;
      itemId: string;
      quantity: number;
      driverName?: string;
      vehicleMatricule?: string;
      notes?: string;
    },
    user: UserSessionPayload,
  ) {
    const targetWhId = dto.destinationWarehouseId || dto.targetWarehouseId;
    if (!targetWhId) throw new BadRequestException('Magasin destinataire obligatoire');
    const targetItemId = dto.itemId || (dto as any).articleId;
    if (!targetItemId) throw new BadRequestException('Article obligatoire');

    const item = await this.prisma.item.findUnique({ where: { id: targetItemId } });
    if (!item) throw new NotFoundException('Article introuvable');
    if (Number(item.currentStock) < Number(dto.quantity)) {
      throw new BadRequestException(`Stock insuffisant pour transfert (Disponible: ${item.currentStock})`);
    }

    const sourceWh = await this.prisma.warehouse.findUnique({ where: { id: dto.sourceWarehouseId } });
    const destWh = await this.prisma.warehouse.findUnique({ where: { id: targetWhId } });
    if (!sourceWh || !destWh) throw new NotFoundException('Magasin source ou destinataire introuvable');

    return this.prisma.$transaction(async tx => {
      const count = await tx.stockMovement.count();
      const movementNumber = `BT-2026-${String(count + 1).padStart(4, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const qtyDecimal = new Prisma.Decimal(dto.quantity);
      const totalCost = qtyDecimal.times(item.unitCost);

      const movement = await tx.stockMovement.create({
        data: {
          movementNumber,
          movementType: StockMovementType.WAREHOUSE_TRANSFER,
          warehouseId: destWh.id,
          itemId: item.id,
          quantity: qtyDecimal,
          unitCost: item.unitCost,
          totalCost,
          referenceDocument: `BT-${Date.now().toString().slice(-4)}`,
          notes: `[TRANSFERT INTER-MAGASINS] De ${sourceWh.name} vers ${destWh.name} | Chauffeur: ${dto.driverName || 'Transporteur interne'} (${dto.vehicleMatricule || 'SILEX LOGISTIQUE'}). ${dto.notes || ''}`,
          createdById: user.userId,
        },
      });

      await this.auditService.logAction({
        entityName: 'STOCK_MOVEMENT',
        entityId: movement.id,
        action: 'WAREHOUSE_TRANSFER',
        performerId: user.userId,
        performerName: user.name,
        performerRole: user.role,
        description: `Transfert de ${dto.quantity} ${item.unit} de ${item.name} de ${sourceWh.name} vers ${destWh.name}.`,
      });

      return movement;
    });
  }

  async returnMaterialFromProject(
    dto: {
      projectId: string;
      warehouseId: string;
      itemId: string;
      quantity: number;
      reason?: string;
      notes?: string;
    },
    user: UserSessionPayload,
  ) {
    const targetItemId = dto.itemId || (dto as any).articleId;
    if (!targetItemId) throw new BadRequestException('Article obligatoire pour le retour');
    const item = await this.prisma.item.findUnique({ where: { id: targetItemId } });
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!item || !project || !warehouse) throw new NotFoundException('Article, projet ou magasin introuvable');

    return this.prisma.$transaction(async tx => {
      const qtyDecimal = new Prisma.Decimal(dto.quantity);
      const creditCost = qtyDecimal.times(item.unitCost);

      // 1. Réintégration au stock magasin
      await tx.item.update({
        where: { id: item.id },
        data: { currentStock: { increment: qtyDecimal } },
      });

      // 2. Allègement du coût réel du projet (Synchronisme inter-modules)
      const newActual = Prisma.Decimal.max(new Prisma.Decimal(0), project.actualCost.minus(creditCost));
      await tx.project.update({
        where: { id: project.id },
        data: { actualCost: newActual },
      });

      const count = await tx.stockMovement.count();
      const movementNumber = `BRC-2026-${String(count + 1).padStart(4, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const movement = await tx.stockMovement.create({
        data: {
          movementNumber,
          movementType: StockMovementType.RETURN,
          warehouseId: warehouse.id,
          itemId: item.id,
          projectId: project.id,
          quantity: qtyDecimal,
          unitCost: item.unitCost,
          totalCost: creditCost,
          referenceDocument: `BRC-${Date.now().toString().slice(-4)}`,
          notes: `[RETOUR CHANTIER] Réintégration de ${dto.quantity} ${item.unit} depuis le chantier ${project.code}. Motif: ${dto.reason || 'Surplus réutilisable'}. Crédit projet: -${creditCost.toString()} DA`,
          createdById: user.userId,
        },
      });

      await this.auditService.logAction({
        entityName: 'STOCK_MOVEMENT',
        entityId: movement.id,
        action: 'PROJECT_RETURN',
        performerId: user.userId,
        performerName: user.name,
        performerRole: user.role,
        description: `Retour chantier de ${dto.quantity} ${item.unit} (${item.name}) du projet ${project.code} au magasin ${warehouse.name}.`,
      });

      return movement;
    });
  }

  async updateItem(id: string, data: any, user: UserSessionPayload) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Article introuvable');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.minStockLevel !== undefined) updateData.minStockLevel = new Prisma.Decimal(data.minStockLevel);
    if (data.unitCost !== undefined) updateData.unitCost = new Prisma.Decimal(data.unitCost);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const updated = await this.prisma.item.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    await this.auditService.logAction({
      entityName: 'ITEM',
      entityId: id,
      action: 'UPDATE_ITEM',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour de la fiche article ${item.code} (${updated.name}).`,
    });

    return updated;
  }

  async updateWarehouse(id: string, data: any, user: UserSessionPayload) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) throw new NotFoundException('Magasin introuvable');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.managerName !== undefined) updateData.managerName = data.managerName;

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    await this.auditService.logAction({
      entityName: 'WAREHOUSE',
      entityId: id,
      action: 'UPDATE_WAREHOUSE',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour du magasin ${warehouse.code} (${updated.name} - ${updated.location}).`,
    });

    return updated;
  }
}
