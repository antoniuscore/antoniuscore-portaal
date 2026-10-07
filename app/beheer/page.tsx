import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectorType } from "@prisma/client";
import BeheerClient from "./BeheerClient";

export const dynamic = "force-dynamic";

export default async function BeheerPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // Zoek of maak gebruiker aan
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
          bundles: {
            include: {
              bundle: true,
            },
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
            bundles: {
              include: {
                bundle: true,
              },
            },
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
        description: "B2B partner op het AntoniusCore Marktplein.",
        primarySector: SectorType.ZAKELIJK_CORPORATE,
        openForSectors: [SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST],
        isMarketplaceVisible: true,
        products: {
          create: [
            {
              name: "Basis Dienstverlening Pakket",
              price: 250,
              isTop5: true,
              description: "Standaard professioneel servicepakket.",
            },
            {
              name: "Premium Consult & Uitvoering",
              price: 750,
              isTop5: true,
              description: "Uitgebreid projectadvies en begeleiding.",
            },
          ],
        },
        openingHours: {
          create: [
            { dayOfWeek: 1, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 2, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 3, openTime: "08:30", closeTime: "18:00", isClosed: false },
            { dayOfWeek: 4, openTime: "08:30", closeTime: "20:00", isClosed: false },
            { dayOfWeek: 5, openTime: "08:30", closeTime: "20:00", isClosed: false },
            { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
            { dayOfWeek: 0, openTime: "11:00", closeTime: "16:00", isClosed: true },
          ],
        },
      },
      include: {
        products: true,
        openingHours: true,
        reviews: true,
        bundles: {
          include: {
            bundle: true,
          },
        },
      },
    });
  }

  // Haal andere bedrijven op voor samenwerkingen en aanbevelingen
  const otherCompanies = await prisma.company.findMany({
    where: { id: { not: company.id } },
    select: {
      id: true,
      name: true,
      slug: true,
      primarySector: true,
      city: true,
      businessType: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <BeheerClient
      initialCompany={company as any}
      otherCompanies={otherCompanies as any}
      userEmail={session.user.email}
      userName={session.user.name || "Partner"}
    />
  );
}
