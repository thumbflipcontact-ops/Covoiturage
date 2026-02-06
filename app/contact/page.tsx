"use client";

import { useState } from "react";
import { MainNavbar } from "@/components/MainNavbar";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    setFeedback(null);

    if (!fullName || !email || !message) {
      setFeedback("❌ Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSending(true);

    try {
      // 🔹 For now: simulate sending (safe)
      console.log("CONTACT MESSAGE", {
        fullName,
        email,
        phone,
        subject,
        message,
      });

      setFeedback("✅ Message envoyé avec succès. Nous vous répondrons rapidement.");
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      setFeedback("❌ Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar active="contact" />

      {/* Purple hero band */}
      <div className="bg-primary-gradient text-white">
        <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-12 text-center">
          <div className="mb-4 text-5xl">💬</div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Contactez-nous
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90">
            Une question ? Nous sommes là pour vous aider.
          </p>
        </section>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-12 -mt-10 space-y-8">
        {/* WhatsApp card */}
        <section className="rounded-3xl bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-500">
            🟢
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            WhatsApp
          </h2>
          <button
            onClick={() => alert("Support WhatsApp bientôt disponible")}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
          >
            Contactez-nous
          </button>
        </section>

        {/* Contact form */}
        <section className="rounded-3xl bg-white p-6 shadow-md sm:p-8">
          <h2 className="text-base font-semibold text-slate-900">
            Envoyez-nous un message
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Nom complet *
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                placeholder="Nom complet"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Email *
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                placeholder="Votre email"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Téléphone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                placeholder="6XX XXX XXX"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Sujet
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
                placeholder="Objet de votre message"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Message *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300"
              placeholder="Décrivez votre demande..."
            />
          </div>

          {feedback && (
            <p className="mt-4 text-sm text-slate-700">{feedback}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={sending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 disabled:opacity-50"
          >
            <span>📨</span>
            <span>{sending ? "Envoi…" : "Envoyer le message"}</span>
          </button>
        </section>
      </main>
    </div>
  );
}
