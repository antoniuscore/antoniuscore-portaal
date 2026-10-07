"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SectorType } from "@prisma/client";
import { SECTOR_THEMES } from "@/app/components/StardewMarket";

export interface CartStoredItem {
  id: string; // unique item id in cart or product id
  productId?: string;
  name: string;
  price: number;
  companyId: string;
  companyName: string;
  sector?: SectorType;
  quantity?: number;
  guestCount?: number;
  staffNeeded?: number;
  customNotes?: string;
  staffRequiredBase?: number;
  minPeoplePerStaff?: number;
}

interface CompanyCatalog {
  id: string;
  name: string;
  slug: string | null;
  businessType: string | null;
  primarySector: SectorType;
  city: string | null;
  availableStaff: number | null;
  serviceRadiusKm: number | null;
  products: {
    id: string;
    name: string;
    price: number;
    description: string | null;
    staffRequiredBase?: number;
    minPeoplePerStaff?: number;
  }[];
}

interface WinkelmandClientProps {
  initialCompanies: CompanyCatalog[];
}

export default function WinkelmandClient({ initialCompanies }: WinkelmandClientProps) {
  // Current active step: 1 = Selectie, 2 = Bundelen/Personeel, 3 = Agenda/Tijdstip, 4 = Klant & Verzenden
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Cart state
  const [cart, setCart] = useState<CartStoredItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Global Event Scope state (Step 2 & 3)
  const [globalGuests, setGlobalGuests] = useState<number>(60);
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTimeSlot, setEventTimeSlot] = useState<string>("Middag (13:00 - 17:00)");
  const [eventLocation, setEventLocation] = useState<string>("");

  // Customer Contact Info (Step 4)
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [projectNotes, setProjectNotes] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("antoniuscore_cart");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not read cart from localStorage", e);
    }

    // Default starter items if cart is empty so user can immediately experience the flow
    if (initialCompanies.length > 0) {
      const starter: CartStoredItem[] = [];
      const first = initialCompanies[0];
      if (first && first.products.length > 0) {
        starter.push({
          id: first.products[0].id,
          productId: first.products[0].id,
          name: first.products[0].name,
          price: first.products[0].price,
          companyId: first.id,
          companyName: first.name,
          sector: first.primarySector,
          quantity: 1,
          guestCount: 60,
          staffRequiredBase: first.products[0].staffRequiredBase || 1,
          minPeoplePerStaff: first.products[0].minPeoplePerStaff || 25,
        });
      }

      if (initialCompanies.length > 1) {
        const second = initialCompanies[1];
        if (second && second.products.length > 0) {
          starter.push({
            id: second.products[0].id,
            productId: second.products[0].id,
            name: second.products[0].name,
            price: second.products[0].price,
            companyId: second.id,
            companyName: second.name,
            sector: second.primarySector,
            quantity: 1,
            guestCount: 60,
            staffRequiredBase: second.products[0].staffRequiredBase || 2,
            minPeoplePerStaff: second.products[0].minPeoplePerStaff || 30,
          });
        }
      }

      setCart(starter);
    }
    setIsLoaded(true);
  }, [initialCompanies]);

  // Persist cart
  const updateCartAndStorage = (newCart: CartStoredItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("antoniuscore_cart", JSON.stringify(newCart));
    } catch (e) {
      console.warn("Could not write cart to localStorage", e);
    }
  };

  // Helper to calculate staff required
  const calculateStaff = (item: CartStoredItem, guests: number): number => {
    const base = item.staffRequiredBase || 1;
    const minPerStaff = item.minPeoplePerStaff || 25;
    const count = Math.max(1, guests);
    return Math.max(base, Math.ceil(count / minPerStaff) * base);
  };

  // Group items by company
  const itemsByCompany = useMemo(() => {
    const map = new Map<string, { companyName: string; sector?: SectorType; items: CartStoredItem[] }>();
    cart.forEach((it) => {
      if (!map.has(it.companyId)) {
        map.set(it.companyId, {
          companyName: it.companyName,
          sector: it.sector,
          items: [],
        });
      }
      map.get(it.companyId)!.items.push(it);
    });
    return Array.from(map.entries()).map(([companyId, data]) => ({
      companyId,
      ...data,
    }));
  }, [cart]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
  }, [cart]);

  // Total staff needed across all companies
  const totalStaffNeeded = useMemo(() => {
    return cart.reduce((acc, it) => {
      const g = it.guestCount ?? globalGuests;
      return acc + calculateStaff(it, g);
    }, 0);
  }, [cart, globalGuests]);

  // Handlers for cart manipulation
  const removeItem = (id: string) => {
    const next = cart.filter((it) => it.id !== id);
    updateCartAndStorage(next);
  };

  const updateQuantity = (id: string, delta: number) => {
    const next = cart.map((it) => {
      if (it.id === id) {
        const q = Math.max(1, (it.quantity || 1) + delta);
        return { ...it, quantity: q };
      }
      return it;
    });
    updateCartAndStorage(next);
  };

  const updateItemGuestCount = (id: string, guests: number) => {
    const next = cart.map((it) => {
      if (it.id === id) {
        return { ...it, guestCount: Math.max(1, guests) };
      }
      return it;
    });
    updateCartAndStorage(next);
  };

  const updateItemNotes = (id: string, customNotes: string) => {
    const next = cart.map((it) => {
      if (it.id === id) {
        return { ...it, customNotes };
      }
      return it;
    });
    updateCartAndStorage(next);
  };

  // Submit Final Combined Request to /api/projects
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setSubmitError("Vul alstublieft uw naam en e-mailadres in.");
      return;
    }

    if (cart.length === 0) {
      setSubmitError("Uw winkelmand is leeg.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || null,
        eventDate: eventDate || null,
        eventTimeSlot: eventTimeSlot || null,
        eventLocation: eventLocation.trim() || null,
        targetGuests: globalGuests,
        notes: projectNotes.trim() || null,
        items: cart.map((it) => {
          const g = it.guestCount ?? globalGuests;
          return {
            productId: it.productId || it.id,
            companyId: it.companyId,
            quantity: it.quantity || 1,
            guestCount: g,
            staffNeeded: calculateStaff(it, g),
            price: it.price,
            customNotes: it.customNotes || null,
          };
        }),
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Aanvraag kon niet worden verzonden.");
      }

      setSubmitSuccess(data.project);
      // Empty stored cart
      localStorage.removeItem("antoniuscore_cart");
      setCart([]);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Er is een technische fout opgetreden.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-desert-market flex items-center justify-center p-6 text-[#4a2810]">
        <div className="pixel-box-parchment p-6 text-center font-mono font-bold animate-pulse">
          Winkelmand & Planning Laden...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-desert-market text-[#2d1808] flex flex-col font-sans select-none">
      {/* 1. Header */}
      <header className="bg-[#cca440] border-b-4 border-[#4a2810] shadow-xl px-4 sm:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href="https://www.antoniuscore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn-wood px-3.5 py-1.5 rounded text-xs font-black tracking-wider uppercase flex items-center gap-1.5"
            >
              <span className="font-mono text-xs sm:text-sm tracking-widest text-[#fcd34d]">
                AntoniusCore
              </span>
            </a>

            <Link
              href="/"
              className="px-3 py-1.5 rounded text-xs font-bold text-[#4a2810] hover:text-[#2d1808] bg-[#edd378] border border-[#7c481f] flex items-center gap-1 transition"
            >
              ← Terug naar Marktplein
            </Link>
          </div>

          <div className="text-center">
            <h1 className="font-mono font-black text-sm sm:text-lg text-[#3b1d09]">
              Winkelmand, Planning & Personeel
            </h1>
            <p className="text-[11px] text-[#7c481f]">
              {cart.length} diensten geselecteerd bij {itemsByCompany.length} bedrijven
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/beheer"
              className="pixel-btn-wood px-3 py-1.5 rounded text-xs font-bold hover:scale-105 transition"
            >
              Mijn Beheer
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Meerstaps Voortgangsbalk */}
      <div className="bg-[#edd378] border-b-2 border-[#7c481f] px-4 py-3">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-2 rounded border transition cursor-pointer flex flex-col items-center gap-0.5 ${
              currentStep === 1
                ? "bg-[#4a2810] text-[#fff4d4] border-[#2d1808] shadow-sm font-black"
                : currentStep > 1
                ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                : "bg-[#fff4d4] text-[#7c481f] border-[#ba793a]"
            }`}
          >
            <span className="text-[10px] font-mono">STAP 1</span>
            <span className="truncate">1. Selectie ({cart.length})</span>
          </button>

          <button
            onClick={() => cart.length > 0 && setCurrentStep(2)}
            disabled={cart.length === 0}
            className={`p-2 rounded border transition cursor-pointer flex flex-col items-center gap-0.5 disabled:opacity-50 ${
              currentStep === 2
                ? "bg-[#4a2810] text-[#fff4d4] border-[#2d1808] shadow-sm font-black"
                : currentStep > 2
                ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                : "bg-[#fff4d4] text-[#7c481f] border-[#ba793a]"
            }`}
          >
            <span className="text-[10px] font-mono">STAP 2</span>
            <span className="truncate">2. Capaciteit</span>
          </button>

          <button
            onClick={() => cart.length > 0 && setCurrentStep(3)}
            disabled={cart.length === 0}
            className={`p-2 rounded border transition cursor-pointer flex flex-col items-center gap-0.5 disabled:opacity-50 ${
              currentStep === 3
                ? "bg-[#4a2810] text-[#fff4d4] border-[#2d1808] shadow-sm font-black"
                : currentStep > 3
                ? "bg-emerald-100 text-emerald-900 border-emerald-500"
                : "bg-[#fff4d4] text-[#7c481f] border-[#ba793a]"
            }`}
          >
            <span className="text-[10px] font-mono">STAP 3</span>
            <span className="truncate">3. Agenda & Tijd</span>
          </button>

          <button
            onClick={() => cart.length > 0 && setCurrentStep(4)}
            disabled={cart.length === 0}
            className={`p-2 rounded border transition cursor-pointer flex flex-col items-center gap-0.5 disabled:opacity-50 ${
              currentStep === 4
                ? "bg-[#4a2810] text-[#fff4d4] border-[#2d1808] shadow-sm font-black"
                : "bg-[#fff4d4] text-[#7c481f] border-[#ba793a]"
            }`}
          >
            <span className="text-[10px] font-mono">STAP 4</span>
            <span className="truncate">4. Verzenden</span>
          </button>
        </div>
      </div>

      {/* 3. Hoofd Content Container */}
      <main className="max-w-5xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        {submitSuccess ? (
          /* Bevestigingsscherm na succesvolle indiening */
          <div className="pixel-box-parchment p-8 text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg border-2 border-emerald-800">
              ✓
            </div>

            <div>
              <span className="text-xs font-mono font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded border border-emerald-400">
                Aanvraag Succesvol Ingediend
              </span>
              <h2 className="font-mono font-black text-2xl sm:text-3xl text-[#3b1d09] mt-3">
                Bedankt voor uw gecombineerde aanvraag!
              </h2>
              <p className="text-xs sm:text-sm text-[#5c3011] mt-2 max-w-xl mx-auto">
                Uw projectaanvraag is geregistreerd onder nummer{" "}
                <strong className="font-mono text-[#3b1d09]">{submitSuccess.id}</strong>. Alle{" "}
                {itemsByCompany.length} betrokken bedrijven zijn direct genotificeerd en de projectchat is geactiveerd.
              </p>
            </div>

            <div className="p-4 bg-[#fff4d4] rounded-lg border-2 border-[#7c481f] max-w-lg mx-auto text-left text-xs space-y-2">
              <div className="font-bold text-[#3b1d09] border-b border-[#7c481f]/30 pb-1">
                Project Samenvatting:
              </div>
              <div>• <strong>Datum & Tijd:</strong> {eventDate || "In overleg"} ({eventTimeSlot})</div>
              <div>• <strong>Locatie:</strong> {eventLocation || "Nederland"}</div>
              <div>• <strong>Aantal gasten / omvang:</strong> {globalGuests} personen</div>
              <div>• <strong>Berekend personeel:</strong> {totalStaffNeeded} specialisten</div>
              <div>• <strong>Indicatief totaal:</strong> €{subtotal.toLocaleString("nl-NL")}</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                href="/beheer/projecten"
                className="pixel-btn-red px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider"
              >
                Naar Projecten & Chat →
              </Link>

              <Link
                href="/"
                className="pixel-btn-wood px-5 py-2.5 rounded text-xs font-bold"
              >
                Terug naar Marktplein
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* STAP 1: SELECTIE & DIENSTEN */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="pixel-box-parchment p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#7c481f] pb-3">
                    <div>
                      <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                        Stap 1: Uw Geselecteerde Diensten & Producten
                      </h2>
                      <p className="text-xs text-[#7c481f]">
                        Verzamel producten van meerdere marktkraampjes voor een complete offerte.
                      </p>
                    </div>

                    <Link
                      href="/"
                      className="px-3 py-1.5 rounded text-xs font-bold bg-[#fff4d4] border border-[#7c481f] hover:bg-[#fff9ec] transition"
                    >
                      + Meer kraampjes bezoeken
                    </Link>
                  </div>

                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#7c481f] italic bg-[#fff4d4] rounded-lg border border-[#ba793a] space-y-3">
                      <p>Uw winkelmand is momenteel leeg.</p>
                      <Link href="/" className="pixel-btn-wood inline-block px-4 py-2 rounded text-xs font-bold">
                        Wandel over het Marktplein
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {itemsByCompany.map((group) => {
                        const theme = group.sector ? SECTOR_THEMES[group.sector] : SECTOR_THEMES.ZAKELIJK_CORPORATE;

                        return (
                          <div
                            key={group.companyId}
                            className="bg-[#fff8e7] border-2 border-[#7c481f] rounded-lg p-4 space-y-3 shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-[#7c481f]/30 pb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full border border-black/30"
                                  style={{ backgroundColor: theme?.roofColor1 || "#ba793a" }}
                                />
                                <span className="font-black text-sm text-[#3b1d09]">
                                  {group.companyName}
                                </span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-[#8a4b1f] bg-[#edd378] px-2 py-0.5 rounded border border-[#ba793a]">
                                {theme?.label || "Partner"}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {group.items.map((it) => (
                                <div
                                  key={it.id}
                                  className="flex items-center justify-between gap-3 bg-[#fff4d4] p-2.5 rounded border border-[#ba793a]/60 text-xs"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-[#3b1d09] truncate">{it.name}</div>
                                    <div className="text-[11px] text-[#7c481f] font-mono">
                                      €{it.price} per stuk
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-1 bg-[#fff8e7] border border-[#7c481f] rounded px-1.5 py-0.5">
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(it.id, -1)}
                                        className="font-bold text-[#4a2810] px-1 hover:text-black cursor-pointer"
                                      >
                                        -
                                      </button>
                                      <span className="font-mono font-bold px-1.5">{it.quantity || 1}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(it.id, 1)}
                                        className="font-bold text-[#4a2810] px-1 hover:text-black cursor-pointer"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <span className="font-mono font-black text-xs text-[#3b1d09] w-16 text-right">
                                      €{((it.price || 0) * (it.quantity || 1)).toLocaleString("nl-NL")}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(it.id)}
                                      className="text-red-700 hover:text-red-900 font-bold px-1.5 cursor-pointer"
                                      title="Verwijderen"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                      {/* Subtotaal & Knop naar Stap 2 */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-[#7c481f]">
                        <div className="font-mono font-black text-base text-[#3b1d09]">
                          Indicatief Totaalbedrag:{" "}
                          <span className="text-xl">€{subtotal.toLocaleString("nl-NL")}</span>
                        </div>

                        <button
                          onClick={() => setCurrentStep(2)}
                          className="pixel-btn-red px-6 py-2.5 rounded text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                        >
                          Volgende: Capaciteit & Personeel →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STAP 2: BUNDELEN & DYNAMIC STAFFING */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
                  <div className="border-b-2 border-[#7c481f] pb-3">
                    <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                      Stap 2: Bundelen, Schaal & Dynamic Staffing
                    </h2>
                    <p className="text-xs text-[#7c481f]">
                      Stel de omvang van uw evenement of opdracht in. Het systeem berekent automatisch de benodigde personeelsbezetting per aangesloten partner.
                    </p>
                  </div>

                  {/* Algemeen Aantal Personen / Gasten Instellen */}
                  <div className="p-4 bg-[#edd378] rounded-lg border-2 border-[#7c481f] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="font-mono font-black text-sm text-[#3b1d09] uppercase">
                        Algemeen Aantal Personen / Gasten:
                      </label>
                      <span className="font-mono font-black text-lg text-[#8a4b1f] bg-[#fff4d4] px-3 py-0.5 rounded border border-[#7c481f]">
                        {globalGuests} Personen
                      </span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={400}
                      step={5}
                      value={globalGuests}
                      onChange={(e) => setGlobalGuests(Number(e.target.value))}
                      className="w-full accent-[#dc2626] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-[#7c481f] font-mono">
                      <span>10 gasten (Intiem)</span>
                      <span>80 gasten (Gemiddeld)</span>
                      <span>200 gasten (Groot feest)</span>
                      <span>400+ gasten (Festival)</span>
                    </div>
                  </div>

                  {/* Berekende Personeelsbezetting per Bedrijf */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono font-black text-sm uppercase text-[#4a2810]">
                        Automatisch Berekende Bezetting per Dienst
                      </h3>
                      <span className="text-xs font-mono font-bold bg-[#fff4d4] text-[#8a4b1f] px-2.5 py-1 rounded border border-[#ba793a]">
                        Totaal: {totalStaffNeeded} Specialisten vereist
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cart.map((it) => {
                        const guests = it.guestCount ?? globalGuests;
                        const staff = calculateStaff(it, guests);

                        return (
                          <div
                            key={it.id}
                            className="bg-[#fff8e7] border-2 border-[#7c481f] rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-[#7c481f]/30 pb-2">
                              <div>
                                <div className="font-bold text-[#3b1d09] text-xs">{it.name}</div>
                                <div className="text-[10px] text-[#7c481f]">{it.companyName}</div>
                              </div>

                              <div className="text-right">
                                <span className="bg-emerald-100 text-emerald-900 border border-emerald-500 text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block">
                                  {staff} {staff === 1 ? "Persoon" : "Personen"} Bezetting
                                </span>
                              </div>
                            </div>

                            {/* Specifieke Schaal Override & Capaciteitsregels */}
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[#5c3011]">Omvang voor deze dienst:</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={1}
                                    max={1000}
                                    value={guests}
                                    onChange={(e) => updateItemGuestCount(it.id, Number(e.target.value))}
                                    className="w-16 bg-[#fff4d4] border border-[#7c481f] rounded px-2 py-0.5 text-xs font-mono font-bold text-center"
                                  />
                                  <span className="text-[10px] text-[#7c481f]">pers.</span>
                                </div>
                              </div>

                              <div className="text-[10px] text-[#7c481f] bg-[#fff4d4] p-2 rounded border border-[#ba793a]/50">
                                ℹ Capaciteitsregel: Basis {it.staffRequiredBase || 1} medewerker per {it.minPeoplePerStaff || 25} personen.
                              </div>

                              <div>
                                <input
                                  type="text"
                                  value={it.customNotes || ""}
                                  onChange={(e) => updateItemNotes(it.id, e.target.value)}
                                  placeholder="Specifieke instructie voor deze dienst..."
                                  className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-2 py-1 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigatie Knoppen */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-[#7c481f]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="pixel-btn-wood px-4 py-2 rounded text-xs font-bold"
                    >
                      ← Terug naar Selectie
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="pixel-btn-red px-6 py-2.5 rounded text-xs font-black uppercase tracking-wider"
                    >
                      Volgende: Agenda & Datum →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAP 3: AGENDA DATUM & TIJDSTIP */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
                  <div className="border-b-2 border-[#7c481f] pb-3">
                    <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                      Stap 3: Agenda Datum, Tijdstip & Locatie
                    </h2>
                    <p className="text-xs text-[#7c481f]">
                      Kies de gewenste datum en het tijdvak voor uw project of bijeenkomst.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Datum Selectie */}
                    <div className="space-y-3">
                      <label className="block font-bold text-[#4a2810]">
                        1. Gewenste Datum *
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-mono font-bold focus:outline-none"
                      />

                      {/* Snelle suggesties */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 14);
                            setEventDate(d.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-1 bg-[#edd378] border border-[#7c481f] rounded text-[10px] font-bold"
                        >
                          Binnen 2 weken
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setMonth(d.getMonth() + 2);
                            setEventDate(d.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-1 bg-[#edd378] border border-[#7c481f] rounded text-[10px] font-bold"
                        >
                          Binnen 2 maanden
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setMonth(d.getMonth() + 6);
                            setEventDate(d.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-1 bg-[#edd378] border border-[#7c481f] rounded text-[10px] font-bold"
                        >
                          Over een halfjaar
                        </button>
                      </div>
                    </div>

                    {/* Tijdslot Selectie */}
                    <div className="space-y-3">
                      <label className="block font-bold text-[#4a2810]">
                        2. Tijdstip / Tijdvak *
                      </label>
                      <select
                        value={eventTimeSlot}
                        onChange={(e) => setEventTimeSlot(e.target.value)}
                        className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-bold focus:outline-none"
                      >
                        <option value="Ochtend (08:30 - 12:30)">Ochtend (08:30 - 12:30)</option>
                        <option value="Middag (13:00 - 17:00)">Middag (13:00 - 17:00)</option>
                        <option value="Avond / Feest (17:30 - 23:00)">Avond / Feest (17:30 - 23:00)</option>
                        <option value="Hele Dag (09:00 - 23:00)">Hele Dag (09:00 - 23:00)</option>
                        <option value="Meerdaags Project / In Overleg">Meerdaags Project / In Overleg</option>
                      </select>
                    </div>

                    {/* Evenementlocatie */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block font-bold text-[#4a2810]">
                        3. Evenement- of Opleverlocatie (Stad / Adres) *
                      </label>
                      <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="bijv. Landgoed De Haar, Haarzuilens of Kantoorpand Amsterdam Zuidas"
                        className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs font-semibold focus:outline-none"
                      />
                      <p className="text-[10px] text-[#7c481f]">
                        Dit stelt de bedrijven in staat direct hun reisafstand en leveringsstraal te toetsen.
                      </p>
                    </div>
                  </div>

                  {/* Navigatie Knoppen */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-[#7c481f]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="pixel-btn-wood px-4 py-2 rounded text-xs font-bold"
                    >
                      ← Terug naar Capaciteit
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="pixel-btn-red px-6 py-2.5 rounded text-xs font-black uppercase tracking-wider"
                    >
                      Volgende: Aanvraag Afronden →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAP 4: KLANTGEGEVENS & GECOMBINEERDE AANVRAAG VERZENDEN */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="pixel-box-parchment p-6 sm:p-8 space-y-6">
                  <div className="border-b-2 border-[#7c481f] pb-3">
                    <h2 className="font-mono font-black text-lg text-[#3b1d09]">
                      Stap 4: Klantgegevens & Gecombineerde Aanvraag Verzenden
                    </h2>
                    <p className="text-xs text-[#7c481f]">
                      Vul uw contactgegevens in. Alle betrokken bedrijven ontvangen uw gecombineerde aanvraag en reageren in de gezamenlijke projectchat.
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded bg-rose-100 border border-rose-500 text-rose-900 text-xs font-bold">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmitProject} className="space-y-6 text-xs">
                    {/* Samenvatting Box */}
                    <div className="bg-[#fff8e7] border-2 border-[#7c481f] rounded-lg p-4 space-y-3">
                      <h3 className="font-mono font-black text-xs uppercase text-[#4a2810]">
                        Project Review:
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                        <div>
                          <span className="text-[#7c481f] block">Betrokken Bedrijven:</span>
                          <span className="font-bold text-[#3b1d09]">{itemsByCompany.length} partners</span>
                        </div>

                        <div>
                          <span className="text-[#7c481f] block">Datum & Tijd:</span>
                          <span className="font-bold text-[#3b1d09]">{eventDate || "In overleg"} ({eventTimeSlot})</span>
                        </div>

                        <div>
                          <span className="text-[#7c481f] block">Totale Bezetting:</span>
                          <span className="font-bold text-emerald-800">{totalStaffNeeded} specialisten</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#7c481f]/20 flex items-center justify-between font-mono font-bold text-xs">
                        <span>Indicatief Totaalbedrag:</span>
                        <span className="text-sm font-black text-[#8a4b1f]">€{subtotal.toLocaleString("nl-NL")}</span>
                      </div>
                    </div>

                    {/* Contact Formulier */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#4a2810] mb-1">
                          Uw Volledige Naam *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="bijv. Sandra Mulder"
                          className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
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
                          className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#4a2810] mb-1">
                          Telefoonnummer
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="06 - 12345678"
                          className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-[#4a2810] mb-1">
                          Aanvullende Wensen of Vragen
                        </label>
                        <textarea
                          rows={3}
                          value={projectNotes}
                          onChange={(e) => setProjectNotes(e.target.value)}
                          placeholder="Optionele specifieke instructies over stijl, draaiboek of vereisten..."
                          className="w-full bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Navigatie en Verzend Knop */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-[#7c481f]">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="pixel-btn-wood px-4 py-2 rounded text-xs font-bold"
                      >
                        ← Terug naar Agenda
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="pixel-btn-red px-8 py-3 rounded text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? "Aanvraag Verzenden..." : "Gecombineerde Aanvraag Definitief Verzenden"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t-2 border-[#7c481f]/30 bg-[#cca440]/60 p-4 text-center text-xs text-[#4a2810]">
        AntoniusCore B2B2C Marktplein • Vrijblijvende gecombineerde aanvragen & realtime capaciteitsberekening.
      </footer>
    </div>
  );
}
