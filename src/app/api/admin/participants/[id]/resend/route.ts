import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import QRCode from 'qrcode';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  try {
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant introuvable' }, { status: 404 });
    }

    if (!participant.email) {
      return NextResponse.json({ error: "Participant n'a pas d'email" }, { status: 400 });
    }

    if (!participant.qrToken) {
      return NextResponse.json({ error: 'QR indisponible' }, { status: 400 });
    }

    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkin/${participant.qrToken}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    const from = process.env.RESEND_FROM || `no-reply@${new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost').hostname}`;

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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
