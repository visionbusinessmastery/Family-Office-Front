export type PlanId = "FREE" | "GOLD" | "ELITE" | "LIBERTY" | "LEGACY";

export const PLAN_HIERARCHY: Record<PlanId, number> = {
  FREE: 0,
  GOLD: 1,
  ELITE: 2,
  LIBERTY: 3,
  LEGACY: 4,
};

const PLAN_ALIASES: Record<string, PlanId> = {
  FOUNDATION: "FREE",
  SILVER: "FREE",
  GROWTH: "GOLD",
  PLATINUM: "ELITE",
  WEALTH_OS: "ELITE",
  LIBERTY_LEGACY: "LIBERTY",
  HERITAGE: "LEGACY",
  DYNASTY: "LEGACY",
  DYNASTY_OFFICE: "LEGACY",
};

export function normalizePlan(plan?: string | null): PlanId | undefined {
  const value = String(plan || "").trim().toUpperCase();
  if (!value) return undefined;
  if (value in PLAN_ALIASES) return PLAN_ALIASES[value];
  return value in PLAN_HIERARCHY ? (value as PlanId) : undefined;
}

export function planAllows(plan?: string | null, required?: string | null) {
  const current = normalizePlan(plan) || "FREE";
  const target = normalizePlan(required) || "FREE";
  return PLAN_HIERARCHY[current] >= PLAN_HIERARCHY[target];
}

export function highestPlan(
  current?: string | null,
  incoming?: string | null
): PlanId | undefined {
  const currentPlan = normalizePlan(current);
  const incomingPlan = normalizePlan(incoming);

  if (!currentPlan) return incomingPlan;
  if (!incomingPlan) return currentPlan;

  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[incomingPlan]
    ? currentPlan
    : incomingPlan;
}

export function getNextPlan(plan?: string | null): Lowercase<PlanId> | null {
  const normalized = normalizePlan(plan) || "FREE";

  if (!planAllows(normalized, "GOLD")) return "gold";
  if (!planAllows(normalized, "ELITE")) return "elite";
  if (!planAllows(normalized, "LIBERTY")) return "liberty";
  if (!planAllows(normalized, "LEGACY")) return "legacy";

  return null;
}

export function isTopTierPlan(plan?: string | null) {
  return planAllows(plan, "LIBERTY");
}
