"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectorType } from "@prisma/client";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSelector from "@/app/components/LanguageSelector";
import {
  PixelForestBorder,
  PixelGrassTuft,
  PixelBarrel,
  PixelCrate,
  PixelFlowerPot,
} from "@/app/components/PixelFoliage";

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
  businessType?: string | null;
  googlePlaceId?: string | null;
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

export type LanguageCode = "NL" | "EN" | "TI";

const TRANSLATIONS: Record<
  LanguageCode,
  {
    loginBtn: string;
    beheerBtn: string;
    cart: string;
    activeVisitors: string;
    openStalls: string;
    reshuffle: string;
    infiniteScrollOn: string;
    infiniteScrollOff: string;
    allSectors: string;
    location: string;
    allNetherlands: string;
    maxRadius: string;
    onlyOpen: string;
    clearFilters: string;
    noStallsTitle: string;
    noStallsDesc: string;
    showAllStalls: string;
    top5Products: string;
    bundles: string;
    viewProfile: string;
    combinedRequest: string;
    sendInquiry: string;
    emptyCart: string;
    feedbackBtn: string;
  }
> = {
  NL: {
    loginBtn: "Zakelijk Inloggen",
    beheerBtn: "Mijn Profiel & Beheer",
    cart: "Winkelmand",
    activeVisitors: "Actieve bezoekers op markt",
    openStalls: "actieve kraampjes geopend",
    reshuffle: "Herverdeel Markt",
    infiniteScrollOn: "Eindeloos Wandelen: Aan",
    infiniteScrollOff: "Eindeloos Wandelen: Uit",
    allSectors: "Alle Sectoren",
    location: "Locatie",
    allNetherlands: "Heel Nederland",
    maxRadius: "Max Straal",
    onlyOpen: "Alleen nu geopend",
    clearFilters: "Filters wissen",
    noStallsTitle: "Geen kraampjes gevonden",
    noStallsDesc: "Er zijn geen geopende kraampjes die voldoen aan de filters. Pas de filters aan of herverdeel het plein.",
    showAllStalls: "Toon alle kraampjes",
    top5Products: "Top 5 Producten",
    bundles: "Samenwerkingsbundels",
    viewProfile: "Bekijk Profiel →",
    combinedRequest: "GEOFROTEERDE AANVRAAG",
    sendInquiry: "Verstuur Gecombineerde Aanvraag",
    emptyCart: "Uw mandje is nog leeg.",
    feedbackBtn: "💬 Feedback & Suggesties",
  },
  EN: {
    loginBtn: "Business Login",
    beheerBtn: "My Profile & Manage",
    cart: "Cart",
    activeVisitors: "Active market visitors",
    openStalls: "active stalls open",
    reshuffle: "Reshuffle Market",
    infiniteScrollOn: "Endless Walk: ON",
    infiniteScrollOff: "Endless Walk: OFF",
    allSectors: "All Sectors",
    location: "Location",
    allNetherlands: "All Netherlands",
    maxRadius: "Max Radius",
    onlyOpen: "Open now only",
    clearFilters: "Clear filters",
    noStallsTitle: "No stalls found",
    noStallsDesc: "No open stalls match your filter criteria. Adjust filters or reshuffle the market square.",
    showAllStalls: "Show all stalls",
    top5Products: "Top 5 Products",
    bundles: "Collaboration Bundles",
    viewProfile: "View Profile →",
    combinedRequest: "COMBINED INQUIRY",
    sendInquiry: "Send Combined Inquiry",
    emptyCart: "Your cart is currently empty.",
    feedbackBtn: "💬 Feedback & Suggestions",
  },
  TI: {
    loginBtn: "ናይ ንግዲ ምእታው",
    beheerBtn: "መገለጺይን ምሕደራን",
    cart: "ጋሪ",
    activeVisitors: "ንጡፋት በጻሕቲ ዕዳጋ",
    openStalls: "ክፉታት ድኳናት",
    reshuffle: "ዕዳጋ ዳግማይ ኣዳልው",
    infiniteScrollOn: "ዘየቋርጽ ምጉዓዝ: በርሀ",
    infiniteScrollOff: "ዘየቋርጽ ምጉዓዝ: ጥፍአ",
    allSectors: "ኩሎም ዓውድታት",
    location: "ቦታ",
    allNetherlands: "ኩሉ ኔዘርላንድ",
    maxRadius: "ዝለዓለ ርሕቀት",
    onlyOpen: "ሕጂ ክፉታት ጥራይ",
    clearFilters: "መጽረዪታት ደምስስ",
    noStallsTitle: "ዝተረኽበ ድኳን የለን",
    noStallsDesc: "በዚ መጽረዪ ዝተረኽበ ድኳን የለን። መጽረዪታት ቀይር ወይ ዳግማይ ጀምር።",
    showAllStalls: "ኩሎም ድኳናት ኣርእይ",
    top5Products: "ቀዳሞት 5 ፍርያት",
    bundles: "ናይ ምትሕብባር ጥሙራት",
    viewProfile: "መገለጺ ርአ →",
    combinedRequest: "ዝተወሃሃደ ጠለብ",
    sendInquiry: "ዝተወሃሃደ ሕቶ ስደድ",
    emptyCart: "ጋሪኻ ጥራይ እዩ ዘሎ።",
    feedbackBtn: "💬 ርእይቶን ሓሳብን",
  },
};

