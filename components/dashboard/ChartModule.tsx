"use client";

import type { PortfolioHistoryPoint } from "@/lib/types";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type ChartModuleProps = {
  history: PortfolioHistoryPoint[];
  initialInvestment?: number;
  currentValue?: number;
  currentInvestment?: number;
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

export default function ChartModule({
  history,
  initialInvestment = 0,
  currentValue,
  currentInvestment,
}: ChartModuleProps) {
  if (history.length === 0 && currentValue === undefined) {
    return (
      <div className="bg-white/10 p-6 rounded-xl">
        <h2 className="mb-4">Evolution du Portfolio</h2>
        <div className="text-white/60 text-sm">
          Aucune donnee d&apos;historique disponible
        </div>
      </div>
    );
  }

  const cleanData = history
    .map((item) => ({
      date: item.date || item.created_at || "N/A",
      value: Number(item.value || 0),
      invested: Number(item.cost ?? initialInvestment ?? 0),
    }))
    .map((item) => ({
      ...item,
      gain: item.value - item.invested,
    }));

  if (currentValue !== undefined) {
    const invested = Number(currentInvestment ?? initialInvestment ?? 0);
    cleanData.push({
      date: "Actuel",
      value: currentValue,
      invested,
      gain: currentValue - invested,
    });
  }

  const latest = cleanData[cleanData.length - 1];
  const latestGain = latest?.gain || 0;
  const gainClass = latestGain >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="bg-white/10 p-6 rounded-xl">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2>Evolution du portefeuille global</h2>
          <p className="text-sm text-white/50">
            Valeur actuelle vs investissement initial
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-white/50">Impact plus / moins-value</p>
          <p className={`text-xl font-black ${gainClass}`}>
            {latestGain >= 0 ? "+" : ""}
            {money.format(latestGain)} EUR
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={cleanData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
            <YAxis yAxisId="value" tick={{ fill: "#aaa" }} />
            <YAxis
              yAxisId="gain"
              orientation="right"
              tick={{ fill: "#aaa" }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${money.format(Number(value))} EUR`,
                name === "gain"
                  ? "Plus / moins-value"
                  : name === "invested"
                    ? "Investissement initial"
                    : "Valeur totale",
              ]}
            />
            <Legend />
            <ReferenceLine yAxisId="gain" y={0} stroke="#666" />
            <Bar
              yAxisId="gain"
              dataKey="gain"
              name="Plus / moins-value"
              radius={[4, 4, 0, 0]}
            >
              {cleanData.map((entry) => (
                <Cell
                  key={`${entry.date}-${entry.gain}`}
                  fill={entry.gain >= 0 ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
            <Line
              yAxisId="value"
              type="monotone"
              dataKey="value"
              name="Valeur totale"
              stroke="#1DA2CF"
              strokeWidth={3}
              dot={false}
            />
            <Line
              yAxisId="value"
              type="monotone"
              dataKey="invested"
              name="Investissement initial"
              stroke="#e5e7eb"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
