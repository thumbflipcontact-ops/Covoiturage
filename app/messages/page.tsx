"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MainNavbar } from "@/components/MainNavbar";

type Booking = {
  id: string;
  passenger_id: string;
  driver_id: string;
  trip: {
    depart: string;
    arrivee: string;
  };
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string>("");

  /* =====================
     Load bookings
  ====================== */
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("bookings")
        .select(
          `
          id,
          passenger_id,
          driver_id,
          trip:trips (
            depart,
            arrivee
          )
        `
        )
        .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`);

      setBookings((data ?? []) as Booking[]);
      setLoading(false);
    };

    load();
  }, [router]);

  /* =====================
     Load messages
  ====================== */
  const loadMessages = async (bookingId: string) => {
    const res = await fetch(`/api/messages?bookingId=${bookingId}`);
    const data = await res.json();
    setMessages(data);
  };

  /* =====================
     Send message
  ====================== */
  const sendMessage = async () => {
    if (!activeBooking || !newMessage.trim()) return;

    const receiverId =
      userId === activeBooking.passenger_id
        ? activeBooking.driver_id
        : activeBooking.passenger_id;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: activeBooking.id,
        content: newMessage,
        receiverId,
      }),
    });

    setNewMessage("");
    loadMessages(activeBooking.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar active="messages" />

      <main className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        {/* LEFT */}
        <section className="w-72 rounded-3xl bg-white p-4 shadow-sm">
          <h1 className="text-sm font-semibold">Conversations</h1>

          <div className="mt-4 space-y-2">
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucune conversation
              </p>
            ) : (
              bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBooking(b);
                    loadMessages(b.id);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    activeBooking?.id === b.id
                      ? "bg-violet-600 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {b.trip.depart} → {b.trip.arrivee}
                </button>
              ))
            )}
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex flex-1 flex-col rounded-3xl bg-white p-6 shadow-sm">
          {!activeBooking ? (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              Sélectionnez une conversation
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-xs rounded-xl px-3 py-2 text-sm ${
                      m.sender_id === userId
                        ? "ml-auto bg-violet-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message…"
                  className="flex-1 rounded-full border px-4 py-2 text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="rounded-full bg-violet-600 px-4 py-2 text-sm text-white"
                >
                  Envoyer
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
