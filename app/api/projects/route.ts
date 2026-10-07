import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { company: true },
  });

  if (!user?.company) {
    return NextResponse.json({ error: "Geen bedrijf gekoppeld" }, { status: 404 });
  }

  // Find all projects where this company has items
  const projects = await prisma.project.findMany({
    where: {
      items: {
        some: {
          companyId: user.company.id,
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
          company: {
            select: { id: true, name: true, businessType: true, primarySector: true, city: true },
          },
        },
      },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        include: {
          senderCompany: { select: { id: true, name: true, businessType: true } },
          recipientCompany: { select: { id: true, name: true, businessType: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, projects, currentCompany: user.company });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      eventTimeSlot,
      eventLocation,
      targetGuests,
      notes,
      items,
    } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Naam en e-mailadres van de klant zijn verplicht." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "De winkelmand bevat geen diensten of producten." },
        { status: 400 }
      );
    }

    const calculatedTotal = items.reduce((acc: number, it: any) => {
      const p = parseFloat(it.price) || 0;
      const q = parseInt(it.quantity) || 1;
      return acc + p * q;
    }, 0);

    const project = await prisma.project.create({
      data: {
        title: `Projectaanvraag ${customerName} (${eventLocation || "Nederland"})`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : null,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventTimeSlot: eventTimeSlot || null,
        eventLocation: eventLocation ? eventLocation.trim() : null,
        targetGuests: targetGuests ? parseInt(targetGuests) : 50,
        totalPrice: calculatedTotal,
        notes: notes ? notes.trim() : null,
        status: "AANGEVRAAGD",
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            companyId: it.companyId,
            quantity: parseInt(it.quantity) || 1,
            guestCount: it.guestCount ? parseInt(it.guestCount) : targetGuests ? parseInt(targetGuests) : 50,
            staffNeeded: it.staffNeeded ? parseInt(it.staffNeeded) : 1,
            price: parseFloat(it.price) || 0,
            customNotes: it.customNotes || null,
          })),
        },
        chatMessages: {
          create: {
            senderName: "AntoniusCore Systeem",
            content: `Nieuwe gecombineerde aanvraag ingediend door ${customerName} voor ${
              eventDate ? new Date(eventDate).toLocaleDateString("nl-NL") : "Nader te bepalen datum"
            }${eventTimeSlot ? ` (${eventTimeSlot})` : ""}. Welkom in de projecten-chat!`,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
            company: { select: { id: true, name: true, businessType: true } },
          },
        },
        chatMessages: true,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error("Fout bij aanmaken project:", err);
    return NextResponse.json(
      { error: err.message || "Er is een fout opgetreden bij het indienen van de aanvraag." },
      { status: 500 }
    );
  }
}
