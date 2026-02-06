"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainNavbar } from "@/components/MainNavbar";
import { supabase } from "@/lib/supabase";
import { useTrips } from "@/components/trip-context";

type Booking = {
  id: string;
  seats: number;
  created_at: string;
  trip: {
    depart: string;
    arrivee: string;
    date: string;
    heure: string;
    prix_par_place: number;
  };
};

function formatFcfa(amount: number) {
  return amount.toLocaleString("fr-FR") + " FCFA";
}

export default function GainsPage() {
  const router = useRouter();
  const { currentUser } = useTrips();

  const [balance, setBalance] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const load = async () => {
      /* =====================
         1️⃣ Sync wallet
      ====================== */
      const walletRes = await fetch("/api/wallet/sync", {
        method: "POST",
      });

      if (walletRes.ok) {
        const wallet = await walletRes.json();
        setBalance(wallet.balance);
      }

      /* =====================
         2️⃣ Load completed bookings
      ====================== */
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          seats,
          created_at,
          trip:trips (
            depart,
            arrivee,
            date,
            heure,
            prix_par_place
          )
        `
        )
        .eq("driver_id", currentUser.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // ✅ NORMALIZE Supabase response (trip is an array)
        const normalized: Booking[] = data
          .filter((row) => row.trip && row.trip.length > 0)
          .map((row) => ({
            id: row.id,
            seats: row.seats,
            created_at: row.created_at,
            trip: row.trip[0],
          }));

        setBookings(normalized);
      }

      setLoading(false);
    };

    load();
  }, [currentUser, router]);

  const totalTransactions = bookings.length;

  /* =====================
     Monthly gains
  ====================== */
  const now = new Date();
  const monthGains = bookings.reduce((sum, b) => {
    const d = new Date(b.created_at);
    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      return sum + b.seats * b.trip.prix_par_place;
    }
    return sum;
  }, 0);

  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <MainNavbar active="gains" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
            $
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Mes gains
            </h1>
            <p className="text-sm text-slate-500">
              Revenus issus des trajets complétés
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Solde disponible
            </p>
            <p className="mt-3 text-2xl font-semibold text-emerald-600">
              {formatFcfa(balance)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {totalTransactions} transaction
              {totalTransactions !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-3xl bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Ce mois
            </p>
            <p className="mt-3 text-2xl font-semibold text-violet-600">
              {formatFcfa(monthGains)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{monthLabel}</p>
          </div>

          <div className="rounded-3xl bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Retrait
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Orange Money & MTN bientôt disponibles
            </p>
            <button
              disabled
              className="mt-4 rounded-full bg-slate-300 px-4 py-2 text-xs font-semibold text-white"
            >
              Retrait bientôt disponible
            </button>
          </div>
        </section>

        {/* History */}
        <section className="mt-8 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Historique des gains
          </h2>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">Chargement…</p>
          ) : bookings.length === 0 ? (
            <div className="mt-10 flex flex-col items-center text-center">
              <div className="mb-4 text-5xl text-slate-300">$</div>
              <p className="text-sm font-medium text-slate-700">
                Aucun gain pour le moment
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Les gains apparaissent après confirmation du trajet
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {b.trip.depart} → {b.trip.arrivee}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {b.trip.date} • {b.trip.heure}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      + {formatFcfa(b.seats * b.trip.prix_par_place)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.seats} place{b.seats > 1 ? "s" : ""} vendue
                      {b.seats > 1 ? "s" : ""}
                    </p>
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
