import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(ProjectStatus).includes(status)) {
      return NextResponse.json({ error: "Ongeldige status" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    console.error("Fout bij bijwerken projectstatus:", err);
    return NextResponse.json(
      { error: "Kan status niet bijwerken" },
      { status: 500 }
    );
  }
}
