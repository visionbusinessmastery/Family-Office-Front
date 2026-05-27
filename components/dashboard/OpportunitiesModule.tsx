"use client";

import { useState } from "react";
import type {
  CommandCenter,
  Opportunity,
  OpportunityData,
} from "@/lib/types";

type OpportunitiesModuleProps = {
  commandCenter: CommandCenter | null;
};

const priorityClasses: Record<string, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-300",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const normalizeOpportunities = (
  opportunities: CommandCenter["opportunities"]
): Opportunity[] => {
  if (Array.isArray(opportunities)) return opportunities;

  return (opportunities as OpportunityData | undefined)?.opportunities || [];
};

const typeCopy: Record<string, { focus: string; impact: string; risk: string }> = {
  real_estate: {
    focus: "renforcer la poche immobilière sans surcharger ta liquidité",
    impact: "améliorer la stabilité patrimoniale si le rendement net reste cohérent avec tes charges",
    risk: "la liquidité et les travaux doivent rester sous contrôle avant engagement",
  },
  investments: {
    focus: "équilibrer l'allocation financière et réduire les concentrations",
    impact: "augmenter la diversification sans créer une exposition excessive à la volatilité",
    risk: "le timing d'entrée et la corrélation avec tes positions actuelles sont les points à vérifier",
  },
  business: {
    focus: "créer une poche de cashflow ou de valorisation entrepreneuriale",
    impact: "accélérer la trajectoire si le risque opérationnel reste maîtrisé",
    risk: "le temps disponible, les charges fixes et la dépendance au fondateur doivent être clarifiés",
  },
  strategic: {
    focus: "transformer ton score en plan d'action concret",
    impact: "réduire les angles morts et prioriser ce qui influence vraiment ton cockpit",
    risk: "l'enjeu est d'éviter de multiplier les actions sans arbitrage clair",
  },
};

const getOpportunityTypeKey = (opportunity: Opportunity) =>
  String(opportunity.type || "").toLowerCase();

const buildOpportunityInsight = (
  opportunity: Opportunity,
  globalScore: number
) => {
  const typeKey = getOpportunityTypeKey(opportunity);
  const copy =
    typeCopy[typeKey] ||
    typeCopy[
      typeKey.includes("real") || typeKey.includes("immo")
        ? "real_estate"
        : typeKey.includes("business") || typeKey.includes("venture")
          ? "business"
          : typeKey.includes("invest")
            ? "investments"
            : "strategic"
    ];
  const priority =
    opportunity.priority === "high"
      ? "prioritaire"
      : opportunity.priority === "low"
        ? "à garder en veille"
        : "à qualifier";

  return `Avec un score cockpit de ${globalScore}/100, ce signal est ${priority}: il peut ${copy.impact}. L'angle utile ici est de ${copy.focus}. Point de vigilance: ${copy.risk}.`;
};

const buildOpportunityNextStep = (opportunity: Opportunity) => {
  const typeKey = getOpportunityTypeKey(opportunity);

  if (typeKey.includes("real") || typeKey.includes("immo")) {
    return "Prochaine action: compare le rendement net, la fiscalité locale et le besoin de trésorerie avant toute visite ou simulation.";
  }

  if (typeKey.includes("business") || typeKey.includes("venture")) {
    return "Prochaine action: vérifie le cashflow disponible, le niveau d'implication requis et le risque de dépendance opérationnelle.";
  }

  if (typeKey.includes("invest")) {
    return "Prochaine action: mesure l'effet sur ta diversification et évite d'ajouter une ligne trop corrélée à tes positions actuelles.";
  }

  return "Prochaine action: choisis une décision simple à exécuter cette semaine, puis mesure son effet sur ton score et ta clarté patrimoniale.";
};

export default function OpportunitiesModule({
  commandCenter,
}: OpportunitiesModuleProps) {
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const opportunities = normalizeOpportunities(commandCenter?.opportunities);
  const globalScore = Number(commandCenter?.global_score || 0);
  const detectedCount =
    typeof commandCenter?.opportunities_count === "number"
      ? commandCenter.opportunities_count
      : opportunities.length;
  const enrichedOpportunities =
    opportunities.length > 0
      ? opportunities
      : [
          {
            title: "Audit d'acceleration Advanced",
            description:
              "Transformer ton score actuel en plan d'action: proteger le cashflow, arbitrer les expositions et choisir une opportunite prioritaire cette semaine.",
            priority: "high",
            type: "strategic",
            score: 73,
          },
          {
            title: "Passer en Wealth OS",
            description:
              "Activer les analyses avancees, les affiliations pertinentes et un suivi plus regulier pour passer de croissance a liberte financiere pilotee.",
            priority: "medium",
            type: "subscription",
            score: 80,
          },
        ];

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opportunites</h2>
          <p className="text-sm text-gray-400">
            Signaux personnalises selon ton profil et ton portefeuille
          </p>
        </div>

        <span className="text-sm text-[#3fa9f5]">
          {detectedCount} detectee
          {detectedCount > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {enrichedOpportunities.slice(0, 6).map((opportunity, index) => {
            const priority = opportunity.priority || "medium";
            const badgeClass =
              priorityClasses[priority] || priorityClasses.medium;

            return (
              <button
                type="button"
                key={`${opportunity.type || opportunity.title}-${index}`}
                onClick={() => setSelectedOpportunity(opportunity)}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-[#3fa9f5]/40 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">
                      {opportunity.title || "Opportunite"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {opportunity.description ||
                        buildOpportunityInsight(opportunity, globalScore)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs uppercase ${badgeClass}`}
                  >
                    {priority}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500 uppercase">
                    {opportunity.type || "signal"}
                  </span>
                  <span className="font-black text-[#3fa9f5]">
                    {opportunity.score || 0}/100
                  </span>
                </div>

                {opportunity.premium && (
                  <p className="mt-3 text-xs text-yellow-300">
                    Signal premium
                  </p>
                )}
              </button>
            );
          })}
        </div>

      {selectedOpportunity && (
        <div className="mt-5 rounded-2xl border border-[#3fa9f5]/25 bg-[#3fa9f5]/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                Détail opportunité
              </p>
              <h3 className="mt-1 text-lg font-bold text-white">
                {selectedOpportunity.title || "Opportunité"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOpportunity(null)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400 hover:text-white"
            >
              Fermer
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">
            {selectedOpportunity.description ||
              buildOpportunityInsight(selectedOpportunity, globalScore)}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-gray-500">Type</p>
              <p className="mt-1 font-bold text-white">
                {selectedOpportunity.type || "signal"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-gray-500">Priorité</p>
              <p className="mt-1 font-bold text-white">
                {selectedOpportunity.priority || "medium"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-gray-500">Score</p>
              <p className="mt-1 font-bold text-[#3fa9f5]">
                {selectedOpportunity.score || 0}/100
              </p>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-gray-300">
            {buildOpportunityNextStep(selectedOpportunity)}
          </p>
        </div>
      )}
    </section>
  );
}
