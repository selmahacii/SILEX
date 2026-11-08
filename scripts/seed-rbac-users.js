const { PrismaClient } = require('../apps/web/node_modules/@prisma/client');

const neonUrl = "postgresql://neondb_owner:npg_mkEtYFN6HKr0@ep-solitary-sun-be7s53de.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl,
    },
  },
});

const officialUsers = [
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
    id: 'usr-rp-003',
    name: 'Sofiane Belkacem',
    email: 's.belkacem@silex-services.dz',
    role: 'RESPONSABLE_PROJET',
    departmentCode: 'OPERATIONS_PROJETS',
    title: 'Conducteur de Travaux & Chantier',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
  },
  {
    id: 'usr-ach-004',
    name: 'Farida Brahimi',
    email: 'f.brahimi@silex-services.dz',
    role: 'RESPONSABLE_ACHATS',
    departmentCode: 'ACHATS_LOGISTIQUE',
    title: 'Responsable Approvisionnements & Achats',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
  },
  {
    id: 'usr-mag-005',
    name: 'Tarek Meziani',
    email: 't.meziani@silex-services.dz',
    role: 'RESPONSABLE_MAGASIN',
    departmentCode: 'MAGASIN_STOCKS',
    title: 'Gestionnaire Magasins & Stocks',
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
    id: 'usr-rh-007',
    name: 'Samira Haddad',
    email: 's.haddad@silex-services.dz',
    role: 'RESPONSABLE_RH',
    departmentCode: 'RESSOURCES_HUMAINES',
    title: 'Responsable RH & Compétences',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
  },
  {
    id: 'usr-mnt-008',
    name: 'Yacine Khelifi',
    email: 'y.khelifi@silex-services.dz',
    role: 'RESPONSABLE_MAINTENANCE',
    departmentCode: 'PARC_MAINTENANCE',
    title: 'Responsable Matériel & Parc Engins',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
  },
  {
    id: 'usr-qhse-009',
    name: 'Nadia Chaib',
    email: 'n.chaib@silex-services.dz',
    role: 'RESPONSABLE_QUALITE',
    departmentCode: 'QHSE',
    title: 'Responsable Qualité & Sécurité QHSE',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
  },
  {
    id: 'usr-adm-010',
    name: 'Lyes Hamidi',
    email: 'admin@silex-services.dz',
    role: 'ADMINISTRATEUR',
    departmentCode: 'DIRECTION_GENERALE',
    title: 'Administrateur Système ERP',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexdemo2026hash',
  },
];

async function main() {
  console.log('🌱 Mise à jour des comptes RBAC officiels sur Neon PostgreSQL...');
  for (const u of officialUsers) {
    const res = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        departmentCode: u.departmentCode,
        title: u.title,
        active: true,
      },
      create: u,
    });
    console.log(`✅ [${res.role}] ${res.name} (${res.email})`);
  }
  console.log('🎉 10 comptes opérationnels multi-RBAC synchronisés avec succès sur Neon Cloud !');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Erreur:', e);
  await prisma.$disconnect();
  process.exit(1);
});
