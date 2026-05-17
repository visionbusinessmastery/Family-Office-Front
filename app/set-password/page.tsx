"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";

type State = "idle" | "loading" | "success" | "error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://family-office-api-n4sv.onrender.com";

export default function SetPasswordPage() {
  const initialEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("verified_email") || ""
      : "";

  const [email] = useState<string>(initialEmail);
  const [password, setPassword] = useState("");

  const [state, setState] = useState<State>(initialEmail ? "idle" : "error");
  const [message, setMessage] = useState(
    initialEmail ? "" : "Email introuvable, recommence l'inscription."
  );

  // =========================
  // VALIDATION PASSWORD
  // =========================
  const isValidPassword = password.length >= 6;

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      setState("error");
      setMessage("Email manquant. Recommence le processus.");
      return;
    }

    if (!password) {
      setState("error");
      setMessage("Mot de passe requis.");
      return;
    }

    if (!isValidPassword) {
      setState("error");
      setMessage("Mot de passe trop court (min 6 caractères).");
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      }).catch(() => {
        throw new Error("Backend injoignable (Failed to fetch)");
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Erreur serveur");
      }

      // =========================
      // SUCCESS STATE
      // =========================
      setState("success");
      setMessage("Compte activé ✔️");

      // =========================
      // SAVE TOKEN
      // =========================
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
      }

      // cleanup email (important)
      localStorage.removeItem("verified_email");

      // =========================
      // REDIRECT
      // =========================
      setTimeout(() => {
        window.location.href = "/onboarding";
      }, 1200);

    } catch (err: unknown) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-family-office.jpg')" }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md text-center text-white">

        {/* LOGO */}
        <Image
          src="/logo.png"
          alt="Vision Business Mastery"
          width={160}
          height={160}
          className="h-40 mx-auto mb-6"
        />

        {/* TITLE */}
        <h1
          className="mb-6"
          style={{
            fontFamily: "Playfair Display",
            fontSize: "32px",
            color: "#1DA2CF",
          }}
        >
          Activation du compte
        </h1>

        {/* EMAIL DISPLAY */}
        {email && (
          <p className="text-sm text-gray-300 mb-4">
            Email : {email}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <input
            type="password"
            placeholder="Mot de passe (min 6 caractères)"
            className="px-4 py-3 rounded-xl text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={state === "loading"}
          />

          <button
            type="submit"
            disabled={state === "loading"}
            className="py-3 rounded-xl text-white bg-[#1DA2CF] disabled:opacity-50"
          >
            {state === "loading" ? "Activation..." : "Activer mon compte"}
          </button>

        </form>

        {/* MESSAGE */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              state === "error" ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}

      </div>
    </main>
  );
}
