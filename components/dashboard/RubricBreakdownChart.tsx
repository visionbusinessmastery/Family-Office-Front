"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type RubricBreakdownItem = {
  label: string;
  value: number;
};

type RubricBreakdownChartProps = {
  title: string;
  description: string;
  items: RubricBreakdownItem[];
};

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const colors = ["#3fa9f5", "#16d99a", "#ffd21a", "#8bd0ff", "#a78bfa", "#ef4444"];

export default function RubricBreakdownChart({
  title,
  description,
  items,
}: RubricBreakdownChartProps) {
  const data = items
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-gray-400">
          Ajoute des elements dans cette rubrique pour afficher sa repartition.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <p className="text-lg font-black text-[#3fa9f5]">
          {money.format(total)} EUR
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={48}
                outerRadius={84}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={colors[index % colors.length]} />
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
            const color = colors[index % colors.length];

            return (
              <div key={`${item.label}-${index}`}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <span className="text-gray-300">
                    {money.format(item.value)} EUR
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      backgroundColor: color,
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
