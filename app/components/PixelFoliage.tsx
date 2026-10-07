"use client";

import React from "react";

/**
 * Pixel Art SVG Assets inspired by Stardew Valley nature scenery
 * All SVGs use shape-rendering="crispEdges" to preserve authentic pixel perfection.
 */

// 1. Stardew Pine Tree (Conifer with tiered needle layers)
export function PixelPineTree({ className = "", size = 96 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 64 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_8px_4px_rgba(40,25,10,0.35)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Contact Shadow */}
      <ellipse cx="32" cy="80" rx="18" ry="4" fill="#2d1808" fillOpacity="0.4" />

      {/* Trunk with Roots */}
      <rect x="28" y="62" width="8" height="16" fill="#4a2810" />
      <rect x="29" y="63" width="3" height="14" fill="#6a3b1a" />
      <rect x="25" y="74" width="4" height="4" fill="#3b1d09" />
      <rect x="35" y="74" width="4" height="4" fill="#3b1d09" />
      <rect x="26" y="76" width="3" height="3" fill="#4a2810" />
      <rect x="35" y="76" width="3" height="3" fill="#4a2810" />

      {/* Tier 3 (Bottom Needle Tier) */}
      <polygon points="32,36 10,66 54,66" fill="#1b4332" />
      <polygon points="32,36 16,64 48,64" fill="#2d6a4f" />
      <polygon points="32,38 22,60 42,60" fill="#40916c" />
      <polygon points="32,40 26,56 38,56" fill="#52b788" />
      {/* Needle notches */}
      <rect x="12" y="64" width="6" height="4" fill="#1b4332" />
      <rect x="22" y="64" width="6" height="4" fill="#1b4332" />
      <rect x="36" y="64" width="6" height="4" fill="#1b4332" />
      <rect x="46" y="64" width="6" height="4" fill="#1b4332" />

      {/* Tier 2 (Middle Needle Tier) */}
      <polygon points="32,20 14,48 50,48" fill="#1b4332" />
      <polygon points="32,20 20,46 44,46" fill="#2d6a4f" />
      <polygon points="32,22 24,42 40,42" fill="#40916c" />
      <polygon points="32,24 28,38 36,38" fill="#52b788" />

      {/* Tier 1 (Top Tip Needle Tier) */}
      <polygon points="32,4 20,28 44,28" fill="#1b4332" />
      <polygon points="32,4 24,26 40,26" fill="#2d6a4f" />
      <polygon points="32,6 26,22 38,22" fill="#40916c" />
      <polygon points="32,8 29,18 35,18" fill="#74c69d" />
      {/* Star/Tip highlight */}
      <rect x="31" y="4" width="2" height="4" fill="#95d5b2" />
    </svg>
  );
}

