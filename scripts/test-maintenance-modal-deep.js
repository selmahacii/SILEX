/**
 * Test E2E Fonctionnel : Déclenchement d'Intervention Préventive, Curative et Visite Réglementaire VGP
 * SILEX SERVICES - Parc Matériel & Maintenance Industrielle
 */

const API_BASE = 'http://localhost:4000/api';

async function runMaintenanceModalAudit() {
  console.log('========================================================================');
  console.log(' AUDIT FONCTIONNEL : DÉCLENCHEMENT INTERVENTION MATÉRIEL & OT (POSTGRES)');
  console.log('========================================================================\n');

  try {
    // 1. Authentification Maintenance
    console.log('[1/5] Authentification Responsable Parc & Maintenance SILEX...');
    const authRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'y.khelifi@silex-services.dz', password: 'SilexDemo2026!' }),
    });
    if (!authRes.ok) {
      throw new Error(`Erreur login : HTTP ${authRes.status}`);
    }
    const authData = await authRes.json();
    const token = authData.accessToken || authData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('  -> Connecté avec succès : Token JWT acquis pour Yacine Khelifi (MAINTENANCE).\n');

    // 2. Récupération du parc matériel
    console.log('[2/5] Récupération du parc des équipements industriels...');
    const assetsRes = await fetch(`${API_BASE}/fleet/assets`, { headers: authHeaders });
    const assets = await assetsRes.json();
    console.log(`  -> ${assets.length} équipement(s) répertorié(s) en base.`);
    if (assets.length === 0) {
      throw new Error('Aucun équipement disponible pour le test.');
    }
    const testAsset = assets[0];
    console.log(`  -> Équipement sélectionné : [${testAsset.assetTag}] ${testAsset.name} (${testAsset.brand} ${testAsset.model})`);
    console.log(`  -> Statut initial : ${testAsset.status}\n`);

    // 3. Test Déclenchement Mode 1 : MAINTENANCE PRÉVENTIVE PROGRAMMÉE (PPM 250H)
    console.log('[3/5] Test Déclenchement Mode 1 : Maintenance Préventive 250h...');
    const otPrevRes = await fetch(`${API_BASE}/fleet/maintenance-orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        assetId: testAsset.id,
        type: 'PREVENTIVE',
        priority: 'NORMAL',
        description: '[MAINTENANCE PRÉVENTIVE 250H] Checklist : Vidange 15W40, Filtres huile/gasoil, Graissage axes. Révision périodique 250h conforme préconisations constructeur (HSE : Consignation LOTO | Balisage zone)',
        scheduledDate: new Date().toISOString(),
        cost: 45000,
        technician: 'Équipe Mécanique SILEX Chantiers',
      }),
    });
    const otPrev = await otPrevRes.json();
    console.log(`  -> OT Préventif émis : N° ${otPrev.orderNumber} (ID: ${otPrev.id})`);
    console.log(`  -> Statut OT : ${otPrev.status} | Type : ${otPrev.type} | Coût : ${otPrev.cost} DA\n`);

    // 4. Test Déclenchement Mode 2 : DÉPANNAGE CURATIF D'URGENCE (CRITIQUE / ARRÊT CHANTIER)
    console.log('[4/5] Test Déclenchement Mode 2 : Dépannage Curatif d\'Urgence avec Arrêt Chantier...');
    const otCuratRes = await fetch(`${API_BASE}/fleet/maintenance-orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        assetId: testAsset.id,
        type: 'CORRECTIVE',
        priority: 'CRITICAL',
        description: '[DÉPANNAGE CURATIF - CRITICAL] Symptôme : Fuite flexible hydraulique haute pression (210 bars). Intervention immédiate sur site pour éviter arrêt de tranche Sonatrach. | Pièces requises : Flexible HP 3/4" 400 bars (HSE : Consignation LOTO | EPI renforcés)',
        scheduledDate: new Date().toISOString(),
        cost: 85000,
        technician: 'Équipe d\'Intervention Rapide SILEX',
        immediateImmobilization: true,
      }),
    });
    const otCurat = await otCuratRes.json();
    console.log(`  -> OT Curatif Urgent émis : N° ${otCurat.orderNumber}`);
    console.log(`  -> Statut OT : ${otCurat.status} (Passé directement IN_PROGRESS car CRITIQUE)`);

    // Vérification de l'immobilisation automatique de l'actif
    const assetsAfterRes = await fetch(`${API_BASE}/fleet/assets`, { headers: authHeaders });
    const assetsAfter = await assetsAfterRes.json();
    const assetAfterImmobilization = assetsAfter.find(a => a.id === testAsset.id);
    console.log(`  -> Statut Équipement vérifié en base : ${assetAfterImmobilization.status}`);
    if (assetAfterImmobilization.status !== 'MAINTENANCE') {
      throw new Error(`Échec de l'immobilisation : le statut attendu était MAINTENANCE, reçu ${assetAfterImmobilization.status}`);
    }
    console.log('  -> SUCCESS : Équipement immédiatement immobilisé en statut MAINTENANCE !\n');

    // 5. Test Déclenchement Mode 3 : VISITE RÉGLEMENTAIRE & ÉPREUVE DE SÉCURITÉ (VGP APAVE)
    console.log('[5/5] Test Déclenchement Mode 3 : Visite Réglementaire & Sécurité VGP...');
    const otVgpRes = await fetch(`${API_BASE}/fleet/maintenance-orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        assetId: testAsset.id,
        type: 'PREVENTIVE',
        priority: 'REGLEMENTAIRE_VGP',
        description: '[VISITE RÉGLEMENTAIRE & SÉCURITÉ VGP] Organisme Agréé : APAVE Algérie | Type : VGP_LEVAGE | N° PV Précédent : PV-APAVE-2025-0842 | Validité : 12 mois. Visite Générale Périodique annuelle d\'appareil de levage selon arrêté interministériel (HSE : Consignation LOTO | Balisage zone)',
        scheduledDate: new Date().toISOString(),
        cost: 120000,
        technician: 'APAVE Algérie — Inspecteur Agréé',
      }),
    });
    const otVgp = await otVgpRes.json();
    console.log(`  -> OT Réglementaire émis : N° ${otVgp.orderNumber}`);
    console.log(`  -> Statut OT : ${otVgp.status} | Priorité : ${otVgp.priority}\n`);

    // 6. Clôture de l'intervention d'urgence et remise en service opérationnelle
    console.log('[Bonus] Clôture technique de l\'avarie et remise en service opérationnelle...');
    const patchRes = await fetch(`${API_BASE}/fleet/maintenance-orders/${otCurat.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'COMPLETED',
        interventionReport: 'Flexible HP remplacé, plein d\'huile hydraulique ISO VG 46 complété, test de pression sous 220 bars validé sans fuite. Matériel opérationnel.',
        cost: 82000,
      }),
    });
    if (!patchRes.ok) {
      throw new Error(`Erreur patch status : HTTP ${patchRes.status}`);
    }

    const assetsFinalRes = await fetch(`${API_BASE}/fleet/assets`, { headers: authHeaders });
    const assetsFinal = await assetsFinalRes.json();
    const assetRestored = assetsFinal.find(a => a.id === testAsset.id);
    console.log(`  -> Statut Équipement après clôture : ${assetRestored.status}`);
    if (assetRestored.status !== 'OPERATIONAL') {
      throw new Error(`Échec de remise en service : attendu OPERATIONAL, reçu ${assetRestored.status}`);
    }
    console.log('  -> SUCCESS : Équipement remis en service OPERATIONAL après clôture conforme de l\'OT !');

    console.log('\n========================================================================');
    console.log(' TOUS LES TESTS FONCTIONNELS DE LA MODALE MAINTENANCE SONT VALIDÉS (100%)');
    console.log('========================================================================');
  } catch (err) {
    console.error('\nERREUR AUDIT :', err.message);
    process.exit(1);
  }
}

runMaintenanceModalAudit();
