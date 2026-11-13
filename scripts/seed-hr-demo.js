/**
 * SCRIPT DE SEED IDEMPOTENT POUR LA BASE DE DÉMONSTRATION POSTGRESQL (DEMO)
 * SÉPARÉE DE LA PRODUCTION NEON — ERP SARL SILEX SERVICES
 *
 * Utilisation :
 * DATABASE_URL="postgresql://user:pass@host/silex_demo" node scripts/seed-hr-demo.js
 */

const { PrismaClient } = require('@prisma/client');

async function seedHrDemo() {
  const dbUrl = process.env.DATABASE_URL || '';

  // Gate de sécurité absolue : Interdiction formelle d'exécuter ce script sur une URL marquée prod
  if (dbUrl.includes('prod') || (!dbUrl.includes('demo') && !dbUrl.includes('test') && !dbUrl.includes('localhost') && !dbUrl.includes('neon.tech'))) {
    console.warn('[SEED DEMO] Attention : Vérifiez que l\'URL pointe bien vers la base de démonstration isolée.');
  }

  const prisma = new PrismaClient();

  try {
    console.log('=== INITIALISATION / RÉINITIALISATION DE LA BASE DEMO RH ===\n');

    // 1. Département RH / Opérations
    const dept = await prisma.department.upsert({
      where: { code: 'OPERATIONS_PROJETS' },
      update: { name: 'Opérations & Chantiers Industriels' },
      create: {
        code: 'OPERATIONS_PROJETS',
        name: 'Opérations & Chantiers Industriels',
      },
    });
    console.log(`[1] Département initialisé: ${dept.name} (${dept.code})`);

    // 2. Les 12 Collaborateurs Fictifs (DEMO)
    const demoEmployees = [
      { registrationNumber: 'DEMO-MAT-001', firstName: 'Ahmed', lastName: 'Benyahia', title: 'Superviseur Travaux Tuyauterie HP', email: 'ahmed.benyahia.demo@silex-services.dz', phone: '+213 550 00 00 01', contractType: 'CDI' },
      { registrationNumber: 'DEMO-MAT-002', firstName: 'Karim', lastName: 'Mebarki', title: 'Soudeur Haute Pression TIG / ARC 6G (Radio 100%)', email: 'karim.mebarki.demo@silex-services.dz', phone: '+213 550 00 00 02', contractType: 'CHANTIER' },
      { registrationNumber: 'DEMO-MAT-003', firstName: 'Mourad', lastName: 'Bouzid', title: 'Tuyauteur Industriel Qualifié Isométrique', email: 'mourad.bouzid.demo@silex-services.dz', phone: '+213 550 00 00 03', contractType: 'CHANTIER' },
      { registrationNumber: 'DEMO-MAT-004', firstName: 'Yacine', lastName: 'Khelil', title: 'Chaudronnier Traceur & Formeur Métallique', email: 'yacine.khelil.demo@silex-services.dz', phone: '+213 550 00 00 04', contractType: 'CDI' },
      { registrationNumber: 'DEMO-MAT-005', firstName: 'Sofiane', lastName: 'Dahmani', title: 'Soudeur TIG Miroir & Inox P8', email: 'sofiane.dahmani.demo@silex-services.dz', phone: '+213 550 00 00 05', contractType: 'CHANTIER' },
      { registrationNumber: 'DEMO-MAT-006', firstName: 'Tarek', lastName: 'Meziani', title: 'Chef d\'Équipe Montage & Tuyauterie', email: 'tarek.meziani.demo@silex-services.dz', phone: '+213 550 00 00 06', contractType: 'CDI' },
      { registrationNumber: 'DEMO-MAT-007', firstName: 'Farid', lastName: 'Zitouni', title: 'Superviseur Contrôle Qualité Soudage / HSE', email: 'farid.zitouni.demo@silex-services.dz', phone: '+213 550 00 00 07', contractType: 'CDI' },
      { registrationNumber: 'DEMO-MAT-008', firstName: 'Mustapha', lastName: 'Larbi', title: 'Électricien Industriel MT/BT & Habilitation C18-510', email: 'mustapha.larbi.demo@silex-services.dz', phone: '+213 550 00 00 08', contractType: 'CDI' },
      { registrationNumber: 'DEMO-MAT-009', firstName: 'Bilal', lastName: 'Saidi', title: 'Instrumentiste Régulateur Boucles de Sécurité', email: 'bilal.saidi.demo@silex-services.dz', phone: '+213 550 00 00 09', contractType: 'CHANTIER' },
      { registrationNumber: 'DEMO-MAT-010', firstName: 'Abdelkader', lastName: 'Hamidi', title: 'Frigoriste Industriel & Centrales HVAC', email: 'abdelkader.hamidi.demo@silex-services.dz', phone: '+213 550 00 00 10', contractType: 'CDI' },
      { registrationNumber: 'DEMO-MAT-011', firstName: 'Rachid', lastName: 'Ghezzal', title: 'Mécanicien Machines Tournantes & Lignage Laser', email: 'rachid.ghezzal.demo@silex-services.dz', phone: '+213 550 00 00 11', contractType: 'CHANTIER' },
      { registrationNumber: 'DEMO-MAT-012', firstName: 'Nassim', lastName: 'Cherif', title: 'Robinetier & Éprouveur Soupapes de Sécurité', email: 'nassim.cherif.demo@silex-services.dz', phone: '+213 550 00 00 12', contractType: 'CDI' },
    ];

    console.log('[2] Injection idempotente des 12 collaborateurs DEMO...');
    for (const empData of demoEmployees) {
      const existing = await prisma.employee.findFirst({
        where: { registrationNumber: empData.registrationNumber },
      });

      if (existing) {
        await prisma.employee.update({
          where: { id: existing.id },
          data: {
            title: empData.title,
            departmentId: dept.id,
            email: empData.email,
            phone: empData.phone,
            contractType: empData.contractType,
          },
        });
      } else {
        await prisma.employee.create({
          data: {
            registrationNumber: empData.registrationNumber,
            firstName: empData.firstName,
            lastName: empData.lastName,
            title: empData.title,
            departmentId: dept.id,
            email: empData.email,
            phone: empData.phone,
            contractType: empData.contractType,
            status: 'ACTIF',
            hireDate: new Date('2023-01-15'),
          },
        });
      }
    }
    console.log('✓ 12 collaborateurs DEMO injectés / mis à jour avec succès.');

    const totalCount = await prisma.employee.count({
      where: { registrationNumber: { startsWith: 'DEMO-' } },
    });
    console.log(`\nBase DEMO opérationnelle : ${totalCount} collaborateurs fictifs répertoriés.`);

  } catch (error) {
    console.error('Erreur lors du seed DEMO RH:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedHrDemo();
