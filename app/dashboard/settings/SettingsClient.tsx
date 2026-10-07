"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectorType } from "@prisma/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isTop5: boolean;
}

interface Company {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  kvkNumber: string | null;
  vatNumber: string | null;
  primarySector: SectorType;
  openForSectors: SectorType[];
  products: Product[];
}

interface SettingsClientProps {
  initialCompany: Company;
  userEmail: string;
}

const ALL_SECTORS: { type: SectorType; label: string; icon: string; desc: string }[] = [
  {
    type: "BRUILOFT",
    label: "Bruiloft & Romantiek",
    icon: "💒",
    desc: "Styling, fotografie, bloemen, ceremoniële diensten en bruidsmode.",
  },
  {
    type: "EVENEMENTEN_FEEST",
    label: "Evenementen & Feest",
    icon: "🎉",
    desc: "Licht, geluid, photobooths, partyverhuur, DJ's en artiesten.",
  },
  {
    type: "BOUW_RENOVATIE",
    label: "Bouw & Renovatie",
    icon: "🔨",
    desc: "Aannemers, kozijnen, warmtepompen, installatietechniek en interieurbouw.",
  },
  {
    type: "ZAKELIJK_CORPORATE",
    label: "Zakelijk & Corporate",
    icon: "💼",
    desc: "Beursstands, bedrijfsvideo's, relatiegeschenken en zakelijke signing.",
  },
  {
    type: "CATERING_HORECA",
    label: "Catering & Horeca",
    icon: "🍽️",
    desc: "Buffetten, live cooking, mobiele cocktail- & koffiebars en walking dinners.",
  },
];

