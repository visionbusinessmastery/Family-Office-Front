"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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

        console.log("VERIFY RESPONSE:", data);

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

      console.log("RESEND RESPONSE:", data);

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
    <main
      className="relative min-h-screen flex flex-col items-center px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-family-office.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <Image
          src="/logo.png"
          alt="Vision Business Mastery"
          width={160}
          height={160}
          className="h-40 mt-6"
        />

        <h1 className="text-[#1DA2CF] text-[34px] mt-6">
          Verification email
        </h1>

        <p className="mt-4">{message}</p>

        {email && <p className="mt-2 text-sm text-gray-300">{email}</p>}

        {state === "error" && (
          <div className="mt-6">
            <p className="text-red-400 mb-4">Verification echouee</p>

            <button
              onClick={resendEmail}
              disabled={resending}
              className="bg-[#1DA2CF] text-white px-6 py-2 rounded-xl"
            >
              {resending ? "Envoi..." : "Renvoyer email"}
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="ml-3 bg-white text-black px-6 py-2 rounded-xl"
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
    </main>
  );
}

function VerifyEmailShell({ message }: { message: string }) {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-family-office.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <Image
          src="/logo.png"
          alt="Vision Business Mastery"
          width={160}
          height={160}
          className="h-40 mt-6"
        />
        <h1 className="text-[#1DA2CF] text-[34px] mt-6">
          Verification email
        </h1>
        <p className="mt-4">{message}</p>
      </div>
    </main>
  );
}
