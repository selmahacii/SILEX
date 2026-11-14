const path = require('path');
const { PrismaClient } = require(path.resolve('apps/web/node_modules/@prisma/client'));

const testUrl = "postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public";

async function testCrud() {
  console.log('--- TEST PRISMA CRUD SUR BASE DE TEST REELLE ---');
  const prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });

  try {
    // 1. Create FinancialAccount
    const accCode = `TEST-ACC-${Date.now()}`;
    const account = await prisma.financialAccount.create({
      data: {
        code: accCode,
        name: 'Compte Test BNA Principal',
        type: 'BANQUE_COURANT',
        bankName: 'Banque Nationale d\'Algérie (BNA)',
        ribNumber: '00100 00123 4567890123 45',
        currency: 'DZD',
        initialBalance: 15000000.00,
        currentBalance: 15000000.00,
        isDemoAccount: false,
        isActive: true,
      }
    });
    console.log('✅ 1. FinancialAccount créé avec succès:', account.id, account.code, Number(account.currentBalance));

    // 2. Read FinancialAccount
    const fetchedAcc = await prisma.financialAccount.findUnique({
      where: { id: account.id }
    });
    console.log('✅ 2. FinancialAccount relu:', fetchedAcc?.code, Number(fetchedAcc?.currentBalance));

    // 3. Update FinancialAccount (CashTransaction simulation)
    const txNumber = `TX-TEST-${Date.now()}`;
    const tx = await prisma.cashTransaction.create({
      data: {
        transactionNumber: txNumber,
        type: 'ENCAISSEMENT_CLIENT',
        amount: 2500000.00,
        accountId: account.id,
        accountCode: account.code,
        category: 'Encaissement Acompte Client',
        performedById: 'usr-fin-001',
        performedByName: 'Directeur Financier SILEX',
        status: 'VALIDE',
        notes: 'Test encaissement réel PostgreSQL',
      }
    });
    console.log('✅ 3. CashTransaction créée avec relation FK:', tx.id, tx.transactionNumber, Number(tx.amount));

    // 4. Update Account balance
    const updatedAcc = await prisma.financialAccount.update({
      where: { id: account.id },
      data: { currentBalance: { increment: 2500000.00 } }
    });
    console.log('✅ 4. Solde mis à jour:', Number(updatedAcc.currentBalance), '(attendu: 17500000)');

    // 5. Test CustomerInvoice
    const invNumber = `FAC-CLI-TEST-${Date.now()}`;
    const custInvoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber: invNumber,
        clientId: 'cli-sonatrach-01',
        clientName: 'SONATRACH DP Hassi Messaoud',
        projectId: 'prj-hmd-001',
        projectCode: 'PRJ-HMD',
        dueDate: new Date(Date.now() + 45 * 86400000),
        amountHT: 10000000.00,
        vatRate: 19.00,
        vatAmount: 1900000.00,
        retentionRate: 5.00,
        retentionAmount: 500000.00,
        amountTTC: 11900000.00,
        netReceivableAmount: 11400000.00,
        remainingAmount: 11400000.00,
        warrantyHeldAmount: 500000.00,
        status: 'EMISE',
      }
    });
    console.log('✅ 5. CustomerInvoice créée:', custInvoice.invoiceNumber, 'Net exigible:', Number(custInvoice.netReceivableAmount), 'Retenue:', Number(custInvoice.retentionAmount));

    // 6. Test FinancialConfig
    const config = await prisma.financialConfig.create({
      data: {
        defaultVatRate: 19.00,
        defaultRetentionRate: 5.00,
        defaultWarrantyDurationMonths: 12,
        pmApprovalThresholdDA: 500000.00,
        dgApprovalThresholdDA: 2000000.00,
        priceToleranceAbsoluteDA: 100.00,
        priceToleranceRelativePct: 0.50,
      }
    });
    console.log('✅ 6. FinancialConfig créé:', config.id, 'PM Seuil:', Number(config.pmApprovalThresholdDA), 'DG Seuil:', Number(config.dgApprovalThresholdDA));

  } catch (err) {
    console.error('❌ Erreur CRUD Prisma:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCrud();
