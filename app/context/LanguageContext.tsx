"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "NL" | "EN" | "TI";

export interface Translations {
  // Navigation & Common
  backToMarket: string;
  backToProfile: string;
  brandTitle: string;
  loginBtn: string;
  beheerBtn: string;
  cart: string;
  save: string;
  saving: string;
  savedSuccess: string;
  errorOccurred: string;
  close: string;
  cancel: string;
  send: string;
  sending: string;
  loading: string;
  openNow: string;
  closedNow: string;
  serviceRadius: string;
  availableStaff: string;
  capacityPerProduct: string;
  viewStall: string;
  contactAndQuote: string;
  projectsAndChat: string;

  // Market Ticker & Controls
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
  feedbackTitle: string;
  feedbackDesc: string;
  feedbackSuccess: string;

  // Cart / Winkelmand Page
  cartPageTitle: string;
  cartStep1: string;
  cartStep2: string;
  cartStep3: string;
  cartStep4: string;
  guestCount: string;
  eventDateLabel: string;
  eventTimeSlotLabel: string;
  eventLocationLabel: string;
  customerNameLabel: string;
  customerEmailLabel: string;
  customerPhoneLabel: string;
  projectNotesLabel: string;
  staffCalculated: string;
  staffNeededTotal: string;
  inquirySentSuccess: string;
  toDetailedCart: string;

  // Beheer & Projecten
  beheerTitle: string;
  tabProfile: string;
  tabSectors: string;
  tabHours: string;
  tabCatalog: string;
  tabPartners: string;
  tabProjects: string;
  projectListTitle: string;
  chatBroadcast: string;
  chatSelective: string;
  chatPlaceholder: string;
}

