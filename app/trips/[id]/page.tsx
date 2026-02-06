import { supabase } from "@/lib/supabase";
import TripClient from "./TripClient";

/* =========================================================
   REQUIRED for output: "export"
========================================================= */
export async function generateStaticParams() {
  const { data } = await supabase.from("trips").select("id");

  if (!data) return [];

  return data.map((trip) => ({
    id: trip.id,
  }));
}

export default function TripPage({
  params,
}: {
  params: { id: string };
}) {
  return <TripClient id={params.id} />;
}
