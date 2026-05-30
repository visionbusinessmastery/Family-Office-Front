"use client";

import type {
  RealEstateAsset,
  CategoryOpportunity,
  RealEstateData,
  RealEstateType,
} from "@/lib/types";
import OpportunityInsightCard from "./OpportunityInsightCard";
import { ActionButton, EmptyState, MetricCard } from "@/components/ui/WealthUI";

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
    title: "Résidences",
    description: "Résidence principale, secondaire ou partagée, avec valeur estimée et plus-value latente.",
  },
  {
    key: "flip",
    title: "Achat-revente",
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
  const access = data?.access;
  const potentialGain = numberValue(totals.total_potential_gain);
  const canAddAsset = !access || access.is_unlimited || numberValue(access.remaining) > 0;
  const accessLine = access
    ? access.is_unlimited
      ? `${access.depth_label || "Lecture avancee"} · biens illimites`
      : `${access.depth_label || "Lecture"} · ${access.count || 0}/${access.limit} biens`
    : null;

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Immobilier</h2>
          <p className="text-sm text-gray-400">
            Une catégorie dédiée pour suivre les biens, les plus-values et le
            rendement locatif.
          </p>
          {accessLine && (
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
              {accessLine}
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Achat" value={formatMoney(totals.total_purchase)} />
        <MetricCard
          label="Valeur cible"
          value={formatMoney(totals.total_estimated_value)}
          tone="primary"
        />
        <MetricCard
          label="Plus-value"
          value={`${potentialGain >= 0 ? "+" : ""}${formatMoney(totals.total_potential_gain)}`}
          tone={potentialGain >= 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Performance locative"
          value={formatPercent(totals.average_rental_yield)}
        />
        <MetricCard
          label="Performance globale"
          value={formatPercent(totals.total_potential_gain_percent)}
        />
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

                {onAdd && canAddAsset && (
                  <ActionButton
                    onClick={() => onAdd(type.key)}
                    className="shrink-0"
                    icon="+"
                  >
                    Ajouter
                  </ActionButton>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {categoryAssets.length === 0 ? (
                  <EmptyState
                    title="Aucun bien"
                    description={
                      canAddAsset
                        ? "Ajoute un premier actif pour suivre achat, valeur cible et performance."
                        : "La limite du plan actuel est atteinte pour les biens immobiliers."
                    }
                    action={
                      onAdd && canAddAsset ? (
                        <ActionButton onClick={() => onAdd(type.key)} icon="+">
                          Ajouter
                        </ActionButton>
                      ) : null
                    }
                  />
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
