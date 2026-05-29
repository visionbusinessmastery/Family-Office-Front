import type {
  DashboardSummary,
  PortfolioAsset,
  PortfolioHistoryPoint,
} from "@/lib/types";

type MetricsModuleProps = {
  score: number;
  dashboard?: DashboardSummary | null;
  totalValue: number;
  chartData: PortfolioHistoryPoint[];
  portfolio: PortfolioAsset[];
};

export default function MetricsModule({
  score,
  dashboard,
  totalValue,
  chartData,
  portfolio,
}: MetricsModuleProps) {
  const diversification = chartData.filter(
    (item) => Number(item.value || 0) > 0
  ).length;

  return (
    <>
      <div className="bg-gradient-to-r from-[#1DA2CF] to-blue-600 p-6 rounded-2xl text-center">
        <div className="text-sm opacity-80">Family Office Score</div>

        <div className="text-5xl font-bold">{Number(score || 0)}/100</div>

        <div className="mt-2 text-lg">{dashboard?.level || "Statut en cours"}</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 p-4 rounded-xl">
          <div className="text-white/60 text-xs">Total Portfolio</div>

          <div className="text-lg font-bold">
            {Number(totalValue || 0).toLocaleString("fr-FR")} EUR
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <div className="text-white/60 text-xs">Assets</div>

          <div className="text-lg font-bold">{portfolio.length}</div>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <div className="text-white/60 text-xs">Diversification</div>

          <div className="text-lg font-bold">{diversification}/3</div>
        </div>
      </div>
    </>
  );
}
