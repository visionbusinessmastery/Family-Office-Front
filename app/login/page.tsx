"use client";

import { FormEvent, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

const loginMessages = [
  "Bon retour. On reprend le cap.",
  "Ton cockpit t'attend.",
  "Une petite action aujourd'hui peut clarifier tout le mois.",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const welcome = useMemo(
    () => loginMessages[new Date().getDate() % loginMessages.length],
    []
  );

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      }).catch((err) => {
        console.error("FETCH ERROR:", err);
        throw new Error("Backend injoignable");
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.action === "set_password_required") {
          localStorage.setItem("verified_email", email);
          window.location.href = "/set-password";
          return;
        }

        throw new Error(data?.detail || "Erreur login");
      }

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
      }

      setMessage("Connexion reussie. Ouverture de ton cockpit...");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : JSON.stringify(err));
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-[#061827]" />

      <section className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <p className="text-sm uppercase tracking-widest text-[#3fa9f5]">
            WHITE ROCK
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight">
            {welcome}
          </h1>
          <p className="mt-5 max-w-xl text-gray-300">
            Connecte-toi pour voir ton Daily Wealth Check, tes signaux utiles et
            ta progression patrimoniale.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur"
        >
          <div className="mb-6">
            <p className="text-2xl font-black tracking-[0.18em]">WHITE ROCK</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#3fa9f5]">
              Wealth Operating System
            </p>
            <p className="mt-5 text-sm text-gray-400 lg:hidden">{welcome}</p>
          </div>

          <div className="space-y-3">
            <input
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#3fa9f5]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#3fa9f5]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="mt-5 w-full rounded-xl bg-[#3fa9f5] p-3 font-bold">
            Ouvrir mon cockpit
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
          )}
        </form>
      </section>
    </main>
  );
}
