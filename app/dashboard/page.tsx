import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  // Get user's company info if available
  const user = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          company: {
            include: {
              products: true,
              bundles: true,
            },
          },
        },
      })
    : null;

  const company = user?.company;
  const top5Count = company?.products.filter((p) => p.isTop5).length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <span>🏢</span> Zakelijk Partner Portaal
          </div>
          <h1 className="text-3xl font-extrabold text-white">B2B Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welkom terug, <span className="text-white font-semibold">{session.user?.name}</span> ({session.user?.email}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-2"
          >
            <span>🎪</span> 2D Marktplein
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-2"
          >
            <span>📍</span> Profiel & Capaciteit
          </Link>
          <Link
            href="/dashboard/settings"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-900/30 flex items-center gap-2"
          >
            <span>⚙️</span> Sector & Producten
          </Link>
        </div>
      </div>

      {/* Grid of Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Card 1: Mijn Kraam op Marktplein */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🎪</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live op Marktplein
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Mijn Kraampje</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {company
                ? `${company.name} • ${top5Count} van de 5 Top Producten geselecteerd voor de etalage.`
                : "Configureer je bedrijfspagina, sector en Top 5 producten."}
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
          >
            <span>Beheer kraampje & producten</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 2: Samenwerkingen & Bundels */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🤝</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                Cross-Sector
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Partner Bundels</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ontdek hoe partners in jouw en aangrenzende sectoren samen complete pakketten samenstellen voor B2B en B2C klanten.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
          >
            <span>Verken alle bundels op de shop</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 3: Sector & Matches */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🎯</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Samenwerkingsmatch
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Open Sectoren</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Geef aan in welke sectoren jouw bedrijf actief is en welke partners contact met jou mogen opnemen voor bundeloffertes.
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
          >
            <span>Selecteer jouw partnersectoren</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Footer / Sign out */}
      <div className="mt-12 border-t border-slate-800 pt-6 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          AntoniusCore • Veilig zakelijk B2B2C portaal
        </span>
        <a
          href="/api/auth/signout"
          className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition"
        >
          Uitloggen
        </a>
      </div>
    </div>
  );
}