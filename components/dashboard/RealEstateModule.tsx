"use client";

import type {
  RealEstateAsset,
  CategoryOpportunity,
  RealEstateData,
  RealEstateType,
} from "@/lib/types";
import OpportunityInsightCard from "./OpportunityInsightCard";

type RealEstateModuleProps = {
  data?: RealEstateData | null;
  onAdd?: (type: RealEstateType) => void;
  onUpdate?: (asset: RealEstateAsset) => void;
  onDelete?: (id: number) => void;
  opportunity?: CategoryOpportunity;
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const propertyTypes: Array<{
  key: RealEstateType;
  title: string;
  description: string;
}> = [
  {
    key: "primary_residence",
    title: "Residence principale",
    description: "Prix d'achat, valeur estimee et plus-value latente.",
  },
  {
    key: "flip",
    title: "Achat revente",
    description: "Prix d'achat, prix de revente cible et marge potentielle.",
  },
  {
    key: "rental",
    title: "Locatif",
    description: "Rentabilite locative nette et valeur patrimoniale.",
  },
];

const numberValue = (value?: number | string | null) => Number(value || 0);

const formatMoney = (value?: number | string | null) =>
  `${money.format(numberValue(value))} EUR`;

const formatPercent = (value?: number | string | null) =>
  `${numberValue(value).toFixed(2)}%`;

export default function RealEstateModule({
  data,
  onAdd,
  onUpdate,
  onDelete,
  opportunity,
}: RealEstateModuleProps) {
  const assets = data?.assets || [];
  const totals = data?.totals || {};
  const potentialGain = numberValue(totals.total_potential_gain);
  const gainClass = potentialGain >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Immobilier</h2>
          <p className="text-sm text-gray-400">
            Une categorie dediee pour suivre les biens, les plus-values et le
            rendement locatif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Investissement initial</p>
          <h3 className="text-xl font-black mt-1">
            {formatMoney(totals.total_purchase)}
          </h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Valeur estimee / cible</p>
          <h3 className="text-xl font-black mt-1 text-[#3fa9f5]">
            {formatMoney(totals.total_estimated_value)}
          </h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Plus-value potentielle</p>
          <h3 className={`text-xl font-black mt-1 ${gainClass}`}>
            {potentialGain >= 0 ? "+" : ""}
            {formatMoney(totals.total_potential_gain)}
          </h3>
          <p className={gainClass}>
            {formatPercent(totals.total_potential_gain_percent)}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Rentabilite locative moyenne</p>
          <h3 className="text-xl font-black mt-1">
            {formatPercent(totals.average_rental_yield)}
          </h3>
        </div>
      </div>

      <div className="mb-5">
        <OpportunityInsightCard opportunity={opportunity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {propertyTypes.map((type) => {
          const categoryAssets = assets.filter(
            (asset) => asset.property_type === type.key
          );

          return (
            <div
              key={type.key}
              className="border border-white/10 rounded-2xl bg-white/5 p-4 min-h-[320px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{type.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {type.description}
                  </p>
                </div>

                {onAdd && (
                  <button
                    onClick={() => onAdd(type.key)}
                    className="shrink-0 bg-[#3fa9f5] px-3 py-2 rounded-xl text-sm font-semibold"
                  >
                    Ajouter
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {categoryAssets.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucun bien dans cette categorie.
                  </p>
                ) : (
                  categoryAssets.map((asset) => {
                    const assetGain = numberValue(asset.potential_gain);
                    const assetGainClass =
                      assetGain >= 0 ? "text-emerald-400" : "text-red-400";

                    return (
                      <div
                        key={asset.id}
                        className="rounded-xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <h4 className="font-bold">{asset.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">
                              Achat {formatMoney(asset.purchase_price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">
                              Valeur cible
                            </p>
                            <p className="font-black text-[#3fa9f5]">
                              {formatMoney(asset.target_value)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Plus-value</p>
                            <p className={`font-semibold ${assetGainClass}`}>
                              {assetGain >= 0 ? "+" : ""}
                              {formatMoney(asset.potential_gain)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">Performance</p>
                            <p className={assetGainClass}>
                              {formatPercent(asset.potential_gain_percent)}
                            </p>
                          </div>

                          {asset.property_type === "rental" && (
                            <>
                              <div>
                                <p className="text-gray-500">Loyer mensuel</p>
                                <p>{formatMoney(asset.monthly_rent)}</p>
                              </div>

                              <div>
                                <p className="text-gray-500">Rendement net</p>
                                <p>{formatPercent(asset.rental_yield)}</p>
                              </div>
                            </>
                          )}

                          {asset.property_type === "flip" && (
                            <div>
                              <p className="text-gray-500">Revente cible</p>
                              <p>{formatMoney(asset.resale_price)}</p>
                            </div>
                          )}
                        </div>

                        {asset.notes && (
                          <p className="text-xs text-gray-400 mt-3">
                            {asset.notes}
                          </p>
                        )}

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
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
