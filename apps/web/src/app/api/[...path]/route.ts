import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { serverStore } from '@/lib/server-store';

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
    const user = serverStore.getUserByRole(role);
    return NextResponse.json(user, { headers: corsHeaders() });
  }

  // 2. Users & Audit
  if (clean === '/users') {
    return NextResponse.json(serverStore.getUsers(), { headers: corsHeaders() });
  }
  if (clean.startsWith('/users/')) {
    const userId = resolvedParams.path[1];
    const user = serverStore.getUserById(userId);
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404, headers: corsHeaders() });
    return NextResponse.json(user, { headers: corsHeaders() });
  }
  if (clean.includes('/audit')) {
    return NextResponse.json(serverStore.getAuditLogs(), { headers: corsHeaders() });
  }

  // 3. Projects
  if (clean === '/projects/kpis') {
    return NextResponse.json(serverStore.getProjectKpis(), { headers: corsHeaders() });
  }
  if (clean.startsWith('/projects/')) {
    const code = resolvedParams.path[1];
    if (code === 'kpis') {
      return NextResponse.json(serverStore.getProjectKpis(), { headers: corsHeaders() });
    }
    const proj = serverStore.getProject(code);
    if (!proj) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json(proj, { headers: corsHeaders() });
  }
  if (clean === '/projects') {
    return NextResponse.json(serverStore.getProjects(), { headers: corsHeaders() });
  }

  // 4. Workflows (QCD Circuit)
  if (clean.includes('/workflows')) {
    const wfs = serverStore.getWorkflows();
    return NextResponse.json({ items: wfs, total: wfs.length }, { headers: corsHeaders() });
  }

  // 5. Procurement (DA, BC, Fournisseurs)
  if (clean.includes('/procurement/purchase-requests') || clean === '/procurement') {
    return NextResponse.json(serverStore.getPurchaseRequests(), { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-orders') || clean.includes('/purchase-orders')) {
    return NextResponse.json(serverStore.getPurchaseOrders(), { headers: corsHeaders() });
  }
  if (clean.includes('/procurement/suppliers') || clean.includes('/suppliers')) {
    return NextResponse.json(serverStore.getSuppliers(), { headers: corsHeaders() });
  }

  // 6. Inventory (Articles, Magasins, Mouvements)
  if (clean.includes('/inventory/warehouses') || clean.includes('/warehouses')) {
    return NextResponse.json(serverStore.getWarehouses(), { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/stock-movements') || clean.includes('/stock-movements')) {
    return NextResponse.json(serverStore.getStockMovements(), { headers: corsHeaders() });
  }
  if (clean.includes('/inventory/items') || clean.includes('/inventory')) {
    return NextResponse.json(serverStore.getInventoryItems(), { headers: corsHeaders() });
  }

  // 7. HR
  if (clean.includes('/hr/certifications')) {
    return NextResponse.json(serverStore.getCertifications(), { headers: corsHeaders() });
  }
  if (clean.includes('/hr/attendances')) {
    return NextResponse.json(serverStore.getAttendances(), { headers: corsHeaders() });
  }
  if (clean.includes('/hr/employees') || clean.includes('/employees') || clean === '/hr') {
    return NextResponse.json(serverStore.getEmployees(), { headers: corsHeaders() });
  }

  // 8. Fleet & Maintenance
  if (clean.includes('/fleet/maintenance-orders') || clean.includes('/maintenance/work-orders')) {
    return NextResponse.json(serverStore.getMaintenanceOrders(), { headers: corsHeaders() });
  }
  if (clean.includes('/fleet/assets') || clean.includes('/fleet') || clean.includes('/assets')) {
    return NextResponse.json(serverStore.getFleetAssets(), { headers: corsHeaders() });
  }

  // 9. Quality & QHSE
  if (clean.includes('/quality/documents')) {
    return NextResponse.json(serverStore.getQualityDocuments(), { headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities') || clean.includes('/quality')) {
    return NextResponse.json(serverStore.getNonConformities(), { headers: corsHeaders() });
  }

  // 10. Finance
  if (clean.includes('/finance/distribution')) {
    return NextResponse.json(serverStore.getCostDistribution(), { headers: corsHeaders() });
  }
  if (clean.includes('/finance/overview') || clean.includes('/finance')) {
    return NextResponse.json(serverStore.getFinanceOverview(), { headers: corsHeaders() });
  }

  // 11. Reports
  if (clean.includes('/reports')) {
    return NextResponse.json(serverStore.getProjectKpis(), { headers: corsHeaders() });
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
      const found = serverStore.getUserByEmail(email);
      if (found) role = found.role;
    }

    const user = serverStore.getUserByRole(role);
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
        avatarUrl: user.avatar,
        assignedProjects: user.assignedProjects || [],
        permissions: ['*'],
      },
    };

    return NextResponse.json(payload, { headers: corsHeaders() });
  }

  // 2. Users
  if (clean === '/users') {
    const newUser = serverStore.createUser(body);
    return NextResponse.json(newUser, { status: 201, headers: corsHeaders() });
  }

  // 3. Projects
  if (clean === '/projects') {
    const newProj = serverStore.createProject(body);
    return NextResponse.json(newProj, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/milestones')) {
    const projCode = resolvedParams.path[1];
    const mls = serverStore.addMilestone(projCode, body);
    return NextResponse.json(mls, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/service-orders')) {
    const projCode = resolvedParams.path[1];
    const ods = serverStore.addServiceOrder(projCode, body);
    return NextResponse.json(ods, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/work-situations')) {
    const projCode = resolvedParams.path[1];
    const sit = serverStore.addWorkSituation(projCode, body);
    return NextResponse.json(sit, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/members')) {
    const projCode = resolvedParams.path[1];
    const mbr = serverStore.addMember(projCode, body);
    return NextResponse.json(mbr, { status: 201, headers: corsHeaders() });
  }

  // 4. Workflows Decisions (Approve, Reject, Revise)
  if (clean.includes('/workflows/')) {
    const wfId = resolvedParams.path[1];
    const action = resolvedParams.path[2];
    if (action === 'approve') {
      const res = serverStore.approveWorkflow(wfId, body.notes);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'reject') {
      const res = serverStore.rejectWorkflow(wfId, body.reason);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'request-revision') {
      const res = serverStore.requestRevisionWorkflow(wfId, body.instructions);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
  }

  // 5. Procurement
  if (clean.includes('/procurement/purchase-requests') || clean === '/procurement') {
    const pr = serverStore.createPurchaseRequest(body);
    return NextResponse.json(pr, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/procurement/suppliers') || clean.includes('/suppliers')) {
    const supp = serverStore.createSupplier(body);
    return NextResponse.json(supp, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/procurement/purchase-orders') || clean.includes('/purchase-orders')) {
    const po = serverStore.createPurchaseOrder(body);
    return NextResponse.json(po, { status: 201, headers: corsHeaders() });
  }

  // 6. Inventory
  if (clean.includes('/inventory/warehouses') || clean.includes('/warehouses')) {
    const wh = serverStore.createWarehouse(body);
    return NextResponse.json(wh, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/inventory/stock-movements') || clean.includes('/stock-movements')) {
    const mvt = serverStore.recordStockMovement(body);
    return NextResponse.json(mvt, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/inventory/items') || clean.includes('/inventory')) {
    if (body.type && (body.type === 'ENTRY' || body.type === 'EXIT' || body.type === 'RECEPTION')) {
      const mvt = serverStore.recordStockMovement(body);
      return NextResponse.json(mvt, { status: 201, headers: corsHeaders() });
    }
    const item = serverStore.createInventoryItem(body);
    return NextResponse.json(item, { status: 201, headers: corsHeaders() });
  }

  // 7. HR
  if (clean.includes('/hr/employees') || clean.includes('/employees') || clean === '/hr') {
    const emp = serverStore.createEmployee(body);
    return NextResponse.json(emp, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/hr/certifications')) {
    const cert = serverStore.createCertification(body);
    return NextResponse.json(cert, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/hr/attendances')) {
    const att = serverStore.recordAttendance(body);
    return NextResponse.json(att, { status: 201, headers: corsHeaders() });
  }

  // 8. Fleet & Maintenance
  if (clean.includes('/fleet/assets') || clean.includes('/fleet') || clean.includes('/assets')) {
    const ast = serverStore.createFleetAsset(body);
    return NextResponse.json(ast, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/fleet/maintenance-orders') || clean.includes('/maintenance/work-orders')) {
    const ot = serverStore.createMaintenanceOrder(body);
    return NextResponse.json(ot, { status: 201, headers: corsHeaders() });
  }

  // 9. Quality & QHSE
  if (clean.includes('/quality/documents')) {
    const doc = serverStore.createQualityDocument(body);
    return NextResponse.json(doc, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/quality/non-conformities') || clean.includes('/quality')) {
    const nc = serverStore.createNonConformity(body);
    return NextResponse.json(nc, { status: 201, headers: corsHeaders() });
  }

  // 10. Finance
  if (clean.includes('/finance/payments')) {
    const pay = serverStore.recordPayment(body);
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
    const updated = serverStore.updateProgress(
      projCode,
      Number(body.physicalProgress || 0),
      Number(body.financialProgress || 0),
    );
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 2. Project Update
  if (clean.startsWith('/projects/')) {
    const projCode = resolvedParams.path[1];
    const updated = serverStore.updateProject(projCode, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // 3. User Update
  if (clean.startsWith('/users/')) {
    const userId = resolvedParams.path[1];
    const updated = serverStore.updateUser(userId, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
