import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SectorType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, sector, companyId } = body;

    if (!customerName || !customerEmail || !sector) {
      return NextResponse.json({ error: "Naam, e-mail en sector zijn verplicht." }, { status: 400 });
    }

    const customRequest = await prisma.customRequest.create({
      data: {
        customerName,
        customerEmail,
        sector: sector as SectorType,
        companies: companyId
          ? {
              create: [{ companyId }]
            }
          : undefined
      }
    });

    return NextResponse.json({ success: true, customRequest });
  } catch (error: any) {
    console.error("Error creating custom request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