// 2. Stardew Fluffy Oak Tree (Deciduous canopy with cloud-like leaf bundles)
export function PixelOakTree({ className = "", size = 100 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 72 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_8px_4px_rgba(40,25,10,0.35)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Contact Shadow */}
      <ellipse cx="36" cy="85" rx="22" ry="5" fill="#2d1808" fillOpacity="0.4" />

      {/* Trunk and branches */}
      <rect x="30" y="56" width="12" height="26" fill="#4a2810" />
      <rect x="32" y="56" width="5" height="24" fill="#6f4219" />
      <rect x="25" y="78" width="6" height="6" fill="#381b06" />
      <rect x="41" y="78" width="6" height="6" fill="#381b06" />
      <rect x="24" y="81" width="3" height="3" fill="#4a2810" />
      <rect x="45" y="81" width="3" height="3" fill="#4a2810" />

      {/* Branch forks */}
      <rect x="26" y="52" width="6" height="8" fill="#4a2810" />
      <rect x="40" y="52" width="6" height="8" fill="#4a2810" />

      {/* Canopy Clump 1 (Bottom Left) */}
      <circle cx="24" cy="50" r="16" fill="#1b4332" />
      <circle cx="23" cy="48" r="13" fill="#2d6a4f" />
      <circle cx="21" cy="46" r="9" fill="#40916c" />
      <circle cx="19" cy="44" r="5" fill="#74c69d" />

      {/* Canopy Clump 2 (Bottom Right) */}
      <circle cx="48" cy="50" r="16" fill="#1b4332" />
      <circle cx="47" cy="48" r="13" fill="#2d6a4f" />
      <circle cx="45" cy="46" r="9" fill="#40916c" />
      <circle cx="43" cy="44" r="5" fill="#74c69d" />

      {/* Canopy Clump 3 (Mid Left) */}
      <circle cx="22" cy="34" r="16" fill="#1b4332" />
      <circle cx="21" cy="32" r="13" fill="#2d6a4f" />
      <circle cx="20" cy="30" r="9" fill="#52b788" />
      <circle cx="18" cy="28" r="5" fill="#95d5b2" />

      {/* Canopy Clump 4 (Mid Right) */}
      <circle cx="50" cy="34" r="16" fill="#1b4332" />
      <circle cx="49" cy="32" r="13" fill="#2d6a4f" />
      <circle cx="48" cy="30" r="9" fill="#52b788" />
      <circle cx="46" cy="28" r="5" fill="#95d5b2" />

      {/* Canopy Clump 5 (Top Center Crown) */}
      <circle cx="36" cy="24" r="18" fill="#1b4332" />
      <circle cx="35" cy="22" r="15" fill="#2d6a4f" />
      <circle cx="34" cy="19" r="11" fill="#40916c" />
      <circle cx="32" cy="16" r="7" fill="#74c69d" />
      <circle cx="31" cy="14" r="3" fill="#d8f3dc" />
    </svg>
  );
}

// 3. Stardew Round Berry Bush
export function PixelBush({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 40 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_3px_rgba(40,25,10,0.3)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Shadow */}
      <ellipse cx="20" cy="30" rx="16" ry="3.5" fill="#2d1808" fillOpacity="0.35" />

      {/* Base Bush Circles */}
      <circle cx="14" cy="20" r="10" fill="#1e4620" />
      <circle cx="26" cy="20" r="10" fill="#1e4620" />
      <circle cx="20" cy="14" r="11" fill="#2d6a4f" />
      <circle cx="18" cy="12" r="8" fill="#40916c" />
      <circle cx="16" cy="10" r="5" fill="#74c69d" />

      {/* Red Berries */}
      <circle cx="12" cy="16" r="2" fill="#ef4444" />
      <circle cx="24" cy="14" r="2" fill="#ef4444" />
      <circle cx="18" cy="22" r="2" fill="#ef4444" />
      <circle cx="28" cy="20" r="1.5" fill="#ef4444" />
      {/* Berry highlights */}
      <rect x="11.5" y="15.5" width="1" height="1" fill="#fecaca" />
      <rect x="23.5" y="13.5" width="1" height="1" fill="#fecaca" />
    </svg>
  );
}

// 4. Stardew Fly Agaric Red Mushroom
export function PixelRedMushroom({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_2px_rgba(40,25,10,0.3)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="12" cy="22" rx="6" ry="2" fill="#2d1808" fillOpacity="0.35" />
      {/* Stem */}
      <rect x="10" y="14" width="4" height="8" fill="#fef08a" />
      <rect x="11" y="14" width="2" height="7" fill="#ffffff" />
      {/* Cap */}
      <ellipse cx="12" cy="12" rx="9" ry="6" fill="#b91c1c" />
      <ellipse cx="12" cy="11" rx="8" ry="4.5" fill="#dc2626" />
      {/* White Dots */}
      <rect x="7" y="9" width="2" height="2" fill="#ffffff" />
      <rect x="15" y="9" width="2" height="2" fill="#ffffff" />
      <rect x="11" y="7" width="2" height="2" fill="#ffffff" />
      <rect x="12" y="12" width="2" height="2" fill="#ffffff" />
    </svg>
  );
}

// 5. Stardew Brown Mushroom
export function PixelBrownMushroom({ className = "", size = 26 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_2px_rgba(40,25,10,0.3)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="12" cy="22" rx="6" ry="2" fill="#2d1808" fillOpacity="0.35" />
      {/* Stem */}
      <rect x="10" y="14" width="4" height="8" fill="#e2e8f0" />
      <rect x="11" y="14" width="2" height="7" fill="#f8fafc" />
      {/* Cap */}
      <ellipse cx="12" cy="12" rx="8" ry="5" fill="#582f0e" />
      <ellipse cx="12" cy="11" rx="7" ry="3.5" fill="#7f4f24" />
      <rect x="9" y="8" width="5" height="2" fill="#936639" />
    </svg>
  );
}