export const SECTOR_TRANSLATIONS: Record<LanguageCode, Record<SectorType, string>> = {
  NL: {
    BRUILOFT: "Bruiloft",
    EVENEMENTEN_FEEST: "Feest & Events",
    BOUW_RENOVATIE: "Bouw & Renovatie",
    ZAKELIJK_CORPORATE: "Zakelijk",
    CATERING_HORECA: "Catering",
    MARKETING_MEDIA_FOTOGRAFIE: "Media & Foto",
    AUTOMOTIVE_LOGISTIEK: "Vervoer",
    BEAUTY_LIFESTYLE: "Beauty",
    ONDERWIJS_WORKSHOPS: "Onderwijs",
    KUNST_ENTERTAINMENT: "Kunst & Acts",
  },
  EN: {
    BRUILOFT: "Weddings",
    EVENEMENTEN_FEEST: "Events & Party",
    BOUW_RENOVATIE: "Construction",
    ZAKELIJK_CORPORATE: "Corporate",
    CATERING_HORECA: "Catering",
    MARKETING_MEDIA_FOTOGRAFIE: "Media & Photo",
    AUTOMOTIVE_LOGISTIEK: "Transport",
    BEAUTY_LIFESTYLE: "Beauty",
    ONDERWIJS_WORKSHOPS: "Education",
    KUNST_ENTERTAINMENT: "Arts & Acts",
  },
  TI: {
    BRUILOFT: "መርዓ",
    EVENEMENTEN_FEEST: "ጽምብላት",
    BOUW_RENOVATIE: "ህንጻ",
    ZAKELIJK_CORPORATE: "ንግዲ",
    CATERING_HORECA: "ምግቢ",
    MARKETING_MEDIA_FOTOGRAFIE: "ሚድያን ፎቶን",
    AUTOMOTIVE_LOGISTIEK: "መጓዓዝያ",
    BEAUTY_LIFESTYLE: "ጽባቐ",
    ONDERWIJS_WORKSHOPS: "ትምህርቲ",
    KUNST_ENTERTAINMENT: "ስነ-ጥበብ",
  },
};

