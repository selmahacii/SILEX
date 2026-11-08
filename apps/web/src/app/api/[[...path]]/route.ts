import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { SYSTEM_USERS, mockStore } from '@/lib/mock-data';

// Helper CORS
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
    const user = SYSTEM_USERS[0];
    return NextResponse.json(user, { headers: corsHeaders() });
  }

  // 2. Users
  if (clean.includes('/users')) {
    return NextResponse.json(SYSTEM_USERS, { headers: corsHeaders() });
  }

  // 3. KPIs
  if (clean.includes('/kpis') || clean.includes('/stats')) {
    return NextResponse.json(mockStore.getKpis(), { headers: corsHeaders() });
  }

  // 4. Projects
  if (clean.startsWith('/projects/')) {
    const code = resolvedParams.path[1];
    if (code === 'kpis') {
      return NextResponse.json(mockStore.getKpis(), { headers: corsHeaders() });
    }
    const proj = mockStore.getProject(code);
    if (!proj) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json(proj, { headers: corsHeaders() });
  }
  if (clean === '/projects') {
    return NextResponse.json(mockStore.getProjects(), { headers: corsHeaders() });
  }

  // 5. Workflows
  if (clean.includes('/workflows')) {
    return NextResponse.json(mockStore.getWorkflows(), { headers: corsHeaders() });
  }

  // 6. Procurement (DA, BC, Fournisseurs)
  if (clean.includes('/suppliers')) {
    return NextResponse.json(mockStore.getSuppliers(), { headers: corsHeaders() });
  }
  if (clean.includes('/purchase-orders')) {
    return NextResponse.json(mockStore.getPurchaseOrders(), { headers: corsHeaders() });
  }
  if (clean.includes('/procurement')) {
    return NextResponse.json(mockStore.getProcurementRequests(), { headers: corsHeaders() });
  }

  // 7. Inventory (Articles, Magasins, Mouvements)
  if (clean.includes('/warehouses')) {
    return NextResponse.json(mockStore.getWarehouses(), { headers: corsHeaders() });
  }
  if (clean.includes('/stock-movements') || clean.includes('/movements')) {
    return NextResponse.json(mockStore.getStockMovements(), { headers: corsHeaders() });
  }
  if (clean.includes('/inventory') || clean.includes('/items')) {
    return NextResponse.json(mockStore.getInventoryItems(), { headers: corsHeaders() });
  }

  // 8. HR (Collaborateurs, Pointages, Certifications)
  if (clean.includes('/hr/certifications')) {
    return NextResponse.json([], { headers: corsHeaders() });
  }
  if (clean.includes('/hr/attendances')) {
    return NextResponse.json([], { headers: corsHeaders() });
  }
  if (clean.includes('/employees') || clean.includes('/hr')) {
    return NextResponse.json(mockStore.getEmployees(), { headers: corsHeaders() });
  }

  // 9. Parc & Maintenance
  if (clean.includes('/fleet') || clean.includes('/assets')) {
    return NextResponse.json(mockStore.getAssets(), { headers: corsHeaders() });
  }

  // 10. Qualité & QHSE
  if (clean.includes('/quality') || clean.includes('/non-conformities')) {
    return NextResponse.json(mockStore.getNonConformities(), { headers: corsHeaders() });
  }

  // 11. Finance
  if (clean.includes('/finance')) {
    const kpis = mockStore.getKpis();
    return NextResponse.json(
      {
        kpis,
        summary: {
          totalBilled: 0,
          totalCollected: 0,
          pendingCollection: 0,
          warrantyHeld: 0,
          treasuryBalance: 0,
        },
        distribution: [],
        projects: mockStore.getProjects(),
      },
      { headers: corsHeaders() },
    );
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

  // 1. Auth Login
  if (clean.includes('/auth/login') || clean.includes('/auth/demo-switch')) {
    const email = (body.email || '').toLowerCase().trim();
    let role = (body.role || SystemRole.DIRECTEUR_GENERAL) as SystemRole;

    if (email) {
      const found = SYSTEM_USERS.find(u => u.email.toLowerCase() === email);
      if (found) {
        role = found.role as SystemRole;
      }
    }

    const user = SYSTEM_USERS.find(u => u.role === role) || SYSTEM_USERS[0];
    const payload = {
      accessToken: 'silex_auth_token_' + user.role + '_' + Date.now(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentCode: user.departmentCode,
        title: user.title,
        assignedProjects: [],
        permissions: ['*'],
      },
    };

    return NextResponse.json(payload, { headers: corsHeaders() });
  }

  // 2. Projets
  if (clean === '/projects') {
    const newProj = mockStore.addProject(body);
    return NextResponse.json(newProj, { status: 201, headers: corsHeaders() });
  }

  // 3. Projets Actions (Jalons, ODS, Situations, Membres)
  if (clean.includes('/milestones')) {
    const projId = resolvedParams.path[1];
    const updated = mockStore.addMilestone(projId, body);
    return NextResponse.json(updated, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/service-orders')) {
    const projId = resolvedParams.path[1];
    const updated = mockStore.addServiceOrder(projId, body);
    return NextResponse.json(updated, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/work-situations')) {
    const projId = resolvedParams.path[1];
    const updated = mockStore.addWorkSituation(projId, body);
    return NextResponse.json(updated, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/members')) {
    const projId = resolvedParams.path[1];
    const updated = mockStore.addMember(projId, body);
    return NextResponse.json(updated, { status: 201, headers: corsHeaders() });
  }

  // 4. Workflows Decisions (Approve, Reject, Revision)
  if (clean.includes('/workflows/')) {
    const wfId = resolvedParams.path[1];
    const action = resolvedParams.path[2];
    if (action === 'approve') {
      const res = mockStore.approveWorkflow(wfId, body.notes);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'reject') {
      const res = mockStore.rejectWorkflow(wfId, body.reason);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
    if (action === 'request-revision') {
      const res = mockStore.requestRevisionWorkflow(wfId, body.instructions);
      return NextResponse.json(res, { headers: corsHeaders() });
    }
  }

  // 5. Procurement
  if (clean.includes('/procurement')) {
    const pr = mockStore.createProcurementRequest(body);
    return NextResponse.json(pr, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/suppliers')) {
    const s = mockStore.addSupplier(body);
    return NextResponse.json(s, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/purchase-orders')) {
    const po = mockStore.createPurchaseOrder(body);
    return NextResponse.json(po, { status: 201, headers: corsHeaders() });
  }

  // 6. Stocks
  if (clean.includes('/warehouses')) {
    const wh = mockStore.addWarehouse(body);
    return NextResponse.json(wh, { status: 201, headers: corsHeaders() });
  }
  if (clean.includes('/inventory') || clean.includes('/items')) {
    if (body.type && (body.type === 'ENTRY' || body.type === 'EXIT')) {
      const mov = mockStore.addInventoryMovement(body);
      return NextResponse.json(mov, { status: 201, headers: corsHeaders() });
    }
    const item = mockStore.addInventoryItem(body);
    return NextResponse.json(item, { status: 201, headers: corsHeaders() });
  }

  // 7. RH
  if (clean.includes('/employees') || clean.includes('/hr')) {
    const emp = mockStore.addEmployee(body);
    return NextResponse.json(emp, { status: 201, headers: corsHeaders() });
  }

  // 8. Maintenance & Parc
  if (clean.includes('/fleet') || clean.includes('/assets')) {
    const ast = mockStore.addAsset(body);
    return NextResponse.json(ast, { status: 201, headers: corsHeaders() });
  }

  // 9. Qualité
  if (clean.includes('/quality') || clean.includes('/non-conformities')) {
    const nc = mockStore.addNonConformity(body);
    return NextResponse.json(nc, { status: 201, headers: corsHeaders() });
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

  // Avancement projet
  if (clean.includes('/progress')) {
    const projId = resolvedParams.path[1];
    const updated = mockStore.adjustProgress(
      projId,
      Number(body.physicalProgress || 0),
      Number(body.financialProgress || 0),
    );
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  // Modification générale projet
  if (clean.startsWith('/projects/')) {
    const projId = resolvedParams.path[1];
    const updated = mockStore.updateProject(projId, body);
    return NextResponse.json(updated, { headers: corsHeaders() });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
