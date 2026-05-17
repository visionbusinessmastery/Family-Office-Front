"use client";

import type {
  Opportunity,
  OpportunityData,
  PortfolioAsset,
  RealEstateData,
  UserIntelligence,
  VentureAssetData,
  YieldAssetData,
} from "@/lib/types";

type OpportunitiesModuleProps = {
  intelligence: UserIntelligence | null;
  portfolio?: PortfolioAsset[];
  realEstate?: RealEstateData | null;
  yieldAssets?: YieldAssetData | null;
  ventureAssets?: VentureAssetData | null;
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

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const normalizeType = (type?: string) =>
  (type || "Autre").replace(/_/g, " ").toUpperCase();

const buildPortfolioGroups = (portfolio: PortfolioAsset[] = []) => {
  const groups = portfolio.reduce<Record<string, number>>((acc, asset) => {
    const key = normalizeType(asset.asset_type || asset.type);
    acc[key] = (acc[key] || 0) + getAssetValue(asset);
    return acc;
  }, {});

  return Object.entries(groups).map(([title, value]) => ({
    title,
    count: portfolio.filter(
      (asset) => normalizeType(asset.asset_type || asset.type) === title
    ).length,
    opportunities: [
      `Verifier la concentration et la liquidite de ${title.toLowerCase()}.`,
      `Comparer la performance avec une alternative plus diversifiee.`,
    ],
    score: value > 0 ? 70 : 50,
  }));
};

const buildSpecializedGroups = (
  realEstate?: RealEstateData | null,
  yieldAssets?: YieldAssetData | null,
  ventureAssets?: VentureAssetData | null
) => {
  const groups = [];

  if ((realEstate?.assets || []).length > 0) {
    const rentalCount = realEstate?.assets.filter(
      (asset) => asset.property_type === "rental"
    ).length;

    groups.push({
      title: "Immobilier",
      count: realEstate?.assets.length || 0,
      score: Number(realEstate?.totals?.average_rental_yield || 0) > 5 ? 78 : 62,
      opportunities: [
        rentalCount
          ? "Optimiser le rendement locatif net et les charges recurrentes."
          : "Evaluer le potentiel de rendement ou d'arbitrage du patrimoine immobilier.",
        "Comparer la valeur estimee avec les prix reels du marche local.",
      ],
    });
  }

  const crowdfunding = (yieldAssets?.assets || []).filter(
    (asset) => asset.asset_type === "crowdfunding"
  );
  if (crowdfunding.length > 0) {
    groups.push({
      title: "Crowdfunding",
      count: crowdfunding.length,
      score: Number(yieldAssets?.totals?.average_rate || 0) > 8 ? 74 : 60,
      opportunities: [
        "Diversifier les projets pour reduire le risque de defaut.",
        "Comparer le taux moyen avec la duree et la qualite des garanties.",
      ],
    });
  }

  const privateEquity = (yieldAssets?.assets || []).filter(
    (asset) => asset.asset_type === "private_equity"
  );
  if (privateEquity.length > 0) {
    groups.push({
      title: "Private Equity",
      count: privateEquity.length,
      score: 68,
      opportunities: [
        "Suivre la liquidite, la duree de blocage et le multiple vise.",
        "Limiter la concentration sur un seul dossier non cote.",
      ],
    });
  }

  ["ai_business", "business", "startup", "franchise"].forEach((type) => {
    const rows = (ventureAssets?.assets || []).filter(
      (asset) => asset.asset_type === type
    );

    if (rows.length > 0) {
      const label = normalizeType(type);
      groups.push({
        title: label,
        count: rows.length,
        score: rows.some((asset) => Number(asset.result || 0) > 0) ? 76 : 58,
        opportunities: [
          "Prioriser l'amelioration du resultat avant nouvelle allocation.",
          "Comparer valorisation, dettes et levees pour mesurer le vrai potentiel.",
        ],
      });
    }
  });

  return groups;
};

export default function OpportunitiesModule({
  intelligence,
  portfolio = [],
  realEstate,
  yieldAssets,
  ventureAssets,
}: OpportunitiesModuleProps) {
  const opportunities = normalizeOpportunities(intelligence?.opportunities);
  const categoryGroups = [
    ...buildSpecializedGroups(realEstate, yieldAssets, ventureAssets),
    ...buildPortfolioGroups(portfolio),
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
          {opportunities.length} detectee{opportunities.length > 1 ? "s" : ""}
        </span>
      </div>

      {categoryGroups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
          {categoryGroups.map((group) => (
            <article
              key={group.title}
              className="border border-white/10 bg-white/5 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-white">{group.title}</h3>
                  <p className="text-xs text-gray-400">
                    {group.count} asset{group.count > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="font-black text-[#3fa9f5]">
                  {group.score}/100
                </span>
              </div>

              <div className="space-y-2">
                {group.opportunities.map((item) => (
                  <p key={item} className="text-sm text-gray-300">
                    {item}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {opportunities.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune opportunite globale prioritaire pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opportunities.slice(0, 6).map((opportunity, index) => {
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
      )}
    </section>
  );
}
