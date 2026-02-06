import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1️⃣ Calculate earnings
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      seats,
      trip:trips (
        prix_par_place
      )
    `
    )
    .eq("driver_id", user.id)
    .eq("status", "completed");

  if (error) {
    return NextResponse.json(
      { error: "Failed to calculate earnings" },
      { status: 500 }
    );
  }

  const balance =
    data?.reduce((sum, b: any) => {
      return sum + b.seats * b.trip.prix_par_place;
    }, 0) ?? 0;

  // 2️⃣ Upsert wallet
  await supabase.from("wallets").upsert({
    user_id: user.id,
    balance,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ balance });
}
