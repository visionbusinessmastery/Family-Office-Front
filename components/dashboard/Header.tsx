import type { DashboardSummary } from "@/lib/types";

type HeaderProps = {
  dashboard: DashboardSummary | null;
};

export default function Header({ dashboard }: HeaderProps) {
  const plan = dashboard?.plan || "FREE";
  const level = dashboard?.level || null;

  const getPlanStyle = (value: string) => {
    switch (value) {
      case "SILVER":
        return "bg-gray-400 text-yellow-200";
      case "GOLD":
        return "bg-yellow-500 text-black";
      case "ELITE":
        return "bg-black text-yellow-400";
      case "FREE":
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getLevelStyle = (value: string) => {
    switch (value) {
      case "BEGINNER":
        return "bg-blue-400 text-white";
      case "INTERMEDIATE":
        return "bg-gray-400 text-yellow-200";
      case "ADVANCED":
        return "bg-yellow-500 text-black";
      case "ELITE":
        return "bg-black text-yellow-400";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex justify-between items-center flex-wrap gap-3">
      <h1 className="text-3xl text-[#1DA2CF] font-bold">
        Family Office Dashboard
      </h1>

      <div className="text-sm text-white/60 text-right space-y-2">
        <div>
          Plan:{" "}
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${getPlanStyle(
              plan
            )}`}
          >
            {plan}
          </span>
        </div>

        {level && (
          <div>
            Niveau:{" "}
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getLevelStyle(
                level
              )}`}
            >
              {level}
            </span>
          </div>
        )}

        <button className="mt-2 px-3 py-1 bg-white text-blue-600 text-xs font-bold rounded hover:opacity-80 transition">
          Upgrade / Changer de plan
        </button>
      </div>
    </div>
  );
}
