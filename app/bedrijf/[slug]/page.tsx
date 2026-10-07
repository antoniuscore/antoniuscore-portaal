import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompanyDetailClient from "./CompanyDetailClient";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
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
                      slug: true,
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
      openingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  // Fetch recommended partners if company has any
  let recommendedPartners: any[] = [];
  if (company.recommendedCompanies && company.recommendedCompanies.length > 0) {
    recommendedPartners = await prisma.company.findMany({
      where: {
        id: { in: company.recommendedCompanies },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        primarySector: true,
        city: true,
      },
    });
  }

  return (
    <CompanyDetailClient
      company={company as any}
      recommendedPartners={recommendedPartners}
    />
  );
}
