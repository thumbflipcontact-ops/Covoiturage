"use client";

import { useTrips } from "@/components/trip-context";
import { MainNavbar } from "@/components/MainNavbar";

export default function FavorisPage() {
  const { trips, currentUser } = useTrips();
  const favorites = currentUser
    ? trips.filter((t) => t.favoriteUserIds.includes(currentUser.id))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <MainNavbar active="favoris" />
      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
            ♥
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Mes Favoris
            </h1>
            <p className="text-sm text-slate-500">
              Retrouvez vos trajets sauvegardés
            </p>
          </div>
        </div>

        {/* Card */}
        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 text-5xl text-slate-300">♡</div>
              <p className="text-base font-semibold text-slate-800">
                Aucun favori
              </p>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                Vous n&apos;avez pas encore ajouté de trajets favoris.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-700 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-violet-500">♥</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {trip.depart} &rarr; {trip.arrivee}
                      </p>
                      {trip.villeIntermediaire && (
                        <p className="text-xs text-slate-500">
                          Via {trip.villeIntermediaire}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {trip.date} • {trip.heure} • {trip.typeVehicule}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-violet-600">
                        {trip.prixParPlace.toLocaleString("fr-FR")} FCFA
                      </p>
                      <p className="text-xs text-slate-500">
                        {trip.placesDisponibles} place
                        {trip.placesDisponibles > 1 ? "s" : ""} restantes
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

