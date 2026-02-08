"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { MainNavbar } from "@/components/MainNavbar";
import { supabase } from "@/lib/supabase";
import { useTrips } from "@/components/trip-context";
import { useEffect, useState } from "react";

/* =====================
   Types
===================== */
type Trip = {
  id: string;
  depart: string;
  arrivee: string;
  ville_intermediaire?: string | null;
  date: string;
  heure: string;
  type_vehicule: string;
  prix_par_place: number;
  total_seats: number;
  places_disponibles: number;
};

/* =====================
   Error translation
===================== */
function translateBookingError(msg: string) {
  if (!msg) return "Une erreur est survenue lors de la réservation";
  if (msg.includes("active booking request"))
    return "Vous avez déjà une demande en cours avec ce conducteur";
  if (msg.includes("not enough seats"))
    return "Il n’y a plus assez de places disponibles";
  if (msg.includes("own trip"))
    return "Vous ne pouvez pas réserver votre propre trajet";
  if (msg.includes("Not authenticated"))
    return "Vous devez être connecté pour réserver";
  return "Impossible d’effectuer la réservation pour le moment";
}

export default function TripClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get("id");

  const { currentUser } = useTrips();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================
     Fetch trip (STATIC SAFE)
  ===================== */
  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    const loadTrip = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (error || !data) {
        setTrip(null);
      } else {
        setTrip(data);
      }

      setLoading(false);
    };

    loadTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Chargement du trajet…</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Trajet introuvable</p>
      </div>
    );
  }

  /* =====================
     Booking
  ===================== */
  const handleBooking = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          seats: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(translateBookingError(data.error));
        setBookingLoading(false);
        return;
      }

      router.push("/bookings");
    } catch {
      setError("Impossible de contacter le serveur");
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            {trip.depart} → {trip.arrivee}
          </h1>

          {trip.ville_intermediaire && (
            <p className="mt-1 text-sm text-slate-500">
              Via {trip.ville_intermediaire}
            </p>
          )}

          <p className="mt-2 text-sm text-slate-500">
            {trip.date} • {trip.heure} • {trip.type_vehicule}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Prix par place</p>
              <p className="text-lg font-semibold text-violet-600">
                {trip.prix_par_place.toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Places disponibles</p>
              <p className="text-lg font-semibold">
                {trip.places_disponibles} / {trip.total_seats}
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleBooking}
              disabled={bookingLoading || trip.places_disponibles === 0}
              className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {trip.places_disponibles === 0
                ? "Complet"
                : bookingLoading
                ? "Réservation…"
                : "Réserver ce trajet"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
