"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MainNavbar } from "@/components/MainNavbar";

type Booking = {
  id: string;
  passenger_id: string;
  driver_id: string;
  trip: {
    depart: string;
    arrivee: string;
  };
};

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hasBooking, setHasBooking] = useState(false);

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
        .from("bookings")
        .select(
          `
          id,
          passenger_id,
          driver_id,
          trip:trips (
            depart,
            arrivee
          )
        `
        )
        .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`);

      if (!error && data && data.length > 0) {
        // ✅ NORMALIZE Supabase response (trip is an array)
        const normalized: Booking[] = data
          .filter((row) => row.trip && row.trip.length > 0)
          .map((row) => ({
            id: row.id,
            passenger_id: row.passenger_id,
            driver_id: row.driver_id,
            trip: row.trip[0],
          }));

        setBookings(normalized);
        setHasBooking(true);
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
      <MainNavbar/>

      <main className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        {!hasBooking ? (
          /* 🔒 Locked state */
          <section className="flex flex-1 items-center justify-center rounded-3xl bg-white p-8 shadow-sm">
            <div className="text-center text-slate-600">
              <div className="mb-4 text-4xl">🔒</div>
              <p className="text-sm font-semibold">
                La messagerie est disponible uniquement après une réservation
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Réservez un trajet pour discuter avec le conducteur ou le
                passager.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-5 rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Voir les trajets
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Conversations list */}
            <section className="flex w-full max-w-xs flex-col rounded-3xl bg-white p-4 shadow-sm">
              <h1 className="px-1 text-base font-semibold text-slate-900">
                Messages
              </h1>

              <div className="mt-4">
                <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  <span>🔍</span>
                  <input
                    className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                    placeholder="Rechercher..."
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {b.trip.depart} → {b.trip.arrivee}
                  </div>
                ))}
              </div>
            </section>

            {/* Conversation detail placeholder */}
            <section className="flex flex-1 items-center justify-center rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-slate-400">
                <div className="mb-3 text-4xl">💬</div>
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
