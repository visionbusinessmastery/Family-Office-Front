"use client";

import { useEffect, useState } from "react";
import AuthExperienceShell from "@/components/AuthExperienceShell";
import BrandMark from "@/components/BrandMark";
import { apiFetch } from "@/lib/api-client";

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState("Connexion securisee en cours...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");
    const redirect = params.get("redirect") || "/dashboard";

    if (!session) {
      Promise.resolve().then(() =>
        setMessage("Session sociale introuvable. Retour a la connexion.")
      );
      setTimeout(() => {
        window.location.assign("/login");
      }, 1200);
      return;
    }

    apiFetch<{ access_token?: string; state?: string }>(
      `/auth/oauth/session/${session}`,
      null,
      { method: "POST" }
    )
      .then((data) => {
        if (!data.access_token) {
          throw new Error("Token manquant");
        }
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
        setMessage("Compte synchronise. Ouverture de WHITE ROCK...");
        setTimeout(() => {
          window.location.assign(
            data.state === "ONBOARDING_REQUIRED" ? "/onboarding" : redirect
          );
        }, 900);
      })
      .catch(() => {
        setMessage("Connexion sociale impossible. Reessaie depuis la page login.");
        setTimeout(() => {
          window.location.assign("/login");
        }, 1400);
      });
  }, []);

  return (
    <AuthExperienceShell fullScreen>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 text-white">
        <div className="flex max-w-md flex-col items-center text-center">
          <BrandMark />
          <p className="mt-6 text-sm leading-relaxed text-gray-300">{message}</p>
          <div className="mt-8 h-16 w-16 animate-spin rounded-full border-2 border-[#3fa9f5]/30 border-r-amber-300 border-t-[#3fa9f5]" />
        </div>
      </main>
    </AuthExperienceShell>
  );
}
