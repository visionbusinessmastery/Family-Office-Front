"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";

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
  const [hasChildren, setHasChildren] = useState(false);
  const [transmissionGoal, setTransmissionGoal] = useState("");
  const [expatriationInterest, setExpatriationInterest] = useState("pas encore");
  const [governanceNeed, setGovernanceNeed] = useState("a clarifier");
  const [confidentialityNeed, setConfidentialityNeed] = useState("standard");

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
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
          has_children: hasChildren,
          transmission_goal: transmissionGoal,
          expatriation_interest: expatriationInterest,
          governance_need: governanceNeed,
          confidentiality_need: confidentialityNeed,
          family_strategy: transmissionGoal,
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

  const progress = Math.round((step / 5) * 100);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-[#071827]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center">
        <div className="w-full rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6">
            <BrandMark compact className="mb-5" />
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Entree dans WHITE ROCK
            </p>
            <h1 className="mt-2 text-3xl font-black">Construisons ton point de depart.</h1>
            <p className="mt-2 text-sm text-gray-400">
              Quelques reponses suffisent pour personnaliser ton cockpit et ton
              Daily Insight.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#3fa9f5]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">Etape {step} / 5</p>
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

            {step === 5 && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={hasChildren}
                      onChange={(event) => setHasChildren(event.target.checked)}
                    />
                    J&apos;ai des enfants ou heritiers a preparer
                  </label>
                  <select
                    className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                    value={confidentialityNeed}
                    onChange={(e) => setConfidentialityNeed(e.target.value)}
                  >
                    <option value="standard">Confidentialite standard</option>
                    <option value="elevee">Confidentialite elevee</option>
                    <option value="familiale">Cercle familial prive</option>
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                    value={expatriationInterest}
                    onChange={(e) => setExpatriationInterest(e.target.value)}
                  >
                    <option value="pas encore">Strategie internationale: pas encore</option>
                    <option value="a explorer">A explorer</option>
                    <option value="prioritaire">Prioritaire</option>
                  </select>
                  <select
                    className="rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                    value={governanceNeed}
                    onChange={(e) => setGovernanceNeed(e.target.value)}
                  >
                    <option value="a clarifier">Gouvernance a clarifier</option>
                    <option value="famille">Regles familiales</option>
                    <option value="business">Business et famille</option>
                  </select>
                </div>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-[#3fa9f5]"
                  placeholder="Quel heritage veux-tu construire ?"
                  value={transmissionGoal}
                  onChange={(event) => setTransmissionGoal(event.target.value)}
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

              {step < 5 ? (
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
