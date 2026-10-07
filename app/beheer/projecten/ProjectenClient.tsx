"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProjectStatus, SectorType } from "@prisma/client";
import { SECTOR_THEMES } from "@/app/components/StardewMarket";

interface ProjectItemData {
  id: string;
  productId: string;
  companyId: string;
  quantity: number;
  guestCount: number | null;
  staffNeeded: number;
  price: number;
  customNotes: string | null;
  product: {
    id: string;
    name: string;
    price: number;
  };
  company: {
    id: string;
    name: string;
    businessType: string | null;
    primarySector: SectorType;
    city: string | null;
  };
}

interface ChatMessageData {
  id: string;
  projectId: string;
  senderCompanyId: string | null;
  senderName: string;
  recipientCompanyId: string | null;
  content: string;
  createdAt: string;
  senderCompany?: { id: string; name: string; businessType?: string | null } | null;
  recipientCompany?: { id: string; name: string; businessType?: string | null } | null;
}

interface ProjectData {
  id: string;
  title: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  eventDate: string | null;
  eventTimeSlot: string | null;
  eventLocation: string | null;
  targetGuests: number | null;
  totalPrice: number;
  status: ProjectStatus;
  notes: string | null;
  createdAt: string;
  items: ProjectItemData[];
  chatMessages: ChatMessageData[];
}

interface ProjectenClientProps {
  initialProjects: ProjectData[];
  currentCompany: {
    id: string;
    name: string;
    businessType?: string | null;
  } | null;
}

