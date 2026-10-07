import { prisma } from "./prisma";
import { SectorType } from "@prisma/client";

export const SAMPLE_COMPANIES = [
  {
    name: "Atelier Rosa Bruidsmode & Styling",
    description: "Exclusieve trouw- en feeststyling met oog voor detail. Van ceremoniële bloemenbogen tot complete zaaldecoratie.",
    logoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.BRUILOFT,
    openForSectors: [SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST, SectorType.CATERING_HORECA],
    address: "Keizersgracht 420, Amsterdam",
    kvkNumber: "84729103",
    vatNumber: "NL847291032B01",
    products: [
      { name: "Ceremoniële Bloemenboog Deluxe", price: 450, isTop5: true, description: "Handgemaakte boog met seizoensbloemen en draperieën." },
      { name: "Tafelstyling Set (10 tafels)", price: 650, isTop5: true, description: "Kandelaars, lopers, bloemstukken en gepersonaliseerde menukaarten." },
      { name: "Bruidsboeket & Corsage Set", price: 175, isTop5: true, description: "Prachtig seizoensboeket met bijpassende corsages voor bruidegom en getuigen." },
      { name: "Welkomstbord & Schildersezel", price: 95, isTop5: true, description: "Gepersonaliseerd acryl of houten bord met bloemstuk." },
      { name: "Full-service Styling & Opbouw op locatie", price: 550, isTop5: true, description: "Complete ontzorging tijdens de op- en afbouw van de huwelijksdag." },
      { name: "Ringendoosje van Fluweel", price: 35, isTop5: false, description: "Luxe gegraveerd fluwelen doosje voor de ringen." }
    ]
  },
  {
    name: "Château Moments Fotografie",
    description: "Cinematische huwelijks- en portretfotografie met liefde voor spontane en emotionele momenten.",
    logoUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.BRUILOFT,
    openForSectors: [SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST, SectorType.ZAKELIJK_CORPORATE],
    address: "Singel 112, Utrecht",
    kvkNumber: "75839201",
    vatNumber: "NL758392011B01",
    products: [
      { name: "Complete Huwelijksreportage (8 uur)", price: 1650, isTop5: true, description: "Inclusief 400+ bewerkte hoge-resolutie foto's en online galerij." },
      { name: "Loveshoot / Pre-wedding Sessie", price: 295, isTop5: true, description: "Een ontspannen fotosessie vooraf op een locatie naar keuze." },
      { name: "Luxe Handgemaakt Leren Fotoalbum (30x30)", price: 420, isTop5: true, description: "Met lay-flat binding, dikke pagina's en bewaardoos." },
      { name: "Drone Luchtopnames van Locatie & Gasten", price: 250, isTop5: true, description: "Adembenemende luchtfoto's en 4K videobeelden van de trouwlocatie." },
      { name: "Sneak Peek Binnen 48 Uur (25 foto's)", price: 125, isTop5: true, description: "Direct de mooiste beelden om te delen met familie en vrienden." }
    ]
  },
  {
    name: "Lumina Stage & Sound Systems",
    description: "Professionele geluids-, licht- en podiumtechniek voor festivals, bruiloften en grote bedrijfsevenementen.",
    logoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.EVENEMENTEN_FEEST,
    openForSectors: [SectorType.EVENEMENTEN_FEEST, SectorType.BRUILOFT, SectorType.ZAKELIJK_CORPORATE],
    address: "Industrieweg 18, Rotterdam",
    kvkNumber: "64910283",
    vatNumber: "NL649102831B01",
    products: [
      { name: "Pro DJ Booth & Geluidsset (tot 350 gasten)", price: 850, isTop5: true, description: "Pioneer CDJ/DJM set met krachtige subwoofers en line-arrays." },
      { name: "Moving Head Lichtshow & Uplighting", price: 495, isTop5: true, description: "8x draadloze uplighters en 4x geautomatiseerde moving heads." },
      { name: "Sparkular Fonteinen & CO2 Kanon Effect", price: 320, isTop5: true, description: "Veilige koudvuur fonteinen (binnen toegestaan) voor spectaculaire climax." },
      { name: "Draadloze Shure Microfoonset (4 kanalen)", price: 180, isTop5: true, description: "Storingsvrije professionele microfoons voor speeches en zang." },
      { name: "Geluids- & Lichttechnicus op Locatie (6 uur)", price: 390, isTop5: true, description: "Ervaren technicus die de hele avond zorgt voor vlekkeloze show." }
    ]
  },
  {
    name: "FeestFabriek Event Styling & Photobooths",
    description: "De finishing touch voor elk feest: interactieve photobooths, spectaculaire ballonpilaren en lounge hoeken.",
    logoUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.EVENEMENTEN_FEEST,
    openForSectors: [SectorType.EVENEMENTEN_FEEST, SectorType.BRUILOFT, SectorType.CATERING_HORECA],
    address: "Willem de Zwijgerlaan 88, Den Haag",
    kvkNumber: "59382019",
    vatNumber: "NL593820192B01",
    products: [
      { name: "Retro Houten Photobooth met Onbeperkt Printen", price: 395, isTop5: true, description: "Inclusief props, digitaal gastenboek en online galerij." },
      { name: "LED Dansvloer Verlicht (20m²)", price: 650, isTop5: true, description: "Interactieve oplichtende dansvloertegels in elke gewenste kleur." },
      { name: "Organische Ballonboog XL (5 meter)", price: 275, isTop5: true, description: "Biologisch afbreekbare ballonnen in custom themakleuren." },
      { name: "Boho Loungehoek Meubelset (8 personen)", price: 340, isTop5: true, description: "Riet, kussens, velvet poefs en lage tafeltjes voor een knusse sfeer." },
      { name: "Champagnewand met Neon Letters", price: 210, isTop5: true, description: "Plek voor 96 glazen met een warme sfeerquote in led-neon." }
    ]
  },
  {
    name: "De Meesterbouwers & Kozijnen",
    description: "Vakkundige aannemers voor hoogwaardige renovaties, uitbouwen, kozijnen en interieurbouw.",
    logoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.BOUW_RENOVATIE,
    openForSectors: [SectorType.BOUW_RENOVATIE, SectorType.ZAKELIJK_CORPORATE],
    address: "Ambachtstraat 9, Eindhoven",
    kvkNumber: "48201928",
    vatNumber: "NL482019281B01",
    products: [
      { name: "Prefab Dakkapel Montage (4 meter breed)", price: 7850, isTop5: true, description: "Inclusief HR+++ glas, kunststof bekleding en binnenafwerking." },
      { name: "Luxe Schuifpui Kunststof Schüco (3 meter)", price: 4200, isTop5: true, description: "Met hefschuifmechanisme en inbraakwerend beslag SKG***." },
      { name: "Badkamerrenovatie Complete Ontzorging", price: 9500, isTop5: true, description: "Leidingwerk, inloopdouche, tegels en sanitair vakkundig geplaatst." },
      { name: "Stalen Binnendeur met Glazen Panelen", price: 1450, isTop5: true, description: "Zwart gecoat staal met taatsscharnieren en veiligheidsglas." },
      { name: "Bouwtechnische Inspectie & 3D Tekenpakket", price: 495, isTop5: true, description: "Volledige meting en 3D visualisaties van uw verbouwingsplannen." }
    ]
  },
  {
    name: "EcoHeat & Duurzaam Installatietechniek",
    description: "Gecertificeerde installateurs voor warmtepompen, vloerverwarming en slimme zonne-energiesystemen.",
    logoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.BOUW_RENOVATIE,
    openForSectors: [SectorType.BOUW_RENOVATIE, SectorType.ZAKELIJK_CORPORATE],
    address: "Energieweg 14, Breda",
    kvkNumber: "39102948",
    vatNumber: "NL391029482B01",
    products: [
      { name: "Hybride Warmtepomp (8kW) inclusief Installatie", price: 5400, isTop5: true, description: "Verlaagt gasverbruik tot wel 75%, inclusief subsidie-aanvraaghulp." },
      { name: "Infrezen Vloerverwarming Complete Woning (70m²)", price: 2850, isTop5: true, description: "Strak ingefreesd met 5-groeps verdeler en composiet buizen." },
      { name: "Zonnepanelen Installatie (10 panelen 440Wp)", price: 3950, isTop5: true, description: "Full black zonnepanelen met Enphase micro-omvormers en app." },
      { name: "Meterkast Upgrade naar 3-Fase", price: 890, isTop5: true, description: "Gereed voor inductiekoken, laadpaal en warmtepomp." },
      { name: "Slimme Zoneverwarming & Thermostaten Pakket", price: 620, isTop5: true, description: "Regel elke kamer individueel via je smartphone." }
    ]
  },
  {
    name: "Apex Corporate Branding & Standbouw",
    description: "B2B specialisten in beursstands, corporate identiteit, signing en exclusieve relatiegeschenken.",
    logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.ZAKELIJK_CORPORATE,
    openForSectors: [SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST, SectorType.CATERING_HORECA],
    address: "Zuidas Kennedylaan 100, Amsterdam",
    kvkNumber: "29103948",
    vatNumber: "NL291039481B01",
    products: [
      { name: "Modulaire Beursstand Complete Huur (18m²)", price: 3200, isTop5: true, description: "Strakke aluminium constructie, verlichte wanden en presentatiebalie." },
      { name: "Bedrukte Premium Relatiegeschenken Box (100 stuks)", price: 1450, isTop5: true, description: "Gepersonaliseerde waterflessen, notebooks en eco powerbanks." },
      { name: "Duurzame Textielframes met LED Verlichting", price: 780, isTop5: true, description: "Verwisselbare peesdoeken voor kantoor of beurs presentatie." },
      { name: "Roll-up Banners Deluxe Duo Set", price: 290, isTop5: true, description: "Stevige cassettes met krasvaste doeken en transporttas." },
      { name: "Brand Book & Visuele Huisstijl Gids", price: 1850, isTop5: true, description: "Typografie, kleurenpalet, logovarianten en templates voor social media." }
    ]
  },
  {
    name: "Gusto Delizioso Italiaanse Catering",
    description: "Authentieke Italiaanse catering met live cooking, walking dinners en feestelijke buffetten voor elk gezelschap.",
    logoUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80",
    primarySector: SectorType.CATERING_HORECA,
    openForSectors: [SectorType.CATERING_HORECA, SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST, SectorType.ZAKELIJK_CORPORATE],
    address: "Pannenhuisstraat 24, Utrecht",
    kvkNumber: "19203948",
    vatNumber: "NL192039482B01",
    products: [
      { name: "Live Pasta & Risotto Bar (vanaf 40 personen)", price: 1250, isTop5: true, description: "Verse pasta uit het parmezaanse kaaswiel door onze chef bereid." },
      { name: "Antipasti Grazing Table Deluxe (per meter)", price: 280, isTop5: true, description: "Prosciutto di Parma, truffelpecorino, olijven, focaccia en vijgen." },
      { name: "Walking Dinner 5-Gangen Culinaire Ervaring (p.p.)", price: 58, isTop5: true, description: "Vijf verfijnde gerechtjes uitgeserveerd in stijlvolle mini-schalen." },
      { name: "Mobiele Espresso & Cannoli Bar", price: 490, isTop5: true, description: "Inclusief barista, 200 kopjes Italiaanse koffie en verse Siciliaanse cannoli." },
      { name: "Traditionele Huisgemaakte Tiramisu Taart (25p)", price: 95, isTop5: true, description: "Met savoiardi, mascarpone en amaretto volgens familierecept." }
    ]
  }
];

export async function ensureSeedData() {
  const count = await prisma.company.count();
  if (count > 0) {
    return { count, message: "Database already contains companies." };
  }

  // Create a default system / demo user for companies
  let demoUser = await prisma.user.findFirst({
    where: { email: "marktplein-demo@antoniuscore.nl" }
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: "AntoniusCore Marktplein Demo",
        email: "marktplein-demo@antoniuscore.nl"
      }
    });
  }

  const createdCompanies = [];

  for (let i = 0; i < SAMPLE_COMPANIES.length; i++) {
    const sc = SAMPLE_COMPANIES[i];

    // Each company needs a unique user relation
    let user = await prisma.user.findFirst({
      where: { email: `partner-${i + 1}@antoniuscore.nl` }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: sc.name,
          email: `partner-${i + 1}@antoniuscore.nl`
        }
      });
    }

    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: sc.name,
        description: sc.description,
        logoUrl: sc.logoUrl,
        primarySector: sc.primarySector,
        openForSectors: sc.openForSectors,
        address: sc.address,
        kvkNumber: sc.kvkNumber,
        vatNumber: sc.vatNumber,
        products: {
          create: sc.products.map(p => ({
            name: p.name,
            price: p.price,
            description: p.description,
            isTop5: p.isTop5
          }))
        }
      },
      include: {
        products: true
      }
    });

    createdCompanies.push(company);
  }

  // Create curated cross-company Bundles
  const weddingStyling = createdCompanies.find(c => c.name.includes("Atelier Rosa"));
  const weddingPhoto = createdCompanies.find(c => c.name.includes("Château Moments"));
  const eventSound = createdCompanies.find(c => c.name.includes("Lumina Stage"));
  const eventStyling = createdCompanies.find(c => c.name.includes("FeestFabriek"));
  const builder = createdCompanies.find(c => c.name.includes("Meesterbouwers"));
  const ecoHeat = createdCompanies.find(c => c.name.includes("EcoHeat"));
  const catering = createdCompanies.find(c => c.name.includes("Gusto Delizioso"));
  const corporateBrand = createdCompanies.find(c => c.name.includes("Apex Corporate"));

  // 1. Droombruiloft Bundel
  if (weddingStyling && weddingPhoto) {
    const bundle1 = await prisma.bundle.create({
      data: {
        title: "Droombruiloft Totaalpakket (Styling & Fotografie)",
        description: "De perfecte synergie voor uw huwelijksdag: complete fotoreportage gecombineerd met luxueuze ceremoniële styling.",
        sector: SectorType.BRUILOFT,
        price: 2450,
        isPreMade: true,
        companies: {
          create: [
            { companyId: weddingStyling.id },
            { companyId: weddingPhoto.id }
          ]
        },
        items: {
          create: [
            { productId: weddingStyling.products[0].id },
            { productId: weddingStyling.products[1].id },
            { productId: weddingPhoto.products[0].id }
          ]
        }
      }
    });
  }

  // 2. Festival & Feest Bundel
  if (eventSound && eventStyling) {
    const bundle2 = await prisma.bundle.create({
      data: {
        title: "All-in-One Feest & Festival Sensatie",
        description: "DJ Booth, Moving Head lichtshow, verlichte LED dansvloer en retro photobooth voor een onvergetelijke avond.",
        sector: SectorType.EVENEMENTEN_FEEST,
        price: 1980,
        isPreMade: true,
        companies: {
          create: [
            { companyId: eventSound.id },
            { companyId: eventStyling.id }
          ]
        },
        items: {
          create: [
            { productId: eventSound.products[0].id },
            { productId: eventSound.products[1].id },
            { productId: eventStyling.products[0].id },
            { productId: eventStyling.products[1].id }
          ]
        }
      }
    });
  }

  // 3. Duurzaam Wonen Renovatie Bundel
  if (builder && ecoHeat) {
    const bundle3 = await prisma.bundle.create({
      data: {
        title: "Compleet Duurzaam & Energieneutraal Woningpakket",
        description: "Gecombineerde installatie van hybride warmtepomp, vloerverwarming én kunststof isolatiekozijnen.",
        sector: SectorType.BOUW_RENOVATIE,
        price: 11950,
        isPreMade: true,
        companies: {
          create: [
            { companyId: builder.id },
            { companyId: ecoHeat.id }
          ]
        },
        items: {
          create: [
            { productId: ecoHeat.products[0].id },
            { productId: ecoHeat.products[1].id },
            { productId: builder.products[1].id }
          ]
        }
      }
    });
  }

  // 4. Zakelijk Event & Catering Bundel
  if (corporateBrand && catering) {
    const bundle4 = await prisma.bundle.create({
      data: {
        title: "Corporate Kick-off & Italiaans Walking Dinner",
        description: "Versterk uw merk met een modulaire beursstand en verwen zakenrelaties met een 5-gangen live pasta buffet.",
        sector: SectorType.ZAKELIJK_CORPORATE,
        price: 4150,
        isPreMade: true,
        companies: {
          create: [
            { companyId: corporateBrand.id },
            { companyId: catering.id }
          ]
        },
        items: {
          create: [
            { productId: corporateBrand.products[0].id },
            { productId: catering.products[0].id },
            { productId: catering.products[1].id }
          ]
        }
      }
    });
  }

  // 5. Bruiloft Borrel & Bar Bundel
  if (weddingStyling && catering) {
    const bundle5 = await prisma.bundle.create({
      data: {
        title: "Romantische Receptie & Champagne Bar",
        description: "Styling van receptietafels gecombineerd met antipasti grazing table en mobiele espressobar.",
        sector: SectorType.CATERING_HORECA,
        price: 1350,
        isPreMade: true,
        companies: {
          create: [
            { companyId: weddingStyling.id },
            { companyId: catering.id }
          ]
        },
        items: {
          create: [
            { productId: weddingStyling.products[1].id },
            { productId: catering.products[1].id },
            { productId: catering.products[3].id }
          ]
        }
      }
    });
  }

  return { count: createdCompanies.length, message: "Seed data created successfully." };
}
