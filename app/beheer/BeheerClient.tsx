"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectorType } from "@prisma/client";
import { SECTOR_THEMES } from "@/app/components/StardewMarket";

export const STANDARD_BUSINESS_TYPES = [
  "Fotograaf",
  "Videograaf & Media",
  "Bruidsstylist & Mode",
  "Kapper & Visagist",
  "Cateraar & Kok",
  "Mobiele Barista / Cocktailbar",
  "Aannemer & Bouwbedrijf",
  "Timmerman & Interieurbouw",
  "Metselaar & Tegelzetter",
  "Schilder & Stukadoor",
  "Loodgieter & Installateur",
  "Elektricien & Domotica",
  "DJ & Geluidstechnicus",
  "Licht & Podium Techniek",
  "Muzikant & Live Act",
  "Standbouwer & Signing",
  "VIP Vervoer & Chauffeur",
  "Koerier & Transport",
  "Event Planner & Organisatie",
  "Trainer & Zakelijke Coach",
  "Kunstenaar & Decorateur",
  "Bloemist & Bloemdecoratie",
  "Patissier & Bakkerij",
  "Facilitair & Schoonmaak",
];

const ALL_SECTORS: { type: SectorType; label: string; desc: string }[] = [
  { type: "BRUILOFT", label: "Bruiloft & Romantiek", desc: "Trouwlocaties, visagie, trouwfotografie en ceremoniële styling." },
  { type: "EVENEMENTEN_FEEST", label: "Evenementen & Feest", desc: "Partylocaties, festivaltechniek, DJ's, photobooths en acts." },
  { type: "BOUW_RENOVATIE", label: "Bouw & Renovatie", desc: "Aannemers, kozijnen, badkamers, dakopbouw en duurzame installaties." },
  { type: "ZAKELIJK_CORPORATE", label: "Zakelijk & Corporate", desc: "B2B catering, congresorganisatie, standbouw en corporate video." },
  { type: "CATERING_HORECA", label: "Catering & Horeca", desc: "Foodtrucks, buffetten, mobiele cocktail- en koffiebars." },
  { type: "MARKETING_MEDIA_FOTOGRAFIE", label: "Marketing & Media", desc: "Bedrijfsfotografie, brand campaigns, content creatie en videomarketing." },
  { type: "AUTOMOTIVE_LOGISTIEK", label: "Automotive & Transport", desc: "VIP-vervoer, koeriersdiensten, expeditie en zakelijk wagenparkbeheer." },
  { type: "BEAUTY_LIFESTYLE", label: "Beauty & Lifestyle", desc: "Hairstyling, visagie, personal branding, wellness en lifestyle workshops." },
  { type: "ONDERWIJS_WORKSHOPS", label: "Onderwijs & Training", desc: "Vakopleidingen, teambuilding masterclasses, coaching en zakelijke lezingen." },
  { type: "KUNST_ENTERTAINMENT", label: "Kunst & Acts", desc: "Live muziek, theateracts, beeldende kunst, decors en custom installaties." },
];

const DAYS = [
  { day: 1, name: "Maandag" },
  { day: 2, name: "Dinsdag" },
  { day: 3, name: "Woensdag" },
  { day: 4, name: "Donderdag" },
  { day: 5, name: "Vrijdag" },
  { day: 6, name: "Zaterdag" },
  { day: 0, name: "Zondag" },
];

interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  isTop5: boolean;
  isNew?: boolean;
  _delete?: boolean;
}

interface OpeningHourItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface BeheerClientProps {
  initialCompany: {
    id: string;
    slug: string | null;
    name: string;
    businessType: string | null;
    googlePlaceId: string | null;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    city: string | null;
    address: string | null;
    serviceRadiusKm: number | null;
    availableStaff: number | null;
    clientCapacityPerProduct: number | null;
    isMarketplaceVisible: boolean;
    primarySector: SectorType;
    openForSectors: SectorType[];
    kvkNumber: string | null;
    vatNumber: string | null;
    recommendedCompanies: string[];
    blacklistedCompanies: string[];
    products: ProductItem[];
    openingHours: OpeningHourItem[];
  };
  otherCompanies: {
    id: string;
    name: string;
    slug: string | null;
    primarySector: SectorType;
    city: string | null;
    businessType: string | null;
  }[];
  userEmail: string;
  userName: string;
}

