import { 
  PrismaClient, 
  SystemRole, 
  DepartmentCode,
  IndustrialSector,
  ProjectStatus,
  ProjectRiskLevel,
  AssetType,
  AssetStatus,
  MaintenanceType,
  MaintenanceStatus,
  StockMovementType,
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
  console.log('🚀 [SEED] Initialisation complète des données industrielles exemplaires SILEX SERVICES...');

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
      },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.deptCode,
        departmentId: depId,
        passwordHash,
      },
    });
  }

  // 3. MAGASINS
  const warehousesData = [
    { code: 'MAG-01', name: 'Magasin Central Arzew & Base Logistique', location: 'Zone Industrielle Bethioua, Arzew, W. Oran', managerName: 'Tarek Meziani (Gestionnaire Magasin)' },
    { code: 'MAG-02', name: 'Dépôt Régional Skikda RA1K', location: 'Zone Industrielle Raffinerie RA1K, W. Skikda', managerName: 'Yacine Khelifi (Superviseur Logistique Est)' },
    { code: 'MAG-03', name: 'Magasin Chantier Hassi Messaoud', location: 'Base de Vie SILEX Irara, W. Ouargla', managerName: 'Mourad Zitouni (Responsable Base)' },
  ];

  for (const w of warehousesData) {
    await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, location: w.location, managerName: w.managerName },
      create: w,
    });
  }

  // 4. CATÉGORIES ET ARTICLES DU CATALOGUE
  const categoriesData = [
    { code: 'CAT-TUY', name: 'Tuyauterie & Raccords Forgés HP', description: 'Tubes ASTM A106, coudes A234, brides WNRF ANSI 300#' },
    { code: 'CAT-SOU', name: 'Consommables & Matériels de Soudage', description: 'Électrodes basiques E7018, baguettes TIG ER70S-6, postes inverter' },
    { code: 'CAT-ROB', name: 'Robinetterie Industrielle & Vannes HP', description: 'Vannes à guillotine, clapets anti-retour, robinets à soupape' },
    { code: 'CAT-CND', name: 'Consommables Contrôle CND & Métrologie', description: 'Pénétrants ressuage, films radiographiques, cales d’épaisseur' },
    { code: 'CAT-ENG', name: 'Engins de Levage & Manutention', description: 'Grues mobiles, chariots télescopiques, treuils de halage' },
    { code: 'CAT-EPI', name: 'Équipements de Protection Individuelle', description: 'Harnais antichute ATEX, casques, masques respiratoires Nomex' },
  ];

  for (const c of categoriesData) {
    await prisma.itemCategory.upsert({
      where: { code: c.code },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }

  const catMap = await prisma.itemCategory.findMany();
  const getCatId = (code: string) => catMap.find(c => c.code === code)?.id;

  const itemsData = [
    { code: 'ART-TUY-001', name: 'Tube acier carbone sans soudure Sch 40 DN150 (ASTM A106 Gr.B)', description: 'Tuyauterie haute pression vapeur 80 bar', unit: 'ml', unitCost: 18500, minStockLevel: 50, currentStock: 180, catCode: 'CAT-TUY' },
    { code: 'ART-TUY-002', name: 'Coude 90° LR acier carbone DN150 ASTM A234 WPB', description: 'Raccord forgé à souder bout-à-bout', unit: 'U', unitCost: 14000, minStockLevel: 20, currentStock: 65, catCode: 'CAT-TUY' },
    { code: 'ART-TUY-003', name: 'Bride à collerette Welding Neck Class 300 DN150', description: 'Bride forgée ASTM A105 RF ASME B16.5', unit: 'U', unitCost: 22500, minStockLevel: 15, currentStock: 40, catCode: 'CAT-TUY' },
    { code: 'ART-TUY-004', name: 'Joint spirométallique inox 316L DN150 CL300', description: 'Joint avec bague de centrage et garniture graphite', unit: 'U', unitCost: 3800, minStockLevel: 30, currentStock: 85, catCode: 'CAT-TUY' },
    { code: 'ART-SOU-001', name: 'Électrodes basiques E7018 diam 3.2mm', description: 'Baguettes de soudage enrobées pour aciers carbone', unit: 'kg', unitCost: 1200, minStockLevel: 100, currentStock: 450, catCode: 'CAT-SOU' },
    { code: 'ART-SOU-002', name: 'Fil de soudage TIG ER70S-6 diam 2.4mm', description: 'Baguettes d’apport TIG pour passes de pénétration', unit: 'kg', unitCost: 1950, minStockLevel: 50, currentStock: 120, catCode: 'CAT-SOU' },
  ];

  for (const it of itemsData) {
    const categoryId = getCatId(it.catCode);
    if (!categoryId) continue;
    await prisma.item.upsert({
      where: { code: it.code },
      update: { name: it.name, description: it.description, unit: it.unit, unitCost: it.unitCost, minStockLevel: it.minStockLevel, currentStock: it.currentStock, categoryId },
      create: { code: it.code, name: it.name, description: it.description, unit: it.unit, unitCost: it.unitCost, minStockLevel: it.minStockLevel, currentStock: it.currentStock, categoryId },
    });
  }

  // 5. FOURNISSEURS HOMOLOGUÉS
  const suppliersData = [
    { code: 'FOURN-001', name: 'Batimetal Tuyauteries Algérie', specialties: 'Tuyauterie sans soudure ASTM A106, coudes forgés A234, brides ANSI 300#', contactName: 'Mohamed Brahimi', phone: '+213 21 89 45 12', email: 'commercial@batimetal-tuyauterie.dz', address: 'Zone Industrielle Oued Smar, Alger', taxId: '001616010899981' },
    { code: 'FOURN-002', name: 'Maghreb Tubes & Raccords Industriels', specialties: 'Raccords forgés ASTM A105, robinetterie HP, vannes à guillotine', contactName: 'Nabil Saidi', phone: '+213 41 56 78 90', email: 'ventes@maghreb-tubes.dz', address: 'Zone Industrielle Es-Sénia, Oran', taxId: '001831010778899' },
    { code: 'FOURN-003', name: 'Techno-Weld Algérie & Consommables', specialties: 'Électrodes basiques E7018, fils TIG ER70S-6, postes inverter Miller', contactName: 'Kamel Bensaada', phone: '+213 21 67 23 45', email: 'contact@technoweld.dz', address: 'Zone Industrielle Rouiba, Alger', taxId: '002016010445566' },
    { code: 'FOURN-004', name: 'Sarl Levage Lourd & Manutention Sud', specialties: 'Grues télescopiques 50T-200T, chariots élévateurs tout-terrain', contactName: 'Djamel Zergoun', phone: '+213 29 73 11 22', email: 'operations@levage-sud.dz', address: 'Zone Industrielle Irara, Hassi Messaoud', taxId: '001930010332211' },
    { code: 'FOURN-005', name: 'Contrôle Industriel CND Algérie (Bureau Veritas Partenaire)', specialties: 'Tirs radiographiques RT 100%, ressuage PT, ultrasons phased array', contactName: 'Abdelkader Mezouar', phone: '+213 21 78 99 00', email: 'cnd@controle-algerie.dz', address: 'Cité DNC, Bâtiment 4, Hydra, Alger', taxId: '001716010556677' },
    { code: 'FOURN-006', name: 'Apex Sécurité & Équipements ATEX', specialties: 'Harnais antichute ATEX, masques ventilés, combinaisons Nomex', contactName: 'Leila Kaced', phone: '+213 21 54 32 10', email: 'sales@apex-securite.dz', address: 'Boulevard des Martyrs, Blida', taxId: '002116010667788' },
  ];

  for (const s of suppliersData) {
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: { name: s.name, specialties: s.specialties, contactName: s.contactName, phone: s.phone, email: s.email, address: s.address, taxId: s.taxId },
      create: s,
    });
  }

  // 6. PROJETS INDUSTRIELS RÉALISTES
  const projectsData = [
    {
      code: 'PRJ-2026-001',
      name: 'Rénovation tuyauteries HP vapeur 80 bar & échangeurs thermiques',
      description: 'Arrêt technique décennal unité craquage catalytique RA1K avec 100% CND radiographie.',
      clientName: 'Sonatrach Raffinerie Skikda (RA1K)',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId: 'usr-rp-001',
      siteLocation: 'Zone Industrielle Skikda RA1K',
      startDate: new Date('2026-01-15'),
      contractEndDate: new Date('2026-06-30'),
      contractAmount: 48500000,
      budgetAmount: 36800000,
      committedCost: 22400000,
      actualCost: 19850000,
      physicalProgress: 58.5,
      financialProgress: 54.0,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.MEDIUM,
      priority: 'HAUTE',
      objectives: 'Respecter le jalon d’arrêt de 45 jours calendaires avec zéro accident avec arrêt.',
    },
    {
      code: 'PRJ-2026-002',
      name: 'Maintenance préventive des turbines à gaz 2x400MW',
      description: 'Révision majeure des circuits vapeur auxiliaires, pompes alimentaires et robinetterie HP.',
      clientName: 'Sonelgaz Production Électricité (Centrale Terga)',
      sector: IndustrialSector.ENERGIE,
      managerId: 'usr-rp-001',
      siteLocation: 'Centrale Électrique Terga, Aïn Témouchent',
      startDate: new Date('2025-11-01'),
      contractEndDate: new Date('2026-04-30'),
      contractAmount: 34000000,
      budgetAmount: 27500000,
      committedCost: 24100000,
      actualCost: 23600000,
      physicalProgress: 82.0,
      financialProgress: 85.8,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.LOW,
      priority: 'HAUTE',
      objectives: 'Garantir un taux de disponibilité post-révision de 99.2% sur les deux tranches.',
    },
    {
      code: 'PRJ-2026-003',
      name: 'Mise en conformité HVAC salle de contrôle et filtration ATEX',
      description: 'Remplacement des groupes frigorifiques industriels R134a et gaines inox 316L.',
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

  // 7. PARC MATÉRIEL (8 Équipements)
  const assetsData = [
    { assetTag: 'EQP-001', name: 'Grue Mobile Tout-Terrain Liebherr LTM 1050-3.1 (50T)', assetType: AssetType.ENGIN_LEVAGE, brand: 'Liebherr', model: 'LTM 1050-3.1', serialNumber: 'LTM50-2021-9941', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2021-03-10') },
    { assetTag: 'EQP-002', name: 'Chariot Élévateur Télescopique Manitou MT 1840 (18m / 4T)', assetType: AssetType.ENGIN_LEVAGE, brand: 'Manitou', model: 'MT 1840 Easy', serialNumber: 'MAN-1840-7712', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2022-05-14') },
    { assetTag: 'EQP-003', name: 'Groupe Électrogène Diesel Insonorisé 250 kVA Cummins', assetType: AssetType.GROUPE_ELECTROGENE, brand: 'Cummins', model: 'C250 D5e', serialNumber: 'CUM-250-4410', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-01-20') },
    { assetTag: 'EQP-004', name: 'Poste de Soudure Autonome Chantier Miller Big Blue 500X Pro N°1', assetType: AssetType.POSTE_SOUDURE, brand: 'Miller', model: 'Big Blue 500X Pro', serialNumber: 'MIL-500-1102', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-08-05') },
    { assetTag: 'EQP-005', name: 'Poste de Soudure Autonome Chantier Miller Big Blue 500X Pro N°2', assetType: AssetType.POSTE_SOUDURE, brand: 'Miller', model: 'Big Blue 500X Pro', serialNumber: 'MIL-500-1103', status: AssetStatus.MAINTENANCE, acquisitionDate: new Date('2023-08-05') },
    { assetTag: 'EQP-006', name: 'Compresseur Mobile Chantier Atlas Copco XAHS 186 (12 bar)', assetType: AssetType.MACHINE_OUTIL, brand: 'Atlas Copco', model: 'XAHS 186', serialNumber: 'AC-186-5591', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2022-11-12') },
    { assetTag: 'EQP-007', name: 'Véhicule Atelier Tout-Terrain Toyota Hilux 4x4 Double Cabine', assetType: AssetType.VEHICULE, brand: 'Toyota', model: 'Hilux 2.8 D-4D', serialNumber: 'AHT-FR22-8821', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-04-18') },
    { assetTag: 'EQP-008', name: 'Camion Plateau avec Bras de Grue Renault Kerax 440 6x4', assetType: AssetType.VEHICULE, brand: 'Renault Trucks', model: 'Kerax 440 DXi', serialNumber: 'VF6-34A-4481', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2021-09-22') },
  ];

  for (const a of assetsData) {
    await prisma.asset.upsert({
      where: { serialNumber: a.serialNumber },
      update: { assetTag: a.assetTag, name: a.name, status: a.status, brand: a.brand, model: a.model, assetType: a.assetType },
      create: a,
    });
  }

  // 8. ORDRES DE TRAVAIL DE MAINTENANCE (4 OTs)
  const assetMap = await prisma.asset.findMany();
  const getAssetId = (tag: string) => assetMap.find(a => a.assetTag === tag)?.id;

  const otData = [
    {
      orderNumber: 'OT-2026-0001',
      assetTag: 'EQP-001',
      type: MaintenanceType.PREVENTIVE,
      priority: 'NORMAL',
      status: MaintenanceStatus.COMPLETED,
      description: 'Révision périodique 250h : vidange huile moteur 15W40, filtres et graissage tourelle.',
      scheduledDate: new Date('2026-11-01'),
      completedDate: new Date('2026-11-02'),
      cost: 48500,
      technician: 'Mourad Zitouni (Responsable Maintenance)',
    },
    {
      orderNumber: 'OT-2026-0002',
      assetTag: 'EQP-005',
      type: MaintenanceType.CORRECTIVE,
      priority: 'CRITICAL',
      status: MaintenanceStatus.IN_PROGRESS,
      description: 'Remplacement flexible HP 210 bar et connecteur torche TIG suite amorçage instable.',
      scheduledDate: new Date('2026-11-20'),
      cost: 65000,
      technician: 'Nassim Ghoulem (Électromécanicien)',
    },
    {
      orderNumber: 'OT-2026-0003',
      assetTag: 'EQP-002',
      type: MaintenanceType.PREVENTIVE,
      priority: 'REGLEMENTAIRE_VGP',
      status: MaintenanceStatus.SCHEDULED,
      description: 'Visite Générale Périodique (VGP) annuelle obligatoire appareils de levage (Décret 05-09).',
      scheduledDate: new Date('2026-11-28'),
      cost: 85000,
      technician: 'APAVE Algérie SPA — Inspecteur Agréé',
    },
    {
      orderNumber: 'OT-2026-0004',
      assetTag: 'EQP-008',
      type: MaintenanceType.PREVENTIVE,
      priority: 'NORMAL',
      status: MaintenanceStatus.SCHEDULED,
      description: 'Contrôle CND ressuage et magnétoscopie des soudures faux-châssis et bras de grue.',
      scheduledDate: new Date('2026-12-05'),
      cost: 55000,
      technician: 'Bureau Veritas Algérie',
    },
  ];

  for (const ot of otData) {
    const assetId = getAssetId(ot.assetTag);
    if (!assetId) continue;
    await prisma.maintenanceOrder.upsert({
      where: { orderNumber: ot.orderNumber },
      update: { description: ot.description, status: ot.status, cost: ot.cost, technician: ot.technician },
      create: {
        orderNumber: ot.orderNumber,
        assetId,
        type: ot.type,
        priority: ot.priority,
        status: ot.status,
        description: ot.description,
        scheduledDate: ot.scheduledDate,
        completedDate: ot.completedDate,
        cost: ot.cost,
        technician: ot.technician,
      },
    });
  }

  // 9. EMPLOYÉS (12 Collaborateurs SILEX)
  const hrDept = await prisma.department.findUnique({ where: { code: DepartmentCode.OPERATIONS_PROJETS } });
  if (hrDept) {
    const employeesData = [
      { reg: 'EMP-001', first: 'Ahmed', last: 'Benyahia', title: 'Chef de Chantier Tuyauterie Industrielle', email: 'ahmed.benyahia@silex-services.dz', phone: '+213 550 10 20 30' },
      { reg: 'EMP-002', first: 'Karim', last: 'Mebarki', title: 'Soudeur Haute Pression Homologué 6G (GTAW/SMAW)', email: 'karim.mebarki@silex-services.dz', phone: '+213 550 11 22 33' },
      { reg: 'EMP-003', first: 'Mourad', last: 'Bouzid', title: 'Tuyauteur Industriel Qualifié Isométrique', email: 'mourad.bouzid@silex-services.dz', phone: '+213 550 22 33 44' },
      { reg: 'EMP-004', first: 'Farid', last: 'Zitouni', title: 'Superviseur Qualité & Sécurité HSE Chantier', email: 'farid.zitouni@silex-services.dz', phone: '+213 550 33 44 55' },
      { reg: 'EMP-005', first: 'Yacine', last: 'Brahimi', title: 'Soudeur Spécialiste Inox 316L / Titane', email: 'yacine.brahimi@silex-services.dz', phone: '+213 550 44 55 66' },
      { reg: 'EMP-006', first: 'Tarek', last: 'Meziani', title: 'Gestionnaire Magasin Central & Logistique', email: 'tarek.meziani@silex-services.dz', phone: '+213 550 55 66 77' },
      { reg: 'EMP-007', first: 'Rachid', last: 'Ghezzal', title: 'Monteur-Ajusteur Équipements Sous Pression', email: 'rachid.ghezzal@silex-services.dz', phone: '+213 550 66 77 88' },
      { reg: 'EMP-008', first: 'Samir', last: 'Cherfaoui', title: 'Tuyauteur Traceur Atelier & Chantier', email: 'samir.cherfaoui@silex-services.dz', phone: '+213 550 77 88 99' },
      { reg: 'EMP-009', first: 'Nassim', last: 'Ghoulem', title: 'Électromécanicien Maintenance Engins & Groupes', email: 'nassim.ghoulem@silex-services.dz', phone: '+213 550 88 99 00' },
      { reg: 'EMP-010', first: 'Mustapha', last: 'Benali', title: 'Ingénieur Contrôle CND Niveau II (COFREND)', email: 'mustapha.benali@silex-services.dz', phone: '+213 550 99 00 11' },
      { reg: 'EMP-011', first: 'Abdelkrim', last: 'Saadi', title: 'Grutier CACES R383 Télescopique 50T-100T', email: 'abdelkrim.saadi@silex-services.dz', phone: '+213 550 00 11 22' },
      { reg: 'EMP-012', first: 'Sofiane', last: 'Mansour', title: 'Chaudronnier Monteur Réservoirs & Bacs', email: 'sofiane.mansour@silex-services.dz', phone: '+213 550 11 00 22' },
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

    // 10. CERTIFICATIONS DES EMPLOYÉS
    const empMap = await prisma.employee.findMany();
    const getEmpId = (reg: string) => empMap.find(e => e.registrationNumber === reg)?.id;

    const certsData = [
      { empReg: 'EMP-002', certName: 'CQS Soudeur HP 6G - Tubes ASTM A106 Gr.B (Procédé 141/111)', issuingBody: 'Bureau Veritas Algérie SPA', issueDate: new Date('2025-06-15'), expiryDate: new Date('2027-06-14') },
      { empReg: 'EMP-005', certName: 'CQS TIG Tube Inox Austénitique 316L (Procédé 141)', issuingBody: 'TÜV Rheinland Algérie', issueDate: new Date('2025-04-10'), expiryDate: new Date('2027-04-09') },
      { empReg: 'EMP-004', certName: 'Habilitation Électrique Travaux Hors Tension B2V / BR / H0V', issuingBody: 'Centre National de Formation Industrielle (CNFI)', issueDate: new Date('2026-01-15'), expiryDate: new Date('2029-01-14') },
      { empReg: 'EMP-001', certName: 'Supervision des Interventions en Espaces Confinés & ATEX', issuingBody: 'Institut Algérien du Pétrole (IAP)', issueDate: new Date('2025-03-01'), expiryDate: new Date('2027-02-28') },
      { empReg: 'EMP-012', certName: 'Aptitude Médicale Annuelle Travaux Industriels & Hauteur', issuingBody: 'Service de Médecine du Travail Skikda', issueDate: new Date('2026-01-10'), expiryDate: new Date('2027-01-09') },
    ];

    for (const cert of certsData) {
      const employeeId = getEmpId(cert.empReg);
      if (!employeeId) continue;
      const existing = await prisma.employeeCertification.findFirst({
        where: { employeeId, certName: cert.certName },
      });
      if (!existing) {
        await prisma.employeeCertification.create({
          data: {
            employeeId,
            certName: cert.certName,
            issuingBody: cert.issuingBody,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            status: 'VALIDE',
          },
        });
      }
    }

    // 11. POINTAGES / ATTENDANCES CHANTIERS
    const proj1 = await prisma.project.findUnique({ where: { code: 'PRJ-2026-001' } });
    const emp1 = getEmpId('EMP-001');
    const emp2 = getEmpId('EMP-002');
    const emp3 = getEmpId('EMP-003');

    if (proj1 && emp1 && emp2 && emp3) {
      const dates = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'];
      for (const d of dates) {
        for (const eid of [emp1, emp2, emp3]) {
          const dateObj = new Date(d);
          const existingAtt = await prisma.attendance.findFirst({
            where: { employeeId: eid, date: dateObj },
          });
          if (!existingAtt) {
            await prisma.attendance.create({
              data: {
                employeeId: eid,
                projectId: proj1.id,
                date: dateObj,
                regularHours: 8,
                overtimeHours: eid === emp2 ? 2 : 0,
                isAbsent: false,
              },
            });
          }
        }
      }
    }
  }

  // 12. MOUVEMENTS DE STOCKS
  const wh1 = await prisma.warehouse.findUnique({ where: { code: 'MAG-01' } });
  const item1 = await prisma.item.findUnique({ where: { code: 'ART-TUY-001' } });
  const item2 = await prisma.item.findUnique({ where: { code: 'ART-TUY-002' } });

  if (wh1 && item1 && item2) {
    const mvts = [
      { movementNumber: 'MVT-2026-0001', type: StockMovementType.PURCHASE_RECEIPT, itemId: item1.id, qty: 60, cost: 18500, refDoc: 'BL-FOURN-2026-441' },
      { movementNumber: 'MVT-2026-0002', type: StockMovementType.PURCHASE_RECEIPT, itemId: item2.id, qty: 24, cost: 14000, refDoc: 'BL-FOURN-2026-442' },
      { movementNumber: 'MVT-2026-0003', type: StockMovementType.PROJECT_ISSUE, itemId: item2.id, qty: 8, cost: 14000, refDoc: 'BSM-2026-0001' },
    ];

    for (const m of mvts) {
      await prisma.stockMovement.upsert({
        where: { movementNumber: m.movementNumber },
        update: { quantity: m.qty, unitCost: m.cost, totalCost: m.qty * m.cost },
        create: {
          movementNumber: m.movementNumber,
          movementType: m.type,
          warehouseId: wh1.id,
          itemId: m.itemId,
          quantity: m.qty,
          unitCost: m.cost,
          totalCost: m.qty * m.cost,
          referenceDocument: m.refDoc,
          notes: 'Écriture certifiée conforme registre magasin',
          createdById: 'usr-mag-001',
        },
      });
    }
  }

  console.log('✅ [SEED] Base PostgreSQL initialisée avec succès avec les données exemplaires complètes !');
}

main()
  .catch((e) => {
    console.error('❌ [SEED] Erreur critique :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
