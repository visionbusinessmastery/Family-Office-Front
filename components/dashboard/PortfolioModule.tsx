"use client";

import type { PortfolioAsset } from "@/lib/types";

type PortfolioProps = {
  portfolio: PortfolioAsset[];
  onDelete?: (id: number) => void;
  onUpdate?: (asset: PortfolioAsset) => void;
  onAdd?: () => void;
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const getAssetGain = (asset: PortfolioAsset) => Number(asset.gain ?? 0);

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
              onClick={onAdd}
              className="bg-[#3fa9f5] hover:opacity-80 px-4 py-2 rounded-xl font-semibold"
            >
              + Ajouter un Asset
            </button>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400">Aucun actif dans le portfolio</p>
        </div>
      </div>
    );
  }

  const total = portfolio.reduce(
    (acc, asset) => acc + getAssetValue(asset),
    0
  );

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
            onClick={onAdd}
            className="bg-[#3fa9f5] hover:opacity-80 px-4 py-2 rounded-xl font-semibold"
          >
            + Ajouter un Asset
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-[#3fa9f5]/30 bg-gradient-to-br from-[#3fa9f5]/20 to-black p-6">
        <p className="text-gray-400 text-sm">Valeur totale</p>

        <h2 className="text-4xl font-black text-[#3fa9f5] mt-2">
          {money.format(total)} EUR
        </h2>
      </div>

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
