"use client";

import type {
  Opportunity,
  OpportunityData,
  UserIntelligence,
} from "@/lib/types";

type OpportunitiesModuleProps = {
  intelligence: UserIntelligence | null;
};

const priorityClasses: Record<string, string> = {
  high: "border-red-500/30 bg-red-500/10 text-red-300",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const normalizeOpportunities = (
  opportunities: UserIntelligence["opportunities"]
): Opportunity[] => {
  if (Array.isArray(opportunities)) return opportunities;

  return (opportunities as OpportunityData | undefined)?.opportunities || [];
};

export default function OpportunitiesModule({
  intelligence,
}: OpportunitiesModuleProps) {
  const opportunities = normalizeOpportunities(intelligence?.opportunities);
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
            title: "Upgrade Liberty",
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
          {enrichedOpportunities.length} detectee
          {enrichedOpportunities.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {enrichedOpportunities.slice(0, 6).map((opportunity, index) => {
            const priority = opportunity.priority || "medium";
            const badgeClass =
              priorityClasses[priority] || priorityClasses.medium;

            return (
              <article
                key={`${opportunity.type || opportunity.title}-${index}`}
                className="border border-white/10 bg-white/5 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">
                      {opportunity.title || "Opportunite"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {opportunity.description || "Analyse en cours."}
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
              </article>
            );
          })}
        </div>
    </section>
  );
}
