import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { ProjectsService } from '../src/modules/projects/projects.service';
import { ProcurementService } from '../src/modules/procurement/procurement.service';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { UsersService } from '../src/modules/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { SystemRole, DepartmentCode, PurchaseRequestStatus, StockMovementType, UserSessionPayload } from '@silex/shared';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('SILEX INDUSTRIAL ERP — SUITE DE VALIDATION MÉTIER & CRITÈRES D’ACCEPTATION (TESTS 1 À 12)', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let projectsService: ProjectsService;
  let procurementService: ProcurementService;
  let inventoryService: InventoryService;
  let usersService: UsersService;
  let auditService: AuditService;

  let dgUser: UserSessionPayload;
  let rpUser: UserSessionPayload;
  let magUser: UserSessionPayload;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'silex_super_secret_jwt_key_industrial_erp_2026_demo',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        PrismaService,
        AuditService,
        AuthService,
        ProjectsService,
        ProcurementService,
        InventoryService,
        UsersService,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    procurementService = module.get<ProcurementService>(ProcurementService);
    inventoryService = module.get<InventoryService>(InventoryService);
    usersService = module.get<UsersService>(UsersService);
    auditService = module.get<AuditService>(AuditService);

    // Initialiser les sessions de test
    const dgAuth = await authService.switchDemoRole(SystemRole.DIRECTEUR_GENERAL);
    dgUser = {
      userId: dgAuth.user.id,
      email: dgAuth.user.email,
      name: dgAuth.user.name,
      role: SystemRole.DIRECTEUR_GENERAL,
      departmentCode: DepartmentCode.DIRECTION_GENERALE,
      permissions: dgAuth.user.permissions,
    };

    const rpAuth = await authService.switchDemoRole(SystemRole.RESPONSABLE_PROJET);
    rpUser = {
      userId: rpAuth.user.id,
      email: rpAuth.user.email,
      name: rpAuth.user.name,
      role: SystemRole.RESPONSABLE_PROJET,
      departmentCode: DepartmentCode.OPERATIONS_PROJETS,
      assignedProjectCodes: rpAuth.user.assignedProjectCodes,
      permissions: rpAuth.user.permissions,
    };

    const magAuth = await authService.switchDemoRole(SystemRole.RESPONSABLE_MAGASIN);
    magUser = {
      userId: magAuth.user.id,
      email: magAuth.user.email,
      name: magAuth.user.name,
      role: SystemRole.RESPONSABLE_MAGASIN,
      departmentCode: DepartmentCode.MAGASIN_STOCKS,
      permissions: magAuth.user.permissions,
    };
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TEST 1
  it('TEST 1 : Un responsable projet ne peut pas accéder à un projet non affecté', async () => {
    // PRJ-2026-005 est un projet de cimenterie non affecté à Sofiane Belkacem
    // Retirer toute affectation préalable pour PRJ-2026-005
    const proj5 = await prisma.project.findUnique({ where: { code: 'PRJ-2026-005' } });
    expect(proj5).toBeDefined();

    await prisma.userProjectAssignment.deleteMany({
      where: { userId: rpUser.userId, projectId: proj5!.id },
    });

    await expect(projectsService.findByCode(proj5!.code, rpUser)).rejects.toThrow(ForbiddenException);
  });

  // TEST 2
  it('TEST 2 : Un magasinier ne peut pas approuver une demande d’achat', async () => {
    // Créer une DA de test
    const proj1 = await prisma.project.findUnique({ where: { code: 'PRJ-2026-001' } });
    const item = await prisma.item.findFirst();

    const pr = await procurementService.createPurchaseRequest(
      {
        projectId: proj1!.id,
        urgencyLevel: 'NORMAL',
        justification: 'Test de non-habilitation magasinier',
        desiredDate: new Date().toISOString(),
        lines: [
          {
            itemId: item!.id,
            description: item!.name,
            quantity: 10,
            unit: item!.unit,
            estimatedUnitPrice: 5000,
          },
        ],
      },
      rpUser,
    );

    // Tentative d'approbation par le magasinier
    await expect(
      procurementService.approvePurchaseRequest(
        pr.id,
        { approvedQuoteId: 'fake-id', decisionNotes: 'Validation interdite' },
        magUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  // TEST 3
  it('TEST 3 : Une demande d’achat doit suivre les transitions autorisées', async () => {
    const proj1 = await prisma.project.findUnique({ where: { code: 'PRJ-2026-001' } });
    const item = await prisma.item.findFirst();

    // Créer une DA directe
    const pr = await prisma.purchaseRequest.create({
      data: {
        reference: `DA-TEST-TRANS-${Date.now()}`,
        projectId: proj1!.id,
        createdById: rpUser.userId,
        status: PurchaseRequestStatus.CLOSED, // Déjà fermée
        justification: 'Test transition',
        desiredDate: new Date(),
        totalEstimatedAmount: 1000,
      },
    });

    // Tenter d'approuver une DA CLOSED doit échouer
    await expect(
      procurementService.approvePurchaseRequest(
        pr.id,
        { approvedQuoteId: 'fake', decisionNotes: 'Impossible' },
        dgUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 4
  it('TEST 4 : Une approbation ne peut être enregistrée deux fois (idempotence)', async () => {
    const proj1 = await prisma.project.findUnique({ where: { code: 'PRJ-2026-001' } });
    const item = await prisma.item.findFirst();
    const supplier = await prisma.supplier.findFirst();

    const pr = await procurementService.createPurchaseRequest(
      {
        projectId: proj1!.id,
        urgencyLevel: 'HIGH',
        justification: 'Test double approbation',
        desiredDate: new Date().toISOString(),
        lines: [
          {
            itemId: item!.id,
            description: item!.name,
            quantity: 5,
            unit: item!.unit,
            estimatedUnitPrice: 2000,
          },
        ],
      },
      rpUser,
    );

    const quote = await procurementService.addSupplierQuote(
      {
        purchaseRequestId: pr.id,
        supplierId: supplier!.id,
        totalAmountHT: 10000,
        deliveryLeadTimeDays: 5,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: '30 jours',
        lines: [
          {
            purchaseRequestLineId: pr.lines[0].id,
            unitPrice: 2000,
          },
        ],
      },
      rpUser,
    );

    // 1ère approbation : Succès
    const approved = await procurementService.approvePurchaseRequest(
      pr.id,
      { approvedQuoteId: quote.id, decisionNotes: 'Validation 1' },
      dgUser,
    );
    expect(approved.purchaseOrder).toBeDefined();

    // 2ème approbation immédiate : Rejet avec BadRequestException
    await expect(
      procurementService.approvePurchaseRequest(
        pr.id,
        { approvedQuoteId: quote.id, decisionNotes: 'Validation 2' },
        dgUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 5
  it('TEST 5 : Une réception augmente le stock une seule fois', async () => {
    const item = await prisma.item.findUnique({ where: { code: 'ART-002' } });
    const warehouse = await prisma.warehouse.findFirst();
    const supplier = await prisma.supplier.findFirst();
    const proj = await prisma.project.findFirst();

    const initialStock = item!.currentStock;

    // Créer un bon de commande de test
    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber: `BC-TEST-${Date.now()}`,
        purchaseRequestId: (await prisma.purchaseRequest.findFirst())!.id,
        supplierId: supplier!.id,
        projectId: proj!.id,
        totalAmountHT: 50000,
        totalAmountTTC: 59500,
        lines: {
          create: [
            {
              itemId: item!.id,
              description: item!.name,
              quantity: 20,
              unit: item!.unit,
              unitPrice: 2500,
              subtotal: 50000,
            },
          ],
        },
      },
      include: { lines: true },
    });

    // 1ère Réception
    await inventoryService.receiveGoods(
      {
        purchaseOrderId: po.id,
        warehouseId: warehouse!.id,
        deliveryNoteNumber: `BL-TEST-${Date.now()}`,
        lines: [{ purchaseOrderLineId: po.lines[0].id, quantityReceived: 20 }],
      },
      magUser,
    );

    const afterFirst = await prisma.item.findUnique({ where: { id: item!.id } });
    expect(afterFirst!.currentStock.toNumber()).toBe(initialStock.toNumber() + 20);

    // Tentative d'une deuxième réception excédant la commande doit échouer
    await expect(
      inventoryService.receiveGoods(
        {
          purchaseOrderId: po.id,
          warehouseId: warehouse!.id,
          deliveryNoteNumber: `BL-TEST-DOUBLE-${Date.now()}`,
          lines: [{ purchaseOrderLineId: po.lines[0].id, quantityReceived: 1 }],
        },
        magUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 6
  it('TEST 6 : Une sortie ne peut pas créer un stock négatif', async () => {
    const item = await prisma.item.findUnique({ where: { code: 'ART-004' } });
    const warehouse = await prisma.warehouse.findFirst();
    const proj = await prisma.project.findFirst();
    const emp = await prisma.employee.findFirst();

    const availableStock = item!.currentStock.toNumber();
    const excessiveQuantity = availableStock + 500;

    await expect(
      inventoryService.issueMaterialToProject(
        {
          projectId: proj!.id,
          warehouseId: warehouse!.id,
          itemId: item!.id,
          quantity: excessiveQuantity,
          recipientEmployeeId: emp!.id,
        },
        magUser,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // TEST 7
  it('TEST 7 : Les coûts du projet sont recalculés sans double comptabilisation', async () => {
    const proj = await prisma.project.findUnique({ where: { code: 'PRJ-2026-003' } });
    const item = await prisma.item.findUnique({ where: { code: 'ART-011' } });
    const warehouse = await prisma.warehouse.findFirst();
    const emp = await prisma.employee.findFirst();

    const initialActualCost = proj!.actualCost.toNumber();
    const issueQty = 5;
    const unitCost = item!.unitCost.toNumber();
    const expectedAddedCost = issueQty * unitCost;

    const res = await inventoryService.issueMaterialToProject(
      {
        projectId: proj!.id,
        warehouseId: warehouse!.id,
        itemId: item!.id,
        quantity: issueQty,
        recipientEmployeeId: emp!.id,
      },
      magUser,
    );

    const updatedProj = await prisma.project.findUnique({ where: { id: proj!.id } });
    expect(updatedProj!.actualCost.toNumber()).toBe(initialActualCost + expectedAddedCost);
  });

  // TEST 8
  it('TEST 8 : Les montants sont calculés avec le type Decimal', async () => {
    const pr = await prisma.purchaseRequest.findFirst();
    expect(pr!.totalEstimatedAmount instanceof Prisma.Decimal).toBe(true);

    const proj = await prisma.project.findFirst();
    expect(proj!.contractAmount instanceof Prisma.Decimal).toBe(true);
    expect(proj!.budgetAmount instanceof Prisma.Decimal).toBe(true);
    expect(proj!.actualCost instanceof Prisma.Decimal).toBe(true);
  });

  // TEST 9
  it('TEST 9 : Les décisions et actions sensibles apparaissent dans l’Audit Log', async () => {
    const recentLogs = await auditService.getRecentLogs(10);
    expect(recentLogs.length).toBeGreaterThan(0);
    expect(recentLogs.some(l => l.performerRole === SystemRole.DIRECTEUR_GENERAL || l.performerRole === SystemRole.RESPONSABLE_MAGASIN)).toBe(true);
  });

  // TEST 10
  it('TEST 10 : La commutation de rôle produit les permissions conformes', async () => {
    const dgAuth = await authService.switchDemoRole(SystemRole.DIRECTEUR_GENERAL);
    expect(dgAuth.user.role).toBe(SystemRole.DIRECTEUR_GENERAL);
    expect(dgAuth.user.permissions).toContain('procurement:approve');

    const rhAuth = await authService.switchDemoRole(SystemRole.RESPONSABLE_RH);
    expect(rhAuth.user.role).toBe(SystemRole.RESPONSABLE_RH);
    expect(rhAuth.user.permissions).not.toContain('procurement:approve');
    expect(rhAuth.user.permissions).toContain('hr:read');
  });

  // TEST 11
  it('TEST 11 : Les données du Dashboard DG correspondent exactement à la base', async () => {
    const kpis = await projectsService.getExecutiveKPIs();
    const projects = await prisma.project.findMany();

    let computedTurnover = new Prisma.Decimal(0);
    for (const p of projects) {
      computedTurnover = computedTurnover.plus(p.contractAmount);
    }

    expect(kpis.totalTurnover).toBe(computedTurnover.toString());
  });

  // TEST 12
  it('TEST 12 : Parcours bout en bout (Projet -> DA -> Devis -> Approbation -> BC -> Réception -> Sortie -> Dashboard)', async () => {
    // 1. Chef de projet crée DA de 100 vannes DN100 (ART-001)
    const proj = await prisma.project.findUnique({ where: { code: 'PRJ-2026-001' } });
    const vanne = await prisma.item.findUnique({ where: { code: 'ART-001' } });
    const supplier = await prisma.supplier.findUnique({ where: { code: 'FRN-001' } });
    const warehouse = await prisma.warehouse.findUnique({ where: { code: 'MAG-HMD' } });
    const emp = await prisma.employee.findFirst();

    const stockAvant = vanne!.currentStock.toNumber();
    const coutProjetAvant = proj!.actualCost.toNumber();

    // Étape 1 : Création DA
    const da = await procurementService.createPurchaseRequest(
      {
        projectId: proj!.id,
        urgencyLevel: 'HIGH',
        justification: 'Remplacement préventif vannes défectueuses ligne HP bloc 4',
        desiredDate: new Date('2026-06-01').toISOString(),
        lines: [
          {
            itemId: vanne!.id,
            description: vanne!.name,
            quantity: 100,
            unit: vanne!.unit,
            estimatedUnitPrice: 14500,
          },
        ],
      },
      rpUser,
    );
    expect(da.reference).toBeDefined();

    // Étape 2 : Offres fournisseurs & Soumission
    const quote = await procurementService.addSupplierQuote(
      {
        purchaseRequestId: da.id,
        supplierId: supplier!.id,
        totalAmountHT: 1420000,
        deliveryLeadTimeDays: 7,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: 'Virement 30j fin de mois',
        lines: [
          {
            purchaseRequestLineId: da.lines[0].id,
            unitPrice: 14200,
          },
        ],
      },
      rpUser,
    );

    await procurementService.submitForApproval(da.id, quote.id, rpUser);

    // Étape 3 : Approbation DG
    const approvalRes = await procurementService.approvePurchaseRequest(
      da.id,
      {
        approvedQuoteId: quote.id,
        decisionNotes: 'Offre Sarl Algérie Vannes validée sous délai 7 jours',
      },
      dgUser,
    );
    expect(approvalRes.purchaseOrder.orderNumber).toMatch(/^BC-2026-/);

    // Étape 4 & 5 : Réception magasin de 100 unités
    const po = approvalRes.purchaseOrder;
    await inventoryService.receiveGoods(
      {
        purchaseOrderId: po.id,
        warehouseId: warehouse!.id,
        deliveryNoteNumber: `BL-ALGVANNE-${Date.now()}`,
        lines: [
          {
            purchaseOrderLineId: po.lines[0].id,
            quantityReceived: 100,
          },
        ],
      },
      magUser,
    );

    const stockApresReception = await prisma.item.findUnique({ where: { id: vanne!.id } });
    expect(stockApresReception!.currentStock.toNumber()).toBe(stockAvant + 100);

    // Étape 6 : Sortie vers chantier de 40 unités
    const issueRes = await inventoryService.issueMaterialToProject(
      {
        projectId: proj!.id,
        warehouseId: warehouse!.id,
        itemId: vanne!.id,
        quantity: 40,
        workZone: 'Ligne Haute Pression Bloc 4',
        recipientEmployeeId: emp!.id,
      },
      magUser,
    );

    expect(issueRes.remainingStock.toNumber()).toBe(stockAvant + 60);

    // Étape 7 : Dashboard reflète le coût imputé (40 * 14200 = 568 000 DA)
    const kpisApres = await projectsService.getExecutiveKPIs();
    const projApres = await prisma.project.findUnique({ where: { id: proj!.id } });

    expect(projApres!.actualCost.toNumber()).toBe(coutProjetAvant + 568000);
  });
});
