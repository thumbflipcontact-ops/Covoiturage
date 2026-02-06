import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: Request) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { error } = await supabase.from("trips").insert({
    driver_id: user.id,
    from_city: body.from_city,
    to_city: body.to_city,
    date: body.date,
    time: body.time,
    price: body.price,
    total_seats: body.total_seats,
    available_seats: body.total_seats,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
