"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3">
      <div className="font-bold text-lg">CovoiCam</div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={() => router.push("/messages")}
          className="relative"
          title="Notifications"
        >
          🔔
        </button>

        {/* User */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center"
            >
              {user.email[0].toUpperCase()}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white shadow-lg border">
                <button
                  onClick={() => router.push("/profil")}
                  className="block w-full px-4 py-2 text-left hover:bg-slate-100"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
