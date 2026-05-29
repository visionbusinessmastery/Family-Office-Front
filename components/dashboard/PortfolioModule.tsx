"use client";

import type { CategoryOpportunity, PortfolioAsset } from "@/lib/types";
import { moduleCategories } from "./FamilyOfficeOverview";
import OpportunityInsightCard from "./OpportunityInsightCard";
import { ActionButton, EmptyState, MetricCard } from "@/components/ui/WealthUI";

type PortfolioProps = {
  portfolio: PortfolioAsset[];
  onDelete?: (id: number) => void;
  onUpdate?: (asset: PortfolioAsset) => void;
  onAdd?: (assetType?: string) => void;
  opportunities?: CategoryOpportunity[];
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const forexPrice = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const getAssetGain = (asset: PortfolioAsset) => Number(asset.gain ?? asset.pnl ?? 0);

const getAssetCost = (asset: PortfolioAsset) =>
  Number(
    asset.cost ??
      Number(asset.quantity || 0) * Number(asset.purchase_price || 0)
  );

const CategoryButtons = ({ onAdd }: { onAdd?: (assetType?: string) => void }) => {
  if (!onAdd) return null;

  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
      <p className="text-sm text-gray-400 mb-3">Rubriques disponibles</p>
      <div className="flex flex-wrap gap-2">
        {moduleCategories.map((category) => (
          <ActionButton
            key={category.key}
            onClick={() => onAdd(category.aliases[0])}
            variant="secondary"
            className="px-3 py-2 text-xs"
          >
            {category.label}
          </ActionButton>
        ))}
      </div>
    </div>
  );
};

export default function PortfolioModule({
  portfolio,
  onDelete,
  onUpdate,
  onAdd,
  opportunities = [],
}: PortfolioProps) {
  if (portfolio.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Portfolio Assets</h2>

          {onAdd && (
            <ActionButton onClick={() => onAdd()} icon="+">
              Ajouter un actif
            </ActionButton>
          )}
        </div>

        <EmptyState
          title="Aucun actif dans le portefeuille"
          description="Ajoute une premiere ligne pour suivre valeur, prix actuel et plus-value."
          action={
            onAdd ? (
              <ActionButton onClick={() => onAdd()} icon="+">
                Ajouter un actif
              </ActionButton>
            ) : null
          }
        />

        <CategoryButtons onAdd={onAdd} />
      </div>
    );
  }

  const total = portfolio.reduce(
    (acc, asset) => acc + getAssetValue(asset),
    0
  );
  const totalCost = portfolio.reduce(
    (acc, asset) => acc + getAssetCost(asset),
    0
  );
  const totalGain = total - totalCost;

  const getColor = (type: string) => {
    switch ((type || "").toUpperCase()) {
      case "STOCK":
        return "border-blue-500/30 bg-blue-500/10";
      case "CRYPTO":
        return "border-orange-500/30 bg-orange-500/10";
      case "FOREX":
      case "FX":
      case "CURRENCY":
      case "CURRENCIES":
        return "border-cyan-500/30 bg-cyan-500/10";
      case "REAL_ESTATE":
        return "border-green-500/30 bg-green-500/10";
      default:
        return "border-white/10 bg-white/5";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Portfolio Assets</h2>

        {onAdd && (
          <ActionButton onClick={() => onAdd()} icon="+">
            Ajouter un actif
          </ActionButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <MetricCard label="Valeur investie" value={`${money.format(totalCost)} EUR`} />
        <MetricCard
          label="Plus / moins-value"
          value={`${totalGain >= 0 ? "+" : ""}${money.format(totalGain)} EUR`}
          tone={totalGain >= 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Montant final enrichi"
          value={`${money.format(total)} EUR`}
          tone="primary"
        />
      </div>

      <CategoryButtons onAdd={onAdd} />

      {opportunities.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {opportunities.map((opportunity) => (
            <OpportunityInsightCard
              key={opportunity.key || opportunity.title}
              opportunity={opportunity}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {portfolio.map((asset) => {
          const assetType = asset.asset_type || asset.type || "N/A";
          const isForex = ["FOREX", "FX", "CURRENCY", "CURRENCIES"].includes(
            String(assetType).toUpperCase()
          );
          const assetName = asset.pair_name || asset.asset_name || asset.name || "Actif";
          const assetGain = getAssetGain(asset);
          const gainClass = assetGain >= 0 ? "text-emerald-400" : "text-red-400";

          return (
            <div
              key={asset.id}
              className={`rounded-2xl border p-5 ${getColor(assetType)}`}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{assetName}</h3>

                  <p className="text-xs text-gray-400 mt-1 uppercase">
                    {assetType}
                  </p>

                  {isForex && asset.currency_base && asset.currency_quote && (
                    <p className="mt-2 text-xs text-cyan-300">
                      Base {asset.currency_base} / Quote {asset.currency_quote}
                    </p>
                  )}

                  <div className="mt-4 space-y-1 text-sm text-gray-300">
                    <p>Quantite : {asset.quantity ?? 0}</p>
                    <p>
                      {isForex ? "Prix entree" : "Prix achat"} :{" "}
                      {isForex
                        ? forexPrice.format(Number(asset.purchase_price || 0))
                        : `${money.format(Number(asset.purchase_price || 0))} EUR`}
                    </p>
                    <p>
                      Prix actuel :{" "}
                      {isForex
                        ? forexPrice.format(Number(asset.current_price || 0))
                        : `${money.format(Number(asset.current_price || 0))} EUR`}
                    </p>
                    {asset.ticker && (
                      <p className="text-xs text-gray-500">
                        {asset.ticker} - {asset.source || "source inconnue"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Valeur</p>

                  <h3 className="text-2xl font-black text-[#3fa9f5] mt-1">
                    {money.format(getAssetValue(asset))} EUR
                  </h3>

                  <p className={`text-sm font-semibold mt-2 ${gainClass}`}>
                    {assetGain >= 0 ? "+" : ""}
                    {money.format(assetGain)} EUR
                    {asset.gain_percent !== undefined &&
                      ` (${Number(asset.gain_percent).toFixed(2)}%)`}
                  </p>

                  {(onUpdate || onDelete) && (
                    <div className="flex gap-2 mt-4 justify-end">
                      {onUpdate && (
                        <ActionButton
                          onClick={() => onUpdate(asset)}
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                        >
                          Modifier
                        </ActionButton>
                      )}

                      {onDelete && (
                        <ActionButton
                          onClick={() => onDelete(asset.id)}
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                        >
                          Supprimer
                        </ActionButton>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
