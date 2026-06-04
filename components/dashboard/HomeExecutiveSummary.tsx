"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
  plan?: string | null;
  level?: string | null;
};

type SummaryCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "blue" | "green" | "red";
};

function SummaryCard({ label, value, detail, tone = "blue" }: SummaryCardProps) {
  const toneClasses =
    tone === "green"
      ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "red"
      ? "border border-red-400/20 bg-red-400/10 text-red-100"
      : "border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 text-[#bfe8ff]";

  return (
    <div className={`rounded-2xl p-4 ${toneClasses}`}>
      <p className="text-xs uppercase tracking-widest text-current/70">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      {detail ? <p className="mt-1 text-xs text-current/60">{detail}</p> : null}
    </div>
  );
}

export default function HomeExecutiveSummary({
  product,
  financeOverview,
  portfolio,
  realEstate,
  ventureAssets,
  plan,
  level,
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

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-5">
          <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
            Patrimoine suivi
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {money.format(visibleWealth)} EUR
          </p>
        </div>
        <div
          className={`rounded-2xl border p-5 ${
            cashflow >= 0
              ? "border-emerald-400/20 bg-emerald-400/10"
              : "border-red-400/20 bg-red-400/10"
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
        </div>
        <div className="rounded-2xl border border-[#f7d154]/25 bg-[#f7d154]/10 p-5">
          <p className="text-xs uppercase tracking-widest text-[#f7d154]">
            Statut White Rock
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {level || product?.progression?.level || plan || "A confirmer"}
          </p>
          <p className="mt-1 text-sm text-gray-400">{plan || product?.plan}</p>
        </div>
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      </div>

      {wealthChartData.length > 0 && (
        <div className="rounded-2xl border border-[#f7d154]/20 bg-zinc-950 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#f7d154]">
                Potentiel patrimonial
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
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
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wealthChartData} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={56} />
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

      <div className="rounded-2xl border border-[#3fa9f5]/20 bg-zinc-950 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Projection simple
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-xs uppercase tracking-widest text-emerald-300">
            Prochaine action
          </p>
          <p className="mt-3 text-lg font-black leading-snug text-white">
            {nextAction}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Signal prioritaire
          </p>
          <p className="mt-3 text-lg font-black leading-snug text-white">
            {mainSignal}
          </p>
          {signalDetail ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {signalDetail}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
