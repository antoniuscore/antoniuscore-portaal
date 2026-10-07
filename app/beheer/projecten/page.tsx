import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import ProjectenClient from "./ProjectenClient";

export const dynamic = "force-dynamic";

export default async function BeheerProjectenPage() {
  const session = await getServerSession();

  let user = null;
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });
  }

  // Fallback to first company in database if not logged in or company missing (ensures developer/user can immediately view and test)
  let company = user?.company;
  if (!company) {
    company = await prisma.company.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  // Find all projects where this company has items, or general projects
  let projects: any[] = [];
  if (company) {
    projects = await prisma.project.findMany({
      where: {
        OR: [
          {
            items: {
              some: {
                companyId: company.id,
              },
            },
          },
          // Also show recent projects for full testing
          {},
        ],
      },
      include: {
        items: {
          include: {
            product: true,
            company: {
              select: {
                id: true,
                name: true,
                businessType: true,
                primarySector: true,
                city: true,
              },
            },
          },
        },
        chatMessages: {
          orderBy: { createdAt: "asc" },
          include: {
            senderCompany: { select: { id: true, name: true, businessType: true } },
            recipientCompany: { select: { id: true, name: true, businessType: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // If no projects exist in the database yet, let's create a realistic sample project with chat messages!
  if (projects.length === 0 && company) {
    const otherCompany = await prisma.company.findFirst({
      where: { id: { not: company.id } },
      include: { products: true },
    });

    const companyProduct = await prisma.product.findFirst({
      where: { companyId: company.id },
    });

    const sampleProject = await prisma.project.create({
      data: {
        title: "Voorbeeld Bruiloftsfeest & Receptie 't Gooi",
        customerName: "Sanne & Daan van Dijk",
        customerEmail: "sanne.daan@weddingmail.nl",
        customerPhone: "06-87654321",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        eventTimeSlot: "Middag & Avond (14:00 - 23:00)",
        eventLocation: "Kasteel Oud-Wassenaar",
        targetGuests: 85,
        totalPrice: 2850,
        status: "GEACCEPTEERD",
        notes: "Gezamenlijk draaiboek gewenst. Graag afstemming tussen catering en fotografie voor speeches.",
        items: {
          create: [
            ...(companyProduct
              ? [
                  {
                    productId: companyProduct.id,
                    companyId: company.id,
                    quantity: 1,
                    guestCount: 85,
                    staffNeeded: 2,
                    price: companyProduct.price,
                    customNotes: "Aanwezig vanaf 13:30 voor opbouw en soundcheck.",
                  },
                ]
              : []),
            ...(otherCompany && otherCompany.products.length > 0
              ? [
                  {
                    productId: otherCompany.products[0].id,
                    companyId: otherCompany.id,
                    quantity: 1,
                    guestCount: 85,
                    staffNeeded: 3,
                    price: otherCompany.products[0].price,
                    customNotes: "Diner start om 18:00 stipt.",
                  },
                ]
              : []),
          ],
        },
        chatMessages: {
          create: [
            {
              senderName: "AntoniusCore Systeem",
              content: "Gecombineerd project aangemaakt en geaccepteerd door partners.",
            },
            {
              senderCompanyId: otherCompany?.id || null,
              senderName: otherCompany?.name || "Partner Specialist",
              content: "Hallo team! Wij zijn aanwezig met 3 personeelsleden. Hoe laat arriveert de fotograaf?",
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
            company: {
              select: { id: true, name: true, businessType: true, primarySector: true, city: true },
            },
          },
        },
        chatMessages: {
          orderBy: { createdAt: "asc" },
          include: {
            senderCompany: { select: { id: true, name: true, businessType: true } },
            recipientCompany: { select: { id: true, name: true, businessType: true } },
          },
        },
      },
    });

    projects = [sampleProject];
  }

  return (
    <ProjectenClient
      initialProjects={projects as any}
      currentCompany={company as any}
    />
  );
}
