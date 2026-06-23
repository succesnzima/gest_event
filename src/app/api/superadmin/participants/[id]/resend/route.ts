import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import QRCode from 'qrcode';
import { verifySuperAdminToken, getSuperAdminCookieValue } from '@/lib/superadmin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
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
  const participant = await prisma.participant.findUnique({
    where: { id },
    include: { event: true },
  });

  if (!participant || !participant.email) {
    return NextResponse.json(
      { error: 'Participant introuvable ou sans email' },
      { status: 404 }
    );
  }

  if (!participant.qrToken) {
    return NextResponse.json(
      { error: 'QR indisponible' },
      { status: 400 }
    );
  }

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkin/${participant.qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl);
  const from = process.env.RESEND_FROM || `no-reply@${new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').hostname}`;

  await resend.emails.send({
    from,
    to: participant.email,
    subject: `Votre QR pour ${participant.event?.title ?? 'l\'événement'}`,
    html: `
      <p>Bonjour ${participant.firstName},</p>
      <p>Voici votre QR pour <strong>${participant.event?.title ?? 'l\'événement'}</strong> :</p>
      <p><a href="${qrUrl}">${qrUrl}</a></p>
      <p><img src="${qrDataUrl}" alt="QR code" /></p>
    `,
  });

  return NextResponse.json({ success: true });
}
