"use client";

import type { CommandCenter } from "@/lib/types";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

type GlobalFinancialCommandCenterProps = {
  data: CommandCenter | null;
};

export default function GlobalFinancialCommandCenter({
  data,
}: GlobalFinancialCommandCenterProps) {
  if (!data) return null;

  const modules = data.modules || {};
  const onboarding = data.onboarding || {};
  const moduleSignals = data.module_signals || [];
  const allocationData = Object.keys(modules).map((key) => ({
    name: key,
    value: modules[key]?.score || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
        <p className="text-gray-400">Global Score</p>
        <h1 className="text-5xl font-black text-[#3fa9f5]">
          {data.global_score}/100
        </h1>

        <p className="text-gray-400 mt-2">Level: {data.level}</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-[#3fa9f5] mb-4">
          Onboarding Snapshot
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Revenus mensuels</p>
            <p className="text-2xl font-bold text-[#3fa9f5]">
              {onboarding.monthly_income ?? onboarding.revenus_mensuels ?? 0} EUR
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Charges mensuelles</p>
            <p className="text-2xl font-bold text-red-400">
              {onboarding.monthly_expenses ?? onboarding.charges_mensuelles ?? 0}{" "}
              EUR
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(modules).map(([key, value]) => (
          <div
            key={key}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <p className="text-gray-400 text-sm">{key}</p>
            <h2 className="text-2xl font-bold">{value?.score || 0}/100</h2>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Allocation Modules</h3>

        <PieChart width={300} height={300}>
          <Pie
            data={allocationData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
          >
            {allocationData.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-[#3fa9f5]">
          Signaux modules
        </h3>

        <ul className="mt-3 space-y-2 text-gray-300">
          {moduleSignals.length > 0 ? (
            moduleSignals.map((signal, index) => (
              <li key={`${signal.module || signal.domain}-${signal.signal}-${index}`}>
                {signal.label || signal.signal || "Signal disponible"}
              </li>
            ))
          ) : (
            <li>Aucun signal module prioritaire.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
