"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthExperienceShell from "@/components/AuthExperienceShell";

type State = "loading" | "success" | "error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://family-office-api-n4sv.onrender.com";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailShell message="Verification en cours..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialEmail =
    typeof window !== "undefined" ? localStorage.getItem("verified_email") : null;

  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("Verification en cours...");
  const [email, setEmail] = useState<string | null>(initialEmail);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setState("error");
        setMessage("Lien invalide (token manquant)");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`).catch(
          () => {
            throw new Error("Backend injoignable (Failed to fetch)");
          }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.detail || "Erreur de verification");
        }

        const verifiedEmail = data?.email;

        setState("success");
        setMessage("Email verifie avec succes");

        if (verifiedEmail) {
          setEmail(verifiedEmail);
          localStorage.setItem("verified_email", verifiedEmail);
        }

        setTimeout(() => {
          window.location.href = "/set-password";
        }, 1200);
      } catch (err: unknown) {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Erreur inconnue");
      }
    };

    run();
  }, [token]);

  const resendEmail = async () => {
    const emailToUse = email || localStorage.getItem("verified_email");

    if (!emailToUse) {
      alert("Email introuvable");
      return;
    }

    try {
      setResending(true);

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email: emailToUse.toLowerCase().trim(),
        }),
      }).catch(() => {
        throw new Error("Backend injoignable (Failed to fetch)");
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur resend");
      }

      alert("Email de verification renvoye");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors du renvoi");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthExperienceShell
      title="Verification email"
      subtitle="On securise ton acces avant d'ouvrir ton cockpit patrimonial."
    >
      <div className="text-center">
        <p className="text-sm text-gray-300">{message}</p>

        {email && <p className="mt-2 text-sm text-gray-300">{email}</p>}

        {state === "error" && (
          <div className="mt-6">
            <p className="text-red-400 mb-4">Verification echouee</p>

            <button
              onClick={resendEmail}
              disabled={resending}
              className="rounded-xl bg-[#3fa9f5] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {resending ? "Envoi..." : "Renvoyer email"}
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="ml-3 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black"
            >
              Accueil
            </button>
          </div>
        )}

        {state === "success" && (
          <div className="mt-6 text-green-400">
            Redirection vers activation du compte...
          </div>
        )}
      </div>
    </AuthExperienceShell>
  );
}

function VerifyEmailShell({ message }: { message: string }) {
  return (
    <AuthExperienceShell title="Verification email" subtitle={message}>
      <div className="mx-auto h-12 w-12 rounded-full border-2 border-[#3fa9f5]/30 border-r-amber-300 border-t-[#3fa9f5] animate-spin" />
    </AuthExperienceShell>
  );
}
