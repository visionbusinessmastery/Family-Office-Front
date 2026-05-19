"use client";

import { FormEvent, useMemo, useState } from "react";
import BrandMark from "@/components/BrandMark";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const emailOk = useMemo(() => isValidEmail(email.trim()), [email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setSubmitState("error");
      setMessage("Entre un email valide pour commencer.");
      return;
    }

    setSubmitState("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Erreur serveur");
      }

      localStorage.setItem("verified_email", cleanEmail);
      localStorage.setItem("current_email", cleanEmail);

      setSubmitState("success");

      if (data?.action === "login") {
        setMessage("Ton espace existe deja. Redirection...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 900);
        return;
      }

      setMessage("Parfait. Verifie ton email pour activer ton espace.");
      setTimeout(() => {
        window.location.href = "/verify-email";
      }, 1100);
    } catch (err: unknown) {
      console.error(err);
      setSubmitState("error");
      setMessage(err instanceof Error ? err.message : "Erreur reseau");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/72 to-[#061827]/75" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="pointer-events-none absolute left-[-10%] top-[18%] h-52 w-52 rounded-full bg-[#3fa9f5]/20 blur-3xl floating-glow" />
      <div className="pointer-events-none absolute bottom-[12%] right-[-8%] h-56 w-56 rounded-full bg-amber-300/15 blur-3xl floating-glow floating-glow-delay" />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-5 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between">
          <BrandMark compact />
          <a
            href="/login"
            className="rounded-xl border border-[#3fa9f5]/50 bg-[#3fa9f5] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#3fa9f5]/20 backdrop-blur transition hover:bg-white hover:text-[#0b1725]"
          >
            Connexion
          </a>
        </header>

        <div className="grid items-end gap-8 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest text-[#3fa9f5] sm:text-sm">
              Reprendre le controle sans subir la complexite.
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Pilote ton patrimoine avec clarte, calme et progression.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              WHITE ROCK centralise ta situation, t&apos;aide a voir les priorites et
              transforme la gestion financiere en rituel simple, premium et
              motivant.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur sm:flex-row"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#3fa9f5]"
              />
              <button
                disabled={!emailOk || submitState === "loading"}
                className="rounded-xl bg-[#3fa9f5] px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {submitState === "loading" ? "Ouverture..." : "Creer mon espace"}
              </button>
            </form>

            {message && (
              <p
                className={`mt-4 text-sm ${
                  submitState === "error" ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {message}
              </p>
            )}

            <div className="mt-4 space-y-1 text-sm text-white/60">
              <p>Construis une vision claire de ton patrimoine.</p>
              <p>Un systeme pense pour progresser sereinement, sans surcharge.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Experience
            </p>
            <div className="mt-4 space-y-4">
              {[
                ["Vision globale", "Un seul endroit pour comprendre ou tu en es."],
                ["Daily Insight", "Une action utile a chaque ouverture."],
                ["Progression", "Des niveaux et missions qui donnent envie de revenir."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-xl bg-black/35 p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
          <span>Vision Business Mastery</span>
          <div className="flex gap-4">
            <a href="https://vision-business.com">Site web</a>
            <a href="https://www.linkedin.com">LinkedIn</a>
            <a href="https://www.instagram.com">Instagram</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
