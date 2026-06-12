"use client";

import { useState } from "react";
import type { FinanceEntry, FinancePayload, FinanceType } from "@/lib/types";
import FinanceItem from "./FinanceItem";
import {
  ActionButton,
  EmptyState,
  TextField,
  WealthModal,
  WealthToast,
} from "@/components/ui/WealthUI";

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
  const [editing, setEditing] = useState<FinanceEntry | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setLabel("");
    setAmount("");
    setShowForm(true);
  };

  const openEdit = (item: FinanceEntry) => {
    setEditing(item);
    setLabel(item.name || item.label || "");
    setAmount(String(item.amount || 0));
    setShowForm(true);
  };

  const handleAdd = async () => {
    if (!label || !amount) {
      setToast({ message: "Complete tous les champs avant de valider.", type: "error" });
      return;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setToast({ message: "Le montant doit etre superieur a zero.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      if (editing) {
        await onUpdate({ ...editing, name: label, amount: numericAmount });
      } else {
        await onCreate({ type, name: label, amount: numericAmount });
      }

      setLabel("");
      setAmount("");
      setEditing(null);
      setShowForm(false);

      await refresh?.();
      await onAfterChange?.();
      setToast({
        message: editing ? "Element modifie." : "Element ajoute.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({ message: "Impossible d'enregistrer cet element.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocal = async (id: number) => {
    try {
      await onDelete(id);
      await refresh?.();
      await onAfterChange?.();
      setToast({ message: "Element supprime.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Impossible de supprimer cet element.", type: "error" });
    }
  };

  const handleUpdateLocal = async (item: FinanceEntry) => {
    openEdit(item);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <WealthToast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{title}</h3>

        <ActionButton onClick={openCreate} icon="+">
          Ajouter
        </ActionButton>
      </div>

      <WealthModal
        open={showForm}
        title={editing ? `Modifier ${title}` : `Ajouter ${title}`}
        description="Garde une saisie simple et claire. Les montants sont exprimes en EUR."
        onClose={() => setShowForm(false)}
        footer={
          <>
            <ActionButton variant="secondary" onClick={() => setShowForm(false)}>
              Annuler
            </ActionButton>
            <ActionButton onClick={handleAdd} disabled={loading}>
              {loading ? "Enregistrement..." : "Valider"}
            </ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Nom"
            value={label}
            onChange={setLabel}
            placeholder="Ex: Salaire / Credit / Livret A"
          />

          <TextField
            label="Montant"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="Montant"
          />
        </div>
      </WealthModal>

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
          <EmptyState
            title="Aucun element"
            description="Ajoute un premier mouvement pour clarifier cette rubrique."
            action={<ActionButton onClick={openCreate}>Ajouter</ActionButton>}
          />
        )}
      </div>
    </div>
  );
}
