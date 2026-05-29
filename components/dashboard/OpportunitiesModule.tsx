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

const buildOpportunityInsight = (opportunity: Opportunity) => {
  if (opportunity.why_this_opportunity || opportunity.profile_compatibility) {
    return [
      opportunity.why_this_opportunity,
      opportunity.profile_compatibility &&
        `Compatibilite profil: ${opportunity.profile_compatibility}.`,
    ]
      .filter(Boolean)
      .join(" ");
  }

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

  return `Ce signal est ${priority}: il peut ${copy.impact}. L'angle utile ici est de ${copy.focus}. Point de vigilance: ${copy.risk}.`;
};

const buildOpportunityNextStep = (opportunity: Opportunity) => {
  const typeKey = getOpportunityTypeKey(opportunity);

  if (opportunity.next_action) {
    return `Prochaine action: ${opportunity.next_action}`;
  }

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
  const [showRest, setShowRest] = useState(false);
  const opportunities = normalizeOpportunities(commandCenter?.opportunities);
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
  const topOpportunity = enrichedOpportunities[0];
  const strategicOpportunities = enrichedOpportunities.slice(1, 3);
  const restOpportunities = enrichedOpportunities.slice(3);

  const renderOpportunityCard = (
    opportunity: Opportunity,
    index: number,
    variant: "primary" | "standard" = "standard"
  ) => {
    const priority = opportunity.priority || "medium";
    const badgeClass = priorityClasses[priority] || priorityClasses.medium;

    return (
      <button
        type="button"
        key={`${opportunity.type || opportunity.title}-${index}-${variant}`}
        onClick={() => setSelectedOpportunity(opportunity)}
        className={`rounded-2xl border p-4 text-left transition hover:border-[#3fa9f5]/50 ${
          variant === "primary"
            ? "border-[#3fa9f5]/35 bg-[#3fa9f5]/10"
            : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#3fa9f5]">
              {variant === "primary" ? "Top 1 prioritaire" : "Strategique"}
            </p>
            <h3 className="mt-2 font-bold text-white">
              {opportunity.title || "Opportunite"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {opportunity.description || buildOpportunityInsight(opportunity)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs uppercase ${badgeClass}`}
          >
            {priority}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/25 p-2">
            <p className="text-gray-500">Action</p>
            <p className="mt-1 text-gray-300">
              {opportunity.next_action || buildOpportunityNextStep(opportunity)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-2">
            <p className="text-gray-500">Profil</p>
            <p className="mt-1 text-gray-300">
              {opportunity.profile_compatibility ||
                opportunity.difficulty ||
                "A qualifier"}
            </p>
          </div>
        </div>

        {opportunity.premium && (
          <p className="mt-3 text-xs text-yellow-300">Signal premium</p>
        )}
      </button>
    );
  };

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

      <div className="space-y-4">
        {topOpportunity && renderOpportunityCard(topOpportunity, 0, "primary")}

        {strategicOpportunities.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Top 2-3 strategiques
              </p>
              <span className="text-xs text-gray-500">
                Ordre priorise par Ethan
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {strategicOpportunities.map((opportunity, index) =>
                renderOpportunityCard(opportunity, index + 1)
              )}
            </div>
          </div>
        )}

        {restOpportunities.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Reste des pistes
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Signaux utiles, a ouvrir seulement apres la priorite.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRest((value) => !value)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:border-[#3fa9f5]/40"
              >
                {showRest ? "Masquer" : "Afficher"}
              </button>
            </div>

            {showRest && (
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {restOpportunities.map((opportunity, index) =>
                  renderOpportunityCard(opportunity, index + 3)
                )}
              </div>
            )}
          </div>
        )}
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
              buildOpportunityInsight(selectedOpportunity)}
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
              <p className="text-xs text-gray-500">Difficulte</p>
              <p className="mt-1 font-bold text-[#3fa9f5]">
                {selectedOpportunity.difficulty || "moyenne"}
              </p>
            </div>
          </div>
          {(selectedOpportunity.why_now || selectedOpportunity.impact_potential) && (
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs text-gray-500">Pourquoi maintenant</p>
                <p className="mt-1 text-gray-300">{selectedOpportunity.why_now}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="text-xs text-gray-500">Impact potentiel</p>
                <p className="mt-1 text-gray-300">{selectedOpportunity.impact_potential}</p>
              </div>
            </div>
          )}
          <p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-gray-300">
            {buildOpportunityNextStep(selectedOpportunity)}
          </p>
        </div>
      )}
    </section>
  );
}
