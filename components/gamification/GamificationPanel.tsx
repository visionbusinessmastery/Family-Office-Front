import type { GamificationData } from "@/lib/types";

type GamificationProps = {
  gamification?: GamificationData;
  score?: number;
  userLevel?: string;
  plan?: string;
  onUpgrade?: (plan: string) => void;
};

export default function GamificationPanel({
  gamification,
  score = 0,
  userLevel,
  plan,
  onUpgrade,
}: GamificationProps) {
  if (!gamification) return null;

  const xp = Number(gamification.xp || 0);
  const xpToNextLevel = 1000;
  const level =
    gamification.level ?? Math.max(1, Math.floor(xp / xpToNextLevel) + 1);
  const streak = gamification.streak || 0;
  const badges = Array.isArray(gamification.badges)
    ? gamification.badges
    : [];
  const progress = xp % xpToNextLevel;
  const progressPercent = Math.min(100, (progress / xpToNextLevel) * 100);
  const advanced = score >= 70 || String(userLevel || "").toUpperCase() === "ADVANCED";
  const recommendedPlan =
    String(userLevel || "").toUpperCase() === "FAMILY OFFICE OPERATOR"
      ? "elite"
      : advanced
        ? "elite"
        : gamification.upgrade?.recommended_plan || "gold";
  const actions =
    gamification.actions && gamification.actions.length > 0
      ? gamification.actions
      : advanced
        ? [
            {
              title: "Mission Advanced",
              description:
                "Choisir une opportunite prioritaire et definir une action executable en 7 jours.",
              xp: 150,
            },
            {
              title: "Optimisation portefeuille",
              description:
                "Verifier la plus forte exposition et reduire le risque si elle depasse ton seuil.",
              xp: 120,
            },
          ]
        : [];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Gamification Hub</h2>

        <div className="text-orange-400 text-sm font-semibold">
          {streak} jours
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Level {level}</h3>

          <span className="text-green-400 font-bold">{xp} XP</span>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-3 mt-3 overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-2">
          {progress} / {xpToNextLevel} XP avant le prochain level
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">Badges</h3>

          {badges.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun badge debloque pour le moment.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <div
                  key={`${badge}-${index}`}
                  className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300"
                >
                  {badge}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            Reward Unlocked
          </h3>

          <p className="text-white text-sm">
            {gamification.reward?.title || "Aucune reward debloquee actuellement"}
          </p>

          {gamification.reward?.description && (
            <p className="text-gray-400 text-xs mt-1">
              {gamification.reward.description}
            </p>
          )}
        </div>
      </div>

      {(actions.length > 0 || onUpgrade) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">
              Actions gamifiees
            </h3>

            <div className="space-y-3">
              {actions.map((action, index) => (
                <div
                  key={`${action.title}-${index}`}
                  className="rounded-lg border border-white/10 bg-black/30 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{action.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {action.description}
                      </p>
                    </div>
                    {action.xp && (
                      <span className="text-xs font-bold text-emerald-300">
                        +{action.xp} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#3fa9f5]/10 border border-[#3fa9f5]/30 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-[#3fa9f5] mb-2">
              Upgrade recommande
            </h3>

            <p className="text-white text-sm font-semibold">
              {gamification.upgrade?.title ||
                (recommendedPlan === "elite"
                  ? "Passer au plan Elite - Wealth OS"
                  : "Passer au plan Gold - Growth")}
            </p>

            <p className="text-gray-400 text-xs mt-2">
              {gamification.upgrade?.description ||
                "Ton niveau actuel justifie un accompagnement plus avance pour accelerer, proteger et transmettre ton capital."}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs text-gray-500">
                Plan actuel: {plan || "FREE"}
              </span>

              {onUpgrade && (
                <button
                  onClick={() => onUpgrade(recommendedPlan)}
                  className="rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-semibold text-white"
                >
                  Voir l&apos;abonnement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
