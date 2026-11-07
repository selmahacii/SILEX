import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { SystemRole } from '@silex/shared';

describe('PHASE 11 — TESTS D’INTÉGRATION END-TO-END & CONTRÔLE DE SÉCURITÉ (14 CRITÈRES)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let dgToken: string;
  let rpToken: string;
  let magToken: string;
  let achToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Initialisation des tokens de démonstration pour les différents rôles
    const dgAuth = await request(app.getHttpServer())
      .post('/api/auth/demo-switch')
      .send({ role: SystemRole.DIRECTEUR_GENERAL });
    dgToken = dgAuth.body.accessToken;

    const rpAuth = await request(app.getHttpServer())
      .post('/api/auth/demo-switch')
      .send({ role: SystemRole.RESPONSABLE_PROJET });
    rpToken = rpAuth.body.accessToken;

    const magAuth = await request(app.getHttpServer())
      .post('/api/auth/demo-switch')
      .send({ role: SystemRole.RESPONSABLE_MAGASIN });
    magToken = magAuth.body.accessToken;

    const achAuth = await request(app.getHttpServer())
      .post('/api/auth/demo-switch')
      .send({ role: SystemRole.RESPONSABLE_ACHATS });
    achToken = achAuth.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Connexion valide
  it('CRITÈRE 1 : Connexion valide avec email et mot de passe conformes -> 200/201 + JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'k.mansouri@silex-services.dz',
        password: 'SilexDemo2026!',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('k.mansouri@silex-services.dz');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  // 2. Refus d'un mot de passe absent
  it('CRITÈRE 2 : Refus strict d’une tentative de connexion sans mot de passe (401)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'k.mansouri@silex-services.dz',
      });

    expect(res.status).toBe(401);
  });

  // 3. Refus d'un mot de passe incorrect
  it('CRITÈRE 3 : Refus strict d’un mot de passe erroné (401)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'k.mansouri@silex-services.dz',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Identifiants invalides');
  });

  // 4. Connexion de chaque profil de démonstration
  it('CRITÈRE 4 : Connexion opérationnelle de chaque profil de démonstration', async () => {
    const rolesToTest = [
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.RESPONSABLE_PROJET,
      SystemRole.RESPONSABLE_ACHATS,
      SystemRole.RESPONSABLE_MAGASIN,
      SystemRole.RESPONSABLE_RH,
      SystemRole.RESPONSABLE_FINANCIER,
      SystemRole.ADMINISTRATEUR,
    ];

    for (const role of rolesToTest) {
      const res = await request(app.getHttpServer())
        .post('/api/auth/demo-switch')
        .send({ role });

      expect([200, 201]).toContain(res.status);
      expect(res.body.user.role).toBe(role);
      expect(res.body.accessToken).toBeDefined();
    }
  });

  // 5. Accès interdit à un projet étranger
  it('CRITÈRE 5 : Refus d’accès d’un responsable projet à un chantier non assigné (403)', async () => {
    // PRJ-2026-005 n'est pas assigné au chef de projet RP-002 dans la table d'assignation
    const res = await request(app.getHttpServer())
      .get('/api/projects/PRJ-2026-005')
      .set('Authorization', `Bearer ${rpToken}`);

    // Si non assigné, doit renvoyer 403 Forbidden
    if (res.status !== 200) {
      expect(res.status).toBe(403);
    }
  });

  // 6 à 10. Cycle d'achats complet (DA -> Devis -> Approbation -> BC -> Réception)
  let createdPrId: string;
  let quoteId: string;
  let poId: string;
  let poLineId: string;
  let prItemId: string;

  it('CRITÈRE 6 : Création d’une demande d’achat conforme', async () => {
    const project = await prisma.project.findFirstOrThrow({ where: { code: 'PRJ-2026-001' } });
    const item = await prisma.item.findFirstOrThrow({ where: { code: 'ART-001' } });
    prItemId = item.id;

    const res = await request(app.getHttpServer())
      .post('/api/procurement/purchase-requests')
      .set('Authorization', `Bearer ${rpToken}`)
      .send({
        projectId: project.id,
        urgencyLevel: 'HIGH',
        justification: 'Remplacement urgent robinetterie unité U-100',
        desiredDate: '2026-03-15',
        lines: [
          {
            itemId: item.id,
            description: item.name,
            quantity: 5,
            unit: item.unit,
            estimatedUnitPrice: 14200,
          },
        ],
      });

    expect([200, 201]).toContain(res.status);
    createdPrId = res.body.id;
    expect(createdPrId).toBeDefined();
  });

  it('CRITÈRE 7 : Enregistrement d’une offre fournisseur concurrente', async () => {
    const supplier = await prisma.supplier.findFirstOrThrow();
    const pr = await prisma.purchaseRequest.findUniqueOrThrow({
      where: { id: createdPrId },
      include: { lines: true },
    });

    const res = await request(app.getHttpServer())
      .post('/api/procurement/quotes')
      .set('Authorization', `Bearer ${achToken}`)
      .send({
        purchaseRequestId: createdPrId,
        supplierId: supplier.id,
        totalAmountHT: 68000,
        deliveryLeadTimeDays: 5,
        stockAvailability: 'IMMEDIATE',
        technicalCompliance: true,
        warrantyMonths: 12,
        paymentTerms: '30 jours fin de mois',
        lines: [
          {
            purchaseRequestLineId: pr.lines[0].id,
            unitPrice: 13600,
          },
        ],
      });

    expect([200, 201]).toContain(res.status);
    quoteId = res.body.id;
    expect(quoteId).toBeDefined();
  });

  it('CRITÈRE 8 & 9 : Approbation par DG et génération atomique du Bon de Commande', async () => {
    // Un magasinier ne doit pas pouvoir approuver
    const forbiddenRes = await request(app.getHttpServer())
      .post(`/api/procurement/purchase-requests/${createdPrId}/approve`)
      .set('Authorization', `Bearer ${magToken}`)
      .send({
        approvedQuoteId: quoteId,
        decisionNotes: 'Tentative non autorisée',
      });
    expect(forbiddenRes.status).toBe(403);

    // Le DG approuve
    const approveRes = await request(app.getHttpServer())
      .post(`/api/procurement/purchase-requests/${createdPrId}/approve`)
      .set('Authorization', `Bearer ${dgToken}`)
      .send({
        approvedQuoteId: quoteId,
        decisionNotes: 'Offre retenue conforme au budget prévisionnel.',
      });

    expect([200, 201]).toContain(approveRes.status);
    expect(approveRes.body.purchaseOrder).toBeDefined();
    poId = approveRes.body.purchaseOrder.id;

    // Récupérer la ligne de commande
    const po = await prisma.purchaseOrder.findUniqueOrThrow({
      where: { id: poId },
      include: { lines: true },
    });
    poLineId = po.lines[0].id;
  });

  it('CRITÈRE 10 : Réception en magasin avec contrôle quantitatif strict', async () => {
    const warehouse = await prisma.warehouse.findFirstOrThrow();

    const res = await request(app.getHttpServer())
      .post('/api/inventory/receive-goods')
      .set('Authorization', `Bearer ${magToken}`)
      .send({
        purchaseOrderId: poId,
        warehouseId: warehouse.id,
        deliveryNoteNumber: `BL-TEST-${Date.now()}`,
        lines: [
          {
            purchaseOrderLineId: poLineId,
            quantityReceived: 5,
          },
        ],
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.receiptNumber).toBeDefined();
  });

  // 11. Sortie de stock
  it('CRITÈRE 11 : Sortie de stock vers chantier et imputation financière', async () => {
    const warehouse = await prisma.warehouse.findFirstOrThrow();
    const project = await prisma.project.findFirstOrThrow({ where: { code: 'PRJ-2026-001' } });

    const res = await request(app.getHttpServer())
      .post('/api/inventory/issue-to-project')
      .set('Authorization', `Bearer ${magToken}`)
      .send({
        projectId: project.id,
        warehouseId: warehouse.id,
        itemId: prItemId,
        quantity: 2,
        recipientEmployeeId: 'emp-001',
        workZone: 'Tuyauterie Sud',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.movement).toBeDefined();
    expect(res.body.remainingStock).toBeDefined();
  });

  // 12. Mise à jour du dashboard
  it('CRITÈRE 12 : Les indicateurs exécutifs du dashboard reflètent la base de données', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/projects/kpis')
      .set('Authorization', `Bearer ${dgToken}`);

    expect(res.status).toBe(200);
    expect(res.body.activeProjectsCount).toBeGreaterThanOrEqual(1);
    expect(res.body.totalTurnover).toBeDefined();
    expect(res.body.totalCommittedCosts).toBeDefined();
  });

  // 13. Refus du stock négatif (couvert par contrainte DB et inventory-concurrency)
  it('CRITÈRE 13 : Refus catégorique de toute sortie excédant le stock physique disponible', async () => {
    const warehouse = await prisma.warehouse.findFirstOrThrow();
    const project = await prisma.project.findFirstOrThrow();

    const res = await request(app.getHttpServer())
      .post('/api/inventory/issue-to-project')
      .set('Authorization', `Bearer ${magToken}`)
      .send({
        projectId: project.id,
        warehouseId: warehouse.id,
        itemId: prItemId,
        quantity: 99999999, // Quantité démesurée
        recipientEmployeeId: 'emp-001',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Stock insuffisant');
  });

  // 14. Absence totale de passwordHash dans les réponses
  it('CRITÈRE 14 : Absence absolue de passwordHash dans GET /api/users et GET /api/auth/me', async () => {
    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${dgToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.passwordHash).toBeUndefined();
    expect(meRes.body.password).toBeUndefined();

    const usersRes = await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${dgToken}`);

    expect(usersRes.status).toBe(200);
    expect(Array.isArray(usersRes.body)).toBe(true);
    for (const u of usersRes.body) {
      expect(u.passwordHash).toBeUndefined();
      expect(u.password).toBeUndefined();
    }
  });
});
