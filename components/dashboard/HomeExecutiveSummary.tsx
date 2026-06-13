"use client";

import { useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "@/lib/api-client";
import type {
  FinanceOverviewData,
  PassionAssetData,
  PortfolioAsset,
  ProgressionTimelineData,
  ProductContext,
  RealEstateData,
  VentureAssetData,
} from "@/lib/types";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const n = (value?: number | string | null) => Number(value || 0);

const formatChartMoney = (value: number | string) =>
  `${money.format(Number(value || 0))} EUR`;

type HomeExecutiveSummaryProps = {
  product?: ProductContext | null;
  financeOverview?: FinanceOverviewData | null;
  portfolio?: PortfolioAsset[];
  realEstate?: RealEstateData | null;
  ventureAssets?: VentureAssetData | null;
  passionAssets?: PassionAssetData | null;
  opportunitiesCount?: number;
  progressionSummary?: ProgressionTimelineData["summary"];
  onOpenOpportunities?: () => void;
  onOpenWealth?: () => void;
  onOpenFinances?: () => void;
  onDailyActionComplete?: () => void | Promise<void>;
};

type SummaryCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "blue" | "green" | "red";
  progress?: number;
};

function SummaryCard({ label, value, detail, tone = "blue", progress = 0 }: SummaryCardProps) {
  const toneClasses =
    tone === "green"
      ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "red"
      ? "border border-red-400/20 bg-red-400/10 text-red-100"
      : "border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 text-[#bfe8ff]";
  const barClass =
    tone === "green"
      ? "bg-emerald-300"
      : tone === "red"
      ? "bg-red-300"
      : "bg-[#3fa9f5]";
  const numericValue = Number(
    value
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.+-]/g, "")
  );
  const autoProgress = Number.isFinite(numericValue)
    ? value.includes("%")
      ? Math.min(100, Math.abs(numericValue))
      : value.includes("x")
      ? Math.min(100, Math.abs(numericValue / 6) * 100)
      : Math.min(100, Math.log10(Math.abs(numericValue) + 1) * 16)
    : 45;
  const barWidth = progress || autoProgress;

  return (
    <div className={`rounded-xl p-4 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-current/70">{label}</p>
          {detail ? <p className="mt-1 text-xs text-current/60">{detail}</p> : null}
        </div>
        <p className="shrink-0 text-right text-lg font-black text-white">{value}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${barWidth}%` }} />
      </div>
    </div>
  );
}

function MetricGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">{title}</p>
      <div className="grid grid-cols-1 gap-3">{children}</div>
    </div>
  );
}

