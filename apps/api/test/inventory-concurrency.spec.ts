import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { SystemRole, DepartmentCode, UserSessionPayload } from '@silex/shared';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('PHASE 5 — SÉCURISATION DES STOCKS & TEST DE CONCURRENCE STRICT', () => {
  let prisma: PrismaService;
  let inventoryService: InventoryService;

  const testUser: UserSessionPayload = {
    userId: 'usr-mag-004',
    email: 't.meziani@silex-services.dz',
    name: 'Tarek Meziani',
    role: SystemRole.RESPONSABLE_MAGASIN,
    departmentCode: DepartmentCode.MAGASIN_STOCKS,
    permissions: ['inventory:create', 'inventory:update'],
  };

  let testItemId: string;
  let testProjectId: string;
  let testWarehouseId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        AuditService,
        InventoryService,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    inventoryService = module.get<InventoryService>(InventoryService);

    // Récupérer un projet et un magasin existants
    const project = await prisma.project.findFirstOrThrow();
    testProjectId = project.id;

    const warehouse = await prisma.warehouse.findFirstOrThrow();
    testWarehouseId = warehouse.id;

    const category = await prisma.itemCategory.findFirstOrThrow();

    // Créer un article de test dédié avec un stock initial STRICT de 10
    const item = await prisma.item.create({
      data: {
        code: `CONCUR-TEST-${Date.now()}`,
        name: 'Article Test Concurrence Stock',
        description: 'Vérification de l’atomicité et protection anti-stock négatif',
        categoryId: category.id,
        unit: 'U',
        currentStock: new Prisma.Decimal(10),
        unitCost: new Prisma.Decimal(1500),
      },
    });
    testItemId = item.id;
  });

  afterAll(async () => {
    // Nettoyage de l'article de test et de ses mouvements associés
    if (testItemId) {
      await prisma.projectCostEntry.deleteMany({
        where: { sourceReferenceId: { in: (await prisma.stockMovement.findMany({ where: { itemId: testItemId }, select: { id: true } })).map(m => m.id) } },
      });
      await prisma.projectMaterialAllocation.deleteMany({ where: { itemId: testItemId } });
      await prisma.stockMovement.deleteMany({ where: { itemId: testItemId } });
      await prisma.item.delete({ where: { id: testItemId } });
    }
  });

  it('TEST 5.1 : Concurrence stricte — 2 requêtes simultanées de 8 unités sur stock initial de 10', async () => {
    // Deux requêtes lancées au même instant
    const reqA = inventoryService.issueMaterialToProject(
      {
        projectId: testProjectId,
        warehouseId: testWarehouseId,
        itemId: testItemId,
        quantity: 8,
        recipientEmployeeId: 'emp-001',
        workZone: 'Zone Concurrence A',
      },
      testUser,
    );

    const reqB = inventoryService.issueMaterialToProject(
      {
        projectId: testProjectId,
        warehouseId: testWarehouseId,
        itemId: testItemId,
        quantity: 8,
        recipientEmployeeId: 'emp-001',
        workZone: 'Zone Concurrence B',
      },
      testUser,
    );

    const results = await Promise.allSettled([reqA, reqB]);

    const successes = results.filter(r => r.status === 'fulfilled');
    const rejections = results.filter(r => r.status === 'rejected');

    // 1. Une seule opération DOIT réussir
    expect(successes.length).toBe(1);

    // 2. L'autre opération DOIT échouer avec BadRequestException (stock insuffisant)
    expect(rejections.length).toBe(1);
    const rejectionReason = (rejections[0] as PromiseRejectedResult).reason;
    expect(rejectionReason).toBeInstanceOf(BadRequestException);
    expect(rejectionReason.message).toContain('Stock insuffisant');

    // 3. Le stock final en base doit être exactement 2 (10 - 8 = 2), et JAMAIS négatif
    const itemInDb = await prisma.item.findUniqueOrThrow({ where: { id: testItemId } });
    expect(itemInDb.currentStock.toNumber()).toBe(2);
    expect(itemInDb.currentStock.gte(0)).toBe(true);

    // 4. Exactement UN mouvement de sortie doit exister pour cet article
    const movements = await prisma.stockMovement.findMany({ where: { itemId: testItemId } });
    expect(movements.length).toBe(1);
    expect(movements[0].quantity.toNumber()).toBe(8);
  });
});
