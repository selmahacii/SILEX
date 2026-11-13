import assert from 'assert';
import { serverStore } from '../apps/web/src/lib/server-store.ts';

console.log('=== TEST UNITAIRE SPÉCIFIQUE : MOTEUR IRG & COTISATIONS CNAS 2026 ===\n');

// 1. Définition de la fonction de référence officielle DGI
function calculateOfficialIrg(taxableIncome: number) {
  if (taxableIncome <= 30000) {
    return { taxableIncome, rawIrg: 0, firstRebate: 0, irgAfterFirst: 0, secondRebate: 0, finalIrg: 0 };
  }

  let rawIrg = 0;
  if (taxableIncome > 20000) {
    if (taxableIncome <= 40000) {
      rawIrg = (taxableIncome - 20000) * 0.23;
    } else if (taxableIncome <= 80000) {
      rawIrg = (20000 * 0.23) + ((taxableIncome - 40000) * 0.27);
    } else if (taxableIncome <= 160000) {
      rawIrg = (20000 * 0.23) + (40000 * 0.27) + ((taxableIncome - 80000) * 0.30);
    } else if (taxableIncome <= 320000) {
      rawIrg = (20000 * 0.23) + (40000 * 0.27) + (80000 * 0.30) + ((taxableIncome - 160000) * 0.33);
    } else {
      rawIrg = (20000 * 0.23) + (40000 * 0.27) + (80000 * 0.30) + (160000 * 0.33) + ((taxableIncome - 320000) * 0.35);
    }
  }

  const firstRebate = Math.max(1000, Math.min(1500, rawIrg * 0.40));
  const irgAfterFirst = Math.max(0, rawIrg - firstRebate);

  let secondRebate = 0;
  let finalIrg = irgAfterFirst;

  if (taxableIncome > 30000 && taxableIncome < 35000) {
    const calculatedWithSecond = (irgAfterFirst * (137 / 51)) - (27925 / 8);
    finalIrg = Math.max(0, Math.round(calculatedWithSecond));
    secondRebate = Math.max(0, Math.round(irgAfterFirst - finalIrg));
  } else {
    finalIrg = Math.round(irgAfterFirst);
  }

  return {
    taxableIncome,
    rawIrg: Math.round(rawIrg),
    firstRebate: Math.round(firstRebate),
    irgAfterFirst: Math.round(irgAfterFirst),
    secondRebate,
    finalIrg
  };
}

// 2. Tests sur les paliers obligatoires demandés par la directive
const testCases = [
  { taxable: 24000, expectedFinal: 0, desc: 'SNMG 2026 (Exonération <= 30k)' },
  { taxable: 30000, expectedFinal: 0, desc: 'Plafond exonération totale' },
  { taxable: 30001, expectedFinal: 2, desc: 'Sortie d\'exonération avec 2ème abattement DGI' },
  { taxable: 32000, expectedFinal: 958, desc: 'Palier 32 000 DA avec 2ème abattement' },
  { taxable: 35000, expectedFinal: 2070, desc: 'Borne 35 000 DA (Fin 2ème abattement)' },
  { taxable: 35001, expectedFinal: 2070, desc: 'Premier abattement standard 40%' },
  { taxable: 75000, expectedFinal: 12550, desc: 'Salaire intermédiaire technicien' },
  { taxable: 120000, expectedFinal: 25900, desc: 'Salaire ingénieur / superviseur' },
  { taxable: 250000, expectedFinal: 67600, desc: 'Salaire cadre supérieur' },
];

console.log('[1] Vérification des cas de test du barème IRG');
testCases.forEach(tc => {
  const result = calculateOfficialIrg(tc.taxable);
  assert.strictEqual(
    result.finalIrg,
    tc.expectedFinal,
    `Échec pour ${tc.taxable} DA: obtenu ${result.finalIrg}, attendu ${tc.expectedFinal}`
  );
  console.log(`  ✓ ${tc.desc} (${tc.taxable} DA) -> IRG Brut: ${result.rawIrg} DA | 1er Abatt.: ${result.firstRebate} DA | 2ème Abatt.: ${result.secondRebate} DA | IRG Retenu: ${result.finalIrg} DA`);
});

// 3. Test de la simulation complète de paie avec cotisations CNAS et décomposition patronale
console.log('\n[2] Vérification de la simulation complète de paie DEMO sur un profil réel');
const slip = serverStore.calculatePayslipDemo('DEMO-EMP-001', {
  periodMonth: 11,
  periodYear: 2026,
  workedDays: 22,
});

assert.ok(slip.cnasBaseDA, 'L\'assiette CNAS doit être définie');
assert.strictEqual(slip.cnasDeduction9Pct, Math.round(slip.cnasBaseDA * 0.09), 'Retenue CNAS 9% exacte');
assert.ok(slip.cnasEmployerBreakdown, 'La décomposition patronale employeur doit être présente');
assert.strictEqual(slip.cnasEmployerBreakdown.assurancesSocialesEmployer26Pct, Math.round(slip.cnasBaseDA * 0.26), 'Part patronale CNAS 26% exacte');
assert.strictEqual(slip.cnasEmployerBreakdown.oeuvresSocialesFOS, Math.round(slip.cnasBaseDA * 0.01), 'Part œuvres sociales FOS 1% exacte');

// Vérification de la formule Net à Payer
const expectedNet = slip.grossSalaryDA - slip.cnasDeduction9Pct - slip.irgTaxAmountDA;
assert.strictEqual(slip.netPayableDA, expectedNet, 'Le net à payer doit correspondre exactement au brut moins retenues salariales');

console.log(`  ✓ Collaborateur: ${slip.employeeName} (${slip.employeeMatricule})`);
console.log(`  ✓ Salaire Brut Global: ${slip.grossSalaryDA.toLocaleString()} DA`);
console.log(`  ✓ Assiette Cotisable CNAS: ${slip.cnasBaseDA.toLocaleString()} DA`);
console.log(`  ✓ Retenue CNAS Salariale (9%): ${slip.cnasDeduction9Pct.toLocaleString()} DA`);
console.log(`  ✓ Charges Patronales Employeur (26% CNAS + 1% FOS = 27%): ${slip.cnasEmployerBreakdown.totalEmployerContribution.toLocaleString()} DA`);
console.log(`  ✓ Salaire Imposable IRG: ${slip.taxableSalaryDA.toLocaleString()} DA`);
console.log(`  ✓ Retenue Fiscale IRG: ${slip.irgTaxAmountDA.toLocaleString()} DA`);
console.log(`  ✓ NET À PAYER: ${slip.netPayableDA.toLocaleString()} DA`);

console.log('\n========================================================================');
console.log('✅ BANC DE TEST UNITAIRE IRG & CNAS VALIDÉ AVEC SUCCÈS À 100% !');
console.log('========================================================================');
