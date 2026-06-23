import { NextResponse } from 'next/server';
import {
  isSuperAdminCredentials,
  createSuperAdminToken,
  SUPERADMIN_COOKIE_NAME,
} from '@/lib/superadmin';

export async function POST(request: Request) {
  const body = await request.json();
  const login = String(body.login || '');
  const password = String(body.password || '');

  if (!isSuperAdminCredentials(login, password)) {
    return NextResponse.json(
      { error: 'Identifiants invalides' },
      { status: 401 }
    );
  }

  const token = createSuperAdminToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: SUPERADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
