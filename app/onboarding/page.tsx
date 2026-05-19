"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

const motivations = [
  "liberte financiere",
  "revenus passifs",
  "retraite",
  "famille",
  "voyager",
  "independance",
];

export default function Onboarding() {
  const initialToken =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [token] = useState<string | null>(initialToken);

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [situationPro, setSituationPro] = useState("");
  const [motivation, setMotivation] = useState("");
  const [riskLevel, setRiskLevel] = useState("equilibre");
  const [horizon, setHorizon] = useState("5-10 ans");
  const [mainCurrency, setMainCurrency] = useState("EUR");
  const [revenusMensuels, setRevenusMensuels] = useState<number | "">("");
  const [chargesMensuelles, setChargesMensuelles] = useState<number | "">("");

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleNumericField =
    (setter: (value: number | "") => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setter(value === "" ? "" : Number(value));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const onboardingPayload = {
        age: age ? Number(age) : null,
        situation_pro: situationPro,
        revenus_mensuels: revenusMensuels ? Number(revenusMensuels) : 0,
        charges_mensuelles: chargesMensuelles ? Number(chargesMensuelles) : 0,
      };

      const onboardingRes = await fetch(`${API_BASE_URL}/auth/onboarding/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingPayload),
      });

      const onboardingData = await onboardingRes.json().catch(() => ({}));

      if (!onboardingRes.ok) {
        throw new Error(onboardingData?.detail || "Erreur onboarding");
      }

      await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          goals: [motivation].filter(Boolean),
          horizon,
          investor_profile: situationPro,
          risk_level: riskLevel,
          main_currency: mainCurrency,
          motivation,
        }),
      }).catch(() => null);

      setMessage("Ton cockpit est pret. Ouverture...");

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

  const progress = Math.round((step / 4) * 100);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-[#071827]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center">
        <div className="w-full rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Entree dans WHITE ROCK
            </p>
            <h1 className="mt-2 text-3xl font-black">Construisons ton point de depart.</h1>
            <p className="mt-2 text-sm text-gray-400">
              Quelques reponses suffisent pour personnaliser ton cockpit et ton
              Daily Wealth Check.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#3fa9f5]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">Etape {step} / 4</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Prenom"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                <input
                  type="number"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Age"
                  value={age}
                  onChange={handleNumericField(setAge)}
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  value={situationPro}
                  onChange={(e) => setSituationPro(e.target.value)}
                >
                  <option value="">Situation professionnelle</option>
                  <option value="etudiant">Etudiant</option>
                  <option value="salarie">Salarie</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="investisseur">Investisseur</option>
                </select>
                <select
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                >
                  <option value="">Motivation principale</option>
                  {motivations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                >
                  <option value="prudent">Prudent</option>
                  <option value="equilibre">Equilibre</option>
                  <option value="dynamique">Dynamique</option>
                </select>
                <input
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Horizon"
                  value={horizon}
                  onChange={(event) => setHorizon(event.target.value)}
                />
                <input
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Devise principale"
                  value={mainCurrency}
                  onChange={(event) => setMainCurrency(event.target.value.toUpperCase())}
                />
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Revenus mensuels"
                  value={revenusMensuels}
                  onChange={handleNumericField(setRevenusMensuels)}
                />
                <input
                  type="number"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Charges mensuelles"
                  value={chargesMensuelles}
                  onChange={handleNumericField(setChargesMensuelles)}
                />
              </div>
            )}

            <div className="flex gap-3 pt-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-semibold"
                >
                  Retour
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full rounded-xl bg-[#3fa9f5] p-3 font-bold"
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#3fa9f5] p-3 font-bold disabled:opacity-50"
                >
                  {loading ? "Preparation..." : "Ouvrir mon cockpit"}
                </button>
              )}
            </div>
          </form>

          {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}
        </div>
      </section>
    </main>
  );
}
