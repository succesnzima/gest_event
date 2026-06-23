import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifySuperAdminToken, getSuperAdminCookieValue } from '@/lib/superadmin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const cookieValue = await getSuperAdminCookieValue();
  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const data: any = {};

  if (typeof body.firstName === 'string') data.firstName = body.firstName;
  if (typeof body.lastName === 'string') data.lastName = body.lastName;
  if (typeof body.email === 'string') data.email = body.email || null;
  if (typeof body.phone === 'string') data.phone = body.phone;
  if (typeof body.status === 'string') data.status = body.status;

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
  }

  const participant = await prisma.participant.update({
    where: { id },
    data,
  });

  return NextResponse.json(participant);
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const cookieValue = await getSuperAdminCookieValue();
  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.participant.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
