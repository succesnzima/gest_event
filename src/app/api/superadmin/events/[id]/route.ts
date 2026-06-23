import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifySuperAdminToken, getSuperAdminCookieValue } from '@/lib/superadmin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  const cookieValue = await getSuperAdminCookieValue();
  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Événement introuvable' },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const cookieValue = await getSuperAdminCookieValue();
  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const data: any = {
    title: body.title,
    description: body.description,
    location: body.location,
    organizerName: body.organizerName,
    organizerEmail: body.organizerEmail,
    organizerPhone: body.organizerPhone || null,
  };

  if (typeof body.capacity !== 'undefined') {
    data.capacity = Number(body.capacity);
  }
  if (body.eventDate) {
    data.eventDate = new Date(body.eventDate);
  }

  const event = await prisma.event.update({
    where: { id },
    data,
  });

  return NextResponse.json(event);
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const cookieValue = await getSuperAdminCookieValue();
  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  const { id } = await params;
  await prisma.event.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
