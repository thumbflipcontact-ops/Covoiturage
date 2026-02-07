"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTrips } from "@/components/trip-context";

/* =======================
   Nav config
======================= */

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon?: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: "accueil", label: "Accueil", href: "/", icon: "🏠" },
  { key: "mes-trajets", label: "Trajets", href: "/mes-trajets", icon: "🚗" },
  { key: "favoris", label: "Favoris", href: "/favoris", icon: "♥" },
  { key: "messages", label: "Messages", href: "/messages", icon: "💬" },
  { key: "profil", label: "Profil", href: "/profil", icon: "👤" },
];

/* =======================
   Component
======================= */

export function MainNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useTrips();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* -----------------------
     Outside click
  ------------------------ */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -----------------------
     Force auth-first UX
  ------------------------ */
  useEffect(() => {
    if (!currentUser && pathname !== "/login" && pathname !== "/signup") {
      router.replace("/signup");
    }
  }, [currentUser, pathname, router]);

  const initial = currentUser?.email?.charAt(0).toUpperCase() ?? "U";

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <header className="bg-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow">
              🚗
            </div>
            <span className="text-lg font-semibold">CovoiCam</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 rounded-full bg-white p-1 shadow text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full px-4 py-2 ${
                  isActive(item.href)
                    ? "bg-violet-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white font-semibold"
            >
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-30 mt-2 w-40 rounded-xl bg-white p-2 shadow-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profil");
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100"
                >
                  Profil
                </button>
                {currentUser && (
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      router.replace("/login");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"
                  >
                    Se déconnecter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-white py-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            className={`flex flex-col items-center text-xs ${
              isActive(item.href)
                ? "text-violet-600 font-semibold"
                : "text-slate-500"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
