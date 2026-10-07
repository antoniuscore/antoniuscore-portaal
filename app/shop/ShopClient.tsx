"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectorType } from "@prisma/client";

export interface ProductItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isTop5: boolean;
}

export interface BundleDetail {
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

export interface CompanyWithRelations {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  primarySector: SectorType;
  openForSectors: SectorType[];
  address: string | null;
  kvkNumber: string | null;
  products: ProductItem[];
  bundles: {
    bundle: BundleDetail;
  }[];
}

interface ShopClientProps {
  initialCompanies: CompanyWithRelations[];
  allBundles: BundleDetail[];
}

const SECTOR_INFO: Record<
  SectorType,
  {
    label: string;
    icon: string;
    color: string;
    stripeColors: [string, string];
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
  }
> = {
  BRUILOFT: {
    label: "Bruiloft & Romantiek",
    icon: "💒",
    color: "from-rose-500 to-pink-600",
    stripeColors: ["#e11d48", "#fff1f2"],
    badgeBg: "bg-rose-950/60",
    badgeText: "text-rose-300 border-rose-800",
    borderAccent: "hover:border-rose-500/60 shadow-rose-900/20",
  },
  EVENEMENTEN_FEEST: {
    label: "Evenementen & Feest",
    icon: "🎉",
    color: "from-purple-500 to-indigo-600",
    stripeColors: ["#7c3aed", "#faf5ff"],
    badgeBg: "bg-purple-950/60",
    badgeText: "text-purple-300 border-purple-800",
    borderAccent: "hover:border-purple-500/60 shadow-purple-900/20",
  },
  BOUW_RENOVATIE: {
    label: "Bouw & Renovatie",
    icon: "🔨",
    color: "from-amber-500 to-orange-600",
    stripeColors: ["#d97706", "#fffbeb"],
    badgeBg: "bg-amber-950/60",
    badgeText: "text-amber-300 border-amber-800",
    borderAccent: "hover:border-amber-500/60 shadow-amber-900/20",
  },
  ZAKELIJK_CORPORATE: {
    label: "Zakelijk & Corporate",
    icon: "💼",
    color: "from-blue-500 to-cyan-600",
    stripeColors: ["#2563eb", "#eff6ff"],
    badgeBg: "bg-blue-950/60",
    badgeText: "text-blue-300 border-blue-800",
    borderAccent: "hover:border-blue-500/60 shadow-blue-900/20",
  },
  CATERING_HORECA: {
    label: "Catering & Horeca",
    icon: "🍽️",
    color: "from-emerald-500 to-teal-600",
    stripeColors: ["#059669", "#ecfdf5"],
    badgeBg: "bg-emerald-950/60",
    badgeText: "text-emerald-300 border-emerald-800",
    borderAccent: "hover:border-emerald-500/60 shadow-emerald-900/20",
  },
  MARKETING_MEDIA_FOTOGRAFIE: {
    label: "Marketing & Media",
    icon: "📷",
    color: "from-orange-500 to-amber-600",
    stripeColors: ["#c2410c", "#fff7ed"],
    badgeBg: "bg-orange-950/60",
    badgeText: "text-orange-300 border-orange-800",
    borderAccent: "hover:border-orange-500/60 shadow-orange-900/20",
  },
  AUTOMOTIVE_LOGISTIEK: {
    label: "Automotive & Transport",
    icon: "🚗",
    color: "from-slate-600 to-slate-800",
    stripeColors: ["#334155", "#cbd5e1"],
    badgeBg: "bg-slate-950/60",
    badgeText: "text-slate-300 border-slate-700",
    borderAccent: "hover:border-slate-500/60 shadow-slate-900/20",
  },
  BEAUTY_LIFESTYLE: {
    label: "Beauty & Lifestyle",
    icon: "💄",
    color: "from-pink-500 to-rose-600",
    stripeColors: ["#be185d", "#fdf2f8"],
    badgeBg: "bg-pink-950/60",
    badgeText: "text-pink-300 border-pink-800",
    borderAccent: "hover:border-pink-500/60 shadow-pink-900/20",
  },
  ONDERWIJS_WORKSHOPS: {
    label: "Onderwijs & Workshops",
    icon: "🎓",
    color: "from-amber-600 to-yellow-600",
    stripeColors: ["#d97706", "#fffbeb"],
    badgeBg: "bg-amber-950/60",
    badgeText: "text-amber-300 border-amber-800",
    borderAccent: "hover:border-amber-500/60 shadow-amber-900/20",
  },
  KUNST_ENTERTAINMENT: {
    label: "Kunst & Acts",
    icon: "🎭",
    color: "from-purple-600 to-violet-800",
    stripeColors: ["#581c87", "#fef08a"],
    badgeBg: "bg-purple-950/60",
    badgeText: "text-purple-300 border-purple-800",
    borderAccent: "hover:border-purple-500/60 shadow-purple-900/20",
  },
};

export default function ShopClient({
  initialCompanies,
  allBundles,
}: ShopClientProps) {
  const [selectedSector, setSelectedSector] = useState<SectorType | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalCompany, setActiveModalCompany] =
    useState<CompanyWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "bundles" | "inquiry">(
    "products"
  );

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  // Filter companies
  const filteredCompanies = initialCompanies.filter((company) => {
    const matchesSector =
      selectedSector === "ALL" || company.primarySector === selectedSector;
    const matchesSearch =
      searchQuery === "" ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.products.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSector && matchesSearch;
  });

