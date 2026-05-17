"use client";

import type { PortfolioAsset } from "@/lib/types";
import { moduleCategories } from "./FamilyOfficeOverview";

type PortfolioProps = {
  portfolio: PortfolioAsset[];
  onDelete?: (id: number) => void;
  onUpdate?: (asset: PortfolioAsset) => void;
  onAdd?: (assetType?: string) => void;
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const getAssetGain = (asset: PortfolioAsset) => Number(asset.gain ?? 0);

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
          <button
            key={category.key}
            onClick={() => onAdd(category.aliases[0])}
            className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm hover:border-[#3fa9f5]/60"
          >
            {category.label}
          </button>
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
}: PortfolioProps) {
  if (portfolio.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Portfolio Assets</h2>

          {onAdd && (
            <button
              onClick={() => onAdd()}
              className="bg-[#3fa9f5] hover:opacity-80 px-4 py-2 rounded-xl font-semibold"
            >
              + Ajouter un Asset
            </button>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400">Aucun actif dans le portfolio</p>
        </div>

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
  const gainClass = totalGain >= 0 ? "text-emerald-400" : "text-red-400";

  const getColor = (type: string) => {
    switch ((type || "").toUpperCase()) {
      case "STOCK":
        return "border-blue-500/30 bg-blue-500/10";
      case "CRYPTO":
        return "border-orange-500/30 bg-orange-500/10";
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
          <button
            onClick={() => onAdd()}
            className="bg-[#3fa9f5] hover:opacity-80 px-4 py-2 rounded-xl font-semibold"
          >
            + Ajouter un Asset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-gray-400 text-sm">Valeur investie</p>
          <h2 className="text-3xl font-black mt-2">
            {money.format(totalCost)} EUR
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-gray-400 text-sm">Plus / moins-value</p>
          <h2 className={`text-3xl font-black mt-2 ${gainClass}`}>
            {totalGain >= 0 ? "+" : ""}
            {money.format(totalGain)} EUR
          </h2>
        </div>

        <div className="rounded-2xl border border-[#3fa9f5]/30 bg-gradient-to-br from-[#3fa9f5]/20 to-black p-5">
          <p className="text-gray-400 text-sm">Montant final enrichi</p>
          <h2 className="text-3xl font-black text-[#3fa9f5] mt-2">
            {money.format(total)} EUR
          </h2>
        </div>
      </div>

      <CategoryButtons onAdd={onAdd} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {portfolio.map((asset) => {
          const assetType = asset.asset_type || asset.type || "N/A";
          const assetName = asset.asset_name || asset.name || "Actif";
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

                  <div className="mt-4 space-y-1 text-sm text-gray-300">
                    <p>Quantite : {asset.quantity ?? 0}</p>
                    <p>
                      Prix achat :{" "}
                      {money.format(Number(asset.purchase_price || 0))} EUR
                    </p>
                    <p>
                      Prix actuel :{" "}
                      {money.format(Number(asset.current_price || 0))} EUR
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
                        <button
                          onClick={() => onUpdate(asset)}
                          className="px-3 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm"
                        >
                          Modifier
                        </button>
                      )}

                      {onDelete && (
                        <button
                          onClick={() => onDelete(asset.id)}
                          className="px-3 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                        >
                          Supprimer
                        </button>
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
