"use client";

import type { ProductContext, ProductModule } from "@/lib/types";

type ProductProgressPanelProps = {
  product?: ProductContext | null;
  onUpgrade?: (plan: string) => void;
};

const stageLabels: Record<number, string> = {
  1: "Foundation",
  2: "Diversification",
  3: "Assets",
  4: "Business",
  5: "Pilotage",
  6: "Wealth OS",
  7: "Live Sync",
};

function ModulePill({ module }: { module: ProductModule }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
      <p className="text-sm font-semibold text-white">{module.label}</p>
      <p className="text-xs text-gray-500">{stageLabels[module.stage] || "Module"}</p>
    </div>
  );
}

export default function ProductProgressPanel({
  product,
  onUpgrade,
}: ProductProgressPanelProps) {
  if (!product) return null;

  const progression = product.progression || {};
  const entitlements = product.entitlements || {};
  const visible = product.modules?.visible || [];
  const locked = product.modules?.locked || [];
  const missions = product.missions || [];
  const completion = product.data_profile?.completion_percent || 0;
  const plan = product.plan || entitlements.plan || "charge";

  return (
    <section className="rounded-2xl border border-[#3fa9f5]/20 bg-zinc-950 p-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
            Progression patrimoniale
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {progression.level || "Builder"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {entitlements.copy?.promise || "Construis une progression patrimoniale claire."}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-gray-500">Plan</p>
              <p className="font-bold text-white">{plan}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-gray-500">Statut</p>
              <p className="font-bold text-white">{progression.status || "Foundation"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-gray-500">Completion</p>
              <p className="font-bold text-white">{completion}%</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#3fa9f5]"
                style={{ width: `${progression.progress_percent || 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {progression.xp || 0} XP / {progression.next_level_xp || 1000} XP
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {missions.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-white">Prochaines actions</h3>
                <span className="text-xs text-gray-500">Guidance douce</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {missions.map((mission) => (
                  <article
                    key={mission.key}
                    className="rounded-xl border border-white/10 bg-black/30 p-3"
                  >
                    <p className="text-sm font-semibold text-white">{mission.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{mission.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {mission.xp ? (
                        <span className="text-xs font-bold text-emerald-300">
                          +{mission.xp} XP
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Upgrade</span>
                      )}
                      {mission.recommended_plan && onUpgrade && (
                        <button
                          onClick={() => onUpgrade(mission.recommended_plan || "gold")}
                          className="rounded-lg bg-[#3fa9f5] px-3 py-1 text-xs font-semibold text-white"
                        >
                          Voir
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-bold text-white">Espaces ouverts</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {visible.slice(0, 6).map((module) => (
                  <ModulePill key={module.key} module={module} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-white">Prochaines etapes</h3>
              <div className="space-y-2">
                {locked.slice(0, 3).map((module) => (
                  <div
                    key={module.key}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-200">{module.label}</p>
                      <span className="text-xs text-[#3fa9f5]">{module.required_plan}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{module.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
