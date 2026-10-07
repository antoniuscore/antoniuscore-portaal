import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seedData";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  // Check if companies exist, otherwise seed the marketplace
  const companyCount = await prisma.company.count();
  if (companyCount === 0) {
    await ensureSeedData();
  }

  const [companies, allBundles] = await Promise.all([
    prisma.company.findMany({
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

  return <ShopClient initialCompanies={companies as any} allBundles={allBundles as any} />;
}