// 6. Stardew Boulder / Rock Cluster
export function PixelRockCluster({ className = "", size = 38 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_3px_2px_rgba(40,25,10,0.3)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="18" cy="21" rx="14" ry="3" fill="#2d1808" fillOpacity="0.4" />
      {/* Big Rock */}
      <ellipse cx="14" cy="13" rx="10" ry="7" fill="#334155" />
      <ellipse cx="13" cy="12" rx="8" ry="5" fill="#475569" />
      <ellipse cx="12" cy="10" rx="5" ry="3" fill="#64748b" />
      <rect x="10" y="8" width="3" height="2" fill="#94a3b8" />

      {/* Small Rock */}
      <ellipse cx="26" cy="16" rx="6" ry="4" fill="#334155" />
      <ellipse cx="25" cy="15" rx="5" ry="3" fill="#475569" />
      <rect x="24" y="14" width="2" height="1" fill="#94a3b8" />
    </svg>
  );
}

// 7. Stardew Mossy Tree Stump
export function PixelTreeStump({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 36 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_2px_rgba(40,25,10,0.35)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="18" cy="25" rx="14" ry="3" fill="#2d1808" fillOpacity="0.4" />
      {/* Base */}
      <path d="M 6,24 L 9,14 L 27,14 L 30,24 Z" fill="#4a2810" />
      <rect x="5" y="22" width="4" height="3" fill="#381b06" />
      <rect x="27" y="22" width="4" height="3" fill="#381b06" />

      {/* Top Oval Cut */}
      <ellipse cx="18" cy="14" rx="9" ry="4" fill="#713f12" />
      <ellipse cx="18" cy="14" rx="7" ry="3" fill="#854d0e" />
      <ellipse cx="18" cy="14" rx="4" ry="1.5" fill="#a16207" />
      <circle cx="18" cy="14" r="1" fill="#4a2810" />

      {/* Moss patches */}
      <rect x="8" y="17" width="3" height="4" fill="#65a30d" />
      <rect x="10" y="19" width="3" height="3" fill="#84cc16" />
    </svg>
  );
}

// 8. Sporadic Pixel Grass Tuft (For scattering over the sand ground)
export function PixelGrassTuft({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none opacity-85 ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Blade 1 (Left) */}
      <rect x="3" y="10" width="2" height="4" fill="#365314" />
      <rect x="2" y="6" width="2" height="5" fill="#4d7c0f" />
      <rect x="1" y="3" width="2" height="4" fill="#65a30d" />
      <rect x="1" y="2" width="1" height="2" fill="#a3e635" />

      {/* Blade 2 (Center High) */}
      <rect x="9" y="8" width="2" height="6" fill="#365314" />
      <rect x="9" y="4" width="2" height="5" fill="#4d7c0f" />
      <rect x="9" y="1" width="2" height="4" fill="#65a30d" />
      <rect x="10" y="0" width="1" height="2" fill="#bef264" />

      {/* Blade 3 (Right) */}
      <rect x="15" y="9" width="2" height="5" fill="#365314" />
      <rect x="16" y="5" width="2" height="5" fill="#4d7c0f" />
      <rect x="17" y="3" width="2" height="3" fill="#65a30d" />
      <rect x="18" y="2" width="1" height="2" fill="#a3e635" />
    </svg>
  );
}

