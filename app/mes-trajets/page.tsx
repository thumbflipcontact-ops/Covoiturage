"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MainNavbar } from "@/components/MainNavbar";

type TopTab = "trajets" | "reservations";

type Trip = {
  id: string;
  depart: string;
  arrivee: string;
  date: string;
  heure: string;
  prix_par_place: number;
  places_disponibles: number;
  total_seats: number;
};

export default function MesTrajetsPage() {
  const router = useRouter();
  const [topTab, setTopTab] = useState<TopTab>("trajets");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const isTrajets = topTab === "trajets";

  // 🔐 Protect route + fetch driver trips
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("trips")
        .select(
          `
          id,
          depart,
          arrivee,
          date,
          heure,
          prix_par_place,
          places_disponibles,
          total_seats
        `
        )
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTrips(data as Trip[]);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar active="mes-trajets" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Mes trajets
        </h1>

        {/* Tabs */}
        <div className="mt-6 flex rounded-full bg-white p-1 shadow-sm">
          <button
            onClick={() => setTopTab("trajets")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${
              isTrajets
                ? "bg-violet-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Trajets publiés
          </button>

          <button
            onClick={() => setTopTab("reservations")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium ${
              !isTrajets
                ? "bg-violet-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Mes réservations
          </button>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          {isTrajets ? (
            trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <div className="mb-4 text-4xl text-slate-300">🚗</div>
                <p className="text-sm font-medium text-slate-700">
                  Vous n&apos;avez pas encore publié de trajet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold text-violet-600">
                        TRAJET PUBLIÉ
                      </p>
                      <p className="mt-1 font-semibold">
                        {trip.depart} → {trip.arrivee}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {trip.date} • {trip.heure}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-violet-600">
                        {trip.prix_par_place.toLocaleString("fr-FR")} FCFA
                      </p>
                      <p className="text-xs text-slate-500">
                        {trip.places_disponibles} / {trip.total_seats} places
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <div className="mb-4 text-4xl text-slate-300">📅</div>
              <p className="text-sm font-medium text-slate-700">
                Les réservations passager sont visibles dans l’onglet Réservations
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
