"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

/* =======================
   Types
======================= */

export type TripStatus = "actif" | "termine" | "annule";

export type Trip = {
  id: string;
  ownerId: string;
  depart: string;
  arrivee: string;
  villeIntermediaire?: string | null;
  date: string;
  heure: string;
  typeVehicule: string;
  prixParPlace: number;
  totalSeats: number;
  placesDisponibles: number;
  status: TripStatus;
};

export type User = {
  id: string;
  email: string;
};

type AppContextValue = {
  currentUser?: User;
  trips: Trip[];
  signup: (email: string, password: string) => Promise<string | void>;
  login: (email: string, password: string) => Promise<string | void>;
  logout: () => Promise<void>;
  addTrip: (
    trip: Omit<Trip, "id" | "ownerId" | "status">
  ) => Promise<void>;
};

const TripContext = createContext<AppContextValue | undefined>(undefined);

/* =======================
   Provider
======================= */

export function TripProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  /* -----------------------
     Auth session
  ------------------------ */

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
        });
      }

      await loadTrips();
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
        });
      } else {
        setCurrentUser(undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* -----------------------
     Load trips
  ------------------------ */

  const loadTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load trips", error);
      return;
    }

    setTrips(
      (data ?? []).map((t) => ({
        id: t.id,
        ownerId: t.driver_id,
        depart: t.depart,
        arrivee: t.arrivee,
        villeIntermediaire: t.ville_intermediaire,
        date: t.date,
        heure: t.heure,
        typeVehicule: t.type_vehicule,
        prixParPlace: t.prix_par_place,
        totalSeats: t.total_seats,
        placesDisponibles: t.places_disponibles,
        status: t.status,
      }))
    );
  };

  /* -----------------------
     Auth actions
  ------------------------ */

  const signup: AppContextValue["signup"] = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
  };

  const login: AppContextValue["login"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return error.message;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(undefined);
  };

  /* -----------------------
     Add trip (FIXED)
  ------------------------ */

  const addTrip: AppContextValue["addTrip"] = async (trip) => {
    if (!currentUser) return;

    const { error } = await supabase.from("trips").insert({
      driver_id: currentUser.id, // 🔑 must exist in auth.users
      depart: trip.depart,
      arrivee: trip.arrivee,
      ville_intermediaire: trip.villeIntermediaire ?? null,
      date: trip.date,
      heure: trip.heure,
      type_vehicule: trip.typeVehicule,
      prix_par_place: trip.prixParPlace,
      total_seats: trip.totalSeats,
      places_disponibles: trip.placesDisponibles,
      status: "actif",
    });

    if (error) {
      console.error("Add trip failed", error);
      throw error;
    }

    await loadTrips();
  };

  const value: AppContextValue = {
    currentUser,
    trips,
    signup,
    login,
    logout,
    addTrip,
  };

  if (loading) return null;

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}

/* =======================
   Hook
======================= */

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error("useTrips must be used within TripProvider");
  }
  return ctx;
}
