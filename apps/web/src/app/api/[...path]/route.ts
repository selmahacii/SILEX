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

  // 1. Auth Me
  if (clean.includes('/auth/me')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    if (!user) {
      return NextResponse.json(
        { error: 'Session introuvable ou jeton expiré' },
        { status: 401, headers: corsHeaders() }
      );
    }
    return NextResponse.json(user, { headers: corsHeaders() });
  }

  // 2. Users & Audit
  if (clean === '/users') {
    const users = await dbBridge.getUsers();
    return NextResponse.json(users, { headers: corsHeaders() });
  }
  if (clean.includes('/audit')) {
    const logs = await dbBridge.getAuditLogs();
    return NextResponse.json(logs, { headers: corsHeaders() });
  }
  if (clean === '/admin/rbac') {
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
    const proj = await dbBridge.getProject(code);
    if (!proj) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json(proj, { headers: corsHeaders() });
  }
  if (clean === '/projects') {
    const projects = await dbBridge.getProjects();
    return NextResponse.json(projects, { headers: corsHeaders() });
  }

  // 4. Workflows (QCD Circuit)
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
    const rfqs = await dbBridge.getRfqConsultations(projId);
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

  // 5. Procurement (DA, BC, Fournisseurs)
  if (clean.includes('/procurement/purchase-requests/') && resolvedParams.path.length >= 3) {
    const prId = resolvedParams.path[2];
    const pr = await dbBridge.getPurchaseRequest(prId);
    if (!pr) {
      return NextResponse.json({ error: 'Demande d\'Achat introuvable' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json(pr, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-requests') || clean === '/procurement') {
    const prs = await dbBridge.getPurchaseRequests();
    return NextResponse.json(prs, { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-orders') || clean.includes('/purchase-orders')) {
    const pos = await dbBridge.getPurchaseOrders();
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

  // 9. Quality & QHSE
  if (clean.includes('/quality/documents')) {
    const docs = await dbBridge.getQualityDocuments();
    return NextResponse.json(docs, { headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities') || clean.includes('/quality')) {
    const ncs = await dbBridge.getNonConformities();
    return NextResponse.json(ncs, { headers: corsHeaders() });
  }

  // 10. Finance
  if (clean.includes('/finance/distribution')) {
    const dist = await dbBridge.getCostDistribution();
    return NextResponse.json(dist, { headers: corsHeaders() });
  }
  if (clean.includes('/finance/overview') || clean.includes('/finance')) {
    const fin = await dbBridge.getFinanceOverview();
    return NextResponse.json(fin, { headers: corsHeaders() });
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

  // 1. Auth (Demo Switch & Login)
  if (clean.includes('/auth/login') || clean.includes('/auth/demo-switch')) {
    const email = (body.email || '').toLowerCase().trim();
    let role = (body.role || SystemRole.DIRECTEUR_GENERAL) as SystemRole;

    let user: any = null;
    if (email) {
      user = await dbBridge.getUserByEmail(email);
    }
    if (!user) {
      user = await dbBridge.getUserByRole(role);
    }
    if (!user) {
      user = {
        id: 'usr-dg-001',
        email: email || 'a.benali@silex-services.dz',
        name: 'Amine Benali',
        role: role || SystemRole.DIRECTEUR_GENERAL,
        departmentCode: 'DIRECTION_GENERALE',
        title: 'Directeur Général',
      };
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
    const newUser = await dbBridge.createUser(body);
    return NextResponse.json(newUser, { status: 201, headers: corsHeaders() });
  }
  if (clean === '/admin/rbac') {
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
  if (clean.includes('/inventory/goods-receipts') || clean.includes('/procurement/goods-receipts')) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);
    const gr = await dbBridge.recordGoodsReceipt(body, user);
    return NextResponse.json(gr, { status: 201, headers: corsHeaders() });
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

  // 9. Quality & QHSE
  if (clean.includes('/quality/documents')) {
    const doc = await dbBridge.createQualityDocument(body);
    return NextResponse.json(doc, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities') || clean.includes('/quality')) {
    const nc = await dbBridge.createNonConformity(body);
    return NextResponse.json(nc, { status: 201, headers: corsHeaders() });
  }

  // 10. Finance
  if (clean.includes('/finance/payments')) {
    const pay = await dbBridge.recordPayment(body);
    return NextResponse.json(pay, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/finance/warranty-release')) {
    return NextResponse.json({ success: true, releasedAmount: 0 }, { headers: corsHeaders() });
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
    const updated = await dbBridge.updateProject(projCode, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 3. User Update
  if (clean.startsWith('/users/')) {
    const userId = resolvedParams.path[1];
    const updated = await dbBridge.updateUser(userId, body);
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

  if (clean.includes('/members')) {
    const projId = resolvedParams.path[1];
    const userId = resolvedParams.path[3];
    await dbBridge.removeMemberFromProject(projId, userId, null);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  }

  if (clean.startsWith('/users/')) {
    const userId = resolvedParams.path[1];
    await dbBridge.deleteUser(userId);
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
