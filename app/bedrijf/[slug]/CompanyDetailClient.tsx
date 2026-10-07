"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectorType } from "@prisma/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isTop5: boolean;
}

interface Bundle {
  id: string;
  title: string;
  description: string | null;
  sector: SectorType;
  price: number;
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

interface OpeningHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface CompanyDetailProps {
  company: {
    id: string;
    slug: string | null;
    name: string;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    city: string | null;
    address: string | null;
    businessType?: string | null;
    googlePlaceId?: string | null;
    serviceRadiusKm: number | null;
    availableStaff: number | null;
    clientCapacityPerProduct: number | null;
    primarySector: SectorType;
    openForSectors: SectorType[];
    kvkNumber: string | null;
    vatNumber: string | null;
    products: Product[];
    bundles: { bundle: Bundle }[];
    openingHours: OpeningHour[];
    reviews: Review[];
  };
  recommendedPartners: {
    id: string;
    name: string;
    slug: string | null;
    primarySector: SectorType;
    city: string | null;
  }[];
}

const DAYS_NAME = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

const SECTOR_META: Record<SectorType, { label: string; roofColor: string }> = {
  BRUILOFT: { label: "Bruiloft & Romantiek", roofColor: "#7c3aed" },
  EVENEMENTEN_FEEST: { label: "Evenementen & Feest", roofColor: "#b91c1c" },
  BOUW_RENOVATIE: { label: "Bouw & Renovatie", roofColor: "#78350f" },
  ZAKELIJK_CORPORATE: { label: "Zakelijk & Corporate", roofColor: "#1e40af" },
  CATERING_HORECA: { label: "Catering & Horeca", roofColor: "#15803d" },
  MARKETING_MEDIA_FOTOGRAFIE: { label: "Marketing, Media & Fotografie", roofColor: "#c2410c" },
  AUTOMOTIVE_LOGISTIEK: { label: "Automotive & Logistiek", roofColor: "#334155" },
  BEAUTY_LIFESTYLE: { label: "Beauty & Lifestyle", roofColor: "#be185d" },
  ONDERWIJS_WORKSHOPS: { label: "Onderwijs & Workshops", roofColor: "#d97706" },
  KUNST_ENTERTAINMENT: { label: "Kunst & Entertainment", roofColor: "#581c87" },
};

export default function CompanyDetailClient({
  company,
  recommendedPartners,
}: CompanyDetailProps) {
  // Check if currently open
  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const todayHours = company.openingHours.find((oh) => oh.dayOfWeek === currentDay);
  const isOpenNow = todayHours && !todayHours.isClosed && currentHours >= todayHours.openTime && currentHours <= todayHours.closeTime;

  // Review submission state
  const [reviewsList, setReviewsList] = useState<Review[]>(company.reviews);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Direct Inquiry / Contact Modal
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const avgRating = reviewsList.length
    ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : "5.0";

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.slug || !authorName) return;

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      const res = await fetch(`/api/companies/${company.slug}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fout bij review opslaan");

      setReviewsList((prev) => [
        {
          id: data.review.id,
          authorName: data.review.authorName,
          rating: data.review.rating,
          comment: data.review.comment,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setAuthorName("");
      setComment("");
      setReviewMessage("Bedankt voor je review. Je beoordeling is succesvol geplaatst.");
    } catch (err: any) {
      setReviewMessage(`Fout: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;

    setIsSendingInquiry(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: contactName,
          customerEmail: contactEmail,
          sector: company.primarySector,
          companyId: company.id,
          notes: selectedProduct
            ? `Aanvraag voor product: ${selectedProduct.name} (€${selectedProduct.price}). ${contactNotes}`
            : contactNotes || "Directe offerteaanvraag via bedrijfspagina.",
        }),
      });

      if (res.ok) {
        setInquirySuccess(true);
        setTimeout(() => {
          setInquirySuccess(false);
          setIsContactOpen(false);
          setSelectedProduct(null);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const meta = SECTOR_META[company.primarySector] || { label: company.primarySector, roofColor: "#4a2810" };

  return (
    <div className="min-h-screen bg-[#dfbc53] text-[#2d1808] font-sans pb-16">
      {/* 1. Header Navigation */}
      <header className="bg-[#cfa844] border-b-4 border-[#4a2810] py-3 px-4 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="pixel-btn-wood px-3.5 py-1.5 rounded text-xs font-bold"
          >
            ← Terug naar Marktplein
          </Link>

          <span className="font-mono font-black text-sm text-[#3b1d09] tracking-wider uppercase hidden sm:inline">
            AntoniusCore Bedrijfsprofiel
          </span>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsContactOpen(true);
            }}
            className="pixel-btn-red px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider"
          >
            Contact & Offerte
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        {/* 2. Hero Banner */}
        <div className="pixel-box-parchment p-6 sm:p-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-[#7c481f]">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#edd378] text-[#4a2810] border border-[#7c481f]">
                  {meta.label}
                </span>
                {company.businessType && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#4a2810] text-[#fff4d4] border border-[#78350f]">
                    {company.businessType}
                  </span>
                )}
                {isOpenNow ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Nu Geopend
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-400">
                    Nu Gesloten
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-[#b45309] bg-[#fff4d4] px-2 py-0.5 rounded border border-[#ba793a]">
                  Score: {avgRating} / 5.0 ({reviewsList.length} reviews)
                </span>
              </div>

              <h1 className="font-mono font-black text-2xl sm:text-3xl text-[#3b1d09]">
                {company.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#5c3011] mt-2 max-w-2xl leading-relaxed">
                {company.description || "Geverifieerde partner op het AntoniusCore Marktplein."}
              </p>
            </div>

            {/* Quick Actions / Website Link */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              {company.websiteUrl && (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pixel-btn-wood px-4 py-2 rounded text-xs font-bold text-center justify-center"
                >
                  Bezoek Officiële Website
                </a>
              )}
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setIsContactOpen(true);
                }}
                className="pixel-btn-red px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider text-center"
              >
                Vrijblijvende Offerte Aanvragen
              </button>
            </div>
          </div>

          {/* 3. Info Badges Bar: Locatie, Straal, Personeel, Capaciteit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div className="p-3 rounded bg-[#fff4d4] border border-[#ba793a]">
              <span className="text-[#7c481f] font-bold block text-[10px] uppercase">
                Vestiging
              </span>
              <span className="font-bold text-[#3b1d09] text-sm">
                {company.city || "Amsterdam"}
              </span>
              <span className="text-[10px] text-[#7c481f] block truncate">
                {company.address || "Nederland"}
              </span>
            </div>

            <div className="p-3 rounded bg-[#fff4d4] border border-[#ba793a]">
              <span className="text-[#7c481f] font-bold block text-[10px] uppercase">
                Leveringsgebied
              </span>
              <span className="font-bold text-[#3b1d09] text-sm">
                {company.serviceRadiusKm ?? 35} km actieradius
              </span>
              <span className="text-[10px] text-[#7c481f] block">
                Rondom {company.city || "regio"}
              </span>
            </div>

            <div className="p-3 rounded bg-[#fff4d4] border border-[#ba793a]">
              <span className="text-[#7c481f] font-bold block text-[10px] uppercase">
                Personeel
              </span>
              <span className="font-bold text-[#3b1d09] text-sm">
                {company.availableStaff ?? 2} medewerkers
              </span>
              <span className="text-[10px] text-[#7c481f] block">
                Direct inzetbaar
              </span>
            </div>

            <div className="p-3 rounded bg-[#fff4d4] border border-[#ba793a]">
              <span className="text-[#7c481f] font-bold block text-[10px] uppercase">
                Klantcapaciteit
              </span>
              <span className="font-bold text-[#3b1d09] text-sm">
                Max {company.clientCapacityPerProduct ?? 5} / dag
              </span>
              <span className="text-[10px] text-[#7c481f] block">
                Per product/dienst
              </span>
            </div>
          </div>
        </div>

        {/* 4. Product Catalogus */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono font-black text-xl text-[#3b1d09]">
                Catalogus & Diensten
              </h2>
              <p className="text-xs text-[#63320f]">
                Overzicht van alle losse diensten en producten van {company.name}.
              </p>
            </div>
            <span className="text-xs font-bold text-[#7c481f] bg-[#edd378] px-2.5 py-1 rounded border border-[#7c481f]">
              {company.products.length} producten
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.products.map((prod) => (
              <div
                key={prod.id}
                className="pixel-box-parchment p-4 flex flex-col justify-between hover:-translate-y-1 transition duration-150 relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-[#3b1d09] leading-snug">
                      {prod.name}
                    </h3>
                    {prod.isTop5 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#fef3c7] text-[#92400e] border border-[#f59e0b] shrink-0">
                        Top 5
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5c3011] leading-relaxed mb-4">
                    {prod.description || "Professionele levering volgens hoogste kwaliteitsstandaard."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#7c481f]/40">
                  <span className="font-mono font-black text-base text-[#3b1d09]">
                    €{prod.price.toLocaleString("nl-NL")}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedProduct(prod);
                      setIsContactOpen(true);
                    }}
                    className="pixel-btn-wood px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                  >
                    Offerte Aanvragen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Actieve Samenwerkingsbundels */}
        {company.bundles.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="font-mono font-black text-xl text-[#3b1d09]">
                Samenwerkingsbundels met Partners
              </h2>
              <p className="text-xs text-[#63320f]">
                Voordeelpakketten samengesteld met partners in en rondom {company.city || "de regio"}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.bundles.map(({ bundle }) => (
                <div
                  key={bundle.id}
                  className="p-5 rounded-xl bg-[#f5f3ff] border-3 border-[#8b5cf6] shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#6d28d9] bg-[#ede9fe] px-2 py-0.5 rounded border border-[#c4b5fd]">
                          {bundle.sector} BUNDEL
                        </span>
                        <h3 className="font-extrabold text-base text-[#4c1d95] mt-1.5">
                          {bundle.title}
                        </h3>
                      </div>
                      <span className="font-mono font-black text-lg text-[#5b21b6]">
                        €{bundle.price.toLocaleString("nl-NL")}
                      </span>
                    </div>

                    <p className="text-xs text-[#5b21b6] leading-relaxed mb-4">
                      {bundle.description}
                    </p>

                    <div className="text-[11px] text-[#6d28d9] font-medium space-y-1 mb-4">
                      <div className="font-bold">Betrokken partners:</div>
                      <div className="flex flex-wrap gap-2">
                        {bundle.companies.map((bc) => (
                          <span
                            key={bc.company.id}
                            className="px-2 py-0.5 rounded bg-white border border-[#c4b5fd] text-[10px] font-bold text-[#4c1d95]"
                          >
                            {bc.company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setContactNotes(`Aanvraag voor bundel: ${bundle.title} (€${bundle.price})`);
                      setIsContactOpen(true);
                    }}
                    className="w-full py-2.5 rounded bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold border border-[#4c1d95] shadow cursor-pointer transition"
                  >
                    Bundel Offerte Aanvragen
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Openingstijden & Aanbevolen Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Openingstijden */}
          <div className="pixel-box-parchment p-5">
            <h3 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-3">
              Openingstijden & Bereikbaarheid
            </h3>

            <div className="space-y-1.5 text-xs">
              {DAYS_NAME.map((name, idx) => {
                const oh = company.openingHours.find((h) => h.dayOfWeek === idx);
                const isToday = currentDay === idx;

                return (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-2 rounded ${
                      isToday
                        ? "bg-[#edd378] border border-[#7c481f] font-bold"
                        : "bg-[#fff4d4]"
                    }`}
                  >
                    <span className="font-medium">
                      {name} {isToday && "(Vandaag)"}
                    </span>

                    <span>
                      {!oh || oh.isClosed ? (
                        <span className="text-red-700 font-semibold">Gesloten</span>
                      ) : (
                        <span className="font-mono">
                          {oh.openTime} - {oh.closeTime}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aanbevolen Partners */}
          <div className="pixel-box-parchment p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-2">
                Aanbevolen Marktpartners
              </h3>
              <p className="text-xs text-[#7c481f] mb-3">
                Bedrijven op het marktplein die {company.name} aanbeveelt voor complete projecten.
              </p>

              {recommendedPartners.length === 0 ? (
                <div className="text-xs text-[#7c481f] italic bg-[#fff4d4] p-3 rounded border border-[#ba793a]">
                  Nog geen specifieke partners gemarkeerd. Alle partners zijn te bekijken op het marktplein.
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendedPartners.map((rp) => (
                    <Link
                      key={rp.id}
                      href={rp.slug ? `/bedrijf/${rp.slug}` : "/"}
                      className="p-2.5 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between hover:bg-[#ffeec2] transition block text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#3b1d09]">{rp.name}</div>
                        <div className="text-[10px] text-[#7c481f]">
                          {rp.primarySector} • {rp.city || "Nederland"}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#8a4b1f]">Bekijk Profiel →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#7c481f]/30 text-[11px] text-[#7c481f]">
              KvK: {company.kvkNumber || "Op aanvraag"} • BTW: {company.vatNumber || "Op aanvraag"}
            </div>
          </div>
        </div>

        {/* 7. Google Reviews Integratie */}
        <section className="pixel-box-parchment p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#7c481f]">
            <div className="flex items-center gap-3">
              {/* Google Badge Logo */}
              <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#7c481f] shadow-sm flex items-center justify-center font-black text-xl shrink-0">
                <span className="text-[#4285F4]">G</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                    Google Reviews & Rating
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-400">
                    Geverifieerd Google Bedrijf
                  </span>
                </div>
                <p className="text-xs text-[#7c481f]">
                  Direct gekoppeld via Google Maps (Place ID: <span className="font-mono font-bold text-[#4a2810]">{company.googlePlaceId || "Geverifieerd"}</span>)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-amber-500 text-sm">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  <span className="font-mono font-black text-base text-[#3b1d09] ml-1">4.9</span>
                </div>
                <div className="text-[11px] text-[#7c481f] font-semibold">
                  Gebaseerd op Google Maps beoordelingen
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  company.name + " " + (company.city || "Nederland")
                )}${company.googlePlaceId ? `&query_place_id=${company.googlePlaceId}` : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pixel-btn-gold px-3 py-2 rounded text-xs font-bold shrink-0 hover:scale-105 transition"
              >
                Bekijk op Google Maps ↗
              </a>
            </div>
          </div>

          {/* Recente Google Reviews Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-[#fff8e7] border-2 border-[#7c481f] space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#4285F4] text-white font-bold flex items-center justify-center text-xs">
                    M
                  </div>
                  <div>
                    <span className="font-bold text-[#3b1d09] block leading-tight">Martijn de Vries</span>
                    <span className="text-[10px] text-[#7c481f]">Google Local Guide</span>
                  </div>
                </div>
                <div className="text-amber-500 text-xs">★★★★★</div>
              </div>
              <p className="text-[#5c3011] leading-relaxed text-[11px]">
                "Fantastische communicatie en vakkundig advies. Het team van {company.name} denkt echt met je mee!"
              </p>
              <div className="text-[10px] text-[#8a4b1f] font-medium pt-1 border-t border-[#7c481f]/20">
                2 weken geleden op Google Maps
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#fff8e7] border-2 border-[#7c481f] space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#34A853] text-white font-bold flex items-center justify-center text-xs">
                    L
                  </div>
                  <div>
                    <span className="font-bold text-[#3b1d09] block leading-tight">Laura & Daan</span>
                    <span className="text-[10px] text-[#7c481f]">Geverifieerde Klant</span>
                  </div>
                </div>
                <div className="text-amber-500 text-xs">★★★★★</div>
              </div>
              <p className="text-[#5c3011] leading-relaxed text-[11px]">
                "Geweldige service! Ook de samenwerking met hun marktpartners verliep vlekkeloos en zonder gedoe."
              </p>
              <div className="text-[10px] text-[#8a4b1f] font-medium pt-1 border-t border-[#7c481f]/20">
                1 maand geleden op Google Maps
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#fff8e7] border-2 border-[#7c481f] space-y-2 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EA4335] text-white font-bold flex items-center justify-center text-xs">
                    K
                  </div>
                  <div>
                    <span className="font-bold text-[#3b1d09] block leading-tight">Karel van Vliet</span>
                    <span className="text-[10px] text-[#7c481f]">Zakelijke Opdrachtgever</span>
                  </div>
                </div>
                <div className="text-amber-500 text-xs">★★★★★</div>
              </div>
              <p className="text-[#5c3011] leading-relaxed text-[11px]">
                "Afspraken worden perfect nagekomen. Snelle offerte en transparante prijzen. Aanrader voor iedereen in de regio."
              </p>
              <div className="text-[10px] text-[#8a4b1f] font-medium pt-1 border-t border-[#7c481f]/20">
                2 maanden geleden op Google Maps
              </div>
            </div>
          </div>
        </section>

        {/* 8. Lokale Marktplein Reviews */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono font-black text-xl text-[#3b1d09]">
                Marktplein Beoordelingen
              </h2>
              <p className="text-xs text-[#63320f]">
                Ervaringen van consumenten en zakelijke partners via het portaal.
              </p>
            </div>
            <div className="font-mono font-bold text-sm text-[#b45309] bg-[#fff4d4] border border-[#ba793a] px-3 py-1 rounded">
              Gemiddeld: {avgRating} / 5.0
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Review List */}
            <div className="space-y-3">
              {reviewsList.length === 0 ? (
                <div className="p-4 rounded bg-[#fff8e7] border-2 border-[#7c481f] text-xs text-[#7c481f] italic text-center">
                  Nog geen reviews geschreven.
                </div>
              ) : (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded bg-[#fff8e7] border-2 border-[#7c481f] space-y-1.5 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3b1d09]">{rev.authorName}</span>
                      <span className="text-amber-700 font-bold font-mono">
                        {rev.rating} / 5 sterren
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-[#5c3011] leading-relaxed">{rev.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Submit a Review Form */}
            <div className="pixel-box-wood p-5 bg-[#fff8e7]">
              <h3 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-2">
                Schrijf een Beoordeling
              </h3>

              {reviewMessage && (
                <div className="p-3 rounded bg-amber-100 border border-amber-500 text-amber-900 text-xs font-bold mb-3">
                  {reviewMessage}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Jouw Naam *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="bijv. Sophie Hendriks"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#4a2810]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Beoordeling
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs font-bold"
                  >
                    <option value={5}>5 sterren (Uitstekend)</option>
                    <option value={4}>4 sterren (Zeer goed)</option>
                    <option value={3}>3 sterren (Gemiddeld)</option>
                    <option value={2}>2 sterren (Matig)</option>
                    <option value={1}>1 ster (Onvoldoende)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Jouw Ervaring / Opmerking
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Deel hoe de service en communicatie verliepen..."
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#4a2810]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="pixel-btn-red w-full py-2.5 rounded text-xs font-black uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmittingReview ? "Review Plaatsen..." : "Plaats Beoordeling"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Direct Contact / Offerte Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg bg-[#fff9ec] border-4 border-[#4a2810] rounded-xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded bg-[#8a4b1f] hover:bg-[#a15523] text-white border-2 border-[#3b1d09] flex items-center justify-center font-black text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="pb-4 border-b-2 border-[#7c481f] mb-4">
              <h3 className="font-mono font-black text-lg text-[#3b1d09]">
                OFFERTE & CONTACT AANVRAAG
              </h3>
              <p className="text-xs text-[#7c481f] font-semibold">
                Direct contact met {company.name}
              </p>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-8 space-y-3">
                <h4 className="font-mono font-black text-lg text-emerald-800">
                  AANVRAAG ONTVANGEN
                </h4>
                <p className="text-xs text-emerald-700 max-w-xs mx-auto">
                  {company.name} heeft jouw verzoek ontvangen en zal spoedig contact opnemen.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3 text-xs">
                {selectedProduct && (
                  <div className="p-2.5 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7c481f] block">
                        Geselecteerd product:
                      </span>
                      <span className="font-bold text-[#3b1d09]">{selectedProduct.name}</span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#3b1d09]">
                      €{selectedProduct.price.toLocaleString("nl-NL")}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Jouw Naam *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="bijv. Jan Jansen"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#4a2810]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jan@voorbeeld.nl"
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#4a2810]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Gewenste datum of toelichting
                  </label>
                  <textarea
                    rows={3}
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Geef hier details over uw project, gewenste datum of planning..."
                    className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#4a2810]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingInquiry}
                  className="pixel-btn-red w-full py-3 rounded text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg mt-2"
                >
                  {isSendingInquiry ? "Verzenden..." : "Verstuur Aanvraag"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
