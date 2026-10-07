import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectorType } from "@prisma/client";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      company: {
        include: {
          products: {
            orderBy: [{ isTop5: "desc" }, { createdAt: "asc" }],
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
          },
        },
      },
    });
  }

  let company = user.company;

  if (!company) {
    // Create default starter company for the authenticated user
    company = await prisma.company.create({
      data: {
        userId: user.id,
        name: session.user.name ? `${session.user.name} Onderneming` : "Mijn Onderneming",
        description: "B2B partner op het AntoniusCore Marktplein.",
        primarySector: SectorType.ZAKELIJK_CORPORATE,
        openForSectors: [SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST],
        products: {
          create: [
            {
              name: "Basis Partner Dienstverlening",
              price: 350,
              isTop5: true,
              description: "Standaard professioneel servicepakket voor klanten.",
            },
            {
              name: "Luxe Totaalproject Begeleiding",
              price: 1250,
              isTop5: true,
              description: "Complete ontzorging en maatwerk advies.",
            },
          ],
        },
      },
      include: {
        products: {
          orderBy: [{ isTop5: "desc" }, { createdAt: "asc" }],
        },
      },
    });
  }

  return (
    <SettingsClient
      initialCompany={company as any}
      userEmail={session.user.email}
    />
  );
}
