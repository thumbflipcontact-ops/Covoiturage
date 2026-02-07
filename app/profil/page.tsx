"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainNavbar } from "@/components/MainNavbar";
import { supabase } from "@/lib/supabase";

export default function ProfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  /* =====================
     Load user
  ====================== */
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
      setFullName(
        (user.user_metadata?.full_name as string) ?? ""
      );
      setBio((user.user_metadata?.bio as string) ?? "");

      setLoading(false);
    };

    loadUser();
  }, [router]);

  /* =====================
     Save profile
  ====================== */
  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        bio,
      },
    });

    if (error) {
      setMessage("Erreur lors de la mise à jour du profil");
      setSaving(false);
      return;
    }

    setMessage("Profil mis à jour avec succès");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <MainNavbar/>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Page title */}
        <h1 className="text-3xl font-semibold text-slate-900">
          Mon Profil
        </h1>

        {/* Top profile tabs */}
        <div className="mt-6 flex flex-wrap gap-2 rounded-full bg-white p-1 shadow-sm text-sm font-medium text-slate-600">
          {[
            "Profil",
            "Badges",
            "Véhicules",
            "Photos",
            "Historique",
            "Avis",
            "Notifications",
          ].map((tab, index) => {
            const isActive = index === 0;
            return (
              <button
                key={tab}
                className={[
                  "flex-1 rounded-full px-4 py-2",
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "hover:bg-slate-50",
                ].join(" ")}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Public profile card */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Profil public
          </h2>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-violet-100 text-3xl font-semibold text-violet-700">
                {fullName ? fullName.charAt(0).toUpperCase() : "U"}
              </div>
            </div>

            {/* Photo + stats (placeholder) */}
            <div className="flex-1 space-y-4">
              <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">📷</span>
                  <span>Photo de profil</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-50 py-4 text-center text-xs text-slate-600">
                  <span className="mb-1 text-base font-semibold text-slate-700">
                    -
                  </span>
                  <span className="font-semibold">Note moyenne</span>
                  <span>0 avis</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-50 py-4 text-center text-xs text-slate-600">
                  <span className="mb-1 text-base font-semibold text-violet-700">
                    0
                  </span>
                  <span className="font-semibold">
                    Trajets effectués
                  </span>
                  <span>0 conducteur · 0 passager</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Informations personnelles */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Informations personnelles
          </h2>

          <div className="mt-4 space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Email
              </label>
              <input
                value={email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Nom complet
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                placeholder="Nom complet"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Biographie
              </label>
              <textarea
                rows={4}
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                placeholder="Parlez un peu de vous..."
              />
              <p className="mt-1 text-right text-[11px] text-slate-400">
                {bio.length}/300
              </p>
            </div>

            {message && (
              <p className="text-sm text-emerald-600">
                {message}
              </p>
            )}

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-4 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
