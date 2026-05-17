import type { FinanceEntry } from "@/lib/types";

type FinanceItemProps = {
  item: FinanceEntry;
  onDelete?: (id: number) => void;
  onUpdate?: (item: FinanceEntry) => void;
};

export default function FinanceItem({
  item,
  onDelete,
  onUpdate,
}: FinanceItemProps) {
  return (
    <div className="flex justify-between items-center bg-black/30 p-3 rounded hover:bg-black/40 transition">
      <div className="flex flex-col">
        <p className="font-semibold text-white">
          {item.name || item.label || "Sans nom"}
        </p>

        <p className="text-sm text-white/60">
          {Number(item.amount || 0).toLocaleString("fr-FR")} EUR
        </p>

        {item.type && (
          <span className="text-xs text-white/40 uppercase">{item.type}</span>
        )}
      </div>

      <div className="flex gap-3 text-sm items-center">
        <button
          onClick={() => onUpdate?.(item)}
          className="text-blue-400 hover:opacity-70"
          title="Modifier"
        >
          Editer
        </button>

        <button
          onClick={() => onDelete?.(item.id)}
          className="text-red-400 hover:opacity-70"
          title="Supprimer"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
