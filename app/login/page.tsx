"use client";

import { FormEvent, useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { apiFetch } from "@/lib/api-client";

const loginMessages = [
  "Bon retour. On reprend le cap.",
  "Ton cockpit t'attend.",
  "Une petite action aujourd'hui peut clarifier tout le mois.",
];

type LoginResponse = {
  access_token?: string;
};

type ApiErrorPayload = {
  action?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const welcome = useMemo(
    () => loginMessages[new Date().getDate() % loginMessages.length],
    []
  );

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await apiFetch<LoginResponse>("/auth/login", null, {
        method: "POST",
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
      }

      setMessage("Connexion reussie. Ouverture de ton cockpit...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1400);
    } catch (err: unknown) {
      const payload = (err as { payload?: ApiErrorPayload })?.payload;
      if (payload?.action === "set_password_required") {
        localStorage.setItem("verified_email", email);
        window.location.href = "/set-password";
        return;
      }

      setMessage(err instanceof Error ? err.message : "Connexion impossible");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
        <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/82 to-[#061827]/90" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <BrandMark />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-300">
            Preparation de ton cockpit patrimonial. On synchronise ton profil,
            ton plan et ta progression.
          </p>
          <div className="relative mt-8 h-16 w-16" aria-label="Chargement du cockpit">
            <div className="absolute inset-0 rounded-full border-4 border-white/15 shadow-[0_0_28px_rgba(63,169,245,0.22)]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[#ffd21a] border-t-[#3fa9f5] shadow-[0_0_18px_rgba(255,210,26,0.28)]" />
            <div className="absolute inset-5 rounded-full bg-[#3fa9f5]/35 shadow-[0_0_18px_rgba(63,169,245,0.45)]" />
          </div>
        </div>
      </main>
    );
  }

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

      <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
        <BrandMark compact />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-[1fr_420px]">
        <div className="hidden lg:block">
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
            <h1 className="text-2xl font-black text-white">Connexion</h1>
            <p className="mt-2 text-sm text-gray-400">
              Reprends le cap avec clarte et regularite.
            </p>
            <p className="mt-4 text-sm text-gray-500 lg:hidden">{welcome}</p>
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

          <button
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-[#3fa9f5] p-3 font-bold disabled:opacity-60"
          >
            {loading ? "Ouverture..." : "Ouvrir mon cockpit"}
          </button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            ou
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <SocialLoginButtons disabled={loading} compact />

          <p className="mt-3 text-center text-xs leading-relaxed text-gray-500">
            En continuant avec cette connexion, tu confirmes vouloir acceder
            a WHITE ROCK avec une authentification securisee.
          </p>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
          )}
        </form>
      </section>
    </main>
  );
}
