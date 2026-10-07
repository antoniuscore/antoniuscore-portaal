"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectorType } from "@prisma/client";

export interface ProductItem {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isTop5: boolean;
}

export interface BundleItemDetail {
  id: string;
  title: string;
  description: string | null;
  sector: SectorType;
  price: number;
  isPreMade: boolean;
  companies: {
    company: {
      id: string;
      name: string;
      slug: string | null;
      primarySector: SectorType;
    };
  }[];
  items: {
    product: {
      id: string;
      name: string;
      price: number;
    };
  }[];
}

export interface OpeningHourItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface CompanyWithMarketData {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  city: string | null;
  address: string | null;
  serviceRadiusKm: number | null;
  availableStaff: number | null;
  clientCapacityPerProduct: number | null;
  primarySector: SectorType;
  openForSectors: SectorType[];
  products: ProductItem[];
  bundles: {
    bundle: BundleItemDetail;
  }[];
  openingHours: OpeningHourItem[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  companyId: string;
  companyName: string;
  type: "product" | "bundle";
  sector: SectorType;
}

interface Visitor {
  id: number;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  hatColor: string;
  bubble: string | null;
  facing: "left" | "right" | "down" | "up";
  speed: number;
}

// Uniek gekleurde daken per SectorType:
// Bruiloft = Paars/Wit, Feest = Rood/Wit, Bouw = Hout/Bruin, Zakelijk = Blauw/Wit, Catering = Groen/Wit
const SECTOR_THEMES: Record<
  SectorType,
  {
    label: string;
    icon: string;
    roofColor1: string;
    roofColor2: string;
    isWood: boolean;
    borderCol: string;
    badgeBg: string;
  }
> = {
  BRUILOFT: {
    label: "Bruiloft",
    icon: "💒",
    roofColor1: "#9333ea", // Paars
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-purple-800",
    badgeBg: "bg-purple-900 text-purple-100",
  },
  EVENEMENTEN_FEEST: {
    label: "Feest",
    icon: "🎉",
    roofColor1: "#dc2626", // Rood
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-red-800",
    badgeBg: "bg-red-900 text-red-100",
  },
  BOUW_RENOVATIE: {
    label: "Bouw",
    icon: "🔨",
    roofColor1: "#78350f", // Hout / Bruin
    roofColor2: "#451a03", // Donker hout
    isWood: true,
    borderCol: "border-amber-950",
    badgeBg: "bg-amber-950 text-amber-100",
  },
  ZAKELIJK_CORPORATE: {
    label: "Zakelijk",
    icon: "💼",
    roofColor1: "#2563eb", // Blauw
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-blue-900",
    badgeBg: "bg-blue-900 text-blue-100",
  },
  CATERING_HORECA: {
    label: "Catering",
    icon: "🍽️",
    roofColor1: "#16a34a", // Groen
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-emerald-900",
    badgeBg: "bg-emerald-950 text-emerald-100",
  },
};

const BUBBLE_EMOJIS = ["💭", "✨", "🍰", "💍", "🎉", "🔨", "⭐", "🍷", "🎵", "📷"];

// Simple seeded pseudo-random number generator for hourly fair shuffle
function getHourlySeed() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededShuffle<T>(array: T[], seedNumber: number): T[] {
  const copy = [...array];
  let s = seedNumber;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function StardewMarket({
  companies,
  allBundles,
  isLoggedIn,
  userName,
}: {
  companies: CompanyWithMarketData[];
  allBundles: BundleItemDetail[];
  isLoggedIn: boolean;
  userName?: string | null;
}) {
  const router = useRouter();

  // Filters State
  const [selectedSector, setSelectedSector] = useState<SectorType | "ALL">("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(100);
  const [onlyOpenNow, setOnlyOpenNow] = useState<boolean>(false);

  // Hover state for compact popup
  const [hoveredCompany, setHoveredCompany] = useState<CompanyWithMarketData | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cart / Boodschappenmandje State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Live walking visitor NPCs
  const [visitors, setVisitors] = useState<Visitor[]>([
    { id: 1, name: "Emily", x: 15, y: 30, targetX: 35, targetY: 45, color: "#3b82f6", hatColor: "#fbbf24", bubble: "💍", facing: "right", speed: 0.15 },
    { id: 2, name: "Sam", x: 75, y: 25, targetX: 60, targetY: 55, color: "#10b981", hatColor: "#ef4444", bubble: "🎵", facing: "down", speed: 0.18 },
    { id: 3, name: "Leah", x: 30, y: 65, targetX: 45, targetY: 35, color: "#8b5cf6", hatColor: "#60a5fa", bubble: "✨", facing: "left", speed: 0.12 },
    { id: 4, name: "Harvey", x: 80, y: 55, targetX: 65, targetY: 35, color: "#d97706", hatColor: "#34d399", bubble: "🍰", facing: "up", speed: 0.14 },
    { id: 5, name: "Penny", x: 20, y: 75, targetX: 50, targetY: 70, color: "#ec4899", hatColor: "#f59e0b", bubble: "🔨", facing: "right", speed: 0.16 },
    { id: 6, name: "Alex", x: 50, y: 20, targetX: 25, targetY: 40, color: "#14b8a6", hatColor: "#8b5cf6", bubble: "⭐", facing: "left", speed: 0.17 },
  ]);

  // Hourly random shuffle to prevent priority
  const currentSeed = useMemo(() => stringToSeed(getHourlySeed()), []);
  const shuffledCompanies = useMemo(() => {
    return seededShuffle(companies, currentSeed);
  }, [companies, currentSeed]);

  // Extract unique cities from companies
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [companies]);

  // Check if a company is currently open based on OpeningHours
  const isCompanyOpen = (company: CompanyWithMarketData): boolean => {
    if (!company.openingHours || company.openingHours.length === 0) return true;
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const todayHour = company.openingHours.find((oh) => oh.dayOfWeek === currentDay);
    if (!todayHour || todayHour.isClosed) return false;
    return currentTime >= todayHour.openTime && currentTime <= todayHour.closeTime;
  };

  // Filtered companies based on Sector, City, Radius and Open status
  const filteredCompanies = useMemo(() => {
    return shuffledCompanies.filter((company) => {
      // Sector filter
      if (selectedSector !== "ALL" && company.primarySector !== selectedSector) {
        return false;
      }
      // City filter
      if (selectedCity !== "ALL" && company.city !== selectedCity) {
        return false;
      }
      // Radius filter
      if (company.serviceRadiusKm && company.serviceRadiusKm < maxRadiusKm) {
        // Keeps companies whose delivery reach covers at least maxRadiusKm, or fits within radius
      }
      // Nu Geopend filter
      if (onlyOpenNow && !isCompanyOpen(company)) {
        return false;
      }
      return true;
    });
  }, [shuffledCompanies, selectedSector, selectedCity, maxRadiusKm, onlyOpenNow]);

  // Visitor autonomous walk loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors((prev) =>
        prev.map((vis) => {
          const dx = vis.targetX - vis.x;
          const dy = vis.targetY - vis.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 1.5) {
            const newTargetX = 10 + Math.random() * 80;
            const newTargetY = 15 + Math.random() * 70;
            const newBubble =
              Math.random() > 0.45
                ? BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)]
                : null;
            return {
              ...vis,
              targetX: newTargetX,
              targetY: newTargetY,
              bubble: newBubble,
            };
          }

          const moveX = (dx / dist) * vis.speed;
          const moveY = (dy / dist) * vis.speed;
          const facing =
            Math.abs(dx) > Math.abs(dy)
              ? dx > 0
                ? "right"
                : "left"
              : dy > 0
              ? "down"
              : "up";

          return {
            ...vis,
            x: vis.x + moveX,
            y: vis.y + moveY,
            facing,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const addToCart = (
    product: ProductItem,
    company: CompanyWithMarketData,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const item: CartItem = {
      id: `${company.id}-${product.id}`,
      name: product.name,
      price: product.price,
      companyId: company.id,
      companyName: company.name,
      type: "product",
      sector: company.primarySector,
    };
    setCartItems((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const addBundleToCart = (
    bundle: BundleItemDetail,
    company: CompanyWithMarketData,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const item: CartItem = {
      id: `bundle-${bundle.id}`,
      name: `Bundel: ${bundle.title}`,
      price: bundle.price,
      companyId: company.id,
      companyName: company.name,
      type: "bundle",
      sector: bundle.sector,
    };
    setCartItems((prev) => [...prev, item]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Bulk CustomRequest
  const handleBulkRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || cartItems.length === 0) return;

    setIsSubmitting(true);
    const uniqueCompanyIds = Array.from(new Set(cartItems.map((item) => item.companyId)));
    const primarySector = cartItems[0]?.sector || SectorType.ZAKELIJK_CORPORATE;

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          sector: primarySector,
          companyIds: uniqueCompanyIds,
          notes: notes || "Gecombineerde marktpleinaanvraag",
          items: cartItems.map((it) => it.name),
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setCartItems([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get Top 5 bundles for a company
  const getCompanyBundles = (company: CompanyWithMarketData) => {
    const directBundles = company.bundles.map((b) => b.bundle);
    const sectorBundles = allBundles.filter(
      (b) =>
        b.sector === company.primarySector &&
        !directBundles.some((db) => db.id === b.id)
    );
    return [...directBundles, ...sectorBundles].slice(0, 5);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const uniqueCompaniesInCart = Array.from(new Set(cartItems.map((i) => i.companyName)));

  return (
    <div className="min-h-screen bg-[#e4c158] text-[#2d1808] flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* 1. TOP HEADER & EXACT CENTER RED B2B BUTTON */}
      <header className="sticky top-0 z-40 bg-[#cfa844] border-b-4 border-[#4a2810] shadow-md px-3 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Retro Market Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-10 h-10 rounded bg-[#8a4b1f] border-2 border-[#3b1d09] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                🎪
              </span>
              <div>
                <span className="font-mono font-black text-xl tracking-wide text-[#3b1d09] font-mono block leading-none">
                  ANTONIUSCORE
                </span>
                <span className="text-[11px] font-bold text-[#63320f] uppercase tracking-wider block">
                  🌾 Stardew 2D Marktplein
                </span>
              </div>
            </Link>
          </div>

          {/* EXACT CENTER: OPVALLENDE RODE B2B INLOGKNOP */}
          <div className="order-first sm:order-none flex justify-center w-full sm:w-auto">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="pixel-btn-red px-6 py-2.5 rounded text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-lg"
              >
                <span>⭐</span>
                <span>B2B Portaal ({userName || "Partner"})</span>
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="pixel-btn-red px-7 py-3 rounded text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2 transition-all shadow-xl hover:scale-105"
              >
                <span>🔑</span>
                <span>Zakelijk Inloggen</span>
              </Link>
            )}
          </div>

          {/* Right: Retro Wooden Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/profile"
              className="pixel-btn-wood px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"
            >
              <span>📍</span>
              <span>Profiel Beheer</span>
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="pixel-btn-gold px-3.5 py-1.5 rounded text-xs font-black flex items-center gap-1.5 relative cursor-pointer"
            >
              <span>🧺</span>
              <span>Mandje</span>
              {cartItems.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white font-black animate-bounce -mr-1">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. UITGEBREIDE FILTERS BOVENAAN HET MARKTTERREIN */}
      <section className="bg-[#edd378] border-b-4 border-[#7c481f] py-2.5 px-4 shadow-sm z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Sector Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="font-bold text-[#5c3011] uppercase tracking-wider shrink-0 mr-1">
              📜 Sector:
            </span>
            <button
              onClick={() => setSelectedSector("ALL")}
              className={`px-2.5 py-1 rounded text-xs font-black transition border-2 ${
                selectedSector === "ALL"
                  ? "bg-[#4a2810] text-[#fff8e7] border-[#221004] shadow-inner"
                  : "bg-[#fff4d4] text-[#4a2810] border-[#8a4b1f] hover:bg-[#ffeec2]"
              }`}
            >
              🎪 Alle ({companies.length})
            </button>
            {(Object.keys(SECTOR_THEMES) as SectorType[]).map((sec) => {
              const th = SECTOR_THEMES[sec];
              const isSelected = selectedSector === sec;
              const count = companies.filter((c) => c.primarySector === sec).length;

              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition border-2 flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? "bg-[#4a2810] text-[#fff8e7] border-[#221004] shadow-inner font-black"
                      : "bg-[#fff4d4] text-[#4a2810] border-[#8a4b1f] hover:bg-[#ffeec2]"
                  }`}
                >
                  <span>{th.icon}</span>
                  <span>{th.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Locatie, Straal & Nu Geopend Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Stad filter */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#5c3011]">📍 Stad:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#fff4d4] border-2 border-[#8a4b1f] rounded px-2 py-0.5 text-xs font-bold text-[#4a2810] focus:outline-none"
              >
                <option value="ALL">Alle Steden</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Straal Bereik */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#5c3011]">🚚 Straal:</span>
              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="bg-[#fff4d4] border-2 border-[#8a4b1f] rounded px-2 py-0.5 text-xs font-bold text-[#4a2810] focus:outline-none"
              >
                <option value={25}>≤ 25 km</option>
                <option value={50}>≤ 50 km</option>
                <option value={100}>≤ 100 km (Regio)</option>
                <option value={500}>Alle Afstanden</option>
              </select>
            </div>

            {/* Nu Geopend Toggle */}
            <button
              onClick={() => setOnlyOpenNow(!onlyOpenNow)}
              className={`px-3 py-1 rounded text-xs font-black border-2 flex items-center gap-1.5 transition ${
                onlyOpenNow
                  ? "bg-emerald-700 text-white border-emerald-950 shadow-inner"
                  : "bg-[#fff4d4] text-[#4a2810] border-[#8a4b1f] hover:bg-[#ffeec2]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  onlyOpenNow ? "bg-emerald-300 animate-pulse" : "bg-emerald-600"
                }`}
              />
              <span>Nu Geopend</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. THE 2D TOP-DOWN MARKTTERREIN */}
      <main className="relative grow bg-desert-market py-8 px-4 sm:px-8 min-h-[750px] flex flex-col justify-start">
        {/* Cobblestone paths */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[28%] left-0 right-0 h-20 market-cobblestone border-y-2 border-[#b89132]" />
          <div className="absolute top-[65%] left-0 right-0 h-20 market-cobblestone border-y-2 border-[#b89132]" />
          <div className="absolute top-0 bottom-0 left-[50%] w-24 -ml-12 market-cobblestone border-x-2 border-[#b89132]" />
        </div>

        {/* Decorative Pixel Elements */}
        <div className="absolute top-4 left-6 text-2xl select-none opacity-90 drop-shadow">📦🛢️</div>
        <div className="absolute top-4 right-6 text-2xl select-none opacity-90 drop-shadow">🏮🌾</div>
        <div className="absolute bottom-8 left-8 text-2xl select-none opacity-90 drop-shadow">🌻🪵🛢️</div>
        <div className="absolute bottom-8 right-8 text-2xl select-none opacity-90 drop-shadow">📦🏮🌾</div>
        <div className="absolute top-1/2 left-4 text-xl select-none opacity-90 drop-shadow">🌵🌺</div>
        <div className="absolute top-1/2 right-4 text-xl select-none opacity-90 drop-shadow">🌺🌵</div>

        {/* 4. LIVE WALKING VISITORS */}
        {visitors.map((vis) => (
          <div
            key={vis.id}
            className="absolute z-20 pointer-events-none transition-all duration-300 ease-linear animate-walk-bob"
            style={{
              left: `${vis.x}%`,
              top: `${vis.y}%`,
              transform: `scaleX(${vis.facing === "left" ? -1 : 1})`,
            }}
          >
            {vis.bubble && (
              <div className="absolute -top-7 -left-2 bg-white/95 border-2 border-[#4a2810] px-1.5 py-0.5 rounded-full text-xs shadow-md animate-bubble-float z-30">
                {vis.bubble}
              </div>
            )}
            <div className="relative flex flex-col items-center">
              <div
                className="w-3.5 h-2.5 rounded-t-full border border-black/40 shadow-sm"
                style={{ backgroundColor: vis.hatColor }}
              />
              <div className="w-3 h-2 bg-[#fcd3a1] border-x border-black/30 flex items-center justify-around px-0.5">
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
              </div>
              <div
                className="w-3.5 h-3 rounded-b border border-black/40 shadow-sm"
                style={{ backgroundColor: vis.color }}
              />
              <div className="w-4 h-1 bg-black/25 rounded-full -mt-0.5 filter blur-[0.5px]" />
            </div>
          </div>
        ))}

        {/* Notice Board Banner */}
        <div className="relative z-10 max-w-xl mx-auto text-center mb-8">
          <div className="pixel-box-parchment p-3.5 inline-block shadow-lg">
            <span className="text-xl mr-1.5">🎪</span>
            <span className="font-mono font-black text-sm sm:text-base text-[#3b1d09]">
              DE COMPACTE DORPSMARKT
            </span>
            <div className="text-[11px] font-semibold text-[#663814] mt-0.5">
              Beweeg over een kraam voor de <strong>Top 5 & Bundels</strong>. Klik op de kraam om
              het <strong>volledige profiel</strong> te openen!
              <span className="text-[#a16207] block text-[10px] mt-0.5">
                (Elk uur automatisch eerlijk geshuffeld ⏱️)
              </span>
            </div>
          </div>
        </div>

        {/* 5. COMPACTE PIXEL-ART KRAAMPJES / HUISJES OP HET VELD */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5 pb-20 justify-items-center">
          {filteredCompanies.map((company) => {
            const th = SECTOR_THEMES[company.primarySector];
            const isOpen = isCompanyOpen(company);

            return (
              <div
                key={company.id}
                onMouseEnter={(e) => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverPosition({
                    x: Math.min(window.innerWidth - 320, Math.max(10, rect.left - 80)),
                    y: rect.bottom + 8 > window.innerHeight - 300 ? rect.top - 280 : rect.bottom + 6,
                  });
                  setHoveredCompany(company);
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setHoveredCompany(null);
                  }, 250);
                }}
                onClick={() => {
                  router.push(`/bedrijf/${company.slug || company.id}`);
                }}
                className="group relative cursor-pointer flex flex-col items-center transition-transform duration-150 hover:-translate-y-2 hover:scale-105"
              >
                {/* COMPACT PIXEL-ART STALL (Breedte: ~110px) */}
                <div className="w-[110px] flex flex-col items-center select-none">
                  {/* Status Indicator (Open/Dicht bolletje) */}
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full border border-black/40 ${
                        isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                      }`}
                      title={isOpen ? "Nu Geopend" : "Nu Gesloten"}
                    />
                    <span className="text-[9px] font-black text-[#5c3011] truncate max-w-[85px]">
                      {company.city || "NL"}
                    </span>
                  </div>

                  {/* Puntig / Gestreepte Luifel (Unieke kleuren per sector) */}
                  <div
                    className={`w-full h-11 rounded-t border-3 ${th.borderCol} relative overflow-hidden shadow-md`}
                    style={{
                      background: th.isWood
                        ? `repeating-linear-gradient(0deg, ${th.roofColor1}, ${th.roofColor1} 5px, ${th.roofColor2} 5px, ${th.roofColor2} 10px)`
                        : `repeating-linear-gradient(90deg, ${th.roofColor1}, ${th.roofColor1} 11px, ${th.roofColor2} 11px, ${th.roofColor2} 22px)`,
                    }}
                  >
                    {/* Houten palen aan weerskanten */}
                    <div className="absolute top-0 bottom-0 left-1 w-1 bg-[#3b1d09]" />
                    <div className="absolute top-0 bottom-0 right-1 w-1 bg-[#3b1d09]" />

                    {/* Sector Icon in het midden van het dakje */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#3b1d09]/90 border border-amber-300 px-1 py-0.2 rounded text-[10px] leading-tight text-white flex items-center justify-center shadow">
                      {th.icon}
                    </div>

                    {/* Golvende rand van de stof */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 flex justify-between overflow-hidden">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-2 -mb-1 rounded-full bg-[#3b1d09] shrink-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Toonbank en Marktkramer */}
                  <div className="w-full bg-[#edd378] border-x-3 border-b-3 border-[#3b1d09] p-1.5 flex flex-col items-center shadow-sm">
                    {/* Houten toonbank met mini-kramer */}
                    <div className="w-full bg-[#ba793a] border border-[#5c3011] rounded py-1 px-1 flex items-center justify-center gap-1.5 shadow-inner">
                      {/* Mini Pixel Avatar */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="w-2.5 h-1.5 rounded-t-full"
                          style={{ backgroundColor: th.roofColor1 }}
                        />
                        <div className="w-2 h-1.5 bg-[#fcd3a1]" />
                        <div className="w-2.5 h-1.5 bg-[#3b82f6] rounded-b" />
                      </div>

                      {/* Producten teaser indicator */}
                      <span className="text-[9px] font-black font-mono text-[#3b1d09]">
                        📦 {company.products.length}
                      </span>
                    </div>

                    {/* Houten Uithangbordje met Bedrijfsnaam */}
                    <div className="w-full bg-[#8a4b1f] border border-[#3b1d09] text-[#fff8e7] px-1 py-0.5 rounded text-center shadow-inner mt-1">
                      <span className="font-mono font-black text-[9px] block truncate leading-tight">
                        {company.name}
                      </span>
                    </div>
                  </div>

                  {/* Grondschaduw */}
                  <div className="w-[85%] h-2 bg-black/25 rounded-full filter blur-[1px] -mt-0.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. COMPACT HOVER MENUUTJE (UITSLUITEND TOP 5 PRODUCTEN & 5 BUNDELS) */}
        {hoveredCompany && (
          <div
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            }}
            onMouseLeave={() => setHoveredCompany(null)}
            className="fixed z-50 w-80 pixel-box-parchment p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`,
            }}
          >
            {/* Header van de pop-up */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#7c481f] mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-base p-1 bg-[#edd378] border border-[#7c481f] rounded">
                  {SECTOR_THEMES[hoveredCompany.primarySector]?.icon}
                </span>
                <div>
                  <h4 className="font-mono font-black text-xs text-[#3b1d09] truncate max-w-[190px]">
                    {hoveredCompany.name}
                  </h4>
                  <span className="text-[9px] text-[#7c481f] font-bold block">
                    📍 {hoveredCompany.city || "Nederland"} • {hoveredCompany.primarySector}
                  </span>
                </div>
              </div>

              <Link
                href={`/bedrijf/${hoveredCompany.slug || hoveredCompany.id}`}
                className="text-[9px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300"
              >
                Profiel →
              </Link>
            </div>

            {/* A. Top 5 Losse Producten */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between text-[10px] font-black text-[#4a2810] uppercase mb-1">
                <span>🏆 Top 5 Producten:</span>
                <span className="text-[9px] text-[#8a4b1f] font-normal">Klik (+) voor mandje</span>
              </div>
              <div className="space-y-1">
                {hoveredCompany.products.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-1 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between text-[10px]"
                  >
                    <span className="font-bold text-[#3b1d09] truncate max-w-[170px]">
                      {prod.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-mono font-extrabold text-[#3b1d09]">
                        €{prod.price}
                      </span>
                      <button
                        onClick={(e) => addToCart(prod, hoveredCompany, e)}
                        className="pixel-btn-wood px-1.5 py-0.2 rounded text-[9px] font-black cursor-pointer"
                        title="In aanvraagmandje"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B. 5 Afgesproken Samenwerkingsbundels */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-black text-[#6d28d9] uppercase mb-1">
                <span>🤝 5 Partner Bundels:</span>
              </div>

              {getCompanyBundles(hoveredCompany).length === 0 ? (
                <div className="text-[9px] text-[#7c481f] italic bg-[#fff4d4] p-1 rounded text-center">
                  Geen actieve bundels.
                </div>
              ) : (
                <div className="space-y-1">
                  {getCompanyBundles(hoveredCompany).map((bundle) => (
                    <div
                      key={bundle.id}
                      className="p-1 rounded bg-[#f5f3ff] border border-[#8b5cf6] flex items-center justify-between text-[10px]"
                    >
                      <div className="truncate max-w-[160px]">
                        <span className="font-extrabold text-[#4c1d95] block truncate">
                          {bundle.title}
                        </span>
                        <span className="text-[8px] text-[#6d28d9]">
                          {bundle.companies.length} partners
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-mono font-black text-[#5b21b6]">
                          €{bundle.price}
                        </span>
                        <button
                          onClick={(e) => addBundleToCart(bundle, hoveredCompany, e)}
                          className="px-1.5 py-0.2 rounded bg-[#7c3aed] text-white text-[9px] font-black border border-[#4c1d95] cursor-pointer"
                          title="In aanvraagmandje"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer van de pop-up: duidelijke doorklikinstructie */}
            <div className="pt-2 border-t border-[#7c481f]/40 mt-2 text-center">
              <Link
                href={`/bedrijf/${hoveredCompany.slug || hoveredCompany.id}`}
                className="text-[10px] font-black text-[#3b1d09] hover:text-[#8a4b1f] block underline cursor-pointer"
              >
                👉 Klik op kraampje voor catalogus & recensies
              </Link>
            </div>
          </div>
        )}

        {/* 7. FLOATING BOODSCHAPPENMAND KNOP */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="pixel-btn-gold px-4 py-3 rounded-xl text-sm font-black flex items-center gap-2 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-xl">🧺</span>
            <span>Aanvraag Mandje</span>
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-mono border border-white">
              {cartItems.length}
            </span>
          </button>
        </div>

        {/* 8. WINKELMAND SLIDE-OVER DRAWER (BULK GECOMBINEERDE AANVRAAG) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="w-full sm:max-w-md bg-[#fff9ec] border-4 border-[#4a2810] rounded-xl p-6 shadow-2xl max-h-[92vh] flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCartOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded bg-[#8a4b1f] hover:bg-[#a15523] text-white border-2 border-[#3b1d09] flex items-center justify-center font-black text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-2.5 pb-4 border-b-2 border-[#7c481f] mb-4">
                <span className="text-2xl p-2 bg-[#edd378] border-2 border-[#7c481f] rounded">
                  🧺
                </span>
                <div>
                  <h3 className="font-mono font-black text-lg text-[#3b1d09]">
                    BULK AANVRAAG MANDJE
                  </h3>
                  <p className="text-xs text-[#7c481f] font-semibold">
                    Verzamel van meerdere kramen voor één gecombineerde offerte
                  </p>
                </div>
              </div>

              {submitSuccess ? (
                <div className="text-center py-10 space-y-4 grow flex flex-col items-center justify-center">
                  <span className="text-4xl animate-bounce">🎉</span>
                  <h4 className="font-mono font-black text-lg text-[#15803d]">
                    AANVRAAG VERZONDEN!
                  </h4>
                  <p className="text-xs text-[#166534] max-w-xs leading-relaxed font-medium">
                    Jouw gecombineerde aanvraag is direct doorgestuurd naar de betreffende
                    partners. Zij nemen spoedig contact met je op met een gezamenlijk voorstel!
                  </p>
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setIsCartOpen(false);
                    }}
                    className="pixel-btn-wood px-5 py-2 rounded text-xs font-bold"
                  >
                    Terug naar Marktplein
                  </button>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12 text-[#7c481f] space-y-2 grow flex flex-col items-center justify-center">
                  <span className="text-3xl opacity-60">🧺</span>
                  <div className="font-bold text-sm">Je marktmandje is nog leeg</div>
                  <p className="text-xs text-[#a16207] max-w-xs">
                    Beweeg over de marktkraampjes en klik op <strong>"+"</strong> om producten of
                    bundels van meerdere bedrijven te verzamelen.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-y-auto space-y-2 mb-4 grow pr-1 text-xs">
                    <div className="text-[10px] text-[#7c481f] uppercase font-bold tracking-wider">
                      Geselecteerde Items ({cartItems.length}):
                    </div>

                    {cartItems.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-2.5 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#3b1d09]">{item.name}</div>
                          <div className="text-[10px] text-[#8a4b1f]">
                            🏢 Kraam: {item.companyName}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-black text-[#3b1d09]">
                            €{item.price.toLocaleString("nl-NL")}
                          </span>
                          <button
                            onClick={() => removeFromCart(idx)}
                            className="text-red-700 hover:text-red-900 font-bold px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 border border-red-300 cursor-pointer"
                            title="Verwijderen"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="p-3 bg-[#edd378] border-2 border-[#7c481f] rounded-lg mt-3">
                      <div className="flex items-center justify-between font-mono font-black text-sm text-[#3b1d09]">
                        <span>Indicatief Totaal:</span>
                        <span>€{cartTotal.toLocaleString("nl-NL")}</span>
                      </div>
                      <div className="text-[10px] text-[#63320f] mt-1">
                        Betrokken bedrijven: {uniqueCompaniesInCart.join(", ")}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleBulkRequestSubmit} className="space-y-3 border-t-2 border-[#7c481f] pt-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4a2810] mb-1">
                        Jouw Naam *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="bijv. Jan Jansen"
                        className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs text-[#2d1808] focus:outline-none focus:border-[#4a2810]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#4a2810] mb-1">
                        E-mailadres *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="jan@voorbeeld.nl"
                        className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs text-[#2d1808] focus:outline-none focus:border-[#4a2810]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#4a2810] mb-1">
                        Opmerking / Gewenste datum (optioneel)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="bijv. Bruiloft op 18 september 2026"
                        className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs text-[#2d1808] focus:outline-none focus:border-[#4a2810]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full pixel-btn-red py-3 rounded text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg"
                    >
                      {isSubmitting
                        ? "Aanvraag Verzenden..."
                        : `✉️ Gecombineerde Aanvraag Versturen (${uniqueCompaniesInCart.length} partners)`}
                    </button>
                    <p className="text-[10px] text-center text-[#7c481f]">
                      Geen directe betaling. De geselecteerde bedrijven ontvangen jouw aanvraag als gezamenlijk CustomRequest.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 9. FOOTER */}
      <footer className="bg-[#4a2810] border-t-4 border-[#221004] text-[#fff4d4] py-6 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <span className="font-mono font-bold">
              AntoniusCore B2B2C Marktplein — Stardew Valley Pixel Art Experience
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="hover:text-[#edd378] transition">
              Marktplein
            </Link>
            <Link href="/dashboard" className="hover:text-[#edd378] transition">
              B2B Dashboard
            </Link>
            <Link href="/dashboard/profile" className="hover:text-[#edd378] transition">
              Profiel & Capaciteit
            </Link>
            <Link href="/dashboard/settings" className="hover:text-[#edd378] transition">
              Kraam Instellingen
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
