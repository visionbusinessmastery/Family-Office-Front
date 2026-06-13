"use client";

import type { ReactNode } from "react";
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
import type {
  FinanceOverviewData,
  PortfolioAsset,
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
  opportunitiesCount?: number;
  onOpenOpportunities?: () => void;
  onOpenWealth?: () => void;
  onOpenFinances?: () => void;
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
  opportunitiesCount = 0,
  onOpenOpportunities,
  onOpenWealth,
  onOpenFinances,
}: HomeExecutiveSummaryProps) {
  const wealth = product?.wealth_intelligence;
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

  const formatMoney = (value: number) => `${money.format(value)} EUR`;
  const formatSignedMoney = (value: number) =>
    `${value >= 0 ? "+" : ""}${money.format(value)} EUR`;
  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const progressOf = (value: number, max: number) =>
    max > 0 ? Math.min(100, Math.abs(value / max) * 100) : 0;
  const trackedTotal =
    liquidWealth + portfolioValue + realEstateValue + businessValue;
  const dominantExposurePercent =
    dominantExposure && portfolioValue > 0
      ? (dominantExposure.value / portfolioValue) * 100
      : 0;

  const mainInsight =
    wealth?.memorable_insight ||
    wealth?.headline ||
    wealth?.gravity_reading ||
    "White Rock consolide tes donnees pour faire ressortir la prochaine decision utile.";
  const nextAction =
    decision?.next_action ||
    decision?.decision?.action ||
    decision?.decision?.description ||
    product?.strategic_brief?.next_action ||
    "Garde tes donnees a jour pour affiner la prochaine action utile.";
  const mainSignal =
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

  return (
    <section className="space-y-5">
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
              Bilan, investissements et business
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
