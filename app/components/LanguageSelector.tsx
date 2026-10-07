"use client";

import React from "react";
import { useLanguage, LanguageCode } from "@/app/context/LanguageContext";

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = "" }: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();

  const options: { code: LanguageCode; label: string; full: string }[] = [
    { code: "NL", label: "NL", full: "Nederlands" },
    { code: "EN", label: "EN", full: "English" },
    { code: "TI", label: "TI", full: "ትግርኛ (Tigrinya)" },
  ];

  return (
    <div
      className={`inline-flex items-center bg-[#fff4d4] border-2 border-[#4a2810] rounded p-0.5 shadow-xs ${className}`}
      role="group"
      aria-label="Taalkeuze / Language Selector"
    >
      {options.map((opt) => {
        const isActive = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            title={opt.full}
            className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-black rounded transition cursor-pointer ${
              isActive
                ? "bg-[#4a2810] text-[#fff4d4] shadow-xs"
                : "text-[#7c481f] hover:text-[#3b1d09] hover:bg-[#edd378]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
