import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      company: {
        include: {
          openingHours: {
            orderBy: { dayOfWeek: "asc" },
          },
        },
      },
    },
  });

  if (!user?.company) {
    redirect("/dashboard/settings");
  }

  const otherCompanies = await prisma.company.findMany({
    where: { id: { not: user.company.id } },
    select: {
      id: true,
      name: true,
      slug: true,
      primarySector: true,
      city: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <ProfileClient
      initialCompany={user.company as any}
      otherCompanies={otherCompanies as any}
    />
  );
}
