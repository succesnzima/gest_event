import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event = await prisma.event.create({
      data: {
        title: body.nom,
        description: body.description,
        location: body.lieu,
        eventDate: new Date(`${body.date}T${body.heure}:00`),
        capacity: Number(body.max_participants),
        organizerName: body.nom_organisateur,
        organizerEmail: body.email_organisateur,
        organizerPhone: body.telephone_organisateur || null,
        adminToken: crypto.randomUUID(),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erreur lors du chargement de l'événement",
      },
      {
        status: 500,
      }
    );
  }
}