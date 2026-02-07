"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TripProvider, useTrips } from "./trip-context";

/* =================================================
   Internal gate component
================================================= */
function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useTrips();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Public routes
    const publicRoutes = ["/login", "/signup"];

    if (!currentUser && !publicRoutes.includes(pathname)) {
      router.replace("/signup");
      return;
    }

    setChecked(true);
  }, [currentUser, pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    );
  }

  return <>{children}</>;
}

/* =================================================
   AppProviders
================================================= */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TripProvider>
      <AuthGate>{children}</AuthGate>
    </TripProvider>
  );
}