function MetricLine({ label, value, detail, tone = "blue", progress = 0 }: SummaryCardProps) {
  const color =
    tone === "green" ? "#34d399" : tone === "red" ? "#f87171" : "#3fa9f5";
  const muted =
    tone === "green"
      ? "bg-emerald-400/10 border-emerald-400/20"
      : tone === "red"
      ? "bg-red-400/10 border-red-400/20"
      : "bg-[#3fa9f5]/10 border-[#3fa9f5]/20";
  const width = Math.max(3, Math.min(100, progress));

  return (
    <div className={`grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_160px_1.2fr] sm:items-center ${muted}`}>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-white/70">{label}</p>
        {detail ? <p className="mt-1 text-xs text-white/45">{detail}</p> : null}
      </div>
      <p className="text-xl font-black text-white sm:text-right">{value}</p>
      <div>
        <div className="h-3 overflow-hidden rounded-full bg-black/35">
          <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

type PieMetricItem = {
  label: string;
  value: number;
  display: string;
  fill: string;
};

function PieMetricBlock({
  title,
  items,
  variant = "pie",
}: {
  title: string;
  items: PieMetricItem[];
  variant?: "pie" | "bars" | "gauges" | "stack";
}) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#3fa9f5]">{title}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="h-64">
          {variant === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => `${Number(value).toFixed(0)}%`} />
                <Pie
                  data={items}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="54%"
                  outerRadius="82%"
                  paddingAngle={3}
                >
                  {items.map((item) => (
                    <Cell key={item.label} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : variant === "bars" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={items} margin={{ left: 4, right: 4, top: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} width={36} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(0)}%`} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {items.map((item) => (
                    <Cell key={item.label} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col justify-center gap-4">
              {variant === "stack" ? (
                <div className="h-8 overflow-hidden rounded-full bg-black/35">
                  <div className="flex h-full">
                    {items.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          width: `${total > 0 ? Math.max(4, (item.value / total) * 100) : 25}%`,
                          backgroundColor: item.fill,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {items.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-gray-300">{item.label}</span>
                    <span className="text-gray-500">{item.display}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-black/35">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, item.value)}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">{item.label}</p>
              </div>
              <p className="mt-2 text-xl font-black text-white">{item.display}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({
  title,
  items,
  formatter,
}: {
  title: string;
  items: PieMetricItem[];
  formatter: (value: number | string) => string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</p>
      <div className="mt-3 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ left: 4, right: 4, top: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} width={44} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(value) => formatter(Number(value || 0))}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {items.map((item) => (
                <Cell key={item.label} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <p className="text-[11px] font-black uppercase tracking-wide text-gray-500">{item.label}</p>
            </div>
            <p className="mt-1 text-sm font-black text-white">{item.display}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatioGaugeChart({ title, items }: { title: string; items: PieMetricItem[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</p>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-gray-300">{item.label}</span>
              <span className="font-black text-white">{item.display}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(3, Math.min(100, item.value))}%`, backgroundColor: item.fill }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DualMetricBlock({
  title,
  amountItems,
  ratioItems,
}: {
  title: string;
  amountItems: PieMetricItem[];
  ratioItems: PieMetricItem[];
}) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#3fa9f5]">{title}</p>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <MiniBarChart title="Montants" items={amountItems} formatter={formatChartMoney} />
        <RatioGaugeChart title="Ratios et pourcentages" items={ratioItems} />
      </div>
    </div>
  );
}

export default function HomeExecutiveSummary({
  product,
  financeOverview,
  portfolio,
  realEstate,
  ventureAssets,
  passionAssets,
  opportunitiesCount = 0,
  progressionSummary,
  onOpenOpportunities,
  onOpenWealth,
  onOpenFinances,
  onDailyActionComplete,
}: HomeExecutiveSummaryProps) {
  const [dailyActionBusy, setDailyActionBusy] = useState<string | null>(null);
  const [taskBusyId, setTaskBusyId] = useState<number | null>(null);
  const [dailyActionFeedback, setDailyActionFeedback] = useState("");
  const wealth = product?.wealth_intelligence;
  const dailyBriefing = product?.ceo_daily_briefing;
  const briefingMetrics = dailyBriefing?.metrics || {};
  const future = product?.future_intelligence;
  const position = future?.position;
  const decision = product?.decision_intelligence;
  const cashflow = n(financeOverview?.totals?.cashflow);
  const visibleWealth =
    n(product?.data_profile?.current_wealth) || n(wealth?.visible_wealth);
  const liquidWealth = n(financeOverview?.totals?.savings);
  const liquidMonths = n(financeOverview?.ratios?.liquid_months);
  const debtTotal = n(financeOverview?.totals?.debt);
  const debtToIncome = n(financeOverview?.ratios?.debt_to_income);

  const portfolioAssets = portfolio || [];
  const portfolioValue = portfolioAssets.reduce(
    (acc, asset) => acc + n(asset.value ?? asset.current_value),
    0
  );
  const portfolioCost = portfolioAssets.reduce(
    (acc, asset) =>
      acc + n(asset.cost ?? (n(asset.quantity) * n(asset.purchase_price))),
    0
  );
  const portfolioGain = portfolioValue - portfolioCost;
  const portfolioGainPercent =
    portfolioCost > 0 ? (portfolioGain / portfolioCost) * 100 : 0;
  const portfolioAllocation = portfolioAssets
    .reduce<Array<{ label: string; value: number }>>((acc, asset) => {
      const label = String(asset.asset_type || asset.type || "Autre")
        .replace(/_/g, " ")
        .toUpperCase();
      const value = n(asset.value ?? asset.current_value);
      const existing = acc.find((item) => item.label === label);
      if (existing) existing.value += value;
      else acc.push({ label, value });
      return acc;
    }, [])
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const dominantExposure = portfolioAllocation[0];
  const dominantExposureLabel = dominantExposure
    ? `${dominantExposure.label} ${
        portfolioValue > 0
          ? `${((dominantExposure.value / portfolioValue) * 100).toFixed(0)}%`
          : "0%"
      }`
    : "A qualifier";

  const realEstateTotals = realEstate?.totals || {};
  const realEstateValue = n(realEstateTotals.total_estimated_value);
  const realEstateGain = n(realEstateTotals.total_potential_gain);
  const realEstatePerformance = n(realEstateTotals.total_potential_gain_percent);
  const realEstateYield = n(realEstateTotals.average_rental_yield);

  const ventureTotals = ventureAssets?.totals || {};
  const businessRevenue = n(ventureTotals.total_revenue);
  const businessCharges = n(ventureTotals.total_charges);
  const businessPerformance = n(ventureTotals.total_result);
  const businessValue = n(ventureTotals.total_final_value);
  const passionTotals = passionAssets?.totals || {};
  const passionValue = n(passionTotals.estimated_value);
  const passionGain = n(passionTotals.latent_gain);
  const passionPerformance = n(passionTotals.performance);
  const passionInsured = n(passionTotals.insured_value);

  const formatMoney = (value: number) => `${money.format(value)} EUR`;
  const formatSignedMoney = (value: number) =>
    `${value >= 0 ? "+" : ""}${money.format(value)} EUR`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const progressOf = (value: number, max: number) =>
    max > 0 ? Math.min(100, Math.abs(value / max) * 100) : 0;
  const trackedTotal =
    liquidWealth + portfolioValue + realEstateValue + businessValue + passionValue;
  const dominantExposurePercent =
    dominantExposure && portfolioValue > 0
      ? (dominantExposure.value / portfolioValue) * 100
      : 0;

  const mainInsight =
    dailyBriefing?.headline ||
    wealth?.memorable_insight ||
    wealth?.headline ||
    wealth?.gravity_reading ||
    "White Rock consolide tes donnees pour faire ressortir la prochaine decision utile.";
  const nextAction =
    dailyBriefing?.recommended_action?.description ||
    decision?.next_action ||
    decision?.decision?.action ||
    decision?.decision?.description ||
    product?.strategic_brief?.next_action ||
    "Garde tes donnees a jour pour affiner la prochaine action utile.";
  const mainSignal =
    dailyBriefing?.risk?.description ||
    decision?.risk?.title ||
    decision?.opportunity?.title ||
    product?.strategic_brief?.main_risk ||
    product?.strategic_brief?.opportunity ||
    "Aucun signal prioritaire a traiter immediatement.";
  const signalDetail =
    decision?.risk?.description ||
    decision?.opportunity?.description ||
    decision?.risk?.action ||
    decision?.opportunity?.action ||
    "";
  const premiumOpportunity =
    dailyBriefing?.opportunity?.description ||
    product?.opportunity_radar?.items?.[0]?.title ||
    decision?.opportunity?.title ||
    product?.strategic_brief?.opportunity ||
    "A confirmer avec davantage de donnees.";
  const premiumOpportunityDetail =
    product?.opportunity_radar?.items?.[0]?.next_action ||
    product?.opportunity_radar?.items?.[0]?.impact ||
    decision?.opportunity?.action ||
    decision?.opportunity?.description ||
    "";
  const progress = Math.min(100, n(position?.progress_percent));
  const wealthChartData = [
    { label: "Visible", value: n(wealth?.visible_wealth) || visibleWealth, fill: "#3fa9f5" },
    { label: "Activable", value: n(wealth?.activable_wealth), fill: "#f7d154" },
    { label: "Potentiel", value: n(wealth?.total_potential), fill: "#16d99a" },
  ].filter((item) => item.value > 0);
  const futureChartData = (future?.film || [])
    .map((chapter) => ({
      year: String(chapter.year || ""),
      wealth: n(chapter.wealth),
    }))
    .filter((item) => item.year && item.wealth > 0)
    .slice(0, 5);
  const patrimonialMixData = [
    { label: "Revenus", value: n(financeOverview?.totals?.income), fill: "#34d399" },
    { label: "Liquidite", value: liquidWealth, fill: "#3fa9f5" },
    { label: "Invest.", value: portfolioValue, fill: "#16d99a" },
    { label: "Immobilier", value: realEstateValue, fill: "#f7d154" },
    { label: "Business", value: businessValue, fill: "#f87171" },
    { label: "Passion", value: passionValue, fill: "#3fa9f5" },
  ].filter((item) => item.value > 0);
  const cashAmountData = [
    {
      label: "Patrimoine liquide",
      value: liquidWealth,
      display: formatMoney(liquidWealth),
      fill: "#3fa9f5",
    },
    {
      label: "Dette totale",
      value: debtTotal,
      display: formatMoney(debtTotal),
      fill: "#f87171",
    },
  ];
  const cashRatioData = [
    {
      label: "Mois de securite",
      value: Math.max(1, progressOf(liquidMonths, 12)),
      display: `${liquidMonths.toFixed(1)} mois`,
      fill: "#16d99a",
    },
    {
      label: "Dette / revenus",
      value: Math.max(1, progressOf(debtToIncome, 6)),
      display: `${debtToIncome.toFixed(2)}x`,
      fill: "#ffd21a",
    },
  ];
  const portfolioAmountData = [
    {
      label: "Valeur totale",
      value: portfolioValue,
      display: formatMoney(portfolioValue),
      fill: "#3fa9f5",
    },
    {
      label: "Plus / moins-value",
      value: Math.abs(portfolioGain),
      display: formatSignedMoney(portfolioGain),
      fill: "#16d99a",
    },
  ];
  const portfolioRatioData = [
    {
      label: "Performance",
      value: Math.max(1, progressOf(portfolioGainPercent, 100)),
      display: formatPercent(portfolioGainPercent),
      fill: "#f7d154",
    },
    {
      label: "Exposition dominante",
      value: Math.max(1, dominantExposurePercent),
      display: dominantExposureLabel,
      fill: "#f87171",
    },
  ];
  const realEstateAmountData = [
    {
      label: "Valeur totale",
      value: realEstateValue,
      display: formatMoney(realEstateValue),
      fill: "#3fa9f5",
    },
    {
      label: "Plus-value latente",
      value: Math.abs(realEstateGain),
      display: formatSignedMoney(realEstateGain),
      fill: "#16d99a",
    },
  ];
  const realEstateRatioData = [
    {
      label: "Performance globale",
      value: Math.max(1, progressOf(realEstatePerformance, 100)),
      display: formatPercent(realEstatePerformance),
      fill: "#f7d154",
    },
    {
      label: "Rendement locatif",
      value: Math.max(1, progressOf(realEstateYield, 10)),
      display: formatPercent(realEstateYield),
      fill: "#f87171",
    },
  ];
  const businessMargin =
    businessRevenue > 0 ? (businessPerformance / businessRevenue) * 100 : 0;
  const businessChargesRatio =
    businessRevenue > 0 ? (businessCharges / businessRevenue) * 100 : 0;
  const businessWeight = trackedTotal > 0 ? (businessValue / trackedTotal) * 100 : 0;
  const businessAmountData = [
    {
      label: "Chiffre d'affaires",
      value: businessRevenue,
      display: formatMoney(businessRevenue),
      fill: "#3fa9f5",
    },
    {
      label: "Charges",
      value: businessCharges,
      display: formatMoney(businessCharges),
      fill: "#f87171",
    },
    {
      label: "Performance",
      value: Math.abs(businessPerformance),
      display: formatSignedMoney(businessPerformance),
      fill: "#16d99a",
    },
    {
      label: "Valeur suivie",
      value: businessValue,
      display: formatMoney(businessValue),
      fill: "#ffd21a",
    },
  ];
  const businessRatioData = [
    {
      label: "Marge",
      value: Math.max(1, progressOf(businessMargin, 100)),
      display: formatPercent(businessMargin),
      fill: "#16d99a",
    },
    {
      label: "Charges / CA",
      value: Math.max(1, progressOf(businessChargesRatio, 100)),
      display: formatPercent(businessChargesRatio),
      fill: "#f87171",
    },
    {
      label: "Poids suivi",
      value: Math.max(1, progressOf(businessWeight, 100)),
      display: formatPercent(businessWeight),
      fill: "#ffd21a",
    },
  ];
  const passionWeight = trackedTotal > 0 ? (passionValue / trackedTotal) * 100 : 0;
  const passionCoverage =
    passionValue > 0 ? (passionInsured / passionValue) * 100 : 0;
  const passionAmountData = [
    {
      label: "Valeur estimee",
      value: passionValue,
      display: formatMoney(passionValue),
      fill: "#3fa9f5",
    },
    {
      label: "Plus-value",
      value: Math.abs(passionGain),
      display: formatSignedMoney(passionGain),
      fill: passionGain >= 0 ? "#16d99a" : "#f87171",
    },
    {
      label: "Valeur assuree",
      value: passionInsured,
      display: formatMoney(passionInsured),
      fill: "#ffd21a",
    },
  ];
  const passionRatioData = [
    {
      label: "Performance",
      value: Math.max(1, progressOf(passionPerformance, 100)),
      display: formatPercent(passionPerformance),
      fill: passionPerformance >= 0 ? "#16d99a" : "#f87171",
    },
    {
      label: "Couverture",
      value: Math.max(1, progressOf(passionCoverage, 100)),
      display: formatPercent(passionCoverage),
      fill: "#3fa9f5",
    },
    {
      label: "Poids suivi",
      value: Math.max(1, progressOf(passionWeight, 100)),
      display: formatPercent(passionWeight),
      fill: "#ffd21a",
    },
  ];
  const todayDailyActions = dailyBriefing?.daily_loop?.today_actions || {};
  const dailyLoopHistory = dailyBriefing?.daily_loop?.history || [];
  const dailyTasks = dailyBriefing?.daily_loop?.tasks || [];
  const dailyLoopSummary = dailyBriefing?.daily_loop?.summary;
  const primaryAction = dailyBriefing?.primary_action;
  const activeDailyTasks = dailyTasks.filter((task) => task.status !== "done" && task.status !== "cancelled");
  const todayActionEntries = Object.entries(todayDailyActions);
  const lastDailyAction = dailyLoopHistory[0];
  const primaryActionReading =
    primaryAction?.type === "review"
      ? "Tu as deja avance aujourd'hui"
      : primaryAction?.type === "task"
        ? "Il te reste une action ouverte"
        : primaryAction?.type === "academy"
          ? "Une courte lecon peut debloquer la suite"
          : primaryAction?.type === "mission"
            ? "Une mission est prete a etre validee"
            : "Action prioritaire";
  const todayXp = Number(dailyLoopSummary?.xp_today) || todayActionEntries.reduce(
    (total, [, action]) => total + n(action.xp_awarded),
    0
  );
  const statusLabel = (status?: string) => {
    if (status === "decided") return "Decision prise";
    if (status === "ignored") return "Ignore aujourd'hui";
    if (status === "automation_requested") return "Automatisation demandee";
    if (status === "recorded") return "Action enregistree";
    return "En attente";
  };
  const actionKeyLabel = (key?: string) => {
    if (key === "decide") return "Decider";
    if (key === "ignore") return "Ignorer";
    if (key === "automate") return "Automatiser";
    return "Aucune action";
  };
  const formatDailyDate = (value?: string | null) => {
    if (!value) return "Aujourd'hui";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Aujourd'hui";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };
  const recordDailyAction = async (action: {
    key?: string;
    label?: string;
    status?: string;
  }) => {
    const actionKey = action.key || "";
    if (!actionKey || dailyActionBusy || todayDailyActions[actionKey]) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setDailyActionFeedback("Session expiree. Reconnecte-toi pour enregistrer l'action.");
      return;
    }

    setDailyActionBusy(actionKey);
    setDailyActionFeedback("");

    try {
      const result = await apiFetch<{
        message?: string;
        xp_awarded?: number;
        already_recorded?: boolean;
      }>("/product/daily-briefing/action", token, {
        method: "POST",
        body: JSON.stringify({
          action_key: actionKey,
          action_label: action.label,
          action_title: dailyBriefing?.recommended_action?.title,
          action_description: dailyBriefing?.recommended_action?.description,
          mission_key: dailyBriefing?.recommended_action?.mission_key,
          briefing_version: dailyBriefing?.version,
        }),
      });
      const xpMessage = result.xp_awarded ? ` +${result.xp_awarded} XP.` : "";
      setDailyActionFeedback(`${result.message || "Action enregistree."}${xpMessage}`);
      await onDailyActionComplete?.();
    } catch (error) {
      setDailyActionFeedback(
        error instanceof Error ? error.message : "Action impossible pour le moment."
      );
    } finally {
      setDailyActionBusy(null);
    }
  };
  const updateDailyTaskStatus = async (taskId?: number, status = "done") => {
    if (!taskId || taskBusyId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setDailyActionFeedback("Session expiree. Reconnecte-toi pour mettre a jour la tache.");
      return;
    }

    setTaskBusyId(taskId);
    setDailyActionFeedback("");

    try {
      const result = await apiFetch<{
        message?: string;
        xp_awarded?: number;
      }>(`/product/daily-briefing/tasks/${taskId}/status`, token, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      const xpMessage = result.xp_awarded ? ` +${result.xp_awarded} XP.` : "";
      setDailyActionFeedback(`${result.message || "Tache mise a jour."}${xpMessage}`);
      await onDailyActionComplete?.();
    } catch (error) {
      setDailyActionFeedback(
        error instanceof Error ? error.message : "Mise a jour impossible pour le moment."
      );
    } finally {
      setTaskBusyId(null);
    }
  };
  const executePrimaryAction = async () => {
    if (!primaryAction?.type || dailyActionBusy === "primary") return;

    if (primaryAction.type === "review" || primaryAction.locked) {
      setDailyActionFeedback("Suivi deja enregistre aujourd'hui. Reviens au prochain briefing pour une nouvelle priorite.");
      return;
    }

    if (primaryAction.type === "decision") {
      await recordDailyAction({ key: "decide", label: "Decider" });
      return;
    }

    if (primaryAction.type === "task") {
      await updateDailyTaskStatus(primaryAction.task_id || undefined, "done");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setDailyActionFeedback("Session expiree. Reconnecte-toi pour executer l'action.");
      return;
    }

    setDailyActionBusy("primary");
    setDailyActionFeedback("");

    try {
      const endpoint =
        primaryAction.type === "mission"
          ? `/product/missions/${primaryAction.mission_key}/complete`
          : primaryAction.type === "academy"
            ? `/product/academy/lessons/${primaryAction.lesson_key}/complete`
            : "";

      if (!endpoint) {
        setDailyActionFeedback("Action prioritaire inconnue.");
        return;
      }

      const result = await apiFetch<{
        message?: string;
        xp_awarded?: number;
        already_completed?: boolean;
      }>(endpoint, token, { method: "POST" });
      const xpMessage = result.xp_awarded ? ` +${result.xp_awarded} XP.` : "";
      setDailyActionFeedback(`${result.message || "Action prioritaire enregistree."}${xpMessage}`);
      await onDailyActionComplete?.();
    } catch (error) {
      setDailyActionFeedback(
        error instanceof Error ? error.message : "Action prioritaire impossible pour le moment."
      );
    } finally {
      setDailyActionBusy(null);
    }
  };

  return (
    <section className="space-y-5">
      {dailyBriefing && (
        <div className="rounded-2xl border border-[#3fa9f5]/25 bg-[radial-gradient(circle_at_top_right,_rgba(63,169,245,0.18),_transparent_35%),linear-gradient(135deg,#07111c,#020202)] p-5">
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                CEO Daily Briefing
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {dailyBriefing.greeting || "Bonjour,"}
              </h2>
              <p className="mt-3 max-w-3xl text-lg font-bold leading-snug text-white">
                {dailyBriefing.headline}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Action estimee: {dailyBriefing.recommended_action?.estimated_time || "2 minutes"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Patrimoine", formatMoney(n(briefingMetrics.visible_wealth)), "text-[#3fa9f5]"],
                ["Liberte", `${n(briefingMetrics.financial_freedom_progress).toFixed(1)}%`, "text-[#ffd21a]"],
                ["Score", `${n(briefingMetrics.wealth_score).toFixed(0)}/100`, "text-[#16d99a]"],
                ["Cashflow", formatSignedMoney(n(briefingMetrics.monthly_cashflow)), n(briefingMetrics.monthly_cashflow) >= 0 ? "text-[#16d99a]" : "text-red-300"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
                  <p className={`mt-1 text-lg font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <p className="text-xs uppercase tracking-widest text-red-200">Risque principal</p>
              <p className="mt-2 text-sm font-bold text-white">{dailyBriefing.risk?.description}</p>
            </div>
            <div className="rounded-xl border border-[#16d99a]/20 bg-[#16d99a]/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#16d99a]">{primaryActionReading}</p>
                  <p className="mt-2 text-sm font-black text-white">
                    {primaryAction?.title || dailyBriefing.recommended_action?.title}
                  </p>
                </div>
                {primaryAction?.type && (
                  <span className="rounded-full border border-[#16d99a]/30 px-2 py-1 text-[10px] uppercase text-[#16d99a]">
                    {primaryAction.type}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-bold text-white">
                {primaryAction?.description || dailyBriefing.recommended_action?.description}
              </p>
              {primaryAction?.why && (
                <p className="mt-2 text-xs leading-relaxed text-[#bfffe7]">
                  {primaryAction.why}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-[#ffd21a]/20 bg-[#ffd21a]/10 p-4">
              <p className="text-xs uppercase tracking-widest text-[#ffd21a]">Opportunite</p>
              <p className="mt-2 text-sm font-bold text-white">{dailyBriefing.opportunity?.description}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[0.85fr_1.1fr_1.05fr]">
            <div className="rounded-xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-4">
              <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">Priorite</p>
              <p className="mt-2 text-3xl font-black text-white">
                {n(dailyBriefing.priority_score).toFixed(0)}
                <span className="text-sm text-gray-400">/100</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/35">
                <div
                  className="h-full rounded-full bg-[#3fa9f5]"
                  style={{ width: `${Math.max(1, Math.min(100, n(dailyBriefing.priority_score)))}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">Pourquoi maintenant</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white">
                {dailyBriefing.why_today}
              </p>
            </div>
            <div className="rounded-xl border border-[#16d99a]/20 bg-[#16d99a]/10 p-4">
              <p className="text-xs uppercase tracking-widest text-[#16d99a]">Resultat attendu</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white">
                {dailyBriefing.expected_outcome}
              </p>
            </div>
          </div>

          {dailyBriefing.alternative_action && (
            <div className="mt-3 rounded-xl border border-[#ffd21a]/20 bg-[#ffd21a]/10 p-4">
              <p className="text-xs uppercase tracking-widest text-[#ffd21a]">Alternative courte</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-white">
                {dailyBriefing.alternative_action}
              </p>
            </div>
          )}

          {primaryAction && (
            <div className="mt-3 grid gap-3 rounded-2xl border border-[#16d99a]/25 bg-[#16d99a]/10 p-4 lg:grid-cols-[1fr_0.9fr_auto] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#16d99a]">
                  {primaryAction?.type === "review" ? "Suivi du jour" : "A faire maintenant"}
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {primaryAction.description}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs uppercase tracking-widest text-[#ffd21a]">
                  Prochain jalon
                </p>
                <p className="mt-1 text-xs font-bold leading-relaxed text-gray-200">
                  {progressionSummary?.next_milestone ||
                    "Executer l'action prioritaire et laisser White Rock enregistrer la progression."}
                </p>
                <p className="mt-2 text-[11px] text-gray-500">
                  {Number(progressionSummary?.xp_recent || 0)} XP recents -{" "}
                  {Number(progressionSummary?.missions_completed || 0)} mission(s)
                </p>
              </div>
              <button
                type="button"
                onClick={executePrimaryAction}
                disabled={
                  Boolean(primaryAction.locked) ||
                  dailyActionBusy === "primary" ||
                  taskBusyId === primaryAction.task_id ||
                  primaryAction.type === "review" ||
                  (primaryAction.type === "decision" && Boolean(todayDailyActions.decide))
                }
                className="rounded-xl border border-[#16d99a]/40 bg-[#16d99a]/15 px-4 py-2 text-sm font-black text-[#16d99a] transition hover:bg-[#16d99a]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dailyActionBusy === "primary" || taskBusyId === primaryAction.task_id
                  ? "Execution..."
                  : primaryAction.cta_label || "Executer"}
              </button>
            </div>
          )}

          <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 lg:grid-cols-[0.95fr_1.1fr_0.95fr]">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">Boucle du jour</p>
              <p className="mt-2 text-xl font-black text-white">
                {todayActionEntries.length > 0
                  ? "Action captee"
                  : "Decision a prendre"}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {todayActionEntries.length > 0
                  ? "White Rock a enregistre ton choix et ajuste la progression."
                  : "Choisis une action simple pour transformer le briefing en progression."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                {
                  label: "Aujourd'hui",
                  value:
                    todayActionEntries.length > 0
                      ? statusLabel(todayActionEntries[0][1].status)
                      : "Non decide",
                  tone: "text-[#16d99a]",
                },
                {
                  label: "XP gagne",
                  value: todayXp > 0 ? `+${todayXp} XP` : "0 XP",
                  tone: todayXp > 0 ? "text-[#ffd21a]" : "text-gray-300",
                },
                {
                  label: "Derniere action",
                  value: actionKeyLabel(lastDailyAction?.action_key),
                  tone: "text-[#3fa9f5]",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs uppercase tracking-widest text-gray-500">{item.label}</p>
                  <p className={`mt-1 text-sm font-black ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-widest text-gray-500">Historique court</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="font-black text-white">{dailyLoopSummary?.actions_recent || dailyLoopHistory.length}</p>
                  <p className="text-gray-500">actions</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="font-black text-[#16d99a]">{dailyLoopSummary?.done_tasks || 0}</p>
                  <p className="text-gray-500">faites</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="font-black text-[#ffd21a]">+{dailyLoopSummary?.xp_recent || 0}</p>
                  <p className="text-gray-500">XP</p>
                </div>
              </div>
              {dailyLoopHistory.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {dailyLoopHistory.slice(0, 3).map((item, index) => (
                    <div key={`${item.created_at || index}-${item.action_key}`} className="rounded-lg border border-white/10 bg-black/20 p-2 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-white">{actionKeyLabel(item.action_key)}</span>
                        <span className="text-gray-500">{formatDailyDate(item.created_at)}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-gray-400">{statusLabel(item.status)}</span>
                        <span className="text-[11px] font-black text-[#16d99a]">+{item.xp_awarded || 0} XP</span>
                      </div>
                      {item.action_title && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-gray-500">{item.action_title}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  Les decisions quotidiennes apparaitront ici.
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#16d99a]">Actions suivies</p>
                <p className="mt-1 text-sm text-gray-400">
                  Taches creees depuis tes decisions du briefing.
                </p>
              </div>
              <p className="text-xs font-bold text-gray-500">
                {activeDailyTasks.length} en cours
              </p>
            </div>

            {dailyTasks.length > 0 ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {dailyTasks.slice(0, 4).map((task) => {
                  const done = task.status === "done";
                  return (
                    <div
                      key={task.id || task.title}
                      className={`rounded-xl border p-3 ${
                        done
                          ? "border-[#16d99a]/20 bg-[#16d99a]/10"
                          : "border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-white">
                            {task.title || "Action White Rock"}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-400">
                            {task.description}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] uppercase ${
                            done
                              ? "border-[#16d99a]/30 text-[#16d99a]"
                              : task.priority === "high"
                                ? "border-[#ffd21a]/30 text-[#ffd21a]"
                                : "border-[#3fa9f5]/30 text-[#3fa9f5]"
                          }`}
                        >
                          {done ? "fait" : task.priority === "high" ? "priorite" : "a faire"}
                        </span>
                      </div>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => updateDailyTaskStatus(task.id, "done")}
                          disabled={taskBusyId === task.id}
                          className="mt-3 rounded-lg border border-[#16d99a]/30 bg-[#16d99a]/10 px-3 py-1.5 text-xs font-black text-[#16d99a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {taskBusyId === task.id ? "Mise a jour..." : "Marquer comme fait"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-400">
                Clique sur Automatiser pour transformer l'action recommandee en tache suivie.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {(dailyBriefing.actions || []).map((action) => {
              const actionKey = action.key || "";
              const todayAction = todayDailyActions[actionKey];
              const completedStatus =
                todayAction?.status ||
                (["decided", "ignored", "automation_requested"].includes(action.status || "")
                  ? action.status
                  : "");
              const disabled = Boolean(completedStatus) || dailyActionBusy === actionKey;
              const label =
                completedStatus === "decided"
                  ? "Decide aujourd'hui"
                  : completedStatus === "ignored"
                    ? "Ignore aujourd'hui"
                    : completedStatus === "automation_requested"
                      ? "Automatisation demandee"
                      : dailyActionBusy === actionKey
                        ? "Enregistrement..."
                        : action.label;

              return (
                <button
                  key={action.key || action.label}
                  type="button"
                  onClick={() => recordDailyAction(action)}
                  disabled={disabled}
                  className={`rounded-xl border px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60 ${
                    action.key === "decide"
                      ? "border-[#16d99a]/40 bg-[#16d99a]/15 text-[#16d99a]"
                      : action.key === "automate"
                        ? "border-[#ffd21a]/40 bg-[#ffd21a]/15 text-[#ffd21a]"
                        : "border-white/10 bg-white/[0.04] text-gray-300"
                  }`}
                  title={action.status === "preview" ? "Automatisation en preparation" : undefined}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {dailyActionFeedback && (
            <p className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-sm font-bold text-gray-200">
              {dailyActionFeedback}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={onOpenWealth}
          className="rounded-2xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-5 text-left transition hover:border-[#3fa9f5]/50 hover:bg-[#3fa9f5]/15"
        >
          <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
            Patrimoine suivi
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {money.format(visibleWealth)} EUR
          </p>
          <p className="mt-1 text-sm text-gray-400">Ouvrir la page patrimoine</p>
        </button>
        <button
          type="button"
          onClick={onOpenFinances}
          className={`rounded-2xl border p-5 text-left transition ${
            cashflow >= 0
              ? "border-emerald-400/20 bg-emerald-400/10 hover:border-emerald-400/50 hover:bg-emerald-400/15"
              : "border-red-400/20 bg-red-400/10 hover:border-red-400/50 hover:bg-red-400/15"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Cashflow mensuel
          </p>
          <p
            className={`mt-2 text-3xl font-black ${
              cashflow >= 0 ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {cashflow >= 0 ? "+" : ""}
            {money.format(cashflow)} EUR
          </p>
          <p className="mt-1 text-sm text-gray-400">Ouvrir la page finances</p>
        </button>
        <button
          type="button"
          onClick={onOpenOpportunities}
          className="rounded-2xl border border-[#f7d154]/25 bg-[#f7d154]/10 p-5 text-left transition hover:border-[#f7d154]/50 hover:bg-[#f7d154]/15"
        >
          <p className="text-xs uppercase tracking-widest text-[#f7d154]">
            Opportunites premium
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {opportunitiesCount} opportunites detectees
          </p>
          <p className="mt-1 text-sm text-gray-400">Ouvrir la page opportunites</p>
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Synthèse patrimoniale
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Bilan, investissements, business et Passion Assets
            </h2>
          </div>
          <p className="text-sm text-gray-400">
            Les principaux indicateurs consolidés du cockpit.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {patrimonialMixData.length > 0 ? (
            <>
              <div className="h-72 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patrimonialMixData} margin={{ left: 4, right: 4, top: 12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={56} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      formatter={(value) => formatChartMoney(String(value))}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {patrimonialMixData.map((item) => (
                        <Cell key={item.label} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-gray-500 lg:col-span-2">
              Ajoute tes premieres donnees pour afficher la repartition.
            </div>
          )}
        </div>

        <DualMetricBlock title="Tresorerie et dette" amountItems={cashAmountData} ratioItems={cashRatioData} />

        <div className="hidden">
          <SummaryCard
            label="Patrimoine liquide"
            value={formatMoney(liquidWealth)}
            detail="Mois de sécurité"
            tone="blue"
          />
          <SummaryCard
            label="Mois de sécurité"
            value={liquidMonths.toFixed(1)}
            detail="base charges mensuelles"
            tone="green"
          />
          <SummaryCard
            label="Dette totale"
            value={formatMoney(debtTotal)}
            tone="red"
          />
          <SummaryCard
            label="Dette / revenus"
            value={`${debtToIncome.toFixed(2)}x`}
            tone="red"
          />
        </div>

        <DualMetricBlock title="Portefeuille financier" amountItems={portfolioAmountData} ratioItems={portfolioRatioData} />

        <div className="hidden">
          <SummaryCard
            label="Valeur totale"
            value={formatMoney(portfolioValue)}
            tone="blue"
          />
          <SummaryCard
            label="Plus / moins-value"
            value={formatSignedMoney(portfolioGain)}
            tone={portfolioGain >= 0 ? "green" : "red"}
          />
          <SummaryCard
            label="Performance"
            value={formatPercent(portfolioGainPercent)}
            tone={portfolioGainPercent >= 0 ? "green" : "red"}
          />
          <SummaryCard
            label="Exposition dominante"
            value={dominantExposureLabel}
            tone="blue"
          />
        </div>

        <DualMetricBlock title="Immobilier" amountItems={realEstateAmountData} ratioItems={realEstateRatioData} />

        <div className="hidden">
          <SummaryCard
            label="Valeur totale"
            value={formatMoney(realEstateValue)}
            tone="blue"
          />
          <SummaryCard
            label="Plus-value latente"
            value={formatSignedMoney(realEstateGain)}
            tone={realEstateGain >= 0 ? "green" : "red"}
          />
          <SummaryCard
            label="Performance globale"
            value={formatPercent(realEstatePerformance)}
            tone={realEstatePerformance >= 0 ? "green" : "red"}
          />
          <SummaryCard
            label="Rendement locatif"
            value={formatPercent(realEstateYield)}
            tone={realEstateYield >= 0 ? "green" : "red"}
          />
        </div>

        <DualMetricBlock title="Business" amountItems={businessAmountData} ratioItems={businessRatioData} />

        {passionValue > 0 && (
          <DualMetricBlock
            title="Passion Assets"
            amountItems={passionAmountData}
            ratioItems={passionRatioData}
          />
        )}

        <div className="hidden">
          <SummaryCard
            label="Chiffre d'affaires"
            value={formatMoney(businessRevenue)}
            tone="blue"
          />
          <SummaryCard
            label="Charges"
            value={formatMoney(businessCharges)}
            tone="red"
          />
          <SummaryCard
            label="Performance"
            value={formatSignedMoney(businessPerformance)}
            tone={businessPerformance >= 0 ? "green" : "red"}
          />
          <SummaryCard
            label="Valeur suivie"
            value={formatMoney(businessValue)}
            tone="blue"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <p className="text-xs uppercase tracking-widest text-[#f7d154]">
          Insight du jour
        </p>
        <p className="mt-3 max-w-4xl text-xl font-black leading-snug text-white">
          {mainInsight}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-[#16d99a]/20 bg-[#16d99a]/10 p-4">
            <p className="text-xs uppercase tracking-widest text-[#16d99a]">
              Prochaine action
            </p>
            <p className="mt-2 text-sm font-black leading-snug text-white">
              {nextAction}
            </p>
          </div>
          <div className="rounded-xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-4">
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Signal prioritaire
            </p>
            <p className="mt-2 text-sm font-black leading-snug text-white">
              {mainSignal}
            </p>
            {signalDetail ? (
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                {signalDetail}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-[#f7d154]/20 bg-[#f7d154]/10 p-4">
            <p className="text-xs uppercase tracking-widest text-[#f7d154]">
              Opportunites premium
            </p>
            <p className="mt-2 text-sm font-black leading-snug text-white">
              {premiumOpportunity}
            </p>
            {premiumOpportunityDetail ? (
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                {premiumOpportunityDetail}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {wealthChartData.length > 0 && (
            <div className="flex min-h-[420px] flex-col rounded-2xl border border-[#f7d154]/20 bg-[#f7d154]/5 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#f7d154]">
                    Potentiel patrimonial
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    Visible vs activable
                  </h2>
                </div>
                {wealth?.total_potential ? (
                  <p className="text-sm text-gray-400">
                    Potentiel total{" "}
                    <span className="font-bold text-white">
                      {money.format(n(wealth.total_potential))} EUR
                    </span>
                  </p>
                ) : null}
              </div>
              <div className="mt-4 min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wealthChartData} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={48} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      formatter={(value) => formatChartMoney(String(value))}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {wealthChartData.map((item) => (
                        <Cell key={item.label} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                  Projection simple
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {position?.destination?.label || "Prochain palier"}
                </h2>
              </div>
              <p className="text-sm text-gray-400">
                {position?.estimated_label || future?.time_to_next || "Date a confirmer"}
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3fa9f5] via-emerald-400 to-[#f7d154]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-gray-300">
                Position:{" "}
                <span className="font-bold text-white">
                  {money.format(n(position?.current) || visibleWealth)} EUR
                </span>
              </p>
              <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-gray-300">
                Distance:{" "}
                <span className="font-bold text-white">
                  {money.format(n(position?.distance_remaining))} EUR
                </span>
              </p>
              <p className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-gray-300">
                Vitesse:{" "}
                <span className="font-bold text-white">
                  {money.format(n(position?.monthly_velocity))} EUR/mois
                </span>
              </p>
            </div>
            {futureChartData.length > 0 && (
              <div className="mt-5 h-56 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={futureChartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="year" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={56} />
                    <Tooltip formatter={(value) => formatChartMoney(String(value))} />
                    <Line
                      type="monotone"
                      dataKey="wealth"
                      stroke="#3fa9f5"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#f7d154", stroke: "#f7d154" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
