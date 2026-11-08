import { prisma } from '../src/lib/prisma';

async function cleanHistory() {
  console.log('🚀 Démarrage du nettoyage des historiques de données pour la production...');
  console.log('⚠️ CONSERVATION STRICTE DES UTILISATEURS (User) ET DES DÉPARTEMENTS (Department)\n');

  try {
    // Ordre de suppression respectant l'intégrité référentielle des clés étrangères
    console.log('1. Nettoyage des journaux d’audit et notifications...');
    const auditRes = await prisma.auditLog.deleteMany({});
    console.log(`   - AuditLog supprimés : ${auditRes.count}`);
    const notifRes = await prisma.notification.deleteMany({});
    console.log(`   - Notification supprimées : ${notifRes.count}`);

    console.log('2. Nettoyage des sessions actives de rafraîchissement...');
    const sessionRes = await prisma.refreshSession.deleteMany({});
    console.log(`   - RefreshSession supprimées : ${sessionRes.count}`);

    console.log('3. Nettoyage de la qualité et des non-conformités...');
    const caRes = await prisma.correctiveAction.deleteMany({});
    console.log(`   - CorrectiveAction supprimées : ${caRes.count}`);
    const ncRes = await prisma.nonConformity.deleteMany({});
    console.log(`   - NonConformity supprimées : ${ncRes.count}`);
    const docRes = await prisma.document.deleteMany({});
    console.log(`   - Document supprimés : ${docRes.count}`);

    console.log('4. Nettoyage de la maintenance, flotte et engins...');
    const moRes = await prisma.maintenanceOrder.deleteMany({});
    console.log(`   - MaintenanceOrder supprimés : ${moRes.count}`);
    const frRes = await prisma.fuelRecord.deleteMany({});
    console.log(`   - FuelRecord supprimés : ${frRes.count}`);
    const assetRes = await prisma.asset.deleteMany({});
    console.log(`   - Asset supprimés : ${assetRes.count}`);

    console.log('5. Nettoyage RH & pointages...');
    const attRes = await prisma.attendance.deleteMany({});
    console.log(`   - Attendance supprimés : ${attRes.count}`);
    const certRes = await prisma.employeeCertification.deleteMany({});
    console.log(`   - EmployeeCertification supprimées : ${certRes.count}`);
    const empRes = await prisma.employee.deleteMany({});
    console.log(`   - Employee supprimés : ${empRes.count}`);

    console.log('6. Nettoyage des achats, commandes et réceptions...');
    const grlRes = await prisma.goodsReceiptLine.deleteMany({});
    console.log(`   - GoodsReceiptLine supprimées : ${grlRes.count}`);
    const grRes = await prisma.goodsReceipt.deleteMany({});
    console.log(`   - GoodsReceipt supprimés : ${grRes.count}`);
    const polRes = await prisma.purchaseOrderLine.deleteMany({});
    console.log(`   - PurchaseOrderLine supprimées : ${polRes.count}`);
    const poRes = await prisma.purchaseOrder.deleteMany({});
    console.log(`   - PurchaseOrder supprimés : ${poRes.count}`);
    const sqlRes = await prisma.supplierQuoteLine.deleteMany({});
    console.log(`   - SupplierQuoteLine supprimées : ${sqlRes.count}`);
    const sqRes = await prisma.supplierQuote.deleteMany({});
    console.log(`   - SupplierQuote supprimés : ${sqRes.count}`);
    const prlRes = await prisma.purchaseRequestLine.deleteMany({});
    console.log(`   - PurchaseRequestLine supprimées : ${prlRes.count}`);
    const prRes = await prisma.purchaseRequest.deleteMany({});
    console.log(`   - PurchaseRequest supprimées : ${prRes.count}`);
    const supRes = await prisma.supplier.deleteMany({});
    console.log(`   - Supplier supprimés : ${supRes.count}`);

    console.log('7. Nettoyage des stocks, articles et magasins...');
    const smRes = await prisma.stockMovement.deleteMany({});
    console.log(`   - StockMovement supprimés : ${smRes.count}`);
    const pmaRes = await prisma.projectMaterialAllocation.deleteMany({});
    console.log(`   - ProjectMaterialAllocation supprimées : ${pmaRes.count}`);
    const itemRes = await prisma.item.deleteMany({});
    console.log(`   - Item supprimés : ${itemRes.count}`);
    const catRes = await prisma.itemCategory.deleteMany({});
    console.log(`   - ItemCategory supprimées : ${catRes.count}`);
    const whRes = await prisma.warehouse.deleteMany({});
    console.log(`   - Warehouse supprimés : ${whRes.count}`);

    console.log('8. Nettoyage des projets, situations, jalons et coûts...');
    const pceRes = await prisma.projectCostEntry.deleteMany({});
    console.log(`   - ProjectCostEntry supprimées : ${pceRes.count}`);
    const wsRes = await prisma.workSituation.deleteMany({});
    console.log(`   - WorkSituation supprimées : ${wsRes.count}`);
    const soRes = await prisma.serviceOrder.deleteMany({});
    console.log(`   - ServiceOrder supprimés : ${soRes.count}`);
    const ptRes = await prisma.projectTask.deleteMany({});
    console.log(`   - ProjectTask supprimées : ${ptRes.count}`);
    const pmRes = await prisma.projectMilestone.deleteMany({});
    console.log(`   - ProjectMilestone supprimés : ${pmRes.count}`);
    const upaRes = await prisma.userProjectAssignment.deleteMany({});
    console.log(`   - UserProjectAssignment supprimées : ${upaRes.count}`);
    const prjRes = await prisma.project.deleteMany({});
    console.log(`   - Project supprimés : ${prjRes.count}`);

    console.log('\n✅ Nettoyage terminé avec succès !');

    // Vérification finale des utilisateurs
    const usersCount = await prisma.user.count();
    const deptsCount = await prisma.department.count();
    console.log(`\n🔒 Contrôle d'intégrité :`);
    console.log(`   - Utilisateurs intacts en base : ${usersCount}`);
    console.log(`   - Départements intacts en base : ${deptsCount}`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanHistory();
