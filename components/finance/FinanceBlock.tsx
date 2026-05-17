"use client";

import { useState } from "react";
import type { FinanceEntry, FinancePayload, FinanceType } from "@/lib/types";
import FinanceItem from "./FinanceItem";

type FinanceBlockProps = {
  title: string;
  type: FinanceType;
  data: FinanceEntry[];
  onCreate: (data: FinancePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (item: FinanceEntry) => Promise<void>;
  refresh?: () => Promise<void>;
  onAfterChange?: () => Promise<void>;
};

export default function FinanceBlock({
  title,
  data,
  onCreate,
  onDelete,
  onUpdate,
  refresh,
  onAfterChange,
  type,
}: FinanceBlockProps) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!label || !amount) {
      alert("Remplis tous les champs");
      return;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert("Montant invalide");
      return;
    }

    try {
      setLoading(true);
      await onCreate({ type, name: label, amount: numericAmount });

      setLabel("");
      setAmount("");
      setShowForm(false);

      await refresh?.();
      await onAfterChange?.();
    } catch (err) {
      console.error(err);
      alert("Erreur ajout");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocal = async (id: number) => {
    try {
      await onDelete(id);
      await refresh?.();
      await onAfterChange?.();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression");
    }
  };

  const handleUpdateLocal = async (item: FinanceEntry) => {
    try {
      await onUpdate(item);
      await refresh?.();
      await onAfterChange?.();
    } catch (err) {
      console.error(err);
      alert("Erreur modification");
    }
  };

  return (
    <div className="bg-white/10 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">{title}</h3>

        <button
          onClick={() => setShowForm((current) => !current)}
          className="text-xs bg-blue-500 px-3 py-1 rounded hover:opacity-80"
        >
          {showForm ? "Annuler" : "+ Ajouter"}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Salaire / Credit / Livret A"
            className="w-full p-2 rounded bg-zinc-900 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3fa9f5]"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant"
            className="w-full p-2 rounded bg-zinc-900 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#3fa9f5]"
          />

          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-full bg-green-500 p-2 rounded hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Ajout..." : "Valider"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {data.length > 0 ? (
          data.map((item) => (
            <FinanceItem
              key={item.id}
              item={item}
              onDelete={() => handleDeleteLocal(item.id)}
              onUpdate={() => handleUpdateLocal(item)}
            />
          ))
        ) : (
          <p className="text-white/50 text-sm">Aucun element pour le moment</p>
        )}
      </div>
    </div>
  );
}
