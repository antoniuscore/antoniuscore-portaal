import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-6">
        <span>🎪</span> Nieuw: B2B2C Marktplein met Interactieve Kraampjes & Bundels
      </div>

      <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-tight">
        Antonius<span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Core</span>
      </h1>
      <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
        Het innovatieve platform waar consumenten en bedrijven elkaar vinden via interactieve marktpleinkraampjes en sector-overstijgende samenwerkingsbundels.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-sm transition shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2"
        >
          <span>🎪</span> Naar het Marktplein (Kraampjes)
        </Link>

        {session ? (
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <span>🏢</span> Open B2B Dashboard
          </Link>
        ) : (
          <Link
            href="/api/auth/signin"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <span>🔐</span> Zakelijk Partner Inloggen
          </Link>
        )}
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl text-left border-t border-slate-800/80 pt-10">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xl mb-2 block">🎪</span>
          <h2 className="font-bold text-white text-sm mb-1">Kraampjes & Top 5</h2>
          <p className="text-xs text-slate-400">
            Elke partner heeft een herkenbaar kraampje met hun 5 beste producten en diensten.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xl mb-2 block">🤝</span>
          <h2 className="font-bold text-white text-sm mb-1">Samenwerkingsbundels</h2>
          <p className="text-xs text-slate-400">
            Bedrijven bundelen elkaars krachten in unieke cross-sector deals voor klanten.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <span className="text-xl mb-2 block">⚙️</span>
          <h2 className="font-bold text-white text-sm mb-1">B2B Partner Beheer</h2>
          <p className="text-xs text-slate-400">
            Beheer jouw sectoren, partners en productetalage via het B2B dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}