import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Fetch booking
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Booking already paid or confirmed" },
        { status: 409 }
      );
    }

    // Mock payment code
    const confirmationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "paid",
        confirmation_code: confirmationCode,
        paid_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: "Payment update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      confirmationCode,
    });
  } catch (err) {
    console.error("Payment initiate error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
