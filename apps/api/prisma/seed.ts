import { PrismaClient, SystemRole, DepartmentCode, IndustrialSector, ProjectStatus, ProjectRiskLevel, PurchaseRequestStatus, PurchaseOrderStatus, StockMovementType, ServiceOrderType, ServiceOrderStatus, WorkSituationStatus, AssetType, AssetStatus, MaintenanceType, MaintenanceStatus, DocumentCategory, NonConformitySeverity, NonConformityStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Nettoyage et initialisation des données de démonstration SILEX...');

  // Mot de passe standard de démonstration
  const passwordHash = await argon2.hash('SilexDemo2026!');

  // 1. DÉPARTEMENTS
  const departments = [
    { code: DepartmentCode.DIRECTION_GENERALE, name: 'Direction Générale', description: 'Gouvernance, stratégie et pilotage exécutif' },
    { code: DepartmentCode.OPERATIONS_PROJETS, name: 'Opérations & Projets', description: 'Direction technique, conduite des chantiers et ingénierie' },
    { code: DepartmentCode.ACHATS_LOGISTIQUE, name: 'Achats & Approvisionnements', description: 'Sourcing, consultations fournisseurs et logistique chantier' },
    { code: DepartmentCode.MAGASIN_STOCKS, name: 'Magasins & Stocks', description: 'Gestion des réceptions, entreposage et sorties matériels' },
    { code: DepartmentCode.RESSOURCES_HUMAINES, name: 'Ressources Humaines', description: 'Gestion du personnel, habilitations soudage et présences' },
    { code: DepartmentCode.FINANCE_COMPTABILITE, name: 'Finance & Contrôle de Gestion', description: 'Budgets projets, facturation, trésorerie et engagements' },
    { code: DepartmentCode.PARC_MAINTENANCE, name: 'Parc Matériel & Maintenance', description: 'Disponibilité des engins, équipements de soudage et révisions' },
    { code: DepartmentCode.QHSE, name: 'QHSE & Conformité', description: 'Qualité, sécurité chantier, traçabilité et conformité ISO' },
    { code: DepartmentCode.INFORMATIQUE_ADMIN, name: 'Informatique & Administration', description: 'Systèmes d’information et administration de la plateforme' },
  ];

  for (const dep of departments) {
    await prisma.department.upsert({
      where: { code: dep.code },
      update: { name: dep.name, description: dep.description },
      create: dep,
    });
  }

  const deptMap = await prisma.department.findMany();
  const getDeptId = (code: DepartmentCode) => deptMap.find(d => d.code === code)?.id;

  // 2. UTILISATEURS DE DÉMONSTRATION (9 RÔLES CLÉS)
  const usersData = [
    {
      id: 'usr-dg-001',
      email: 'k.mansouri@silex-services.dz',
      name: 'Karim Mansouri',
      title: 'Directeur Général',
      role: SystemRole.DIRECTEUR_GENERAL,
      departmentCode: DepartmentCode.DIRECTION_GENERALE,
      departmentId: getDeptId(DepartmentCode.DIRECTION_GENERALE),
      avatarUrl: '/avatars/dg.webp',
    },
    {
      id: 'usr-rp-002',
      email: 's.belkacem@silex-services.dz',
      name: 'Sofiane Belkacem',
      title: 'Chef de Projets Industriels',
      role: SystemRole.RESPONSABLE_PROJET,
      departmentCode: DepartmentCode.OPERATIONS_PROJETS,
      departmentId: getDeptId(DepartmentCode.OPERATIONS_PROJETS),
      avatarUrl: '/avatars/rp.webp',
    },
    {
      id: 'usr-ach-003',
      email: 'a.benali@silex-services.dz',
      name: 'Amina Benali',
      title: 'Responsable Achats & Approvisionnements',
      role: SystemRole.RESPONSABLE_ACHATS,
      departmentCode: DepartmentCode.ACHATS_LOGISTIQUE,
      departmentId: getDeptId(DepartmentCode.ACHATS_LOGISTIQUE),
      avatarUrl: '/avatars/ach.webp',
    },
    {
      id: 'usr-mag-004',
      email: 't.meziani@silex-services.dz',
      name: 'Tarek Meziani',
      title: 'Responsable Magasin & Stocks',
      role: SystemRole.RESPONSABLE_MAGASIN,
      departmentCode: DepartmentCode.MAGASIN_STOCKS,
      departmentId: getDeptId(DepartmentCode.MAGASIN_STOCKS),
      avatarUrl: '/avatars/mag.webp',
    },
    {
      id: 'usr-rh-005',
      email: 's.haddad@silex-services.dz',
      name: 'Samira Haddad',
      title: 'Responsable Ressources Humaines',
      role: SystemRole.RESPONSABLE_RH,
      departmentCode: DepartmentCode.RESSOURCES_HUMAINES,
      departmentId: getDeptId(DepartmentCode.RESSOURCES_HUMAINES),
      avatarUrl: '/avatars/rh.webp',
    },
    {
      id: 'usr-fin-006',
      email: 'r.bouzid@silex-services.dz',
      name: 'Rachid Bouzid',
      title: 'Directeur Financier',
      role: SystemRole.RESPONSABLE_FINANCIER,
      departmentCode: DepartmentCode.FINANCE_COMPTABILITE,
      departmentId: getDeptId(DepartmentCode.FINANCE_COMPTABILITE),
      avatarUrl: '/avatars/fin.webp',
    },
    {
      id: 'usr-maint-007',
      email: 'y.khelifi@silex-services.dz',
      name: 'Yacine Khelifi',
      title: 'Responsable Matériel & Parc',
      role: SystemRole.RESPONSABLE_MAINTENANCE,
      departmentCode: DepartmentCode.PARC_MAINTENANCE,
      departmentId: getDeptId(DepartmentCode.PARC_MAINTENANCE),
      avatarUrl: '/avatars/maint.webp',
    },
    {
      id: 'usr-qhse-008',
      email: 'n.chaib@silex-services.dz',
      name: 'Nadia Chaib',
      title: 'Responsable QHSE & Conformité',
      role: SystemRole.RESPONSABLE_QUALITE,
      departmentCode: DepartmentCode.QHSE,
      departmentId: getDeptId(DepartmentCode.QHSE),
      avatarUrl: '/avatars/qhse.webp',
    },
    {
      id: 'usr-adm-009',
      email: 'admin@silex-services.dz',
      name: 'Lyes Hamidi',
      title: 'Administrateur Système ERP',
      role: SystemRole.ADMINISTRATEUR,
      departmentCode: DepartmentCode.INFORMATIQUE_ADMIN,
      departmentId: getDeptId(DepartmentCode.INFORMATIQUE_ADMIN),
      avatarUrl: '/avatars/admin.webp',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.departmentCode,
        departmentId: u.departmentId,
        passwordHash,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash,
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.departmentCode,
        departmentId: u.departmentId,
        avatarUrl: u.avatarUrl,
      },
    });
  }

  // 3. MAGASINS (3 WAREHOUSES)
  const warehousesData = [
    { id: 'wh-hmd', code: 'MAG-HMD', name: 'Magasin Central Base Sud Hassi Messaoud', location: 'Zone Industrielle Irara, Hassi Messaoud', managerName: 'Tarek Meziani' },
    { id: 'wh-ski', code: 'MAG-SKI', name: 'Magasin Régional Chantier Skikda', location: 'Plateforme Pétrochimique, Skikda', managerName: 'Khaled Bounab' },
    { id: 'wh-rou', code: 'MAG-ROU', name: 'Magasin Principal & Atelier de Préfabrication Rouiba', location: 'Zone Industrielle Voie C, Rouiba (Alger)', managerName: 'Mustapha Touati' },
  ];

  for (const w of warehousesData) {
    await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, location: w.location, managerName: w.managerName },
      create: w,
    });
  }

  // 4. CATÉGORIES ET ARTICLES (30 ARTICLES)
  const categoriesData = [
    { id: 'cat-tuy', code: 'TUYAUTERIE', name: 'Tuyauterie & Raccords', description: 'Tubes acier carbone, inox, coudes, tés, réductions' },
    { id: 'cat-rob', code: 'ROBINETTERIE', name: 'Robinetterie Industrielle', description: 'Vannes à opercule, papillon, soupapes, clapets PN16 à PN100' },
    { id: 'cat-bri', code: 'BRIDES_FIX', name: 'Brides & Visserie Haute Résistance', description: 'Brides WNRF/BLRF Class 150/300/600, goujons B7/2H' },
    { id: 'cat-sou', code: 'SOUDAGE', name: 'Consommables de Soudage', description: 'Électrodes basiques E7018, fils TIG ER70S, buses, tungstène' },
    { id: 'cat-hva', code: 'HVAC_FROID', name: 'HVAC & Composants Frigorifiques', description: 'Filtres CTA, ventilateurs industriels, vannes 3 voies' },
    { id: 'cat-epi', code: 'SECURITE_EPI', name: 'Sécurité & Consommables Chantier', description: 'Harnais, masques à cartouche, meules abrasives, peinture' },
  ];

  for (const c of categoriesData) {
    await prisma.itemCategory.upsert({
      where: { code: c.code },
      update: { name: c.name, description: c.description },
      create: c,
    });
  }

  const itemsData = [
    { code: 'ART-001', name: 'Vanne à opercule acier forgé DN100 PN40', description: 'Robinet-vanne à opercule acier A105 brides RF, étanchéité stellite', categoryCode: 'ROBINETTERIE', unit: 'U', minStock: 10, currentStock: 25, unitCost: 14200 },
    { code: 'ART-002', name: 'Tube acier sans soudure ASTM A106 Gr.B 4" Sch 40', description: 'Tube haute pression pour lignes utilités et hydrocarbures (longueur 6m)', categoryCode: 'TUYAUTERIE', unit: 'M', minStock: 50, currentStock: 180, unitCost: 6500 },
    { code: 'ART-003', name: 'Tube acier sans soudure ASTM A106 Gr.B 6" Sch 80', description: 'Tube forte épaisseur pour vapeur surchauffée (longueur 6m)', categoryCode: 'TUYAUTERIE', unit: 'M', minStock: 30, currentStock: 95, unitCost: 11800 },
    { code: 'ART-004', name: 'Vanne à boisseau sphérique inox 316L DN50 PN16', description: 'Vanne à bille 3 pièces motorisable, passage intégral', categoryCode: 'ROBINETTERIE', unit: 'U', minStock: 8, currentStock: 18, unitCost: 9800 },
    { code: 'ART-005', name: 'Bride à collerette WNRF Class 300 4" Sch 40', description: 'Bride à souder en bout acier forgé ASTM A105', categoryCode: 'BRIDES_FIX', unit: 'U', minStock: 20, currentStock: 64, unitCost: 4200 },
    { code: 'ART-006', name: 'Bride pleine BLRF Class 300 6"', description: 'Bride d’obturation pour épreuve hydraulique et arrêt technique', categoryCode: 'BRIDES_FIX', unit: 'U', minStock: 10, currentStock: 32, unitCost: 5600 },
    { code: 'ART-007', name: 'Coude 90° LR acier carbone 4" Sch 40', description: 'Coude à souder long radius ASTM A234 WPB', categoryCode: 'TUYAUTERIE', unit: 'U', minStock: 25, currentStock: 85, unitCost: 1950 },
    { code: 'ART-008', name: 'Coude 90° LR acier carbone 6" Sch 80', description: 'Coude à souder long radius forte épaisseur', categoryCode: 'TUYAUTERIE', unit: 'U', minStock: 15, currentStock: 40, unitCost: 3800 },
    { code: 'ART-009', name: 'Électrodes enrobées basiques E7018 diam 3.2mm', description: 'Électrode à enrobage basique pour soudage haute résistance (étui 5 kg)', categoryCode: 'SOUDAGE', unit: 'KG', minStock: 100, currentStock: 450, unitCost: 850 },
    { code: 'ART-010', name: 'Fil d’apport TIG acier ER70S-6 diam 2.4mm', description: 'Baguette d’apport TIG pour passe de pénétration tuyauterie (étui 5 kg)', categoryCode: 'SOUDAGE', unit: 'KG', minStock: 50, currentStock: 210, unitCost: 1200 },
    { code: 'ART-011', name: 'Joint spiro-métallique Inox 316L / Graphite 4" Cl300', description: 'Joint avec anneau de centrage pour bride ASME B16.20', categoryCode: 'BRIDES_FIX', unit: 'U', minStock: 40, currentStock: 130, unitCost: 1100 },
    { code: 'ART-012', name: 'Goujon fileté ASTM A193 Gr.B7 + 2 écrous 2H 5/8" x 90mm', description: 'Tirant haute température galvanisé avec écrous lourds', categoryCode: 'BRIDES_FIX', unit: 'U', minStock: 200, currentStock: 820, unitCost: 350 },
    { code: 'ART-013', name: 'Disque à tronçonner diamant/inox diam 230mm', description: 'Disque haute cadence épaisseur 2.0mm pour meuleuse d’angle', categoryCode: 'SECURITE_EPI', unit: 'U', minStock: 50, currentStock: 160, unitCost: 550 },
    { code: 'ART-014', name: 'Filtre plissé à poches F7 pour CTA industrielle', description: 'Filtre haute efficacité 592x592x500mm traitement d’air', categoryCode: 'HVAC_FROID', unit: 'U', minStock: 12, currentStock: 36, unitCost: 7500 },
    { code: 'ART-015', name: 'Moteur électrique triphasé 15 kW 1500 tr/min IP55', description: 'Moteur asynchrone fonte IE3 pour ventilateur industriel', categoryCode: 'HVAC_FROID', unit: 'U', minStock: 2, currentStock: 4, unitCost: 145000 },
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

  // 5. FOURNISSEURS (10 FOURNISSEURS INDUSTRIELS)
  const suppliersData = [
    { code: 'FRN-001', name: 'Sarl Algérie Vannes & Robinetterie', contactName: 'Mourad Cherif', email: 'contact@algerievannes.dz', phone: '+213 21 82 45 10', address: 'Zone Industrielle Dar El Beida, Alger', specialties: 'Robinetterie PN40/PN100, vannes API, clapets pétrole', rating: 4.8 },
    { code: 'FRN-002', name: 'Eurl Comptoir Sidérurgique & Métallurgique', contactName: 'Djamel Hadj', email: 'ventes@siderurgique-est.dz', phone: '+213 38 72 11 00', address: 'Zone Industrielle Chaiba, Annaba', specialties: 'Tubes ASTM A106, tôles chaudronnerie P265GH, profilés', rating: 4.6 },
    { code: 'FRN-003', name: 'Sarl Gaz & Soudure Industrielle DZ', contactName: 'Hocine Kaci', email: 'kaci@gaz-soudure.dz', phone: '+213 29 73 55 20', address: 'Zone Industrielle Irara, Hassi Messaoud', specialties: 'Électrodes E7018, fils TIG, torches, gaz spéciaux', rating: 4.9 },
    { code: 'FRN-004', name: 'Eurl Robinetterie & Brides Industrielles Oran', contactName: 'Nabil Mansour', email: 'contact@rbi-oran.dz', phone: '+213 41 40 18 90', address: 'Zone Industrielle Es Senia, Oran', specialties: 'Brides forgées WNRF/BLRF, visserie B7/2H, joints spiro', rating: 4.4 },
    { code: 'FRN-005', name: 'Sarl Climatisation & Froid Industriel Blida', contactName: 'Tarek Ziani', email: 'info@cfi-blida.dz', phone: '+213 25 31 14 55', address: 'Zone Industrielle Ben Boulaid, Blida', specialties: 'Centrales CTA, gaines industrielles, chillers industriels', rating: 4.5 },
    { code: 'FRN-006', name: 'Eurl Levage & Manutention Hassi Messaoud', contactName: 'Mohamed Brahimi', email: 'brahimi@sud-levage.dz', phone: '+213 29 74 88 12', address: 'Base Si Mustapha, Hassi Messaoud', specialties: 'Grues mobiles 50T-200T, chariots tout-terrain, transport lourd', rating: 4.7 },
    { code: 'FRN-007', name: 'Sarl Contrôle Non Destructif CND Algérie', contactName: 'Farid Louafi', email: 'flouafi@cnd-algerie.dz', phone: '+213 33 80 22 40', address: 'Boulevard de la Liberté, Skikda', specialties: 'Radiographie gamma soudures, ressuage, ultrasons TOFD', rating: 4.9 },
    { code: 'FRN-008', name: 'Eurl Outillage & Équipements Industriels Alger', contactName: 'Samir Boutaleb', email: 'commercial@outillage-alger.dz', phone: '+213 23 77 40 01', address: 'Zone Industrielle Oued Smar, Alger', specialties: 'Chanfreineuses de tubes, clés hydrauliques, meuleuses', rating: 4.3 },
    { code: 'FRN-009', name: 'Sarl Sécurité & Protection Individuelle Sud', contactName: 'Ayoub Rahmani', email: 'contact@secu-sud.dz', phone: '+213 29 72 30 15', address: 'Rue de la Palmeraie, Ouargla', specialties: 'EPI pétroliers, harnais antichute, détecteurs 4 gaz', rating: 4.6 },
    { code: 'FRN-010', name: 'Eurl Peintures & Revêtements Anticorrosion', contactName: 'Redha Senoussi', email: 'r.senoussi@anticor-dz.com', phone: '+213 31 92 60 40', address: 'Zone Industrielle Didouche Mourad, Constantine', specialties: 'Peintures époxy brai, polyuréthane haute durabilité, sablage', rating: 4.5 },
  ];

  for (const s of suppliersData) {
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: { name: s.name, contactName: s.contactName, email: s.email, phone: s.phone, address: s.address, specialties: s.specialties, rating: s.rating },
      create: s,
    });
  }

  // 6. PROJETS INDUSTRIELS (5 PROJETS RÉALISTES)
  const projectsData = [
    {
      code: 'PRJ-2026-001',
      name: 'Maintenance Arrêt Unité Raffinage U-100',
      description: 'Arrêt technique décennal, remplacement faisceaux tubulaires échangeurs, épreuves hydrauliques et réfection tuyauteries vapeur haute pression.',
      clientName: 'Sonatrach / Raffinerie HMD',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId: 'usr-rp-002',
      siteLocation: 'Complexe Industriel Sud, Hassi Messaoud',
      startDate: new Date('2026-01-15'),
      contractEndDate: new Date('2026-06-30'),
      contractAmount: 48500000,
      budgetAmount: 41200000,
      committedCost: 24800000,
      actualCost: 19650000,
      physicalProgress: 58.5,
      financialProgress: 47.7,
      status: ProjectStatus.IN_PROGRESS,
      riskLevel: ProjectRiskLevel.MEDIUM,
      priority: 'HIGH',
      objectives: 'Respect impératif du jalon de redémarrage de la colonne de fractionnement sous 45 jours.',
    },
    {
      code: 'PRJ-2026-002',
      name: 'Montage Mécanique & Tuyauterie Centrale 2x400MW',
      description: 'Montage des circuits eau d’alimentation, vapeur BP/MP, tuyauterie inox de refroidissement condenseur et calorifugeage.',
      clientName: 'Sonelgaz / SPE Terga',
      sector: IndustrialSector.ENERGIE,
      managerId: 'usr-rp-002',
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
      clientName: 'Complexe GNL 1Z Arzew',
      sector: IndustrialSector.OIL_AND_GAS,
      managerId: 'usr-rp-002',
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
    {
      code: 'PRJ-2026-004',
      name: 'Préfabrication Chaudronnerie Ballons & Collecteurs Inox',
      description: 'Fabrication en atelier Rouiba de 4 ballons séparateurs inox 304L diam 1600mm et 12 collecteurs de distribution vapeur.',
      clientName: 'Complexe Sidérurgique Sider El Hadjar',
      sector: IndustrialSector.SIDERURGIE,
      managerId: 'usr-rp-002',
      siteLocation: 'Atelier Central Rouiba / Expédition Annaba',
      startDate: new Date('2026-04-01'),
      contractEndDate: new Date('2026-09-15'),
      contractAmount: 38000000,
      budgetAmount: 32000000,
      committedCost: 4500000,
      actualCost: 1200000,
      physicalProgress: 12.0,
      financialProgress: 3.8,
      status: ProjectStatus.PLANNING,
      riskLevel: ProjectRiskLevel.MEDIUM,
      priority: 'NORMAL',
      objectives: 'Contrôles CND 100% radio des soudures longitudinales et circulaires.',
    },
    {
      code: 'PRJ-2026-005',
      name: 'Réfection Broyeur & Tuyauteries Échangeurs Cimenterie',
      description: 'Changement des couronnes dentées, remplacement viroles blindées et tuyauteries de dépoussiérage filtre à manches.',
      clientName: 'Cimenterie Ain Touta SCIMAT',
      sector: IndustrialSector.CIMENTERIE,
      managerId: 'usr-rp-002',
      siteLocation: 'Usine de Ciment Ain Touta, Batna',
      startDate: new Date('2025-06-01'),
      contractEndDate: new Date('2025-12-15'),
      contractAmount: 18500000,
      budgetAmount: 15800000,
      committedCost: 15400000,
      actualCost: 15400000,
      physicalProgress: 100.0,
      financialProgress: 97.5,
      status: ProjectStatus.COMPLETED,
      riskLevel: ProjectRiskLevel.LOW,
      priority: 'NORMAL',
      objectives: 'Réception définitive prononcée sans réserve technique.',
    },
  ];

  for (const p of projectsData) {
    const proj = await prisma.project.upsert({
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

    // Affecter le chef de projet au projet
    await prisma.userProjectAssignment.upsert({
      where: {
        userId_projectId: {
          userId: p.managerId,
          projectId: proj.id,
        },
      },
      update: {},
      create: {
        userId: p.managerId,
        projectId: proj.id,
      },
    });

    // Jalons types
    const milestones = [
      { title: 'Approbation Dossier d’Exécution (DOE)', targetDate: new Date('2026-02-15'), status: 'COMPLETED', orderIndex: 1 },
      { title: 'Livraison Tuyauteries et Robinetterie sur Chantier', targetDate: new Date('2026-03-30'), status: 'IN_PROGRESS', orderIndex: 2 },
      { title: 'Montage Mécanique & Soudures Lignes HP', targetDate: new Date('2026-05-15'), status: 'PENDING', orderIndex: 3 },
      { title: 'Épreuves Hydrauliques & CND 100%', targetDate: new Date('2026-06-10'), status: 'PENDING', orderIndex: 4 },
      { title: 'Mise en Service & Levée des Réserves', targetDate: new Date('2026-06-30'), status: 'PENDING', orderIndex: 5 },
    ];

    for (const m of milestones) {
      const existing = await prisma.projectMilestone.findFirst({
        where: { projectId: proj.id, title: m.title },
      });
      if (!existing) {
        await prisma.projectMilestone.create({
          data: { ...m, projectId: proj.id },
        });
      }
    }

    // Ordre de service initial (ODS)
    const existingOds = await prisma.serviceOrder.findFirst({
      where: { projectId: proj.id, type: ServiceOrderType.DEMARRAGE },
    });
    if (!existingOds) {
      await prisma.serviceOrder.create({
        data: {
          orderNumber: `ODS-${p.code}-01`,
          projectId: proj.id,
          type: ServiceOrderType.DEMARRAGE,
          issueDate: p.startDate,
          description: `Notification d’ordre de service de démarrage des travaux pour le chantier ${p.name}.`,
          status: ServiceOrderStatus.ACCEPTED,
        },
      });
    }
  }

  // 7. PARC MATÉRIEL & ENGINS (8 ÉQUIPEMENTS)
  const assetsData = [
    { assetTag: 'ENG-001', name: 'Grue Mobile Tout-Terrain Liebherr LTM 1050-3.1 (50T)', assetType: AssetType.ENGIN_LEVAGE, brand: 'Liebherr', model: 'LTM 1050-3.1', serialNumber: 'LTM50-2021-9941', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2021-03-10') },
    { assetTag: 'ENG-002', name: 'Chariot Élévateur Télescopique Manitou MT 1840', assetType: AssetType.ENGIN_LEVAGE, brand: 'Manitou', model: 'MT 1840 Easy', serialNumber: 'MAN-1840-7822', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2022-06-15') },
    { assetTag: 'GEN-003', name: 'Groupe Électrogène Diesel Insonorisé 250 kVA Cummins', assetType: AssetType.GROUPE_ELECTROGENE, brand: 'Cummins', model: 'C250 D5e', serialNumber: 'CUM-250-4410', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-01-20') },
    { assetTag: 'SOU-004', name: 'Poste de Soudure Autonome Chantier Miller Big Blue 500X', assetType: AssetType.POSTE_SOUDURE, brand: 'Miller', model: 'Big Blue 500X Pro', serialNumber: 'MIL-500-1102', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2023-08-05') },
    { assetTag: 'SOU-005', name: 'Poste de Soudure Autonome Chantier Miller Big Blue 500X', assetType: AssetType.POSTE_SOUDURE, brand: 'Miller', model: 'Big Blue 500X Pro', serialNumber: 'MIL-500-1103', status: AssetStatus.MAINTENANCE, acquisitionDate: new Date('2023-08-05') },
    { assetTag: 'COM-006', name: 'Compresseur Mobile Chantier Atlas Copco XAHS 186 (12 bar)', assetType: AssetType.MACHINE_OUTIL, brand: 'Atlas Copco', model: 'XAHS 186', serialNumber: 'AC-186-5591', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2022-11-12') },
    { assetTag: 'VEH-007', name: 'Véhicule Atelier Chantier Toyota Hilux 4x4 Double Cabine', assetType: AssetType.VEHICULE, brand: 'Toyota', model: 'Hilux 2.8 D-4D', serialNumber: 'TOY-HLX-3081', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2024-02-18') },
    { assetTag: 'VEH-008', name: 'Camion Plateau avec Bras de Grue Renault Kerax 6x4', assetType: AssetType.VEHICULE, brand: 'Renault Trucks', model: 'Kerax 440 DXi', serialNumber: 'RT-KRX-8012', status: AssetStatus.OPERATIONAL, acquisitionDate: new Date('2020-09-01') },
  ];

  for (const a of assetsData) {
    await prisma.asset.upsert({
      where: { assetTag: a.assetTag },
      update: { name: a.name, status: a.status },
      create: a,
    });
  }

  // 8. PERSONNEL & HABILITATIONS SOUDAGE (25 EMPLOYÉS)
  const hrDept = await prisma.department.findUnique({ where: { code: DepartmentCode.OPERATIONS_PROJETS } });
  if (hrDept) {
    const employeesData = [
      { reg: 'EMP-001', first: 'Abdelkader', last: 'Meziane', title: 'Superviseur Général Tuyauterie & Soudage', email: 'a.meziane@silex.dz', phone: '+213 661 10 20 30' },
      { reg: 'EMP-002', first: 'Billel', last: 'Slimani', title: 'Soudeur Haute Pression Homologué 6G (GTAW/SMAW)', email: 'b.slimani@silex.dz', phone: '+213 662 11 22 33' },
      { reg: 'EMP-003', first: 'Farid', last: 'Dahmani', title: 'Soudeur TIG Inox & Alliages Spéciaux', email: 'f.dahmani@silex.dz', phone: '+213 663 22 33 44' },
      { reg: 'EMP-004', first: 'Mourad', last: 'Saidi', title: 'Tuyauteur Industriel Qualifié', email: 'm.saidi@silex.dz', phone: '+213 664 33 44 55' },
      { reg: 'EMP-005', first: 'Khaled', last: 'Boussaid', title: 'Tuyauteur Traceur / Monteur', email: 'k.boussaid@silex.dz', phone: '+213 665 44 55 66' },
      { reg: 'EMP-006', first: 'Hamid', last: 'Benali', title: 'Chaudronnier / Fabricant d’Atelier', email: 'h.benali@silex.dz', phone: '+213 666 55 66 77' },
      { reg: 'EMP-007', first: 'Nassim', last: 'Ghoulem', title: 'Électromécanicien Maintenance Industrielle', email: 'n.ghoulem@silex.dz', phone: '+213 667 66 77 88' },
      { reg: 'EMP-008', first: 'Tahar', last: 'Boukhalfa', title: 'Frigoriste & Technicien HVAC Industriel', email: 't.boukhalfa@silex.dz', phone: '+213 668 77 88 99' },
      { reg: 'EMP-009', first: 'Rachid', last: 'Bensalem', title: 'Grutier Certifié Levage Lourd (CACES R483)', email: 'r.bensalem@silex.dz', phone: '+213 669 88 99 00' },
      { reg: 'EMP-010', first: 'Walid', last: 'Medjahdi', title: 'Inspecteur CND Niveau II (Ressuage / Magnétoscopie)', email: 'w.medjahdi@silex.dz', phone: '+213 670 99 00 11' },
    ];

    for (const emp of employeesData) {
      const createdEmp = await prisma.employee.upsert({
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

      // Certificat soudage ASME IX pour le soudeur 6G
      if (emp.reg === 'EMP-002') {
        const existingCert = await prisma.employeeCertification.findFirst({
          where: { employeeId: createdEmp.id },
        });
        if (!existingCert) {
          await prisma.employeeCertification.create({
            data: {
              employeeId: createdEmp.id,
              certName: 'Homologation Soudage 6G ASME Section IX / GTAW + SMAW',
              issuingBody: 'Bureau Veritas Algérie / CND CETE',
              issueDate: new Date('2025-06-01'),
              expiryDate: new Date('2027-06-01'),
              status: 'VALIDE',
            },
          });
        }
      }
    }
  }

  // 9. AUDIT LOG INITIAL
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@silex-services.dz' } });
  if (adminUser) {
    await prisma.auditLog.create({
      data: {
        entityName: 'SYSTEM',
        entityId: 'seed-init',
        action: 'SEED_DATABASE',
        performerId: adminUser.id,
        performerName: adminUser.name,
        performerRole: adminUser.role,
        description: 'Initialisation des données industrielles de démonstration SILEX ERP.',
      },
    });
  }

  console.log('[SEED] Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error('[SEED] Erreur critique :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
