const { execSync } = require('child_process');

console.log('--- SUITE 1 : MODULE 01 COMMERCIAL ---');
execSync('npx tsx scripts/test-commercial-e2e.js', { stdio: 'inherit' });

console.log('\n--- SUITE 2 : MODULE 02 PROJETS INDUSTRIELS ---');
execSync('npx tsx scripts/test-project-e2e.js', { stdio: 'inherit' });

console.log('\n--- SUITE 3 : MODULE 03 ACHATS, TCO & STOCKS ---');
execSync('npx tsx scripts/test-procurement-e2e.js', { stdio: 'inherit' });

console.log('\n--- SUITE 4 : MODULE 04 RESSOURCES HUMAINES & MOBILITÉ ---');
execSync('npx tsx scripts/test-hr-e2e.js', { stdio: 'inherit' });

console.log('\n--- SUITE 5 : MODULE 06 FINANCE, TRÉSORERIE & RENTABILITÉ PROJET ---');
execSync('npx tsx scripts/test-finance-e2e.js', { stdio: 'inherit' });

console.log('\n🎉 TOUTES LES SUITES E2E DES MODULES 01, 02, 03, 04 ET 06 ONT RÉUSSI À 100% !');
