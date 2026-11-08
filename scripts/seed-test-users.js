const { PrismaClient } = require('../apps/web/node_modules/@prisma/client');

const neonUrl = "postgresql://neondb_owner:npg_mkEtYFN6HKr0@ep-solitary-sun-be7s53de.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl,
    },
  },
});

const DEPARTMENTS = [
  { code: 'DIRECTION_GENERALE', name: 'Direction Générale', description: 'Direction Générale SILEX SERVICES' },
  { code: 'OPERATIONS_PROJETS', name: 'Opérations & Chantiers', description: 'Conduite de chantiers industriels, CND & Tuyauterie' },
  { code: 'ACHATS_LOGISTIQUE', name: 'Achats & Approvisionnements', description: 'Gestion des consultations fournisseurs et commandes' },
  { code: 'MAGASIN_STOCKS', name: 'Magasins & Stocks', description: 'Gestion des dépôts régionaux (Arzew, Hassi Messaoud, Rouiba)' },
  { code: 'FINANCE_COMPTABILITE', name: 'Finance & Trésorerie', description: 'Facturation, retenues de garantie 5% et trésorerie' },
  { code: 'RESSOURCES_HUMAINES', name: 'Ressources Humaines', description: 'Gestion des effectifs, pointages et qualifications CQS' },
  { code: 'PARC_MAINTENANCE', name: 'Parc & Maintenance', description: 'Gestion de la flotte engins, postes et interventions' },
  { code: 'QHSE', name: 'Qualité, Hygiène, Sécurité & CND', description: 'Contrôles qualité, cahier de soudage et audits ISO' },
  { code: 'INFORMATIQUE_ADMIN', name: 'Systèmes d’Information', description: 'Administration de la plateforme ERP et sécurité' },
];

