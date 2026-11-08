import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { dbBridge } from '@/lib/db-bridge';

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
    const authHeader = req.headers.get('Authorization') || '';
    const match = authHeader.match(/silex_auth_token_([A-Z_]+)/);
    const role = (match ? match[1] : SystemRole.DIRECTEUR_GENERAL) as SystemRole;
    const user = await dbBridge.getUserByRole(role);
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

  // 5. Procurement (DA, BC, Fournisseurs)
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

    if (email) {
      const found = await dbBridge.getUserByEmail(email);
      if (found) role = found.role as SystemRole;
    }

    const user = await dbBridge.getUserByRole(role);
    const token = `silex_auth_token_${user.role}_${Date.now()}`;
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

  // 3. Projects
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

  // 1. Progress
  if (clean.includes('/progress')) {
    const projCode = resolvedParams.path[1];
    const updated = await dbBridge.updateProgress(
      projCode,
      Number(body.physicalProgress || 0),
      Number(body.financialProgress || 0),
    );
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 2. Project Update
  if (clean.startsWith('/projects/')) {
    const projCode = resolvedParams.path[1];
    const updated = await dbBridge.updateProject(projCode, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}

export async function DELETE() {
  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
