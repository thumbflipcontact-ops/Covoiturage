import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { bookingId, code, driverId } = await req.json();

    if (!bookingId || !code || !driverId) {
      return NextResponse.json(
        { error: "Missing bookingId, code, or driverId" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch booking
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id, status, confirmation_code, driver_id")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Ensure correct driver
    if (booking.driver_id !== driverId) {
      return NextResponse.json(
        { error: "Not authorized to confirm this booking" },
        { status: 403 }
      );
    }

    // 3️⃣ Validate booking state
    if (booking.status !== "paid") {
      return NextResponse.json(
        { error: "Booking is not awaiting confirmation" },
        { status: 409 }
      );
    }

    // 4️⃣ Validate confirmation code
    if (booking.confirmation_code !== code) {
      return NextResponse.json(
        { error: "Invalid confirmation code" },
        { status: 400 }
      );
    }

    // 5️⃣ Confirm booking
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: "Confirmation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment confirm error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
