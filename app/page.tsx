"use client";

import { FormEvent, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

// =========================
// EMAIL VALIDATION
// =========================
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const emailOk = useMemo(
    () => isValidEmail(email.trim()),
    [email]
  );

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setSubmitState("error");
      setMessage("Merci de saisir ton email.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setSubmitState("error");
      setMessage("Email invalide.");
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

      // =========================
      // LOCAL STORAGE SAFE
      // =========================
      localStorage.setItem("verified_email", cleanEmail);
      localStorage.setItem("current_email", cleanEmail);

      const action = data?.action;

      setSubmitState("success");

      switch (action) {
        case "verify_email":
          setMessage("📩 Vérifie ton email");
          setTimeout(() => {
            window.location.href = "/verify-email";
          }, 1200);
          break;

        case "resend_verification":
          setMessage("📩 Email renvoyé");
          setTimeout(() => {
            window.location.href = "/verify-email";
          }, 1200);
          break;

        case "login":
          setMessage("🔐 Redirection login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 1200);
          break;

        default:
          setMessage("Compte créé");
          setTimeout(() => {
            window.location.href = "/verify-email";
          }, 1200);
      }

    } catch (err: unknown) {
      console.error(err);
      setSubmitState("error");
      setMessage(err instanceof Error ? err.message : "Erreur reseau");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-black">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl text-[#1DA2CF] font-bold">
          Vision Business Mastery
        </h1>

        <p className="text-white/70 mt-2">
          Construis ton Family Office digital intelligent
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex gap-3 mt-6">

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="px-4 py-3 rounded-xl text-black"
        />

        <button
          disabled={!emailOk || submitState === "loading"}
          className="bg-[#1DA2CF] text-white px-6 rounded-xl disabled:opacity-50"
        >
          {submitState === "loading" ? "..." : "Commencer"}
        </button>
      </form>

      {/* MESSAGE */}
      {message && (
        <p className="text-white mt-4 text-sm">
          {message}
        </p>
      )}

      {/* FOOTER */}
      <footer className="absolute bottom-6 text-white/50 text-sm">
        © Vision Business Mastery
      </footer>

    </main>
  );
}
