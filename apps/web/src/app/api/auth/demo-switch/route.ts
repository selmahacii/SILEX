import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { dbBridge } from '@/lib/db-bridge';
import { generateAuthToken } from '@/lib/auth-server';

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

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body empty or invalid json
    }

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
      return NextResponse.json(
        { error: 'Rôle démo introuvable' },
        { status: 404, headers: corsHeaders() }
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
        avatarUrl: user.avatarUrl || user.avatar || null,
        assignedProjects: user.assignedProjects || [],
        permissions: ['*'],
      },
    };

    return NextResponse.json(payload, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    console.error('[API AUTH DEMO SWITCH ERROR]', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne bascule profil démo' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
