const path = require('path');
const { PrismaClient } = require(path.resolve('apps/web/node_modules/@prisma/client'));

const testUrl = "postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public";

async function verifyPersistenceAcrossProcesses() {
  console.log('--- VÉRIFICATION DE LA PERSISTANCE APRÈS REDÉMARRAGE ---');
  const prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });

  try {
    const accounts = await prisma.financialAccount.findMany({
      where: { code: { startsWith: 'TEST-ACC-' } },
      include: { transactions: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Nombre de comptes persistés trouvés: ${accounts.length}`);
    if (accounts.length === 0) {
      throw new Error('Aucun compte trouvé en base après reconnexion');
    }

    const latest = accounts[0];
    console.log('Dernier compte persisté:', latest.code);
    console.log('Solde actuel persisté:', Number(latest.currentBalance));
    console.log('Nombre de transactions reliées:', latest.transactions.length);
    console.log('Détail transaction persistée:', latest.transactions[0]?.transactionNumber, Number(latest.transactions[0]?.amount));

    if (Number(latest.currentBalance) !== 17500000) {
      throw new Error(`Solde incorrect: attendu 17500000, reçu ${latest.currentBalance}`);
    }

    console.log('✅ PERSISTANCE APRÈS REDÉMARRAGE VALIDÉE À 100%');
  } catch (err) {
    console.error('❌ Échec vérification persistance:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPersistenceAcrossProcesses();
