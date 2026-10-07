import { prisma } from "./prisma";
import { SectorType } from "@prisma/client";

export const SAMPLE_COMPANIES = [
  {
    slug: "atelier-rosa-bruidsmode",
    name: "Atelier Rosa Bruidsmode & Styling",
    description: "Exclusieve trouw- en feeststyling met oog voor detail. Van ceremoniële bloemenbogen tot complete zaaldecoratie.",
    logoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://atelier-rosa.nl",
    city: "Amsterdam",
    address: "Keizersgracht 420, Amsterdam",
    latitude: 52.3702,
    longitude: 4.8952,
    serviceRadiusKm: 45,
    availableStaff: 4,
    clientCapacityPerProduct: 3,
    isMarketplaceVisible: true,
    primarySector: SectorType.BRUILOFT,
    openForSectors: [SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST, SectorType.CATERING_HORECA],
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
    slug: "chateau-moments-fotografie",
    name: "Château Moments Fotografie",
    description: "Cinematische huwelijks- en portretfotografie met liefde voor spontane en emotionele momenten.",
    logoUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://chateaumoments.nl",
    city: "Utrecht",
    address: "Singel 112, Utrecht",
    latitude: 52.0907,
    longitude: 5.1214,
    serviceRadiusKm: 60,
    availableStaff: 2,
    clientCapacityPerProduct: 2,
    isMarketplaceVisible: true,
    primarySector: SectorType.BRUILOFT,
    openForSectors: [SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST, SectorType.ZAKELIJK_CORPORATE],
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
    slug: "lumina-stage-sound",
    name: "Lumina Stage & Sound Systems",
    description: "Professionele geluids-, licht- en podiumtechniek voor festivals, bruiloften en grote bedrijfsevenementen.",
    logoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://lumina-events.nl",
    city: "Rotterdam",
    address: "Industrieweg 18, Rotterdam",
    latitude: 51.9244,
    longitude: 4.4777,
    serviceRadiusKm: 80,
    availableStaff: 6,
    clientCapacityPerProduct: 5,
    isMarketplaceVisible: true,
    primarySector: SectorType.EVENEMENTEN_FEEST,
    openForSectors: [SectorType.EVENEMENTEN_FEEST, SectorType.BRUILOFT, SectorType.ZAKELIJK_CORPORATE],
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
    slug: "feestfabriek-styling",
    name: "FeestFabriek Event Styling & Photobooths",
    description: "De finishing touch voor elk feest: interactieve photobooths, spectaculaire ballonpilaren en lounge hoeken.",
    logoUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://feestfabriek.nl",
    city: "Den Haag",
    address: "Willem de Zwijgerlaan 88, Den Haag",
    latitude: 52.0705,
    longitude: 4.3007,
    serviceRadiusKm: 40,
    availableStaff: 4,
    clientCapacityPerProduct: 4,
    isMarketplaceVisible: true,
    primarySector: SectorType.EVENEMENTEN_FEEST,
    openForSectors: [SectorType.EVENEMENTEN_FEEST, SectorType.BRUILOFT, SectorType.CATERING_HORECA],
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
    slug: "meesterbouwers-kozijnen",
    name: "De Meesterbouwers & Kozijnen",
    description: "Vakkundige aannemers voor hoogwaardige renovaties, uitbouwen, kozijnen en interieurbouw.",
    logoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://meesterbouwers.nl",
    city: "Eindhoven",
    address: "Ambachtstraat 9, Eindhoven",
    latitude: 51.4416,
    longitude: 5.4697,
    serviceRadiusKm: 50,
    availableStaff: 12,
    clientCapacityPerProduct: 8,
    isMarketplaceVisible: true,
    primarySector: SectorType.BOUW_RENOVATIE,
    openForSectors: [SectorType.BOUW_RENOVATIE, SectorType.ZAKELIJK_CORPORATE],
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
    slug: "ecoheat-installaties",
    name: "EcoHeat & Duurzaam Installatietechniek",
    description: "Gecertificeerde installateurs voor warmtepompen, vloerverwarming en slimme zonne-energiesystemen.",
    logoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://ecoheat-duurzaam.nl",
    city: "Breda",
    address: "Energieweg 14, Breda",
    latitude: 51.5719,
    longitude: 4.7683,
    serviceRadiusKm: 45,
    availableStaff: 8,
    clientCapacityPerProduct: 6,
    isMarketplaceVisible: true,
    primarySector: SectorType.BOUW_RENOVATIE,
    openForSectors: [SectorType.BOUW_RENOVATIE, SectorType.ZAKELIJK_CORPORATE],
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
    slug: "apex-branding-standbouw",
    name: "Apex Corporate Branding & Standbouw",
    description: "B2B specialisten in beursstands, corporate identiteit, signing en exclusieve relatiegeschenken.",
    logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://apex-corporate.nl",
    city: "Amsterdam",
    address: "Zuidas Kennedylaan 100, Amsterdam",
    latitude: 52.34,
    longitude: 4.87,
    serviceRadiusKm: 100,
    availableStaff: 5,
    clientCapacityPerProduct: 4,
    isMarketplaceVisible: true,
    primarySector: SectorType.ZAKELIJK_CORPORATE,
    openForSectors: [SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST, SectorType.CATERING_HORECA],
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
    slug: "gusto-delizioso-catering",
    name: "Gusto Delizioso Italiaanse Catering",
    description: "Authentieke Italiaanse catering met live cooking, walking dinners en feestelijke buffetten voor elk gezelschap.",
    logoUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://gustodelizioso.nl",
    city: "Utrecht",
    address: "Pannenhuisstraat 24, Utrecht",
    latitude: 52.08,
    longitude: 5.11,
    serviceRadiusKm: 55,
    availableStaff: 9,
    clientCapacityPerProduct: 10,
    isMarketplaceVisible: true,
    primarySector: SectorType.CATERING_HORECA,
    openForSectors: [SectorType.CATERING_HORECA, SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST, SectorType.ZAKELIJK_CORPORATE],
    kvkNumber: "19203948",
    vatNumber: "NL192039482B01",
    products: [
      { name: "Live Pasta & Risotto Bar (vanaf 40 personen)", price: 1250, isTop5: true, description: "Verse pasta uit het parmezaanse kaaswiel door onze chef bereid." },
      { name: "Antipasti Grazing Table Deluxe (per meter)", price: 280, isTop5: true, description: "Prosciutto di Parma, truffelpecorino, olijven, focaccia en vijgen." },
      { name: "Walking Dinner 5-Gangen Culinaire Ervaring (p.p.)", price: 58, isTop5: true, description: "Vijf verfijnde gerechtjes uitgeserveerd in stijlvolle mini-schalen." },
      { name: "Mobiele Espresso & Cannoli Bar", price: 490, isTop5: true, description: "Inclusief barista, 200 kopjes Italiaanse koffie en verse Siciliaanse cannoli." },
      { name: "Traditionele Huisgemaakte Tiramisu Taart (25p)", price: 95, isTop5: true, description: "Met savoiardi, mascarpone en amaretto volgens familierecept." }
    ]
  },
  // Nieuwe Sectoren:
  {
    slug: "studio-veldhuis-media",
    name: "Studio Veldhuis Fotografie & Content",
    description: "Commerciële videoproductie, high-end productfotografie en social media content voor ambitieuze merken.",
    logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://studioveldhuis.nl",
    city: "Rotterdam",
    address: "Wilhelminapier 45, Rotterdam",
    latitude: 51.9054,
    longitude: 4.4862,
    serviceRadiusKm: 75,
    availableStaff: 5,
    clientCapacityPerProduct: 4,
    isMarketplaceVisible: true,
    primarySector: SectorType.MARKETING_MEDIA_FOTOGRAFIE,
    openForSectors: [SectorType.MARKETING_MEDIA_FOTOGRAFIE, SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST],
    kvkNumber: "88291039",
    vatNumber: "NL882910391B01",
    products: [
      { name: "Brand Video Commercial & Reclamespot", price: 2450, isTop5: true, description: "4K cinematic brand story video inclusief voice-over en grading." },
      { name: "Product Shoot Pakket (20 studio shots)", price: 850, isTop5: true, description: "Professionele studiobelichting en beeldbewerking voor e-commerce." },
      { name: "Social Media Reels Kwartaalpakket (12 video's)", price: 1750, isTop5: true, description: "Korte pakkende verticale video's voor Instagram en LinkedIn." },
      { name: "Zakelijke Portretfotografie op Locatie (Team)", price: 650, isTop5: true, description: "Consistente portretten van directie en personeel." }
    ]
  },
  {
    slug: "veldhoen-vip-transport",
    name: "Veldhoen VIP Transport & Logistics",
    description: "Luxe directievervoer, evenementenpendels en express koeriersdiensten door heel de Benelux.",
    logoUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://veldhoen-transport.nl",
    city: "Utrecht",
    address: "Kanaalweg 19, Utrecht",
    latitude: 52.0789,
    longitude: 5.1012,
    serviceRadiusKm: 120,
    availableStaff: 10,
    clientCapacityPerProduct: 8,
    isMarketplaceVisible: true,
    primarySector: SectorType.AUTOMOTIVE_LOGISTIEK,
    openForSectors: [SectorType.AUTOMOTIVE_LOGISTIEK, SectorType.ZAKELIJK_CORPORATE, SectorType.EVENEMENTEN_FEEST],
    kvkNumber: "77391028",
    vatNumber: "NL773910282B01",
    products: [
      { name: "VIP Chauffeur & Mercedes S-Klasse Daghuur", price: 890, isTop5: true, description: "Discreet vervoer voor directie, vips en speciale gasten." },
      { name: "Evenementen Shuttle Bus (30 personen)", price: 1150, isTop5: true, description: "Pendeldienst tussen station, hotel en evenementenlocatie." },
      { name: "Same-Day Beurs & Event Express Koerier", price: 340, isTop5: true, description: "Snelle levering van marketingmateriaal en beursonderdelen." }
    ]
  },
  {
    slug: "maison-beaute-wellness",
    name: "Maison de Beauté & Lifestyle",
    description: "High-end visagie, bruidsmake-up, haarstyling en ontspannende wellness arrangementen.",
    logoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://maisonbeaute.nl",
    city: "Amsterdam",
    address: "Van Baerlestraat 82, Amsterdam",
    latitude: 52.3571,
    longitude: 4.8789,
    serviceRadiusKm: 40,
    availableStaff: 4,
    clientCapacityPerProduct: 5,
    isMarketplaceVisible: true,
    primarySector: SectorType.BEAUTY_LIFESTYLE,
    openForSectors: [SectorType.BEAUTY_LIFESTYLE, SectorType.BRUILOFT, SectorType.EVENEMENTEN_FEEST],
    kvkNumber: "66291039",
    vatNumber: "NL662910391B01",
    products: [
      { name: "Bruidsvisagie & Haarstyling Arrangement", price: 425, isTop5: true, description: "Inclusief proefsessie en touch-up pakket op de trouwdag." },
      { name: "Event Glow Make-up & Hair (per persoon)", price: 145, isTop5: true, description: "Stralende look voor gala's, feesten en presentaties." },
      { name: "Luxe Wellness & Relax Massage (90 min)", price: 120, isTop5: true, description: "Diepe ontspanning met natuurlijke aromatische oliën." }
    ]
  },
  {
    slug: "meesterschap-academy",
    name: "Meesterschap Academy & Workshops",
    description: "Inspirerende zakelijke masterclasses, leiderschapstrainingen en creatieve teambuilding workshops.",
    logoUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://meesterschap-academy.nl",
    city: "Eindhoven",
    address: "Torenallee 20, Eindhoven",
    latitude: 51.4485,
    longitude: 5.4529,
    serviceRadiusKm: 80,
    availableStaff: 6,
    clientCapacityPerProduct: 3,
    isMarketplaceVisible: true,
    primarySector: SectorType.ONDERWIJS_WORKSHOPS,
    openForSectors: [SectorType.ONDERWIJS_WORKSHOPS, SectorType.ZAKELIJK_CORPORATE],
    kvkNumber: "55392019",
    vatNumber: "NL553920192B01",
    products: [
      { name: "Teambuilding & Innovatie Bootcamp (halve dag)", price: 1450, isTop5: true, description: "Interactieve werksessie voor teams tot 25 deelnemers." },
      { name: "Masterclass Effectieve Communicatie & Onderhandelen", price: 1850, isTop5: true, description: "Praktijkgerichte training voor management en sales professionals." },
      { name: "Gastcollege & Keynote Presentatie (60 min)", price: 950, isTop5: true, description: "Inspirerende opening of afsluiting van uw congres." }
    ]
  },
  {
    slug: "galerie-podium-artium",
    name: "Galerie & Podium Artium Live Acts",
    description: "Live muzikanten, akoestische ensembles, kunstexposities en theatrale acts voor exclusieve gelegenheden.",
    logoUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    websiteUrl: "https://artium-entertainment.nl",
    city: "Den Haag",
    address: "Noordeinde 64, Den Haag",
    latitude: 52.0812,
    longitude: 4.3065,
    serviceRadiusKm: 60,
    availableStaff: 8,
    clientCapacityPerProduct: 4,
    isMarketplaceVisible: true,
    primarySector: SectorType.KUNST_ENTERTAINMENT,
    openForSectors: [SectorType.KUNST_ENTERTAINMENT, SectorType.EVENEMENTEN_FEEST, SectorType.BRUILOFT, SectorType.ZAKELIJK_CORPORATE],
    kvkNumber: "44391028",
    vatNumber: "NL443910281B01",
    products: [
      { name: "Akoestisch Jazz Trio (3 sets van 45 min)", price: 1350, isTop5: true, description: "Elegante achtergrondmuziek met contrabas, piano en zang." },
      { name: "Live Event Painter / Snelschilder op Locatie", price: 850, isTop5: true, description: "Creëert ter plekke een prachtig schilderij van uw evenement." },
      { name: "Klassiek Strijkkwartet voor Huwelijksceremonie", price: 1100, isTop5: true, description: "Tijdloze muzikale begeleiding van binnenkomst tot toost." }
    ]
  }
];

export async function enrichExistingCompanies() {
  const existing = await prisma.company.findMany({
    include: { openingHours: true, reviews: true }
  });

  for (const comp of existing) {
    const matchingSample = SAMPLE_COMPANIES.find(
      s => s.name.toLowerCase() === comp.name.toLowerCase() || comp.name.toLowerCase().includes(s.slug.split("-")[0])
    );

    const generatedSlug = comp.slug || (matchingSample?.slug ?? comp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    const city = comp.city || matchingSample?.city || "Amsterdam";
    const websiteUrl = comp.websiteUrl || matchingSample?.websiteUrl || `https://${generatedSlug}.nl`;
    const serviceRadiusKm = comp.serviceRadiusKm ?? matchingSample?.serviceRadiusKm ?? 35;
    const availableStaff = comp.availableStaff ?? matchingSample?.availableStaff ?? 3;
    const clientCapacityPerProduct = comp.clientCapacityPerProduct ?? matchingSample?.clientCapacityPerProduct ?? 5;
    const latitude = comp.latitude ?? matchingSample?.latitude ?? 52.37;
    const longitude = comp.longitude ?? matchingSample?.longitude ?? 4.89;
    const businessType = (comp as any).businessType || (matchingSample as any)?.businessType || (
      comp.primarySector === "BRUILOFT" ? "Bruidsstylist" :
      comp.primarySector === "EVENEMENTEN_FEEST" ? "DJ & Event Styling" :
      comp.primarySector === "BOUW_RENOVATIE" ? "Aannemer" :
      comp.primarySector === "ZAKELIJK_CORPORATE" ? "Videograaf & Media" :
      comp.primarySector === "CATERING_HORECA" ? "Cateraar" :
      comp.primarySector === "MARKETING_MEDIA_FOTOGRAFIE" ? "Fotograaf" :
      comp.primarySector === "AUTOMOTIVE_LOGISTIEK" ? "VIP Vervoer" :
      comp.primarySector === "BEAUTY_LIFESTYLE" ? "Kapper & Visagist" :
      comp.primarySector === "ONDERWIJS_WORKSHOPS" ? "Trainer & Coach" : "Kunstenaar & Acts"
    );
    const googlePlaceId = (comp as any).googlePlaceId || (matchingSample as any)?.googlePlaceId || `ChIJ_${generatedSlug.replace(/-/g, "_")}`;

    await prisma.company.update({
      where: { id: comp.id },
      data: {
        slug: generatedSlug,
        city,
        websiteUrl,
        serviceRadiusKm,
        availableStaff,
        clientCapacityPerProduct,
        isMarketplaceVisible: comp.isMarketplaceVisible ?? true,
        businessType,
        googlePlaceId,
        latitude,
        longitude
      }
    });

    // Populate opening hours if empty
    if (comp.openingHours.length === 0) {
      const days = [
        { dayOfWeek: 1, openTime: "08:30", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 2, openTime: "08:30", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 3, openTime: "08:30", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 4, openTime: "08:30", closeTime: "20:00", isClosed: false },
        { dayOfWeek: 5, openTime: "08:30", closeTime: "20:00", isClosed: false },
        { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
        { dayOfWeek: 0, openTime: "11:00", closeTime: "16:00", isClosed: comp.primarySector === SectorType.BOUW_RENOVATIE },
      ];

      for (const d of days) {
        await prisma.openingHour.upsert({
          where: {
            companyId_dayOfWeek: {
              companyId: comp.id,
              dayOfWeek: d.dayOfWeek
            }
          },
          update: {},
          create: {
            companyId: comp.id,
            dayOfWeek: d.dayOfWeek,
            openTime: d.openTime,
            closeTime: d.closeTime,
            isClosed: d.isClosed
          }
        });
      }
    }

    // Populate reviews if empty
    if (comp.reviews.length === 0) {
      await prisma.review.createMany({
        data: [
          {
            companyId: comp.id,
            authorName: "Anouk van der Meer",
            rating: 5,
            comment: "Fantastische service en vakkundige communicatie via het marktplein portaal!",
          },
          {
            companyId: comp.id,
            authorName: "Mark & Laura",
            rating: 5,
            comment: "De samenwerkingsbundel sloot naadloos aan bij onze verwachtingen. Absolute aanrader!",
          }
        ]
      });
    }
  }

  // Ensure any newly added sample companies are also created if missing
  for (let i = 0; i < SAMPLE_COMPANIES.length; i++) {
    const sc = SAMPLE_COMPANIES[i];
    const exists = await prisma.company.findFirst({
      where: {
        OR: [{ slug: sc.slug }, { name: sc.name }]
      }
    });

    if (!exists) {
      let user = await prisma.user.findFirst({
        where: { email: `partner-${sc.slug}@antoniuscore.nl` }
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: sc.name,
            email: `partner-${sc.slug}@antoniuscore.nl`
          }
        });
      }

      await prisma.company.create({
        data: {
          userId: user.id,
          slug: sc.slug,
          name: sc.name,
          description: sc.description,
          logoUrl: sc.logoUrl,
          websiteUrl: sc.websiteUrl,
          city: sc.city,
          address: sc.address,
          latitude: sc.latitude,
          longitude: sc.longitude,
          serviceRadiusKm: sc.serviceRadiusKm,
          availableStaff: sc.availableStaff,
          clientCapacityPerProduct: sc.clientCapacityPerProduct,
          isMarketplaceVisible: true,
          primarySector: sc.primarySector,
          openForSectors: sc.openForSectors,
          kvkNumber: sc.kvkNumber,
          vatNumber: sc.vatNumber,
          products: {
            create: sc.products.map(p => ({
              name: p.name,
              price: p.price,
              description: p.description,
              isTop5: p.isTop5
            }))
          },
          openingHours: {
            create: [
              { dayOfWeek: 1, openTime: "08:30", closeTime: "18:00", isClosed: false },
              { dayOfWeek: 2, openTime: "08:30", closeTime: "18:00", isClosed: false },
              { dayOfWeek: 3, openTime: "08:30", closeTime: "18:00", isClosed: false },
              { dayOfWeek: 4, openTime: "08:30", closeTime: "20:00", isClosed: false },
              { dayOfWeek: 5, openTime: "08:30", closeTime: "20:00", isClosed: false },
              { dayOfWeek: 6, openTime: "09:00", closeTime: "17:00", isClosed: false },
              { dayOfWeek: 0, openTime: "11:00", closeTime: "16:00", isClosed: false },
            ]
          },
          reviews: {
            create: [
              { authorName: "Geverifieerde Klant", rating: 5, comment: "Topkwaliteit en vlot geregeld via het AntoniusCore portaal!" }
            ]
          }
        }
      });
    }
  }
}

export async function ensureSeedData() {
  await enrichExistingCompanies();
  return { message: "Seed data created and enriched successfully." };
}
