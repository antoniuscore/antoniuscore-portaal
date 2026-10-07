import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { authorName, rating, comment } = body;

    if (!authorName || !rating) {
      return NextResponse.json(
        { error: "Naam en beoordeling (1-5 sterren) zijn verplicht." },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Bedrijf niet gevonden." }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        companyId: company.id,
        authorName,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
