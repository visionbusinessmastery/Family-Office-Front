"use client";

import type {
  CategoryOpportunity,
  VentureAsset,
  VentureAssetData,
  VentureAssetType,
} from "@/lib/types";
import OpportunityInsightCard from "./OpportunityInsightCard";

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
  { key: "ai_business", label: "AI Business" },
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
  const resultClass = n(totals.total_result) >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Business & Ventures</h2>
        <p className="text-sm text-gray-400">
          CA, charges, resultat, dettes, levees et valorisation.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Chiffre d&apos;affaires</p>
          <h3 className="text-xl font-black">{money.format(n(totals.total_revenue))} EUR</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Charges</p>
          <h3 className="text-xl font-black">{money.format(n(totals.total_charges))} EUR</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Resultat</p>
          <h3 className={`text-xl font-black ${resultClass}`}>
            {n(totals.total_result) >= 0 ? "+" : ""}
            {money.format(n(totals.total_result))} EUR
          </h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Levees - dettes</p>
          <h3 className="text-xl font-black">
            {money.format(n(totals.total_fundraising) - n(totals.total_debts))} EUR
          </h3>
        </div>
        <div className="bg-[#3fa9f5]/10 border border-[#3fa9f5]/30 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Valorisation / final</p>
          <h3 className="text-xl font-black text-[#3fa9f5]">
            {money.format(n(totals.total_final_value))} EUR
          </h3>
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
                  <button onClick={() => onAdd(type.key)} className="bg-[#3fa9f5] px-3 py-2 rounded-xl text-sm font-semibold">
                    Ajouter
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <OpportunityInsightCard opportunity={opportunity} />

                {rows.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun business.</p>
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
                              <button onClick={() => onUpdate(asset)} className="px-3 py-1 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm">
                                Modifier
                              </button>
                            )}
                            {onDelete && (
                              <button onClick={() => onDelete(asset.id)} className="px-3 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                                Supprimer
                              </button>
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
