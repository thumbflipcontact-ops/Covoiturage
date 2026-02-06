"use client";

console.log("APP PAGE VERSION: NEW FORM WITH LABELS");

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainNavbar } from "@/components/MainNavbar";
import { useTrips } from "@/components/trip-context";

export default function HomePage() {
  const router = useRouter();
  const { trips, currentUser, addTrip } = useTrips();

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [form, setForm] = useState({
    depart: "",
    arrivee: "",
    villeIntermediaire: "",
    date: "",
    heure: "",
    typeVehicule: "",
    prixParPlace: "",
    placesDisponibles: "",
  });

  return (
    <div className="min-h-screen flex flex-col bg-primary-gradient text-white">
      <MainNavbar active="accueil" />

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto flex max-w-5xl flex-col items-center px-4 py-10 text-center">
          <span className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium">
            🚗 CovoiCam
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">CovoiCam</h1>
          <p className="mt-3 text-lg text-white/90">
            La plateforme de covoiturage n°1 au Cameroun
          </p>
        </section>

        {/* TRIPS */}
        <section className="bg-white text-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById("trips-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-violet-600 shadow ring-1 ring-violet-200"
              >
                Voir les trajets
              </button>

              {currentUser && (
                <button
                  onClick={() => setIsPublishOpen(true)}
                  className="rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700"
                >
                  + Publier un trajet
                </button>
              )}
            </div>

            <div
              id="trips-section"
              className="rounded-3xl bg-slate-50 px-6 py-6"
            >
              <h2 className="text-lg font-semibold">Trajets disponibles</h2>

              {trips.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
                  <div className="mb-4 text-4xl text-slate-300">🚗</div>
                  <p className="text-sm font-semibold">
                    Aucune annonce disponible
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {trip.depart} → {trip.arrivee}
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

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-violet-600">
                            {trip.prixParPlace.toLocaleString("fr-FR")} FCFA
                          </p>
                          <p className="text-xs text-slate-500">
                            {trip.placesDisponibles} place
                            {trip.placesDisponibles > 1 ? "s" : ""} restantes
                          </p>
                        </div>

                        <button
                          onClick={() => router.push(`/trips/${trip.id}`)}
                          className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          Voir détails
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* PUBLISH MODAL */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
            <h2 className="text-xl font-semibold mb-6">
              Publier un trajet
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Ville de départ"
                className="rounded-xl border px-4 py-2"
                value={form.depart}
                onChange={(e) =>
                  setForm({ ...form, depart: e.target.value })
                }
              />

              <input
                placeholder="Ville d'arrivée"
                className="rounded-xl border px-4 py-2"
                value={form.arrivee}
                onChange={(e) =>
                  setForm({ ...form, arrivee: e.target.value })
                }
              />

              <input
                placeholder="Ville intermédiaire (optionnel)"
                className="rounded-xl border px-4 py-2 sm:col-span-2"
                value={form.villeIntermediaire}
                onChange={(e) =>
                  setForm({ ...form, villeIntermediaire: e.target.value })
                }
              />

              <input
                type="date"
                className="rounded-xl border px-4 py-2"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <input
                type="time"
                className="rounded-xl border px-4 py-2"
                value={form.heure}
                onChange={(e) =>
                  setForm({ ...form, heure: e.target.value })
                }
              />

              <input
                placeholder="Type de véhicule"
                className="rounded-xl border px-4 py-2"
                value={form.typeVehicule}
                onChange={(e) =>
                  setForm({ ...form, typeVehicule: e.target.value })
                }
              />

              <input
                type="number"
                min={1}
                placeholder="Prix par place (FCFA)"
                className="rounded-xl border px-4 py-2"
                value={form.prixParPlace}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prixParPlace: Number(e.target.value),
                  })
                }
              />

              <input
                type="number"
                min={1}
                placeholder="Nombre de places disponibles"
                className="rounded-xl border px-4 py-2"
                value={form.placesDisponibles}
                onChange={(e) =>
                  setForm({
                    ...form,
                    placesDisponibles: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsPublishOpen(false)}
                className="rounded-xl px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Annuler
              </button>

              <button
                onClick={async () => {
                  await addTrip({
                    ...form,
                    totalSeats: form.placesDisponibles,
                  });
                  setIsPublishOpen(false);
                }}
                className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Publier le trajet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
