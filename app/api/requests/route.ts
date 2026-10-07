import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SectorType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, sector, companyId, companyIds, notes, items } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: "Naam en e-mailadres zijn verplicht." }, { status: 400 });
    }

    // Determine sector: fallback to ZAKELIJK_CORPORATE or provided sector
    const chosenSector = (sector && Object.values(SectorType).includes(sector))
      ? (sector as SectorType)
      : SectorType.ZAKELIJK_CORPORATE;

    // Collect distinct company IDs
    const targetCompanyIds: string[] = Array.from(
      new Set(
        [
          ...(Array.isArray(companyIds) ? companyIds : []),
          ...(companyId ? [companyId] : [])
        ].filter(Boolean)
      )
    );

    const customRequest = await prisma.customRequest.create({
      data: {
        customerName,
        customerEmail,
        sector: chosenSector,
        companies: targetCompanyIds.length > 0
          ? {
              create: targetCompanyIds.map(id => ({ companyId: id }))
            }
          : undefined
      },
      include: {
        companies: {
          include: {
            company: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, customRequest });
  } catch (error: any) {
    console.error("Error creating custom request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
