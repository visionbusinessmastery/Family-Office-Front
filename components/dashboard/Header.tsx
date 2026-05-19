import type { DashboardSummary } from "@/lib/types";
import BrandMark from "@/components/BrandMark";

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
  LIBERTY: 5,
};

const normalizePlan = (plan?: string | null) => {
  const value = String(plan || "").toUpperCase();

  if (value === "FOUNDATION") return "FREE";
  if (value === "GROWTH") return "GOLD";
  if (["WEALTH_OS", "LIBERTY_LEGACY"].includes(value)) return "ELITE";

  return value in planRank ? value : "";
};

const getNextPlan = (plan: string) => {
  if (!plan || planRank[plan] < planRank.GOLD) return "gold";
  if (planRank[plan] < planRank.ELITE) return "elite";
  if (planRank[plan] < planRank.LIBERTY) return "liberty";
  return null;
};

export default function Header({ dashboard, onUpgrade }: HeaderProps) {
  const plan = normalizePlan(dashboard?.plan);
  const level = dashboard?.level || null;
  const nextPlan = getNextPlan(plan);
  const ctaLabel =
    nextPlan === "liberty"
      ? "Debloquer Liberty"
      : nextPlan === "elite"
        ? "Passer en Wealth OS"
        : "Debloquer Gold";

  const getPlanStyle = (value: string) => {
    switch (value) {
      case "SILVER":
        return "bg-gray-400 text-yellow-200";
      case "GOLD":
        return "bg-yellow-500 text-black";
      case "ELITE":
        return "bg-black text-yellow-400";
      case "LIBERTY":
        return "bg-[#f4c95d] text-black";
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
      <BrandMark compact />

      <div className="flex shrink-0 items-center gap-2 text-right text-sm text-white/60">
        {plan ? (
          <div className="hidden items-end gap-2 md:flex">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                Plan
              </p>
              <span
                className={`rounded px-2 py-1 text-xs font-semibold ${getPlanStyle(
                  plan
                )}`}
              >
                {plan}
              </span>
            </div>

            {level && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                  Statut
                </p>
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
            className="rounded-xl border border-[#3fa9f5]/40 bg-[#3fa9f5] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#2d91d5] sm:px-4 sm:text-xs"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
