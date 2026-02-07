"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTrips } from "@/components/trip-context";

/**
 * Enforces:
 * - No UI until auth is resolved
 * - First load ALWAYS goes to /signup if unauthenticated
 * - Works on web + mobile (Capacitor)
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, authLoading } = useTrips();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;

    // Public routes allowed without auth
    const publicRoutes = ["/login", "/signup"];

    if (!currentUser && !publicRoutes.includes(pathname)) {
      router.replace("/signup");
    }

    if (currentUser && publicRoutes.includes(pathname)) {
      router.replace("/");
    }
  }, [authLoading, currentUser, pathname, router]);

  // Block render until auth is fully known
  if (authLoading) return null;

  return <>{children}</>;
}
