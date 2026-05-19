"use client";

import { FormEvent, useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";

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
      <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/82 to-[#061827]/90" />
      <svg
        className="wealth-lines pointer-events-none absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 560 C180 480 300 500 460 420 C620 340 760 360 920 270 C1040 205 1120 190 1200 150"
          className="wealth-line wealth-line-one"
        />
        <path
          d="M0 650 C240 610 360 560 520 570 C710 585 820 470 980 430 C1080 405 1150 410 1200 380"
          className="wealth-line wealth-line-two"
        />
      </svg>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
          <BrandMark className="mb-8" />
          <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight">
            {welcome}
          </h1>
          <p className="mt-5 max-w-xl text-gray-300">
            Connecte-toi pour voir ton Daily Insight, tes signaux utiles et
            ta progression patrimoniale.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl backdrop-blur"
        >
          <div className="mb-6">
            <BrandMark compact />
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
