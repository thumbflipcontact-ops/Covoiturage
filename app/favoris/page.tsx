"use client";

import { useTrips } from "@/components/trip-context";
import { MainNavbar } from "@/components/MainNavbar";

export default function FavorisPage() {
  const { currentUser } = useTrips();

  // ✅ Favorites feature not implemented yet (no DB support)
  const favorites: never[] = [];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* ✅ NO props */}
      <MainNavbar />

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
            ♥
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Mes favoris
            </h1>
            <p className="text-sm text-slate-500">
              Retrouvez vos trajets sauvegardés
            </p>
          </div>
        </div>

        {/* Content */}
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-5xl text-slate-300">♡</div>
              <p className="text-base font-semibold text-slate-800">
                Aucun favori
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Vous n&apos;avez pas encore ajouté de trajets favoris.
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
