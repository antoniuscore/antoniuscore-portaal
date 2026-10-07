import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seedData";
import StardewMarket, { CompanyWithMarketData, BundleItemDetail } from "./components/StardewMarket";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession();

  // If database has no companies, populate with realistic initial marketplace seed data
  const companyCount = await prisma.company.count();
  if (companyCount === 0) {
    await ensureSeedData();
  }

  // Haal alleen bedrijven op uit de database die actieve producten beschikbaar hebben
  const [companiesWithProducts, allBundles] = await Promise.all([
    prisma.company.findMany({
      where: {
        products: {
          some: {},
        },
      },
      include: {
        products: {
          orderBy: [{ isTop5: "desc" }, { createdAt: "asc" }],
        },
        bundles: {
          include: {
            bundle: {
              include: {
                companies: {
                  include: {
                    company: {
                      select: {
                        id: true,
                        name: true,
                        primarySector: true,
                      },
                    },
                  },
                },
                items: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                        price: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.bundle.findMany({
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                primarySector: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return (
    <StardewMarket
      companies={companiesWithProducts as unknown as CompanyWithMarketData[]}
      allBundles={allBundles as unknown as BundleItemDetail[]}
      isLoggedIn={Boolean(session?.user)}
      userName={session?.user?.name}
    />
  );
}