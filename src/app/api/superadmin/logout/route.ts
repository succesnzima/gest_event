import { NextResponse } from 'next/server';
import { SUPERADMIN_COOKIE_NAME } from '@/lib/superadmin';

function clearCookie() {
  const response = NextResponse.redirect('/superadmin/login');

  response.cookies.set({
    name: SUPERADMIN_COOKIE_NAME,
    value: '',
    path: '/',
    expires: new Date(0),
  });

  return response;
}

export async function GET() {
  return clearCookie();
}

export async function POST() {
  return clearCookie();
}
