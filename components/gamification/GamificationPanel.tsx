import type { GamificationData } from "@/lib/types";

type GamificationProps = {
  gamification?: GamificationData;
};

export default function GamificationPanel({
  gamification,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">AI Coach</h3>

          <p className="text-gray-300 text-sm leading-relaxed">
            {gamification.ai_coach?.message ||
              "Continue tes actions pour ameliorer ton score et debloquer des recompenses."}
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Notification
          </h3>

          <p className="text-white text-sm">
            {gamification.notification?.title || "Aucune notification"}
          </p>

          {gamification.notification?.message && (
            <p className="text-gray-400 text-xs mt-1">
              {gamification.notification.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
