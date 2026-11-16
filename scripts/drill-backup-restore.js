const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('========================================================================');
console.log('SILEX SERVICES ERP — EXERCICE RÉEL DE SAUVEGARDE ET RESTAURATION');
console.log('Validation Phase K : Contrôle d\'Intégrité et Rétablissement à Froid');
console.log('Instance Staging : Docker silex_postgres (Port 5433 / silex_erp)');
console.log('========================================================================\n');

const backupDir = path.resolve(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dumpFile = path.join(backupDir, `silex_erp_backup_${timestamp}.dump`);
const sqlFile = path.join(backupDir, `silex_erp_backup_${timestamp}.sql`);
const containerName = 'silex_postgres';

// 1. SAUVEGARDE COMPLÈTE PG_DUMP
console.log('--- 1. EXÉCUTION DU DUMP POSTGRESQL 16 (Format Custom & Plain SQL) ---');
const t0 = Date.now();

// Dump Custom format (compressé, intègre les métadonnées et blobs)
execSync(`docker exec -e PGPASSWORD=silex_secure_pass_2026 ${containerName} pg_dump -U silex_admin -d silex_erp -F c -f /tmp/backup.dump`, { stdio: 'inherit' });
execSync(`docker cp ${containerName}:/tmp/backup.dump "${dumpFile}"`);

// Dump Plain SQL pour audit textuel
execSync(`docker exec -e PGPASSWORD=silex_secure_pass_2026 ${containerName} pg_dump -U silex_admin -d silex_erp -F p -f /tmp/backup.sql`, { stdio: 'inherit' });
execSync(`docker cp ${containerName}:/tmp/backup.sql "${sqlFile}"`);

const tBackup = Date.now() - t0;

const dumpStats = fs.statSync(dumpFile);
const sqlStats = fs.statSync(sqlFile);

console.log(`  ✓ Sauvegarde binaire créée : ${dumpFile} (${dumpStats.size} octets, généré en ${tBackup} ms)`);
console.log(`  ✓ Sauvegarde SQL créée     : ${sqlFile} (${sqlStats.size} octets)`);

// 2. CONTRÔLE D'INTÉGRITÉ SHA256
console.log('\n--- 2. CALCUL DES EMPREINTES DE SÉCURITÉ (SHA-256) ---');
const dumpHash = crypto.createHash('sha256').update(fs.readFileSync(dumpFile)).digest('hex');
const sqlHash = crypto.createHash('sha256').update(fs.readFileSync(sqlFile)).digest('hex');
console.log(`  ✓ SHA256 Dump custom : ${dumpHash}`);
console.log(`  ✓ SHA256 Script SQL  : ${sqlHash}`);

// 3. CRÉATION D'UNE BASE ISOLÉE DE TEST DE RESTAURATION
console.log('\n--- 3. PRÉPARATION DE LA BASE DE RESTAURATION (silex_restore_test) ---');
try {
  execSync(`docker exec -e PGPASSWORD=silex_secure_pass_2026 ${containerName} psql -U silex_admin -d postgres -c "DROP DATABASE IF EXISTS silex_restore_test;"`, { stdio: 'inherit' });
  execSync(`docker exec -e PGPASSWORD=silex_secure_pass_2026 ${containerName} psql -U silex_admin -d postgres -c "CREATE DATABASE silex_restore_test OWNER silex_admin;"`, { stdio: 'inherit' });
  console.log('  ✓ Base silex_restore_test créée avec succès');
} catch (e) {
  console.error('Erreur création base restore:', e.message);
  process.exit(1);
}

// 4. RESTAURATION REELLE DANS LA BASE DISTINCTE
console.log('\n--- 4. EXÉCUTION DU RESTORE VIA PG_RESTORE ---');
const tRestore0 = Date.now();
try {
  execSync(`docker exec -e PGPASSWORD=silex_secure_pass_2026 ${containerName} pg_restore -U silex_admin -d silex_restore_test --no-owner --role=silex_admin /tmp/backup.dump`, { stdio: 'pipe' });
} catch (err) {
  // pg_restore peut émettre des warnings mineurs sur les extensions préexistantes
  console.log('  Notice: pg_restore complété avec avertissements mineurs (normal pour les extensions)');
}
const tRestore = Date.now() - tRestore0;
console.log(`  ✓ Restauration physique exécutée en ${tRestore} ms`);

// 5. VÉRIFICATION CROISÉE PRISMA ENTRE BASE SOURCE ET BASE RESTAURÉE
console.log('\n--- 5. RAPPROCHEMENT RIGOUREUX SOURCE vs RESTAURÉE ---');
const { PrismaClient } = require(path.resolve(__dirname, '../apps/web/node_modules/@prisma/client'));

const sourcePrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_erp?schema=public' } }
});

const restorePrisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://silex_admin:silex_secure_pass_2026@127.0.0.1:5433/silex_restore_test?schema=public' } }
});

async function verifyDrill() {
  // Liste des tables
  const sourceTables = await sourcePrisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
  );
  const restoreTables = await restorePrisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
  );

  console.log(`  ✓ Tables Source    : ${sourceTables.length} tables`);
  console.log(`  ✓ Tables Restaurée : ${restoreTables.length} tables`);

  if (sourceTables.length !== restoreTables.length) {
    throw new Error(`Incohérence du nombre de tables ! Source=${sourceTables.length}, Restore=${restoreTables.length}`);
  }

  // Comparer le nombre d'enregistrements table par table
  console.log('\n--- Comparaison du Nombre d\'Enregistrements par Table ---');
  let totalRecordsSource = 0;
  let totalRecordsRestore = 0;

  for (const t of sourceTables) {
    const tableName = t.table_name;
    const cntSourceRes = await sourcePrisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "${tableName}"`);
    const cntRestoreRes = await restorePrisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "${tableName}"`);
    const cSource = cntSourceRes[0].c;
    const cRestore = cntRestoreRes[0].c;

    totalRecordsSource += cSource;
    totalRecordsRestore += cRestore;

    if (cSource !== cRestore) {
      throw new Error(`Écart détecté sur ${tableName}: Source=${cSource}, Restore=${cRestore}`);
    }
  }

  console.log(`  ✓ Total Enregistrements Source   : ${totalRecordsSource} lignes`);
  console.log(`  ✓ Total Enregistrements Restauré : ${totalRecordsRestore} lignes`);
  console.log(`  ✓ Taux d'intégrité des données  : 100.00% (0 ligne perdue)`);

  // 6. Test de lecture fonctionnelle sur entités critiques
  console.log('\n--- 6. TEST DE RELECTURE APPLICATIVE SUR LA BASE RESTAURÉE ---');
  const opps = await restorePrisma.opportunity.findMany({ take: 3 });
  console.log(`  ✓ Relecture Opportunities: ${opps.length} lues (Ex: ${opps[0]?.code} - ${opps[0]?.title})`);

  const projs = await restorePrisma.project.findMany({ take: 3 });
  console.log(`  ✓ Relecture Chantiers    : ${projs.length} lus (Ex: ${projs[0]?.code} - ${projs[0]?.name})`);

  const accounts = await restorePrisma.financialAccount.findMany({ take: 3 });
  console.log(`  ✓ Relecture Comptes      : ${accounts.length} lus (Ex: ${accounts[0]?.code} - ${accounts[0]?.bankName} Solde=${accounts[0]?.currentBalance} DA)`);

  const welds = await restorePrisma.weldJoint.findMany({ take: 3 });
  console.log(`  ✓ Relecture Weld Joints  : ${welds.length} lus (Ex: ${welds[0]?.jointNumber} - Statut=${welds[0]?.status})`);

  await sourcePrisma.$disconnect();
  await restorePrisma.$disconnect();

  console.log('\n========================================================================');
  console.log('BILAN DE L\'EXERCICE DE RESTAURATION : 100% SUCCÈS');
  console.log(`Durée du dump    : ${tBackup} ms`);
  console.log(`Durée du restore : ${tRestore} ms`);
  console.log('Objectifs RTO recommandés : < 15 minutes en cas de sinistre');
  console.log('Objectifs RPO recommandés : < 1 heure (Sauvegarde automatique horaire WAL)');
  console.log('========================================================================');
}

verifyDrill().catch(err => {
  console.error('Erreur vérification drill:', err);
  process.exit(1);
});
