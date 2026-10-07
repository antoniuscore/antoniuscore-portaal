import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { SectorType } from "@prisma/client";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  // Find or create user in DB
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

  // If user has no company yet, create initial default company
  if (!user.company) {
    const newCompany = await prisma.company.create({
      data: {
        userId: user.id,
        name: session.user.name ? `${session.user.name} Onderneming` : "Mijn Onderneming",
        description: "B2B partner aangesloten bij AntoniusCore marktplein.",
        primarySector: SectorType.ZAKELIJK_CORPORATE,
        openForSectors: [SectorType.ZAKELIJK_CORPORATE],
        products: {
          create: [
            { name: "Basis Dienstverlening Pakket", price: 250, isTop5: true, description: "Standaard professioneel servicepakket." },
            { name: "Premium Consult & Uitvoering", price: 750, isTop5: true, description: "Uitgebreid projectadvies en begeleiding." }
          ]
        }
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json({ company: newCompany });
  }

  return NextResponse.json({ company: user.company });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      companyId,
      name,
      description,
      address,
      kvkNumber,
      vatNumber,
      primarySector,
      openForSectors,
      products,
      newProducts,
    } = body;

    // Validate that openForSectors is valid SectorType array
    const validSectors = Object.values(SectorType);
    const filteredOpenSectors: SectorType[] = (openForSectors || []).filter((s: any) =>
      validSectors.includes(s)
    );

    // Validate top 5 count
    const top5Count = (products || []).filter((p: any) => p.isTop5).length +
      (newProducts || []).filter((p: any) => p.isTop5).length;

    if (top5Count > 5) {
      return NextResponse.json(
        { error: "Je mag maximaal 5 producten als Top 5 selecteren." },
        { status: 400 }
      );
    }

    // Update Company details
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        description,
        address,
        kvkNumber,
        vatNumber,
        primarySector: primarySector as SectorType,
        openForSectors: filteredOpenSectors,
      },
    });

    // Update existing products isTop5 status
    if (products && Array.isArray(products)) {
      for (const prod of products) {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            isTop5: Boolean(prod.isTop5),
            name: prod.name,
            price: parseFloat(prod.price),
            description: prod.description,
          },
        });
      }
    }

    // Create any new products
    if (newProducts && Array.isArray(newProducts)) {
      for (const newP of newProducts) {
        if (newP.name && newP.price) {
          await prisma.product.create({
            data: {
              companyId,
              name: newP.name,
              price: parseFloat(newP.price),
              description: newP.description || "",
              isTop5: Boolean(newP.isTop5),
            },
          });
        }
      }
    }

    // Re-fetch company with updated products
    const finalCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        products: {
          orderBy: [{ isTop5: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json({ success: true, company: finalCompany });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
