"use client";

import { useState } from "react";
import type { FinanceEntry, FinancePayload, FinanceType } from "@/lib/types";
import FinanceItem from "./FinanceItem";

type FinanceFormProps = {
  title: string;
  data: FinanceEntry[];
  onCreate: (payload: FinancePayload) => Promise<void>;
  onDelete?: (id: number) => void;
  onUpdate?: (item: FinanceEntry) => void;
};

export default function FinanceForm({
  title,
  data,
  onCreate,
  onDelete,
  onUpdate,
}: FinanceFormProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<FinanceType>("revenus");

  const handleAdd = async () => {
    if (!label || !amount) return;

    try {
      await onCreate({
        type,
        name: label,
        amount: Number(amount),
      });

      setLabel("");
      setAmount(0);
    } catch (err) {
      console.error("Finance create error:", err);
    }
  };

  return (
    <div className="bg-white/10 p-4 rounded-xl space-y-4">
      <h3 className="text-white font-bold">{title}</h3>

      <div className="space-y-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FinanceType)}
          className="w-full p-2 text-black rounded"
        >
          <option value="revenus">Revenus</option>
          <option value="charges">Charges</option>
          <option value="epargne">Epargne</option>
          <option value="dettes">Dettes</option>
        </select>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (ex: salaire)"
          className="w-full p-2 text-black rounded"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Montant"
          className="w-full p-2 text-black rounded"
        />

        <button
          onClick={handleAdd}
          className="bg-green-500 px-3 py-1 rounded w-full hover:opacity-80"
        >
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {data.map((item) => (
          <FinanceItem
            key={item.id}
            item={item}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