export default function ProjectenClient({
  initialProjects,
  currentCompany,
}: ProjectenClientProps) {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjects[0]?.id || ""
  );

  // Status filter: ALL, GEACCEPTEERD, AANGEVRAAGD, AFGEROND
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Chat message form state
  const [chatContent, setChatContent] = useState("");
  const [chatRecipientId, setChatRecipientId] = useState<string>(""); // empty = everyone
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Selected project
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  });

  // Participating companies in the selected project (excluding current company)
  const participatingPartners = React.useMemo(() => {
    if (!selectedProject) return [];
    const map = new Map<string, { id: string; name: string; businessType: string | null }>();
    selectedProject.items.forEach((item) => {
      if (item.company && item.company.id !== currentCompany?.id) {
        map.set(item.company.id, item.company);
      }
    });
    return Array.from(map.values());
  }, [selectedProject, currentCompany]);

  // Update project status
  const handleUpdateStatus = async (newStatus: ProjectStatus) => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === selectedProject.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      console.error("Status update error", e);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatContent.trim() || !selectedProject) return;

    setIsSendingMessage(true);
    setChatError(null);

    const recipient = chatRecipientId ? chatRecipientId : null;
    const recipientObj = recipient ? participatingPartners.find((p) => p.id === recipient) : null;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: chatContent.trim(),
          recipientCompanyId: recipient,
          overrideSenderName: currentCompany?.name || "Partner Specialist",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Bericht kon niet worden verzonden.");
      }

      // Add to local project chat
      const newMsg: ChatMessageData = {
        id: data.message?.id || String(Date.now()),
        projectId: selectedProject.id,
        senderCompanyId: currentCompany?.id || null,
        senderName: currentCompany?.name || "Mijn Bedrijf",
        recipientCompanyId: recipient,
        content: chatContent.trim(),
        createdAt: new Date().toISOString(),
        senderCompany: currentCompany,
        recipientCompany: recipientObj,
      };

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === selectedProject.id) {
            return { ...p, chatMessages: [...p.chatMessages, newMsg] };
          }
          return p;
        })
      );

      setChatContent("");
    } catch (err: any) {
      setChatError(err.message || "Fout bij verzenden van bericht.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-desert-market text-[#2d1808] flex flex-col font-sans select-none">
      {/* 1. Header */}
      <header className="bg-[#cca440] border-b-4 border-[#4a2810] shadow-xl px-4 sm:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
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
              href="/beheer"
              className="px-3 py-1.5 rounded text-xs font-bold text-[#4a2810] hover:text-[#2d1808] bg-[#edd378] border border-[#7c481f] flex items-center gap-1 transition"
            >
              ← Terug naar Profiel & Beheer
            </Link>
          </div>

          <div className="text-center">
            <h1 className="font-mono font-black text-sm sm:text-lg text-[#3b1d09]">
              Geaccepteerde Projecten & Gecombineerde Chat
            </h1>
            <p className="text-[11px] text-[#7c481f]">
              {currentCompany ? currentCompany.name : "Partner Beheer"} • Synergetische samenwerkingen
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/winkelmand"
              className="pixel-btn-gold px-3 py-1.5 rounded text-xs font-bold"
            >
              Winkelmand & Planning
            </Link>
            <Link
              href="/"
              className="pixel-btn-wood px-3 py-1.5 rounded text-xs font-bold"
            >
              Marktplein
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content Split View: Projecten Lijst (Links) & Project Details + Chat (Rechts) */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Linker Kolom: Projecten Lijst */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="pixel-box-parchment p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#7c481f] pb-2">
              <h2 className="font-mono font-black text-xs uppercase text-[#4a2810]">
                Mijn Projecten ({filteredProjects.length})
              </h2>

              <span className="text-[10px] font-bold text-[#8a4b1f] bg-[#edd378] px-2 py-0.5 rounded border border-[#ba793a]">
                Live Overzicht
              </span>
            </div>

            {/* Status Filter Tabs */}
            <div className="grid grid-cols-2 gap-1 text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`p-1.5 rounded border text-center transition cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-[#4a2810] text-[#fff4d4] border-[#2d1808]"
                    : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
                }`}
              >
                Alle ({projects.length})
              </button>

              <button
                onClick={() => setStatusFilter("GEACCEPTEERD")}
                className={`p-1.5 rounded border text-center transition cursor-pointer ${
                  statusFilter === "GEACCEPTEERD"
                    ? "bg-emerald-700 text-white border-emerald-900"
                    : "bg-[#fff4d4] text-emerald-800 border-[#ba793a] hover:bg-[#fff9ec]"
                }`}
              >
                Geaccepteerd
              </button>

              <button
                onClick={() => setStatusFilter("AANGEVRAAGD")}
                className={`p-1.5 rounded border text-center transition cursor-pointer ${
                  statusFilter === "AANGEVRAAGD"
                    ? "bg-amber-600 text-white border-amber-800"
                    : "bg-[#fff4d4] text-amber-800 border-[#ba793a] hover:bg-[#fff9ec]"
                }`}
              >
                Nieuw
              </button>

              <button
                onClick={() => setStatusFilter("AFGEROND")}
                className={`p-1.5 rounded border text-center transition cursor-pointer ${
                  statusFilter === "AFGEROND"
                    ? "bg-blue-700 text-white border-blue-900"
                    : "bg-[#fff4d4] text-blue-800 border-[#ba793a] hover:bg-[#fff9ec]"
                }`}
              >
                Afgerond
              </button>
            </div>

            {/* Projecten Kaarten */}
            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7c481f] italic bg-[#fff4d4] rounded border border-[#ba793a]">
                Geen projecten met deze status gevonden.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredProjects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  const partnerCount = new Set(p.items.map((it) => it.companyId)).size;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`p-3 rounded-lg border-2 transition cursor-pointer space-y-1.5 text-xs ${
                        isSelected
                          ? "bg-[#fff8e7] border-[#4a2810] shadow-md ring-2 ring-[#ba793a]"
                          : "bg-[#fff4d4] border-[#ba793a] hover:bg-[#fff9ec]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-[11px] text-[#3b1d09] truncate">
                          {p.title}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                            p.status === "GEACCEPTEERD"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                              : p.status === "AANGEVRAAGD"
                              ? "bg-amber-100 text-amber-900 border-amber-400"
                              : p.status === "AFGEROND"
                              ? "bg-blue-100 text-blue-900 border-blue-400"
                              : "bg-slate-100 text-slate-800 border-slate-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#7c481f]">
                        👤 {p.customerName} • 📅{" "}
                        {p.eventDate
                          ? new Date(p.eventDate).toLocaleDateString("nl-NL")
                          : "In overleg"}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#5c3011] pt-1 border-t border-[#7c481f]/20">
                        <span>{partnerCount} aangesloten partners</span>
                        <span className="font-mono font-bold text-[#8a4b1f]">
                          €{p.totalPrice.toLocaleString("nl-NL")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rechter Kolom: Geselecteerd Project Details & Chat Formulier */}
        <div className="flex-1 space-y-6">
          {!selectedProject ? (
            <div className="pixel-box-parchment p-8 text-center text-xs text-[#7c481f]">
              Selecteer links een project om de projectdetails en de gecombineerde chat te openen.
            </div>
          ) : (
            <>
              {/* Project Top Details Kaart */}
              <div className="pixel-box-parchment p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[#7c481f] pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-[#8a4b1f] bg-[#edd378] px-2 py-0.5 rounded border border-[#ba793a]">
                      Projectdossier #{selectedProject.id.slice(-6)}
                    </span>
                    <h2 className="font-mono font-black text-xl text-[#3b1d09] mt-1">
                      {selectedProject.title}
                    </h2>
                  </div>

                  {/* Status Wijzigen Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#4a2810]">Status:</span>
                    <select
                      value={selectedProject.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as ProjectStatus)}
                      className="bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1 text-xs font-black focus:outline-none"
                    >
                      <option value="AANGEVRAAGD">AANGEVRAAGD (Nieuw)</option>
                      <option value="IN_BEHANDELING">IN BEHANDELING</option>
                      <option value="GEACCEPTEERD">GEACCEPTEERD (Akkoord)</option>
                      <option value="AFGEROND">AFGEROND</option>
                      <option value="GEANNULEERD">GEANNULEERD</option>
                    </select>
                  </div>
                </div>

                {/* Klantgegevens & Planning Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#fff8e7] p-3.5 rounded-lg border border-[#ba793a] text-xs">
                  <div>
                    <span className="text-[10px] text-[#7c481f] block font-bold">Klant / Opdrachtgever:</span>
                    <span className="font-black text-[#3b1d09]">{selectedProject.customerName}</span>
                    <div className="text-[11px] text-[#5c3011]">{selectedProject.customerEmail}</div>
                    {selectedProject.customerPhone && (
                      <div className="text-[11px] text-[#5c3011]">{selectedProject.customerPhone}</div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-[#7c481f] block font-bold">Datum & Tijdvak:</span>
                    <span className="font-black text-[#3b1d09]">
                      {selectedProject.eventDate
                        ? new Date(selectedProject.eventDate).toLocaleDateString("nl-NL")
                        : "In overleg"}
                    </span>
                    <div className="text-[11px] text-[#5c3011]">
                      {selectedProject.eventTimeSlot || "Niet gespecificeerd"}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#7c481f] block font-bold">Locatie & Omvang:</span>
                    <span className="font-black text-[#3b1d09]">
                      {selectedProject.eventLocation || "Nederland"}
                    </span>
                    <div className="text-[11px] text-[#5c3011]">
                      {selectedProject.targetGuests || 50} gasten / omvang
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#7c481f] block font-bold">Totaalbedrag:</span>
                    <span className="font-mono font-black text-sm text-[#8a4b1f]">
                      €{selectedProject.totalPrice.toLocaleString("nl-NL")}
                    </span>
                    <div className="text-[10px] text-[#7c481f]">Excl. eventuele meeruren</div>
                  </div>
                </div>

                {/* Betrokken Diensten & Personeel per Bedrijf */}
                <div className="space-y-2">
                  <h3 className="font-mono font-black text-xs uppercase text-[#4a2810]">
                    Betrokken Partners & Berekende Personeelsinzet:
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {selectedProject.items.map((it) => {
                      const isCurrent = it.company?.id === currentCompany?.id;

                      return (
                        <div
                          key={it.id}
                          className={`p-2.5 rounded border flex items-center justify-between ${
                            isCurrent
                              ? "bg-amber-100/70 border-amber-600"
                              : "bg-[#fff4d4] border-[#ba793a]/60"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[#3b1d09] flex items-center gap-1.5">
                              <span>{it.company?.name || "Partner"}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-[#4a2810] text-[#fff4d4] px-1 rounded">
                                  Mijn Bedrijf
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#7c481f]">
                              {it.product?.name || "Dienst"} • {it.guestCount || 50} pers.
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded block mb-0.5">
                              {it.staffNeeded} staff
                            </span>
                            <span className="text-[11px] font-bold text-[#8a4b1f]">
                              €{it.price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Gecombineerde Chat & Berichtgeving (ChatMessage) */}
              <div className="pixel-box-parchment p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#7c481f] pb-2">
                  <div>
                    <h3 className="font-mono font-black text-sm uppercase text-[#4a2810] flex items-center gap-1.5">
                      <span>💬 Projecten-Chat & Partner Afstemming</span>
                    </h3>
                    <p className="text-[11px] text-[#7c481f]">
                      Communiceer met alle betrokken bedrijven of stuur een selectief privébericht naar 1 partner.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#8a4b1f] bg-[#edd378] px-2.5 py-1 rounded border border-[#ba793a]">
                    {selectedProject.chatMessages.length} Berichten
                  </span>
                </div>

                {/* Chat Berichten Feed */}
                <div className="bg-[#fff8e7] border-2 border-[#7c481f] rounded-lg p-4 space-y-3 min-h-[220px] max-h-[360px] overflow-y-auto">
                  {selectedProject.chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#7c481f] italic">
                      Nog geen berichten in dit project. Start hieronder het gesprek!
                    </div>
                  ) : (
                    selectedProject.chatMessages.map((msg) => {
                      const isMe = msg.senderCompanyId === currentCompany?.id;
                      const isSystem = !msg.senderCompanyId;
                      const isPrivate = Boolean(msg.recipientCompanyId);

                      if (isSystem) {
                        return (
                          <div
                            key={msg.id}
                            className="bg-[#edd378]/60 border border-[#ba793a] text-center p-2 rounded text-[11px] text-[#4a2810] font-semibold"
                          >
                            🤖 {msg.content}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-lg p-3 rounded-lg border-2 text-xs space-y-1 ${
                              isMe
                                ? "bg-[#fff4d4] border-[#7c481f]"
                                : isPrivate
                                ? "bg-purple-100 border-purple-600 text-purple-950"
                                : "bg-white border-[#ba793a]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[10px] font-mono border-b border-black/10 pb-1">
                              <span className="font-bold text-[#4a2810]">
                                {msg.senderName}
                              </span>

                              {/* Ontvanger Aanduiding (Iedereen vs Selectief 1 bedrijf) */}
                              {isPrivate ? (
                                <span className="bg-purple-800 text-white px-1.5 py-0.2 rounded font-black text-[9px]">
                                  🔒 Fluisterbericht aan: {msg.recipientCompany?.name || "Partner"}
                                </span>
                              ) : (
                                <span className="bg-[#4a2810] text-[#fff4d4] px-1.5 py-0.2 rounded font-black text-[9px]">
                                  📢 Aan: Iedereen in project
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#2d1808] leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>

                            <div className="text-[9px] text-right text-[#7c481f]">
                              {new Date(msg.createdAt).toLocaleTimeString("nl-NL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chatformulier: Iedereen óf Selectief naar 1 specifiek bedrijf */}
                <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
                  {chatError && (
                    <div className="p-2 rounded bg-rose-100 text-rose-900 text-xs font-bold border border-rose-500">
                      {chatError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs font-bold text-[#4a2810]">
                      Versturen naar:
                    </label>

                    {/* SELECTIEVE ONTVANGER DROPDOWN */}
                    <select
                      value={chatRecipientId}
                      onChange={(e) => setChatRecipientId(e.target.value)}
                      className="bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-1.5 text-xs font-bold focus:outline-none"
                    >
                      <option value="">📢 Iedereen in het project (Alle aangesloten partners)</option>
                      {participatingPartners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          🔒 Alleen naar: {partner.name} ({partner.businessType || "Partner"})
                        </option>
                      ))}
                    </select>

                    {chatRecipientId && (
                      <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded border border-purple-400">
                        Dit bericht wordt uitsluitend zichtbaar voor dit geselecteerde bedrijf.
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      required
                      value={chatContent}
                      onChange={(e) => setChatContent(e.target.value)}
                      placeholder={
                        chatRecipientId
                          ? "Typ een discreet / specifiek bericht aan deze partner..."
                          : "Typ een bericht over planning, logistiek of afstemming aan het hele team..."
                      }
                      className="flex-1 bg-[#fff4d4] border-2 border-[#7c481f] rounded px-3 py-2 text-xs focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={isSendingMessage || !chatContent.trim()}
                      className="pixel-btn-red px-5 py-2 rounded text-xs font-black uppercase tracking-wider shrink-0 disabled:opacity-50 cursor-pointer shadow-md self-end"
                    >
                      {isSendingMessage ? "Verzenden..." : "Versturen"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
