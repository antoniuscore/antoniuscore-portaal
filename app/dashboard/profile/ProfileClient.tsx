"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectorType } from "@prisma/client";

interface OpeningHourItem {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface OtherCompanyItem {
  id: string;
  name: string;
  slug: string | null;
  primarySector: SectorType;
  city: string | null;
}

interface ProfileClientProps {
  initialCompany: {
    id: string;
    name: string;
    slug: string | null;
    city: string | null;
    address: string | null;
    websiteUrl: string | null;
    serviceRadiusKm: number | null;
    availableStaff: number | null;
    clientCapacityPerProduct: number | null;
    recommendedCompanies: string[];
    blacklistedCompanies: string[];
    openingHours: OpeningHourItem[];
    primarySector: SectorType;
  };
  otherCompanies: OtherCompanyItem[];
}

const DAYS_OF_WEEK = [
  { day: 1, name: "Maandag" },
  { day: 2, name: "Dinsdag" },
  { day: 3, name: "Woensdag" },
  { day: 4, name: "Donderdag" },
  { day: 5, name: "Vrijdag" },
  { day: 6, name: "Zaterdag" },
  { day: 0, name: "Zondag" },
];

export default function ProfileClient({
  initialCompany,
  otherCompanies,
}: ProfileClientProps) {
  const [city, setCity] = useState(initialCompany.city || "");
  const [address, setAddress] = useState(initialCompany.address || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialCompany.websiteUrl || "");
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    initialCompany.serviceRadiusKm ?? 30
  );
  const [availableStaff, setAvailableStaff] = useState(
    initialCompany.availableStaff ?? 2
  );
  const [clientCapacityPerProduct, setClientCapacityPerProduct] = useState(
    initialCompany.clientCapacityPerProduct ?? 5
  );

  // Initialize 7 days of opening hours
  const initialHoursMap = new Map<number, OpeningHourItem>();
  initialCompany.openingHours.forEach((oh) => initialHoursMap.set(oh.dayOfWeek, oh));

  const [openingHours, setOpeningHours] = useState<OpeningHourItem[]>(
    DAYS_OF_WEEK.map((d) => {
      const existing = initialHoursMap.get(d.day);
      return (
        existing || {
          dayOfWeek: d.day,
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: d.day === 0,
        }
      );
    })
  );

