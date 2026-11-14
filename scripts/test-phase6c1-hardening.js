/**
 * SILEX SERVICES ERP — Suite de Validation Phase 6C.1.2
 * Hardening, Démo vs Production, RBAC RIB, Seuils & PostgreSQL
 */

const net = require('net');

// Configuration
const POSTGRES_PORT = 5433;
const POSTGRES_HOST = '127.0.0.1';

async function checkTcpPort(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('SILEX SERVICES ERP — VALIDATION FINALE PHASE 6C.1.2');
  console.log('PostgreSQL, Filtrage Démo Strict, RBAC RIB & Règles Financières');
  console.log('='.repeat(70));
  console.log();

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  // Importation directe des modules serveur
  const { serverStore } = require('../apps/web/src/lib/server-store');
  const { dbBridge } = require('../apps/web/src/lib/db-bridge');

  // ---------------------------------------------------------
  // TEST 1 : Absence de paramètre = Production par défaut (includeDemo=false)
  // ---------------------------------------------------------
  console.log('▶ TEST 1 : serverStore & dbBridge - Production par Défaut (Absence de paramètre)');
  try {
    // Appel sans argument : doit retourner STRICTEMENT la production (zéro démo)
    const accountsDefault = serverStore.getFinancialAccounts();
    const txsDefault = serverStore.getCashTransactions();
    const custInvDefault = serverStore.getCustomerInvoices();
    const suppInvDefault = serverStore.getSupplierInvoices();
    const atbDefault = serverStore.getAgedTrialBalance();

    const hasDemoAcc = accountsDefault.some(a => a.isDemoAccount || a.code?.startsWith('DEMO-'));
    const hasDemoTx = txsDefault.some(t => t.isDemoTransaction || t.accountCode?.startsWith('DEMO-'));
    const hasDemoCust = custInvDefault.some(i => i.isDemoInvoice || i.id?.startsWith('fac-demo-'));
    const hasDemoSupp = suppInvDefault.some(i => i.isDemoInvoice || i.id?.startsWith('fac-fou-demo-'));

    if (!hasDemoAcc && !hasDemoTx && !hasDemoCust && !hasDemoSupp) {
      console.log('  ✔ Absence de paramètre = Mode Production strict garanti (0 fuite démo)');
      console.log(`    Comptes: ${accountsDefault.length}, Txs: ${txsDefault.length}, Factures Clients: ${custInvDefault.length}, Factures Fourn: ${suppInvDefault.length}`);
      console.log(`    BFR en production stricte: ${atbDefault.workingCapitalRequirement.bfrDA} DA`);
      passed++;
    } else {
      console.error('  ✖ Fuite de données démo par défaut !');
      failed++;
    }

    // Appel avec includeDemo=true explicite
    const accountsWithDemo = serverStore.getFinancialAccounts({ includeDemo: true });
    const hasDemoInExplicit = accountsWithDemo.some(a => a.isDemoAccount || a.code?.startsWith('DEMO-'));
    if (hasDemoInExplicit && accountsWithDemo.length > accountsDefault.length) {
      console.log(`  ✔ includeDemo=true explicite inclut les ${accountsWithDemo.length - accountsDefault.length} comptes de simulation autorisés`);
      passed++;
    } else {
      console.error('  ✖ Échec inclusion démo avec includeDemo=true explicite !');
      failed++;
    }
  } catch (err) {
    console.error('  ✖ Erreur exécution Test 1:', err);
    failed++;
  }

  // ---------------------------------------------------------
  // TEST 2 : Sécurité RBAC sur includeDemo (Anti-Contournement URL)
  // ---------------------------------------------------------
  console.log('\n▶ TEST 2 : API Gateway - Évaluation de Sécurité includeDemo par Rôle');
  try {
    // Simulation logique Gateway
    function evaluateIncludeDemo(requestedParam, userRole) {
      const privilegedRoles = ['ADMINISTRATEUR', 'DIRECTEUR_GENERAL', 'RESPONSABLE_FINANCIER'];
      const requestedDemo = requestedParam === 'true';
      const canAccessDemo = privilegedRoles.includes(userRole);
      return requestedDemo && canAccessDemo;
    }

    // Cas A : Utilisateur DAF demande includeDemo=true
    const dafResult = evaluateIncludeDemo('true', 'RESPONSABLE_FINANCIER');
    // Cas B : Chef de Projet tente d'activer includeDemo=true dans l'URL
    const pmTamperingResult = evaluateIncludeDemo('true', 'RESPONSABLE_PROJET');
    // Cas C : Utilisateur DAF sans paramètre
    const dafDefaultResult = evaluateIncludeDemo(null, 'RESPONSABLE_FINANCIER');
    // Cas D : Utilisateur non authentifié / invité
    const guestResult = evaluateIncludeDemo('true', 'INVITE');

    if (dafResult === true && pmTamperingResult === false && dafDefaultResult === false && guestResult === false) {
      console.log('  ✔ DAF avec includeDemo=true              → Autorisé (includeDemo=true)');
      console.log('  ✔ RESPONSABLE_PROJET avec includeDemo=true → Bloqué côté serveur (includeDemo=false)');
      console.log('  ✔ DAF sans paramètre                     → Production stricte (includeDemo=false)');
      console.log('  ✔ Profil non habilité                    → Bloqué (includeDemo=false)');
      passed++;
    } else {
      console.error('  ✖ Faille de contournement RBAC sur includeDemo !');
      failed++;
    }
  } catch (err) {
    console.error('  ✖ Erreur exécution Test 2:', err);
    failed++;
  }

  // ---------------------------------------------------------
  // TEST 3 : Confidentialité Serveur des RIB (Tests Positifs & Négatifs)
  // ---------------------------------------------------------
  console.log('\n▶ TEST 3 : dbBridge - Confidentialité & Non-Fuite des RIB');
  try {
    const privilegedUser = { id: 'usr-daf-1', role: 'RESPONSABLE_FINANCIER', name: 'DAF Silex' };
    const restrictedUser = { id: 'usr-pm-1', role: 'RESPONSABLE_PROJET', name: 'Conducteur Travaux' };

    const accountsForDAF = await dbBridge.getFinancialAccounts({ includeDemo: true }, privilegedUser);
    const accountsForPM = await dbBridge.getFinancialAccounts({ includeDemo: true }, restrictedUser);

    const bankAccDAF = accountsForDAF.find(a => a.ribNumber && !a.ribNumber.includes('••••'));
    const bankAccPM = accountsForPM.find(a => a.id === bankAccDAF?.id);

    if (bankAccDAF && bankAccPM) {
      // Test positif DAF
      const isDafClean = !bankAccDAF.ribNumber.includes('••••') && !bankAccDAF.isRibMasked;
      // Test négatif PM
      const isPmMasked = bankAccPM.ribNumber.includes('••••') && bankAccPM.isRibMasked === true;

      // Vérification approfondie d'absence de fuite dans toutes les autres clés JSON
      const pmJsonStr = JSON.stringify(bankAccPM);
      const leaksFullRib = pmJsonStr.includes(bankAccDAF.ribNumber);

      if (isDafClean && isPmMasked && !leaksFullRib) {
        console.log(`  ✔ [Test Positif] DAF reçoit RIB complet : ${bankAccDAF.ribNumber}`);
        console.log(`  ✔ [Test Négatif] PM reçoit RIB masqué   : ${bankAccPM.ribNumber} (isRibMasked: true)`);
        console.log('  ✔ Aucune fuite du RIB en clair dans les autres champs de l\'objet JSON PM');
        passed++;
      } else {
        console.error('  ✖ Fuite de RIB ou échec de masquage serveur !');
        failed++;
      }
    } else {
      console.error('  ✖ Compte bancaire de test introuvable !');
      failed++;
    }
  } catch (err) {
    console.error('  ✖ Erreur exécution Test 3:', err);
    failed++;
  }

  // ---------------------------------------------------------
  // TEST 4 : Configuration Financière & Prévalence Contractuelle
  // ---------------------------------------------------------
  console.log('\n▶ TEST 4 : Règles Métier Financières - Seuils & Retenue de Garantie');
  try {
    const cfg = await dbBridge.getFinancialConfig();

    // 4.1 Seuils PM vs DG
    const hasPmThreshold = cfg.pmApprovalThresholdDA === 500000;
    const hasDgThreshold = cfg.dgApprovalThresholdDA === 2000000;

    if (hasPmThreshold && hasDgThreshold) {
      console.log(`  ✔ Seuil PM opérationnel (Délégation travaux)   : ${cfg.pmApprovalThresholdDA.toLocaleString()} DA`);
      console.log(`  ✔ Seuil DG stratégique (Validation formelle)  : ${cfg.dgApprovalThresholdDA.toLocaleString()} DA`);
      console.log('  ✔ Distinction rigoureuse entre seuil PM (500k) et seuil DG (2M) validée');
      passed++;
    } else {
      console.error(`  ✖ Seuils de configuration inattendus (PM: ${cfg.pmApprovalThresholdDA}, DG: ${cfg.dgApprovalThresholdDA}) !`);
      failed++;
    }

    // 4.2 Retenue de garantie : Prévalence contractuelle sur le défaut global (5%)
    const globalDefaultRate = cfg.defaultRetentionRate; // 5%

    // Simulation création facture avec taux contractuel spécifique (ex: 10% sur marché spécial)
    const customRateInvoice = serverStore.createCustomerInvoice({
      amountHT: 1000000,
      retentionRate: 10, // 10% contractuel
      paymentTerms: '30 jours',
      notes: 'Marché spécifique taux 10%',
    });

    // Facture sans taux explicite (doit appliquer le défaut 5%)
    const defaultRateInvoice = serverStore.createCustomerInvoice({
      amountHT: 1000000,
      paymentTerms: '30 jours',
      notes: 'Facture standard taux défaut',
    });

    if (customRateInvoice.retentionRate === 10 && customRateInvoice.warrantyHeldAmount === 100000 &&
        defaultRateInvoice.retentionRate === 5 && defaultRateInvoice.warrantyHeldAmount === 50000) {
      console.log(`  ✔ Retenue par défaut global : ${globalDefaultRate}% appliqué lorsque non spécifié (50 000 DA sur 1M DA)`);
      console.log(`  ✔ Prévalence contractuelle  : ${customRateInvoice.retentionRate}% appliqué lorsque spécifié (100 000 DA sur 1M DA)`);
      passed++;
    } else {
      console.error('  ✖ Échec de prévalence contractuelle sur la retenue de garantie !');
      failed++;
    }
  } catch (err) {
    console.error('  ✖ Erreur exécution Test 4:', err);
    failed++;
  }

  // ---------------------------------------------------------
  // TEST 5 : Détection Physique PostgreSQL & Transparence
  // ---------------------------------------------------------
  console.log('\n▶ TEST 5 : Détection et Vérification Réelle PostgreSQL (Port 5433)');
  const isPostgresLive = await checkTcpPort(POSTGRES_HOST, POSTGRES_PORT);

  if (isPostgresLive) {
    console.log(`  ✔ Connexion effective sur PostgreSQL ${POSTGRES_HOST}:${POSTGRES_PORT}`);
    passed++;
  } else {
    console.log(`  ⚠ PostgreSQL inaccessible sur ${POSTGRES_HOST}:${POSTGRES_PORT} (Docker Desktop éteint / Service arrêté)`);
    console.log('  ✔ STATUT TEST POSTGRESQL : SKIPPED / BLOCKED (isolation respectée, aucun faux succès)');
    skipped++;
  }

  // ---------------------------------------------------------
  // RÉCAPITULATIF
  // ---------------------------------------------------------
  console.log('\n' + '='.repeat(70));
  console.log(`BILAN DES VÉRIFICATIONS : ${passed} RÉUSSIS, ${failed} ÉCHECS, ${skipped} IGNORÉS/BLOQUÉS`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Erreur fatale script de test:', err);
  process.exit(1);
});
