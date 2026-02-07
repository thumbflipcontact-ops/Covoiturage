"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainNavbar } from "@/components/MainNavbar";
import { supabase } from "@/lib/supabase";
import { useTrips } from "@/components/trip-context";

/* =====================
   Types
===================== */

type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "paid"
  | "completed"
  | "accepted"
  | "rejected";

type TripRow = {
  depart: string;
  arrivee: string;
  date: string;
  heure: string;
  prix_par_place: number;
};

type Booking = {
  id: string;
  status: BookingStatus;
  seats: number;
  created_at: string;
  passenger_id: string;
  driver_id: string;
  trip: TripRow[]; // ✅ Supabase returns an ARRAY
};

export default function BookingsPage() {
  const router = useRouter();
  const { currentUser } = useTrips();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<"passenger" | "driver">("passenger");
  const [loading, setLoading] = useState(true);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  /* =====================
     Load bookings
  ====================== */
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const loadBookings = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("bookings")
        .select(
          `
          id,
          status,
          seats,
          created_at,
          passenger_id,
          driver_id,
          trip:trips (
            depart,
            arrivee,
            date,
            heure,
            prix_par_place
          )
        `
        )
        .eq(
          view === "passenger" ? "passenger_id" : "driver_id",
          currentUser.id
        )
        .order("created_at", { ascending: false });

      setBookings((data ?? []) as Booking[]);
      setLoading(false);
    };

    loadBookings();
  }, [currentUser, view, router]);

  /* =====================
     DRIVER: accept / reject
  ====================== */
  const decideBooking = async (
    bookingId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const res = await fetch("/api/bookings/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          action,
          driverId: currentUser!.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Action échouée");
        return;
      }

      location.reload();
    } catch {
      alert("Impossible de contacter le serveur");
    }
  };

  /* =====================
     PASSENGER: pay
  ====================== */
  const initiatePayment = async (bookingId: string) => {
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Paiement échoué");
        return;
      }

      alert(`Paiement réussi.\nCode : ${data.confirmationCode}`);
      location.reload();
    } catch {
      alert("Impossible de contacter le serveur");
    }
  };

  /* =====================
     DRIVER: confirm trip
  ====================== */
  const confirmTrip = async (bookingId: string) => {
    const code = codeInputs[bookingId];
    if (!code) {
      alert("Veuillez entrer le code de confirmation");
      return;
    }

    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          code,
          driverId: currentUser!.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Confirmation échouée");
        return;
      }

      alert("Trajet confirmé avec succès");
      location.reload();
    } catch {
      alert("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar/>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Réservations
        </h1>

        {/* Tabs */}
        <div className="mt-6 flex w-fit rounded-full bg-white p-1 shadow-sm">
          <button
            onClick={() => setView("passenger")}
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              view === "passenger"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Mes réservations
          </button>
          <button
            onClick={() => setView("driver")}
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              view === "driver"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Réservations reçues
          </button>
        </div>

        {/* Content */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement…</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune réservation</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const trip = b.trip[0]; // ✅ SAFE

                if (!trip) return null;

                return (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row"
                  >
                    <div>
                      <p className="font-semibold">
                        {trip.depart} → {trip.arrivee}
                      </p>
                      <p className="text-xs text-slate-500">
                        {trip.date} • {trip.heure}
                      </p>
                      <p className="text-xs text-slate-500">
                        {b.seats} place •{" "}
                        {trip.prix_par_place.toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                        {b.status}
                      </span>

                      {view === "driver" && b.status === "pending" && (
                        <div className="mt-2 flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              decideBooking(b.id, "accept")
                            }
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() =>
                              decideBooking(b.id, "reject")
                            }
                            className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                          >
                            Refuser
                          </button>
                        </div>
                      )}

                      {view === "passenger" &&
                        b.status === "confirmed" && (
                          <button
                            onClick={() => initiatePayment(b.id)}
                            className="mt-2 rounded bg-violet-600 px-3 py-1 text-xs font-semibold text-white"
                          >
                            Payer
                          </button>
                        )}

                      {view === "driver" && b.status === "paid" && (
                        <div className="mt-2 flex gap-2 justify-end">
                          <input
                            className="w-24 rounded border px-2 py-1 text-xs"
                            placeholder="Code"
                            value={codeInputs[b.id] ?? ""}
                            onChange={(e) =>
                              setCodeInputs({
                                ...codeInputs,
                                [b.id]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => confirmTrip(b.id)}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                          >
                            Confirmer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
