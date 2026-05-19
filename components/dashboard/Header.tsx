import type { DashboardSummary } from "@/lib/types";

type HeaderProps = {
  dashboard: DashboardSummary | null;
  onUpgrade?: (plan: string) => void;
};

const planRank: Record<string, number> = {
  FREE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
  ELITE: 4,
};

const normalizePlan = (plan?: string | null) => {
  const value = String(plan || "").toUpperCase();

  if (value === "FOUNDATION") return "FREE";
  if (value === "GROWTH") return "GOLD";
  if (["WEALTH_OS", "LIBERTY", "LIBERTY_LEGACY"].includes(value)) return "ELITE";

  return value in planRank ? value : "";
};

const getNextPlan = (plan: string) => {
  if (!plan || planRank[plan] < planRank.GOLD) return "gold";
  if (planRank[plan] < planRank.ELITE) return "elite";
  return null;
};

export default function Header({ dashboard, onUpgrade }: HeaderProps) {
  const plan = normalizePlan(dashboard?.plan);
  const level = dashboard?.level || null;
  const nextPlan = getNextPlan(plan);
  const ctaLabel = nextPlan === "elite" ? "Debloquer ELITE" : "Debloquer GOLD";

  const getPlanStyle = (value: string) => {
    switch (value) {
      case "SILVER":
        return "bg-gray-400 text-yellow-200";
      case "GOLD":
        return "bg-yellow-500 text-black";
      case "ELITE":
        return "bg-black text-yellow-400";
      case "FREE":
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getLevelStyle = (value: string) => {
    switch (value) {
      case "BEGINNER":
        return "bg-blue-400 text-white";
      case "INTERMEDIATE":
        return "bg-gray-400 text-yellow-200";
      case "ADVANCED":
        return "bg-yellow-500 text-black";
      case "ELITE":
        return "bg-black text-yellow-400";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-[0.18em] text-white sm:text-3xl">
          WHITE ROCK
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#3fa9f5] sm:text-sm">
          Wealth Operating System
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-right text-sm text-white/60">
        {plan ? (
          <div className="hidden space-y-1 sm:block">
            <div>
              Plan:{" "}
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${getPlanStyle(
                  plan
                )}`}
              >
                {plan}
              </span>
            </div>

            {level && (
              <div>
                Statut:{" "}
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${getLevelStyle(
                    level
                  )}`}
                >
                  {level}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden h-8 w-28 animate-pulse rounded-lg bg-white/10 sm:block" />
        )}

        {nextPlan && onUpgrade && (
          <button
            onClick={() => onUpgrade(nextPlan)}
            className="rounded-xl border border-[#3fa9f5]/40 bg-[#3fa9f5] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2d91d5] sm:px-4"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
