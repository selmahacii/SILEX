import { PrismaClient, DocumentCategory, NonConformitySeverity, NonConformityStatus, MaintenanceType, MaintenanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initialisation des enregistrements complémentaires (Documents, Qualité, Maintenance, RH) ---');

  const project1 = await prisma.project.findFirst({ where: { code: 'PRJ-2026-001' } });
  const project2 = await prisma.project.findFirst({ where: { code: 'PRJ-2026-002' } });
  const project3 = await prisma.project.findFirst({ where: { code: 'PRJ-2026-003' } });

  // 1. Documents Qualité (QHSE & GED)
  const docCount = await prisma.document.count();
  if (docCount === 0) {
    console.log('Seeding Document...');
    await prisma.document.createMany({
      data: [
        {
          docNumber: 'PROC-SOU-01',
          title: 'Procédure Générale de Soudage GTAW/SMAW selon ASME IX & API 1104',
          category: DocumentCategory.PROCEDURE,
          projectId: project1?.id,
          version: '2.1',
          author: 'Ing. Mustapha Benali (Resp. Qualité)',
          issueDate: new Date('2026-01-15'),
          status: 'VALIDE',
        },
        {
          docNumber: 'DMOS-HP-004',
          title: 'Descriptif de Mode Opératoire de Soudage Lignes HP 4" Inox 316L',
          category: DocumentCategory.DOSSIER_TECHNIQUE,
          projectId: project1?.id,
          version: '1.0',
          author: 'Ing. Khaled Mansouri',
          issueDate: new Date('2026-02-01'),
          status: 'VALIDE',
        },
        {
          docNumber: 'CND-RAD-02',
          title: 'Instruction de Contrôle Radiographique 100% Soudures Bout à Bout',
          category: DocumentCategory.INSTRUCTION,
          projectId: project2?.id,
          version: '3.0',
          author: 'Inspecteur CND Niveau III',
          issueDate: new Date('2026-01-20'),
          status: 'VALIDE',
        },
        {
          docNumber: 'PAQ-PRJ-01',
          title: 'Plan d’Assurance Qualité Chantier Arrêt Raffinerie Sud',
          category: DocumentCategory.DOCUMENT_PROJET,
          projectId: project1?.id,
          version: '1.2',
          author: 'Direction Technique SILEX',
          issueDate: new Date('2026-02-10'),
          status: 'VALIDE',
        },
        {
          docNumber: 'CERT-MAT-2026',
          title: 'Certificats de Matière 3.1 EN 10204 Lot Brides & Tuyaux WNRF',
          category: DocumentCategory.DOCUMENT_FOURNISSEUR,
          projectId: project3?.id,
          version: '1.0',
          author: 'Contrôle Réception Fournisseur',
          issueDate: new Date('2026-02-25'),
          status: 'VALIDE',
        },
      ],
    });
  }

  // 2. Non-Conformités & Actions Correctives
  const ncCount = await prisma.nonConformity.count();
  if (ncCount === 0) {
    console.log('Seeding NonConformity...');
    const nc1 = await prisma.nonConformity.create({
      data: {
        ncNumber: 'NC-2026-001',
        title: 'Défaut d’alignement chanfrein tube 4" Ligne HP Bloc 4',
        description: 'Désalignement supérieur à 1.5mm constaté lors du contrôle visuel avant soudage par passe de pénétration GTAW.',
        severity: NonConformitySeverity.MINEURE,
        status: NonConformityStatus.UNDER_INVESTIGATION,
        projectId: project1?.id,
        detectedBy: 'Inspecteur Qualité Soudage',
        detectedDate: new Date('2026-03-01'),
        rootCause: 'Bride de serrage mal calibrée lors du montage à blanc',
        actions: {
          create: [
            {
              description: 'Reprise mécanique du chanfrein et contrôle de concentricité avec gabarit',
              responsible: 'Chef d’équipe tuyauterie',
              dueDate: new Date('2026-03-10'),
              status: 'IN_PROGRESS',
            },
          ],
        },
      },
    });

    const nc2 = await prisma.nonConformity.create({
      data: {
        ncNumber: 'NC-2026-002',
        title: 'Certificat de conformité matière manquant lot brides WNRF',
        description: 'Réception magasin sans le certificat 3.1 exigé par la spécification technique du client.',
        severity: NonConformitySeverity.MAJEURE,
        status: NonConformityStatus.CLOSED,
        projectId: project2?.id,
        detectedBy: 'Magasinier Central',
        detectedDate: new Date('2026-02-18'),
        rootCause: 'Omission documentaire fournisseur lors de l’expédition',
        actions: {
          create: [
            {
              description: 'Mise en quarantaine du lot et demande officielle auprès du fabricant',
              responsible: 'Responsable Achats',
              dueDate: new Date('2026-02-22'),
              completedDate: new Date('2026-02-21'),
              status: 'COMPLETED',
            },
          ],
        },
      },
    });
  }

  // 3. Maintenance Orders
  const orderCount = await prisma.maintenanceOrder.count();
  if (orderCount === 0) {
    console.log('Seeding MaintenanceOrder...');
    const asset1 = await prisma.asset.findFirst({ where: { assetTag: 'ENG-GRUE-01' } });
    const asset2 = await prisma.asset.findFirst({ where: { assetTag: 'SOUD-AUTO-01' } });

    if (asset1) {
      await prisma.maintenanceOrder.create({
        data: {
          orderNumber: 'OT-2026-001',
          assetId: asset1.id,
          type: MaintenanceType.PREVENTIVE,
          priority: 'HIGH',
          status: MaintenanceStatus.SCHEDULED,
          description: 'Vidange huile hydraulique, remplacement filtres et contrôle de charge des câbles de levage.',
          scheduledDate: new Date('2026-03-15'),
          cost: 180000,
          technician: 'Sadek B. (Mécanicien Engins)',
        },
      });
    }

    if (asset2) {
      await prisma.maintenanceOrder.create({
        data: {
          orderNumber: 'OT-2026-002',
          assetId: asset2.id,
          type: MaintenanceType.CORRECTIVE,
          priority: 'NORMAL',
          status: MaintenanceStatus.COMPLETED,
          description: 'Remplacement connecteur torche TIG et étalonnage du débitmètre argon.',
          scheduledDate: new Date('2026-02-20'),
          completedDate: new Date('2026-02-21'),
          cost: 45000,
          technician: 'Karim T. (Électromécanicien)',
        },
      });
    }
  }

  // 4. Attendances & Certifications
  const attCount = await prisma.attendance.count();
  if (attCount === 0) {
    console.log('Seeding Attendance...');
    const employees = await prisma.employee.findMany({ take: 6 });
    for (const emp of employees) {
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          projectId: project1?.id,
          date: new Date('2026-03-01'),
          regularHours: 8,
          overtimeHours: 2,
          isAbsent: false,
        },
      });
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          projectId: project1?.id,
          date: new Date('2026-03-02'),
          regularHours: 8,
          overtimeHours: 0,
          isAbsent: false,
        },
      });
    }
  }

  console.log('--- Données complémentaires créées avec succès ! ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
