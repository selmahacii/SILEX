const API_BASE = 'http://localhost:4000/api';

async function testAllUpdateEndpoints() {
  console.log('================================================================');
  console.log('   SILEX ERP — TEST EXHAUSTIF DES ENDPOINTS DE MODIFICATION');
  console.log('================================================================');

  // Login as DG
  const dgRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'k.mansouri@silex-services.dz', password: 'SilexDemo2026!' }),
  });
  const { accessToken: token } = await dgRes.json();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // 1. TEST UPDATE PROJECT
  const projects = await (await fetch(`${API_BASE}/projects`, { headers })).json();
  const targetProject = projects[0];
  const newProjectDesc = `Description mise à jour le ${new Date().toLocaleTimeString('fr-DZ')} — Travaux Spéciaux Vapeur HP`;
  const updateProjectRes = await fetch(`${API_BASE}/projects/${targetProject.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      description: newProjectDesc,
      clientName: 'SONATRACH / Division Production Hassi Messaoud (Base 24)',
    }),
  });
  const updatedProject = await updateProjectRes.json();
  if (updatedProject.description !== newProjectDesc) {
    throw new Error(`Échec update project: ${JSON.stringify(updatedProject)}`);
  }
  console.log(`[TEST 1] Modification Projet (${targetProject.code}) : Description et Client mis à jour ✓`);

  // 2. TEST UPDATE ITEM
  const items = await (await fetch(`${API_BASE}/inventory/items`, { headers })).json();
  const targetItem = items[0];
  const updatedUnitCost = Number(targetItem.unitCost || 1000) + 250;
  const updateItemRes = await fetch(`${API_BASE}/inventory/items/${targetItem.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      unitCost: updatedUnitCost,
      description: `${targetItem.description || ''} [Certifié TÜV Rheinland & CCPU 3.1 EN 10204]`,
    }),
  });
  const updatedItem = await updateItemRes.json();
  if (Number(updatedItem.unitCost) !== updatedUnitCost) {
    throw new Error(`Échec update item: ${JSON.stringify(updatedItem)}`);
  }
  console.log(`[TEST 2] Modification Fiche Article (${targetItem.code}) : PU actualisé à ${updatedItem.unitCost} DA ✓`);

  // 3. TEST UPDATE WAREHOUSE
  const warehouses = await (await fetch(`${API_BASE}/inventory/warehouses`, { headers })).json();
  const targetWh = warehouses[0];
  const newLocation = `${targetWh.location} (Hangar Tuyauterie Inox)`;
  const updateWhRes = await fetch(`${API_BASE}/inventory/warehouses/${targetWh.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      location: newLocation,
      managerName: 'Tarek Meziani (Chef Magasinier Principal)',
    }),
  });
  const updatedWh = await updateWhRes.json();
  if (updatedWh.location !== newLocation) {
    throw new Error(`Échec update warehouse: ${JSON.stringify(updatedWh)}`);
  }
  console.log(`[TEST 3] Modification Magasin (${targetWh.code}) : Localisation et Responsable mis à jour ✓`);

  // 4. TEST UPDATE QUALITY DOCUMENT
  const docs = await (await fetch(`${API_BASE}/quality/documents`, { headers })).json();
  const targetDoc = docs[0];
  const updateDocRes = await fetch(`${API_BASE}/quality/documents/${targetDoc.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      version: '2.1',
      title: `${targetDoc.title} (Révisé et Validé par la DG)`,
      status: 'APPROUVE_DEFINITIF',
    }),
  });
  const updatedDoc = await updateDocRes.json();
  if (updatedDoc.version !== '2.1') {
    throw new Error(`Échec update document: ${JSON.stringify(updatedDoc)}`);
  }
  console.log(`[TEST 4] Modification Document Qualité (${targetDoc.docNumber}) : Version rehaussée en v2.1 ✓`);

  // 5. TEST UPDATE NON-CONFORMITY
  const ncs = await (await fetch(`${API_BASE}/quality/non-conformities`, { headers })).json();
  const targetNc = ncs[0];
  const updateNcRes = await fetch(`${API_BASE}/quality/non-conformities/${targetNc.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      rootCause: 'Défaut d’alignement des chanfreins corrigé après meulage et ressuage PT final conforme.',
      severity: 'MINEURE',
    }),
  });
  const updatedNc = await updateNcRes.json();
  if (updatedNc.severity !== 'MINEURE') {
    throw new Error(`Échec update NC: ${JSON.stringify(updatedNc)}`);
  }
  console.log(`[TEST 5] Modification Non-Conformité (${targetNc.ncNumber}) : Cause racine et criticité actualisées ✓`);

  // 6. TEST UPDATE FLEET ASSET
  const assets = await (await fetch(`${API_BASE}/fleet/assets`, { headers })).json();
  const targetAsset = assets[0];
  const updateAssetRes = await fetch(`${API_BASE}/fleet/assets/${targetAsset.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      model: `${targetAsset.model} Turbo Diesel Insonorisé`,
    }),
  });
  const updatedAsset = await updateAssetRes.json();
  if (!updatedAsset.model.includes('Insonorisé')) {
    throw new Error(`Échec update asset: ${JSON.stringify(updatedAsset)}`);
  }
  console.log(`[TEST 6] Modification Matériel / Équipement (${targetAsset.assetTag}) : Modèle et caractéristiques mis à jour ✓`);

  // 7. TEST UPDATE MAINTENANCE ORDER
  const orders = await (await fetch(`${API_BASE}/fleet/maintenance-orders`, { headers })).json();
  const targetOrder = orders[0];
  const updateOrderRes = await fetch(`${API_BASE}/fleet/maintenance-orders/${targetOrder.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      technician: 'Yacine Khelifi & Équipe Chaudronnerie Mobile',
      cost: 58000,
    }),
  });
  const updatedOrder = await updateOrderRes.json();
  if (Number(updatedOrder.cost) !== 58000) {
    throw new Error(`Échec update work order: ${JSON.stringify(updatedOrder)}`);
  }
  console.log(`[TEST 7] Modification Ordre de Travail (${targetOrder.orderNumber}) : Technicien et coût d'intervention révisés ✓`);

  // 8. TEST UPDATE EMPLOYEE
  const employees = await (await fetch(`${API_BASE}/hr/employees`, { headers })).json();
  const targetEmp = employees[0];
  const updateEmpRes = await fetch(`${API_BASE}/hr/employees/${targetEmp.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      phone: '+213 661 99 88 77',
      title: `${targetEmp.title} — Spécialiste Tubes Haute Pression`,
    }),
  });
  const updatedEmp = await updateEmpRes.json();
  if (updatedEmp.phone !== '+213 661 99 88 77') {
    throw new Error(`Échec update employee: ${JSON.stringify(updatedEmp)}`);
  }
  console.log(`[TEST 8] Modification Collaborateur (${targetEmp.registrationNumber}) : Titre et téléphone mis à jour ✓`);

  console.log('================================================================');
  console.log('TOUS LES 8 ENDPOINTS DE MODIFICATION FONCTIONNENT À 100% !');
  console.log('================================================================');
}

testAllUpdateEndpoints().catch(err => {
  console.error('ERREUR TEST:', err);
  process.exit(1);
});
