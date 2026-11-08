const { PrismaClient } = require('../apps/web/node_modules/@prisma/client');

const neonUrl = "postgresql://neondb_owner:npg_mkEtYFN6HKr0@ep-solitary-sun-be7s53de.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl,
    },
  },
});

async function main() {
  console.log('🌱 Initialisation du compte système et des magasins sur Neon PostgreSQL...');

  // 1. Initialiser les 9 utilisateurs réels
  const systemUsers = [
    {
      id: 'usr-dg-001',
      name: 'Amine Benali',
      email: 'a.benali@silex-services.dz',
      role: 'DIRECTEUR_GENERAL',
      departmentCode: 'DIRECTION_GENERALE',
      title: 'Directeur Général',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-rp-002',
      name: 'Karim Mansouri',
      email: 'k.mansouri@silex-services.dz',
      role: 'RESPONSABLE_PROJET',
      departmentCode: 'OPERATIONS_PROJETS',
      title: 'Chef de Projets Industriels',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-ach-003',
      name: 'Farida Brahimi',
      email: 'f.brahimi@silex-services.dz',
      role: 'RESPONSABLE_ACHATS',
      departmentCode: 'ACHATS_LOGISTIQUE',
      title: 'Responsable Approvisionnements & Achats',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-mag-004',
      name: 'Tarek Meziani',
      email: 't.meziani@silex-services.dz',
      role: 'RESPONSABLE_MAGASIN',
      departmentCode: 'MAGASIN_STOCKS',
      title: 'Gestionnaire Magasin Central',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-rh-005',
      name: 'Samira Haddad',
      email: 's.haddad@silex-services.dz',
      role: 'RESPONSABLE_RH',
      departmentCode: 'RESSOURCES_HUMAINES',
      title: 'Responsable RH & Compétences',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-fin-006',
      name: 'Rachid Bouzid',
      email: 'r.bouzid@silex-services.dz',
      role: 'RESPONSABLE_FINANCIER',
      departmentCode: 'FINANCE_COMPTABILITE',
      title: 'Directeur Financier & Contrôle de Gestion',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-mnt-007',
      name: 'Yacine Khelifi',
      email: 'y.khelifi@silex-services.dz',
      role: 'RESPONSABLE_MAINTENANCE',
      departmentCode: 'PARC_MAINTENANCE',
      title: 'Responsable Matériel & Parc Engins',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-qhse-008',
      name: 'Nadia Chaib',
      email: 'n.chaib@silex-services.dz',
      role: 'RESPONSABLE_QUALITE',
      departmentCode: 'QHSE',
      title: 'Responsable Qualité & Sécurité QHSE',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
    {
      id: 'usr-adm-009',
      name: 'Lyes Hamidi',
      email: 'admin@silex-services.dz',
      role: 'ADMINISTRATEUR',
      departmentCode: 'DIRECTION_GENERALE',
      title: 'Administrateur Système ERP',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
    },
  ];

  for (const u of systemUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name, title: u.title, departmentCode: u.departmentCode },
      create: u,
    });
  }
  console.log(`✅ ${systemUsers.length} comptes système réels initialisés.`);

  // 2. Initialiser les 2 magasins officiels
  const warehouses = [
    {
      id: 'wh-arzew-01',
      code: 'MAG-ARZEW-01',
      name: 'Magasin Central Arzew (ZI Ouest)',
      location: 'Zone Industrielle Arzew, W. Oran',
      managerName: 'Tarek Meziani',
      active: true,
    },
    {
      id: 'wh-hassi-02',
      code: 'MAG-HMD-02',
      name: 'Base Logistique & Chantier Hassi Messaoud',
      location: 'Zone Industrielle Irara, Hassi Messaoud, W. Ouargla',
      managerName: 'Yacine Khelifi',
      active: true,
    },
  ];

  for (const w of warehouses) {
    await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, location: w.location, managerName: w.managerName },
      create: w,
    });
  }
  console.log(`✅ ${warehouses.length} magasins de référence initialisés.`);

  console.log('🎉 Base Neon initialisée avec succès (0 mockdata : projets et DAs vierges).');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Erreur seeding Neon:', e);
  await prisma.$disconnect();
  process.exit(1);
});
