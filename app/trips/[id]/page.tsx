import { supabase } from "@/lib/supabase";
import TripClient from "./TripClient";

/* =========================================================
   REQUIRED for static export
========================================================= */
export async function generateStaticParams() {
  const { data, error } = await supabase
    .from("trips")
    .select("id");

  if (error || !data) {
    return [];
  }

  return data.map((trip) => ({
    id: trip.id,
  }));
}

/* =========================================================
   Server wrapper (STATIC)
========================================================= */
export default function TripPage({
  params,
}: {
  params: { id: string };
}) {
  return <TripClient id={params.id} />;
}
