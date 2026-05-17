"use client";

import type { YieldAsset, YieldAssetData, YieldAssetType } from "@/lib/types";

type Props = {
  data?: YieldAssetData | null;
  onAdd?: (type: YieldAssetType) => void;
  onUpdate?: (asset: YieldAsset) => void;
  onDelete?: (id: number) => void;
};

const money = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const n = (value?: number | string | null) => Number(value || 0);

const types: Array<{ key: YieldAssetType; label: string }> = [
  { key: "crowdfunding", label: "Crowdfunding" },
  { key: "private_equity", label: "Private Equity" },
];

export default function YieldInvestmentsModule({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const assets = data?.assets || [];
  const totals = data?.totals || {};

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Prets & Private Equity</h2>
        <p className="text-sm text-gray-400">
          Taux moyen, plus-value projetee et montant final enrichi.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Capital prete / investi</p>
          <h3 className="text-xl font-black">
            {money.format(n(totals.total_principal))} EUR
          </h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Taux moyen</p>
          <h3 className="text-xl font-black">{n(totals.average_rate).toFixed(2)}%</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Plus-value projetee</p>
          <h3 className="text-xl font-black text-emerald-400">
            +{money.format(n(totals.total_projected_gain))} EUR
          </h3>
        </div>
        <div className="bg-[#3fa9f5]/10 border border-[#3fa9f5]/30 rounded-2xl p-4">
          <p className="text-xs text-gray-400">Montant final enrichi</p>
          <h3 className="text-xl font-black text-[#3fa9f5]">
            {money.format(n(totals.total_final_value))} EUR
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {types.map((type) => {
          const rows = assets.filter((asset) => asset.asset_type === type.key);

          return (
            <div key={type.key} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-bold">{type.label}</h3>
                {onAdd && (
                  <button
                    onClick={() => onAdd(type.key)}
                    className="bg-[#3fa9f5] px-3 py-2 rounded-xl text-sm font-semibold"
                  >
                    Ajouter
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {rows.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun asset.</p>
                ) : (
                  rows.map((asset) => (
                    <article key={asset.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h4 className="font-bold">{asset.name}</h4>
                          <p className="text-xs text-gray-400">
                            {money.format(n(asset.principal))} EUR a {n(asset.average_rate).toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Final</p>
                          <p className="font-black text-[#3fa9f5]">
                            {money.format(n(asset.final_value))} EUR
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-emerald-400">
                        +{money.format(n(asset.projected_gain))} EUR projetes
                      </p>
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

