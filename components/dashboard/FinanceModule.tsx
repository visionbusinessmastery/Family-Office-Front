"use client";

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

type FinanceModuleProps = {
  revenusMensuels: number;
  chargesMensuelles: number;
};

export default function FinanceModule({
  revenusMensuels,
  chargesMensuelles,
}: FinanceModuleProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-[#3fa9f5]/10 border border-[#3fa9f5]/20 rounded-2xl p-5">
        <p className="text-sm text-gray-400 mb-2">Revenus mensuels</p>

        <h3 className="text-3xl font-black text-[#3fa9f5]">
          {money.format(Number(revenusMensuels))} EUR
        </h3>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
        <p className="text-sm text-gray-400 mb-2">Charges mensuelles</p>

        <h3 className="text-3xl font-black text-red-400">
          {money.format(Number(chargesMensuelles))} EUR
        </h3>
      </div>
    </div>
  );
}
