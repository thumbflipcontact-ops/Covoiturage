"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type NavKey =
  | "accueil"
  | "mes-trajets"
  | "favoris"
  | "gains"
  | "messages"
  | "profil"
  | "contact"
  | "classement"
  | "notifications";

const navItems: { key: NavKey; label: string; href: string }[] = [
  { key: "accueil", label: "Accueil", href: "/" },
  { key: "mes-trajets", label: "Mes trajets", href: "/mes-trajets" },
  { key: "favoris", label: "Favoris", href: "/favoris" },
  { key: "gains", label: "$ Gains", href: "/gains" },
  { key: "messages", label: "Messages", href: "/messages" },
  { key: "profil", label: "Profil", href: "/profil" },
  { key: "contact", label: "Contact", href: "/contact" },
  { key: "classement", label: "Classement", href: "/classement" },
];

export function MainNavbar({ active }: { active: NavKey }) {
  const router = useRouter();

  const [initial, setInitial] = useState("?");
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  /* =====================
     Load user + notifications
  ====================== */
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setInitial(user.email?.charAt(0).toUpperCase() || "U");

      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("driver_id", user.id)
        .eq("status", "pending");

      setNotifCount(count ?? 0);
      setLoading(false);
    };

    load();
  }, []);

  /* =====================
     Close menu on outside click
  ====================== */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return null;

  return (
    <header className="bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md">
            🚗
          </div>
          <span className="text-xl font-semibold md:text-slate-900">
            CovoiCam
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden sm:flex gap-1 rounded-full bg-white p-1 text-sm shadow">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`rounded-full px-4 py-2 ${
                active === item.key
                  ? "bg-violet-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* 🔔 Notifications */}
          <button
            onClick={() => router.push("/bookings")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
            title="Réservations reçues"
          >
            🔔
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                {notifCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white font-semibold"
            >
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl bg-white p-2 shadow-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profil");
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                >
                  Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
