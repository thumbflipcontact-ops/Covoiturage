"use client";

import { ReactNode } from "react";
import { TripProvider } from "./trip-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return <TripProvider>{children}</TripProvider>;
}

