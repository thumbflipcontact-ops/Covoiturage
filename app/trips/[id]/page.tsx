"use client";

import { useParams, useRouter } from "next/navigation";
import { useTrips } from "@/components/trip-context";
import { MainNavbar } from "@/components/MainNavbar";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

/* =====================
   Error translation
===================== */
function translateBookingError(msg: string) {
  if (!msg) return "Une erreur est survenue lors de la réservation";

  if (msg.includes("active booking request")) {
    return "Vous avez déjà une demande en cours avec ce conducteur";
  }

  if (msg.includes("not enough seats")) {
    return "Il n’y a plus assez de places disponibles";
  }

  if (msg.includes("own trip")) {
    return "Vous ne pouvez pas réserver votre propre trajet";
  }

  if (msg.includes("Not authenticated")) {
    return "Vous devez être connecté pour réserver";
  }

  return "Impossible d’effectuer la réservation pour le moment";
}

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trips, currentUser } = useTrips();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trip = trips.find((t) => t.id === id);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Trajet introuvable</p>
      </div>
    );
  }

  /* =====================
     Handle booking
  ====================== */
  const handleBooking = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setLoading(true);
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
        setLoading(false);
        return;
      }

      router.push("/bookings");
    } catch (err) {
      console.error(err);
      setError("Impossible de contacter le serveur");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar active="accueil" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Retour
        </button>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-slate-900">
            {trip.depart} → {trip.arrivee}
          </h1>

          {trip.villeIntermediaire && (
            <p className="mt-1 text-sm text-slate-500">
              Via {trip.villeIntermediaire}
            </p>
          )}

          <p className="mt-2 text-sm text-slate-500">
            {trip.date} • {trip.heure} • {trip.typeVehicule}
          </p>

          {/* Stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Prix par place</p>
              <p className="text-lg font-semibold text-violet-600">
                {trip.prixParPlace.toLocaleString("fr-FR")} FCFA
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Places disponibles</p>
              <p className="text-lg font-semibold">
                {trip.placesDisponibles} / {trip.totalSeats}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Action */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleBooking}
              disabled={loading || trip.placesDisponibles === 0}
              className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {trip.placesDisponibles === 0
                ? "Complet"
                : loading
                ? "Réservation…"
                : "Réserver ce trajet"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
