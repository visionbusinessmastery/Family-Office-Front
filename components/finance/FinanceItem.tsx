import type { FinanceEntry } from "@/lib/types";
import { ActionButton } from "@/components/ui/WealthUI";

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
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3 transition hover:bg-black/40">
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

      <div className="flex items-center gap-2">
        <ActionButton
          onClick={() => onUpdate?.(item)}
          variant="secondary"
          className="px-3 py-1.5 text-xs"
        >
          Modifier
        </ActionButton>

        <ActionButton
          onClick={() => onDelete?.(item.id)}
          variant="danger"
          className="px-3 py-1.5 text-xs"
        >
          Supprimer
        </ActionButton>
      </div>
    </div>
  );
}

