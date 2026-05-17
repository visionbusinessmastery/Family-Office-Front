"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

export default function Onboarding() {
  const initialToken =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // FORM STATE (ALIGNED BACKEND)
  // =========================
  const [age, setAge] = useState<number | "">("");
  const [situationPro, setSituationPro] = useState("");

  const [revenusMensuels, setRevenusMensuels] = useState<number | "">("");
  const [chargesMensuelles, setChargesMensuelles] = useState<number | "">("");

  const [token] = useState<string | null>(initialToken);

  // =========================
  // LOAD TOKEN SAFE
  // =========================
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  // =========================
  // NAVIGATION
  // =========================
  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const canStep2 = age !== "";
  const canStep3 = situationPro !== "";

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        age: age ? Number(age) : null,
        situation_pro: situationPro,
        revenus_mensuels: revenusMensuels ? Number(revenusMensuels) : 0,
        charges_mensuelles: chargesMensuelles ? Number(chargesMensuelles) : 0,
      };

      const res = await fetch(
        `${API_BASE_URL}/auth/onboarding/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Erreur onboarding");
      }

      setMessage("Onboarding terminé 🚀");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);

    } catch (err: unknown) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleNumericField =
    (setter: (value: number | "") => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setter(value === "" ? "" : Number(value));
    };

  // =========================
  // UI
  // =========================
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 bg-black">

      <div className="w-full max-w-xl bg-white/10 p-6 rounded-xl text-white">

        <h1 className="text-center text-xl font-bold text-[#1DA2CF]">
          Onboarding
        </h1>

        <p className="text-center text-sm mb-6">
          Étape {step} / 3
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="number"
                className="p-3 rounded text-black"
                placeholder="Âge"
                value={age}
                onChange={handleNumericField(setAge)}
              />

              <button
                type="button"
                disabled={!canStep2}
                onClick={nextStep}
                className="bg-[#1DA2CF] p-2 rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <select
                className="p-3 rounded text-black"
                value={situationPro}
                onChange={(e) => setSituationPro(e.target.value)}
              >
                <option value="">Situation professionnelle</option>
                <option value="etudiant">Étudiant</option>
                <option value="salarie">Salarié</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="sans_emploi">Sans emploi</option>
                <option value="investisseur">Investisseur</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-500 p-2 rounded w-full"
                >
                  Retour
                </button>

                <button
                  type="button"
                  disabled={!canStep3}
                  onClick={nextStep}
                  className="bg-[#1DA2CF] p-2 rounded w-full"
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                type="number"
                className="p-3 rounded text-black"
                placeholder="Revenus mensuels"
                value={revenusMensuels}
                onChange={handleNumericField(setRevenusMensuels)}
              />

              <input
                type="number"
                className="p-3 rounded text-black"
                placeholder="Charges mensuelles"
                value={chargesMensuelles}
                onChange={handleNumericField(setChargesMensuelles)}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-500 p-2 rounded w-full"
                >
                  Retour
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 p-2 rounded w-full"
                >
                  {loading ? "Envoi..." : "Terminer"}
                </button>
              </div>
            </>
          )}

        </form>

        {message && (
          <p className="text-center mt-4 text-sm">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}
