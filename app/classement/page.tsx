"use client";

import { useState } from "react";
import { MainNavbar } from "@/components/MainNavbar";

type Tab = "niveau" | "note" | "trajets";

export default function ClassementPage() {
  const [tab, setTab] = useState<Tab>("niveau");

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar active="classement" />

      <main className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* Title */}
        <header>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-violet-600 px-4 py-2 text-white">
            <span className="text-xl">🏆</span>
            <span className="text-xl font-semibold">Classement</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Les meilleurs conducteurs de CovoiCam
          </p>
        </header>

        {/* Stat cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon="📈" value="0" label="Conducteurs actifs" />
          <StatCard icon="⭐" value="-" label="Meilleure note" />
          <StatCard icon="🏅" value="0" label="Trajets record" />
        </section>

        {/* Tabs */}
        <section className="rounded-full bg-white p-1 text-sm font-medium text-slate-600 shadow-sm">
          <div className="grid grid-cols-3">
            <TabButton
              active={tab === "niveau"}
              onClick={() => setTab("niveau")}
              icon="🏅"
              label="Niveau"
            />
            <TabButton
              active={tab === "note"}
              onClick={() => setTab("note")}
              icon="⭐"
              label="Note"
            />
            <TabButton
              active={tab === "trajets"}
              onClick={() => setTab("trajets")}
              icon="🚗"
              label="Trajets"
            />
          </div>
        </section>

        {/* Ranking list */}
        <section className="rounded-3xl bg-white px-6 py-6 shadow-sm">
          {tab === "niveau" && (
            <RankingPlaceholder
              title="Top 10 – Niveau & Expérience"
              description="Les conducteurs les plus expérimentés apparaîtront ici."
            />
          )}

          {tab === "note" && (
            <RankingPlaceholder
              title="Top 10 – Meilleures notes"
              description="Les conducteurs les mieux notés apparaîtront ici."
            />
          )}

          {tab === "trajets" && (
            <RankingPlaceholder
              title="Top 10 – Nombre de trajets"
              description="Les conducteurs les plus actifs apparaîtront ici."
            />
          )}
        </section>

        {/* Rewards info */}
        <section className="rounded-3xl bg-violet-50 px-6 py-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span>🎖</span>
            <span>Comment gagner des récompenses ?</span>
          </h3>

          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <Reward
              icon="🏅"
              title="Gagnez des XP"
              text="+10 XP par trajet complété, +5 XP bonus si note ≥ 4.5"
            />
            <Reward
              icon="⭐"
              title="Débloquez des badges"
              text="Accomplissez des objectifs pour collecter tous les badges."
            />
            <Reward
              icon="📉"
              title="Réductions progressives"
              text="Niveau 5+ : -5% • Niveau 7+ : -10% • Niveau 9+ : -15%"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

/* =====================
   Components
===================== */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl bg-white px-6 py-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center justify-center gap-2 rounded-full px-4 py-2 transition",
        active
          ? "bg-violet-600 text-white shadow-sm"
          : "hover:bg-slate-50",
      ].join(" ")}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function RankingPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-6 flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        {description}
      </div>
    </>
  );
}

function Reward({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white">
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-slate-600">{text}</p>
      </div>
    </div>
  );
}
