"use client";

import type { PortfolioAsset } from "@/lib/types";
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
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const colors = ["#3fa9f5", "#22c55e", "#f97316", "#eab308", "#a855f7", "#ef4444"];

const getAssetValue = (asset: PortfolioAsset) =>
  Number(asset.value ?? asset.current_value ?? 0);

const normalizeType = (type: string) =>
  (type || "Autre").replace(/_/g, " ").toUpperCase();

export default function ExposureBreakdown({ portfolio }: ExposureBreakdownProps) {
  const exposure = portfolio.reduce<Record<string, number>>((acc, asset) => {
    const key = normalizeType(asset.asset_type || asset.type || "Autre");
    acc[key] = (acc[key] || 0) + getAssetValue(asset);
    return acc;
  }, {});

  const data = Object.entries(exposure)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((acc, item) => acc + item.value, 0);
  const topExposure = data[0];

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

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5 items-center">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={108}
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
              <Legend />
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
    </section>
  );
}
