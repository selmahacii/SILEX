import { NextRequest, NextResponse } from 'next/server';
import { parseUserFromToken } from '@/lib/auth-server';

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
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const user = await parseUserFromToken(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Session introuvable ou jeton expiré' },
        { status: 401, headers: corsHeaders() }
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
