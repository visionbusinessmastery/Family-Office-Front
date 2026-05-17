"use client";

import { useState, FormEvent } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
        throw new Error("Backend injoignable (API unreachable)");
      });

      const data = await res.json().catch(() => null);

      console.log("LOGIN RESPONSE:", data);

      // =========================
      // ERROR HANDLING BACKEND
      // =========================
      if (!res.ok) {
        console.log("LOGIN ERROR BODY:", data);

        // CAS : mot de passe non défini
        if (data?.action === "set_password_required") {
          localStorage.setItem("verified_email", email);
          window.location.href = "/set-password";
          return;
        }

        throw new Error(data?.detail || "Erreur login");
      }

      // =========================
      // SUCCESS LOGIN
      // =========================
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
      }

      setMessage("Connexion réussie ✔️");

      window.location.href = "/dashboard";

    } catch (err: unknown) {
      console.log("LOGIN ERROR:", err);

      setMessage(
        err instanceof Error ? err.message : JSON.stringify(err)
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-80">

        <h1 className="text-xl text-center text-[#1DA2CF]">
          Connexion
        </h1>

        <input
          placeholder="Email"
          className="p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="p-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-[#1DA2CF] p-2 rounded">
          Se connecter
        </button>

        <p className="text-red-400 text-sm text-center">
          {message}
        </p>

      </form>
    </main>
  );
}
