import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-5xl font-extrabold mb-4">AntoniusCore</h1>
      <p className="text-xl text-gray-400 mb-10 max-w-lg">
        Welkom in onze publieke winkel. Ontdek de nieuwste producten en innovaties.
      </p>
      
      {session ? (
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="mb-4 text-green-400">Ingelogd als zakelijke partner</p>
          <a href="/dashboard" className="inline-block bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
            Open B2B Portaal
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 border-t border-gray-800 pt-8 mt-4">
          <p className="text-sm text-gray-500">Ben je een zakelijke partner?</p>
          <a href="/api/auth/signin" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Zakelijk Inloggen
          </a>
        </div>
      )}
    </div>
  );
}