import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { dbBridge } from '@/lib/db-bridge';

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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const match = authHeader.match(/silex_auth_token_([A-Z_]+)/);
    const role = (match ? match[1] : SystemRole.DIRECTEUR_GENERAL) as SystemRole;

    const user = await dbBridge.getUserByRole(role);
    if (!user) {
      return NextResponse.json(
        { error: 'Session introuvable' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(user, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    console.error('[API AUTH ME ERROR]', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur session utilisateur' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