// 10 Sectoren met unieke, stijlvolle dakkleur combinaties (Geen emojis)
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
    roofColor1: "#7c3aed",
    roofColor2: "#ffffff",
    isWood: false,
    borderCol: "border-purple-800",
    badgeBg: "bg-purple-900 text-purple-100",
  },
  EVENEMENTEN_FEEST: {
    label: "Feest",
    roofColor1: "#dc2626",
    roofColor2: "#ffffff",
    isWood: false,
    borderCol: "border-red-800",
    badgeBg: "bg-red-900 text-red-100",
  },
  BOUW_RENOVATIE: {
    label: "Bouw",
    roofColor1: "#78350f",
    roofColor2: "#451a03",
    isWood: true,
    borderCol: "border-amber-950",
    badgeBg: "bg-amber-950 text-amber-100",
  },
  ZAKELIJK_CORPORATE: {
    label: "Zakelijk",
    roofColor1: "#1d4ed8",
    roofColor2: "#ffffff",
    isWood: false,
    borderCol: "border-blue-900",
    badgeBg: "bg-blue-900 text-blue-100",
  },
  CATERING_HORECA: {
    label: "Catering",
    roofColor1: "#15803d",
    roofColor2: "#ffffff",
    isWood: false,
    borderCol: "border-emerald-900",
    badgeBg: "bg-emerald-950 text-emerald-100",
  },
  MARKETING_MEDIA_FOTOGRAFIE: {
    label: "Marketing & Media",
    roofColor1: "#c2410c",
    roofColor2: "#ffffff",
    isWood: false,
    borderCol: "border-orange-950",
    badgeBg: "bg-orange-950 text-orange-100",
  },
  AUTOMOTIVE_LOGISTIEK: {
    label: "Automotive & Transport",
    roofColor1: "#334155",
    roofColor2: "#94a3b8",
    isWood: false,
    borderCol: "border-slate-900",
    badgeBg: "bg-slate-900 text-slate-100",
  },
  BEAUTY_LIFESTYLE: {
    label: "Beauty & Lifestyle",
    roofColor1: "#db2777",
    roofColor2: "#ffffff",
    isWood: false,
    borderCol: "border-pink-950",
    badgeBg: "bg-pink-950 text-pink-100",
  },
  ONDERWIJS_WORKSHOPS: {
    label: "Onderwijs & Training",
    roofColor1: "#d97706",
    roofColor2: "#fef3c7",
    isWood: false,
    borderCol: "border-amber-900",
    badgeBg: "bg-amber-900 text-amber-100",
  },
  KUNST_ENTERTAINMENT: {
    label: "Kunst & Acts",
    roofColor1: "#581c87",
    roofColor2: "#facc15",
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

  // Language State: NL | EN | TI (via shared global LanguageContext)
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.NL;

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

  // Feedback Modal State (contact@antoniuscore.com)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [feedbackName, setFeedbackName] = useState<string>("");
  const [feedbackEmail, setFeedbackEmail] = useState<string>("");
  const [feedbackCategory, setFeedbackCategory] = useState<string>("Suggestie marktplein");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackSending, setFeedbackSending] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("antoniuscore_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
    }
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("antoniuscore_cart", JSON.stringify(newCart));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  };

  // Send feedback to /api/feedback
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setFeedbackSending(true);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          category: feedbackCategory,
          message: feedbackMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Fout bij verzenden van feedback.");
      }

      setFeedbackSuccess(
        data.message ||
          "Hartelijk dank! Uw feedback is rechtstreeks verzonden naar contact@antoniuscore.com."
      );
      setFeedbackMessage("");
    } catch (err: any) {
      setFeedbackError(err.message || "Er is een technische fout opgetreden.");
    } finally {
      setFeedbackSending(false);
    }
  };

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
        const organicOffsetX = Math.round((seededRandom(itemSeed) - 0.5) * 24);
        const organicOffsetY = Math.round((seededRandom(itemSeed + 1) - 0.5) * 20);

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
    const updated = [...cart, item];
    saveCartToStorage(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = cart.filter((_, idx) => idx !== index);
    saveCartToStorage(updated);
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
      const fullNotes = `Gecombineerde aanvraag voor ${cart.length} diensten/producten:\n${itemsList}\n\nOpmerkingen:\n${requestNotes}`;

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
      {/* STICKY NAVIGATIE BALK (Blijft sticky meescrollen bij 'Eindeloos Wandelen') */}
      <div className="sticky top-0 z-40 bg-[#cca440] shadow-xl border-b-4 border-[#4a2810]">
        {/* 1. Hoofd Header: Logo Links, Midden Rode Knop, Rechts Talen & Mandje */}
        <header className="px-3 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo Links: 'AntoniusCore' (linkt direct naar https://www.antoniuscore.com) */}
            <a
              href="https://www.antoniuscore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn-wood px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1.5 hover:opacity-95 transition shrink-0"
            >
              <span className="font-mono text-xs sm:text-base tracking-widest text-[#fcd34d]">
                AntoniusCore
              </span>
            </a>

            {/* Exact Midden: Opvallende Rode Knop "Zakelijk Inloggen" of "Mijn Profiel & Beheer" */}
            <div className="flex-1 flex justify-center">
              {isLoggedIn ? (
                <Link
                  href="/beheer"
                  className="pixel-btn-red px-3 sm:px-6 py-2 rounded text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-md transition text-center"
                >
                  {t.beheerBtn} ({userName ? userName.split(" ")[0] : ""})
                </Link>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="pixel-btn-red px-4 sm:px-8 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-black tracking-widest uppercase shadow-xl hover:scale-105 transition text-center"
                >
                  {t.loginBtn}
                </Link>
              )}
            </div>

            {/* Rechts: Talen Selector & Mandje */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Talen Selector (NL / EN / TI) */}
              <LanguageSelector />

              {/* Winkelmand */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="pixel-btn-gold px-3 py-2 rounded text-xs font-bold flex items-center gap-1.5 relative cursor-pointer"
              >
                <span className="hidden sm:inline">{t.cart}</span>
                <span className="sm:hidden font-mono font-black">🛒</span>
                {cart.length > 0 && (
                  <span className="bg-[#dc2626] text-white text-[10px] font-black rounded-full px-1.5 py-0.2 border border-[#450a0a]">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 2. Status & Controls Ticker */}
        <div className="bg-[#edd378] border-t border-b-2 border-[#7c481f] px-3 sm:px-6 py-1.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 font-semibold text-[#4a2810] text-[11px] sm:text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <span>
                {t.activeVisitors}:{" "}
                <strong className="font-mono text-emerald-900">{activeSessionCount}</strong>
              </span>
              <span className="text-[#8a4b1f] hidden sm:inline">•</span>
              <span className="text-[#63320f] font-medium hidden sm:inline">
                {filteredCompanies.length} {t.openStalls}
              </span>
            </div>

            {/* Randomize Knop & Infinite Scroll Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShuffleSalt((prev) => prev + 1)}
                className="pixel-btn-wood px-2.5 py-1 rounded text-[11px] sm:text-xs font-bold hover:brightness-105 transition cursor-pointer"
              >
                {t.reshuffle}
              </button>

              <button
                onClick={() => {
                  setIsInfiniteScroll(!isInfiniteScroll);
                  setInfiniteBatchCount(1);
                }}
                className={`px-2.5 py-1 rounded text-[11px] sm:text-xs font-bold border transition cursor-pointer ${
                  isInfiniteScroll
                    ? "bg-emerald-700 text-white border-emerald-950 shadow"
                    : "pixel-btn-wood text-[#fffbf2]"
                }`}
              >
                {isInfiniteScroll ? t.infiniteScrollOn : t.infiniteScrollOff}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Filter Bar: 10 Sectoren + Subfilters (Sticky samen met header) */}
        <div className="bg-[#edd378]/90 px-3 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto space-y-2">
            {/* 10 Sectoren Knoppen */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => setSelectedSector("ALL")}
                className={`px-2.5 py-1 rounded text-[11px] sm:text-xs font-bold transition border cursor-pointer whitespace-nowrap ${
                  selectedSector === "ALL"
                    ? "pixel-btn-gold"
                    : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
                }`}
              >
                {t.allSectors} ({companies.length})
              </button>

              {(Object.keys(SECTOR_THEMES) as SectorType[]).map((st) => {
                const meta = SECTOR_THEMES[st];
                const isSelected = selectedSector === st;
                const count = companies.filter(
                  (c) => c.primarySector === st && c.isMarketplaceVisible !== false
                ).length;

                return (
                  <button
                    key={st}
                    onClick={() => setSelectedSector(st)}
                    className={`px-2.5 py-1 rounded text-[11px] sm:text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "pixel-btn-wood"
                        : "bg-[#fff4d4] text-[#4a2810] border-[#ba793a] hover:bg-[#fff9ec]"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/25"
                      style={{ backgroundColor: meta.roofColor1 }}
                    />
                    <span>
                      {SECTOR_TRANSLATIONS[lang]?.[st] || meta.label} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Locatie, Straal & Nu Geopend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-medium text-[#4a2810]">
              <div className="flex items-center gap-1.5">
                <span className="font-bold">{t.location}:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-[#fff4d4] border border-[#7c481f] rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="ALL">{t.allNetherlands}</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold">{t.maxRadius}:</span>
                <select
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                  className="bg-[#fff4d4] border border-[#7c481f] rounded px-2 py-0.5 text-xs font-semibold focus:outline-none"
                >
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={200}>Alle afstanden</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none">
                <input
                  type="checkbox"
                  checked={onlyOpenNow}
                  onChange={(e) => setOnlyOpenNow(e.target.checked)}
                  className="accent-[#dc2626] w-3.5 h-3.5"
                />
                <span>{t.onlyOpen}</span>
              </label>

              {(selectedSector !== "ALL" || selectedCity !== "ALL" || onlyOpenNow) && (
                <button
                  onClick={() => {
                    setSelectedSector("ALL");
                    setSelectedCity("ALL");
                    setOnlyOpenNow(false);
                    setMaxRadiusKm(100);
                  }}
                  className="text-[#8a4b1f] hover:text-[#3b1d09] font-bold underline cursor-pointer ml-auto"
                >
                  {t.clearFilters}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Centrale 2D Marktplein Veld met Pixel Bomen aan de zijkanten */}
      <main className="flex-1 relative p-4 sm:p-8 max-w-7xl mx-auto w-full min-h-[700px]">
        {/* Linker en Rechter Bosranden (Stardew Valley bomen, struiken, paddenstoelen en rotsen) */}
        <PixelForestBorder side="left" />
        <PixelForestBorder side="right" />

        {/* Sporadische Stardew Graspolletjes op de Zandgrond */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {[
            { x: 12, y: 8, s: 18 },
            { x: 26, y: 14, s: 22 },
            { x: 42, y: 6, s: 16 },
            { x: 68, y: 10, s: 20 },
            { x: 84, y: 16, s: 18 },
            { x: 16, y: 38, s: 22 },
            { x: 34, y: 46, s: 16 },
            { x: 72, y: 40, s: 20 },
            { x: 86, y: 52, s: 18 },
            { x: 14, y: 72, s: 20 },
            { x: 30, y: 84, s: 18 },
            { x: 54, y: 76, s: 22 },
            { x: 76, y: 82, s: 16 },
            { x: 88, y: 88, s: 20 },
          ].map((grass, idx) => (
            <div
              key={`grass-tuft-${idx}`}
              className="absolute"
              style={{ left: `${grass.x}%`, top: `${grass.y}%` }}
            >
              <PixelGrassTuft size={grass.s} />
            </div>
          ))}
        </div>

        {/* Subtiel Marktplein Cobblestone Binnenplaats Achtergrond */}
        <div className="absolute inset-4 sm:inset-10 market-cobblestone rounded-2xl pointer-events-none opacity-30 border border-[#7c481f]/20 z-0" />

        {/* Dynamische Live Bezoekers Poppetjes */}
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
              <div className="relative w-6 h-8 flex flex-col items-center">
                {/* Hoedje */}
                <div
                  className="w-4 h-2 rounded-t-sm shadow-xs border border-black/30"
                  style={{ backgroundColor: v.hatColor }}
                />
                {/* Gezicht */}
                <div className="w-3.5 h-2.5 bg-[#f5d0a9] border-x border-black/20" />
                {/* Tuniek/Lichaam */}
                <div
                  className="w-4 h-3.5 rounded-b-xs border border-black/30 shadow-xs"
                  style={{ backgroundColor: v.color }}
                />
                {/* Schoenen */}
                <div className="w-3.5 h-1 flex justify-between">
                  <div className="w-1.5 h-1 bg-[#2d1808] rounded-xs" />
                  <div className="w-1.5 h-1 bg-[#2d1808] rounded-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kraampjes Grid: Fysiek geworteld in de grond (geen zwevende kaartjes meer!) */}
        {displayedStalls.length === 0 ? (
          <div className="relative z-10 text-center py-24 space-y-3">
            <h3 className="font-mono font-black text-xl text-[#4a2810]">
              {t.noStallsTitle}
            </h3>
            <p className="text-xs text-[#7c481f] max-w-md mx-auto">
              {t.noStallsDesc}
            </p>
            <button
              onClick={() => {
                setSelectedSector("ALL");
                setSelectedCity("ALL");
                setOnlyOpenNow(false);
              }}
              className="pixel-btn-wood px-4 py-2 rounded text-xs font-bold"
            >
              {t.showAllStalls}
            </button>
          </div>
        ) : (
          <div className="relative z-10 flex flex-wrap justify-center items-start gap-x-10 sm:gap-x-14 gap-y-14 sm:gap-y-18 py-8 px-4 sm:px-8 max-w-7xl mx-auto">
            {displayedStalls.map((company, index) => {
              const theme = SECTOR_THEMES[company.primarySector] || SECTOR_THEMES.ZAKELIJK_CORPORATE;
              const isOpen = checkIsOpenNow(company);
              const key = (company as any).instanceKey || `${company.id}-${index}`;
              const offsetX = (company as any).organicOffsetX || 0;
              const offsetY = (company as any).organicOffsetY || 0;

              // Pseudo-willekeurige organische spreiding & lichte rotatie per kraampje
              const itemSeed = stringToSeed(`${company.id}-${activeSeed}-${index}`);
              const organicScatterX = Math.round((seededRandom(itemSeed) - 0.5) * 54);
              const organicScatterY = Math.round((seededRandom(itemSeed + 1) - 0.5) * 36);
              const organicTilt = ((seededRandom(itemSeed + 2) - 0.5) * 2.8).toFixed(1);
              const organicStagger = Math.round(seededRandom(itemSeed + 3) * 24);

              // Bedrijfstype voor op de houten toonbank (bijv. Fotograaf, Kapper, Aannemer)
              const displayBusinessType =
                company.businessType?.trim() ||
                (company.primarySector === "BRUILOFT"
                  ? "Bruidsstylist"
                  : company.primarySector === "EVENEMENTEN_FEEST"
                  ? "Event Styling"
                  : company.primarySector === "BOUW_RENOVATIE"
                  ? "Aannemer"
                  : company.primarySector === "ZAKELIJK_CORPORATE"
                  ? "Media & Stand"
                  : company.primarySector === "CATERING_HORECA"
                  ? "Cateraar"
                  : company.primarySector === "MARKETING_MEDIA_FOTOGRAFIE"
                  ? "Fotograaf"
                  : company.primarySector === "AUTOMOTIVE_LOGISTIEK"
                  ? "VIP Vervoer"
                  : company.primarySector === "BEAUTY_LIFESTYLE"
                  ? "Visagist & Kapper"
                  : company.primarySector === "ONDERWIJS_WORKSHOPS"
                  ? "Trainer & Coach"
                  : "Kunst & Acts");

              return (
                <div
                  key={key}
                  onClick={() => handleStallClick(company)}
                  onMouseEnter={(e) => handleMouseEnterStall(company, e)}
                  onMouseLeave={handleMouseLeaveStall}
                  style={{
                    transform: `translate(${organicScatterX + offsetX}px, ${organicScatterY + offsetY}px) rotate(${organicTilt}deg)`,
                    marginTop: `${organicStagger}px`,
                  }}
                  className="group cursor-pointer flex flex-col items-center relative transition-transform duration-200 hover:-translate-y-2 hover:z-30 w-40 sm:w-48 shrink-0"
                >
                  {/* Verticale Houten Draagbalken (Links en Rechts) die het hele kraampje fysiek dragen */}
                  <div className="absolute left-1 sm:left-2 top-2 bottom-3 w-2 sm:w-2.5 bg-[#4a2810] border-r border-[#261205] rounded-t-xs z-10 shadow-xs" />
                  <div className="absolute right-1 sm:right-2 top-2 bottom-3 w-2 sm:w-2.5 bg-[#4a2810] border-l border-[#261205] rounded-t-xs z-10 shadow-xs" />

                  {/* Bovenste Dwarsbalk met IJzeren Ophanghaken */}
                  <div className="w-[92%] h-2 bg-[#5c2e0b] border border-[#2b1204] rounded-xs shadow-xs relative z-10 flex justify-between px-3">
                    <div className="w-1 h-2 bg-[#334155] -mb-1" />
                    <div className="w-1 h-2 bg-[#334155] -mb-1" />
                  </div>

                  {/* Houten Hangbord met Bedrijfsnaam (Geïntegreerd in de houten structuur met kettingen) */}
                  <div className="relative z-10 w-full px-1.5 -mt-0.5 mb-1">
                    <div className="w-full bg-[#3d1e08] border-2 border-[#200e03] rounded p-0.5 shadow-md">
                      <div className="w-full bg-[#f6ebd0] border border-[#a16207] px-2 py-1 rounded text-center min-h-[34px] flex items-center justify-center">
                        <span className="font-mono font-black text-[11px] sm:text-xs text-[#2b1305] leading-tight break-words">
                          {company.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2D PIXEL ART KRAAMPJE STRUCTUUR */}
                  <div className="relative w-34 sm:w-40 flex flex-col items-center z-10">
                    {/* Luifel / Dakje: Sector Gekleurde Strepen / Hout met Scalloped Valance */}
                    <div
                      className={`w-full h-9 sm:h-10 rounded-t-md border-3 ${theme.borderCol} shadow-md overflow-hidden relative`}
                      style={{
                        backgroundImage: theme.isWood
                          ? `repeating-linear-gradient(90deg, ${theme.roofColor1}, ${theme.roofColor1} 10px, ${theme.roofColor2} 10px, ${theme.roofColor2} 20px)`
                          : `repeating-linear-gradient(90deg, ${theme.roofColor1}, ${theme.roofColor1} 11px, ${theme.roofColor2} 11px, ${theme.roofColor2} 22px)`,
                      }}
                    >
                      {/* Golfjes / Scalloped zoom onderaan de luifel */}
                      <div className="absolute bottom-0 inset-x-0 h-2 bg-black/20 flex justify-between px-0.5">
                        <div className="w-2 h-2 rounded-full bg-black/25" />
                        <div className="w-2 h-2 rounded-full bg-black/25" />
                        <div className="w-2 h-2 rounded-full bg-black/25" />
                        <div className="w-2 h-2 rounded-full bg-black/25" />
                      </div>
                    </div>

                    {/* Houten Achterwand, Schappen & Winkelier Sprite */}
                    <div className="w-full h-7 bg-[#451f08] border-x-3 border-[#261205] flex items-center justify-between px-2.5 relative">
                      {/* Linker schap met kleine potjes */}
                      <div className="flex items-center gap-1 opacity-80">
                        <div className="w-2 h-3 bg-amber-400/80 rounded-xs border border-amber-800" />
                        <div className="w-1.5 h-2.5 bg-emerald-400/80 rounded-xs border border-emerald-800" />
                      </div>

                      {/* Winkelier Sprite achter toonbank */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-3.5 h-1.5 bg-[#dc2626] rounded-t-xs" />
                        <div className="w-4 h-4 rounded-full bg-[#fcd34d] border border-[#78350f] shadow-xs" />
                      </div>

                      {/* Rechter schap met potjes */}
                      <div className="flex items-center gap-1 opacity-80">
                        <div className="w-2 h-2.5 bg-indigo-400/80 rounded-xs border border-indigo-800" />
                        <div className="w-1.5 h-3 bg-rose-400/80 rounded-xs border border-rose-800" />
                      </div>
                    </div>

                    {/* Houten Toonbank / Balie met houtnerf */}
                    <div className="w-full h-11 bg-[#a35e27] border-3 border-[#4a2810] rounded-b-xs shadow-md px-1.5 py-1 flex flex-col items-center justify-between relative">
                      <div className="absolute top-5 inset-x-0 border-b border-[#5a2e0e]/50 pointer-events-none" />

                      {/* OP DE VOORKANT: HET BEDRIJFSTYPE PLAQUE (Carved Wood) */}
                      <div className="w-full text-center text-[9px] sm:text-[10px] font-black uppercase text-[#fff7ed] bg-[#351805] px-1 py-0.5 rounded tracking-wide truncate border border-[#b45309] -translate-y-1.5 shadow-sm">
                        {displayBusinessType}
                      </div>

                      {/* Status & Catalogus indicator */}
                      <div className="w-full flex items-center justify-between px-1 text-[9px] font-bold z-10">
                        <span className="text-[#3b1d09] font-mono">
                          {company.products.length} items
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full border border-black/40 ${
                            isOpen ? "bg-emerald-500 shadow-[0_0_6px_#22c55e]" : "bg-rose-600"
                          }`}
                          title={isOpen ? "Nu Geopend" : "Nu Gesloten"}
                        />
                      </div>
                    </div>

                    {/* Stevige Natuurstenen Vlonder Fundering (Platform dat in de aarde verankerd is!) */}
                    <div className="w-38 sm:w-44 h-3 bg-[#64748b] border-2 border-[#334155] rounded-xs shadow-sm mt-0.5 flex justify-around items-center">
                      <div className="w-px h-full bg-[#334155]" />
                      <div className="w-px h-full bg-[#334155]" />
                      <div className="w-px h-full bg-[#334155]" />
                    </div>

                    {/* Decoratieve Grond-prop naast het kraampje (Ton, Krat of Bloempot) */}
                    <div className="absolute -bottom-1 -left-2.5 z-20 pointer-events-none">
                      {index % 3 === 0 && <PixelBarrel size={18} />}
                      {index % 3 === 1 && <PixelCrate size={16} />}
                      {index % 3 === 2 && <PixelFlowerPot size={17} />}
                    </div>

                    {/* Diepe Pixel Contactschaduw op het Zand */}
                    <div className="w-38 sm:w-44 h-3.5 bg-[#2d1808]/40 rounded-full blur-[1px] -mt-1.5 z-0" />
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

      {/* 5. Hover Popup: Enkel Top 5 Producten & 5 Afgesproken Bundels */}
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
                  {hoveredCompany.businessType || SECTOR_THEMES[hoveredCompany.primarySector]?.label} • {hoveredCompany.city || "Nederland"}
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
                {t.top5Products}:
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
                  {t.bundles}:
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
              <span className="text-[#8a4b1f] font-bold">{t.viewProfile}</span>
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
                    {t.combinedRequest}
                  </h3>
                  <p className="text-xs text-[#7c481f]">
                    Verzamel diensten van meerdere marktpartijen in één gecombineerde aanvraag.
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
                  <p className="font-bold mb-1">{t.emptyCart}</p>
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

                  {/* Betrokken Bedrijven Overzicht */}
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

                  {/* Knop naar Uitgebreide Meerstaps Winkelmand & Planning */}
                  <div className="pt-2">
                    <Link
                      href="/winkelmand"
                      className="pixel-btn-wood w-full py-2.5 rounded text-xs font-black uppercase tracking-wider block text-center shadow-md hover:scale-101 transition border border-[#7c481f]"
                    >
                      📅 Naar Meerstaps Winkelmand & Planning →
                    </Link>
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
                        {isSubmitting ? "Aanvraag verzenden..." : t.sendInquiry}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Mandje Footer */}
            <div className="pt-4 border-t border-[#7c481f]/30 text-[10px] text-[#7c481f] text-center">
              AntoniusCore B2B2C Marktplein • Vrijblijvende gecombineerde aanvragen.
            </div>
          </div>
        </div>
      )}

      {/* 7. Floating Pixel-Art Feedback Knop */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-4 right-4 z-40 pixel-btn-wood px-3.5 py-2 rounded-lg text-xs font-black shadow-xl hover:scale-105 transition flex items-center gap-1.5 cursor-pointer border-2 border-[#fff4d4]"
        title="Verstuur feedback of suggesties direct naar contact@antoniuscore.com"
      >
        <span>💬 Feedback</span>
      </button>

      {/* 8. Feedback Modal (contact@antoniuscore.com) */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md pixel-box-parchment p-6 rounded-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-[#7c481f] pb-2">
              <h3 className="font-mono font-black text-sm uppercase text-[#3b1d09] flex items-center gap-1.5">
                <span>💬 Feedback & Suggesties</span>
              </h3>
              <button
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setFeedbackSuccess(null);
                }}
                className="text-[#7c481f] hover:text-black font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5c3011]">
              Uw feedback en ideeën worden direct verstuurd naar{" "}
              <strong className="text-[#3b1d09]">contact@antoniuscore.com</strong> om het platform en het marktplein continu te verbeteren.
            </p>

            {feedbackSuccess ? (
              <div className="p-4 bg-emerald-100 border border-emerald-500 rounded text-emerald-900 text-xs font-bold text-center space-y-3">
                <p>{feedbackSuccess}</p>
                <button
                  onClick={() => {
                    setIsFeedbackOpen(false);
                    setFeedbackSuccess(null);
                  }}
                  className="pixel-btn-wood px-4 py-1.5 rounded text-xs font-bold"
                >
                  Sluiten
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                {feedbackError && (
                  <div className="p-2 bg-rose-100 border border-rose-500 rounded text-rose-900 text-xs font-bold">
                    {feedbackError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Uw Naam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    placeholder="bijv. Jan Jansen"
                    className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    E-mailadres (optioneel voor reactie)
                  </label>
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="jan@voorbeeld.nl"
                    className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Categorie
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="Suggestie marktplein">💡 Suggestie marktplein & beleving</option>
                    <option value="Foutmelding of bug">🐞 Fout of bug melden</option>
                    <option value="Bedrijf toevoegen">🏪 Bedrijf toevoegen / registreren</option>
                    <option value="Samenwerking of synergie">🤝 Samenwerking of synergie</option>
                    <option value="Overig">✉️ Overig</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#4a2810] mb-1">
                    Uw Bericht of Verbeterpunt *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Laat ons weten wat we kunnen verbeteren of toevoegen..."
                    className="w-full bg-[#fff4d4] border border-[#7c481f] rounded px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#7c481f]/30">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3 py-1.5 rounded text-xs font-bold text-[#4a2810] hover:bg-[#edd378]"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSending}
                    className="pixel-btn-red px-5 py-2 rounded text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {feedbackSending ? "Verzenden..." : "Feedback Verzenden"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
