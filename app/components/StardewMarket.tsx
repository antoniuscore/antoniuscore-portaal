"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

export interface CompanyWithMarketData {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primarySector: SectorType;
  openForSectors: SectorType[];
  address: string | null;
  products: ProductItem[];
  bundles: {
    bundle: BundleItemDetail;
  }[];
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
  x: number; // percentage (5% to 90%)
  y: number; // percentage (15% to 85%)
  targetX: number;
  targetY: number;
  color: string;
  hatColor: string;
  bubble: string | null;
  facing: "left" | "right" | "down" | "up";
  speed: number;
}

const SECTOR_THEMES: Record<
  SectorType,
  {
    label: string;
    icon: string;
    canopyColor1: string;
    canopyColor2: string;
    tagBg: string;
    borderCol: string;
  }
> = {
  BRUILOFT: {
    label: "Bruiloft & Romantiek",
    icon: "💒",
    canopyColor1: "#e11d48",
    canopyColor2: "#ffe4e6",
    tagBg: "bg-rose-100 text-rose-900 border-rose-300",
    borderCol: "border-rose-400",
  },
  EVENEMENTEN_FEEST: {
    label: "Evenementen & Feest",
    icon: "🎉",
    canopyColor1: "#7c3aed",
    canopyColor2: "#f3e8ff",
    tagBg: "bg-purple-100 text-purple-900 border-purple-300",
    borderCol: "border-purple-400",
  },
  BOUW_RENOVATIE: {
    label: "Bouw & Renovatie",
    icon: "🔨",
    canopyColor1: "#c2410c",
    canopyColor2: "#ffedd5",
    tagBg: "bg-amber-100 text-amber-900 border-amber-300",
    borderCol: "border-amber-400",
  },
  ZAKELIJK_CORPORATE: {
    label: "Zakelijk & Corporate",
    icon: "💼",
    canopyColor1: "#1d4ed8",
    canopyColor2: "#dbeafe",
    tagBg: "bg-blue-100 text-blue-900 border-blue-300",
    borderCol: "border-blue-400",
  },
  CATERING_HORECA: {
    label: "Catering & Horeca",
    icon: "🍽️",
    canopyColor1: "#047857",
    canopyColor2: "#d1fae5",
    tagBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
    borderCol: "border-emerald-400",
  },
};

