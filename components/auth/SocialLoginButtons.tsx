"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type Provider = {
  id: string;
  label: string;
  enabled: boolean;
  coming_soon?: boolean;
};

type SocialLoginButtonsProps = {
  redirect?: string;
  disabled?: boolean;
  compact?: boolean;
};

const providerStyles: Record<string, string> = {
  google: "border-white/15 bg-white text-black hover:bg-blue-50",
  apple: "border-white/15 bg-black/70 text-white hover:bg-white/10",
};

const providerIcon: Record<string, string> = {
  google: "G",
  apple: "",
};

export default function SocialLoginButtons({
  redirect = "/dashboard",
  disabled = false,
  compact = false,
}: SocialLoginButtonsProps) {
  const [providers, setProviders] = useState<Provider[]>([
    { id: "google", label: "Google", enabled: true },
    { id: "apple", label: "Apple", enabled: true },
  ]);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/oauth/providers`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.providers)) {
          setProviders(
            data.providers.filter((provider: Provider) =>
              ["google", "apple"].includes(provider.id)
            )
          );
        }
      })
      .catch(() => undefined);
  }, []);

  const startOAuth = (provider: Provider) => {
    if (disabled) {
      window.alert("Accepte les conditions requises avant de continuer avec un provider social.");
      return;
    }

    if (!provider.enabled || provider.coming_soon) {
      window.alert(`${provider.label} OAuth est en cours de configuration.`);
      return;
    }

    setLoadingProvider(provider.id);
    window.location.assign(
      `${API_BASE_URL}/auth/oauth/${provider.id}/start?redirect=${encodeURIComponent(redirect)}`
    );
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {providers.map((provider) => {
        const providerDisabled =
          Boolean(loadingProvider);
        const helperText = provider.coming_soon
          ? "Bientôt disponible"
          : !provider.enabled
            ? "Configuration en cours"
            : disabled
              ? "Consentements requis"
              : null;

        return (
          <button
            key={provider.id}
            type="button"
            disabled={providerDisabled}
            title={helperText || `Continuer avec ${provider.label}`}
            onClick={() => startOAuth(provider)}
            className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold shadow-lg shadow-black/10 transition disabled:cursor-not-allowed disabled:opacity-60 ${providerStyles[provider.id] || "border-white/10 bg-white/[0.06] text-white"}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-base">
              {providerIcon[provider.id] || provider.label.slice(0, 1)}
            </span>
            <span className="flex flex-col leading-tight">
              <span>
                {loadingProvider === provider.id
                  ? "Connexion..."
                  : `Continuer avec ${provider.label}`}
              </span>
              {helperText && (
                <span className="text-[10px] font-medium opacity-70">
                  {helperText}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
