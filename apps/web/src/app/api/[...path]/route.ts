import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { dbBridge } from '@/lib/db-bridge';
import { parseUserFromToken, generateAuthToken } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Vérifie que l'utilisateur authentifié dispose d'un des rôles autorisés pour une
// ressource donnée (PERMISSIONS_MATRIX.md). Retourne une réponse 403 si non autorisé,
// ou null si l'accès est permis.
function requireRole(user: { role: string } | null | undefined, allowedRoles: string[]): NextResponse | null {
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Accès refusé : rôle non autorisé pour cette ressource.' },
      { status: 403, headers: corsHeaders() }
    );
  }
  return null;
}

const ADMIN_SYSTEM_ROLES = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL];
const AUDIT_READ_ROLES = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL, SystemRole.RESPONSABLE_QUALITE];
const USER_MANAGEMENT_ROLES = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL, SystemRole.RESPONSABLE_RH];

// Rôle dont l'accès projet est restreint aux seuls chantiers assignés ([A] dans
// PERMISSIONS_MATRIX.md). Les autres rôles (DG, Finance, Achats, Qualité, Admin...)
// gardent une vision transversale de tous les projets par conception.
const PROJECT_SCOPED_ROLE = SystemRole.RESPONSABLE_PROJET;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  const clean = path.toLowerCase();

  // 0. Porte d'authentification globale : toute lecture de données applicatives exige
  // un jeton JWT valide. Sans cela, n'importe quel appelant anonyme pouvait lire
  // utilisateurs, audit, RBAC, RH, commercial, projets, achats, stocks, etc.
  const gateAuthHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const gateUser = await parseUserFromToken(gateAuthHeader);
  if (!gateUser) {
    return NextResponse.json(
      { error: 'Authentification requise.' },
      { status: 401, headers: corsHeaders() }
    );
  }

  // 1. Auth Me
  if (clean.includes('/auth/me')) {
    return NextResponse.json(gateUser, { headers: corsHeaders() });
  }

  // 2. Users & Audit
  if (clean === '/users') {
    // Lecture ouverte à tout authentifié (annuaire collaborateurs pour affectations
    // projet, etc.) — passwordHash est strictement exclu par dbBridge.getUsers().
    // La création/suppression de comptes reste réservée (voir POST/DELETE).
    const users = await dbBridge.getUsers();
    return NextResponse.json(users, { headers: corsHeaders() });
  }
  if (clean.includes('/audit')) {
    const denied = requireRole(gateUser, AUDIT_READ_ROLES);
    if (denied) return denied;
    const logs = await dbBridge.getAuditLogs();
    return NextResponse.json(logs, { headers: corsHeaders() });
  }
  if (clean === '/admin/rbac') {
    const denied = requireRole(gateUser, ADMIN_SYSTEM_ROLES);
    if (denied) return denied;
    const rbac = await dbBridge.getRolePermissions();
    return NextResponse.json(rbac, { headers: corsHeaders() });
  }

  // 2.5 Commercial (Opportunités, Fiches de Coût, Devis)
  if (clean === '/commercial/kpis') {
    const kpis = await dbBridge.getCommercialKpis();
    return NextResponse.json(kpis, { headers: corsHeaders() });
  }
  if (clean.includes('/commercial/opportunities/') || clean.includes('/opportunities/')) {
    const id = resolvedParams.path[resolvedParams.path.length - 1];
    const opp = await dbBridge.getOpportunity(id);
    if (!opp) return NextResponse.json({ error: 'Opportunité introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(opp, { headers: corsHeaders() });
  }
  if (clean === '/commercial/opportunities' || clean === '/opportunities') {
    const opps = await dbBridge.getOpportunities();
    return NextResponse.json(opps, { headers: corsHeaders() });
  }
  if (clean.includes('/commercial/cost-sheets/') || clean.includes('/cost-sheets/')) {
    const id = resolvedParams.path[resolvedParams.path.length - 1];
    const sheet = await dbBridge.getCostSheet(id);
    if (!sheet) return NextResponse.json({ error: 'Fiche de coût introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(sheet, { headers: corsHeaders() });
  }
  if (clean === '/commercial/cost-sheets' || clean === '/cost-sheets') {
    const sheets = await dbBridge.getCostSheets();
    return NextResponse.json(sheets, { headers: corsHeaders() });
  }
  if (clean.includes('/commercial/quotes/') || clean.includes('/quotes/')) {
    const id = resolvedParams.path[resolvedParams.path.length - 1];
    const quote = await dbBridge.getCustomerQuote(id);
    if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(quote, { headers: corsHeaders() });
  }
  if (clean === '/commercial/quotes' || clean === '/quotes') {
    const quotes = await dbBridge.getCustomerQuotes();
    return NextResponse.json(quotes, { headers: corsHeaders() });
  }

  // 3. Projects
  if (clean === '/projects/kpis') {
    const kpis = await dbBridge.getProjectKpis();
    return NextResponse.json(kpis, { headers: corsHeaders() });
  }
  if (clean.startsWith('/projects/')) {
    const code = resolvedParams.path[1];
    if (code === 'kpis') {
      const kpis = await dbBridge.getProjectKpis();
      return NextResponse.json(kpis, { headers: corsHeaders() });
    }
    if (gateUser.role === PROJECT_SCOPED_ROLE && !(await dbBridge.isUserAssignedToProject(gateUser.id, code))) {
      return NextResponse.json(
        { error: 'Accès refusé : ce chantier ne vous est pas affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
    const subRoute = (resolvedParams.path[2] || '').toLowerCase();
    if (subRoute === 'tasks') {
      const tasks = await dbBridge.getProjectTasks(code);
      return NextResponse.json(tasks, { headers: corsHeaders() });
    }
    if (subRoute === 'contract-items') {
      const items = await dbBridge.getContractItems(code);
      return NextResponse.json(items, { headers: corsHeaders() });
    }
    if (subRoute === 'daily-reports') {
      const reportId = resolvedParams.path[3];
      if (reportId) {
        const report = await dbBridge.getDailyReport(code, reportId);
        if (!report) return NextResponse.json({ error: 'Rapport journalier introuvable' }, { status: 404, headers: corsHeaders() });
        return NextResponse.json(report, { headers: corsHeaders() });
      }
      const reports = await dbBridge.getDailyReports(code);
      return NextResponse.json(reports, { headers: corsHeaders() });
    }
    if (subRoute === 'situation-reports') {
      const sitReports = await dbBridge.getSituationReports(code);
      return NextResponse.json(sitReports, { headers: corsHeaders() });
    }
    if (subRoute === 'constraints') {
      const constraints = await dbBridge.getProjectConstraints(code);
      return NextResponse.json(constraints, { headers: corsHeaders() });
    }
    if (subRoute === 'hse-incidents') {
      const hse = await dbBridge.getHseIncidents(code);
      return NextResponse.json(hse, { headers: corsHeaders() });
    }
    if (subRoute === 'timesheets') {
      const timesheets = await dbBridge.getProjectTimesheets(code);
      return NextResponse.json(timesheets, { headers: corsHeaders() });
    }
    const proj = await dbBridge.getProject(code);
    if (!proj) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json(proj, { headers: corsHeaders() });
  }
  if (clean === '/projects') {
    const projects = await dbBridge.getProjects();
    if (gateUser.role === PROJECT_SCOPED_ROLE) {
      const assignedCodes = new Set(await dbBridge.getAssignedProjectCodes(gateUser.id));
      const scoped = (projects as any[]).filter(p => assignedCodes.has(p.code));
      return NextResponse.json(scoped, { headers: corsHeaders() });
    }
    return NextResponse.json(projects, { headers: corsHeaders() });
  }

  // 4. Workflows (QCD Circuit & DG Inbox)
  if (clean === '/workflows/inbox' || clean === '/workflows/pending') {
    const inbox = await dbBridge.getWorkflowsInbox();
    return NextResponse.json({ items: inbox, total: inbox.length }, { headers: corsHeaders() });
  }
  if (clean.includes('/workflows')) {
    const wfs = await dbBridge.getWorkflows();
    return NextResponse.json({ items: wfs, total: wfs.length }, { headers: corsHeaders() });
  }

  // 5. Phase 4 Procurement (KPIs, EB, RFQ, TCO, Contrats, Évaluations)
  if (clean.includes('/procurement/kpis')) {
    const kpis = await dbBridge.getProcurementKpis();
    return NextResponse.json(kpis, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/kpis')) {
    const kpis = await dbBridge.getInventoryKpis();
    return NextResponse.json(kpis, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/need-requests')) {
    const projId = req.nextUrl.searchParams.get('projectId') || req.nextUrl.searchParams.get('project') || undefined;
    const nrs = await dbBridge.getNeedRequests(projId);
    return NextResponse.json(nrs, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/rfq') || clean.includes('/procurement/consultations')) {
    const projId = req.nextUrl.searchParams.get('projectId') || req.nextUrl.searchParams.get('project') || undefined;
    const rfqs: any[] = await dbBridge.getRfqConsultations(projId);
    if (gateUser.role === PROJECT_SCOPED_ROLE) {
      const assignedCodes = new Set(await dbBridge.getAssignedProjectCodes(gateUser.id));
      const scoped = rfqs.filter(r => assignedCodes.has(r.projectCode) || assignedCodes.has(r.projectId));
      return NextResponse.json(scoped, { headers: corsHeaders() });
    }
    return NextResponse.json(rfqs, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/contracts')) {
    const suppId = req.nextUrl.searchParams.get('supplierId') || undefined;
    const contracts = await dbBridge.getSupplierContracts(suppId);
    return NextResponse.json(contracts, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/evaluations')) {
    const suppId = req.nextUrl.searchParams.get('supplierId') || undefined;
    const evals = await dbBridge.getSupplierEvaluations(suppId);
    return NextResponse.json(evals, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/goods-receipts') || clean.includes('/procurement/goods-receipts')) {
    const orderId = req.nextUrl.searchParams.get('orderId') || undefined;
    const grs = await dbBridge.getGoodsReceipts(orderId);
    return NextResponse.json(grs, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/physical-inventories')) {
    const whId = req.nextUrl.searchParams.get('warehouseId') || undefined;
    const pinvs = await dbBridge.getPhysicalInventories(whId);
    return NextResponse.json(pinvs, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/bons-de-sortie/') || clean.includes('/inventory/bsm/')) {
    const bsId = resolvedParams.path[resolvedParams.path.length - 1];
    const bs = await dbBridge.getBonDeSortie(bsId);
    if (!bs) return NextResponse.json({ error: 'Bon de sortie introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(bs, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/bons-de-sortie') || clean.includes('/inventory/bsm')) {
    const projId = req.nextUrl.searchParams.get('projectId') || req.nextUrl.searchParams.get('project') || undefined;
    const bss = await dbBridge.getBonsDeSortie(projId);
    return NextResponse.json(bss, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/traceability') || clean.includes('/procurement/traceability')) {
    const q = req.nextUrl.searchParams.get('q') || req.nextUrl.searchParams.get('query') || '';
    const res = await dbBridge.getMaterialTraceability(q);
    return NextResponse.json(res, { headers: corsHeaders() });
  }

  // 5. Procurement (DA, BC, Fournisseurs)
  if (clean.includes('/procurement/purchase-requests/') && resolvedParams.path.length >= 3) {
    const prId = resolvedParams.path[2];
    const pr: any = await dbBridge.getPurchaseRequest(prId);
    if (!pr) {
      return NextResponse.json({ error: 'Demande d\'Achat introuvable' }, { status: 404, headers: corsHeaders() });
    }
    if (
      gateUser.role === PROJECT_SCOPED_ROLE &&
      !(await dbBridge.isUserAssignedToProject(gateUser.id, pr.project?.code || pr.projectCode || pr.projectId))
    ) {
      return NextResponse.json(
        { error: 'Accès refusé : cette demande d\'achat ne concerne pas un chantier qui vous est affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
    return NextResponse.json(pr, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-requests') || clean === '/procurement') {
    const prs: any[] = await dbBridge.getPurchaseRequests();
    if (gateUser.role === PROJECT_SCOPED_ROLE) {
      const assignedCodes = new Set(await dbBridge.getAssignedProjectCodes(gateUser.id));
      const scoped = prs.filter(pr => assignedCodes.has(pr.project?.code || pr.projectCode));
      return NextResponse.json(scoped, { headers: corsHeaders() });
    }
    return NextResponse.json(prs, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-orders') || clean.includes('/purchase-orders')) {
    const pos: any[] = await dbBridge.getPurchaseOrders();
    if (gateUser.role === PROJECT_SCOPED_ROLE) {
      const assignedCodes = new Set(await dbBridge.getAssignedProjectCodes(gateUser.id));
      const scoped = pos.filter(po => assignedCodes.has(po.project?.code) || assignedCodes.has(po.projectCode));
      return NextResponse.json(scoped, { headers: corsHeaders() });
    }
    return NextResponse.json(pos, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/suppliers') || clean.includes('/suppliers')) {
    const supps = await dbBridge.getSuppliers();
    return NextResponse.json(supps, { headers: corsHeaders() });
  }

  // 6. Inventory (Articles, Magasins, Mouvements)
  if (clean.includes('/inventory/warehouses') || clean.includes('/warehouses')) {
    const whs = await dbBridge.getWarehouses();
    return NextResponse.json(whs, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/stock-movements') || clean.includes('/stock-movements')) {
    const mvts = await dbBridge.getStockMovements();
    return NextResponse.json(mvts, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/items') || clean.includes('/inventory')) {
    const items = await dbBridge.getInventoryItems();
    return NextResponse.json(items, { headers: corsHeaders() });
  }

  // 7. Phase 5 HR Endpoints
  if (clean.includes('/hr/kpis')) {
    const kpis = await dbBridge.getHrKpis();
    return NextResponse.json(kpis, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/industrial-certifications')) {
    const empId = req.nextUrl.searchParams.get('employeeId') || undefined;
    const certs = await dbBridge.getIndustrialCertifications(empId);
    return NextResponse.json(certs, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/leaves') || clean.includes('/hr/leave-requests')) {
    const empId = req.nextUrl.searchParams.get('employeeId') || undefined;
    const leaves = await dbBridge.getLeaveRequests(empId);
    return NextResponse.json(leaves, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/missions') || clean.includes('/hr/mission-orders')) {
    const empId = req.nextUrl.searchParams.get('employeeId') || undefined;
    const missions = await dbBridge.getMissionOrders(empId);
    return NextResponse.json(missions, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/recruitments') || clean.includes('/hr/recruitment-requests')) {
    const projId = req.nextUrl.searchParams.get('projectId') || undefined;
    const recs = await dbBridge.getRecruitmentRequests(projId);
    return NextResponse.json(recs, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/rotations')) {
    const rots = await dbBridge.getRotationCycles();
    return NextResponse.json(rots, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/salary-rubrics')) {
    const rubrics = await dbBridge.getSalaryRubrics();
    return NextResponse.json(rubrics, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/payslip-demo')) {
    const empId = req.nextUrl.searchParams.get('employeeId') || 'DEMO-EMP-001';
    const month = req.nextUrl.searchParams.get('month') ? Number(req.nextUrl.searchParams.get('month')) : undefined;
    const year = req.nextUrl.searchParams.get('year') ? Number(req.nextUrl.searchParams.get('year')) : undefined;
    const hs50 = req.nextUrl.searchParams.get('hs50') ? Number(req.nextUrl.searchParams.get('hs50')) : undefined;
    const hs100 = req.nextUrl.searchParams.get('hs100') ? Number(req.nextUrl.searchParams.get('hs100')) : undefined;
    const slip = await dbBridge.calculatePayslipDemo(empId, { periodMonth: month, periodYear: year, overtimeHours50: hs50, overtimeHours100: hs100 });
    return NextResponse.json(slip, { headers: corsHeaders() });
  }

  // 7. HR
  if (clean.includes('/hr/certifications')) {
    const certs = await dbBridge.getCertifications();
    return NextResponse.json(certs, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/attendances')) {
    const atts = await dbBridge.getAttendances();
    return NextResponse.json(atts, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/employees') || clean.includes('/employees') || clean === '/hr') {
    const emps = await dbBridge.getEmployees();
    return NextResponse.json(emps, { headers: corsHeaders() });
  }

  // 8. Fleet & Maintenance
  if (clean.includes('/fleet/maintenance-orders') || clean.includes('/maintenance/work-orders')) {
    const orders = await dbBridge.getMaintenanceOrders();
    return NextResponse.json(orders, { headers: corsHeaders() });
  }
  if (clean.includes('/fleet/assets') || clean.includes('/fleet') || clean.includes('/assets')) {
    const assets = await dbBridge.getFleetAssets();
    return NextResponse.json(assets, { headers: corsHeaders() });
  }

  // 9. Quality & QHSE & Weld Book
  if (clean.startsWith('/quality/weld-book/') || clean.includes('/quality/weld-book/')) {
    const jointId = resolvedParams.path[2] || resolvedParams.path[resolvedParams.path.length - 1];
    const joint = await dbBridge.getWeldJoint(jointId);
    if (!joint) return NextResponse.json({ error: 'Joint de soudure introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(joint, { headers: corsHeaders() });
  }
  if (clean.includes('/quality/weld-book') || clean.includes('/weld-book')) {
    const projId = req.nextUrl.searchParams.get('projectId') || req.nextUrl.searchParams.get('project') || undefined;
    const joints = await dbBridge.getWeldJoints(projId);
    return NextResponse.json(joints, { headers: corsHeaders() });
  }
  if (clean.startsWith('/quality/documents/') && resolvedParams.path.length >= 3) {
    const docId = resolvedParams.path[2];
    const doc = await dbBridge.getQualityDocument(docId);
    if (!doc) return NextResponse.json({ error: 'Document qualité introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(doc, { headers: corsHeaders() });
  }
  if (clean.includes('/quality/documents')) {
    const cat = req.nextUrl.searchParams.get('category') || undefined;
    const docs = await dbBridge.getQualityDocuments(cat);
    return NextResponse.json(docs, { headers: corsHeaders() });
  }
  if (clean.startsWith('/quality/non-conformities/') && resolvedParams.path.length >= 3) {
    const ncId = resolvedParams.path[2];
    const nc = await dbBridge.getNonConformity(ncId);
    if (!nc) return NextResponse.json({ error: 'FNC introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(nc, { headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities') || clean === '/quality') {
    const projId = req.nextUrl.searchParams.get('projectId') || req.nextUrl.searchParams.get('project') || undefined;
    const ncs = await dbBridge.getNonConformities(projId);
    return NextResponse.json(ncs, { headers: corsHeaders() });
  }

  // 10. Finance & Trésorerie (SÉCURISATION P0 & RBAC)
  if (clean.startsWith('/finance') || clean.includes('/finance/')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const authUser = await parseUserFromToken(authHeader);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentification requise pour accéder aux ressources financières.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const allowedRoles: string[] = [
      SystemRole.ADMINISTRATEUR,
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.RESPONSABLE_FINANCIER,
      SystemRole.RESPONSABLE_PROJET,
    ];

    if (!allowedRoles.includes(authUser.role)) {
      return NextResponse.json(
        { error: 'Accès refusé : rôle non autorisé pour les opérations financières.' },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Sécurisation stricte du mode Démo (P1-1 durcissement Phase 6C.1.2)
    // 1. Absence de paramètre ou valeur différente de 'true' : Production stricte (includeDemo = false).
    // 2. Si includeDemo=true : inclusion autorisée UNIQUEMENT pour les rôles de direction financière (Admin, DG, DAF).
    // Les autres rôles (ex: RESPONSABLE_PROJET) ne peuvent pas contourner cette restriction par URL.
    const requestedDemo = req.nextUrl.searchParams.get('includeDemo') === 'true';
    const canAccessDemo = [
      SystemRole.ADMINISTRATEUR,
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.RESPONSABLE_FINANCIER,
    ].includes(authUser.role);

    const includeDemo = requestedDemo && canAccessDemo;

    if (clean.includes('/finance/distribution')) {
      const dist = await dbBridge.getCostDistribution();
      return NextResponse.json(dist, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/config')) {
      const cfg = await dbBridge.getFinancialConfig();
      return NextResponse.json(cfg, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/accounts')) {
      const accounts = await dbBridge.getFinancialAccounts({ includeDemo }, authUser);
      return NextResponse.json(accounts, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/transactions')) {
      const txs = await dbBridge.getCashTransactions({ includeDemo });
      return NextResponse.json(txs, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/customer-invoices')) {
      const invoices = await dbBridge.getCustomerInvoices({ includeDemo });
      return NextResponse.json(invoices, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/supplier-invoices')) {
      const invoices = await dbBridge.getSupplierInvoices({ includeDemo });
      return NextResponse.json(invoices, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/aged-trial-balance')) {
      const atb = await dbBridge.getAgedTrialBalance({ includeDemo });
      return NextResponse.json(atb, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/project-profitability')) {
      const prjId = req.nextUrl.searchParams.get('projectId') || resolvedParams.path[2] || '';
      const prof = await dbBridge.getProjectProfitability(prjId);
      return NextResponse.json(prof || { error: 'Projet introuvable' }, { headers: corsHeaders() });
    }
    if (clean.includes('/finance/overview') || clean === '/finance') {
      const fin = await dbBridge.getFinanceOverview({ includeDemo });
      return NextResponse.json(fin, { headers: corsHeaders() });
    }
  }

  // 11. Reports
  if (clean.includes('/reports')) {
    const kpis = await dbBridge.getProjectKpis();
    return NextResponse.json(kpis, { headers: corsHeaders() });
  }

  return NextResponse.json([], { headers: corsHeaders() });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  const clean = path.toLowerCase();

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  // 0. Porte d'authentification globale (voir GET). /auth/login et /auth/demo-switch
  // ont leurs propres fichiers de route dédiés et ne transitent jamais par ce catch-all.
  const gateAuthHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const gateUser = await parseUserFromToken(gateAuthHeader);
  if (!gateUser) {
    return NextResponse.json(
      { error: 'Authentification requise.' },
      { status: 401, headers: corsHeaders() }
    );
  }

  // 0.1 Isolation projet (voir GET) : toute création sous /projects/:code/... (situations,
  // ODS, coûts, jalons, tâches, rapports, DA depuis le chantier) exige que le Chef de
  // Projet soit affecté à ce code. Les autres rôles (DG, Achats, Finance...) ne sont pas
  // concernés par cette restriction.
  if (clean.startsWith('/projects/') && resolvedParams.path.length >= 2) {
    const scopedProjCode = resolvedParams.path[1];
    if (
      gateUser.role === PROJECT_SCOPED_ROLE &&
      !(await dbBridge.isUserAssignedToProject(gateUser.id, scopedProjCode))
    ) {
      return NextResponse.json(
        { error: 'Accès refusé : ce chantier ne vous est pas affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
  }

  // 1. Auth (Login) — délégué à /api/auth/login/route.ts qui vérifie réellement le mot de passe
  // (Argon2id). Ce chemin du catch-all ne doit jamais émettre de jeton sans vérification.
  if (clean.includes('/auth/login')) {
    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis.' },
        { status: 401, headers: corsHeaders() }
      );
    }
    const user = await dbBridge.authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Identifiants invalides.' },
        { status: 401, headers: corsHeaders() }
      );
    }
    const token = generateAuthToken(user);
    const payload = {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentCode: user.departmentCode,
        title: user.title,
        avatarUrl: (user as any).avatar,
        assignedProjects: (user as any).assignedProjects || [],
        permissions: ['*'],
      },
    };

    return NextResponse.json(payload, { headers: corsHeaders() });
  }

  // 2. Users
  if (clean === '/users') {
    const denied = requireRole(gateUser, USER_MANAGEMENT_ROLES);
    if (denied) return denied;
    const newUser = await dbBridge.createUser(body);
    return NextResponse.json(newUser, { status: 201, headers: corsHeaders() });
  }
  if (clean === '/admin/rbac') {
    const denied = requireRole(gateUser, ADMIN_SYSTEM_ROLES);
    if (denied) return denied;
    const updated = await dbBridge.updateRolePermissions(body.role, body.permissions);
    return NextResponse.json(updated, { status: 200, headers: corsHeaders() });
  }

  // 2.5 Commercial POST actions
  if (clean === '/commercial/opportunities' || clean === '/opportunities') {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const opp = await dbBridge.createOpportunity(body, user);
    return NextResponse.json(opp, { status: 201, headers: corsHeaders() });
  }
  if (clean === '/commercial/cost-sheets' || clean === '/cost-sheets') {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const sheet = await dbBridge.createCostSheet(body, user);
    return NextResponse.json(sheet, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/commercial/cost-sheets/') || clean.includes('/cost-sheets/')) {
    const sheetId = resolvedParams.path.find(p => p.startsWith('fc-') || p.startsWith('FC-')) || resolvedParams.path[2] || resolvedParams.path[1];
    const action = resolvedParams.path[resolvedParams.path.length - 1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);

    if (action === 'submit-dg') {
      const res = await dbBridge.submitCostSheetToDG(sheetId, user);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'arbitrate') {
      const res = await dbBridge.arbitrateCostSheet(sheetId, body.decision, body.notes, user);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'convert-project') {
      const proj = await dbBridge.convertCostSheetToProject(sheetId, user);
      return NextResponse.json(proj, { status: 201, headers: corsHeaders() });
    }
    if (action === 'create-quote') {
      const quote = await dbBridge.createCustomerQuote(sheetId, user);
      return NextResponse.json(quote, { status: 201, headers: corsHeaders() });
    }
    if (action === 'create-revision') {
      const revised = await dbBridge.createCostSheetRevision(sheetId, body.reason, user);
      return NextResponse.json(revised, { status: 201, headers: corsHeaders() });
    }
    if (action === 'compare-versions') {
      const comparison = await dbBridge.compareCostSheetVersions(sheetId, Number(body.versionA), Number(body.versionB));
      return NextResponse.json(comparison, { headers: corsHeaders() });
    }
  }
  if (clean.includes('/commercial/opportunities/') || clean.includes('/opportunities/')) {
    const oppId = resolvedParams.path.find(p => p.startsWith('opp-') || p.startsWith('OPP-')) || resolvedParams.path[resolvedParams.path.length - 2] || resolvedParams.path[resolvedParams.path.length - 1];
    const action = resolvedParams.path[resolvedParams.path.length - 1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);

    if (action === 'stage' || action === 'update-stage' || body.stage) {
      const stage = body.stage || body.newStage;
      const updated = await dbBridge.updateOpportunityStage(oppId, stage, body, user);
      return NextResponse.json(updated, { headers: corsHeaders() });
    }
  }
  if (clean === '/commercial/quotes' || clean === '/quotes') {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const quote = await dbBridge.createCustomerQuote(body.costSheetId, user);
    return NextResponse.json(quote, { status: 201, headers: corsHeaders() });
  }

  // 2.8 Module 02 Project POST subactions (Phase 3)
  if (clean.startsWith('/projects/') && resolvedParams.path.length >= 3) {
    const projCode = resolvedParams.path[1];
    const subAction = (resolvedParams.path[2] || '').toLowerCase();
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);

    if (subAction === 'tasks') {
      const task = await dbBridge.createProjectTask(projCode, body, user);
      return NextResponse.json(task, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'daily-reports') {
      if (resolvedParams.path[3] === 'validate' || resolvedParams.path[4] === 'validate') {
        const reportId = resolvedParams.path[3] === 'validate' ? body.reportId : resolvedParams.path[3];
        const validated = await dbBridge.validateDailyReport(projCode, reportId, user);
        return NextResponse.json(validated, { headers: corsHeaders() });
      }
      const report = await dbBridge.createDailyReport(projCode, body, user);
      return NextResponse.json(report, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'situation-reports') {
      const sitRep = await dbBridge.createSituationReport(projCode, body, user);
      return NextResponse.json(sitRep, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'constraints') {
      const ctr = await dbBridge.createProjectConstraint(projCode, body, user);
      return NextResponse.json(ctr, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'hse-incidents') {
      const hse = await dbBridge.createHseIncident(projCode, body, user);
      return NextResponse.json(hse, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'purchase-requests') {
      const pr = await dbBridge.createProjectPurchaseRequest(projCode, body, user);
      return NextResponse.json(pr, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'stock-consumptions') {
      const sm = await dbBridge.recordProjectStockConsumption(projCode, body, user);
      return NextResponse.json(sm, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'timesheets') {
      const ts = await dbBridge.createProjectTimesheet(projCode, body, user);
      return NextResponse.json(ts, { status: 201, headers: corsHeaders() });
    }
    if (subAction === 'reception' || subAction === 'pvrp' || subAction === 'pvrd') {
      const type = subAction === 'pvrd' ? 'PVRD' : subAction === 'pvrp' ? 'PVRP' : (body.type || 'PVRP');
      const rec = await dbBridge.updateProjectReception(projCode, { ...body, type }, user);
      return NextResponse.json(rec, { status: 201, headers: corsHeaders() });
    }
  }

  // 3. Projects
  if (clean.includes('/tasks/')) {
    const projCode = resolvedParams.path[1];
    const taskId = resolvedParams.path[3];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.deleteProjectTask(projCode, taskId, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }

  if (clean.includes('/members')) {
    const projId = resolvedParams.path[1];
    const member = await dbBridge.assignMemberToProject(projId, body.userId, null);
    return NextResponse.json(member, { status: 201, headers: corsHeaders() });
  }
  if (clean === '/projects') {
    const newProj = await dbBridge.createProject(body);
    return NextResponse.json(newProj, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/milestones')) {
    const projCode = resolvedParams.path[1];
    const mls = await dbBridge.addMilestone(projCode, body);
    return NextResponse.json(mls, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/service-orders')) {
    const projCode = resolvedParams.path[1];
    const ods = await dbBridge.addServiceOrder(projCode, body);
    return NextResponse.json(ods, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/work-situations')) {
    const projCode = resolvedParams.path[1];
    const sit = await dbBridge.addWorkSituation(projCode, body);
    return NextResponse.json(sit, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/costs')) {
    const projCode = resolvedParams.path[1];
    const cost = await dbBridge.addCostEntry(projCode, body);
    return NextResponse.json(cost, { status: 201, headers: corsHeaders() });
  }

  // 4. Workflows Decisions (Approve, Reject, Revise)
  if (clean.includes('/workflows/')) {
    const wfId = resolvedParams.path[1];
    const action = resolvedParams.path[2];
    if (action === 'approve') {
      const res = await dbBridge.approveWorkflow(wfId, body.notes);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'reject') {
      const res = await dbBridge.rejectWorkflow(wfId, body.reason);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'request-revision') {
      const res = await dbBridge.requestRevisionWorkflow(wfId, body.instructions);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
  }

  // 5. Phase 4 Procurement & Inventory Endpoints
  // Expressions de besoin
  if (clean.includes('/procurement/need-requests') && clean.includes('/validate')) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.validateNeedRequest(id, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/need-requests') && (clean.includes('/convert-to-da') || clean.includes('/convert-to-pr'))) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.convertNeedRequestToPR(id, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/need-requests')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const eb = await dbBridge.createNeedRequest(body, user);
    return NextResponse.json(eb, { status: 201, headers: corsHeaders() });
  }

  // RFQ & TCO
  if (clean.includes('/procurement/rfq') && clean.includes('/offers')) {
    const rfqId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.addOfferToRfq(rfqId, body, user);
    return NextResponse.json(res, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/procurement/rfq') && clean.includes('/tco-evaluate')) {
    const rfqId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.calculateTcoComparison(rfqId, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/tco') && clean.includes('/approve-dg')) {
    const tcoId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.approveTcoDG(tcoId, body.justification || 'Approbation DG après audit TCO', user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/tco') && clean.includes('/create-po')) {
    const tcoId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.createPurchaseOrderFromTco(tcoId, user);
    return NextResponse.json(res, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/procurement/rfq')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const rfq = await dbBridge.createRfqConsultation(body, user);
    return NextResponse.json(rfq, { status: 201, headers: corsHeaders() });
  }

  // Contrats fournisseurs
  if (clean.includes('/procurement/contracts')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const c = await dbBridge.createSupplierContract(body, user);
    return NextResponse.json(c, { status: 201, headers: corsHeaders() });
  }

  // Évaluations fournisseurs
  if (clean.includes('/procurement/evaluations')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const ev = await dbBridge.recordSupplierEvaluation(body, user);
    return NextResponse.json(ev, { status: 201, headers: corsHeaders() });
  }

  // Fournisseurs statut update
  if (clean.includes('/procurement/suppliers') && clean.includes('/status')) {
    const suppId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.updateSupplierStatus(suppId, body.status, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }

  // Bons de réception & contrôle qualité
  if (clean.includes('/inventory/goods-receipts') || clean.includes('/procurement/goods-receipts') || clean.includes('/inventory/receive-goods')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const gr = await dbBridge.recordGoodsReceipt(body, user);
    return NextResponse.json(gr, { status: 201, headers: corsHeaders() });
  }

  // Bons de sortie magasin (BSM) & Imputation projet
  if (clean.includes('/inventory/bons-de-sortie') || clean.includes('/inventory/bsm') || clean.includes('/inventory/issue-to-project')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const bsm = await dbBridge.createBonDeSortie(body, user);
    return NextResponse.json(bsm, { status: 201, headers: corsHeaders() });
  }

  // Inventaires physiques
  if (clean.includes('/inventory/physical-inventories') && clean.includes('/count')) {
    const invId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.submitInventoryCount(invId, body.counts, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/physical-inventories') && clean.includes('/validate-adjust')) {
    const invId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.validateAndAdjustInventoryDG(invId, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/physical-inventories')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const inv = await dbBridge.createPhysicalInventory(body, user);
    return NextResponse.json(inv, { status: 201, headers: corsHeaders() });
  }

  // 5. Procurement
  if (clean.includes('/procurement/purchase-requests') || clean === '/procurement') {
    const requestedProjectRef = body.projectCode || body.projectId;
    if (
      gateUser.role === PROJECT_SCOPED_ROLE &&
      (!requestedProjectRef || !(await dbBridge.isUserAssignedToProject(gateUser.id, requestedProjectRef)))
    ) {
      return NextResponse.json(
        { error: 'Accès refusé : vous ne pouvez créer une demande d\'achat que pour un chantier qui vous est affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
    const pr = await dbBridge.createPurchaseRequest(body);
    return NextResponse.json(pr, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/procurement/suppliers') || clean.includes('/suppliers')) {
    const supp = await dbBridge.createSupplier(body);
    return NextResponse.json(supp, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-orders') || clean.includes('/purchase-orders')) {
    const po = await dbBridge.createPurchaseOrder(body);
    return NextResponse.json(po, { status: 201, headers: corsHeaders() });
  }

  // 6. Inventory
  if (clean.includes('/inventory/warehouses') || clean.includes('/warehouses')) {
    const wh = await dbBridge.createWarehouse(body);
    return NextResponse.json(wh, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/inventory/stock-movements') || clean.includes('/stock-movements')) {
    const mvt = await dbBridge.recordStockMovement(body);
    return NextResponse.json(mvt, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/inventory/items') || clean.includes('/inventory')) {
    if (body.type && (body.type === 'ENTRY' || body.type === 'EXIT' || body.type === 'RECEPTION')) {
      const mvt = await dbBridge.recordStockMovement(body);
      return NextResponse.json(mvt, { status: 201, headers: corsHeaders() });
    }
    const item = await dbBridge.createInventoryItem(body);
    return NextResponse.json(item, { status: 201, headers: corsHeaders() });
  }

  // 7. Phase 5 HR Action Endpoints
  // Certifications CQS & Audit
  if (clean.includes('/hr/industrial-certifications') && clean.includes('/audit')) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.auditIndustrialCertification(id, body.decision || 'VALIDE', body.motif, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/industrial-certifications')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const cert = await dbBridge.createIndustrialCertification(body, user);
    return NextResponse.json(cert, { status: 201, headers: corsHeaders() });
  }

  // Congés & Titres de congé
  if ((clean.includes('/hr/leaves') || clean.includes('/hr/leave-requests')) && clean.includes('/visa-rh')) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.approveLeaveRH(id, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if ((clean.includes('/hr/leaves') || clean.includes('/hr/leave-requests')) && clean.includes('/approve-dg')) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.approveLeaveDG(id, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/leaves') || clean.includes('/hr/leave-requests')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const lv = await dbBridge.createLeaveRequest(body, user);
    return NextResponse.json(lv, { status: 201, headers: corsHeaders() });
  }

  // Ordres de mission
  if ((clean.includes('/hr/missions') || clean.includes('/hr/mission-orders')) && clean.includes('/approve-dg')) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.approveMissionOrderDG(id, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/missions') || clean.includes('/hr/mission-orders')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const mis = await dbBridge.createMissionOrder(body, user);
    return NextResponse.json(mis, { status: 201, headers: corsHeaders() });
  }

  // Recrutements
  if ((clean.includes('/hr/recruitments') || clean.includes('/hr/recruitment-requests')) && clean.includes('/approve-dg')) {
    const id = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.approveRecruitmentRequestDG(id, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }
  if (clean.includes('/hr/recruitments') || clean.includes('/hr/recruitment-requests')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const rec = await dbBridge.createRecruitmentRequest(body, user);
    return NextResponse.json(rec, { status: 201, headers: corsHeaders() });
  }

  // Rotations
  if (clean.includes('/hr/rotations') && clean.includes('/assign')) {
    const rotId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.assignEmployeeToRotation(rotId, body.employeeId, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }

  // 7. HR
  if (clean.includes('/hr/employees') || clean.includes('/employees') || clean === '/hr') {
    const emp = await dbBridge.createEmployee(body);
    return NextResponse.json(emp, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/hr/certifications')) {
    const cert = await dbBridge.createCertification(body);
    return NextResponse.json(cert, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/hr/attendances')) {
    const att = await dbBridge.recordAttendance(body);
    return NextResponse.json(att, { status: 201, headers: corsHeaders() });
  }

  // 8. Fleet & Maintenance
  if (clean.includes('/fleet/assets') || clean.includes('/fleet') || clean.includes('/assets')) {
    const ast = await dbBridge.createFleetAsset(body);
    return NextResponse.json(ast, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/fleet/maintenance-orders') || clean.includes('/maintenance/work-orders')) {
    const ot = await dbBridge.createMaintenanceOrder(body);
    return NextResponse.json(ot, { status: 201, headers: corsHeaders() });
  }

  // 9. Quality, QHSE, GED & Weld Book
  if (clean.includes('/quality/weld-book/') && clean.endsWith('/cnd')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const jointId = resolvedParams.path[2];
    const updated = await dbBridge.recordWeldCndResult(jointId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/quality/weld-book/') && clean.endsWith('/repair')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const jointId = resolvedParams.path[2];
    const updated = await dbBridge.recordWeldRepair(jointId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/quality/weld-book') || clean === '/weld-book') {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const weld = await dbBridge.createWeldJoint(body, user);
    return NextResponse.json(weld, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities/') && clean.endsWith('/actions')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const ncId = resolvedParams.path[2];
    const res = await dbBridge.addNonConformityAction(ncId, body, user);
    return NextResponse.json(res, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/quality/documents/') && clean.endsWith('/revisions')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const docId = resolvedParams.path[2];
    const res = await dbBridge.addQualityDocumentRevision(docId, body, user);
    return NextResponse.json(res, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/quality/documents')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const doc = await dbBridge.createQualityDocument(body, user);
    return NextResponse.json(doc, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities') || clean === '/quality') {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const nc = await dbBridge.createNonConformity(body, user);
    return NextResponse.json(nc, { status: 201, headers: corsHeaders() });
  }

  // 10. Finance & Trésorerie (SÉCURISATION P0 & RBAC ÉCRITURE)
  if (clean.startsWith('/finance') || clean.includes('/finance/')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const authUser = await parseUserFromToken(authHeader);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentification requise pour effectuer une opération financière.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const authorizedPostRoles: string[] = [
      SystemRole.ADMINISTRATEUR,
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.RESPONSABLE_FINANCIER,
      SystemRole.RESPONSABLE_PROJET,
    ];

    if (!authorizedPostRoles.includes(authUser.role)) {
      return NextResponse.json(
        { error: 'Accès refusé : habilitation insuffisante pour modifier les comptes ou factures.' },
        { status: 403, headers: corsHeaders() }
      );
    }

    try {
      if (clean.includes('/finance/accounts')) {
        const acc = await dbBridge.createFinancialAccount(body, authUser);
        return NextResponse.json(acc, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/transactions/transfer')) {
        const res = await dbBridge.transferBetweenAccounts(body, authUser);
        return NextResponse.json(res, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/transactions')) {
        const tx = await dbBridge.recordCashTransaction(body, authUser);
        return NextResponse.json(tx, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/customer-invoices/') && clean.endsWith('/pay')) {
        const invId = resolvedParams.path[resolvedParams.path.length - 2];
        const res = await dbBridge.recordCustomerPayment(invId, body, authUser);
        return NextResponse.json(res, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/customer-invoices/') && clean.endsWith('/release-warranty')) {
        const invId = resolvedParams.path[resolvedParams.path.length - 2];
        const res = await dbBridge.releaseWarrantyRetention(invId, body, authUser);
        return NextResponse.json(res, { status: 200, headers: corsHeaders() });
      }
      if (clean.includes('/finance/customer-invoices')) {
        const inv = await dbBridge.createCustomerInvoice(body, authUser);
        return NextResponse.json(inv, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/supplier-invoices/') && clean.endsWith('/pay')) {
        const invId = resolvedParams.path[resolvedParams.path.length - 2];
        const res = await dbBridge.recordSupplierPayment(invId, body, authUser);
        return NextResponse.json(res, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/supplier-invoices/') && clean.endsWith('/cancel')) {
        const invId = resolvedParams.path[resolvedParams.path.length - 2];
        const res = await dbBridge.cancelSupplierInvoice(invId, body.reason || 'Annulation manuelle', authUser);
        return NextResponse.json(res, { status: 200, headers: corsHeaders() });
      }
      if (clean.includes('/finance/supplier-invoices/') && clean.endsWith('/derogation')) {
        const invId = resolvedParams.path[resolvedParams.path.length - 2];
        const res = await dbBridge.approveSupplierInvoiceWithDerogation(invId, body.reason || 'Dérogation accordée', authUser);
        return NextResponse.json(res, { status: 200, headers: corsHeaders() });
      }
      if (clean.includes('/finance/supplier-invoices')) {
        const inv = await dbBridge.createSupplierInvoice(body, authUser);
        return NextResponse.json(inv, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/payments')) {
        const pay = await dbBridge.recordPayment(body);
        return NextResponse.json(pay, { status: 201, headers: corsHeaders() });
      }
      if (clean.includes('/finance/warranty-release')) {
        return NextResponse.json({ success: true, releasedAmount: 0 }, { headers: corsHeaders() });
      }
    } catch (err: any) {
      console.error('[API Gateway Finance Failure]', err);
      const isPersistence = err?.code === 'DB_PERSISTENCE_FAILED' || err?.message?.includes('DB_PERSISTENCE_FAILED');
      return NextResponse.json(
        {
          error: isPersistence ? 'PERSISTENCE_FAILED' : 'FINANCE_ERROR',
          message: err?.message || 'Erreur lors du traitement de l\'opération financière',
        },
        { status: 500, headers: corsHeaders() }
      );
    }
  }

  return NextResponse.json({ success: true, message: 'Action enregistrée' }, { headers: corsHeaders() });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  const clean = path.toLowerCase();

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }

  // 0. Porte d'authentification globale (voir GET).
  const gateAuthHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const gateUser = await parseUserFromToken(gateAuthHeader);
  if (!gateUser) {
    return NextResponse.json(
      { error: 'Authentification requise.' },
      { status: 401, headers: corsHeaders() }
    );
  }

  // 0.1 Isolation projet (voir GET/POST) : toute modification sous /projects/:code/...
  // (jalons, tâches, situations, contrat...) exige l'affectation du Chef de Projet.
  if (clean.startsWith('/projects/') && resolvedParams.path.length >= 2) {
    const scopedProjCode = resolvedParams.path[1];
    if (
      gateUser.role === PROJECT_SCOPED_ROLE &&
      !(await dbBridge.isUserAssignedToProject(gateUser.id, scopedProjCode))
    ) {
      return NextResponse.json(
        { error: 'Accès refusé : ce chantier ne vous est pas affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
  }

  // 0.5 Commercial PATCH actions
  if (clean.includes('/commercial/cost-sheets/') || clean.includes('/cost-sheets/')) {
    const sheetId = resolvedParams.path.find(p => p.startsWith('fc-') || p.startsWith('FC-')) || resolvedParams.path[2] || resolvedParams.path[1];
    const lastSeg = (resolvedParams.path[resolvedParams.path.length - 1] || '').toUpperCase();
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);

    if (['PROJECT', 'PROCUREMENT', 'HR', 'FINANCE'].includes(lastSeg)) {
      const res = await dbBridge.updateCostSheetContribution(sheetId, lastSeg as any, body, user);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
  }
  if (clean.includes('/commercial/opportunities/') || clean.includes('/opportunities/')) {
    const id = resolvedParams.path[resolvedParams.path.length - 1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    if (body.stage || body.newStage) {
      const updated = await dbBridge.updateOpportunityStage(id, body.stage || body.newStage, body, user);
      return NextResponse.json(updated, { headers: corsHeaders() });
    }
    const updated = await dbBridge.updateOpportunity(id, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 0.8 Procurement supplier status update
  if (clean.includes('/procurement/suppliers') && clean.includes('/status')) {
    const suppId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const res = await dbBridge.updateSupplierStatus(suppId, body.status, user);
    return NextResponse.json(res, { headers: corsHeaders() });
  }

  // 1. Milestones Update (/projects/:projectId/milestones/:milestoneId)
  if (clean.includes('/quality/non-conformities/')) {
    const ncId = resolvedParams.path[2] || resolvedParams.path[1];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const updated = await dbBridge.updateNonConformityStatus(ncId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/milestones/')) {
    const projCode = resolvedParams.path[1];
    const milestoneId = resolvedParams.path[3];
    const updated = await dbBridge.updateMilestone(projCode, milestoneId, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 2. Progress
  if (clean.includes('/progress')) {
    const projCode = resolvedParams.path[1];
    const updated = await dbBridge.updateProgress(
      projCode,
      Number(body.physicalProgress || 0),
      Number(body.financialProgress || 0),
    );
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 1.8 Module 02 Project PATCH subactions (Phase 3)
  if (clean.includes('/tasks/')) {
    const projCode = resolvedParams.path[1];
    const taskId = resolvedParams.path[3];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const updated = await dbBridge.updateProjectTask(projCode, taskId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/contract-items/')) {
    const projCode = resolvedParams.path[1];
    const itemId = resolvedParams.path[3];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const updated = await dbBridge.updateContractItem(projCode, itemId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/daily-reports/')) {
    const projCode = resolvedParams.path[1];
    const reportId = resolvedParams.path[3];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const updated = await dbBridge.updateDailyReport(projCode, reportId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/constraints/')) {
    const projCode = resolvedParams.path[1];
    const ctrId = resolvedParams.path[3];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const updated = await dbBridge.updateProjectConstraint(projCode, ctrId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }
  if (clean.includes('/hse-incidents/')) {
    const projCode = resolvedParams.path[1];
    const incidentId = resolvedParams.path[3];
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const updated = await dbBridge.updateHseIncident(projCode, incidentId, body, user);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 2. Project Update
  if (clean.startsWith('/projects/')) {
    const projCode = resolvedParams.path[1];
    if (gateUser.role === PROJECT_SCOPED_ROLE && !(await dbBridge.isUserAssignedToProject(gateUser.id, projCode))) {
      return NextResponse.json(
        { error: 'Accès refusé : ce chantier ne vous est pas affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
    const updated = await dbBridge.updateProject(projCode, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 3. User Update
  if (clean.startsWith('/users/')) {
    const userId = resolvedParams.path[1];
    const isSelf = gateUser?.id === userId;
    const attemptsPrivilegeChange = 'role' in body || 'active' in body || 'departmentCode' in body;
    if (!isSelf || attemptsPrivilegeChange) {
      const denied = requireRole(gateUser, USER_MANAGEMENT_ROLES);
      if (denied) return denied;
    }
    const updated = await dbBridge.updateUser(userId, body, gateUser);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  const clean = path.toLowerCase();

  // 0. Porte d'authentification globale (voir GET).
  const gateAuthHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
  const gateUser = await parseUserFromToken(gateAuthHeader);
  if (!gateUser) {
    return NextResponse.json(
      { error: 'Authentification requise.' },
      { status: 401, headers: corsHeaders() }
    );
  }

  // 0.1 Isolation projet (voir GET/POST/PATCH).
  if (clean.startsWith('/projects/') && resolvedParams.path.length >= 2) {
    const scopedProjCode = resolvedParams.path[1];
    if (
      gateUser.role === PROJECT_SCOPED_ROLE &&
      !(await dbBridge.isUserAssignedToProject(gateUser.id, scopedProjCode))
    ) {
      return NextResponse.json(
        { error: 'Accès refusé : ce chantier ne vous est pas affecté.' },
        { status: 403, headers: corsHeaders() }
      );
    }
  }

  if (clean.includes('/members')) {
    const projId = resolvedParams.path[1];
    const userId = resolvedParams.path[3];
    await dbBridge.removeMemberFromProject(projId, userId, null);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  }

  if (clean.startsWith('/users/')) {
    const denied = requireRole(gateUser, USER_MANAGEMENT_ROLES);
    if (denied) return denied;
    const userId = resolvedParams.path[1];
    await dbBridge.deleteUser(userId);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
