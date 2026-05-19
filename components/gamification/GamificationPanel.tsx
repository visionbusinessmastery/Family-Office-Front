import type { GamificationData } from "@/lib/types";
import { normalizePlan, planAllows } from "@/lib/plans";

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
  const normalizedLevel = String(userLevel || "").toUpperCase();
  const advanced = score >= 70 || normalizedLevel === "ADVANCED";
  const legacyMode =
    planAllows(plan, "LEGACY") ||
    normalizedLevel === "LEGACY" ||
    normalizedLevel === "DYNASTY ARCHITECT";
  const currentPlan = normalizePlan(plan) || "FREE";
  const recommendedPlan =
    legacyMode
      ? "legacy"
      : normalizedLevel === "FAMILY OFFICE OPERATOR"
      ? "liberty"
      : normalizedLevel === "LIBERTY" || score >= 92
        ? "legacy"
      : advanced
        ? "elite"
        : gamification.upgrade?.recommended_plan || "gold";
  const canUpgrade =
    !planAllows(currentPlan, recommendedPlan);
  const actions =
    gamification.actions && gamification.actions.length > 0
      ? gamification.actions
      : advanced
        ? legacyMode
          ? [
              {
                title: "Transmission",
                description:
                  "Identifier un document, une regle ou une personne cle a securiser cette semaine.",
                xp: 80,
              },
              {
                title: "Protection",
                description:
                  "Verifier la concentration du risque et ce qui doit etre protege en priorite.",
                xp: 70,
              },
            ]
          : [
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
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-4 border border-gray-800 shadow-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-300">
            Progression
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Trajectoire personnelle
          </h2>
        </div>

        <div className="text-orange-400 text-sm font-semibold">
          {streak} jours
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex justify-between items-center gap-3">
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

      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
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

      {(actions.length > 0 || (onUpgrade && canUpgrade)) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">
              Missions du jour
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
              Prochain niveau
            </h3>

            <p className="text-white text-sm font-semibold">
              {gamification.upgrade?.title ||
                (recommendedPlan === "legacy"
                  ? "Passer en LEGACY - Dynasty Office"
                  : recommendedPlan === "liberty"
                  ? "Debloquer LIBERTY - Sovereign Wealth"
                  : recommendedPlan === "elite"
                  ? "Debloquer ELITE - Wealth OS"
                  : "Debloquer GOLD - Growth")}
            </p>

            <p className="text-gray-400 text-xs mt-2">
              {gamification.upgrade?.description ||
                (legacyMode
                  ? "Tu es dans une phase de preservation, de gouvernance et de transmission."
                  : "Ton niveau actuel justifie un espace plus avance pour accelerer, proteger et transmettre ton capital.")}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs text-gray-500">
                Plan actuel: {plan || "FREE"}
              </span>

              {onUpgrade && canUpgrade && (
                <button
                  onClick={() => onUpgrade(recommendedPlan)}
                  className="rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-semibold text-white"
                >
                  Explorer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
