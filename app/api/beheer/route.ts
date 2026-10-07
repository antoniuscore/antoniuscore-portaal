import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { SectorType } from "@prisma/client";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      company: {
        include: {
          products: {
            orderBy: [{ isTop5: "desc" }, { createdAt: "asc" }],
          },
          openingHours: {
            orderBy: { dayOfWeek: "asc" },
          },
          reviews: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: session.user.name ?? "Partner",
        email: session.user.email,
        image: session.user.image,
      },
      include: {
        company: {
          include: {
            products: true,
            openingHours: true,
            reviews: true,
          },
        },
      },
    });
  }

  let company = user.company;
  if (!company) {
    company = await prisma.company.create({
      data: {
        userId: user.id,
        name: session.user.name ? `${session.user.name} Onderneming` : "Mijn Onderneming",
        businessType: "Dienstverlener",
        description: "B2B partner aangesloten bij het AntoniusCore Marktplein.",
        primarySector: SectorType.ZAKELIJK_CORPORATE,
        openForSectors: [SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST],
        isMarketplaceVisible: true,
        products: {
          create: [
            { name: "Basis Pakket Dienstverlening", price: 250, isTop5: true, description: "Standaard professioneel servicepakket." },
            { name: "Premium Consult & Uitvoering", price: 750, isTop5: true, description: "Uitgebreid projectadvies en begeleiding." },
          ],
        },
        openingHours: {
          create: [
            { dayOfWeek: 1, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 2, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 3, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 4, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 5, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
            { dayOfWeek: 0, openTime: "10:00", closeTime: "16:00", isClosed: true },
          ],
        },
      },
      include: {
        products: true,
        openingHours: true,
        reviews: true,
      },
    });
  }

  const otherCompanies = await prisma.company.findMany({
    where: { id: { not: company.id } },
    select: { id: true, name: true, slug: true, primarySector: true, city: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, company, otherCompanies });
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
    return NextResponse.json({ error: "Geen bedrijf gevonden." }, { status: 404 });
  }

  const body = await req.json();
  const {
    name,
    businessType,
    googlePlaceId,
    description,
    logoUrl,
    websiteUrl,
    city,
    address,
    serviceRadiusKm,
    availableStaff,
    clientCapacityPerProduct,
    isMarketplaceVisible,
    primarySector,
    openForSectors,
    kvkNumber,
    vatNumber,
    recommendedCompanies,
    blacklistedCompanies,
    openingHours,
    products,
  } = body;

  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (businessType !== undefined) updateData.businessType = businessType || null;
  if (googlePlaceId !== undefined) updateData.googlePlaceId = googlePlaceId || null;
  if (description !== undefined) updateData.description = description || null;
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null;
  if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl || null;
  if (city !== undefined) updateData.city = city || null;
  if (address !== undefined) updateData.address = address || null;
  if (serviceRadiusKm !== undefined) updateData.serviceRadiusKm = parseInt(serviceRadiusKm) || 30;
  if (availableStaff !== undefined) updateData.availableStaff = parseInt(availableStaff) || 1;
  if (clientCapacityPerProduct !== undefined) updateData.clientCapacityPerProduct = parseInt(clientCapacityPerProduct) || 5;
  if (isMarketplaceVisible !== undefined) updateData.isMarketplaceVisible = Boolean(isMarketplaceVisible);
  if (primarySector !== undefined) updateData.primarySector = primarySector;
  if (Array.isArray(openForSectors)) updateData.openForSectors = openForSectors;
  if (kvkNumber !== undefined) updateData.kvkNumber = kvkNumber || null;
  if (vatNumber !== undefined) updateData.vatNumber = vatNumber || null;
  if (Array.isArray(recommendedCompanies)) updateData.recommendedCompanies = recommendedCompanies;
  if (Array.isArray(blacklistedCompanies)) updateData.blacklistedCompanies = blacklistedCompanies;

  const updatedCompany = await prisma.company.update({
    where: { id: user.company.id },
    data: updateData,
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

  // Update / create products if provided
  if (Array.isArray(products)) {
    for (const p of products) {
      if (p.id && !p.isNew) {
        if (p._delete) {
          await prisma.product.deleteMany({
            where: { id: p.id, companyId: user.company.id },
          });
        } else {
          await prisma.product.update({
            where: { id: p.id },
            data: {
              name: p.name,
              price: parseFloat(p.price) || 0,
              description: p.description || null,
              isTop5: Boolean(p.isTop5),
            },
          });
        }
      } else if (p.name && (p.isNew || !p.id)) {
        await prisma.product.create({
          data: {
            companyId: user.company.id,
            name: p.name,
            price: parseFloat(p.price) || 0,
            description: p.description || null,
            isTop5: Boolean(p.isTop5),
          },
        });
      }
    }
  }

  // Fetch fresh company data
  const freshCompany = await prisma.company.findUnique({
    where: { id: user.company.id },
    include: {
      products: { orderBy: [{ isTop5: "desc" }, { createdAt: "asc" }] },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json({ success: true, company: freshCompany });
}
