const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read root .env directly
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      envVars[key] = val;
    }
  }
}

const neonUrl = envVars.DIRECT_URL || envVars.DATABASE_URL;
console.log('========================================================================');
console.log('SILEX SERVICES ERP — GESTION DES MIGRATIONS EN PRODUCTION NEON CLOUD');
console.log('========================================================================\n');

console.log('Cible détectée :', neonUrl.replace(/:[^:@]+@/, ':***@'));

const prismaBin = path.resolve(__dirname, '../apps/web/node_modules/.bin/prisma.cmd');
const schemaPath = path.resolve(__dirname, '../apps/web/prisma/schema.prisma');

const env = {
  ...process.env,
  DATABASE_URL: neonUrl,
  DIRECT_URL: neonUrl,
};

const action = process.argv[2] || 'status'; // 'status', 'baseline', 'deploy'

if (action === 'baseline') {
  console.log('\n--- Étape 1 : Baseline de la migration 0_init sur Neon Cloud ---');
  try {
    execSync(`"${prismaBin}" migrate resolve --applied 0_init --schema="${schemaPath}"`, {
      env,
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    console.log('\n✓ Migration 0_init marquée comme appliquée sur Neon.');
  } catch (err) {
    console.error(`\n❌ Échec du baseline: exit code ${err.status}`);
    process.exit(err.status || 1);
  }
} else {
  console.log(`\n--- Exécution de: prisma migrate ${action} ---`);
  try {
    execSync(`"${prismaBin}" migrate ${action} --schema="${schemaPath}"`, {
      env,
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    console.log(`\n✓ Commande prisma migrate ${action} terminée avec succès.`);
  } catch (err) {
    console.error(`\n❌ Échec de la commande: exit code ${err.status}`);
    process.exit(err.status || 1);
  }
}