  const [recommendedCompanies, setRecommendedCompanies] = useState<string[]>(
    initialCompany.recommendedCompanies || []
  );
  const [blacklistedCompanies, setBlacklistedCompanies] = useState<string[]>(
    initialCompany.blacklistedCompanies || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleHourChange = (
    dayOfWeek: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: any
  ) => {
    setOpeningHours((prev) =>
      prev.map((oh) => (oh.dayOfWeek === dayOfWeek ? { ...oh, [field]: value } : oh))
    );
  };

  const toggleRecommended = (id: string) => {
    setRecommendedCompanies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    // Remove from blacklist if present
    setBlacklistedCompanies((prev) => prev.filter((item) => item !== id));
  };

  const toggleBlacklisted = (id: string) => {
    setBlacklistedCompanies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    // Remove from recommended if present
    setRecommendedCompanies((prev) => prev.filter((item) => item !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          address,
          websiteUrl,
          serviceRadiusKm: Number(serviceRadiusKm),
          availableStaff: Number(availableStaff),
          clientCapacityPerProduct: Number(clientCapacityPerProduct),
          recommendedCompanies,
          blacklistedCompanies,
          openingHours,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fout bij opslaan");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Er is een fout opgetreden.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e4c158] text-[#2d1808] p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="pixel-box-parchment p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏢</span>
              <span className="text-xs font-black uppercase text-[#8a4b1f] tracking-wider">
                B2B Partner Portaal
              </span>
            </div>
            <h1 className="font-mono font-black text-2xl text-[#3b1d09]">
              {initialCompany.name} • Profiel & Capaciteit
            </h1>
            <p className="text-xs text-[#63320f] mt-1 font-medium">
              Beheer je locatie, servicegebied, openingstijden, personeel en voorkeurspartners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={initialCompany.slug ? `/bedrijf/${initialCompany.slug}` : "/"}
              className="pixel-btn-wood px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5"
            >
              <span>👁️</span>
              <span>Bekijk Publieke Pagina</span>
            </Link>
            <Link
              href="/dashboard"
              className="pixel-btn-wood px-3.5 py-2 rounded text-xs font-bold"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Success / Error Banners */}
        {saveSuccess && (
          <div className="p-4 rounded bg-emerald-100 border-2 border-emerald-600 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <span>✅</span>
            <span>Jouw bedrijfsprofiel en instellingen zijn succesvol opgeslagen!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded bg-rose-100 border-2 border-rose-600 text-rose-900 font-bold text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Locatie & Leveringsgebied */}
          <div className="pixel-box-wood p-5 bg-[#fff8e7] rounded">
            <h2 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-3 flex items-center gap-2">
              <span>📍</span> 1. Locatie & Leveringsgebied
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#4a2810] mb-1">
                  Stad / Vestigingsplaats *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="bijv. Amsterdam, Utrecht, Rotterdam"
                  className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#4a2810]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4a2810] mb-1">
                  Volledig Adres
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="bijv. Keizersgracht 420"
                  className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#4a2810]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4a2810] mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://jouwbedrijf.nl"
                  className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#4a2810]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4a2810] mb-1">
                  Actieradius / Leveringsgebied:{" "}
                  <span className="font-mono font-black text-[#d97706]">
                    {serviceRadiusKm} km
                  </span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  className="w-full accent-[#8a4b1f] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7c481f] font-semibold mt-1">
                  <span>5 km (lokaal)</span>
                  <span>50 km (regionaal)</span>
                  <span>150 km (landelijk)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personeel & Klantcapaciteit */}
          <div className="pixel-box-wood p-5 bg-[#fff8e7] rounded">
            <h2 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-3 flex items-center gap-2">
              <span>👥</span> 2. Personeel & Capaciteit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#4a2810] mb-1">
                  Beschikbaar Personeel (aantal medewerkers)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={availableStaff}
                  onChange={(e) => setAvailableStaff(Number(e.target.value))}
                  className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#4a2810]"
                />
                <span className="text-[10px] text-[#7c481f]">
                  Aantal medewerkers dat tegelijk ingezet kan worden.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#4a2810] mb-1">
                  Klantcapaciteit per Product / Dag
                </label>
                <input
                  type="number"
                  min="1"
                  max="250"
                  value={clientCapacityPerProduct}
                  onChange={(e) => setClientCapacityPerProduct(Number(e.target.value))}
                  className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none focus:border-[#4a2810]"
                />
                <span className="text-[10px] text-[#7c481f]">
                  Maximaal aantal boekingen of leveringen per dag.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Openingstijden */}
          <div className="pixel-box-wood p-5 bg-[#fff8e7] rounded">
            <h2 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-3 flex items-center gap-2">
              <span>⏰</span> 3. Openingstijden (Live Marktfilter)
            </h2>

            <div className="space-y-2 text-xs">
              {DAYS_OF_WEEK.map((d) => {
                const hourData = openingHours.find((oh) => oh.dayOfWeek === d.day) || {
                  dayOfWeek: d.day,
                  openTime: "09:00",
                  closeTime: "18:00",
                  isClosed: false,
                };

                return (
                  <div
                    key={d.day}
                    className="p-2.5 rounded bg-[#fff4d4] border border-[#ba793a] flex flex-wrap items-center justify-between gap-3"
                  >
                    <span className="w-24 font-bold text-[#3b1d09]">{d.name}</span>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#5c3011]">
                        <input
                          type="checkbox"
                          checked={hourData.isClosed}
                          onChange={(e) =>
                            handleHourChange(d.day, "isClosed", e.target.checked)
                          }
                          className="accent-[#dc2626]"
                        />
                        <span>Gesloten</span>
                      </label>
                    </div>

                    {!hourData.isClosed && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#7c481f]">Van</span>
                        <input
                          type="time"
                          value={hourData.openTime}
                          onChange={(e) =>
                            handleHourChange(d.day, "openTime", e.target.value)
                          }
                          className="bg-white border border-[#7c481f] rounded px-2 py-1 text-xs"
                        />
                        <span className="text-[10px] font-bold text-[#7c481f]">Tot</span>
                        <input
                          type="time"
                          value={hourData.closeTime}
                          onChange={(e) =>
                            handleHourChange(d.day, "closeTime", e.target.value)
                          }
                          className="bg-white border border-[#7c481f] rounded px-2 py-1 text-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Aanbevolen & Afgeraden Partners */}
          <div className="pixel-box-wood p-5 bg-[#fff8e7] rounded">
            <h2 className="font-mono font-black text-sm uppercase text-[#4a2810] mb-2 flex items-center gap-2">
              <span>🤝</span> 4. Voorkeurspartners & Filterbeleid
            </h2>
            <p className="text-xs text-[#7c481f] mb-4">
              Geef aan welke partnerbedrijven op het marktplein je actief aanbeveelt aan je klanten,
              en met welke partners je liever niet gekoppeld wilt worden in combinatiedeals.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {otherCompanies.length === 0 ? (
                <div className="text-xs text-[#7c481f] italic">
                  Geen andere bedrijven op het platform gevonden.
                </div>
              ) : (
                otherCompanies.map((c) => {
                  const isRec = recommendedCompanies.includes(c.id);
                  const isBlack = blacklistedCompanies.includes(c.id);

                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded bg-[#fff4d4] border border-[#ba793a] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#3b1d09]">{c.name}</span>
                        <div className="text-[10px] text-[#7c481f]">
                          {c.primarySector} • {c.city || "Nederland"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRecommended(c.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                            isRec
                              ? "bg-emerald-600 text-white border-emerald-800 shadow"
                              : "bg-[#fff8e7] text-emerald-800 border-emerald-500 hover:bg-emerald-50"
                          }`}
                        >
                          {isRec ? "★ Aanbevolen" : "+ Aanbevelen"}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleBlacklisted(c.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                            isBlack
                              ? "bg-rose-600 text-white border-rose-800 shadow"
                              : "bg-[#fff8e7] text-rose-800 border-rose-400 hover:bg-rose-50"
                          }`}
                        >
                          {isBlack ? "✕ Afgeraden" : "✕ Niet koppelen"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="pixel-btn-red px-8 py-3 rounded text-sm font-black tracking-wider uppercase transition disabled:opacity-50 cursor-pointer shadow-xl"
            >
              {isSaving ? "Gegevens Opslaan..." : "💾 Wijzigingen Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
