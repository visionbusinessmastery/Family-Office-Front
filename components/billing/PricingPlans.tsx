"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

type BillingInterval = "monthly" | "yearly";

type Plan = {
  id: "gold" | "elite" | "liberty" | "legacy";
  name: string;
  subtitle: string;
  badge: string;
  features: string[];
  tone: string;
};

type PricingPlansProps = {
  mode: "standard" | "founder";
};

const plans: Plan[] = [
  {
    id: "gold",
    name: "Gold",
    subtitle: "Growth",
    badge: "Croissance",
    tone: "border-[#3fa9f5]/35 bg-[#3fa9f5]/10",
    features: [
      "Analytics patrimoniaux",
      "Opportunités guidées",
      "Immobilier et allocation",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    subtitle: "Wealth OS",
    badge: "Premium",
    tone: "border-white/15 bg-white/[0.05]",
    features: [
      "Family Office cockpit",
      "Guidance Ethan avancée",
      "Consolidation multi-modules",
    ],
  },
  {
    id: "liberty",
    name: "Liberty",
    subtitle: "Sovereign Wealth",
    badge: "Indépendance",
    tone: "border-orange-300/35 bg-orange-300/10",
    features: [
      "Pilotage liberté financière",
      "Opportunités premium",
      "Suivi stratégique renforcé",
    ],
  },
  {
    id: "legacy",
    name: "Legacy",
    subtitle: "Dynasty Office",
    badge: "Transmission",
    tone: "border-amber-300/35 bg-amber-300/10",
    features: [
      "Gouvernance familiale",
      "Transmission patrimoniale",
      "Vision long terme",
    ],
  },
];

export default function PricingPlans({ mode }: PricingPlansProps) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const founder = mode === "founder";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const startCheckout = async (plan: Plan) => {
    if (!token) {
      window.location.assign(
        `/login?next=${encodeURIComponent(
          `/plans/${mode === "founder" ? "founder" : "standard"}`
        )}`
      );
      return;
    }

    setLoadingPlan(plan.id);
    setMessage("");

    try {
      const response = await apiRequest<{ url?: string }>(
        "/billing/create-checkout-session",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            plan: plan.id,
            interval,
            founder,
          }),
        }
      );

      if (response.url) {
        window.location.assign(response.url);
        return;
      }

      setMessage("Checkout Stripe indisponible pour le moment.");
    } catch (err) {
      console.error(err);
      setMessage(
        "Impossible d'ouvrir Stripe. Vérifie la configuration billing ou réessaie dans quelques instants."
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#07111f] via-black to-[#101923] p-6 shadow-2xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[#3fa9f5]">
            WHITE ROCK Billing
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-5xl">
                {founder ? "Founder Plans" : "Standard Plans"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400">
                {founder
                  ? "Un accès early premium, limité, pensé pour les premiers membres qui veulent construire leur Wealth OS avec une longueur d'avance."
                  : "Des plans clairs pour faire évoluer ton cockpit patrimonial sans changer les flows existants."}
              </p>
            </div>

            <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
              {(["monthly", "yearly"] as BillingInterval[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setInterval(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    interval === item
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {founder && (
          <div className="mt-5 rounded-2xl border border-orange-300/25 bg-orange-300/10 p-4 text-sm text-orange-100">
            Programme limité: les plans Founder sont réservés aux premiers
            membres et peuvent être désactivés sans impacter les abonnements
            standards.
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
            {message}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-3xl border p-5 shadow-xl transition hover:-translate-y-0.5 hover:border-[#3fa9f5]/45 ${plan.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    {plan.badge}
                  </p>
                  <h2 className="mt-2 text-2xl font-black">{plan.name}</h2>
                  <p className="text-sm text-gray-400">{plan.subtitle}</p>
                </div>
                {founder && (
                  <span className="rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-200">
                    Founder
                  </span>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs text-gray-500">
                  Facturation sélectionnée
                </p>
                <p className="mt-1 text-lg font-black">
                  {interval === "monthly" ? "Mensuelle" : "Annuelle"}
                </p>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-gray-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-[#3fa9f5]">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(plan)}
                disabled={loadingPlan !== null}
                className="mt-6 w-full rounded-2xl bg-[#3fa9f5] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2588d2] disabled:opacity-60"
              >
                {loadingPlan === plan.id
                  ? "Ouverture Stripe..."
                  : founder
                    ? "Rejoindre Founder"
                    : "Choisir ce plan"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