// 9. Side Forest Lane (Renders a lush, organic column of pixel trees and undergrowth for the borders)
export function PixelForestBorder({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-0 bottom-0 pointer-events-none z-10 w-24 sm:w-40 lg:w-56 overflow-hidden flex flex-col justify-around items-center ${
        side === "left" ? "left-0 -translate-x-3 sm:-translate-x-6" : "right-0 translate-x-3 sm:translate-x-6"
      }`}
      aria-hidden="true"
    >
      {/* Cluster 1: Top Forest */}
      <div className="relative w-full flex flex-col items-center pt-4">
        <PixelPineTree size={88} className="translate-x-2" />
        <div className="flex items-center gap-1 -mt-6">
          <PixelBush size={44} />
          <PixelRedMushroom size={24} className="translate-y-2" />
        </div>
      </div>

      {/* Cluster 2: Upper Mid Forest */}
      <div className="relative w-full flex flex-col items-center">
        <PixelOakTree size={92} className="-translate-x-2" />
        <div className="flex items-center justify-center gap-2 -mt-4">
          <PixelTreeStump size={36} />
          <PixelGrassTuft size={20} />
          <PixelBrownMushroom size={22} />
        </div>
      </div>

      {/* Cluster 3: Mid Forest */}
      <div className="relative w-full flex flex-col items-center">
        <PixelPineTree size={100} className="translate-x-3" />
        <div className="flex items-center gap-1 -mt-5">
          <PixelRockCluster size={36} />
          <PixelBush size={48} className="-translate-x-1" />
        </div>
      </div>

      {/* Cluster 4: Lower Mid Forest */}
      <div className="relative w-full flex flex-col items-center">
        <PixelOakTree size={96} className="translate-x-1" />
        <div className="flex items-center gap-1 -mt-6">
          <PixelRedMushroom size={26} />
          <PixelGrassTuft size={22} />
          <PixelBush size={42} />
        </div>
      </div>

      {/* Cluster 5: Bottom Forest */}
      <div className="relative w-full flex flex-col items-center pb-8">
        <PixelPineTree size={92} className="-translate-x-2" />
        <div className="flex items-center gap-2 -mt-5">
          <PixelTreeStump size={40} />
          <PixelRockCluster size={34} />
        </div>
      </div>
    </div>
  );
}

// 10. Pixel Barrel (Ground Prop)
export function PixelBarrel({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_1px_rgba(40,25,10,0.35)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="10" cy="22" rx="8" ry="2" fill="#2d1808" fillOpacity="0.4" />
      {/* Wood barrel body */}
      <rect x="2" y="4" width="16" height="18" rx="2" fill="#854d0e" />
      <rect x="3" y="4" width="3" height="18" fill="#713f12" />
      <rect x="14" y="4" width="3" height="18" fill="#a16207" />
      {/* Metal bands */}
      <rect x="2" y="7" width="16" height="2" fill="#334155" />
      <rect x="2" y="16" width="16" height="2" fill="#334155" />
      {/* Top rim */}
      <ellipse cx="10" cy="4" rx="7" ry="2" fill="#582f0e" />
      <ellipse cx="10" cy="4" rx="5" ry="1" fill="#381b06" />
    </svg>
  );
}

// 11. Pixel Crate (Ground Prop)
export function PixelCrate({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_1px_rgba(40,25,10,0.35)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="10" cy="18" rx="8" ry="2" fill="#2d1808" fillOpacity="0.4" />
      {/* Crate Box */}
      <rect x="2" y="3" width="16" height="15" fill="#a16207" stroke="#4a2810" strokeWidth="2" />
      {/* Cross bracing */}
      <line x1="4" y1="5" x2="16" y2="16" stroke="#4a2810" strokeWidth="1.5" />
      <line x1="16" y1="5" x2="4" y2="16" stroke="#4a2810" strokeWidth="1.5" />
      {/* Highlights */}
      <rect x="3" y="4" width="14" height="1" fill="#fde047" fillOpacity="0.4" />
    </svg>
  );
}

// 12. Pixel Flower Pot (Ground Prop)
export function PixelFlowerPot({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_1px_rgba(40,25,10,0.35)] select-none pointer-events-none ${className}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="10" cy="20" rx="6" ry="1.5" fill="#2d1808" fillOpacity="0.4" />
      {/* Terracotta pot */}
      <polygon points="5,11 15,11 13,19 7,19" fill="#c2410c" />
      <rect x="4" y="9" width="12" height="3" fill="#ea580c" />
      {/* Flower foliage */}
      <circle cx="10" cy="6" r="4" fill="#15803d" />
      <circle cx="8" cy="4" r="2.5" fill="#e11d48" />
      <circle cx="12" cy="5" r="2" fill="#fbbf24" />
    </svg>
  );
}
