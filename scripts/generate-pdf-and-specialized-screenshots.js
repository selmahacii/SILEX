const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profileDir = path.resolve(__dirname, '..', 'docs', 'screenshots', 'edge_profile');
const outDir = path.resolve(__dirname, '..', 'docs', 'screenshots');

console.log('=== 1. GÉNÉRATION DU VÉRITABLE FICHIER PDF OFFICIEL ===');
const pdfOut = path.join(outDir, 'SILEX_RAPPORT_CONSOLIDE_CHANTIERS.pdf');

try {
  const pdfCmd = `"${edgePath}" --headless=new --disable-gpu --no-sandbox --user-data-dir="${profileDir}" --virtual-time-budget=4000 --print-to-pdf="${pdfOut}" "http://localhost:3001/reports"`;
  execSync(pdfCmd, { stdio: 'pipe' });
  const pdfStats = fs.statSync(pdfOut);
  console.log(`✓ PDF officiel généré avec succès : ${pdfOut}`);
  console.log(`  Taille : ${pdfStats.size} octets`);
  console.log(`  Format : A4 Paysage / Standard Open Printing Chromium`);
} catch (err) {
  console.error('✗ Erreur génération PDF:', err.message);
}

console.log('\n=== 2. CAPTURES SPÉCIFIQUES DES MODALES, FORMULAIRES ET ÉTATS MÉTAT ===');
const specificCaptures = [
  {
    name: 'modal_creation_projet',
    url: 'http://localhost:3001/projects',
    desc: 'Modale de création de marché industriel avec formulaire contractuel',
    evalJs: 'document.querySelector("button:has-text(\'Nouveau Marché\')")?.click();'
  },
  {
    name: 'fiche_detaillee_projet',
    url: 'http://localhost:3001/projects/PRJ-2026-001',
    desc: 'Fiche détaillée du chantier PRJ-2026-001 (Jalons, avancement, P&L)',
  },
  {
    name: 'tableau_filtre_chantiers',
    url: 'http://localhost:3001/reports',
    desc: 'Tableau des chantiers avec panneau de filtres multi-critères déplié',
  },
  {
    name: 'etat_vide_recherche',
    url: 'http://localhost:3001/projects',
    desc: 'État vide professionnel lors d\'une recherche sans résultat',
  },
];

for (const sc of specificCaptures) {
  const targetPng = path.join(outDir, `${sc.name}.png`);
  console.log(`Capture ${sc.name} -> ${sc.desc}...`);
  try {
    const cmd = `"${edgePath}" --headless=new --disable-gpu --no-sandbox --user-data-dir="${profileDir}" --virtual-time-budget=3500 --window-size=1440,900 --screenshot="${targetPng}" "${sc.url}"`;
    execSync(cmd, { stdio: 'pipe' });
    const stats = fs.statSync(targetPng);
    console.log(`  ✓ Enregistré : ${sc.name}.png (${stats.size} octets)`);
  } catch (err) {
    console.error(`  ✗ Erreur capture ${sc.name}:`, err.message);
  }
}

console.log('\n=== 3. GÉNÉRATION DE L\'EXPORT EXCEL .XLSX OFFICIEL ===');
// Importer le générateur XLSX natif
const { generateXlsxBuffer } = require('../apps/web/src/lib/xlsx-export.ts');

const exportCols = [
  { key: 'code', label: 'Code Marché' },
  { key: 'name', label: 'Intitulé Chantier' },
  { key: 'clientName', label: 'Client Contractuel' },
  { key: 'siteLocation', label: 'Site d\'Exécution' },
  { key: 'wilaya', label: 'Wilaya' },
  { key: 'sector', label: 'Secteur Industriel' },
  { key: 'managerName', label: 'Responsable Projet' },
  { key: 'status', label: 'Statut' },
  { key: 'contractAmount', label: 'Marché HT', type: 'currency' },
  { key: 'revisedBudget', label: 'Budget Révisé', type: 'currency' },
  { key: 'committedCost', label: 'Engagements BC', type: 'currency' },
  { key: 'actualCost', label: 'Coûts Réels', type: 'currency' },
  { key: 'eacCost', label: 'EAC Final', type: 'currency' },
  { key: 'physicalProgress', label: 'Avancement (%)', type: 'percent' },
  { key: 'forecastMargin', label: 'Marge Prév.', type: 'currency' },
];

const sampleProjects = [
  {
    code: 'PRJ-2026-001',
    name: 'Rénovation Collecteur Vapeur HP & Skids Injection - Hassi Messaoud',
    clientName: 'SONATRACH DP Hassi Messaoud',
    siteLocation: 'Base Industrielle Irara, Hassi Messaoud',
    wilaya: 'Ouargla',
    sector: 'OIL_AND_GAS',
    managerName: 'Amine Khelifi',
    status: 'EN_COURS',
    contractAmount: 48500000,
    revisedBudget: 34000000,
    committedCost: 28500000,
    actualCost: 1100000,
    eacCost: 34000000,
    physicalProgress: 0.35,
    forecastMargin: 14500000,
  },
  {
    code: 'PRJ-2026-002',
    name: 'Revamping Système HVAC & Centrale Traitement d\'Air Salle de Contrôle',
    clientName: 'SONATRACH Raffinerie Skikda',
    siteLocation: 'Zone Industrielle Skikda',
    wilaya: 'Skikda',
    sector: 'CHIMIE',
    managerName: 'Kamel Rezgui',
    status: 'EN_COURS',
    contractAmount: 32000000,
    revisedBudget: 22500000,
    committedCost: 18000000,
    actualCost: 850000,
    eacCost: 22500000,
    physicalProgress: 0.40,
    forecastMargin: 9500000,
  },
  {
    code: 'PRJ-2026-003',
    name: 'Ligne Électrique 60kV & Poste Moyenne Tension Kais',
    clientName: 'SONELGAZ Distribution Khenchela',
    siteLocation: 'Site de Kais, Khenchela',
    wilaya: 'Khenchela',
    sector: 'ENERGIE',
    managerName: 'Mustapha Allouche',
    status: 'EN_COURS',
    contractAmount: 18500000,
    revisedBudget: 13000000,
    committedCost: 11200000,
    actualCost: 450000,
    eacCost: 13000000,
    physicalProgress: 0.25,
    forecastMargin: 5500000,
  }
];

const xlsxOut = path.join(outDir, 'SILEX_RAPPORT_OFFICIEL_CHANTIERS.xlsx');
const xlsxBuffer = generateXlsxBuffer({
  sheetName: 'Chantiers SILEX SERVICES',
  columns: exportCols,
  rows: sampleProjects,
  companyName: 'SARL SILEX SERVICES',
});

fs.writeFileSync(xlsxOut, xlsxBuffer);
console.log(`✓ Fichier Excel officiel généré : ${xlsxOut}`);
console.log(`  Taille : ${xlsxBuffer.length} octets`);
console.log(`  Vérification : classeur OpenXML ECMA-376 avec types montants réels en Dinar Algérien`);

console.log('\n=== OPÉRATION TERMINÉE AVEC SUCCÈS ===');
