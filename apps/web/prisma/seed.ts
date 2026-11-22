import { 
  PrismaClient, 
  SystemRole, 
  DepartmentCode,
  IndustrialSector,
  ProjectStatus,
  ProjectRiskLevel,
  ServiceOrderType,
  ServiceOrderStatus,
  AssetType,
  AssetStatus,
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

// Keep connection alive with reasonable timeout
if (!dbUrl.includes('connect_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=30';
}

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log('🚀 [SEED] Initialisation rapide et robuste des données industrielles exemplaires SILEX SERVICES...');

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

  // 2. UTILISATEURS (18 utilisateurs)
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
    { id: 'usr-mag-002', email: 't.meziani@silex-services.dz', name: 'Tarek Meziani', title: 'Responsable Magasin & Stocks', role: SystemRole.RESPONSABLE_MAGASIN, deptCode: DepartmentCode.MAGASIN_STOCKS },
    { id: 'usr-maint-001', email: 'maintenance@silex-services.dz', name: 'Mourad Zitouni', title: 'Responsable Parc & Maintenance', role: SystemRole.RESPONSABLE_MAINTENANCE, deptCode: DepartmentCode.PARC_MAINTENANCE },
    { id: 'usr-maint-002', email: 'm.zitouni@silex-services.dz', name: 'Mourad Zitouni', title: 'Responsable Parc & Maintenance', role: SystemRole.RESPONSABLE_MAINTENANCE, deptCode: DepartmentCode.PARC_MAINTENANCE },
    { id: 'usr-qhse-001', email: 'qualite@silex-services.dz', name: 'Nadia Chaib', title: 'Responsable QHSE & CND', role: SystemRole.RESPONSABLE_QUALITE, deptCode: DepartmentCode.QHSE },
    { id: 'usr-qhse-002', email: 'n.chaib@silex-services.dz', name: 'Nadia Chaib', title: 'Responsable QHSE & CND', role: SystemRole.RESPONSABLE_QUALITE, deptCode: DepartmentCode.QHSE },
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

  // 3. MAGASINS
  const warehousesData = [
    { id: 'wh-arzew', code: 'MAG-ARZ', name: 'Magasin Central Base Logistique Arzew', location: 'Zone Industrielle Ouest, BP 120, Arzew', managerName: 'Tarek Meziani' },
    { id: 'wh-hmd', code: 'MAG-HMD', name: 'Magasin Régional Base Sud Hassi Messaoud', location: 'Zone Industrielle Irara, Hassi Messaoud', managerName: 'Mourad Zitouni' },
    { id: 'wh-ski', code: 'MAG-SKI', name: 'Dépôt Régional Chantier Skikda RA1K', location: 'Zone Pétrochimique, Skikda', managerName: 'Yacine Khelifi' },
  ];

  for (const w of warehousesData) {
    await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, location: w.location, managerName: w.managerName },
      create: w,
    });
  }

  // 4. CATÉGORIES & ARTICLES
  const categoriesData = [
    { id: 'cat-tuy', code: 'TUYAUTERIE', name: 'Tuyauterie & Raccords Forgés', description: 'Tubes acier carbone ASTM A106, Inox 316L, coudes, tés' },
    { id: 'cat-rob', code: 'ROBINETTERIE', name: 'Robinetterie Industrielle', description: 'Vannes à opercule, boisseau sphérique, clapets haute pression' },
    { id: 'cat-bri', code: 'BRIDES_FIX', name: 'Brides & Visserie Haute Résistance', description: 'Brides WNRF/BLRF Class 150/300/600, goujons ASTM A193 B7' },
    { id: 'cat-sou', code: 'SOUDAGE', name: 'Consommables de Soudage', description: 'Électrodes basiques E7018, fils d’apport TIG ER70S-6 & ER316L' },
    { id: 'cat-hva', code: 'HVAC_FROID', name: 'HVAC & Traitement d’Air', description: 'Filtres plissés F7, compresseurs industriels, vannes 3 voies' },
    { id: 'cat-epi', code: 'SECURITE_EPI', name: 'Sécurité & Équipements ATEX', description: 'Harnais antichute, masques filtrants, disques de tronçonnage' },
  ];

  for (const c of categoriesData) {
    await prisma.itemCategory.upsert({
      where: { code: c.code },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }

  const itemsData = [
    { code: 'ART-001', name: 'Vanne à opercule acier forgé DN100 PN40', description: 'Robinet-vanne acier forgé ASTM A105 brides RF, étanchéité stellite', categoryCode: 'ROBINETTERIE', unit: 'U', minStock: 10, currentStock: 25, unitCost: 14200 },
    { code: 'ART-002', name: 'Tube acier sans soudure ASTM A106 Gr.B 4" Sch 40', description: 'Tube haute pression vapeur & hydrocarbures (longueur 6m, CCPU 3.1)', categoryCode: 'TUYAUTERIE', unit: 'M', minStock: 50, currentStock: 180, unitCost: 6500 },
    { code: 'ART-003', name: 'Tube acier sans soudure ASTM A106 Gr.B 6" Sch 80', description: 'Tube forte épaisseur pour vapeur surchauffée 80 bar', categoryCode: 'TUYAUTERIE', unit: 'M', minStock: 30, currentStock: 95, unitCost: 11800 },
    { code: 'ART-004', name: 'Vanne à boisseau sphérique inox 316L DN50 PN16', description: 'Vanne à bille 3 pièces motorisable, passage intégral', categoryCode: 'ROBINETTERIE', unit: 'U', minStock: 8, currentStock: 18, unitCost: 9800 },
    { code: 'ART-005', name: 'Bride à collerette WNRF Class 300 4" Sch 40', description: 'Bride à souder en bout acier forgé ASTM A105 ASME B16.5', categoryCode: 'BRIDES_FIX', unit: 'U', minStock: 20, currentStock: 64, unitCost: 4200 },
    { code: 'ART-006', name: 'Bride pleine BLRF Class 300 6"', description: 'Bride d’obturation pour épreuve hydraulique 120 bar', categoryCode: 'BRIDES_FIX', unit: 'U', minStock: 10, currentStock: 32, unitCost: 5600 },
  ];

  for (const item of itemsData) {
    const cat = await prisma.itemCategory.findUnique({ where: { code: item.categoryCode } });
    if (!cat) continue;
    await prisma.item.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        description: item.description,
        categoryId: cat.id,
        unit: item.unit,
        minStockLevel: item.minStock,
        currentStock: item.currentStock,
        unitCost: item.unitCost,
      },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        categoryId: cat.id,
        unit: item.unit,
        minStockLevel: item.minStock,
        currentStock: item.currentStock,
        unitCost: item.unitCost,
      },
    });
  }

  // 5. FOURNISSEURS
  const suppliersData = [
    { code: 'FRN-001', name: 'Sarl Algérie Vannes & Robinetterie', contactName: 'Mourad Cherif', email: 'contact@algerievannes.dz', phone: '+213 21 82 45 10', address: 'Zone Industrielle Dar El Beida, Alger', specialties: 'Robinetterie PN40/PN100, vannes API, clapets pétrole', rating: 4.8 },
    { code: 'FRN-002', name: 'Batimetal Tuyauteries Algérie', contactName: 'Mohamed Brahimi', email: 'commercial@batimetal.dz', phone: '+213 21 89 45 12', address: 'Zone Industrielle Oued Smar, Lot 14, Alger', specialties: 'Tubes ASTM A106, coudes forgés, brides ANSI 300#', rating: 4.7 },
    { code: 'FRN-003', name: 'Sarl Gaz & Soudure Industrielle DZ', contactName: 'Hocine Kaci', email: 'kaci@gaz-soudure.dz', phone: '+213 29 73 55 20', address: 'Zone Industrielle Irara, Hassi Messaoud', specialties: 'Électrodes E7018, fils TIG, torches, gaz spéciaux', rating: 4.9 },
    { code: 'FRN-004', name: 'Eurl Robinetterie Industrielle Oran', contactName: 'Nabil Mansour', email: 'contact@rbi-oran.dz', phone: '+213 41 40 18 90', address: 'Zone Industrielle Es Senia, Oran', specialties: 'Brides WNRF, visserie B7/2H, joints spiro', rating: 4.5 },
  ];

  for (const s of suppliersData) {
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: { name: s.name, contactName: s.contactName, email: s.email, phone: s.phone, address: s.address, specialties: s.specialties, rating: s.rating },
      create: s,
    });
  }

  // 6. PROJETS INDUSTRIELS RÉALISTES
  const projectsData = [
    {
      code: 'PRJ-2026-001',
      name: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
      description: 'Arrêt technique annuel : Dépose, préfabrication atelier, montage sur site et épreuves hydrauliques à 45 bars des collecteurs vapeur haute pression avec contrôles CND.',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId: 'usr-rp-001',
      siteLocation: 'Zone Industrielle Skikda RA1K',
      startDate: new Date('2026-10-01'),
      contractEndDate: new Date('2026-12-15'),
      contractAmount: 48500000,
      budgetAmount: 36800000,
      committedCost: 22400000,
      actualCost: 14200000,
      physicalProgress: 44.0,
      financialProgress: 38.6,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.LOW,
      priority: 'HIGH',
      objectives: 'Sécuriser le redémarrage de l’unité de craquage catalytique dans le respect strict des jalons QCD et zéro accident de travail.',
    },
    {
      code: 'PRJ-2026-002',
      name: 'Montage Mécanique & Tuyauterie Centrale 2x400MW',
      description: 'Montage des circuits eau d’alimentation, vapeur BP/MP, tuyauterie inox de refroidissement condenseur et calorifugeage.',
      clientName: 'Sonelgaz Production Électricité (Centrale Terga)',
      sector: IndustrialSector.ENERGIE,
      managerId: 'usr-rp-001',
      siteLocation: 'Centrale Électrique Terga, Ain Témouchent',
      startDate: new Date('2025-09-01'),
      contractEndDate: new Date('2026-11-30'),
      contractAmount: 125000000,
      budgetAmount: 104000000,
      committedCost: 78500000,
      actualCost: 65200000,
      physicalProgress: 64.0,
      financialProgress: 62.7,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.HIGH,
      priority: 'CRITICAL',
      objectives: 'Épreuves hydrauliques 60 bar sans réserve, conformité DESP / CODAP.',
    },
    {
      code: 'PRJ-2026-003',
      name: 'Système HVAC & Traitement d’Air Salle Contrôle',
      description: 'Installation de 2 centrales CTA 15000 m3/h, réseau gaines spiralées acier galva, contrôle d’ambiance et climatisation salle serveurs.',
      clientName: 'Fertial Algérie (Complexe Ammoniac Arzew)',
      sector: IndustrialSector.AGROALIMENTAIRE,
      managerId: 'usr-rp-001',
      siteLocation: 'Zone Pétrochimique Bethioua, Arzew',
      startDate: new Date('2026-02-01'),
      contractEndDate: new Date('2026-07-31'),
      contractAmount: 22000000,
      budgetAmount: 18500000,
      committedCost: 9200000,
      actualCost: 7800000,
      physicalProgress: 42.0,
      financialProgress: 42.1,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.LOW,
      priority: 'NORMAL',
      objectives: 'Garantir une surpression salle de contrôle de 50 Pa avec filtration chimique.',
    },
  ];

  for (const p of projectsData) {
    await prisma.project.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        clientName: p.clientName,
        sector: p.sector,
        managerId: p.managerId,
        siteLocation: p.siteLocation,
        contractAmount: p.contractAmount,
        budgetAmount: p.budgetAmount,
        committedCost: p.committedCost,
        actualCost: p.actualCost,
        physicalProgress: p.physicalProgress,
        financialProgress: p.financialProgress,
        status: p.status,
        riskLevel: p.riskLevel,
        priority: p.priority,
        objectives: p.objectives,
      },
      create: p,
    });
  }

  // 7. PARC MATÉRIEL
  const assetsData = [
    { assetTag: 'ENG-001', name: 'Grue Mobile Tout-Terrain Liebherr LTM 1050-3.1 (50T)', assetType: AssetType.ENGIN_LEVAGE, brand: 'Liebherr', model: 'LTM 1050-3.1', serialNumber: 'LTM50-2021-9941', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2021-03-10') },
    { assetTag: 'GEN-003', name: 'Groupe Électrogène Diesel Insonorisé 250 kVA Cummins', assetType: AssetType.GROUPE_ELECTROGENE, brand: 'Cummins', model: 'C250 D5e', serialNumber: 'CUM-250-4410', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-01-20') },
    { assetTag: 'SOU-004', name: 'Poste de Soudure Autonome Chantier Miller Big Blue 500X', assetType: AssetType.POSTE_SOUDURE, brand: 'Miller', model: 'Big Blue 500X Pro', serialNumber: 'MIL-500-1102', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-08-05') },
    { assetTag: 'COM-006', name: 'Compresseur Mobile Chantier Atlas Copco XAHS 186 (12 bar)', assetType: AssetType.MACHINE_OUTIL, brand: 'Atlas Copco', model: 'XAHS 186', serialNumber: 'AC-186-5591', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2022-11-12') },
  ];

  for (const a of assetsData) {
    await prisma.asset.upsert({
      where: { assetTag: a.assetTag },
      update: { name: a.name, status: a.status },
      create: a,
    });
  }

  // 8. EMPLOYÉS
  const hrDept = await prisma.department.findUnique({ where: { code: DepartmentCode.OPERATIONS_PROJETS } });
  if (hrDept) {
    const employeesData = [
      { reg: 'EMP-001', first: 'Ahmed', last: 'Benyahia', title: 'Chef de Chantier Tuyauterie Industrielle', email: 'ahmed.benyahia@silex-services.dz', phone: '+213 550 10 20 30' },
      { reg: 'EMP-002', first: 'Karim', last: 'Mebarki', title: 'Soudeur Haute Pression Homologué 6G (GTAW/SMAW)', email: 'karim.mebarki@silex-services.dz', phone: '+213 550 11 22 33' },
      { reg: 'EMP-003', first: 'Mourad', last: 'Bouzid', title: 'Tuyauteur Industriel Qualifié Isométrique', email: 'mourad.bouzid@silex-services.dz', phone: '+213 550 22 33 44' },
      { reg: 'EMP-004', first: 'Farid', last: 'Zitouni', title: 'Superviseur Qualité & Sécurité HSE Chantier', email: 'farid.zitouni@silex-services.dz', phone: '+213 550 33 44 55' },
    ];

    for (const emp of employeesData) {
      await prisma.employee.upsert({
        where: { registrationNumber: emp.reg },
        update: { firstName: emp.first, lastName: emp.last, title: emp.title, email: emp.email, phone: emp.phone },
        create: {
          registrationNumber: emp.reg,
          firstName: emp.first,
          lastName: emp.last,
          title: emp.title,
          departmentId: hrDept.id,
          email: emp.email,
          phone: emp.phone,
          contractType: 'CDI',
          hireDate: new Date('2022-01-15'),
          status: 'ACTIF',
        },
      });
    }
  }

  console.log('✅ [SEED] Base PostgreSQL initialisée avec succès avec les données exemplaires !');
}

main()
  .catch((e) => {
    console.error('❌ [SEED] Erreur critique :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
