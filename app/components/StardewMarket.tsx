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
  isMarketplaceVisible?: boolean;
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
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  hatColor: string;
  facing: "left" | "right" | "down" | "up";
  speed: number;
}

// 10 Sectoren met unieke, stijlvolle dakkleur combinaties (geen emojis)
export const SECTOR_THEMES: Record<
  SectorType,
  {
    label: string;
    roofColor1: string;
    roofColor2: string;
    isWood: boolean;
    borderCol: string;
    badgeBg: string;
  }
> = {
  BRUILOFT: {
    label: "Bruiloft",
    roofColor1: "#7c3aed", // Paars
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-purple-800",
    badgeBg: "bg-purple-900 text-purple-100",
  },
  EVENEMENTEN_FEEST: {
    label: "Feest",
    roofColor1: "#dc2626", // Rood
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-red-800",
    badgeBg: "bg-red-900 text-red-100",
  },
  BOUW_RENOVATIE: {
    label: "Bouw",
    roofColor1: "#78350f", // Eikenhout
    roofColor2: "#451a03", // Donker hout
    isWood: true,
    borderCol: "border-amber-950",
    badgeBg: "bg-amber-950 text-amber-100",
  },
  ZAKELIJK_CORPORATE: {
    label: "Zakelijk",
    roofColor1: "#1d4ed8", // Blauw
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-blue-900",
    badgeBg: "bg-blue-900 text-blue-100",
  },
  CATERING_HORECA: {
    label: "Catering",
    roofColor1: "#15803d", // Bosgroen
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-emerald-900",
    badgeBg: "bg-emerald-950 text-emerald-100",
  },
  MARKETING_MEDIA_FOTOGRAFIE: {
    label: "Marketing & Media",
    roofColor1: "#c2410c", // Koper-oranje
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-orange-950",
    badgeBg: "bg-orange-950 text-orange-100",
  },
  AUTOMOTIVE_LOGISTIEK: {
    label: "Automotive & Transport",
    roofColor1: "#334155", // Antraciet
    roofColor2: "#94a3b8", // Zilver
    isWood: false,
    borderCol: "border-slate-900",
    badgeBg: "bg-slate-900 text-slate-100",
  },
  BEAUTY_LIFESTYLE: {
    label: "Beauty & Lifestyle",
    roofColor1: "#db2777", // Framboos / Roze
    roofColor2: "#ffffff", // Wit
    isWood: false,
    borderCol: "border-pink-950",
    badgeBg: "bg-pink-950 text-pink-100",
  },
  ONDERWIJS_WORKSHOPS: {
    label: "Onderwijs & Training",
    roofColor1: "#d97706", // Amber
    roofColor2: "#fef3c7", // Crème
    isWood: false,
    borderCol: "border-amber-900",
    badgeBg: "bg-amber-900 text-amber-100",
  },
  KUNST_ENTERTAINMENT: {
    label: "Kunst & Acts",
    roofColor1: "#581c87", // Dieppaars
    roofColor2: "#facc15", // Warm goud
    isWood: false,
    borderCol: "border-purple-950",
    badgeBg: "bg-purple-950 text-purple-100",
  },
};

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
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

  // Randomize & Infinite Scroll State
  const [shuffleSalt, setShuffleSalt] = useState<number>(1);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState<boolean>(false);
  const [infiniteBatchCount, setInfiniteBatchCount] = useState<number>(1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Cart & Hover Popup State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [hoveredCompany, setHoveredCompany] = useState<CompanyWithMarketData | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  // Combined Request Modal
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [requestNotes, setRequestNotes] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Dynamic Live Visitors Scaling
  const [activeSessionCount, setActiveSessionCount] = useState<number>(14);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // Unique Cities list for filter
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.city && c.city.trim().length > 0) {
        set.add(c.city.trim());
      }
    });
    return Array.from(set).sort();
  }, [companies]);

  // Real-time "Nu Geopend" checker
  const checkIsOpenNow = (company: CompanyWithMarketData): boolean => {
    if (!company.openingHours || company.openingHours.length === 0) return true;
    const now = new Date();
    const currentDay = now.getDay();
    const currentHours =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const todayHour = company.openingHours.find((oh) => oh.dayOfWeek === currentDay);
    if (!todayHour || todayHour.isClosed) return false;
    return currentHours >= todayHour.openTime && currentHours <= todayHour.closeTime;
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (c.isMarketplaceVisible === false) return false;
      if (selectedSector !== "ALL" && c.primarySector !== selectedSector) return false;
      if (selectedCity !== "ALL" && c.city !== selectedCity) return false;
      if (c.serviceRadiusKm && c.serviceRadiusKm > maxRadiusKm) return false;
      if (onlyOpenNow && !checkIsOpenNow(c)) return false;
      return true;
    });
  }, [companies, selectedSector, selectedCity, maxRadiusKm, onlyOpenNow]);

  // Deterministic seed based on hour + manual shuffle salt
  const activeSeed = useMemo(() => {
    const d = new Date();
    const hourlyStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-salt-${shuffleSalt}`;
    return stringToSeed(hourlyStr);
  }, [shuffleSalt]);

  // Shuffled base list of companies
  const shuffledCompanies = useMemo(() => {
    return seededShuffle(filteredCompanies, activeSeed);
  }, [filteredCompanies, activeSeed]);

  // Displayed stalls: single batch or repeated batches if infinite scroll is on
  const displayedStalls = useMemo(() => {
    if (shuffledCompanies.length === 0) return [];
    if (!isInfiniteScroll) return shuffledCompanies;

    const list: (CompanyWithMarketData & { instanceKey: string; organicOffsetX: number; organicOffsetY: number })[] = [];
    for (let batch = 0; batch < infiniteBatchCount; batch++) {
      const batchShuffled = seededShuffle(shuffledCompanies, activeSeed + batch * 31);
      batchShuffled.forEach((comp, idx) => {
        const itemSeed = activeSeed + batch * 1000 + idx * 77;
        // Organic natural jitter so stalls don't sit on a rigid sterile line
        const organicOffsetX = Math.round((seededRandom(itemSeed) - 0.5) * 28);
        const organicOffsetY = Math.round((seededRandom(itemSeed + 1) - 0.5) * 24);

        list.push({
          ...comp,
          instanceKey: `${comp.id}-batch-${batch}-${idx}`,
          organicOffsetX,
          organicOffsetY,
        });
      });
    }
    return list;
  }, [shuffledCompanies, isInfiniteScroll, infiniteBatchCount, activeSeed]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (!isInfiniteScroll) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInfiniteBatchCount((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isInfiniteScroll]);

  // Dynamic Live Visitor Count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessionCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(8, Math.min(26, next));
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update animated visitors array to match dynamic visitor count
  useEffect(() => {
    const colors = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#475569", "#be185d"];
    const hatColors = ["#f59e0b", "#475569", "#0f172a", "#b45309", "#047857", "#9333ea"];

    setVisitors((prev) => {
      const updated: Visitor[] = [...prev];
      while (updated.length < activeSessionCount) {
        const id = updated.length + 1;
        const color = colors[id % colors.length];
        const hatColor = hatColors[id % hatColors.length];
        const x = 5 + Math.random() * 85;
        const y = 8 + Math.random() * 82;
        updated.push({
          id,
          x,
          y,
          targetX: 5 + Math.random() * 85,
          targetY: 8 + Math.random() * 82,
          color,
          hatColor,
          facing: "down",
          speed: 0.35 + Math.random() * 0.45,
        });
      }
      if (updated.length > activeSessionCount) {
        return updated.slice(0, activeSessionCount);
      }
      return updated;
    });
  }, [activeSessionCount]);

  // Animate visitors stepping between paths
  useEffect(() => {
    const timer = setInterval(() => {
      setVisitors((prev) =>
        prev.map((v) => {
          const dx = v.targetX - v.x;
          const dy = v.targetY - v.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 1.5) {
            return {
              ...v,
              targetX: 5 + Math.random() * 85,
              targetY: 8 + Math.random() * 82,
              facing: Math.random() > 0.5 ? "left" : "right",
            };
          }

          const stepX = (dx / dist) * v.speed;
          const stepY = (dy / dist) * v.speed;
          let facing = v.facing;
          if (Math.abs(dx) > Math.abs(dy)) {
            facing = dx > 0 ? "right" : "left";
          } else {
            facing = dy > 0 ? "down" : "up";
          }

          return {
            ...v,
            x: v.x + stepX,
            y: v.y + stepY,
            facing,
          };
        })
      );
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Cart operations
  const addToCart = (e: React.MouseEvent, item: CartItem) => {
    e.stopPropagation();
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.price, 0);
  }, [cart]);

  const uniqueCompaniesInCart = useMemo(() => {
    const map = new Map<string, string>();
    cart.forEach((c) => map.set(c.companyId, c.companyName));
    return Array.from(map.entries());
  }, [cart]);

  // Combined Request Submission
  const handleSubmitCombinedRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerEmail || !customerName) return;

    setIsSubmitting(true);
    try {
      const companyIds = Array.from(new Set(cart.map((i) => i.companyId)));
      const itemsList = cart.map((i) => `• ${i.name} (€${i.price}) bij ${i.companyName}`).join("\n");
      const fullNotes = `Gecombineerde aanvraag voor ${cart.length} producten/diensten:\n${itemsList}\n\nOpmerkingen:\n${requestNotes}`;

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          sector: cart[0]?.sector || SectorType.ZAKELIJK_CORPORATE,
          companyIds,
          companyId: companyIds[0],
          notes: fullNotes,
        }),
      });

      if (!res.ok) throw new Error("Aanvraag mislukt");

      setSubmitSuccess(true);
      setCart([]);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsCartOpen(false);
        setCustomerName("");
        setCustomerEmail("");
        setRequestNotes("");
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("Er is iets misgegaan bij het versturen van uw aanvraag.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stall hover events
  const handleMouseEnterStall = (company: CompanyWithMarketData, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setHoveredCompany(company);
  };

  const handleMouseLeaveStall = () => {
    setHoveredCompany(null);
  };

  const handleStallClick = (company: CompanyWithMarketData) => {
    router.push(`/bedrijf/${company.slug || company.id}`);
  };

  return (
    <div className="min-h-screen bg-desert-market text-[#2d1808] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* 1. Header: Logo Links Boven, Zakelijk Inloggen Midden, Mandje Rechts */}
      <header className="bg-[#cca440] border-b-4 border-[#4a2810] px-4 py-2.5 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Links Boven -> https://www.antoniuscore.com (target="_blank") */}
          <a
            href="https://www.antoniuscore.com"
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn-wood px-3.5 py-2 rounded text-xs font-black tracking-wider uppercase flex items-center gap-2 hover:opacity-95 transition shrink-0"
          >
            <span className="font-mono text-xs sm:text-sm tracking-widest text-[#fcd34d]">
              ANTONIUSCORE
            </span>
            <span className="text-[10px] text-[#edd378] border-l border-[#c57b42] pl-2 font-semibold hidden sm:inline">
              PORTAL
            </span>
          </a>

          {/* Exact Midden: Opvallende Rode Knop "Zakelijk Inloggen" */}
          <div className="flex-1 flex justify-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="pixel-btn-red px-4 sm:px-6 py-2 rounded text-xs font-black tracking-wider uppercase shadow-md transition"
              >
                Dashboard ({userName ? userName.split(" ")[0] : "Zakelijk"})
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="pixel-btn-red px-5 sm:px-8 py-2.5 rounded text-xs sm:text-sm font-black tracking-widest uppercase shadow-xl hover:scale-105 transition"
              >
                Zakelijk Inloggen
              </Link>
            )}
          </div>

          {/* Rechts: Mandje & Profiel Knop */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn && (
              <Link
                href="/dashboard/profile"
                className="pixel-btn-wood px-3 py-2 rounded text-xs font-bold hidden md:inline-block"
              >
                Mijn Profiel
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="pixel-btn-gold px-3.5 py-2 rounded text-xs font-bold flex items-center gap-2 relative cursor-pointer"
            >
              <span>Winkelmand</span>
              {cart.length > 0 && (
                <span className="bg-[#dc2626] text-white text-[10px] font-black rounded-full px-1.5 py-0.2 border border-[#450a0a]">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Marktplein Status Bar & Controls */}
      <div className="bg-[#edd378]/90 border-b-2 border-[#7c481f] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Live Visitor Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-semibold text-[#4a2810]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                Actieve bezoekers op markt:{" "}
                <strong className="font-mono text-emerald-900">{activeSessionCount}</strong>
              </span>
            </div>
            <span className="text-[#8a4b1f] hidden sm:inline">•</span>
            <span className="text-[#63320f] font-medium hidden sm:inline">
              {filteredCompanies.length} actieve kraampjes geopend
            </span>
          </div>

          {/* Randomize Knop & Infinite Scroll Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShuffleSalt((prev) => prev + 1)}
              className="pixel-btn-wood px-3 py-1.5 rounded text-xs font-bold hover:brightness-105 transition cursor-pointer"
            >
              Herverdeel Markt
            </button>

            <button
              onClick={() => {
                setIsInfiniteScroll(!isInfiniteScroll);
                setInfiniteBatchCount(1);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold border transition cursor-pointer ${
                isInfiniteScroll
                  ? "bg-emerald-700 text-white border-emerald-950 shadow"
                  : "pixel-btn-wood text-[#fffbf2]"
              }`}
            >
              {isInfiniteScroll ? "Eindeloos Wandelen: Aan" : "Eindeloos Wandelen: Uit"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar: Sectoren, Stad, Straal, Nu Geopend */}
      <div className="bg-[#edd378]/70 border-b-2 border-[#7c481f]/40 px-4 py-3">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* 10 Sectoren Knoppen (Geen emojis, strakke badges met sector-kleur indicator) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedSector("ALL")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition border cursor-pointer ${
                selectedSector === "ALL"
                  ? "pixel-btn-gold"
                  : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
              }`}
            >
              Alle Sectoren ({companies.length})
            </button>

            {(Object.keys(SECTOR_THEMES) as SectorType[]).map((st) => {
              const meta = SECTOR_THEMES[st];
              const isSelected = selectedSector === st;
              const count = companies.filter((c) => c.primarySector === st && c.isMarketplaceVisible !== false).length;

              return (
                <button
                  key={st}
                  onClick={() => setSelectedSector(st)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "pixel-btn-wood"
                      : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: meta.roofColor1 }}
                  />
                  <span>
                    {meta.label} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secundaire Filters: Stad, Leveringsstraal, Nu Geopend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#4a2810] pt-1">
            {/* Stad filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Locatie:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#fff4d4] border border-[#7c481f] rounded px-2.5 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">Heel Nederland</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Straal filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Max Straal:</span>
              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="bg-[#fff4d4] border border-[#7c481f] rounded px-2.5 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value={25}>Binnen 25 km</option>
                <option value={50}>Binnen 50 km</option>
                <option value={100}>Binnen 100 km</option>
                <option value={200}>Alle afstanden</option>
              </select>
            </div>

            {/* Nu Geopend filter */}
            <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="accent-[#dc2626] w-3.5 h-3.5"
              />
              <span>Alleen nu geopend</span>
            </label>

            {(selectedSector !== "ALL" || selectedCity !== "ALL" || onlyOpenNow) && (
              <button
                onClick={() => {
                  setSelectedSector("ALL");
                  setSelectedCity("ALL");
                  setOnlyOpenNow(false);
                  setMaxRadiusKm(100);
                }}
                className="text-xs text-[#8a4b1f] hover:text-[#3b1d09] font-bold underline cursor-pointer ml-auto"
              >
                Filters wissen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Het Centrale 2D Marktplein Veld */}
      <main className="flex-1 relative p-6 sm:p-10 max-w-7xl mx-auto w-full">
        {/* Subtiel Marktplein Courtyard / Cobblestone Area */}
        <div className="absolute inset-4 sm:inset-8 market-cobblestone rounded-2xl pointer-events-none opacity-40 border border-[#7c481f]/20" />

        {/* Dynamische Live Bezoekers Poppetjes (Zonder tekstballon emojis) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {visitors.map((v) => (
            <div
              key={v.id}
              className="absolute transition-all duration-300 ease-linear animate-walk-bob"
              style={{
                left: `${v.x}%`,
                top: `${v.y}%`,
                transform: `translate(-50%, -50%) ${v.facing === "left" ? "scaleX(-1)" : "scaleX(1)"}`,
              }}
            >
              {/* Pixel Art Miniatuur Bezoeker */}
              <div className="relative w-6 h-8 flex flex-col items-center">
                {/* Hoedje */}
                <div
                  className="w-4 h-2 rounded-t-sm shadow-xs border border-black/30"
                  style={{ backgroundColor: v.hatColor }}
                />
                {/* Hoofdje */}
                <div className="w-3.5 h-2.5 bg-[#f5d0a9] border-x border-black/20" />
                {/* Kleding / Lichaam */}
                <div
                  className="w-4 h-3.5 rounded-b-xs border border-black/30 shadow-xs"
                  style={{ backgroundColor: v.color }}
                />
                {/* Voetjes */}
                <div className="w-3.5 h-1 flex justify-between">
                  <div className="w-1.5 h-1 bg-[#2d1808] rounded-xs" />
                  <div className="w-1.5 h-1 bg-[#2d1808] rounded-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kraampjes Raster: Natuurlijk & Organisch Verspreid met Voldoende Tussenruimte */}
        {displayedStalls.length === 0 ? (
          <div className="relative z-10 text-center py-24 space-y-3">
            <h3 className="font-mono font-black text-xl text-[#4a2810]">
              Geen kraampjes gevonden
            </h3>
            <p className="text-xs text-[#7c481f] max-w-md mx-auto">
              Er zijn geen geopende kraampjes die voldoen aan de geselecteerde filters. Pas je filters aan of herverdeel het plein.
            </p>
            <button
              onClick={() => {
                setSelectedSector("ALL");
                setSelectedCity("ALL");
                setOnlyOpenNow(false);
              }}
              className="pixel-btn-wood px-4 py-2 rounded text-xs font-bold"
            >
              Toon alle kraampjes
            </button>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16 justify-items-center py-6">
            {displayedStalls.map((company, index) => {
              const theme = SECTOR_THEMES[company.primarySector] || SECTOR_THEMES.ZAKELIJK_CORPORATE;
              const isOpen = checkIsOpenNow(company);
              const key = (company as any).instanceKey || `${company.id}-${index}`;
              const offsetX = (company as any).organicOffsetX || 0;
              const offsetY = (company as any).organicOffsetY || 0;

              return (
                <div
                  key={key}
                  onClick={() => handleStallClick(company)}
                  onMouseEnter={(e) => handleMouseEnterStall(company, e)}
                  onMouseLeave={handleMouseLeaveStall}
                  style={{
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                  }}
                  className="group cursor-pointer flex flex-col items-center relative transition-transform duration-200 hover:-translate-y-2 hover:z-30 w-36 sm:w-40"
                >
                  {/* Boven het kraampje: Volledige Bedrijfsnaam (Strak, duidelijk leesbaar) */}
                  <div className="text-center font-bold text-[11px] sm:text-xs text-[#2d1808] leading-tight max-w-[130px] sm:max-w-[145px] truncate mb-1 px-1 bg-[#fff8e7]/80 rounded border border-[#7c481f]/30 shadow-xs">
                    {company.name}
                  </div>

                  {/* 2D Pixel Art Kraampje (Compact & Stijlvol) */}
                  <div className="relative w-28 sm:w-32 flex flex-col items-center">
                    {/* Luifel / Dakje: Sector Gekleurde Strepen / Hout */}
                    <div
                      className={`w-full h-8 sm:h-9 rounded-t-md border-3 ${theme.borderCol} shadow-md overflow-hidden relative`}
                      style={{
                        backgroundImage: theme.isWood
                          ? `repeating-linear-gradient(90deg, ${theme.roofColor1}, ${theme.roofColor1} 10px, ${theme.roofColor2} 10px, ${theme.roofColor2} 20px)`
                          : `repeating-linear-gradient(90deg, ${theme.roofColor1}, ${theme.roofColor1} 11px, ${theme.roofColor2} 11px, ${theme.roofColor2} 22px)`,
                      }}
                    >
                      {/* Subtiel golfje / geschulpt randje onderaan de luifel */}
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/15 flex justify-between">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                      </div>
                    </div>

                    {/* Kramer / Winkelier Sprite Achter Toonbank */}
                    <div className="w-full h-5 bg-[#522709] border-x-3 border-[#3b1d09] flex items-center justify-center relative">
                      <div className="w-4 h-4 rounded-full bg-[#fcd34d] border border-[#78350f] shadow-xs" />
                    </div>

                    {/* Toonbank / Basis van het Kraampje */}
                    <div className="w-full h-9 bg-[#ba793a] border-3 border-[#4a2810] rounded-b-md shadow-md p-1 flex flex-col items-center justify-between">
                      {/* In/op het kraampje: Strak de Plaatsnaam */}
                      <div className="w-full text-center text-[10px] font-black uppercase text-[#fff4d4] bg-[#4a2810] px-1 py-0.5 rounded tracking-wide truncate">
                        {company.city || "Nederland"}
                      </div>

                      {/* Status & Catalogus indicator */}
                      <div className="w-full flex items-center justify-between px-1 text-[9px] font-bold">
                        <span className="text-[#3b1d09]">
                          {company.products.length} items
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOpen ? "bg-emerald-600 shadow-[0_0_5px_#16a34a]" : "bg-rose-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Grondschaduw */}
                    <div className="w-24 h-2 bg-black/20 rounded-full mt-1 blur-2xs" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll trigger element */}
        {isInfiniteScroll && (
          <div ref={loadMoreRef} className="py-8 text-center text-xs text-[#7c481f] font-bold">
            Plein wordt oneindig uitgebreid met kraampjes...
          </div>
        )}
      </main>

      {/* 5. Hover Popup: Enkel Top 5 Producten & 5 Afgesproken Bundels (Geen emojis) */}
      {hoveredCompany && popupPos && (
        <div
          className="fixed z-50 pointer-events-auto transform -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${popupPos.x}px`,
            top: `${popupPos.y - 10}px`,
          }}
          onMouseEnter={() => setHoveredCompany(hoveredCompany)}
          onMouseLeave={handleMouseLeaveStall}
        >
          <div className="w-72 sm:w-80 pixel-box-parchment p-3.5 shadow-2xl rounded-lg text-xs space-y-2.5">
            {/* Header van Pop-up */}
            <div className="border-b border-[#7c481f] pb-2 flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8a4b1f] block">
                  {SECTOR_THEMES[hoveredCompany.primarySector]?.label || hoveredCompany.primarySector} • {hoveredCompany.city || "Nederland"}
                </span>
                <h4 className="font-mono font-black text-sm text-[#3b1d09] leading-tight">
                  {hoveredCompany.name}
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-900 bg-[#edd378] px-1.5 py-0.5 rounded border border-[#ba793a] shrink-0">
                {checkIsOpenNow(hoveredCompany) ? "Geopend" : "Gesloten"}
              </span>
            </div>

            {/* Top 5 Producten */}
            <div>
              <div className="text-[10px] font-black uppercase text-[#4a2810] tracking-wider mb-1">
                Top 5 Producten:
              </div>
              <div className="space-y-1">
                {hoveredCompany.products.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between gap-2 bg-[#fff4d4] px-2 py-1 rounded border border-[#ba793a]/40"
                  >
                    <span className="truncate text-[11px] font-medium text-[#2d1808]">
                      {prod.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono font-bold text-[11px] text-[#3b1d09]">
                        €{prod.price}
                      </span>
                      <button
                        onClick={(e) =>
                          addToCart(e, {
                            id: prod.id,
                            name: prod.name,
                            price: prod.price,
                            companyId: hoveredCompany.id,
                            companyName: hoveredCompany.name,
                            type: "product",
                            sector: hoveredCompany.primarySector,
                          })
                        }
                        title="Toevoegen aan winkelmand"
                        className="w-4 h-4 rounded bg-[#8a4b1f] text-white hover:bg-[#a15523] flex items-center justify-center font-bold text-[10px] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Afgesproken Bundels */}
            {hoveredCompany.bundles.length > 0 && (
              <div>
                <div className="text-[10px] font-black uppercase text-[#5b21b6] tracking-wider mb-1">
                  Samenwerkingsbundels:
                </div>
                <div className="space-y-1">
                  {hoveredCompany.bundles.slice(0, 5).map(({ bundle }) => (
                    <div
                      key={bundle.id}
                      className="flex items-center justify-between gap-2 bg-[#ede9fe] px-2 py-1 rounded border border-[#c4b5fd]"
                    >
                      <span className="truncate text-[11px] font-bold text-[#4c1d95]">
                        {bundle.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono font-black text-[11px] text-[#5b21b6]">
                          €{bundle.price}
                        </span>
                        <button
                          onClick={(e) =>
                            addToCart(e, {
                              id: bundle.id,
                              name: bundle.title,
                              price: bundle.price,
                              companyId: hoveredCompany.id,
                              companyName: hoveredCompany.name,
                              type: "bundle",
                              sector: bundle.sector,
                            })
                          }
                          title="Voeg bundel toe"
                          className="w-4 h-4 rounded bg-[#7c3aed] text-white hover:bg-[#6d28d9] flex items-center justify-center font-bold text-[10px] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer van Pop-up met doorklik hint */}
            <div className="pt-1.5 border-t border-[#7c481f]/30 flex items-center justify-between text-[10px] text-[#7c481f] font-semibold">
              <span>Klik voor bedrijfspagina</span>
              <span className="text-[#8a4b1f] font-bold">Bekijk Profiel →</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Zwevend Boodschappenmandje Drawer (Gecombineerde Aanvraag) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#fff9ec] border-l-4 border-[#4a2810] h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#7c481f] mb-4">
                <div>
                  <h3 className="font-mono font-black text-lg text-[#3b1d09]">
                    GEOFROTEERDE AANVRAAG
                  </h3>
                  <p className="text-xs text-[#7c481f]">
                    Verzamel diensten van meerdere marktpartijen in één aanvraag.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-7 h-7 rounded bg-[#8a4b1f] hover:bg-[#a15523] text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-[#4a2810]"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="text-center py-12 text-[#7c481f] text-xs">
                  <p className="font-bold mb-1">Uw mandje is nog leeg.</p>
                  <p>Beweeg over een kraampje en voeg diensten of bundels toe.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="p-2.5 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="truncate">
                          <span className="font-bold text-[#3b1d09] block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[#7c481f]">
                            {item.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-[#3b1d09]">
                            €{item.price}
                          </span>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-700 hover:text-red-900 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Betrokken Partners Overzicht */}
                  <div className="p-3 bg-[#edd378]/60 rounded border border-[#7c481f] text-xs">
                    <span className="font-bold text-[#4a2810] block mb-1">
                      Betrokken bedrijven ({uniqueCompaniesInCart.length}):
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-[#5c3011]">
                      {uniqueCompaniesInCart.map(([id, name]) => (
                        <li key={id}>• {name}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Totaalbedrag Indicatie */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#7c481f]/40 font-mono font-black text-sm text-[#3b1d09]">
                    <span>Indicatief Totaal:</span>
                    <span>€{cartTotal.toLocaleString("nl-NL")}</span>
                  </div>

                  {/* Aanvraagformulier */}
                  {submitSuccess ? (
                    <div className="p-4 rounded bg-emerald-100 border border-emerald-500 text-emerald-900 text-xs font-bold text-center space-y-1">
                      <p className="text-sm">Aanvraag succesvol verzonden!</p>
                      <p className="font-normal text-[11px]">
                        De geselecteerde bedrijven hebben uw gecombineerde aanvraag ontvangen.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitCombinedRequest} className="space-y-3 pt-2 text-xs">
                      <div>
                        <label className="block font-bold text-[#4a2810] mb-1">
                          Uw Naam *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="bijv. Sandra Mulder"
                          className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#4a2810] mb-1">
                          E-mailadres *
                        </label>
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="sandra@voorbeeld.nl"
                          className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#4a2810] mb-1">
                          Toelichting / Gewenste datum
                        </label>
                        <textarea
                          rows={2}
                          value={requestNotes}
                          onChange={(e) => setRequestNotes(e.target.value)}
                          placeholder="Optionele details over planning of wensen..."
                          className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="pixel-btn-red w-full py-3 rounded text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg"
                      >
                        {isSubmitting ? "Aanvraag verzenden..." : "Verstuur Gecombineerde Aanvraag"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Mandje Footer */}
            <div className="pt-4 border-t border-[#7c481f]/30 text-[10px] text-[#7c481f] text-center">
              AntoniusCore B2B2C Marktplein • Geen directe betaling, enkel vrijblijvende aanvragen.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