  // Calculate sector counts
  const sectorCounts = initialCompanies.reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.primarySector] = (acc[c.primarySector] || 0) + 1;
      return acc;
    },
    {}
  );

  const openStallDetail = (company: CompanyWithRelations, tab: "products" | "bundles" = "products") => {
    setActiveModalCompany(company);
    setActiveTab(tab);
    setInquirySuccess(false);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalCompany || !inquiryName || !inquiryEmail) return;

    setInquiryLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: inquiryName,
          customerEmail: inquiryEmail,
          sector: activeModalCompany.primarySector,
          companyId: activeModalCompany.id,
        }),
      });
      if (res.ok) {
        setInquirySuccess(true);
        setInquiryName("");
        setInquiryEmail("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInquiryLoading(false);
    }
  };

  // Find bundles associated with active company (or its sector)
  const getCompanyBundles = (company: CompanyWithRelations) => {
    const directBundles = company.bundles.map((b) => b.bundle);
    const sectorBundles = allBundles.filter(
      (b) =>
        b.sector === company.primarySector &&
        !directBundles.some((db) => db.id === b.id)
    );
    return [...directBundles, ...sectorBundles].slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                A
              </span>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  AntoniusCore
                </span>
                <span className="text-xs text-rose-400 block font-medium leading-none">
                  B2B2C Marktplein
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-sm font-semibold text-rose-400 border-b-2 border-rose-500 pb-0.5"
            >
              Marktplein (Kraampjes)
            </Link>
            <Link
              href="/beheer"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Mijn Profiel & Beheer
            </Link>
            <Link
              href="/api/auth/signin"
              className="hidden sm:inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3.5 py-1.5 rounded-lg font-medium transition"
            >
              Partner Inloggen
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Interactieve Marktplein Kraampjes & Partner Bundels
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Ontdek Lokale Specialisten &{" "}
            <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Synergetische Bundels
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Wandel virtueel langs de kraampjes van aangesloten bedrijven.
            Bekijk hun gecureerde <strong>Top 5 producten</strong> en ontdek hoe bedrijven
            uit verschillende sectoren samen complete bundelpakketten aanbieden.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Zoek op bedrijfsnaam, product of specialisatie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3.5 pl-11 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-lg"
            />
            <svg
              className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white"
              >
                Wissen
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Sector Filter Bar */}
      <nav aria-label="Sectoren" className="sticky top-16 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSector("ALL")}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              selectedSector === "ALL"
                ? "bg-white text-slate-950 shadow-md font-bold"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
            }`}
          >
            <span>🎪 Alle Kraampjes</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedSector === "ALL"
                  ? "bg-slate-200 text-slate-900 font-bold"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {initialCompanies.length}
            </span>
          </button>

          {(Object.keys(SECTOR_INFO) as SectorType[]).map((sec) => {
            const info = SECTOR_INFO[sec];
            const isSelected = selectedSector === sec;
            const count = sectorCounts[sec] || 0;

            return (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? "bg-gradient-to-r " +
                      info.color +
                      " text-white shadow-md shadow-purple-900/30 font-bold"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
                }`}
              >
                <span>
                  {info.icon} {info.label}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected
                      ? "bg-white/20 text-white font-bold"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Marktplein Kraampjes</span>
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {filteredCompanies.length}{" "}
                {filteredCompanies.length === 1 ? "kraampje" : "kraampjes"}{" "}
                gevonden
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Beweeg met de muis over een kraam voor een snelle blik of klik om de
              Top 5 producten en 5 samenwerkingsbundels te verkennen.
            </p>
          </div>
        </div>

        {/* Empty state */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-md mx-auto">
            <span className="text-4xl mb-3 block">🎪</span>
            <h3 className="text-lg font-bold text-white mb-1">
              Geen kraampjes gevonden
            </h3>
            <p className="text-xs text-slate-400 mb-4 px-6">
              Er zijn geen actieve bedrijven gevonden die voldoen aan de zoekcriteria
              of geselecteerde sector.
            </p>
            <button
              onClick={() => {
                setSelectedSector("ALL");
                setSearchQuery("");
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2 rounded-lg font-semibold transition"
            >
              Filters resetten
            </button>
          </div>
        )}

        {/* Kraampjes (Market Stalls) Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCompanies.map((company) => {
            const secInfo = SECTOR_INFO[company.primarySector];
            const top5Products = company.products.filter((p) => p.isTop5);
            const otherProducts = company.products.filter((p) => !p.isTop5);
            const displayProducts = [
              ...top5Products,
              ...otherProducts,
            ].slice(0, 5);

            const companyBundles = getCompanyBundles(company);

            return (
              <div
                key={company.id}
                onClick={() => openStallDetail(company)}
                className={`group relative bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${secInfo.borderAccent} flex flex-col`}
              >
                {/* 1. Market Stall Canopy / Luifel (Striped awning) */}
                <div className="relative h-20 w-full overflow-hidden">
                  {/* Striped awning pattern */}
                  <div
                    className="absolute inset-0 flex"
                    style={{
                      background: `repeating-linear-gradient(
                        90deg,
                        ${secInfo.stripeColors[0]},
                        ${secInfo.stripeColors[0]} 24px,
                        ${secInfo.stripeColors[1]} 24px,
                        ${secInfo.stripeColors[1]} 48px
                      )`,
                    }}
                  />
                  {/* Subtle 3D shadow gradient on the awning */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60" />

                  {/* Scalloped edge / luifel franje aan de onderzijde */}
                  <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between overflow-hidden">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-4 -mb-2 rounded-full bg-slate-900 border-t border-slate-700/50 shrink-0"
                      />
                    ))}
                  </div>

                  {/* Stall Sign / Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow">
                      <span>{secInfo.icon}</span>
                      <span>{secInfo.label}</span>
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="w-7 h-7 rounded-full bg-slate-950/80 backdrop-blur border border-white/20 text-white text-xs flex items-center justify-center font-bold shadow group-hover:scale-110 transition-transform">
                      ⭐
                    </span>
                  </div>
                </div>

                {/* 2. Stall Storefront Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                      {company.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-3 leading-relaxed">
                    {company.description ||
                      "Gecertificeerde specialist aangesloten bij het AntoniusCore B2B2C portaal."}
                  </p>

                  {/* Open for collaboration badges */}
                  <div className="mb-4">
                    <span className="text-[10px] text-slate-500 font-semibold block mb-1.5 uppercase tracking-wider">
                      Open voor bundeling met:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {company.openForSectors.length > 0 ? (
                        company.openForSectors.map((s) => {
                          const sInfo = SECTOR_INFO[s];
                          return (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1"
                            >
                              <span>{sInfo?.icon}</span>
                              <span>{sInfo?.label.split(" ")[0]}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[11px] text-slate-600">
                          Geen voorkeuren opgegeven
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Kraam Toonbank / Product Showcase preview */}
                <div className="px-5 pb-4 mt-auto">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2 pb-1.5 border-b border-slate-800">
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <span>🏆</span> Top 5 Producten
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {displayProducts.length} items
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {displayProducts.slice(0, 3).map((prod, idx) => (
                        <div
                          key={prod.id || idx}
                          className="flex items-center justify-between text-xs py-0.5"
                        >
                          <span className="text-slate-300 truncate max-w-[200px]">
                            {idx + 1}. {prod.name}
                          </span>
                          <span className="text-slate-400 font-mono font-semibold text-[11px]">
                            €{prod.price.toLocaleString("nl-NL")}
                          </span>
                        </div>
                      ))}
                      {displayProducts.length > 3 && (
                        <div className="text-[10px] text-slate-500 font-medium text-right pt-0.5">
                          + nog {displayProducts.length - 3} producten bekijken →
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bundles badge preview */}
                  {companyBundles.length > 0 && (
                    <div className="flex items-center justify-between bg-purple-950/30 border border-purple-800/40 rounded-lg px-3 py-1.5 mb-3">
                      <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                        <span>📦</span> {companyBundles.length}{" "}
                        {companyBundles.length === 1 ? "Samenwerkingsbundel" : "Samenwerkingsbundels"}
                      </span>
                      <span className="text-[10px] text-purple-400 font-bold underline">
                        Bekijk
                      </span>
                    </div>
                  )}

                  {/* Action CTA Button */}
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-rose-600 group-hover:to-purple-600 shadow-md"
                  >
                    <span>Stap deze kraam binnen</span>
                    <svg
                      className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. Interactive Modal (Kraam Bezoek / Details) */}
      {activeModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Canopy / Header */}
            {(() => {
              const modalSec = SECTOR_INFO[activeModalCompany.primarySector];
              const companyBundles = getCompanyBundles(activeModalCompany);
              const top5 = activeModalCompany.products.filter((p) => p.isTop5);
              const others = activeModalCompany.products.filter((p) => !p.isTop5);
              const displayProducts = [...top5, ...others].slice(0, 5);

              return (
                <>
                  <div className="relative h-24 overflow-hidden shrink-0">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `repeating-linear-gradient(
                          90deg,
                          ${modalSec.stripeColors[0]},
                          ${modalSec.stripeColors[0]} 28px,
                          ${modalSec.stripeColors[1]} 28px,
                          ${modalSec.stripeColors[1]} 56px
                        )`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-slate-900" />

                    {/* Close button */}
                    <button
                      onClick={() => setActiveModalCompany(null)}
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center font-bold text-sm transition"
                    >
                      ✕
                    </button>

                    <div className="absolute bottom-3 left-6 right-16 flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-950/90 border border-slate-700 shadow">
                        {modalSec.icon}
                      </span>
                      <div>
                        <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                          {modalSec.label}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {activeModalCompany.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Company Quick Details */}
                  <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      {activeModalCompany.address && (
                        <span>📍 {activeModalCompany.address}</span>
                      )}
                      {activeModalCompany.kvkNumber && (
                        <span>KvK: {activeModalCompany.kvkNumber}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">
                        Samenwerkingssectoren:
                      </span>
                      {activeModalCompany.openForSectors.map((sec) => (
                        <span
                          key={sec}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                        >
                          {SECTOR_INFO[sec]?.icon}{" "}
                          {SECTOR_INFO[sec]?.label.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="px-6 border-b border-slate-800 flex gap-4 bg-slate-900">
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                        activeTab === "products"
                          ? "border-rose-500 text-rose-400"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>🏆 Top 5 Producten</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                        {displayProducts.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("bundles")}
                      className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                        activeTab === "bundles"
                          ? "border-purple-500 text-purple-400"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>📦 Samenwerkingsbundels</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                        {companyBundles.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("inquiry")}
                      className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                        activeTab === "inquiry"
                          ? "border-emerald-500 text-emerald-400"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>✍️ Directe Aanvraag / Offerte</span>
                    </button>
                  </div>

                  {/* Tab Content Body */}
                  <div className="p-6 overflow-y-auto space-y-4 grow">
                    {/* 1. TOP 5 PRODUCTS TAB */}
                    {activeTab === "products" && (
                      <div className="space-y-4">
                        <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 text-xs text-rose-300 flex items-center gap-2.5">
                          <span className="text-lg">✨</span>
                          <span>
                            Dit zijn de <strong>Top 5 geselecteerde producten</strong>{" "}
                            van {activeModalCompany.name}. Deze items zijn geoptimaliseerd
                            voor directe verkoop en cross-sector bundels.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {displayProducts.map((product, index) => (
                            <div
                              key={product.id}
                              className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                            >
                              <div className="flex items-start gap-3.5">
                                <span className="w-7 h-7 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-300 text-xs font-black flex items-center justify-center shrink-0">
                                  #{index + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-white text-sm">
                                      {product.name}
                                    </h4>
                                    {product.isTop5 && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                                        Top 5 Selectie
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 leading-relaxed">
                                    {product.description ||
                                      "Gecureerd topproduct van deze specialist."}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                <span className="font-mono text-base font-extrabold text-white">
                                  €{product.price.toLocaleString("nl-NL")}
                                </span>
                                <button
                                  onClick={() => setActiveTab("inquiry")}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                                >
                                  Aanvragen
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. BUNDLES TAB */}
                    {activeTab === "bundles" && (
                      <div className="space-y-4">
                        <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-3.5 text-xs text-purple-300 flex items-center gap-2.5">
                          <span className="text-lg">🤝</span>
                          <span>
                            <strong>Synergetische Bundels:</strong> Gecombineerde pakketten
                            waarin meerdere aangesloten bedrijven samenwerken voor een
                            complete klantervaring.
                          </span>
                        </div>

                        {companyBundles.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            Er zijn momenteel geen actieve bundels voor deze kraam.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {companyBundles.map((bundle) => {
                              const bSec = SECTOR_INFO[bundle.sector];
                              return (
                                <div
                                  key={bundle.id}
                                  className="bg-slate-950/80 border border-purple-900/40 rounded-xl p-5 hover:border-purple-600 transition"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50 font-bold">
                                          {bSec?.icon} {bSec?.label}
                                        </span>
                                        {bundle.isPreMade && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 font-semibold">
                                            Kant-en-klaar pakket
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-extrabold text-white text-base">
                                        {bundle.title}
                                      </h4>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[10px] text-slate-400 block font-medium">
                                        Bundel Totaalprijs
                                      </span>
                                      <span className="font-mono text-xl font-black text-purple-400">
                                        €{bundle.price.toLocaleString("nl-NL")}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                                    {bundle.description}
                                  </p>

                                  {/* Participating Companies */}
                                  <div className="mb-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                                      Deelnemende Partners in deze bundel:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {bundle.companies.map((bc) => (
                                        <span
                                          key={bc.company.id}
                                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1.5 font-medium"
                                        >
                                          <span>🏢</span> {bc.company.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Included items */}
                                  {bundle.items.length > 0 && (
                                    <div className="border-t border-slate-800 pt-3">
                                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                                        Inbegrepen Producten:
                                      </span>
                                      <ul className="text-xs text-slate-300 space-y-1">
                                        {bundle.items.map((it) => (
                                          <li
                                            key={it.product.id}
                                            className="flex items-center justify-between text-slate-300"
                                          >
                                            <span className="flex items-center gap-1.5">
                                              <span className="text-emerald-400 font-bold">
                                                ✓
                                              </span>{" "}
                                              {it.product.name}
                                            </span>
                                            <span className="font-mono text-slate-500 text-[11px]">
                                              €{it.product.price.toLocaleString("nl-NL")}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                                    <button
                                      onClick={() => setActiveTab("inquiry")}
                                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md"
                                    >
                                      Vraag Deze Bundel Aan
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. INQUIRY / CUSTOM REQUEST TAB */}
                    {activeTab === "inquiry" && (
                      <div className="space-y-4">
                        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 text-xs text-emerald-300 flex items-center gap-2.5">
                          <span className="text-lg">📩</span>
                          <span>
                            Stuur een vrijblijvende aanvraag of offerteverzoek direct
                            naar <strong>{activeModalCompany.name}</strong>.
                          </span>
                        </div>

                        {inquirySuccess ? (
                          <div className="bg-emerald-900/40 border border-emerald-600 rounded-xl p-6 text-center">
                            <span className="text-3xl block mb-2">🎉</span>
                            <h4 className="font-bold text-white text-base mb-1">
                              Aanvraag Succesvol Verzonden!
                            </h4>
                            <p className="text-xs text-emerald-300 mb-4">
                              Bedankt voor je aanvraag. Het bedrijf neemt zo snel
                              mogelijk contact met je op via het opgegeven e-mailadres.
                            </p>
                            <button
                              onClick={() => setInquirySuccess(false)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
                            >
                              Nieuwe aanvraag doen
                            </button>
                          </div>
                        ) : (
                          <form
                            onSubmit={handleInquirySubmit}
                            className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4"
                          >
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Jouw Naam / Bedrijfsnaam *
                              </label>
                              <input
                                type="text"
                                required
                                value={inquiryName}
                                onChange={(e) => setInquiryName(e.target.value)}
                                placeholder="bijv. Sophie van Dam / Evenementenbureau Horizon"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">
                                E-mailadres *
                              </label>
                              <input
                                type="email"
                                required
                                value={inquiryEmail}
                                onChange={(e) => setInquiryEmail(e.target.value)}
                                placeholder="sophie@voorbeeld.nl"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1">
                                Sector
                              </label>
                              <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400">
                                {SECTOR_INFO[activeModalCompany.primarySector]?.icon}{" "}
                                {SECTOR_INFO[activeModalCompany.primarySector]?.label}
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={inquiryLoading}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg disabled:opacity-50"
                            >
                              {inquiryLoading
                                ? "Verzenden..."
                                : "Verstuur Aanvraag naar " + activeModalCompany.name}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                    <span>
                      AntoniusCore B2B2C Marktplaats • Geverifieerde Specialist
                    </span>
                    <button
                      onClick={() => setActiveModalCompany(null)}
                      className="text-slate-400 hover:text-white transition font-medium"
                    >
                      Sluiten
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
