import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession();

  // Beveiliging: stuur bezoeker weg als deze niet is ingelogd
  if (!session) {
    redirect("/");
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">B2B Dashboard</h1>
      <p className="text-gray-400 mb-8">Welkom terug, {session.user?.name}. Hier beheer je jouw zakelijke portaal.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Mijn Bestellingen</h2>
          <p className="text-gray-500">Hier komt het overzicht van actieve B2B deals.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Samenwerkingen</h2>
          <p className="text-gray-500">Gedeelde documenten en contracten.</p>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-800 pt-6">
        <a href="/api/auth/signout" className="text-red-500 hover:text-red-400 text-sm font-medium">
          Uitloggen
        </a>
      </div>
    </div>
  );
}