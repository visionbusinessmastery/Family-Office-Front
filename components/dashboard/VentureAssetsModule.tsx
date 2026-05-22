"use client";

import type {
  CategoryOpportunity,
  VentureAsset,
  VentureAssetData,
  VentureAssetType,
} from "@/lib/types";
import OpportunityInsightCard from "./OpportunityInsightCard";
import { ActionButton, EmptyState, MetricCard } from "@/components/ui/WealthUI";

type Props = {
  data?: VentureAssetData | null;
  onAdd?: (type: VentureAssetType) => void;
  onUpdate?: (asset: VentureAsset) => void;
  onDelete?: (id: number) => void;
  opportunities?: CategoryOpportunity[];
};

const money = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const n = (value?: number | string | null) => Number(value || 0);

const types: Array<{ key: VentureAssetType; label: string }> = [
  { key: "ai_business", label: "Business digital" },
  { key: "business", label: "Business" },
  { key: "startup", label: "Startup" },
  { key: "franchise", label: "Franchise" },
];

export default function VentureAssetsModule({
  data,
  onAdd,
  onUpdate,
  onDelete,
  opportunities = [],
}: Props) {
  const assets = data?.assets || [];
  const totals = data?.totals || {};

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Business & Ventures</h2>
        <p className="text-sm text-gray-400">
          CA, charges, resultat, dettes, levees et valorisation.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Chiffre d'affaires" value={`${money.format(n(totals.total_revenue))} EUR`} />
        <MetricCard label="Charges" value={`${money.format(n(totals.total_charges))} EUR`} />
        <MetricCard
          label="Resultat"
          value={`${n(totals.total_result) >= 0 ? "+" : ""}${money.format(n(totals.total_result))} EUR`}
          tone={n(totals.total_result) >= 0 ? "success" : "danger"}
        />
        <MetricCard label="Levees - dettes" value={`${money.format(n(totals.total_fundraising) - n(totals.total_debts))} EUR`} />
        <MetricCard label="Valorisation / final" value={`${money.format(n(totals.total_final_value))} EUR`} tone="primary" />
      </div>

      <div className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-200">
              Rachat d&apos;entreprise
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Reprise et fonds de commerce
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Ces volets utilisent la rubrique Business existante pour rester compatibles avec le moteur actuel.
            </p>
          </div>
          {onAdd && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <ActionButton onClick={() => onAdd("business")} variant="secondary">
                Rachat / Reprise
              </ActionButton>
              <ActionButton onClick={() => onAdd("business")} variant="secondary">
                Fonds de commerce
              </ActionButton>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {types.map((type) => {
          const rows = assets.filter((asset) => asset.asset_type === type.key);
          const opportunity = opportunities.find(
            (item) => item.key === type.key
          );

          return (
            <div key={type.key} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold">{type.label}</h3>
                {onAdd && (
                  <ActionButton onClick={() => onAdd(type.key)} icon="+">
                    Ajouter
                  </ActionButton>
                )}
              </div>

              <div className="space-y-3">
                <OpportunityInsightCard opportunity={opportunity} />

                {rows.length === 0 ? (
                  <EmptyState
                    title="Aucun business"
                    description="Ajoute une ligne pour suivre CA, charges, resultat et valorisation."
                    action={
                      onAdd ? (
                        <ActionButton onClick={() => onAdd(type.key)} icon="+">
                          Ajouter
                        </ActionButton>
                      ) : null
                    }
                  />
                ) : (
                  rows.map((asset) => {
                    const assetResultClass = n(asset.result) >= 0 ? "text-emerald-400" : "text-red-400";

                    return (
                      <article key={asset.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                        <div className="flex justify-between gap-3">
                          <div>
                            <h4 className="font-bold">{asset.name}</h4>
                            <p className="text-xs text-gray-400">
                              CA {money.format(n(asset.revenue))} EUR - charges {money.format(n(asset.charges))} EUR
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Final</p>
                            <p className="font-black text-[#3fa9f5]">
                              {money.format(n(asset.final_value))} EUR
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                          <p className={assetResultClass}>
                            Resultat {n(asset.result) >= 0 ? "+" : ""}
                            {money.format(n(asset.result))} EUR
                          </p>
                          <p>Levee {money.format(n(asset.fundraising))} EUR</p>
                          <p>Dettes {money.format(n(asset.debts))} EUR</p>
                        </div>
                        {(onUpdate || onDelete) && (
                          <div className="flex justify-end gap-2 mt-4">
                            {onUpdate && (
                              <ActionButton onClick={() => onUpdate(asset)} variant="secondary" className="px-3 py-1.5 text-xs">
                                Modifier
                              </ActionButton>
                            )}
                            {onDelete && (
                              <ActionButton onClick={() => onDelete(asset.id)} variant="danger" className="px-3 py-1.5 text-xs">
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
