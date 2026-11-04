import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload } from '@silex/shared';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async listUsers() {
    return this.prisma.user.findMany({
      include: {
        department: true,
        assignedProjects: {
          include: { project: { select: { code: true, name: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async resetDemoData(user: UserSessionPayload) {
    if (user.role !== SystemRole.ADMINISTRATEUR) {
      throw new ForbiddenException('Seul l’administrateur système peut réinitialiser les données de démonstration.');
    }

    if (process.env.DEMO_MODE !== 'true') {
      throw new ForbiddenException('La réinitialisation est strictement interdite hors du mode démonstration.');
    }

    // Réinitialisation transactionnelle des tables dynamiques
    await this.prisma.$transaction(async tx => {
      await tx.goodsReceiptLine.deleteMany();
      await tx.goodsReceipt.deleteMany();
      await tx.stockMovement.deleteMany();
      await tx.projectMaterialAllocation.deleteMany();
      await tx.projectCostEntry.deleteMany();
      await tx.supplierQuoteLine.deleteMany();
      await tx.supplierQuote.deleteMany();
      await tx.purchaseOrderLine.deleteMany();
      await tx.purchaseOrder.deleteMany();
      await tx.purchaseRequestLine.deleteMany();
      await tx.purchaseRequest.deleteMany();

      // Rétablir les stocks d'origine
      await tx.item.updateMany({
        where: { code: 'ART-001' },
        data: { currentStock: 25 },
      });

      // Rétablir les coûts du projet PRJ-2026-001
      await tx.project.updateMany({
        where: { code: 'PRJ-2026-001' },
        data: {
          committedCost: 24800000,
          actualCost: 19650000,
        },
      });
    });

    await this.auditService.logAction({
      entityName: 'SYSTEM',
      entityId: 'demo-reset',
      action: 'RESET_DEMO_DATA',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Réinitialisation complète des flux dynamiques de démonstration (DA, Commandes, Réceptions, Sorties).`,
    });

    return { success: true, message: 'Données de démonstration réinitialisées avec succès.' };
  }
}
