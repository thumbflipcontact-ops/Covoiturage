import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { bookingId, action, driverId } = await req.json();

    if (!bookingId || !driverId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Requête invalide" },
        { status: 400 }
      );
    }

    /* =====================
       1️⃣ Load booking
    ====================== */
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, status, driver_id, passenger_id")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 }
      );
    }

    /* =====================
       2️⃣ Security checks
    ====================== */
    if (booking.driver_id !== driverId) {
      return NextResponse.json(
        { error: "Action non autorisée" },
        { status: 403 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Cette réservation a déjà été traitée" },
        { status: 409 }
      );
    }

    /* =====================
       3️⃣ Apply decision (✅ DB-safe)
    ====================== */
    const newStatus =
      action === "accept" ? "confirmed" : "cancelled";

    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "Échec de la mise à jour" },
        { status: 500 }
      );
    }

    /* =====================
       4️⃣ Notify passenger
    ====================== */
    await supabaseAdmin.from("notifications").insert({
      user_id: booking.passenger_id,
      booking_id: booking.id,
      type:
        action === "accept"
          ? "booking_confirmed"
          : "booking_cancelled",
      title:
        action === "accept"
          ? "Réservation acceptée"
          : "Réservation refusée",
      message:
        action === "accept"
          ? "Le conducteur a accepté votre demande. Vous pouvez procéder au paiement."
          : "Le conducteur a refusé votre demande de réservation.",
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Decision API error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
