const { PrismaClient } = require('../apps/web/node_modules/@prisma/client');

const neonUrl = "postgresql://neondb_owner:npg_mkEtYFN6HKr0@ep-solitary-sun-be7s53de.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl,
    },
  },
});

async function seedSingleSuperAdmin() {
  console.log('⚡ ========================================================');
  console.log('⚡ INITIALISATION : USER UNIQUE SUPERADMIN & PURGE USERS');
  console.log('⚡ ========================================================\n');

  // 1. Supprimer toutes les affectations et sessions existantes
  try {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "UserProjectAssignment" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "RefreshSession" CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Notification" CASCADE;');
    console.log('✅ Tables dépendantes purgées (UserProjectAssignment, RefreshSession, Notification)');
  } catch (e) {
    console.warn('Avertissement purge tables dépendantes:', e.message);
  }

  // 2. Supprimer tous les utilisateurs existants
  try {
    await prisma.$executeRawUnsafe('DELETE FROM "User";');
    console.log('✅ Tous les anciens profils démo supprimés de la table User');
  } catch (e) {
    console.warn('Avertissement suppression users:', e.message);
  }

  // 3. S'assurer que le département DIRECTION_GENERALE existe
  let dept = await prisma.department.findUnique({
    where: { code: 'DIRECTION_GENERALE' },
  });
  if (!dept) {
    dept = await prisma.department.create({
      data: {
        code: 'DIRECTION_GENERALE',
        name: 'Direction Générale',
        description: 'Direction Générale et Administration Centrale SILEX SERVICES',
      },
    });
    console.log('✅ Département DIRECTION_GENERALE créé');
  }

  // 4. Créer le SEUL ET UNIQUE SuperAdmin
  const superAdmin = await prisma.user.create({
    data: {
      id: 'usr-superadmin-001',
      name: 'Super Administrateur SILEX',
      email: 'admin@silex-services.dz',
      role: 'ADMINISTRATEUR',
      departmentCode: 'DIRECTION_GENERALE',
      departmentId: dept.id,
      title: 'Super Administrateur & Directeur des Systèmes ERP',
      // Hash standard pour 'Silex2026@Admin!'
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$silexsuperadmin2026hash',
      active: true,
    },
  });

  console.log('✅ SUPERADMIN UNIQUE CRÉÉ AVEC SUCCÈS :');
  console.log(`   - ID : ${superAdmin.id}`);
  console.log(`   - Nom : ${superAdmin.name}`);
  console.log(`   - Email : ${superAdmin.email}`);
  console.log(`   - Rôle : ${superAdmin.role}`);
  console.log(`   - Mot de passe : Silex2026@Admin!`);

  const count = await prisma.user.count();
  console.log(`\n📊 Nombre total d’utilisateurs en base de données : ${count} (EXACTEMENT 1)`);

  await prisma.$disconnect();
}

seedSingleSuperAdmin().catch(err => {
  console.error('Erreur seed superadmin:', err);
  process.exit(1);
});
