"use client";

import type {
  FinanceData,
  PortfolioAsset,
  RealEstateData,
  VentureAssetData,
  YieldAssetData,
} from "@/lib/types";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type ExposureBreakdownProps = {
  portfolio: PortfolioAsset[];
  realEstate?: RealEstateData | null;
  yieldAssets?: YieldAssetData | null;
  ventureAssets?: VentureAssetData | null;
  finance?: FinanceData;
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const colors = ["#3fa9f5", "#22c55e", "#f97316", "#eab308", "#a855f7", "#ef4444"];

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const normalizeType = (type: string) =>
  (type || "Autre").replace(/_/g, " ").toUpperCase();

const isForex = (asset: PortfolioAsset) =>
  ["FOREX", "FX", "CURRENCY", "CURRENCIES"].includes(
    String(asset.asset_type || asset.type || "").toUpperCase()
  );

export default function ExposureBreakdown({
  portfolio,
  realEstate,
  yieldAssets,
  ventureAssets,
  finance,
}: ExposureBreakdownProps) {
  const exposure = portfolio.reduce<Record<string, number>>((acc, asset) => {
    const key = normalizeType(asset.asset_type || asset.type || "Autre");
    acc[key] = (acc[key] || 0) + getAssetValue(asset);
    return acc;
  }, {});

  const realEstateValue = Number(
    realEstate?.totals?.total_estimated_value ||
      realEstate?.totals?.total_purchase ||
      0
  );

  if (realEstateValue > 0) {
    exposure.IMMOBILIER = (exposure.IMMOBILIER || 0) + realEstateValue;
  }

  const yieldExposure = (yieldAssets?.assets || []).reduce<Record<string, number>>(
    (acc, asset) => {
      const key =
        asset.asset_type === "private_equity"
          ? "PRIVATE EQUITY"
          : "CROWDFUNDING";
      acc[key] = (acc[key] || 0) + Number(asset.final_value || 0);
      return acc;
    },
    {}
  );

  Object.entries(yieldExposure).forEach(([key, value]) => {
    if (value > 0) exposure[key] = (exposure[key] || 0) + value;
  });

  const ventureExposure = (ventureAssets?.assets || []).reduce<Record<string, number>>(
    (acc, asset) => {
      const key = normalizeType(asset.asset_type);
      acc[key] = (acc[key] || 0) + Number(asset.final_value || 0);
      return acc;
    },
    {}
  );

  Object.entries(ventureExposure).forEach(([key, value]) => {
    if (value > 0) exposure[key] = (exposure[key] || 0) + value;
  });

  const debtExposure = (finance?.dettes || []).reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  if (debtExposure > 0) {
    exposure.DETTES = debtExposure;
  }

  const data = Object.entries(exposure)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const topExposure = data[0];
  const currencyExposure = portfolio.reduce<Record<string, number>>((acc, asset) => {
    if (!isForex(asset)) return acc;

    const value = getAssetValue(asset);
    const base = asset.currency_base;
    const quote = asset.currency_quote;

    if (base) acc[base] = (acc[base] || 0) + value;
    if (quote) acc[quote] = (acc[quote] || 0) + value;

    return acc;
  }, {});

  const currencyData = Object.entries(currencyExposure)
    .map(([currency, value]) => ({ currency, value }))
    .sort((a, b) => b.value - a.value);
  const currencyTotal = currencyData.reduce((acc, item) => acc + item.value, 0);

  if (data.length === 0) {
    return (
      <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
        <h2 className="text-2xl font-bold mb-4">Exposition</h2>
        <p className="text-sm text-gray-400">
          Ajoute des actifs pour visualiser la repartition du portefeuille.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-zinc-950 border border-white/10 rounded-2xl p-5">
      <div className="flex flex-col gap-1 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exposition</h2>
          <p className="text-sm text-gray-400">
            Repartition par classe d&apos;actifs
          </p>
        </div>

        {topExposure && (
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-400">Exposition principale</p>
            <p className="text-lg font-black text-[#3fa9f5]">
              {topExposure.name}{" "}
              {total > 0 ? Math.round((topExposure.value / total) * 100) : 0}%
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4 items-center">
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={46}
                outerRadius={82}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${money.format(Number(value))} EUR`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <span className="text-gray-300">
                    {money.format(item.value)} EUR
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currencyData.length > 0 && (
        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">Exposition devise</h3>
              <p className="text-xs text-gray-400">
                Vue simple des devises portees par tes positions FOREX.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {currencyData.map((item, index) => {
              const percent =
                currencyTotal > 0 ? (item.value / currencyTotal) * 100 : 0;

              return (
                <div key={item.currency}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-cyan-100">
                      {item.currency}
                    </span>
                    <span className="text-gray-300">
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
