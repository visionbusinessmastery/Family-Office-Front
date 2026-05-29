"use client";

import type {
  PortfolioAsset,
  RealEstateData,
  VentureAssetData,
  YieldAssetData,
} from "@/lib/types";

type FamilyOfficeOverviewProps = {
  portfolio: PortfolioAsset[];
  realEstate?: RealEstateData | null;
  yieldAssets?: YieldAssetData | null;
  ventureAssets?: VentureAssetData | null;
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

export const moduleCategories = [
  { key: "commodities", label: "Commodities", aliases: ["COMMODITIES"] },
  { key: "crypto", label: "Crypto", aliases: ["CRYPTO"] },
  { key: "etf", label: "ETF", aliases: ["ETF"] },
  { key: "forex", label: "Forex", aliases: ["FOREX", "FX", "CURRENCY", "CURRENCIES"] },
  { key: "stocks", label: "Stocks", aliases: ["STOCK", "STOCKS"] },
];

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const getAssetCost = (asset: PortfolioAsset) =>
  Number(
    asset.cost ??
      Number(asset.quantity || 0) * Number(asset.purchase_price || 0)
  );

const normalizeType = (value?: string) =>
  (value || "").trim().replace(/-/g, "_").replace(/\s+/g, "_").toUpperCase();

const buildMetric = (label: string, assets: PortfolioAsset[]) => {
  const invested = assets.reduce((acc, asset) => acc + getAssetCost(asset), 0);
  const finalValue = assets.reduce((acc, asset) => acc + getAssetValue(asset), 0);
  const gain = finalValue - invested;

  return {
    label,
    invested,
    gain,
    finalValue,
    count: assets.length,
  };
};

export default function FamilyOfficeOverview({
  portfolio,
  realEstate,
  yieldAssets,
  ventureAssets,
}: FamilyOfficeOverviewProps) {
  const cards = [];

  if ((realEstate?.assets || []).length > 0) {
    const totalPurchase = Number(realEstate?.totals?.total_purchase || 0);
    const finalValue = Number(realEstate?.totals?.total_estimated_value || 0);

    cards.push({
      label: "Immobilier",
      invested: totalPurchase,
      gain: Number(realEstate?.totals?.total_potential_gain || 0),
      finalValue,
      count: realEstate?.assets.length || 0,
    });
  }

  if ((yieldAssets?.assets || []).length > 0) {
    cards.push({
      label: "Prets & Private Equity",
      invested: Number(yieldAssets?.totals?.total_principal || 0),
      gain: Number(yieldAssets?.totals?.total_projected_gain || 0),
      finalValue: Number(yieldAssets?.totals?.total_final_value || 0),
      count: yieldAssets?.assets.length || 0,
    });
  }

  if ((ventureAssets?.assets || []).length > 0) {
    cards.push({
      label: "Business & Ventures",
      invested: Number(ventureAssets?.totals?.total_revenue || 0),
      gain: Number(ventureAssets?.totals?.total_result || 0),
      finalValue: Number(ventureAssets?.totals?.total_final_value || 0),
      count: ventureAssets?.assets.length || 0,
    });
  }

  moduleCategories.forEach((category) => {
    const aliases = category.aliases.map(normalizeType);
    const assets = portfolio.filter((asset) =>
      aliases.includes(normalizeType(asset.asset_type || asset.type))
    );

    if (assets.length > 0) {
      cards.push(buildMetric(category.label, assets));
    }
  });

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Vue par rubrique</h2>
          <p className="text-sm text-gray-400">
            Seules les categories avec au moins un asset sont affichees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {cards.map((card) => {
          const gainClass = card.gain >= 0 ? "text-emerald-400" : "text-red-400";

          return (
            <article
              key={card.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{card.label}</h3>
                  <p className="text-xs text-gray-400">
                    {card.count} asset{card.count > 1 ? "s" : ""}
                  </p>
                </div>
                <p className={`text-sm font-bold ${gainClass}`}>
                  {card.gain >= 0 ? "+" : ""}
                  {money.format(card.gain)} EUR
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Valeur</p>
                  <p className="font-semibold">
                    {money.format(card.invested)} EUR
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">+/- value</p>
                  <p className={`font-semibold ${gainClass}`}>
                    {card.gain >= 0 ? "+" : ""}
                    {money.format(card.gain)} EUR
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Final</p>
                  <p className="font-black text-[#3fa9f5]">
                    {money.format(card.finalValue)} EUR
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