const BUBBLE_EMOJIS = ["💭", "✨", "🍰", "💍", "🎉", "🔨", "⭐", "🍷", "🎵", "📷"];

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
  const [selectedSector, setSelectedSector] = useState<SectorType | "ALL">("ALL");
  const [hoveredCompany, setHoveredCompany] = useState<CompanyWithMarketData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pinnedCompany, setPinnedCompany] = useState<CompanyWithMarketData | null>(null);

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
    { id: 1, name: "Emily", x: 20, y: 35, targetX: 45, targetY: 40, color: "#3b82f6", hatColor: "#fbbf24", bubble: "💍", facing: "right", speed: 0.15 },
    { id: 2, name: "Sam", x: 60, y: 25, targetX: 75, targetY: 60, color: "#10b981", hatColor: "#ef4444", bubble: "🎵", facing: "down", speed: 0.18 },
    { id: 3, name: "Leah", x: 40, y: 70, targetX: 25, targetY: 55, color: "#8b5cf6", hatColor: "#60a5fa", bubble: "✨", facing: "left", speed: 0.12 },
    { id: 4, name: "Harvey", x: 80, y: 45, targetX: 55, targetY: 30, color: "#d97706", hatColor: "#34d399", bubble: "🍰", facing: "up", speed: 0.14 },
    { id: 5, name: "Penny", x: 30, y: 80, targetX: 65, targetY: 75, color: "#ec4899", hatColor: "#f59e0b", bubble: "📷", facing: "right", speed: 0.16 },
  ]);

  // Visitor autonomous walk loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors((prev) =>
        prev.map((vis) => {
          const dx = vis.targetX - vis.x;
          const dy = vis.targetY - vis.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 1.5) {
            // Pick a new target coordinate on the paths
            const newTargetX = 10 + Math.random() * 80;
            const newTargetY = 20 + Math.random() * 65;
            const newBubble = Math.random() > 0.4 ? BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)] : null;
            return {
              ...vis,
              targetX: newTargetX,
              targetY: newTargetY,
              bubble: newBubble,
            };
          }

          const moveX = (dx / dist) * vis.speed;
          const moveY = (dy / dist) * vis.speed;
          const facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");

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

  // Filtered companies based on selected sector
  const filteredCompanies = companies.filter((c) =>
    selectedSector === "ALL" ? true : c.primarySector === selectedSector
  );

  // Add product to cart
  const addToCart = (product: ProductItem, company: CompanyWithMarketData) => {
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

  // Add bundle to cart
  const addBundleToCart = (bundle: BundleItemDetail, company: CompanyWithMarketData) => {
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

  // Submit Bulk CustomRequest for all gathered companies
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

  // Up to 5 bundles associated with a company
  const getCompanyBundles = (company: CompanyWithMarketData) => {
    const directBundles = company.bundles.map((b) => b.bundle);
    const sectorBundles = allBundles.filter(
      (b) => b.sector === company.primarySector && !directBundles.some((db) => db.id === b.id)
    );
    return [...directBundles, ...sectorBundles].slice(0, 5);
  };

  // Total cart price
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const uniqueCompaniesInCart = Array.from(new Set(cartItems.map((i) => i.companyName)));

  const activeDisplayCompany = pinnedCompany || hoveredCompany;

  return (
    <div className="min-h-screen bg-[#e4c158] text-[#2d1808] flex flex-col font-sans relative overflow-x-hidden select-none">
      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#cfa844] border-b-4 border-[#4a2810] shadow-md px-3 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Pixel Title & Stardew Market Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-10 h-10 rounded bg-[#8a4b1f] border-2 border-[#3b1d09] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                🎪
              </span>
              <div>
                <span className="font-black text-xl tracking-wide text-[#3b1d09] font-mono block leading-none drop-shadow-sm">
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
                className="pixel-btn-red px-6 py-2.5 rounded text-xs font-black tracking-wider uppercase flex items-center gap-2"
              >
                <span>⭐</span>
                <span>B2B Portaal ({userName || "Partner"})</span>
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="pixel-btn-red px-7 py-3 rounded text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2 transition-all"
              >
                <span>🔑</span>
                <span>Zakelijk Inloggen</span>
              </Link>
            )}
          </div>

          {/* Right: Retro Wooden Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="pixel-btn-wood px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Instellingen</span>
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="pixel-btn-gold px-3.5 py-1.5 rounded text-xs font-black flex items-center gap-1.5 relative"
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

      {/* 2. SECTOR FILTER BANNER (Wooden Plank / Notice Board Style) */}
      <section className="bg-[#edd378] border-b-4 border-[#7c481f] py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-[#5c3011] uppercase tracking-wider">
            <span>📜 Filters:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedSector("ALL")}
              className={`px-3 py-1 rounded text-xs font-black transition border-2 ${
                selectedSector === "ALL"
                  ? "bg-[#4a2810] text-[#fff8e7] border-[#221004] shadow-inner"
                  : "bg-[#fff4d4] text-[#4a2810] border-[#8a4b1f] hover:bg-[#ffeec2]"
              }`}
            >
              🎪 Alle Kraampjes ({companies.length})
            </button>

            {(Object.keys(SECTOR_THEMES) as SectorType[]).map((sec) => {
              const th = SECTOR_THEMES[sec];
              const isSelected = selectedSector === sec;
              const count = companies.filter((c) => c.primarySector === sec).length;

              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-1 rounded text-xs font-bold transition border-2 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#4a2810] text-[#fff8e7] border-[#221004] shadow-inner font-black"
                      : "bg-[#fff4d4] text-[#4a2810] border-[#8a4b1f] hover:bg-[#ffeec2]"
                  }`}
                >
                  <span>{th.icon}</span>
                  <span>{th.label.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. THE 2D TOP-DOWN MARKTTERREIN (DESERT / SAND SQUARE) */}
      <main className="relative grow bg-desert-market py-10 px-4 sm:px-8 min-h-[720px] flex flex-col justify-start">
        {/* Cobblestone Market Square Crossroad Paths */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* Main Horizontal Path */}
          <div className="absolute top-[32%] left-0 right-0 h-28 market-cobblestone border-y-2 border-[#b89132]" />
          {/* Main Vertical Path */}
          <div className="absolute top-0 bottom-0 left-[48%] w-32 -ml-16 market-cobblestone border-x-2 border-[#b89132]" />
        </div>

        {/* Decorative Stardew Elements (Crates, Barrels, Flower Pots, Lanterns) */}
        <div className="absolute top-6 left-8 text-2xl select-none opacity-90 filter drop-shadow">📦🛢️</div>
        <div className="absolute top-6 right-8 text-2xl select-none opacity-90 filter drop-shadow">🏮🌾</div>
        <div className="absolute bottom-12 left-12 text-2xl select-none opacity-90 filter drop-shadow">🌻🪵🛢️</div>
        <div className="absolute bottom-12 right-12 text-2xl select-none opacity-90 filter drop-shadow">📦🏮🌾</div>
        <div className="absolute top-1/2 left-6 text-xl select-none opacity-90 filter drop-shadow">🌵🌺</div>
        <div className="absolute top-1/2 right-6 text-xl select-none opacity-90 filter drop-shadow">🌺🌵</div>

        {/* 4. LIVE WALKING NPCS (Visitors between stalls) */}
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
            {/* Thought/Speech Bubble */}
            {vis.bubble && (
              <div className="absolute -top-7 -left-2 bg-white/95 border-2 border-[#4a2810] px-1.5 py-0.5 rounded-full text-xs shadow-md animate-bubble-float z-30">
                {vis.bubble}
              </div>
            )}

            {/* 2D Top-Down Character Sprite */}
            <div className="relative flex flex-col items-center">
              {/* Hat / Hair */}
              <div
                className="w-4 h-3 rounded-t-full border border-black/40 shadow-sm"
                style={{ backgroundColor: vis.hatColor }}
              />
              {/* Face */}
              <div className="w-3.5 h-2.5 bg-[#fcd3a1] border-x border-black/30 flex items-center justify-around px-0.5">
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
                <div className="w-0.5 h-0.5 bg-black rounded-full" />
              </div>
              {/* Shirt */}
              <div
                className="w-4 h-3.5 rounded-b border border-black/40 shadow-sm"
                style={{ backgroundColor: vis.color }}
              />
              {/* Shadow under feet */}
              <div className="w-5 h-1.5 bg-black/25 rounded-full -mt-0.5 filter blur-[0.5px]" />
            </div>
          </div>
        ))}

        {/* Marktplein Header / Welcome Board */}
        <div className="relative z-10 max-w-2xl mx-auto text-center mb-10">
          <div className="pixel-box-parchment p-4 inline-block transform -rotate-0.5 shadow-xl">
            <span className="text-2xl mr-2">🎪</span>
            <span className="font-mono font-black text-lg text-[#3b1d09] tracking-tight">
              DE MARKT VAN ANTONIUSCORE
            </span>
            <p className="text-xs font-semibold text-[#663814] mt-1">
              Beweeg je muis over een marktkraam om de <strong>Top 5 producten</strong> en{" "}
              <strong>samenwerkingsbundels</strong> te ontdekken. Voeg items toe aan je mandje voor een gecombineerde offerte!
            </p>
          </div>
        </div>

        {/* 5. 2D MARKTCAMPING RASTER (KRAAMPJES OP HET VELD) */}
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-24">
          {filteredCompanies.map((company, index) => {
            const th = SECTOR_THEMES[company.primarySector];
            const top5Products = company.products.filter((p) => p.isTop5);
            const otherProducts = company.products.filter((p) => !p.isTop5);
            const displayProducts = [...top5Products, ...otherProducts].slice(0, 5);
            const companyBundles = getCompanyBundles(company);

            return (
              <div
                key={company.id}
                onMouseEnter={(e) => {
                  setHoveredCompany(company);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
                }}
                onMouseLeave={() => setHoveredCompany(null)}
                onClick={() => setPinnedCompany(pinnedCompany?.id === company.id ? null : company)}
                className="relative group cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 flex flex-col items-center"
              >
                {/* 2D Stardew Market Stall Structure */}
                <div className="w-full max-w-[280px] flex flex-col items-center">
                  {/* Stall Canopy / Luifel (Gestreepte tentdak) */}
                  <div
                    className="w-full h-16 rounded-t-lg border-4 border-[#3b1d09] relative overflow-hidden shadow-lg"
                    style={{
                      background: `repeating-linear-gradient(
                        90deg,
                        ${th.canopyColor1},
                        ${th.canopyColor1} 18px,
                        ${th.canopyColor2} 18px,
                        ${th.canopyColor2} 36px
                      )`,
                    }}
                  >
                    {/* Canopy wooden support poles */}
                    <div className="absolute top-0 bottom-0 left-2 w-1.5 bg-[#4a2810]" />
                    <div className="absolute top-0 bottom-0 right-2 w-1.5 bg-[#4a2810]" />

                    {/* Sector Icon & Badge on Awning */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-[#3b1d09]/90 border border-[#edd378] px-2 py-0.5 rounded text-[10px] text-white font-black flex items-center gap-1 shadow">
                      <span>{th.icon}</span>
                      <span>{th.label.split(" ")[0]}</span>
                    </div>

                    {/* Scalloped cloth fringe */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 flex justify-between overflow-hidden">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-3 -mb-1 rounded-full bg-[#3b1d09] shrink-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stall Counter & Merchant Area */}
                  <div className="w-full bg-[#edd378] border-x-4 border-b-4 border-[#3b1d09] p-3 flex flex-col items-center relative shadow-md">
                    {/* Wooden Merchant Signpost */}
                    <div className="bg-[#8a4b1f] border-2 border-[#3b1d09] text-[#fff8e7] px-2.5 py-1 rounded text-center w-full shadow-inner mb-2">
                      <h3 className="font-mono font-black text-xs truncate">
                        {company.name}
                      </h3>
                    </div>

                    {/* Merchant & Display Counter */}
                    <div className="w-full bg-[#ba793a] border-2 border-[#5c3011] rounded p-2 flex items-center justify-between gap-2 shadow-inner">
                      {/* 2D Merchant Character Avatar */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-4 h-3 bg-[#e11d48] rounded-t-full border border-black/40" />
                        <div className="w-3.5 h-2.5 bg-[#fcd3a1] border-x border-black/30" />
                        <div className="w-4 h-3 bg-[#3b82f6] rounded-b border border-black/40" />
                        <span className="text-[9px] font-bold text-[#3b1d09] mt-0.5 leading-none">
                          Kramer
                        </span>
                      </div>

                      {/* Display Table with Top Products Count & Teaser */}
                      <div className="grow bg-[#edd378] border border-[#7c481f] rounded p-1.5 text-center">
                        <div className="text-[10px] font-bold text-[#4a2810] flex items-center justify-center gap-1">
                          <span>📦</span> {displayProducts.length} Top Producten
                        </div>
                        {companyBundles.length > 0 && (
                          <div className="text-[9px] font-extrabold text-[#7c3aed] mt-0.5">
                            🤝 {companyBundles.length} Bundels
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Open for sectors pills preview */}
                    <div className="w-full mt-2 flex flex-wrap gap-1 justify-center">
                      {company.openForSectors.slice(0, 3).map((sec) => (
                        <span
                          key={sec}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-[#fff4d4] text-[#4a2810] border border-[#a16207] font-bold"
                        >
                          {SECTOR_THEMES[sec]?.icon}
                        </span>
                      ))}
                    </div>

                    {/* Hover Hint */}
                    <div className="mt-2 text-[10px] text-[#7c481f] font-bold flex items-center gap-1">
                      <span>🔍</span> Beweeg voor aanbod →
                    </div>
                  </div>

                  {/* Stall base shadow */}
                  <div className="w-[90%] h-3 bg-black/25 rounded-full filter blur-[1px] -mt-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. HOVER / PINNED FLOATING POP-UP (Perkament Rol / Stardew Dialogue Box) */}
        {activeDisplayCompany && (
          <div className="fixed inset-x-4 bottom-6 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[460px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="pixel-box-parchment p-5 relative max-h-[80vh] flex flex-col shadow-2xl">
              {/* Close / Unpin Button */}
              <button
                onClick={() => {
                  setPinnedCompany(null);
                  setHoveredCompany(null);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded bg-[#8a4b1f] hover:bg-[#a15523] text-white border-2 border-[#3b1d09] flex items-center justify-center font-black text-xs shadow cursor-pointer"
              >
                ✕
              </button>

              {/* Popup Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b-2 border-[#7c481f] mb-3 pr-8">
                <span className="text-2xl p-1.5 bg-[#edd378] border-2 border-[#7c481f] rounded shadow-inner">
                  {SECTOR_THEMES[activeDisplayCompany.primarySector]?.icon}
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a4b1f]">
                    {SECTOR_THEMES[activeDisplayCompany.primarySector]?.label}
                  </span>
                  <h4 className="font-mono font-black text-base text-[#3b1d09] leading-tight">
                    {activeDisplayCompany.name}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-[#5c3011] mb-3 leading-relaxed">
                {activeDisplayCompany.description || "Gecertificeerde partner op het marktplein."}
              </p>

              {/* Scrollable Products & Bundles Container */}
              <div className="space-y-4 overflow-y-auto grow pr-1 text-xs">
                {/* A. TOP 5 PRODUCTEN */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-xs text-[#4a2810] uppercase flex items-center gap-1">
                      <span>🏆</span> Top 5 Producten
                    </span>
                    <span className="text-[10px] text-[#7c481f] font-bold">
                      Klik (+) voor mandje
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {activeDisplayCompany.products.slice(0, 5).map((prod) => (
                      <div
                        key={prod.id}
                        className="p-2 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between gap-2 hover:bg-[#ffeec2] transition"
                      >
                        <div className="grow">
                          <div className="font-bold text-[#3b1d09] leading-tight">
                            {prod.name}
                          </div>
                          {prod.description && (
                            <div className="text-[10px] text-[#7c481f] line-clamp-1">
                              {prod.description}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-extrabold text-[#3b1d09]">
                            €{prod.price.toLocaleString("nl-NL")}
                          </span>
                          <button
                            onClick={() => addToCart(prod, activeDisplayCompany)}
                            className="pixel-btn-wood px-2 py-1 rounded text-[10px] font-black cursor-pointer"
                            title="Voeg toe aan boodschappenmand"
                          >
                            + Mandje
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* B. ACTIEVE SAMENWERKINGSBUNDELS (TOT 5 BUNDELS) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-xs text-[#7c3aed] uppercase flex items-center gap-1">
                      <span>🤝</span> Actieve Samenwerkingsbundels
                    </span>
                    <span className="text-[10px] text-[#6d28d9] font-bold">
                      Cross-Sector Deals
                    </span>
                  </div>

                  {getCompanyBundles(activeDisplayCompany).length === 0 ? (
                    <div className="p-2 text-center text-[11px] text-[#7c481f] italic bg-[#fff4d4] rounded border border-[#ba793a]">
                      Geen actieve bundels voor deze sector.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getCompanyBundles(activeDisplayCompany).map((bundle) => (
                        <div
                          key={bundle.id}
                          className="p-2.5 rounded bg-[#f5f3ff] border-2 border-[#8b5cf6] flex flex-col gap-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-black uppercase text-[#6d28d9] bg-[#ede9fe] px-1.5 py-0.5 rounded border border-[#c4b5fd]">
                                {SECTOR_THEMES[bundle.sector]?.icon} {bundle.sector}
                              </span>
                              <div className="font-extrabold text-[#4c1d95] text-xs mt-1">
                                {bundle.title}
                              </div>
                            </div>
                            <span className="font-mono font-black text-sm text-[#5b21b6] shrink-0">
                              €{bundle.price.toLocaleString("nl-NL")}
                            </span>
                          </div>

                          <p className="text-[10px] text-[#5b21b6] line-clamp-2">
                            {bundle.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-[#ddd6fe]">
                            <span className="text-[9px] text-[#6d28d9] font-medium">
                              {bundle.companies.length} samenwerkende partners
                            </span>
                            <button
                              onClick={() => addBundleToCart(bundle, activeDisplayCompany)}
                              className="px-2.5 py-1 rounded bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[10px] font-bold border border-[#4c1d95] shadow-sm cursor-pointer"
                            >
                              + Bundel In Mandje
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Popup Footer */}
              <div className="pt-3 border-t-2 border-[#7c481f] mt-3 flex items-center justify-between text-[11px] text-[#7c481f] font-semibold">
                <span>📍 {activeDisplayCompany.address || "Nederland"}</span>
                <span className="text-[#3b1d09] font-bold">
                  {pinnedCompany?.id === activeDisplayCompany.id ? "Vastgezet 📌" : "Klik om vast te zetten"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 7. FLOATING BOODSCHAPPENMANDJE BUTTON (RECHTSONDER) */}
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="pixel-btn-gold px-4 py-3 rounded-lg text-sm font-black flex items-center gap-2 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-xl">🧺</span>
            <span>Aanvraag Mandje</span>
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-mono border border-white">
              {cartItems.length}
            </span>
          </button>
        </div>

        {/* 8. WINKELMAND SLIDE-OVER DRAWER (BULK CUSTOM REQUEST) */}
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
                    Gecombineerde offerte voor meerdere kraampjes
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
                    Beweeg over de marktkraampjes en klik op <strong>"+ Mandje"</strong> om
                    producten of bundels van meerdere bedrijven te verzamelen.
                  </p>
                </div>
              ) : (
                <>
                  {/* List of items in the cart */}
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

                    {/* Summary box */}
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

                  {/* Bulk Request Form */}
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

      {/* 9. RETRO WOODEN FOOTER */}
      <footer className="bg-[#4a2810] border-t-4 border-[#221004] text-[#fff4d4] py-6 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <span className="font-mono font-bold">
              AntoniusCore B2B2C Marktplein — Top-Down Pixel Experience
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/shop" className="hover:text-[#edd378] transition">
              Klassiek Overzicht
            </Link>
            <Link href="/dashboard" className="hover:text-[#edd378] transition">
              B2B Dashboard
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
