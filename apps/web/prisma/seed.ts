import { 
  PrismaClient, 
  SystemRole, 
  DepartmentCode, 
  IndustrialSector, 
  ProjectStatus, 
  ProjectRiskLevel, 
  PurchaseRequestStatus, 
  PurchaseOrderStatus,
  CostSheetStatus 
} from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

let dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const directMatch = envContent.match(/DIRECT_URL=["']?([^"'\r\n]+)["']?/);
    const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    dbUrl = (directMatch ? directMatch[1] : (dbMatch ? dbMatch[1] : dbUrl));
  }
} catch {
  // ignore
}

dbUrl = dbUrl.replace('-pooler', '') + (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=25';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log('🚀 [SEED] Initialisation des données réelles de démonstration client SILEX SERVICES...');

  const passwordHash = await argon2.hash('Password123!');

  // 1. DÉPARTEMENTS
  const departmentsData = [
    { code: DepartmentCode.DIRECTION_GENERALE, name: 'Direction Générale', description: 'Gouvernance, stratégie et pilotage exécutif' },
    { code: DepartmentCode.OPERATIONS_PROJETS, name: 'Opérations & Projets', description: 'Direction technique, conduite des chantiers et ingénierie' },
    { code: DepartmentCode.ACHATS_LOGISTIQUE, name: 'Achats & Approvisionnements', description: 'Sourcing, consultations fournisseurs et logistique chantier' },
    { code: DepartmentCode.MAGASIN_STOCKS, name: 'Magasins & Stocks', description: 'Gestion des réceptions, entreposage et sorties matériels' },
    { code: DepartmentCode.RESSOURCES_HUMAINES, name: 'Ressources Humaines', description: 'Gestion du personnel, habilitations soudage et présences' },
    { code: DepartmentCode.FINANCE_COMPTABILITE, name: 'Finance & Trésorerie', description: 'Budgets projets, facturation, trésorerie et engagements' },
    { code: DepartmentCode.PARC_MAINTENANCE, name: 'Parc Matériel & Maintenance', description: 'Disponibilité des engins, équipements de soudage et révisions' },
    { code: DepartmentCode.QHSE, name: 'Qualité, Hygiène, Sécurité & CND', description: 'Qualité, sécurité chantier, traçabilité et conformité ISO' },
    { code: DepartmentCode.INFORMATIQUE_ADMIN, name: 'Systèmes d’Information', description: 'Systèmes d’information et administration de la plateforme' },
  ];

  for (const dep of departmentsData) {
    await prisma.department.upsert({
      where: { code: dep.code },
      update: { name: dep.name, description: dep.description },
      create: dep,
    });
  }

  const deptMap = await prisma.department.findMany();
  const getDeptId = (code: DepartmentCode) => deptMap.find(d => d.code === code)?.id;

  // 2. UTILISATEURS DU SYSTÈME (6 PROFILS DÉMO CLÉS + ALIASES)
  const usersData = [
    { id: 'usr-dg-001', email: 'dg@silex-services.dz', name: 'Amine Benali', title: 'Directeur Général', role: SystemRole.DIRECTEUR_GENERAL, deptCode: DepartmentCode.DIRECTION_GENERALE },
    { id: 'usr-dg-002', email: 'a.benali@silex-services.dz', name: 'Amine Benali', title: 'Directeur Général', role: SystemRole.DIRECTEUR_GENERAL, deptCode: DepartmentCode.DIRECTION_GENERALE },
    { id: 'usr-com-001', email: 'commercial@silex-services.dz', name: 'Yacine Hamidi', title: 'Responsable Commercial & Devis', role: SystemRole.RESPONSABLE_PROJET, deptCode: DepartmentCode.DIRECTION_GENERALE },
    { id: 'usr-rp-001', email: 'projets@silex-services.dz', name: 'Karim Mansouri', title: 'Directeur des Opérations & Chantiers', role: SystemRole.RESPONSABLE_PROJET, deptCode: DepartmentCode.OPERATIONS_PROJETS },
    { id: 'usr-rp-002', email: 'k.mansouri@silex-services.dz', name: 'Karim Mansouri', title: 'Directeur des Opérations & Chantiers', role: SystemRole.RESPONSABLE_PROJET, deptCode: DepartmentCode.OPERATIONS_PROJETS },
    { id: 'usr-ach-001', email: 'achats@silex-services.dz', name: 'Farouk Brahimi', title: 'Responsable Achats & Logistique', role: SystemRole.RESPONSABLE_ACHATS, deptCode: DepartmentCode.ACHATS_LOGISTIQUE },
    { id: 'usr-ach-002', email: 'f.brahimi@silex-services.dz', name: 'Farouk Brahimi', title: 'Responsable Achats & Logistique', role: SystemRole.RESPONSABLE_ACHATS, deptCode: DepartmentCode.ACHATS_LOGISTIQUE },
    { id: 'usr-rh-001', email: 'rh@silex-services.dz', name: 'Sabrina Haddad', title: 'Responsable Ressources Humaines', role: SystemRole.RESPONSABLE_RH, deptCode: DepartmentCode.RESSOURCES_HUMAINES },
    { id: 'usr-rh-002', email: 's.haddad@silex-services.dz', name: 'Sabrina Haddad', title: 'Responsable Ressources Humaines', role: SystemRole.RESPONSABLE_RH, deptCode: DepartmentCode.RESSOURCES_HUMAINES },
    { id: 'usr-fin-001', email: 'finance@silex-services.dz', name: 'Réda Bouzid', title: 'Directeur Financier & Trésorerie', role: SystemRole.RESPONSABLE_FINANCIER, deptCode: DepartmentCode.FINANCE_COMPTABILITE },
    { id: 'usr-fin-002', email: 'r.bouzid@silex-services.dz', name: 'Réda Bouzid', title: 'Directeur Financier & Trésorerie', role: SystemRole.RESPONSABLE_FINANCIER, deptCode: DepartmentCode.FINANCE_COMPTABILITE },
    { id: 'usr-mag-001', email: 'magasin@silex-services.dz', name: 'Tarek Meziani', title: 'Responsable Magasin & Stocks', role: SystemRole.RESPONSABLE_MAGASIN, deptCode: DepartmentCode.MAGASIN_STOCKS },
    { id: 'usr-adm-001', email: 'admin@silex-services.dz', name: 'Super Administrateur SILEX', title: 'Administrateur Plateforme', role: SystemRole.ADMINISTRATEUR, deptCode: DepartmentCode.INFORMATIQUE_ADMIN },
  ];

  for (const u of usersData) {
    const depId = getDeptId(u.deptCode);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.deptCode,
        departmentId: depId,
        passwordHash,
        active: true,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash,
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.deptCode,
        departmentId: depId,
        active: true,
      },
    });
  }

  // 3. FOURNISSEURS HOMOLOGUÉS
  const suppliersData = [
    { code: 'FRN-001', name: 'Sarl Algérie Vannes & Robinetterie', contactName: 'Mourad Cherif', email: 'contact@algerievannes.dz', phone: '+213 21 82 45 10', address: 'Zone Industrielle Dar El Beida, Alger', specialties: 'Robinetterie PN40/PN100, vannes API, clapets', rating: 4.8 },
    { code: 'FRN-002', name: 'Eurl Comptoir Sidérurgique & Métallurgique', contactName: 'Djamel Hadj', email: 'ventes@siderurgique-est.dz', phone: '+213 38 72 11 00', address: 'Zone Industrielle Chaiba, Annaba', specialties: 'Tubes ASTM A106, brides forgées, tôles chaudronnerie', rating: 4.6 },
    { code: 'FRN-003', name: 'Sarl Gaz & Soudure Industrielle DZ', contactName: 'Hocine Kaci', email: 'kaci@gaz-soudure.dz', phone: '+213 29 73 55 20', address: 'Zone Industrielle Irara, Hassi Messaoud', specialties: 'Électrodes E7018, fils TIG Inox, postes de soudage', rating: 4.9 },
    { code: 'FRN-004', name: 'Eurl Robinetterie & Brides Industrielles Oran', contactName: 'Nabil Mansour', email: 'contact@rbi-oran.dz', phone: '+213 41 40 18 90', address: 'Zone Industrielle Es Senia, Oran', specialties: 'Brides forgées WNRF/BLRF, visserie B7/2H', rating: 4.5 },
  ];

  for (const s of suppliersData) {
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
  }

  // 4. LES 3 PROJETS ACTIFS (ARZEW, HASSI MESSAOUD, SKIKDA)
  const managerUser = await prisma.user.findFirst({ where: { role: SystemRole.RESPONSABLE_PROJET } });
  const managerId = managerUser ? managerUser.id : 'usr-rp-001';

  const projectsData = [
    {
      code: 'PRJ-ARZ-01',
      name: 'Maintenance Turbine & Réfection Circuit Vapeur Arzew',
      description: 'Arrêt programmé unité de liquéfaction GNL Bethioua, remplacement tuyauteries haute température et révision des vannes de régulation.',
      clientName: 'Sonatrach Activité Aval',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId,
      siteLocation: 'Zone Pétrochimique Bethioua, Arzew',
      startDate: new Date('2026-01-10'),
      contractEndDate: new Date('2026-07-31'),
      contractAmount: 185000000,
      budgetAmount: 142000000,
      committedCost: 88500000,
      actualCost: 71200000,
      physicalProgress: 65.0,
      financialProgress: 60.5,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.LOW,
      priority: 'HIGH',
      objectives: 'Respect impératif du planning arrêt d’unité de 45 jours.',
    },
    {
      code: 'PRJ-HMD-02',
      name: 'Charpente Métallique & Préfabrication Collecteurs Hassi Messaoud',
      description: 'Préfabrication et érection charpente lourde pour nouveau module de compression gaz Sud, épreuves hydrostatiques 150 bar.',
      clientName: 'Sonatrach Activité Amont',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId,
      siteLocation: 'Base Irara, Hassi Messaoud',
      startDate: new Date('2026-03-01'),
      contractEndDate: new Date('2026-10-31'),
      contractAmount: 120000000,
      budgetAmount: 95000000,
      committedCost: 28000000,
      actualCost: 18500000,
      physicalProgress: 25.0,
      financialProgress: 22.0,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.MEDIUM,
      priority: 'NORMAL',
      objectives: 'Assemblage sur site et contrôle radio 100% soudures.',
    },
    {
      code: 'PRJ-SKI-03',
      name: 'Tuyauterie Industrielle & Remplacement Faisceaux Skikda',
      description: 'Revamping des colonnes de distillation, remplacement des lignes Inox 316L DN200 et épreuve hydraulique décennale.',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId,
      siteLocation: 'Zone Industrielle Skikda RA1K',
      startDate: new Date('2026-02-15'),
      contractEndDate: new Date('2026-08-30'),
      contractAmount: 145000000,
      budgetAmount: 110000000,
      committedCost: 52000000,
      actualCost: 44800000,
      physicalProgress: 45.0,
      financialProgress: 42.5,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.LOW,
      priority: 'HIGH',
      objectives: 'Mise en conformité DESP et réception sans réserve.',
    },
  ];

  for (const p of projectsData) {
    const proj = await prisma.project.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    });

    await prisma.userProjectAssignment.upsert({
      where: {
        userId_projectId: {
          userId: managerId,
          projectId: proj.id,
        },
      },
      update: {},
      create: {
        userId: managerId,
        projectId: proj.id,
      },
    });
  }

  // 5. DEMANDE D'ACHAT AVEC 3 OFFRES COMPARATIVES POUR LE TCO
  const projSkikda = await prisma.project.findUnique({ where: { code: 'PRJ-SKI-03' } });
  const buyerUser = await prisma.user.findFirst({ where: { role: SystemRole.RESPONSABLE_ACHATS } });
  const sup1 = await prisma.supplier.findUnique({ where: { code: 'FRN-001' } });
  const sup2 = await prisma.supplier.findUnique({ where: { code: 'FRN-002' } });
  const sup3 = await prisma.supplier.findUnique({ where: { code: 'FRN-003' } });

  if (projSkikda && buyerUser && sup1 && sup2 && sup3) {
    const pr = await prisma.purchaseRequest.upsert({
      where: { reference: 'DA-2026-001' },
      update: {
        projectId: projSkikda.id,
        status: PurchaseRequestStatus.PENDING_APPROVAL,
        totalEstimatedAmount: 1850000,
      },
      create: {
        reference: 'DA-2026-001',
        projectId: projSkikda.id,
        createdById: buyerUser.id,
        urgencyLevel: 'HIGH',
        justification: 'Vannes haute pression PN40 et brides pour épreuve hydraulique arrêt Skikda.',
        desiredDate: new Date(Date.now() + 10 * 86400000),
        status: PurchaseRequestStatus.PENDING_APPROVAL,
        totalEstimatedAmount: 1850000,
      },
    });

    // 3 Devis pour la comparaison TCO
    await prisma.supplierQuote.deleteMany({ where: { purchaseRequestId: pr.id } });

    await prisma.supplierQuote.createMany({
      data: [
        {
          purchaseRequestId: pr.id,
          supplierId: sup1.id,
          quoteReference: 'DEV-AV-2026-89',
          totalAmountHT: 1850000,
          deliveryLeadTimeDays: 7,
          stockAvailability: 'IMMEDIATE',
          technicalCompliance: true,
          warrantyMonths: 24,
          paymentTerms: '30 jours fin de mois',
          notes: 'Certificats matière CCPU 3.1 et conformité ATEX garantis.',
          isRecommended: true,
          isApproved: false,
        },
        {
          purchaseRequestId: pr.id,
          supplierId: sup2.id,
          quoteReference: 'DEV-CSM-4410',
          totalAmountHT: 2100000,
          deliveryLeadTimeDays: 14,
          stockAvailability: 'PARTIAL',
          technicalCompliance: true,
          warrantyMonths: 12,
          paymentTerms: '45 jours',
          notes: 'Offre concurrente, délai supérieur aux exigences chantier.',
          isRecommended: false,
          isApproved: false,
        },
        {
          purchaseRequestId: pr.id,
          supplierId: sup3.id,
          quoteReference: 'DEV-GSI-1105',
          totalAmountHT: 1980000,
          deliveryLeadTimeDays: 10,
          stockAvailability: 'IMMEDIATE',
          technicalCompliance: true,
          warrantyMonths: 12,
          paymentTerms: 'Comptant à la livraison',
          notes: 'Conditions de paiement moins favorables.',
          isRecommended: false,
          isApproved: false,
        },
      ],
    });
  }

  // 6. CONSULTATION & FICHE DE COÛT EN ATTENTE DE VALIDATION DG (PRÊTE POUR LA DÉMO LIVE)
  const opp = await prisma.opportunity.upsert({
    where: { code: 'OPP-2026-001' },
    update: {
      title: 'Rénovation tuyauteries HP vapeur 80 bar',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: IndustrialSector.OIL_AND_GAS,
      estimatedAmount: 38700000,
      winProbability: 85,
      status: 'VALIDATION_INTERNE',
      location: 'Zone Industrielle Skikda RA1K',
      wilaya: 'Skikda',
      contactName: 'M. Cherif (Directeur Technique)',
      contactEmail: 'cherif.ra1k@sonatrach.dz',
    },
    create: {
      code: 'OPP-2026-001',
      title: 'Rénovation tuyauteries HP vapeur 80 bar',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: IndustrialSector.OIL_AND_GAS,
      location: 'Zone Industrielle Skikda RA1K',
      wilaya: 'Skikda',
      estimatedAmount: 38700000,
      winProbability: 85,
      status: 'VALIDATION_INTERNE',
      contactName: 'M. Cherif (Directeur Technique)',
      contactEmail: 'cherif.ra1k@sonatrach.dz',
    },
  });

  const cs = await prisma.costSheet.upsert({
    where: { reference: 'FC-2026-001' },
    update: {
      title: 'Rénovation tuyauteries HP vapeur 80 bar',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      status: CostSheetStatus.EN_ATTENTE_DG,
      totalDirectCost: 26090000,
      totalIndirectCost: 3130800,
      totalEstimatedCost: 29220800,
      proposedSellingPrice: 38700000,
      estimatedMarginValue: 9479200,
      targetMarginPercent: 24.49,
      markupRate: 32.44,
      dgDecision: 'PENDING',
      dgDecisionNotes: 'En attente d’arbitrage final de la Direction Générale pour validation de l’offre et lancement du projet.',
    },
    create: {
      reference: 'FC-2026-001',
      opportunityId: opp.id,
      title: 'Rénovation tuyauteries HP vapeur 80 bar',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: 'OIL_AND_GAS',
      siteLocation: 'Zone Industrielle Skikda RA1K',
      currency: 'DZD',
      status: CostSheetStatus.EN_ATTENTE_DG,
      version: 1,
      totalDirectCost: 26090000,
      totalIndirectCost: 3130800,
      totalEstimatedCost: 29220800,
      proposedSellingPrice: 38700000,
      estimatedMarginValue: 9479200,
      targetMarginPercent: 24.49,
      markupRate: 32.44,
      dgDecision: 'PENDING',
      dgDecisionNotes: 'En attente d’arbitrage final de la Direction Générale pour validation de l’offre et lancement du projet.',
    },
  });

  const contributions = [
    {
      department: 'PROJET' as any,
      responsibleName: 'Karim Mansouri (Chef de Projets)',
      completed: true,
      completedAt: new Date(),
      summaryNotes: 'Métrés validés : 400ml tuyauteries Inox 316L DN150/200, épreuves hydrostatiques 120 bar, zone ATEX 1.',
      dataPayload: {
        durationDays: 45,
        atexZone: 'Zone 1 (Arrêt d\'unité strict)',
        meansRequired: '2 Postes TIG orbital, 1 grue mobile 50T, compresseurs 200 bar, échafaudages ATEX'
      }
    },
    {
      department: 'ACHATS' as any,
      responsibleName: 'Farouk Brahimi (Responsable Achats)',
      completed: true,
      completedAt: new Date(),
      summaryNotes: 'Cotations matières reçues des fournisseurs homologués. Prix acier inoxydable stabilisé.',
      dataPayload: {
        materialsCost: 14500000,
        equipmentRental: 4800000,
        consumablesCost: 2200000
      }
    },
    {
      department: 'RH' as any,
      responsibleName: 'Sabrina Haddad (Responsable RH)',
      completed: true,
      completedAt: new Date(),
      summaryNotes: 'Équipe dédiée mobilisée : 2 Soudeurs homologués 6G ASME IX, 4 Tuyauteurs qualifiés.',
      dataPayload: {
        totalLaborCost: 8500000,
        shiftsCount: 2,
        hseInductionDone: true
      }
    },
    {
      department: 'FINANCE' as any,
      responsibleName: 'Réda Bouzid (Directeur Financier)',
      completed: true,
      completedAt: new Date(),
      summaryNotes: 'Avis Favorable : Risque de crédit nul (Client Sonatrach), conditions de paiement 30j fin de mois acceptées.',
      dataPayload: {
        financialRiskRating: 'FAIBLE_A',
        paymentTermsEstimated: '30 jours fin de mois après situation de travaux',
        financingNeedAmount: 12500000,
        financeNotes: 'Trésorerie suffisante pour préfinancement approvisionnements. Marge brute cible respectée (24.5%).'
      }
    }
  ];

  for (const c of contributions) {
    await prisma.costSheetContribution.upsert({
      where: {
        costSheetId_department: {
          costSheetId: cs.id,
          department: c.department
        }
      },
      update: c,
      create: {
        ...c,
        costSheetId: cs.id
      }
    });
  }

  // 7. 15 EMPLOYÉS INDUSTRIELS & QUALIFIÉS
  const hrDept = await prisma.department.findUnique({ where: { code: DepartmentCode.RESSOURCES_HUMAINES } });
  const opsDept = await prisma.department.findUnique({ where: { code: DepartmentCode.OPERATIONS_PROJETS } });
  const targetDeptId = opsDept ? opsDept.id : (hrDept ? hrDept.id : deptMap[0].id);

  const employeesData = [
    { reg: 'EMP-001', first: 'Abdelkader', last: 'Meziane', title: 'Superviseur Général Tuyauterie & Soudage', contract: 'CDI', phone: '+213 661 10 20 30' },
    { reg: 'EMP-002', first: 'Billel', last: 'Slimani', title: 'Soudeur Haute Pression Homologué 6G (GTAW/SMAW)', contract: 'CDI', phone: '+213 662 11 22 33' },
    { reg: 'EMP-003', first: 'Farid', last: 'Dahmani', title: 'Soudeur TIG Inox 316L & Alliages Spéciaux', contract: 'CDI', phone: '+213 663 22 33 44' },
    { reg: 'EMP-004', first: 'Mourad', last: 'Saidi', title: 'Tuyauteur Industriel Qualifié', contract: 'CDI', phone: '+213 664 33 44 55' },
    { reg: 'EMP-005', first: 'Khaled', last: 'Boussaid', title: 'Tuyauteur Traceur / Monteur', contract: 'CDD', phone: '+213 665 44 55 66' },
    { reg: 'EMP-006', first: 'Hamid', last: 'Benali', title: 'Chaudronnier / Fabricant d’Atelier', contract: 'CDI', phone: '+213 666 55 66 77' },
    { reg: 'EMP-007', first: 'Nassim', last: 'Ghoulem', title: 'Électromécanicien Maintenance Industrielle', contract: 'CDI', phone: '+213 667 66 77 88' },
    { reg: 'EMP-008', first: 'Tahar', last: 'Boukhalfa', title: 'Technicien HVAC & Climatisation Industrielle', contract: 'CDI', phone: '+213 668 77 88 99' },
    { reg: 'EMP-009', first: 'Rachid', last: 'Bensalem', title: 'Grutier Certifié Levage Lourd (50T-200T)', contract: 'CDI', phone: '+213 669 88 99 00' },
    { reg: 'EMP-010', first: 'Walid', last: 'Medjahdi', title: 'Inspecteur CND Niveau II (Ressuage / Radio)', contract: 'CDI', phone: '+213 670 99 00 11' },
    { reg: 'EMP-011', first: 'Samir', last: 'Boutaleb', title: 'Ingénieur Calculs & Métrés Chantiers', contract: 'CDI', phone: '+213 671 00 11 22' },
    { reg: 'EMP-012', first: 'Ayoub', last: 'Rahmani', title: 'Animateur Sécurité HSE Chantier', contract: 'CDI', phone: '+213 672 11 22 33' },
    { reg: 'EMP-013', first: 'Redha', last: 'Senoussi', title: 'Échafaudeur Agréé Zone ATEX 1', contract: 'CDD', phone: '+213 673 22 33 44' },
    { reg: 'EMP-014', first: 'Yacine', last: 'Zouad', title: 'Soudeur Miroir Tubeurs Échangeurs', contract: 'CDD', phone: '+213 674 33 44 55' },
    { reg: 'EMP-015', first: 'Karim', last: 'Haddad', title: 'Chef d’Équipe Montage & Tuyauterie', contract: 'CDI', phone: '+213 675 44 55 66' },
  ];

  for (const emp of employeesData) {
    const createdEmp = await prisma.employee.upsert({
      where: { registrationNumber: emp.reg },
      update: {
        firstName: emp.first,
        lastName: emp.last,
        title: emp.title,
        phone: emp.phone,
        contractType: emp.contract,
      },
      create: {
        registrationNumber: emp.reg,
        firstName: emp.first,
        lastName: emp.last,
        title: emp.title,
        departmentId: targetDeptId,
        email: `${emp.first[0].toLowerCase()}.${emp.last.toLowerCase()}@silex-services.dz`,
        phone: emp.phone,
        contractType: emp.contract,
        hireDate: new Date('2023-01-15'),
        status: 'ACTIF',
      },
    });

    // Pointage présent du jour sur PRJ-SKI-03
    if (projSkikda) {
      await prisma.attendance.create({
        data: {
          employeeId: createdEmp.id,
          projectId: projSkikda.id,
          date: new Date(),
          regularHours: 8,
          overtimeHours: 2,
          isAbsent: false,
        },
      });
    }
  }

  // 8. SYNCHRONISATION DU STORE SERVEUR POUR LES DÉMONSTRATIONS EN MÉMOIRE
  console.log('✅ [SEED] Base Neon PostgreSQL peuplée avec succès avec des données industrielles 100% crédibles !');
}

main()
  .catch((e) => {
    console.error('❌ [SEED] Erreur critique :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
