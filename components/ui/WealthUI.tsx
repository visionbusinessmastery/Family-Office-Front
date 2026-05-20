"use client";

import type { ReactNode } from "react";

type ActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  className?: string;
  icon?: string;
};

const buttonStyles = {
  primary:
    "border-[#3fa9f5]/50 bg-[#3fa9f5] text-white hover:bg-[#2588d2]",
  secondary:
    "border-white/10 bg-white/[0.05] text-gray-100 hover:border-[#3fa9f5]/40 hover:bg-[#3fa9f5]/10",
  danger:
    "border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20",
  ghost:
    "border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.05]",
};

export function ActionButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = "",
  icon,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    >
      {icon && <span className="text-xs">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
};

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#3fa9f5]/60"
      />
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-3 text-sm text-white outline-none transition focus:border-[#3fa9f5]/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type ModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export function WealthModal({
  open,
  title,
  eyebrow = "WHITE ROCK",
  description,
  children,
  footer,
  onClose,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl">
      <div className="fade-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {description}
              </p>
            )}
          </div>
          <ActionButton variant="ghost" onClick={onClose}>
            Fermer
          </ActionButton>
        </div>

        <div className="mt-5">{children}</div>

        {footer && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

type ToastProps = {
  message?: string | null;
  type?: "success" | "error" | "info";
  onClose?: () => void;
};

export function WealthToast({ message, type = "info", onClose }: ToastProps) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
      : type === "error"
        ? "border-red-300/30 bg-red-500/10 text-red-100"
        : "border-[#3fa9f5]/30 bg-[#3fa9f5]/10 text-blue-100";

  return (
    <div className={`fade-in fixed right-4 top-24 z-50 max-w-sm rounded-xl border p-4 text-sm shadow-2xl backdrop-blur-xl ${styles}`}>
      <div className="flex items-start justify-between gap-4">
        <p>{message}</p>
        {onClose && (
          <button onClick={onClose} className="text-xs text-white/60">
            fermer
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title = "Aucune donnee pour le moment",
  description = "Ajoute un premier element pour enrichir ton cockpit.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-center">
      <p className="font-bold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "primary" | "success" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "text-[#3fa9f5]"
      : tone === "success"
        ? "text-emerald-300"
        : tone === "danger"
          ? "text-red-300"
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
      <div className={`mt-2 text-xl font-black ${toneClass}`}>{value}</div>
    </div>
  );
}