export const TRANSLATION_DATA: Record<LanguageCode, Translations> = {
  NL: {
    backToMarket: "← Terug naar Marktplein",
    backToProfile: "← Terug naar Profiel & Beheer",
    brandTitle: "AntoniusCore",
    loginBtn: "Zakelijk Inloggen",
    beheerBtn: "Mijn Profiel & Beheer",
    cart: "Winkelmand",
    save: "Opslaan",
    saving: "Opslaan...",
    savedSuccess: "Wijzigingen succesvol opgeslagen!",
    errorOccurred: "Er is een fout opgetreden.",
    close: "Sluiten",
    cancel: "Annuleren",
    send: "Verzenden",
    sending: "Verzenden...",
    loading: "Laden...",
    openNow: "Nu Geopend",
    closedNow: "Nu Gesloten",
    serviceRadius: "Werkgebied",
    availableStaff: "Beschikbaar Personeel",
    capacityPerProduct: "Capaciteit per dienst",
    viewStall: "Bekijk Kraampje ↗",
    contactAndQuote: "Contact & Offerte",
    projectsAndChat: "Projecten & Chat",

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
    feedbackBtn: "💬 Feedback",
    feedbackTitle: "💬 Feedback voor AntoniusCore",
    feedbackDesc: "Uw feedback en suggesties worden direct verstuurd naar contact@antoniuscore.com om het marktplein continu te perfectioneren.",
    feedbackSuccess: "Hartelijk dank! Uw feedback is rechtstreeks verzonden naar contact@antoniuscore.com.",

    cartPageTitle: "Winkelmand, Planning & Personeel",
    cartStep1: "1. Selectie",
    cartStep2: "2. Bundelen & Personeel",
    cartStep3: "3. Agenda & Tijdstip",
    cartStep4: "4. Klant & Verzenden",
    guestCount: "Aantal Verwachte Gasten",
    eventDateLabel: "Gewenste Datum",
    eventTimeSlotLabel: "Tijdsblok",
    eventLocationLabel: "Evenement Locatie / Plaats",
    customerNameLabel: "Uw Volledige Naam *",
    customerEmailLabel: "E-mailadres *",
    customerPhoneLabel: "Telefoonnummer (optioneel)",
    projectNotesLabel: "Toelichting of Bijzondere Wensen",
    staffCalculated: "Berekend personeel",
    staffNeededTotal: "Totaal Benodigd Personeel",
    inquirySentSuccess: "Aanvraag succesvol verzonden!",
    toDetailedCart: "📅 Naar Meerstaps Winkelmand & Planning →",

    beheerTitle: "Mijn Bedrijfsprofiel & Kraambeheer",
    tabProfile: "1. Bedrijf & Kraam",
    tabSectors: "2. Sectoren & Synergie",
    tabHours: "3. Openingstijden",
    tabCatalog: "4. Catalogus & Top 5",
    tabPartners: "5. Samenwerkingspartners",
    tabProjects: "💬 6. Projecten & Chat",
    projectListTitle: "Geaccepteerde Projecten & Gecombineerde Chat",
    chatBroadcast: "📢 Iedereen in het project (Alle partners)",
    chatSelective: "🔒 Alleen naar:",
    chatPlaceholder: "Typ uw bericht naar het projectteam...",
  },
  EN: {
    backToMarket: "← Back to Marketplace",
    backToProfile: "← Back to Profile & Manage",
    brandTitle: "AntoniusCore",
    loginBtn: "Business Login",
    beheerBtn: "My Profile & Manage",
    cart: "Cart",
    save: "Save",
    saving: "Saving...",
    savedSuccess: "Changes saved successfully!",
    errorOccurred: "An error occurred.",
    close: "Close",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending...",
    loading: "Loading...",
    openNow: "Open Now",
    closedNow: "Closed Now",
    serviceRadius: "Service Radius",
    availableStaff: "Available Staff",
    capacityPerProduct: "Capacity per service",
    viewStall: "View Stall ↗",
    contactAndQuote: "Contact & Quote",
    projectsAndChat: "Projects & Chat",

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
    feedbackBtn: "💬 Feedback",
    feedbackTitle: "💬 Feedback for AntoniusCore",
    feedbackDesc: "Your feedback is sent directly to contact@antoniuscore.com to continuously enhance the marketplace.",
    feedbackSuccess: "Thank you! Your feedback has been sent directly to contact@antoniuscore.com.",

    cartPageTitle: "Cart, Scheduling & Staffing",
    cartStep1: "1. Selection",
    cartStep2: "2. Bundling & Staffing",
    cartStep3: "3. Schedule & Time",
    cartStep4: "4. Contact & Submit",
    guestCount: "Expected Guest Count",
    eventDateLabel: "Preferred Date",
    eventTimeSlotLabel: "Time Slot",
    eventLocationLabel: "Event Location / City",
    customerNameLabel: "Your Full Name *",
    customerEmailLabel: "Email Address *",
    customerPhoneLabel: "Phone Number (optional)",
    projectNotesLabel: "Project Notes or Special Requests",
    staffCalculated: "Calculated staff",
    staffNeededTotal: "Total Staff Required",
    inquirySentSuccess: "Inquiry successfully submitted!",
    toDetailedCart: "📅 Go to Multi-step Cart & Planning →",

    beheerTitle: "My Business Profile & Stall Management",
    tabProfile: "1. Business & Stall",
    tabSectors: "2. Sectors & Synergy",
    tabHours: "3. Opening Hours",
    tabCatalog: "4. Catalog & Top 5",
    tabPartners: "5. Partners",
    tabProjects: "💬 6. Projects & Chat",
    projectListTitle: "Accepted Projects & Group Chat",
    chatBroadcast: "📢 Everyone in the project (All partners)",
    chatSelective: "🔒 Only to:",
    chatPlaceholder: "Type your message to the project team...",
  },
  TI: {
    backToMarket: "← ናብ ዕዳጋ ተመለስ",
    backToProfile: "← ናብ መገለጺ ተመለስ",
    brandTitle: "ኣንቶንዩስኮር",
    loginBtn: "ናይ ንግዲ ምእታው",
    beheerBtn: "መገለጺይን ምሕደራን",
    cart: "ጋሪ",
    save: "ኣዕቅብ",
    saving: "የዕቅብ ኣሎ...",
    savedSuccess: "ለውጥታት ብዓወት ተዓቂቡ!",
    errorOccurred: "ስሕተት ተረኺቡ።",
    close: "ዕጾ",
    cancel: "ሰርዝ",
    send: "ስደድ",
    sending: "ይስደድ ኣሎ...",
    loading: "ይጽዕን ኣሎ...",
    openNow: "ሕጂ ክፉት",
    closedNow: "ሕጂ ዕጹው",
    serviceRadius: "ናይ ኣገልግሎት ርሕቀት",
    availableStaff: "ዘሎ ሰራሕተኛ",
    capacityPerProduct: "ዓቕሚ ብኣገልግሎት",
    viewStall: "ድኳን ርአ ↗",
    contactAndQuote: "ርክብን ዋጋን",
    projectsAndChat: "ፕሮጀክትታትን ቻትን",

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
    feedbackBtn: "💬 ርእይቶ",
    feedbackTitle: "💬 ንኣንቶንዩስኮር ርእይቶ",
    feedbackDesc: "ርእይቶኹም ብቐጥታ ናብ contact@antoniuscore.com ይለኣኽ።",
    feedbackSuccess: "የቐንየልና! ርእይቶኹም ብቐጥታ ናብ contact@antoniuscore.com ተላኢኹ ኣሎ።",

    cartPageTitle: "ጋሪ፡ መደብን ሰራሕተኛታትን",
    cartStep1: "1. ምምራጽ",
    cartStep2: "2. ምጥማርን ሰራሕተኛታትን",
    cartStep3: "3. ዕለትን ሰዓትን",
    cartStep4: "4. ተጠቃምን ምስዳድን",
    guestCount: "ዝጽበዩ ኣጋይሽ",
    eventDateLabel: "ዝድለ ዕለት",
    eventTimeSlotLabel: "ናይ ግዜ ሰዓት",
    eventLocationLabel: "ቦታ ፍጻመ / ከተማ",
    customerNameLabel: "ምሉእ ስምኩም *",
    customerEmailLabel: "ኢመይል ኣድራሻ *",
    customerPhoneLabel: "ቁጽሪ ተሌፎን (ኣማራጺ)",
    projectNotesLabel: "ተወሳኺ ሓሳባት ወይ ጠለባት",
    staffCalculated: "ዝተሓሰበ ሰራሕተኛ",
    staffNeededTotal: "ጠቕላላ ዘድሊ ሰራሕተኛ",
    inquirySentSuccess: "ጠለብ ብዓወት ተላኢኹ!",
    toDetailedCart: "📅 ናብ ምሉእ ጋሪን መደብን ኪድ →",

    beheerTitle: "ናይ ንግዲ መገለጺይን ምሕደራ ድኳንን",
    tabProfile: "1. ትካልን ድኳንን",
    tabSectors: "2. ዓውድታትን ምትሕብባርን",
    tabHours: "3. ሰዓታት ስራሕ",
    tabCatalog: "4. ካታሎግን ቀዳሞት 5ን",
    tabPartners: "5. መሻርኽቲ",
    tabProjects: "💬 6. ፕሮጀክትታትን ቻትን",
    projectListTitle: "ዝተቐበልካዮም ፕሮጀክትታትን ቻትን",
    chatBroadcast: "📢 ንኹሎም መሻርኽቲ ፕሮጀክት",
    chatSelective: "🔒 ንጥራይ፡",
    chatPlaceholder: "መልእኽትኹም ጽሓፉ...",
  },
};

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "NL",
  setLang: () => {},
  t: TRANSLATION_DATA.NL,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("NL");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("antoniuscore_lang") as LanguageCode;
      if (stored && (stored === "NL" || stored === "EN" || stored === "TI")) {
        setLangState(stored);
      }
    } catch (e) {
      console.warn("Could not read lang from localStorage", e);
    }
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem("antoniuscore_lang", newLang);
    } catch (e) {
      console.warn("Could not save lang to localStorage", e);
    }
  };

  const t = TRANSLATION_DATA[lang] || TRANSLATION_DATA.NL;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