export default function BeheerClient({
  initialCompany,
  otherCompanies,
  userEmail,
  userName,
}: BeheerClientProps) {
  // Tabs: profiel | sectoren | openingstijden | catalogus | partners
  const [activeTab, setActiveTab] = useState<
    "profiel" | "sectoren" | "openingstijden" | "catalogus" | "partners"
  >("profiel");

  // Form States
  const [name, setName] = useState(initialCompany.name || "");
  const [businessType, setBusinessType] = useState(
    initialCompany.businessType || "Fotograaf"
  );
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [isCustomType, setIsCustomType] = useState(
    initialCompany.businessType ? !STANDARD_BUSINESS_TYPES.includes(initialCompany.businessType) : false
  );
  const [googlePlaceId, setGooglePlaceId] = useState(initialCompany.googlePlaceId || "");
  const [description, setDescription] = useState(initialCompany.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialCompany.websiteUrl || "");
  const [logoUrl, setLogoUrl] = useState(initialCompany.logoUrl || "");
  const [city, setCity] = useState(initialCompany.city || "");
  const [address, setAddress] = useState(initialCompany.address || "");
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    initialCompany.serviceRadiusKm ?? 30
  );
  const [availableStaff, setAvailableStaff] = useState(
    initialCompany.availableStaff ?? 1
  );
  const [clientCapacityPerProduct, setClientCapacityPerProduct] = useState(
    initialCompany.clientCapacityPerProduct ?? 5
  );
  const [isMarketplaceVisible, setIsMarketplaceVisible] = useState(
    initialCompany.isMarketplaceVisible !== false
  );
  const [primarySector, setPrimarySector] = useState<SectorType>(
    initialCompany.primarySector || "ZAKELIJK_CORPORATE"
  );
  const [openForSectors, setOpenForSectors] = useState<SectorType[]>(
    initialCompany.openForSectors || []
  );
  const [kvkNumber, setKvkNumber] = useState(initialCompany.kvkNumber || "");
  const [vatNumber, setVatNumber] = useState(initialCompany.vatNumber || "");
  const [recommendedCompanies, setRecommendedCompanies] = useState<string[]>(
    initialCompany.recommendedCompanies || []
  );

  // Opening Hours State
  const [openingHours, setOpeningHours] = useState<OpeningHourItem[]>(() => {
    return DAYS.map((d) => {
      const existing = initialCompany.openingHours.find((oh) => oh.dayOfWeek === d.day);
      return (
        existing || {
          dayOfWeek: d.day,
          openTime: "08:30",
          closeTime: "18:00",
          isClosed: d.day === 0,
        }
      );
    });
  });

  // Products State
  const [products, setProducts] = useState<ProductItem[]>(
    initialCompany.products || []
  );
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductTop5, setNewProductTop5] = useState(true);

  // UI States
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Toggle sector in openForSectors
  const toggleOpenSector = (sec: SectorType) => {
    if (openForSectors.includes(sec)) {
      setOpenForSectors(openForSectors.filter((s) => s !== sec));
    } else {
      setOpenForSectors([...openForSectors, sec]);
    }
  };

  // Toggle opening hour day
  const handleHourChange = (
    dayOfWeek: number,
    field: keyof OpeningHourItem,
    value: any
  ) => {
    setOpeningHours((prev) =>
      prev.map((oh) => (oh.dayOfWeek === dayOfWeek ? { ...oh, [field]: value } : oh))
    );
  };

  // Add Product
  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    const priceNum = parseFloat(newProductPrice) || 0;

    const newProd: ProductItem = {
      id: `temp-${Date.now()}`,
      name: newProductName.trim(),
      price: priceNum,
      description: newProductDesc.trim() || null,
      isTop5: newProductTop5,
      isNew: true,
    };

    setProducts((prev) => [...prev, newProd]);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductDesc("");
    setNewProductTop5(true);
  };

  // Toggle Top 5 for product
  const toggleProductTop5 = (index: number) => {
    setProducts((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, isTop5: !p.isTop5 } : p))
    );
  };

  // Delete product
  const handleDeleteProduct = (index: number) => {
    setProducts((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, _delete: true } : p))
    );
  };

  // Save all changes
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage(null);

    const effectiveBusinessType = isCustomType
      ? customBusinessType.trim() || "Dienstverlener"
      : businessType;

    try {
      const payload = {
        name,
        businessType: effectiveBusinessType,
        googlePlaceId,
        description,
        websiteUrl,
        logoUrl,
        city,
        address,
        serviceRadiusKm,
        availableStaff,
        clientCapacityPerProduct,
        isMarketplaceVisible,
        primarySector,
        openForSectors,
        kvkNumber,
        vatNumber,
        recommendedCompanies,
        openingHours,
        products,
      };

      const res = await fetch("/api/beheer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Opslaan mislukt");
      }

      setSaveMessage({ text: "Alle instellingen en wijzigingen zijn succesvol opgeslagen!", type: "success" });
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      setSaveMessage({ text: err.message || "Er is een fout opgetreden bij het opslaan.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const primaryTheme = SECTOR_THEMES[primarySector] || SECTOR_THEMES.ZAKELIJK_CORPORATE;
  const activeProductsCount = products.filter((p) => !p._delete).length;
  const top5Count = products.filter((p) => !p._delete && p.isTop5).length;

  return (
    <div className="min-h-screen bg-desert-market text-[#2d1808] flex flex-col font-sans select-none">
      {/* 1. Header: AntoniusCore Logo Links, Midden Titel, Rechts Kraam & Uitloggen */}
      <header className="bg-[#cca440] border-b-4 border-[#4a2810] shadow-xl px-4 sm:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.antoniuscore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn-wood px-3.5 py-2 rounded text-xs font-black tracking-wider uppercase flex items-center gap-1.5 hover:opacity-95 transition"
            >
              <span className="font-mono text-xs sm:text-sm tracking-widest text-[#fcd34d]">
                AntoniusCore
              </span>
            </a>

            <Link
              href="/"
              className="px-3 py-1.5 rounded text-xs font-bold text-[#4a2810] hover:text-[#2d1808] bg-[#edd378] border border-[#7c481f] flex items-center gap-1 transition"
            >
              ← Naar Marktplein
            </Link>
          </div>

          {/* Midden: Titel */}
          <div className="text-center">
            <h1 className="font-mono font-black text-sm sm:text-lg text-[#3b1d09] tracking-wide">
              Mijn Profiel & Marktplein Beheer
            </h1>
            <p className="text-[11px] text-[#7c481f]">
              Ingelogd als <strong className="text-[#3b1d09]">{userName}</strong> ({userEmail})
            </p>
          </div>

          {/* Rechts: Bekijk Kraampje & Opslaan */}
          <div className="flex items-center gap-2">
            <Link
              href="/beheer/projecten"
              className="pixel-btn-wood px-3 py-1.5 rounded text-xs font-bold hover:scale-105 transition flex items-center gap-1"
            >
              <span>💬 Projecten & Chat</span>
            </Link>

            {initialCompany.slug && (
              <Link
                href={`/bedrijf/${initialCompany.slug}`}
                target="_blank"
                className="pixel-btn-gold px-3 py-1.5 rounded text-xs font-bold hover:scale-105 transition"
              >
                Bekijk Kraampje ↗
              </Link>
            )}

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="pixel-btn-red px-4 py-2 rounded text-xs font-black tracking-wider uppercase shadow-md disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Feedback Melding */}
      {saveMessage && (
        <div
          className={`px-4 py-3 text-center text-xs font-bold border-b-2 ${
            saveMessage.type === "success"
              ? "bg-emerald-100 text-emerald-900 border-emerald-500"
              : "bg-rose-100 text-rose-900 border-rose-500"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* 3. Hoofd Beheer Container */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        {/* Navigatie Tabs in Stardew Valley Hout- en Perkamentstijl */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-2 border-b-2 border-[#7c481f]/40">
          <button
            onClick={() => setActiveTab("profiel")}
            className={`px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
              activeTab === "profiel"
                ? "pixel-btn-wood text-[#fffbf2]"
                : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
            }`}
          >
            1. Bedrijf & Kraam
          </button>

          <button
            onClick={() => setActiveTab("sectoren")}
            className={`px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
              activeTab === "sectoren"
                ? "pixel-btn-wood text-[#fffbf2]"
                : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
            }`}
          >
            2. Sectoren & Synergie
          </button>

          <button
            onClick={() => setActiveTab("openingstijden")}
            className={`px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
              activeTab === "openingstijden"
                ? "pixel-btn-wood text-[#fffbf2]"
                : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
            }`}
          >
            3. Openingstijden & Bereik
          </button>

          <button
            onClick={() => setActiveTab("catalogus")}
            className={`px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
              activeTab === "catalogus"
                ? "pixel-btn-wood text-[#fffbf2]"
                : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
            }`}
          >
            4. Catalogus & Top 5 ({activeProductsCount})
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer border ${
              activeTab === "partners"
                ? "pixel-btn-wood text-[#fffbf2]"
                : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
            }`}
          >
            5. Aanbevolen Partners ({recommendedCompanies.length})
          </button>

          <Link
            href="/beheer/projecten"
            className="px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer border bg-emerald-100 text-emerald-900 border-emerald-500 hover:bg-emerald-200 flex items-center gap-1 shadow-xs"
          >
            <span>💬 6. Projecten & Chat</span>
          </Link>
        </div>

        {/* TAB 1: BEDRIJFSPROFIEL & MARKTKRAAM */}
        {activeTab === "profiel" && (
          <div className="space-y-6">
            <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
              <div className="border-b-2 border-[#7c481f] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                    Bedrijfsgegevens & Kraampje Weergave
                  </h2>
                  <p className="text-xs text-[#7c481f]">
                    Beheer hoe uw marktkraam en bedrijfspagina getoond worden aan bezoekers.
                  </p>
                </div>

                {/* ZICHTBAARHEID OP HET MARKTPLEIN SCHAKELAAR */}
                <div className="p-3 bg-[#fff4d4] rounded-lg border-2 border-[#7c481f] flex items-center gap-3">
                  <div>
                    <span className="font-bold text-xs text-[#3b1d09] block">
                      Kraampje zichtbaar op Marktplein
                    </span>
                    <span className="text-[10px] text-[#7c481f]">
                      {isMarketplaceVisible ? "Open op marktplein" : "Gesloten (alleen via directe link)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMarketplaceVisible(!isMarketplaceVisible)}
                    className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      isMarketplaceVisible
                        ? "bg-emerald-700 text-white border border-emerald-900 shadow-sm"
                        : "bg-rose-700 text-white border border-rose-900 shadow-sm"
                    }`}
                  >
                    {isMarketplaceVisible ? "Open" : "Dicht"}
                  </button>
                </div>
              </div>

              {/* Formulier Velden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Bedrijfsnaam */}
                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Volledige Bedrijfsnaam *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="bijv. Château Moments Fotografie"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#4a2810]"
                  />
                  <p className="text-[10px] text-[#7c481f] mt-1">
                    Wordt altijd volledig en zonder afkapping boven uw marktkraam getoond.
                  </p>
                </div>

                {/* BEDRIJFSTYPE (DROPDOWN MET RUIME SELECTIE) */}
                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Bedrijfstype (Getoond op voorkant van het kraampje) *
                  </label>
                  <select
                    value={isCustomType ? "__custom__" : businessType}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomType(true);
                      } else {
                        setIsCustomType(false);
                        setBusinessType(e.target.value);
                      }
                    }}
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#4a2810]"
                  >
                    {STANDARD_BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value="__custom__">-- Ander bedrijfstype (Zelf invoeren) --</option>
                  </select>

                  {isCustomType && (
                    <input
                      type="text"
                      value={customBusinessType}
                      onChange={(e) => setCustomBusinessType(e.target.value)}
                      placeholder="Vul uw specifieke bedrijfstype in (bijv. Timmerman)..."
                      className="w-full mt-2 bg-[#fff4d4] border-2 border-[#ba793a] rounded px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                  )}
                  <p className="text-[10px] text-[#7c481f] mt-1">
                    Staat op de houten toonbank van uw kraampje op het plein (zoals 'Fotograaf', 'Cateraar', 'Aannemer').
                  </p>
                </div>

                {/* GOOGLE PLACE ID KOPPELING */}
                <div className="md:col-span-2 p-4 bg-[#fff8e7] border-2 border-[#7c481f] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-white border border-[#7c481f] font-black text-xs text-[#4285F4] flex items-center justify-center">
                        G
                      </span>
                      <label className="font-bold text-[#4a2810]">
                        Google Reviews & Google Maps Koppeling (Google Place ID)
                      </label>
                    </div>
                    {googlePlaceId && (
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                        Gekoppeld
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={googlePlaceId}
                    onChange={(e) => setGooglePlaceId(e.target.value)}
                    placeholder="bijv. ChIJN1t_tDeuEmsRUsoyG83frY4"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-mono font-semibold focus:outline-none"
                  />
                  <p className="text-[11px] text-[#7c481f]">
                    Hiermee toont uw bedrijfspagina direct Google rating-sterren en recente Google Maps reviews voor klanten.
                  </p>
                </div>

                {/* Omschrijving / Bio */}
                <div className="md:col-span-2">
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Bedrijfsomschrijving / Pitch
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Korte, pakkende omschrijving van uw vakmanschap en specialisaties..."
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#4a2810]"
                  />
                </div>

                {/* Stad & Adres */}
                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Plaats / Stad *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="bijv. Amsterdam"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Vestigingsadres
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="bijv. Keizersgracht 420"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* Website URL & Logo URL */}
                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://uw-bedrijf.nl"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Logo / Foto URL
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                {/* KvK & BTW */}
                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    KvK-nummer
                  </label>
                  <input
                    type="text"
                    value={kvkNumber}
                    onChange={(e) => setKvkNumber(e.target.value)}
                    placeholder="84729103"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    BTW-identificatienummer
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="NL847291032B01"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECTOREN & SYNERGIE */}
        {activeTab === "sectoren" && (
          <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
            <div className="border-b-2 border-[#7c481f] pb-3">
              <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                Sectoren & Marktplein Dakkleur
              </h2>
              <p className="text-xs text-[#7c481f]">
                Kies uw hoofdsector (bepaalt het dakje van uw kraam) en de sectoren waarmee u openstaat voor samenwerking.
              </p>
            </div>

            {/* Primaire Sector Selectie met Dakje Preview */}
            <div>
              <label className="block font-bold text-[#4a2810] mb-2 text-xs uppercase tracking-wider">
                1. Primaire Sector (Dakkleur van uw kraampje)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_SECTORS.map((sec) => {
                  const isSelected = primarySector === sec.type;
                  const theme = SECTOR_THEMES[sec.type];

                  return (
                    <div
                      key={sec.type}
                      onClick={() => setPrimarySector(sec.type)}
                      className={`p-3.5 rounded-lg border-2 cursor-pointer transition flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#fff8e7] border-[#4a2810] shadow-md scale-[1.02]"
                          : "bg-[#fff4d4] border-[#ba793a] hover:bg-[#ffeec2]"
                      }`}
                    >
                      {/* Mini Luifel Preview */}
                      <div
                        className="w-8 h-8 rounded border-2 border-black/30 shrink-0 shadow-xs"
                        style={{
                          backgroundImage: theme.isWood
                            ? `repeating-linear-gradient(90deg, ${theme.roofColor1}, ${theme.roofColor1} 4px, ${theme.roofColor2} 4px, ${theme.roofColor2} 8px)`
                            : `repeating-linear-gradient(90deg, ${theme.roofColor1}, ${theme.roofColor1} 4px, ${theme.roofColor2} 4px, ${theme.roofColor2} 8px)`,
                        }}
                      />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#3b1d09] text-xs">
                            {sec.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] text-amber-800 font-black">
                              (Actief)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7c481f] mt-0.5 line-clamp-2">
                          {sec.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Open voor samenwerking met (Checkboxes) */}
            <div>
              <label className="block font-bold text-[#4a2810] mb-2 text-xs uppercase tracking-wider">
                2. Open Voor Samenwerking Met ({openForSectors.length} van {ALL_SECTORS.length} sectoren)
              </label>
              <p className="text-xs text-[#7c481f] mb-3">
                Bedrijven uit deze sectoren kunnen met u gecombineerde aanvragen en bundels vormen op het plein.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ALL_SECTORS.map((sec) => {
                  const isChecked = openForSectors.includes(sec.type);
                  return (
                    <label
                      key={sec.type}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between text-xs ${
                        isChecked
                          ? "bg-[#edd378] border-[#7c481f] font-bold text-[#3b1d09]"
                          : "bg-[#fff4d4] border-[#ba793a] text-[#5c3011]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                          style={{ backgroundColor: SECTOR_THEMES[sec.type]?.roofColor1 }}
                        />
                        <span>{sec.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOpenSector(sec.type)}
                        className="accent-[#dc2626] w-4 h-4"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OPENINGSTIJDEN & CAPACITEIT */}
        {activeTab === "openingstijden" && (
          <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
            <div className="border-b-2 border-[#7c481f] pb-3">
              <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                Openingstijden, Leveringsgebied & Capaciteit
              </h2>
              <p className="text-xs text-[#7c481f]">
                Beheer uw werkbare straal (km), beschikbare personeelsbezetting en openingsuren.
              </p>
            </div>

            {/* Bereik & Capaciteit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#fff4d4] rounded-lg border-2 border-[#7c481f]">
                <label className="block font-bold text-[#4a2810] mb-1">
                  Leveringsstraal (km)
                </label>
                <input
                  type="number"
                  min={5}
                  max={250}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  className="w-full bg-[#fff8e7] border border-[#7c481f] rounded px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-[#7c481f] mt-1 block">
                  Klanten buiten deze straal zien uw bereikindicatie.
                </span>
              </div>

              <div className="p-4 bg-[#fff4d4] rounded-lg border-2 border-[#7c481f]">
                <label className="block font-bold text-[#4a2810] mb-1">
                  Beschikbaar Personeel
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={availableStaff}
                  onChange={(e) => setAvailableStaff(Number(e.target.value))}
                  className="w-full bg-[#fff8e7] border border-[#7c481f] rounded px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-[#7c481f] mt-1 block">
                  Aantal medewerkers / specialisten beschikbaar.
                </span>
              </div>

              <div className="p-4 bg-[#fff4d4] rounded-lg border-2 border-[#7c481f]">
                <label className="block font-bold text-[#4a2810] mb-1">
                  Klantcapaciteit per Dag
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={clientCapacityPerProduct}
                  onChange={(e) => setClientCapacityPerProduct(Number(e.target.value))}
                  className="w-full bg-[#fff8e7] border border-[#7c481f] rounded px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-[#7c481f] mt-1 block">
                  Aantal parallelle boekingen of klussen per dag.
                </span>
              </div>
            </div>

            {/* Openingstijden Per Dag */}
            <div className="space-y-2">
              <label className="block font-bold text-[#4a2810] text-xs uppercase tracking-wider mb-2">
                Openingstijden per Weekdag (Bepaalt de 'Nu Geopend' indicator op de markt)
              </label>

              <div className="space-y-1.5">
                {DAYS.map((d) => {
                  const item = openingHours.find((oh) => oh.dayOfWeek === d.day) || {
                    dayOfWeek: d.day,
                    openTime: "08:30",
                    closeTime: "18:00",
                    isClosed: false,
                  };

                  return (
                    <div
                      key={d.day}
                      className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs ${
                        item.isClosed
                          ? "bg-[#fff4d4]/50 border-[#ba793a]/40 text-[#7c481f]"
                          : "bg-[#fff4d4] border-[#7c481f] text-[#3b1d09]"
                      }`}
                    >
                      <div className="w-28 font-bold">{d.name}</div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isClosed}
                            onChange={(e) =>
                              handleHourChange(d.day, "isClosed", e.target.checked)
                            }
                            className="accent-rose-700 w-3.5 h-3.5"
                          />
                          <span>Gesloten</span>
                        </label>
                      </div>

                      {!item.isClosed && (
                        <div className="flex items-center gap-2">
                          <span>Van:</span>
                          <input
                            type="time"
                            value={item.openTime}
                            onChange={(e) =>
                              handleHourChange(d.day, "openTime", e.target.value)
                            }
                            className="bg-[#fff8e7] border border-[#7c481f] rounded px-2 py-1 text-xs font-mono font-bold"
                          />
                          <span>Tot:</span>
                          <input
                            type="time"
                            value={item.closeTime}
                            onChange={(e) =>
                              handleHourChange(d.day, "closeTime", e.target.value)
                            }
                            className="bg-[#fff8e7] border border-[#7c481f] rounded px-2 py-1 text-xs font-mono font-bold"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCTEN CATALOGUS & TOP 5 ETALAGE */}
        {activeTab === "catalogus" && (
          <div className="space-y-6">
            <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
              <div className="border-b-2 border-[#7c481f] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                    Producten & Top 5 Marktkraam Etalage
                  </h2>
                  <p className="text-xs text-[#7c481f]">
                    De 5 items met het vinkje "Top 5 Etalage" verschijnen direct in de zwevende pop-up zodra een bezoeker over uw kraampje beweegt.
                  </p>
                </div>

                <div className="text-xs font-mono font-bold text-[#4a2810] bg-[#edd378] px-3 py-1.5 rounded border border-[#7c481f]">
                  Etalage: {top5Count} / 5 geselecteerd
                </div>
              </div>

              {/* Product Toevoegen Formulier */}
              <div className="p-4 bg-[#fff8e7] rounded-lg border-2 border-[#7c481f] space-y-3 text-xs">
                <span className="font-black text-[#3b1d09] uppercase tracking-wider block">
                  + Nieuw Product of Dienst Toevoegen
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#4a2810] mb-1">
                      Product / Dienst Naam *
                    </label>
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="bijv. Bruidsreportage 6 Uur of Spouwmuurisolatie"
                      className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4a2810] mb-1">
                      Prijs (€) *
                    </label>
                    <input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="bijv. 495"
                      className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-bold text-[#4a2810] mb-1">
                      Korte Omschrijving
                    </label>
                    <input
                      type="text"
                      value={newProductDesc}
                      onChange={(e) => setNewProductDesc(e.target.value)}
                      placeholder="Optionele specificatie van inhoud of oplevering..."
                      className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#4a2810]">
                    <input
                      type="checkbox"
                      checked={newProductTop5}
                      onChange={(e) => setNewProductTop5(e.target.checked)}
                      className="accent-[#dc2626] w-4 h-4"
                    />
                    <span>Direct tonen in Top 5 Etalage van marktkraam</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="pixel-btn-wood px-4 py-1.5 rounded text-xs font-bold"
                  >
                    Toevoegen aan Catalogus
                  </button>
                </div>
              </div>

              {/* Bestaande Producten Lijst */}
              <div className="space-y-2">
                <span className="font-black text-[#3b1d09] text-xs uppercase tracking-wider block">
                  Catalogus Overzicht ({activeProductsCount} producten)
                </span>

                {products.filter((p) => !p._delete).length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7c481f] italic bg-[#fff4d4] rounded-lg border border-[#ba793a]">
                    Nog geen producten in uw catalogus. Voeg hierboven uw eerste dienst of product toe.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map((prod, index) => {
                      if (prod._delete) return null;

                      return (
                        <div
                          key={prod.id || index}
                          className={`p-3 rounded-lg border-2 flex items-center justify-between gap-3 text-xs ${
                            prod.isTop5
                              ? "bg-[#fff8e7] border-[#7c481f] shadow-xs"
                              : "bg-[#fff4d4] border-[#ba793a]/60"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#3b1d09] truncate">
                                {prod.name}
                              </span>
                              {prod.isTop5 && (
                                <span className="bg-[#edd378] text-[#4a2810] text-[9px] font-black uppercase px-1.5 py-0.2 rounded border border-[#7c481f] shrink-0">
                                  Top 5 Etalage
                                </span>
                              )}
                            </div>
                            {prod.description && (
                              <p className="text-[11px] text-[#7c481f] truncate mt-0.5">
                                {prod.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-bold text-sm text-[#3b1d09]">
                              €{prod.price}
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleProductTop5(index)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                prod.isTop5
                                  ? "bg-amber-700 text-white border-amber-900"
                                  : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#ffeec2]"
                              }`}
                            >
                              {prod.isTop5 ? "In Etalage ✓" : "+ Etalage"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(index)}
                              className="text-red-700 hover:text-red-900 font-bold px-2 py-1 text-xs"
                              title="Verwijder product"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AANBEVOLEN PARTNERS */}
        {activeTab === "partners" && (
          <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
            <div className="border-b-2 border-[#7c481f] pb-3">
              <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                Aanbevolen Marktpartners
              </h2>
              <p className="text-xs text-[#7c481f]">
                Selecteer bedrijven op het plein die u met trots aanbeveelt aan uw eigen opdrachtgevers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherCompanies.map((oc) => {
                const isRecommended = recommendedCompanies.includes(oc.id);

                return (
                  <div
                    key={oc.id}
                    onClick={() => {
                      if (isRecommended) {
                        setRecommendedCompanies(
                          recommendedCompanies.filter((id) => id !== oc.id)
                        );
                      } else {
                        setRecommendedCompanies([...recommendedCompanies, oc.id]);
                      }
                    }}
                    className={`p-3.5 rounded-lg border-2 cursor-pointer transition flex items-center justify-between text-xs ${
                      isRecommended
                        ? "bg-[#edd378] border-[#7c481f] shadow-md font-bold"
                        : "bg-[#fff4d4] border-[#ba793a] hover:bg-[#ffeec2]"
                    }`}
                  >
                    <div>
                      <div className="text-[#3b1d09] font-bold">{oc.name}</div>
                      <div className="text-[10px] text-[#7c481f]">
                        {oc.businessType || oc.primarySector} • {oc.city || "Nederland"}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={() => {}}
                      className="accent-[#dc2626] w-4 h-4"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t-2 border-[#7c481f]/30 bg-[#cca440]/60 p-4 text-center text-xs text-[#4a2810]">
        AntoniusCore B2B2C Marktplein Beheer • Alle instellingen worden direct gesynchroniseerd met uw marktkraam.
      </footer>
    </div>
  );
}
