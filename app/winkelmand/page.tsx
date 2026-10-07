import { prisma } from "@/lib/prisma";
import WinkelmandClient from "./WinkelmandClient";

export const dynamic = "force-dynamic";

export default async function WinkelmandPage() {
  // Preload company & product catalog details so cart can hydrate full staffing rules
  const companies = await prisma.company.findMany({
    include: {
      products: true,
      openingHours: true,
    },
  });

  return <WinkelmandClient initialCompanies={companies as any} />;
}
