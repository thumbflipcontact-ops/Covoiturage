import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // cookies() is async in Next 15+
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { tripId, seats = 1 } = await req.json();

    if (!tripId || seats < 1) {
      return NextResponse.json(
        { error: "Invalid booking request" },
        { status: 400 }
      );
    }

    // Atomic booking (auth.uid() resolved in Postgres)
    const { error } = await supabase.rpc("book_trip", {
      p_trip_id: tripId,
      p_seats: seats,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
