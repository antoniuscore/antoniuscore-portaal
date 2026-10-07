import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      company: {
        include: {
          openingHours: {
            orderBy: { dayOfWeek: "asc" },
          },
        },
      },
    },
  });

  if (!user?.company) {
    return NextResponse.json({ error: "Geen bedrijf gekoppeld." }, { status: 404 });
  }

  // Also fetch all other companies so they can pick recommended/blacklisted partners
  const otherCompanies = await prisma.company.findMany({
    where: { id: { not: user.company.id } },
    select: { id: true, name: true, slug: true, primarySector: true, city: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ company: user.company, otherCompanies });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { company: true },
  });

  if (!user?.company) {
    return NextResponse.json({ error: "Geen bedrijf gekoppeld." }, { status: 404 });
  }

  const body = await req.json();
  const {
    city,
    address,
    websiteUrl,
    serviceRadiusKm,
    availableStaff,
    clientCapacityPerProduct,
    recommendedCompanies,
    blacklistedCompanies,
    openingHours,
  } = body;

  const updatedCompany = await prisma.company.update({
    where: { id: user.company.id },
    data: {
      city: city || null,
      address: address || null,
      websiteUrl: websiteUrl || null,
      serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : 30,
      availableStaff: availableStaff ? parseInt(availableStaff) : 1,
      clientCapacityPerProduct: clientCapacityPerProduct ? parseInt(clientCapacityPerProduct) : 5,
      recommendedCompanies: Array.isArray(recommendedCompanies) ? recommendedCompanies : [],
      blacklistedCompanies: Array.isArray(blacklistedCompanies) ? blacklistedCompanies : [],
    },
  });

  // Update opening hours if provided
  if (Array.isArray(openingHours)) {
    for (const oh of openingHours) {
      if (typeof oh.dayOfWeek === "number") {
        await prisma.openingHour.upsert({
          where: {
            companyId_dayOfWeek: {
              companyId: user.company.id,
              dayOfWeek: oh.dayOfWeek,
            },
          },
          update: {
            openTime: oh.openTime || "09:00",
            closeTime: oh.closeTime || "18:00",
            isClosed: Boolean(oh.isClosed),
          },
          create: {
            companyId: user.company.id,
            dayOfWeek: oh.dayOfWeek,
            openTime: oh.openTime || "09:00",
            closeTime: oh.closeTime || "18:00",
            isClosed: Boolean(oh.isClosed),
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true, company: updatedCompany });
}
