"use client";

import type { PortfolioHistoryPoint } from "@/lib/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type ChartModuleProps = {
  history: PortfolioHistoryPoint[];
};

export default function ChartModule({ history }: ChartModuleProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white/10 p-6 rounded-xl">
        <h2 className="mb-4">Evolution du Portfolio</h2>
        <div className="text-white/60 text-sm">
          Aucune donnee d&apos;historique disponible
        </div>
      </div>
    );
  }

  const cleanData = history.map((item) => ({
    date: item.date || item.created_at || "N/A",
    value: Number(item.value || 0),
    gain: Number(item.gain || 0),
  }));

  return (
    <div className="bg-white/10 p-6 rounded-xl">
      <h2 className="mb-4">Evolution du Portfolio</h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cleanData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
            <YAxis tick={{ fill: "#aaa" }} />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })} EUR`,
                name === "gain" ? "Plus-value" : "Valeur",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Valeur"
              stroke="#1DA2CF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="gain"
              name="Plus-value"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