const TEST_USERS = [
  {
    id: 'usr-superadmin-001',
    name: 'Super Administrateur SILEX',
    email: 'admin@silex-services.dz',
    role: 'ADMINISTRATEUR',
    departmentCode: 'DIRECTION_GENERALE',
    title: 'Super Administrateur & Directeur des Systèmes ERP',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-dg-001',
    name: 'Amine Benali',
    email: 'dg@silex-services.dz',
    role: 'DIRECTEUR_GENERAL',
    departmentCode: 'DIRECTION_GENERALE',
    title: 'Directeur Général SILEX',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-dg-002',
    name: 'Amine Benali (Nominal)',
    email: 'a.benali@silex-services.dz',
    role: 'DIRECTEUR_GENERAL',
    departmentCode: 'DIRECTION_GENERALE',
    title: 'Directeur Général SILEX',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-rp-001',
    name: 'Karim Mansouri',
    email: 'projets@silex-services.dz',
    role: 'RESPONSABLE_PROJET',
    departmentCode: 'OPERATIONS_PROJETS',
    title: 'Chef de Projets & Conduite de Travaux',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-rp-002',
    name: 'Karim Mansouri (Nominal)',
    email: 'k.mansouri@silex-services.dz',
    role: 'RESPONSABLE_PROJET',
    departmentCode: 'OPERATIONS_PROJETS',
    title: 'Chef de Projets Industriels',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-ach-001',
    name: 'Farouk Brahimi',
    email: 'achats@silex-services.dz',
    role: 'RESPONSABLE_ACHATS',
    departmentCode: 'ACHATS_LOGISTIQUE',
    title: 'Responsable Achats & Supply Chain',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-ach-002',
    name: 'Farouk Brahimi (Nominal)',
    email: 'f.brahimi@silex-services.dz',
    role: 'RESPONSABLE_ACHATS',
    departmentCode: 'ACHATS_LOGISTIQUE',
    title: 'Responsable Approvisionnements & Achats',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-mag-001',
    name: 'Tarek Meziani',
    email: 'magasin@silex-services.dz',
    role: 'RESPONSABLE_MAGASIN',
    departmentCode: 'MAGASIN_STOCKS',
    title: 'Gestionnaire Magasins & Stocks',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-mag-002',
    name: 'Tarek Meziani (Nominal)',
    email: 't.meziani@silex-services.dz',
    role: 'RESPONSABLE_MAGASIN',
    departmentCode: 'MAGASIN_STOCKS',
    title: 'Gestionnaire Magasins & Stocks',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-fin-001',
    name: 'Réda Bouzid',
    email: 'finance@silex-services.dz',
    role: 'RESPONSABLE_FINANCIER',
    departmentCode: 'FINANCE_COMPTABILITE',
    title: 'Directeur Financier & Contrôle de Gestion',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-fin-002',
    name: 'Réda Bouzid (Nominal)',
    email: 'r.bouzid@silex-services.dz',
    role: 'RESPONSABLE_FINANCIER',
    departmentCode: 'FINANCE_COMPTABILITE',
    title: 'Directeur Financier & Trésorerie',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-rh-001',
    name: 'Sabrina Haddad',
    email: 'rh@silex-services.dz',
    role: 'RESPONSABLE_RH',
    departmentCode: 'RESSOURCES_HUMAINES',
    title: 'Responsable Ressources Humaines & CQS',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-rh-002',
    name: 'Sabrina Haddad (Nominal)',
    email: 's.haddad@silex-services.dz',
    role: 'RESPONSABLE_RH',
    departmentCode: 'RESSOURCES_HUMAINES',
    title: 'Responsable RH & Compétences',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-mnt-001',
    name: 'Mourad Zitouni',
    email: 'maintenance@silex-services.dz',
    role: 'RESPONSABLE_MAINTENANCE',
    departmentCode: 'PARC_MAINTENANCE',
    title: 'Responsable Parc Matériel & Maintenance',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-mnt-002',
    name: 'Mourad Zitouni (Nominal)',
    email: 'm.zitouni@silex-services.dz',
    role: 'RESPONSABLE_MAINTENANCE',
    departmentCode: 'PARC_MAINTENANCE',
    title: 'Responsable Maintenance & Parc Engins',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-qhse-001',
    name: 'Nadia Chaib',
    email: 'qualite@silex-services.dz',
    role: 'RESPONSABLE_QUALITE',
    departmentCode: 'QHSE',
    title: 'Responsable QHSE & Contrôles CND',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
  {
    id: 'usr-qhse-002',
    name: 'Nadia Chaib (Nominal)',
    email: 'n.chaib@silex-services.dz',
    role: 'RESPONSABLE_QUALITE',
    departmentCode: 'QHSE',
    title: 'Responsable Qualité & Sécurité QHSE',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexpass2026',
  },
];

async function seedTestUsers() {
  console.log('⚡ ========================================================');
  console.log('⚡ SEED DES UTILISATEURS DE TEST MULTI-RBAC SILEX');
  console.log('⚡ ========================================================\n');

  // 1. Déploiement / Mise à jour des Départements
  console.log('📁 1. Vérification et création des Départements...');
  const deptMap = {};
  for (const d of DEPARTMENTS) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description },
      create: d,
    });
    deptMap[d.code] = dept.id;
    console.log(`   ✅ Département [${d.code}] : ${d.name}`);
  }

  // 2. Déploiement des utilisateurs de test
  console.log('\n👤 2. Enregistrement des utilisateurs de test RBAC...');
  for (const u of TEST_USERS) {
    const res = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        departmentCode: u.departmentCode,
        departmentId: deptMap[u.departmentCode] || null,
        title: u.title,
        active: true,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentCode: u.departmentCode,
        departmentId: deptMap[u.departmentCode] || null,
        title: u.title,
        passwordHash: u.passwordHash,
        active: true,
      },
    });
    console.log(`   ✅ [${res.role.padEnd(23)}] ${res.email.padEnd(30)} -> ${res.name}`);
  }

  const totalUsers = await prisma.user.count();
  console.log(`\n🎉 Synchronisation réussie ! Total utilisateurs actifs en base : ${totalUsers}`);
  await prisma.$disconnect();
}

seedTestUsers().catch((e) => {
  console.error('❌ Erreur seed:', e);
  process.exit(1);
});
