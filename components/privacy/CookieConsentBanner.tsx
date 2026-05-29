"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { ActionButton } from "@/components/ui/WealthUI";

const STORAGE_KEY = "whiteRockCookieConsent";
const ANON_KEY = "whiteRockAnonymousId";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

function getAnonymousId() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(ANON_KEY);
  if (existing) return existing;

  const next = `anon_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  localStorage.setItem(ANON_KEY, next);
  return next;
}

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      setVisible(!localStorage.getItem(STORAGE_KEY));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const persist = async (next: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setVisible(false);

    try {
      await fetch(`${API_BASE_URL}/privacy/cookie-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous_id: getAnonymousId(),
          preferences: next,
        }),
      });
    } catch {
      // The local preference remains authoritative for analytics blocking.
    }
  };

  if (!mounted || !visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-4xl rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
            Confidentialite WHITE ROCK
          </p>
          <h2 className="mt-2 text-lg font-black">Controle tes donnees</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Les cookies essentiels assurent la securite. Les autres categories
            servent uniquement a ameliorer l&apos;experience si tu les acceptes.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ["analytics", "Mesure d'usage"],
              ["marketing", "Messages et campagnes"],
              ["personalization", "Experience personnalisee"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={preferences[key as keyof CookiePreferences]}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[#3fa9f5]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <ActionButton onClick={() => persist({ ...defaultPreferences })} variant="ghost">
            Essentiels seulement
          </ActionButton>
          <ActionButton
            onClick={() =>
              persist({
                essential: true,
                analytics: true,
                marketing: true,
                personalization: true,
              })
            }
            variant="secondary"
          >
            Tout accepter
          </ActionButton>
          <ActionButton onClick={() => persist(preferences)}>Enregistrer</ActionButton>
        </div>
      </div>
    </div>
  );
}
