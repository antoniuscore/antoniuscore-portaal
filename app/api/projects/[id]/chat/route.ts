import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getServerSession();

    let senderName = "Bezoeker / Partner";
    let senderCompanyId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { company: true },
      });
      if (user) {
        senderName = user.company?.name || user.name || "Partner";
        senderCompanyId = user.company?.id || null;
      }
    }

    const body = await req.json();
    const { content, recipientCompanyId, overrideSenderName } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Bericht kan niet leeg zijn." },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        projectId,
        content: content.trim(),
        senderName: overrideSenderName?.trim() || senderName,
        senderCompanyId,
        recipientCompanyId: recipientCompanyId || null,
      },
      include: {
        senderCompany: { select: { id: true, name: true, businessType: true } },
        recipientCompany: { select: { id: true, name: true, businessType: true } },
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("Fout bij opslaan chatbericht:", err);
    return NextResponse.json(
      { error: "Kan chatbericht niet verzenden." },
      { status: 500 }
    );
  }
}