export default function SettingsClient({
  initialCompany,
  userEmail,
}: SettingsClientProps) {
  const [name, setName] = useState(initialCompany.name || "");
  const [description, setDescription] = useState(initialCompany.description || "");
  const [address, setAddress] = useState(initialCompany.address || "");
  const [kvkNumber, setKvkNumber] = useState(initialCompany.kvkNumber || "");
  const [vatNumber, setVatNumber] = useState(initialCompany.vatNumber || "");
  const [primarySector, setPrimarySector] = useState<SectorType>(
    initialCompany.primarySector || "ZAKELIJK_CORPORATE"
  );
  const [openForSectors, setOpenForSectors] = useState<SectorType[]>(
    initialCompany.openForSectors || []
  );

  const [products, setProducts] = useState<Product[]>(initialCompany.products || []);

  // New product inputs
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdIsTop5, setNewProdIsTop5] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sector checkbox handler
  const toggleOpenSector = (sec: SectorType) => {
    setOpenForSectors((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  // Top 5 toggle
  const currentTop5Count = products.filter((p) => p.isTop5).length;

  const toggleTop5 = (prodId: string) => {
    const target = products.find((p) => p.id === prodId);
    if (!target) return;

    if (!target.isTop5 && currentTop5Count >= 5) {
      setStatusMessage({
        type: "error",
        text: "Je kunt maximaal 5 producten als Top 5 selecteren voor je marktpleinkraam.",
      });
      return;
    }

    setStatusMessage(null);
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, isTop5: !p.isTop5 } : p))
    );
  };

  const handleProductChange = (prodId: string, field: keyof Product, value: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, [field]: value } : p))
    );
  };

  // Add new product locally
  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    if (newProdIsTop5 && currentTop5Count >= 5) {
      setStatusMessage({
        type: "error",
        text: "Je hebt al 5 Top producten geselecteerd. Vink eerst een ander product uit.",
      });
      return;
    }

    const tempProduct: Product = {
      id: "temp-" + Date.now(),
      name: newProdName,
      price: parseFloat(newProdPrice) || 0,
      description: newProdDesc,
      isTop5: newProdIsTop5,
    };

    setProducts((prev) => [...prev, tempProduct]);
    setNewProdName("");
    setNewProdPrice("");
    setNewProdDesc("");
    setNewProdIsTop5(false);
    setStatusMessage({
      type: "success",
      text: "Product toegevoegd aan de lijst. Klik op 'Wijzigingen Opslaan' om definitief te bewaren.",
    });
  };

  // Save all settings to API
  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    const existingProductsToUpdate = products.filter((p) => !p.id.startsWith("temp-"));
    const newProductsToCreate = products.filter((p) => p.id.startsWith("temp-"));

    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: initialCompany.id,
          name,
          description,
          address,
          kvkNumber,
          vatNumber,
          primarySector,
          openForSectors,
          products: existingProductsToUpdate,
          newProducts: newProductsToCreate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fout bij opslaan");
      }

      setStatusMessage({
        type: "success",
        text: "Instellingen, sectoren en Top 5 producten succesvol opgeslagen in Neon PostgreSQL!",
      });

      if (data.company?.products) {
        setProducts(data.company.products);
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Er is een onverwachte fout opgetreden.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold mb-1">
              <Link href="/dashboard" className="hover:underline">
                B2B Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-400">Instellingen & Sectoren</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Bedrijfs- & Marktplein Instellingen
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Beheer je primaire sector, samenwerkingspartners en je Top 5 marktplein-etalage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-2"
            >
              <span>🎪</span> Bekijk op Marktplein
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "Opslaan..." : "✓ Wijzigingen Opslaan"}
            </button>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                : "bg-rose-950/40 border-rose-600 text-rose-300"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* SECTION 1: Bedrijfsprofiel */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <span>🏢</span> Bedrijfsprofiel
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Basisinformatie over jouw onderneming zoals getoond op de marktpleinkraam.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bedrijfsnaam *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adres / Vestigingsplaats
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="bijv. Singel 112, Amsterdam"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bedrijfsomschrijving / Specialisatie
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Korte beschrijving van jullie diensten, producten en werkwijze..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                KvK-nummer
              </label>
              <input
                type="text"
                value={kvkNumber}
                onChange={(e) => setKvkNumber(e.target.value)}
                placeholder="12345678"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Btw-identificatienummer
              </label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="NL123456789B01"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Sectoren & Samenwerkingen */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🎯</span> Sectoren & Samenwerkingen
              </h2>
              <p className="text-xs text-slate-400">
                Stel jouw primaire marktsector in én vink aan met welke partners jij wilt samenwerken om bundels te vormen.
              </p>
            </div>
          </div>

          {/* Primaire sector */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-rose-300 uppercase tracking-wider mb-3">
              1. Jouw Primaire Sector (Hoofdactiviteit)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_SECTORS.map((sec) => {
                const isSelected = primarySector === sec.type;
                return (
                  <div
                    key={sec.type}
                    onClick={() => setPrimarySector(sec.type)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {sec.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">
                          {sec.label}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-rose-400 font-bold">
                            (Actief)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sec.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Samenwerkingssectoren (OpenForSectors) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                2. Open Voor Samenwerking Met (Vink aan wat van toepassing is)
              </label>
              <span className="text-[11px] text-purple-400 font-semibold">
                {openForSectors.length} van {ALL_SECTORS.length} sectoren geselecteerd
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Bedrijven uit deze aangevinkte sectoren kunnen samen met jou synergetische bundels samenstellen voor klanten op het marktplein.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_SECTORS.map((sec) => {
                const isChecked = openForSectors.includes(sec.type);
                return (
                  <label
                    key={sec.type}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isChecked
                        ? "bg-purple-950/30 border-purple-500/70"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sec.icon}</span>
                      <span className="text-xs font-semibold text-slate-200">
                        {sec.label}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOpenSector(sec.type)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-900 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: Top 5 Producten Selectie */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏆</span> Top 5 Producten & Diensten Selectie
              </h2>
              <p className="text-xs text-slate-400">
                Vink maximaal 5 producten aan die als blikvanger op je marktpleinkraam worden uitgelicht.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  currentTop5Count === 5
                    ? "bg-emerald-950 text-emerald-300 border-emerald-600"
                    : "bg-rose-950 text-rose-300 border-rose-800"
                }`}
              >
                {currentTop5Count} / 5 Top Producten geselecteerd
              </span>
            </div>
          </div>

          {/* Product list */}
          <div className="space-y-3 mb-8">
            {products.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                Nog geen producten toegevoegd. Gebruik onderstaand formulier om je eerste product toe te voegen.
              </div>
            ) : (
              products.map((prod, idx) => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    prod.isTop5
                      ? "bg-rose-950/20 border-rose-500/60 shadow-sm"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3.5 grow">
                    {/* Top 5 checkbox button */}
                    <button
                      type="button"
                      onClick={() => toggleTop5(prod.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                        prod.isTop5
                          ? "bg-rose-600 border-rose-500 text-white"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{prod.isTop5 ? "★ Top 5" : "☆ Maak Top 5"}</span>
                    </button>

                    <div className="grow space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={prod.name}
                          onChange={(e) =>
                            handleProductChange(prod.id, "name", e.target.value)
                          }
                          className="bg-transparent font-bold text-white text-xs border-b border-transparent hover:border-slate-700 focus:border-rose-500 focus:outline-none px-1 py-0.5"
                        />
                      </div>
                      <input
                        type="text"
                        value={prod.description || ""}
                        placeholder="Voeg een omschrijving toe..."
                        onChange={(e) =>
                          handleProductChange(prod.id, "description", e.target.value)
                        }
                        className="w-full bg-transparent text-[11px] text-slate-400 border-b border-transparent hover:border-slate-800 focus:border-rose-500 focus:outline-none px-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-mono">€</span>
                      <input
                        type="number"
                        value={prod.price}
                        onChange={(e) =>
                          handleProductChange(prod.id, "price", parseFloat(e.target.value) || 0)
                        }
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setProducts((prev) => prev.filter((p) => p.id !== prod.id))
                      }
                      className="text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded transition"
                      title="Verwijderen"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to add a new product */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>➕</span> Nieuw Product of Dienst Toevoegen
            </h3>

            <form
              onSubmit={handleAddNewProduct}
              className="bg-slate-950 rounded-xl p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
            >
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Productnaam *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="bijv. Uitgebreid Styling Pakket"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Prijs (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  placeholder="450.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-3 pt-2 sm:pt-0">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdIsTop5}
                    onChange={(e) => setNewProdIsTop5(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900"
                  />
                  <span>Direct Top 5</span>
                </label>

                <button
                  type="submit"
                  className="grow px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700"
                >
                  Toevoegen
                </button>
              </div>

              <div className="sm:col-span-12">
                <input
                  type="text"
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Korte toelichting van dit product..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-6 bg-slate-900/90 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">
            Vergeet niet om je wijzigingen op te slaan zodat bezoekers direct je geüpdatete kraam zien.
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-xl shadow-purple-900/30 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Opslaan..." : "✓ Alle Wijzigingen Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
