"use client";

import type { CategoryOpportunity, PortfolioAsset } from "@/lib/types";
import { moduleCategories } from "./FamilyOfficeOverview";
import OpportunityInsightCard from "./OpportunityInsightCard";
import { ActionButton, EmptyState } from "@/components/ui/WealthUI";

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

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const getAssetGain = (asset: PortfolioAsset) => Number(asset.gain ?? asset.pnl ?? 0);

const normalizeType = (asset: PortfolioAsset) =>
  String(asset.asset_type || asset.type || "Autre")
    .replace(/_/g, " ")
    .toUpperCase();

const getColor = (type: string) => {
  switch ((type || "").toUpperCase()) {
    case "STOCK":
    case "STOCKS":
      return "border-blue-500/30 bg-blue-500/10";
    case "CRYPTO":
      return "border-orange-500/30 bg-orange-500/10";
    case "ETF":
      return "border-emerald-500/30 bg-emerald-500/10";
    case "FOREX":
    case "FX":
    case "CURRENCY":
    case "CURRENCIES":
      return "border-cyan-500/30 bg-cyan-500/10";
    case "COMMODITIES":
    case "COMMODITY":
      return "border-amber-500/30 bg-amber-500/10";
    default:
      return "border-white/10 bg-white/5";
  }
};

const CategoryButtons = ({ onAdd }: { onAdd?: (assetType?: string) => void }) => {
  if (!onAdd) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-sm text-gray-400">Ajouter une position</p>
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Portfolio Overview
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">Aucune position suivie</h2>
          </div>

          {onAdd && (
            <ActionButton onClick={() => onAdd()} icon="+">
              Ajouter un actif
            </ActionButton>
          )}
        </div>

        <EmptyState
          title="Aucun actif dans le portefeuille"
          description="Ajoute une premiere ligne pour suivre valeur, allocation et performance."
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

  const total = portfolio.reduce((acc, asset) => acc + getAssetValue(asset), 0);
  const displayedHoldings = portfolio
    .filter((asset) => getAssetValue(asset) > 0)
    .sort((a, b) => getAssetValue(b) - getAssetValue(a));
  const hiddenZeroPositions = portfolio.length - displayedHoldings.length;
  const primaryOpportunity = opportunities[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Portfolio Overview
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Portefeuille d'investissement
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">
            Lecture rapide des positions, de la performance globale et de la
            concentration principale.
          </p>
        </div>

        {onAdd && (
          <ActionButton onClick={() => onAdd()} icon="+">
            Ajouter un actif
          </ActionButton>
        )}
      </div>

      <section className="rounded-2xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#8bd0ff]">
              Investment Intelligence
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Signal principal du portefeuille
            </h3>
          </div>
          <OpportunityInsightCard opportunity={primaryOpportunity} variant="compact" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Holdings
            </p>
            <h3 className="text-xl font-bold text-white">Positions suivies</h3>
          </div>
          {hiddenZeroPositions > 0 && (
            <p className="text-xs text-gray-500">
              {hiddenZeroPositions} position(s) sans valeur masquee(s)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {displayedHoldings.map((asset) => {
            const assetType = normalizeType(asset);
            const assetName =
              asset.pair_name || asset.asset_name || asset.name || "Actif";
            const assetGain = getAssetGain(asset);
            const assetValue = getAssetValue(asset);
            const weight = total > 0 ? (assetValue / total) * 100 : 0;
            const gainClass = assetGain >= 0 ? "text-emerald-400" : "text-red-400";

            return (
              <article
                key={asset.id}
                className={`rounded-2xl border p-5 ${getColor(assetType)}`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{assetName}</h3>
                    <p className="mt-1 text-xs uppercase text-gray-400">
                      {assetType}
                    </p>
                    {asset.quantity !== undefined && (
                      <p className="mt-3 text-sm text-gray-300">
                        Quantite : {asset.quantity}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">Valeur</p>
                    <h3 className="mt-1 text-2xl font-black text-[#3fa9f5]">
                      {money.format(assetValue)} EUR
                    </h3>
                    <p className={`mt-2 text-sm font-semibold ${gainClass}`}>
                      {assetGain >= 0 ? "+" : ""}
                      {money.format(assetGain)} EUR
                      {asset.gain_percent !== undefined &&
                        ` (${Number(asset.gain_percent).toFixed(2)}%)`}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Poids {weight.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${Math.min(weight, 100)}%` }}
                  />
                </div>

                {(onUpdate || onDelete) && (
                  <div className="mt-4 flex justify-end gap-2">
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
              </article>
            );
          })}
        </div>
      </section>

      <CategoryButtons onAdd={onAdd} />
    </div>
  );
}
