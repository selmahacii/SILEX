import { PrismaClient, SystemRole, DepartmentCode } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('  SILEX INDUSTRIAL ERP — INITIALISATION VERSION VIERGE (CLEAN)');
  console.log('================================================================\n');

  // 1. PURGE TRANSACTIONNELLE COMPLÈTE
  console.log('[1/4] Purge des mouvements, commandes, chantiers et opérations...');

  // Notifications & Audit
  await prisma.notification.deleteMany().catch(() => {});
  await prisma.auditLog.deleteMany().catch(() => {});

  // Finance & Coûts
  await prisma.projectCostEntry.deleteMany().catch(() => {});
  await prisma.projectMaterialAllocation.deleteMany().catch(() => {});

  // Qualité & Maintenance
  await prisma.nonConformity.deleteMany().catch(() => {});
  await prisma.document.deleteMany().catch(() => {});
  await prisma.maintenanceOrder.deleteMany().catch(() => {});
  await prisma.asset.deleteMany().catch(() => {});

  // RH & Pointages
  await prisma.attendance.deleteMany().catch(() => {});
  await prisma.employeeCertification.deleteMany().catch(() => {});
  await prisma.employee.deleteMany().catch(() => {});

  // Stocks & Magasins
  await prisma.stockMovement.deleteMany().catch(() => {});
  await prisma.goodsReceiptLine.deleteMany().catch(() => {});
  await prisma.goodsReceipt.deleteMany().catch(() => {});
  await prisma.item.deleteMany().catch(() => {});

  // Achats & Commandes
  await prisma.supplierQuoteLine.deleteMany().catch(() => {});
  await prisma.supplierQuote.deleteMany().catch(() => {});
  await prisma.purchaseOrderLine.deleteMany().catch(() => {});
  await prisma.purchaseOrder.deleteMany().catch(() => {});
  await prisma.purchaseRequestLine.deleteMany().catch(() => {});
  await prisma.purchaseRequest.deleteMany().catch(() => {});
  await prisma.supplier.deleteMany().catch(() => {});

  // Projets, ODS, Situations, Jalons
  await prisma.workSituation.deleteMany().catch(() => {});
  await prisma.serviceOrder.deleteMany().catch(() => {});
  await prisma.projectTask.deleteMany().catch(() => {});
  await prisma.projectMilestone.deleteMany().catch(() => {});
  await prisma.userProjectAssignment.deleteMany().catch(() => {});
  await prisma.project.deleteMany().catch(() => {});

  console.log('  ✓ Tables transactionnelles vidées (0 projets, 0 achats, 0 stocks, 0 pointages).');

  // 2. CRÉATION DES 9 DÉPARTEMENTS
  console.log('\n[2/4] Initialisation des 9 départements fondamentaux...');
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
  console.log('  ✓ 9 Départements configurés.');

  const deptMap = await prisma.department.findMany();
  const getDeptId = (code: DepartmentCode) => deptMap.find(d => d.code === code)?.id;

  // 3. UTILISATEURS D'ACCÈS
  console.log('\n[3/4] Initialisation des comptes utilisateurs d’accès (Mot de passe : SilexDemo2026!)...');
  const passwordHash = await argon2.hash('SilexDemo2026!');

  const usersData = [
    {
      email: 'admin@silex-services.dz',
      name: 'Administrateur Système',
      title: 'Administrateur Plateforme ERP',
      role: SystemRole.ADMINISTRATEUR,
      departmentCode: DepartmentCode.INFORMATIQUE_ADMIN,
      departmentId: getDeptId(DepartmentCode.INFORMATIQUE_ADMIN),
    },
    {
      email: 'k.mansouri@silex-services.dz',
      name: 'Karim Mansouri',
      title: 'Directeur Général',
      role: SystemRole.DIRECTEUR_GENERAL,
      departmentCode: DepartmentCode.DIRECTION_GENERALE,
      departmentId: getDeptId(DepartmentCode.DIRECTION_GENERALE),
    },
    {
      email: 's.belkacem@silex-services.dz',
      name: 'Sofiane Belkacem',
      title: 'Chef de Projets Industriels',
      role: SystemRole.RESPONSABLE_PROJET,
      departmentCode: DepartmentCode.OPERATIONS_PROJETS,
      departmentId: getDeptId(DepartmentCode.OPERATIONS_PROJETS),
    },
    {
      email: 'a.benali@silex-services.dz',
      name: 'Amina Benali',
      title: 'Responsable Achats & Approvisionnements',
      role: SystemRole.RESPONSABLE_ACHATS,
      departmentCode: DepartmentCode.ACHATS_LOGISTIQUE,
      departmentId: getDeptId(DepartmentCode.ACHATS_LOGISTIQUE),
    },
    {
      email: 't.meziani@silex-services.dz',
      name: 'Tarek Meziani',
      title: 'Responsable Magasin & Stocks',
      role: SystemRole.RESPONSABLE_MAGASIN,
      departmentCode: DepartmentCode.MAGASIN_STOCKS,
      departmentId: getDeptId(DepartmentCode.MAGASIN_STOCKS),
    },
    {
      email: 's.haddad@silex-services.dz',
      name: 'Samira Haddad',
      title: 'Responsable Ressources Humaines',
      role: SystemRole.RESPONSABLE_RH,
      departmentCode: DepartmentCode.RESSOURCES_HUMAINES,
      departmentId: getDeptId(DepartmentCode.RESSOURCES_HUMAINES),
    },
    {
      email: 'o.brahimi@silex-services.dz',
      name: 'Omar Brahimi',
      title: 'Directeur Financier & Contrôle de Gestion',
      role: SystemRole.RESPONSABLE_FINANCIER,
      departmentCode: DepartmentCode.FINANCE_COMPTABILITE,
      departmentId: getDeptId(DepartmentCode.FINANCE_COMPTABILITE),
    },
    {
      email: 'y.khelifi@silex-services.dz',
      name: 'Yacine Khelifi',
      title: 'Responsable Maintenance & Parc Matériel',
      role: SystemRole.RESPONSABLE_MAINTENANCE,
      departmentCode: DepartmentCode.PARC_MAINTENANCE,
      departmentId: getDeptId(DepartmentCode.PARC_MAINTENANCE),
    },
    {
      email: 'n.chaib@silex-services.dz',
      name: 'Nadia Chaib',
      title: 'Responsable Qualité, Sécurité & Environnement',
      role: SystemRole.RESPONSABLE_QUALITE,
      departmentCode: DepartmentCode.QHSE,
      departmentId: getDeptId(DepartmentCode.QHSE),
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
        active: true,
      },
      create: {
        email: u.email,
        name: u.name,
        title: u.title,
        role: u.role,
        departmentCode: u.departmentCode,
        departmentId: u.departmentId,
        passwordHash,
        active: true,
      },
    });
  }
  console.log('  ✓ 9 Utilisateurs socles configurés.');

  // 4. RÉFÉRENTIEL TECHNIQUE : 1 MAGASIN CENTRAL
  console.log('\n[4/4] Création du magasin central de référence...');
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: 'MAG-CENTRAL-01' },
    update: {
      name: 'Magasin Central & Parc Logistique Principal',
      location: 'Base Centrale SILEX — Hassi Messaoud (Ouargla)',
      active: true,
      managerName: 'Tarek Meziani',
    },
    create: {
      code: 'MAG-CENTRAL-01',
      name: 'Magasin Central & Parc Logistique Principal',
      location: 'Base Centrale SILEX — Hassi Messaoud (Ouargla)',
      active: true,
      managerName: 'Tarek Meziani',
    },
  });
  console.log(`  ✓ Magasin de référence : ${mainWarehouse.name} (${mainWarehouse.code})`);

  // Log d'audit initial
  const admin = await prisma.user.findUnique({ where: { email: 'admin@silex-services.dz' } });
  if (admin) {
    await prisma.auditLog.create({
      data: {
        entityName: 'SYSTEM',
        entityId: 'init-blank',
        action: 'PLATFORM_CLEAN_INITIALIZED',
        performerId: admin.id,
        performerName: 'Administrateur Système',
        performerRole: 'ADMINISTRATEUR',
        description: 'Initialisation de la plateforme SILEX en version vierge opérationnelle.',
        afterState: JSON.stringify({ status: 'CLEAN_SLATE', projects: 0, users: usersData.length }),
      },
    });
  }

  console.log('\n================================================================');
  console.log('  🌟 VERSION VIERGE OPÉRATIONNELLE PRÊTE !');
  console.log('  • 0 Projets (prêt pour la saisie du 1er chantier)');
  console.log('  • 0 Achats / Commandes (prêt pour la 1ère DA)');
  console.log('  • 0 Mouvements de stocks');
  console.log('  • 0 Collaborateurs / Pointages');
  console.log('  • 1 Magasin central & 9 départements prêts à l’emploi');
  console.log('  • Connexion immédiate : admin@silex-services.dz / SilexDemo2026!');
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error('Erreur lors de l’initialisation vierge :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
