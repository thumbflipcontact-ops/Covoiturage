import { Suspense } from "react";
import TripClient from "@/components/TripClient";

export default function TripPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Chargement du trajet…</p>
        </div>
      }
    >
      <TripClient />
    </Suspense>
  );
}
