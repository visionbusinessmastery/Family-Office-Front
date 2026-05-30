"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthExperienceShell from "@/components/AuthExperienceShell";
import { ActionButton, WealthToast } from "@/components/ui/WealthUI";

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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setState("error");
        setMessage("Lien invalide ou incomplet");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`).catch(
          () => {
            throw new Error("Service momentanement indisponible");
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
      setToast({ message: "Email introuvable.", type: "error" });
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
        throw new Error("Service momentanement indisponible");
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur resend");
      }

      setToast({ message: "Email de verification renvoye.", type: "success" });
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Erreur lors du renvoi",
        type: "error",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthExperienceShell
      title="Verification email"
      subtitle="On securise ton acces avant d'ouvrir ton cockpit patrimonial."
    >
      <WealthToast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
      <div className="text-center">
        <p className="text-sm text-gray-300">{message}</p>

        {email && <p className="mt-2 text-sm text-gray-300">{email}</p>}

        {state === "error" && (
          <div className="mt-6">
            <p className="text-red-400 mb-4">Verification echouee</p>

            <ActionButton
              onClick={resendEmail}
              disabled={resending}
            >
              {resending ? "Envoi..." : "Renvoyer email"}
            </ActionButton>

            <ActionButton
              onClick={() => (window.location.href = "/")}
              variant="secondary"
              className="ml-3"
            >
              Accueil
            </ActionButton>
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
