"use client";

import { FormEvent, useState } from "react";
import AuthExperienceShell from "@/components/AuthExperienceShell";

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      setState("error");
      setMessage("Email manquant. Recommence le processus.");
      return;
    }

    if (password.length < 6) {
      setState("error");
      setMessage("Mot de passe trop court (min 6 caracteres).");
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
        throw new Error("Backend injoignable");
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Erreur serveur");
      }

      setState("success");
      setMessage("Compte active. Ouverture de ton onboarding...");

      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
      }

      localStorage.removeItem("verified_email");

      setTimeout(() => {
        window.location.href = "/onboarding";
      }, 1200);
    } catch (err: unknown) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  return (
    <AuthExperienceShell
      title="Activation du compte"
      subtitle="Choisis ton mot de passe pour securiser ton espace WHITE ROCK."
    >
      <div className="text-center text-white">
        {email && (
          <p className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300">
            Email : {email}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
          <input
            type="password"
            placeholder="Mot de passe (min 6 caracteres)"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#3fa9f5]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={state === "loading"}
          />

          <button
            type="submit"
            disabled={state === "loading"}
            className="rounded-xl bg-[#3fa9f5] py-3 font-bold text-white transition hover:bg-white hover:text-[#0b1725] disabled:opacity-50"
          >
            {state === "loading" ? "Activation..." : "Activer mon compte"}
          </button>
        </form>

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
    </AuthExperienceShell>
  );
}
