"use client";

import type {
  CategoryOpportunity,
  RealEstateAsset,
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
    title: "Residences",
    description:
      "Residence principale, secondaire ou partagee, avec valeur estimee et plus-value latente.",
  },
  {
    key: "rental",
    title: "Locatif",
    description: "Rentabilite locative nette, loyers et valeur patrimoniale.",
  },
  {
    key: "flip",
    title: "Achat-revente",
    description: "Prix d'achat, prix de revente cible et marge potentielle.",
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
  const totalPurchase = numberValue(totals.total_purchase);
  const totalValue = numberValue(totals.total_estimated_value);
  const potentialGain = numberValue(totals.total_potential_gain);
  const globalPerformance = numberValue(totals.total_potential_gain_percent);
  const rentalYield = numberValue(totals.average_rental_yield);
  const canAddAsset = !access || access.is_unlimited || numberValue(access.remaining) > 0;
  const accessLine = access
    ? access.is_unlimited
      ? `${access.depth_label || "Lecture avancee"} - biens illimites`
      : `${access.depth_label || "Lecture"} - ${access.count || 0}/${access.limit} biens`
    : null;

  const synthesis =
    assets.length === 0
      ? "Aucun bien immobilier n'est encore suivi. Ajoute un premier actif pour obtenir une lecture patrimoniale fiable."
      : potentialGain >= 0
        ? "Ton immobilier presente une plus-value latente positive. La lecture utile consiste maintenant a distinguer residence, rendement locatif et operation d'achat-revente."
        : "Ton immobilier demande une lecture prudente: la valeur cible reste inferieure au prix d'achat consolide.";

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Patrimoine immobilier
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Biens, valeur et performance
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">
            {synthesis}
          </p>
          {accessLine && (
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-emerald-300">
              {accessLine}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-4 lg:w-80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8bd0ff]">
            Insight immobilier
          </p>
          <div className="mt-3">
            <OpportunityInsightCard opportunity={opportunity} variant="compact" />
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Valeur totale" value={formatMoney(totalValue)} tone="primary" />
        <MetricCard
          label="Plus-value latente"
          value={`${potentialGain >= 0 ? "+" : ""}${formatMoney(potentialGain)}`}
          tone={potentialGain >= 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Performance globale"
          value={formatPercent(globalPerformance)}
        />
        <MetricCard label="Rendement locatif" value={formatPercent(rentalYield)} />
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Performance
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Lecture consolidee du portefeuille immobilier
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Achat {formatMoney(totalPurchase)} - valeur {formatMoney(totalValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {propertyTypes.map((type) => {
          const categoryAssets = assets.filter(
            (asset) => asset.property_type === type.key
          );

          return (
            <div
              key={type.key}
              className="min-h-[320px] rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{type.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">
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
                    title={
                      canAddAsset
                        ? "Aucun bien suivi"
                        : `${type.title} en apercu limite`
                    }
                    description={
                      canAddAsset
                        ? "Ajoute un actif pour suivre achat, valeur, plus-value et performance."
                        : "Disponible avec un niveau de suivi superieur. La page conserve la lecture existante sans creer de fausse donnee."
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
                      <article
                        key={asset.id}
                        className="rounded-xl border border-white/10 bg-black/30 p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <h4 className="font-bold">{asset.name}</h4>
                            <p className="mt-1 text-xs text-gray-400">
                              Achat {formatMoney(asset.purchase_price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Valeur</p>
                            <p className="font-black text-[#3fa9f5]">
                              {formatMoney(asset.target_value)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
                          <p className="mt-3 text-xs text-gray-400">
                            {asset.notes}
                          </p>
                        )}

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
