import BrandMark from "@/components/BrandMark";
import type { DashboardSummary } from "@/lib/types";

type BillingSubscriptionPlan = {
  plan?: string | null;
  founder?: {
    is_founder?: boolean;
    tier?: string | null;
    discount?: number;
  };
};

type HeaderProps = {
  dashboard?: DashboardSummary | null;
  billingSubscription?: BillingSubscriptionPlan | null;
  onUpgrade?: (plan: string) => void;
};

export default function Header({
  dashboard,
  billingSubscription,
  onUpgrade,
}: HeaderProps) {
  const planOrder: Record<string, number> = {
    FREE: 0,
    GOLD: 1,
    ELITE: 2,
    LIBERTY: 3,
    LEGACY: 4,
  };
  const normalizePlan = (value?: string | null) => {
    const normalized = String(value || "FREE").trim().toUpperCase();
    if (normalized === "GROWTH") return "GOLD";
    if (normalized === "PLATINUM" || normalized === "WEALTH_OS") return "ELITE";
    if (normalized === "DYNASTY" || normalized === "DYNASTY_OFFICE") return "LEGACY";
    return planOrder[normalized] === undefined ? "FREE" : normalized;
  };

  const plan = billingSubscription?.plan
    ? normalizePlan(billingSubscription.plan)
    : dashboard?.plan
      ? normalizePlan(dashboard.plan)
      : undefined;
  const level = dashboard?.level || null;
  const isFounder = Boolean(
    billingSubscription?.founder?.is_founder || dashboard?.is_founder
  );
  const founderTier =
    billingSubscription?.founder?.tier || dashboard?.founder_tier || null;
  const nextPlan = dashboard?.next_plan ? normalizePlan(dashboard.next_plan) : null;
  const showUpgrade =
    Boolean(nextPlan && onUpgrade && plan && planOrder[nextPlan] > planOrder[plan]);

  const ctaLabel =
    nextPlan === "LIBERTY"
      ? "Debloquer Liberty"
      : nextPlan === "LEGACY"
        ? "Passer Dynasty"
        : nextPlan === "ELITE"
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
      case "LEGACY":
        return "bg-gradient-to-r from-black to-[#261b0b] text-amber-200 border border-amber-300/40";
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
      case "LEGACY":
      case "DYNASTY ARCHITECT":
        return "bg-amber-300 text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <>
      <div className="flex w-full shrink-0 items-center justify-between gap-2 text-right text-sm text-white/60">
        <div className="shrink-0">
          <BrandMark compact />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:hidden">
          {plan ? (
            <span
              className={`truncate rounded px-2 py-1 text-[11px] font-semibold ${getPlanStyle(
                plan
              )}`}
            >
              {plan === "LEGACY" ? "DYNASTY" : plan}
            </span>
          ) : null}
          {level ? (
            <span
              className={`truncate rounded px-2 py-1 text-[11px] font-semibold ${getLevelStyle(
                level
              )}`}
            >
              {level}
            </span>
          ) : null}
        </div>
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
                  {plan === "LEGACY" ? "DYNASTY" : plan}
                </span>
              </div>

              {isFounder && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">
                    Cercle
                  </p>
                  <span className="rounded border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-100">
                    {founderTier ? `FOUNDER ${String(founderTier).toUpperCase()}` : "FOUNDING MEMBER"}
                  </span>
                </div>
              )}

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

          {showUpgrade && nextPlan && onUpgrade && (
            <button
              onClick={() => onUpgrade(nextPlan.toLowerCase())}
              className="shrink-0 rounded-xl border border-[#3fa9f5]/40 bg-[#3fa9f5] px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#2d91d5] sm:px-4 sm:py-2 sm:text-xs"
            >
              {ctaLabel}
            </button>
          )}
      </div>
    </>
  );
}
