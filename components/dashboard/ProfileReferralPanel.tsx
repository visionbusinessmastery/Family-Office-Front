"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type WealthProfile = {
  first_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  goals?: string[];
  horizon?: string | null;
  investor_profile?: string | null;
  risk_level?: string | null;
  main_currency?: string | null;
  motivation?: string | null;
};

type ReferralData = {
  referral_code?: string;
  referral_url?: string;
  stats?: {
    invites?: number;
    converted?: number;
    reward_xp?: number;
  };
};

type ProfileReferralPanelProps = {
  level?: string | null;
};

export default function ProfileReferralPanel({ level }: ProfileReferralPanelProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [profile, setProfile] = useState<WealthProfile>({});
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const profileData = await apiRequest<{ profile?: WealthProfile }>(
          "/profile/me",
          token
        );
        setProfile(profileData.profile || {});
      } catch {
        setProfile({});
      }

      try {
        const referralData = await apiRequest<ReferralData>("/referrals/me", token);
        setReferral(referralData);
      } catch {
        setReferral(null);
      }
    };

    if (token) load();
  }, [token]);

  const updateProfile = (key: keyof WealthProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleAvatarFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateProfile("avatar_url", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      await apiRequest("/profile/me", token, {
        method: "PUT",
        body: JSON.stringify({
          ...profile,
          goals: profile.goals || [profile.motivation].filter(Boolean),
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] bg-cover bg-center"
            style={
              profile.avatar_url
                ? { backgroundImage: `url(${profile.avatar_url})` }
                : undefined
            }
          >
            {profile.avatar_url ? (
              <span className="sr-only">Photo de profil</span>
            ) : (
              <span className="text-2xl font-black text-[#3fa9f5]">
                {(profile.first_name || "W").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Identité patrimoniale
            </p>
            <h2 className="mt-1 text-2xl font-bold">Profil utilisateur</h2>
            <p className="mt-1 text-sm text-gray-400">
              Niveau: {level || "en construction"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Prénom
            </span>
            <input
              value={profile.first_name || ""}
              onChange={(event) => updateProfile("first_name", event.target.value)}
              placeholder="Prénom"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#3fa9f5]"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Photo de profil
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleAvatarFile(event.target.files?.[0])}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white"
            />
          </label>
          <textarea
            value={profile.bio || ""}
            onChange={(event) => updateProfile("bio", event.target.value)}
            placeholder="Bio courte"
            rows={3}
            className="rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#3fa9f5] sm:col-span-2"
          />
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Horizon
            </span>
            <select
              value={profile.horizon || "5-10 ans"}
              onChange={(event) => updateProfile("horizon", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#3fa9f5]"
            >
              <option value="1-3 ans">1 - 3 ans</option>
              <option value="3-5 ans">3 - 5 ans</option>
              <option value="5-10 ans">5 - 10 ans</option>
              <option value="10 ans et plus">10 ans et plus</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Devise du compte
            </span>
            <select
              value={profile.main_currency || "EUR"}
              onChange={(event) => updateProfile("main_currency", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#3fa9f5]"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="CAD">CAD</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Profil d&apos;investissement
            </span>
            <select
              value={profile.risk_level || "equilibre"}
              onChange={(event) => updateProfile("risk_level", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#3fa9f5]"
            >
              <option value="prudent">Prudent</option>
              <option value="equilibre">Équilibré</option>
              <option value="dynamique">Dynamique</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Objectif visé
            </span>
            <select
              value={profile.motivation || ""}
              onChange={(event) => updateProfile("motivation", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-[#3fa9f5]"
            >
              <option value="">Objectif visé</option>
              <option value="liberte financiere">Liberté financière</option>
              <option value="revenus passifs">Revenus passifs</option>
              <option value="retraite">Retraite</option>
              <option value="famille">Famille</option>
              <option value="voyager">Voyager</option>
              <option value="independance">Indépendance</option>
            </select>
          </label>
        </div>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
        <h2 className="text-2xl font-bold">Inviter des amis</h2>
        <p className="mt-2 text-sm text-gray-400">
          Invite tes amis à découvrir l&apos;application et débloque des récompenses.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Code referral
          </p>
          <p className="mt-2 text-2xl font-black text-[#3fa9f5]">
            {referral?.referral_code || "En preparation"}
          </p>
          {referral?.referral_url && (
            <p className="mt-2 break-all text-xs text-gray-400">
              {referral.referral_url}
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-xs text-gray-500">Invites</p>
            <p className="font-bold">{referral?.stats?.invites || 0}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-xs text-gray-500">Actifs</p>
            <p className="font-bold">{referral?.stats?.converted || 0}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-xs text-gray-500">XP</p>
            <p className="font-bold">{referral?.stats?.reward_xp || 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
