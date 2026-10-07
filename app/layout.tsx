import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelFont = VT323({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AntoniusCore — Stardew Valley 2D Top-Down Marktplein",
  description: "Interactief 2D Top-Down Marktplein met kraampjes, wandelende dorpsbezoekers en bulk winkelmand.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#e4c158] text-[#2d1808]">
        {children}
      </body>
    </html>
  );
}
