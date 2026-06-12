"use client";

import { useEffect, useMemo, useState } from "react";
import AuthExperienceShell from "@/components/AuthExperienceShell";
import CockpitBackLink from "@/components/CockpitBackLink";
import { apiFetch, getApiUrl } from "@/lib/api-client";
import {
  ActionButton,
  MetricCard,
  TextField,
  WealthToast,
} from "@/components/ui/WealthUI";

type ConsentRecord = {
  accepted?: boolean;
  policy_version?: string;
  region?: string;
  created_at?: string;
};

type PrivacyCenterData = {
  policy_version: string;
  data_summary: Record<string, number>;
  consents: Record<string, ConsentRecord>;
  consent_history: Array<{
    consent_key: string;
    accepted: boolean;
    policy_version?: string;
    region?: string;
    created_at?: string;
  }>;
  preferences: {
    email_preferences?: Record<string, boolean>;
    ai_preferences?: Record<string, boolean>;
    cookie_preferences?: Record<string, boolean>;
  };
  deletion_request?: {
    status?: string;
    scheduled_for?: string;
  } | null;
  ai_disclosure: {
    provider: string;
    purpose: string;
    training: string;
    retention: string;
    human_note: string;
  };
};

const consentLabels: Record<string, string> = {
  terms_accepted: "Conditions generales",
  privacy_policy_accepted: "Politique de confidentialite",
  ai_processing_accepted: "Fonctionnement Ethan",
  marketing_emails_accepted: "Emails marketing",
  analytics_accepted: "Mesure d'usage",
  personalized_opportunities_accepted: "Opportunites personnalisees",
  weekly_reports_accepted: "Rapports hebdomadaires",
  third_party_data_processing_accepted: "Donnees partenaires",
};

const requiredConsentKeys = [
  "terms_accepted",
  "privacy_policy_accepted",
  "ai_processing_accepted",
];

const optionalConsentKeys = [
  "marketing_emails_accepted",
  "analytics_accepted",
  "personalized_opportunities_accepted",
  "weekly_reports_accepted",
  "third_party_data_processing_accepted",
];

const emailLabels: Record<string, string> = {
  weekly_reports: "Rapports hebdomadaires",
  marketing: "Actualites White Rock",
  product_updates: "Evolutions produit",
  opportunities: "Opportunites",
  challenges: "Challenges",
  onboarding: "Accompagnement onboarding",
  founder_program: "Programme fondateur",
};

const dataLabels: Record<string, string> = {
  portfolio: "Actifs portefeuille",
  real_estate: "Actifs immobiliers",
  ethan_memory: "Memoire Ethan",
  notifications: "Notifications",
  legacy: "Elements Dynasty",
  oauth_accounts: "Comptes sociaux",
};

const aiDisclosureLabels: Record<string, { title: string; intro: string }> = {
  provider: {
    title: "Ethan utilise",
    intro: "Service mobilise pour produire les reponses.",
  },
  purpose: {
    title: "Pourquoi",
    intro: "Finalite du traitement.",
  },
  training: {
    title: "Entrainement",
    intro: "Utilisation de tes donnees.",
  },
  retention: {
    title: "Conservation",
    intro: "Duree ou logique de conservation.",
  },
  human_note: {
    title: "Important",
    intro: "Limite de responsabilite et cadre d'usage.",
  },
};

const formatPrivacyDate = (value?: string | null) => {
  if (!value) return "Date non precisee";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

function ToggleRow({
  label,
  checked,
  onChange,
  locked,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  locked?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-sm font-semibold text-gray-100">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#3fa9f5] disabled:opacity-40"
      />
    </label>
  );
}

export default function PrivacyCenterPage() {
  const [token] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("token")
  );
  const [data, setData] = useState<PrivacyCenterData | null>(null);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [emailPreferences, setEmailPreferences] = useState<Record<string, boolean>>({});
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(true);

  const downloadBase = useMemo(() => getApiUrl("").replace(/\/$/, ""), []);

  const load = async (nextToken: string) => {
    setLoading(true);
    try {
      const response = await apiFetch<PrivacyCenterData>("/privacy/center", nextToken);
      setData(response);
      setConsents(
        Object.fromEntries(
          Object.keys(consentLabels).map((key) => [
            key,
            Boolean(response.consents?.[key]?.accepted),
          ])
        )
      );
      setEmailPreferences(response.preferences?.email_preferences || {});
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Impossible de charger le Privacy Center.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    Promise.resolve().then(() => load(token));

    const params = new URLSearchParams(window.location.search);
    const confirmToken = params.get("confirm_delete");
    if (confirmToken) {
      apiFetch(`/privacy/delete-account/confirm/${confirmToken}`, token, {
        method: "POST",
      })
        .then(() => {
          setToast({ type: "success", message: "Demande de suppression confirmee." });
          window.history.replaceState({}, "", "/privacy-center");
          Promise.resolve().then(() => load(token));
        })
        .catch(() => setToast({ type: "error", message: "Confirmation impossible ou deja traitee." }));
    }
  }, [token]);

  const saveConsents = async () => {
    if (!token) return;
    try {
      await apiFetch("/privacy/consents", token, {
        method: "PUT",
        body: JSON.stringify(consents),
      });
      setToast({ type: "success", message: "Consentements mis a jour." });
      await load(token);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Mise a jour impossible." });
    }
  };

  const saveEmailPreferences = async () => {
    if (!token) return;
    try {
      await apiFetch("/privacy/email-preferences", token, {
        method: "PUT",
        body: JSON.stringify(emailPreferences),
      });
      setToast({ type: "success", message: "Preferences email mises a jour." });
      await load(token);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Mise a jour impossible." });
    }
  };

  const requestExport = async (format: "json" | "csv" | "pdf") => {
    if (!token) return;
    try {
      const response = await apiFetch<{ download_url: string }>(
        "/privacy/export",
        token,
        {
          method: "POST",
          body: JSON.stringify({ format }),
        }
      );
      window.open(`${downloadBase}${response.download_url}`, "_blank", "noopener,noreferrer");
      setToast({ type: "success", message: "Export prepare. Le lien expire dans 7 jours." });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Export impossible." });
    }
  };

  const requestDeletion = async () => {
    if (!token) return;
    try {
      await apiFetch("/privacy/delete-account", token, {
        method: "POST",
        body: JSON.stringify({ password: deletePassword, reason: deleteReason }),
      });
      setDeletePassword("");
      setDeleteReason("");
      setToast({
        type: "success",
        message: "Demande enregistree. Confirme-la depuis l'email de securite.",
      });
      await load(token);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Demande impossible." });
    }
  };

  const cancelDeletion = async () => {
    if (!token) return;
    try {
      await apiFetch("/privacy/delete-account/cancel", token, { method: "POST" });
      setToast({ type: "success", message: "Demande de suppression annulee." });
      await load(token);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "Annulation impossible." });
    }
  };

  return (
    <AuthExperienceShell fullScreen>
      <WealthToast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-5 py-24 text-white sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
              Privacy Center
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">
              Tes donnees. Tes choix. Ta transparence.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
              Controle tes donnees, tes consentements et la maniere dont White Rock utilise tes informations.
            </p>
          </div>
          <CockpitBackLink />
        </div>

        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl">
            <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
              ))}
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Ton empreinte de donnees</h2>
                  <p className="mt-2 text-sm text-gray-400">
                    Une lecture simple de ce qui est rattache a ton compte White Rock.
                  </p>
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Version {data?.policy_version}
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {Object.entries(data?.data_summary || {}).map(([key, value]) => {
                  const label = dataLabels[key] || key;
                  const displayValue =
                    key === "ethan_memory"
                      ? Number(value || 0) > 0
                        ? "active"
                        : "inactive"
                      : value;

                  return (
                    <MetricCard key={key} label={label} value={displayValue} tone="primary" />
                  );
                })}
                <MetricCard
                  label="Historique"
                  value={(data?.consent_history || []).length > 0 ? "disponible" : "a venir"}
                  tone="primary"
                />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <h2 className="text-2xl font-black">Consentements</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Les choix essentiels assurent le fonctionnement de ton espace. Les choix optionnels restent modifiables a tout moment.
                </p>
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                      Obligatoires
                    </p>
                    <div className="mt-3 space-y-3">
                      {requiredConsentKeys.map((key) => (
                        <ToggleRow
                          key={key}
                          label={consentLabels[key]}
                          checked={Boolean(consents[key])}
                          locked
                          onChange={(value) =>
                            setConsents((current) => ({ ...current, [key]: value }))
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#ffd21a]">
                      Optionnels
                    </p>
                    <div className="mt-3 space-y-3">
                      {optionalConsentKeys.map((key) => (
                        <ToggleRow
                          key={key}
                          label={consentLabels[key]}
                          checked={Boolean(consents[key])}
                          onChange={(value) =>
                            setConsents((current) => ({ ...current, [key]: value }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <ActionButton onClick={saveConsents}>Enregistrer</ActionButton>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <h2 className="text-2xl font-black">Emails et rapports</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Choisis les messages que White Rock peut t&apos;envoyer.
                </p>
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                      Accompagnement
                    </p>
                    <div className="mt-3 space-y-3">
                      {["weekly_reports", "onboarding"].map((key) => (
                        <ToggleRow
                          key={key}
                          label={emailLabels[key]}
                          checked={Boolean(emailPreferences[key])}
                          onChange={(value) =>
                            setEmailPreferences((current) => ({ ...current, [key]: value }))
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#ffd21a]">
                      Actualites et opportunites
                    </p>
                    <div className="mt-3 space-y-3">
                      {["product_updates", "founder_program", "opportunities", "challenges", "marketing"].map((key) => (
                        <ToggleRow
                          key={key}
                          label={emailLabels[key]}
                          checked={Boolean(emailPreferences[key])}
                          onChange={(value) =>
                            setEmailPreferences((current) => ({ ...current, [key]: value }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <ActionButton onClick={saveEmailPreferences}>Enregistrer</ActionButton>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <h2 className="text-2xl font-black">Export de donnees</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Genere une copie securisee de ton profil, patrimoine, historique,
                  progression, abonnements et memoire Ethan.
                </p>
                <p className="mt-3 rounded-xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-3 text-sm leading-relaxed text-[#bfe8ff]">
                  Les exports sont generes de facon securisee et expirent automatiquement apres leur creation.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ActionButton onClick={() => requestExport("json")}>Archive complete</ActionButton>
                  <ActionButton variant="secondary" onClick={() => requestExport("csv")}>
                    Tableau
                  </ActionButton>
                  <ActionButton variant="ghost" onClick={() => requestExport("pdf")}>
                    PDF
                  </ActionButton>
                </div>
              </div>

              <div className="rounded-2xl border border-red-300/20 bg-red-950/20 p-5 backdrop-blur-xl">
                <h2 className="text-2xl font-black">Suppression du compte</h2>
                <p className="mt-2 text-sm leading-relaxed text-red-100/80">
                  Une demande active lance un delai de securite de 7 jours. Les
                  donnees de facturation legalement necessaires sont conservees.
                </p>
                <p className="mt-3 rounded-xl border border-red-300/20 bg-red-900/20 p-3 text-sm font-semibold text-red-100">
                  Cette action est irreversible une fois confirmee et executee.
                </p>
                {data?.deletion_request?.status === "pending" ||
                data?.deletion_request?.status === "confirmed" ? (
                  <div className="mt-5 rounded-xl border border-red-300/20 bg-black/30 p-4">
                    <p className="text-sm text-red-100">
                      Demande {data.deletion_request.status}. Execution prevue le{" "}
                      {data.deletion_request.scheduled_for || "delai en cours"}.
                    </p>
                    <div className="mt-4">
                      <ActionButton variant="secondary" onClick={cancelDeletion}>
                        Annuler la demande
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    <TextField
                      label="Mot de passe"
                      type="password"
                      value={deletePassword}
                      onChange={setDeletePassword}
                    />
                    <TextField
                      label="Raison optionnelle"
                      value={deleteReason}
                      onChange={setDeleteReason}
                    />
                    <ActionButton
                      variant="danger"
                      disabled={!deletePassword}
                      onClick={requestDeletion}
                    >
                      Demander la suppression
                    </ActionButton>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Ethan et traitement des donnees</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Une lecture claire de la maniere dont Ethan utilise les informations de ton espace White Rock.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {data?.ai_disclosure &&
                  Object.entries(data.ai_disclosure).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                        {aiDisclosureLabels[key]?.title || key}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-gray-500">
                        {aiDisclosureLabels[key]?.intro || "Information de transparence."}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-200">{value}</p>
                    </div>
                  ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Historique des actions sensibles</h2>
              <p className="mt-2 text-sm text-gray-400">
                Les modifications importantes de confidentialite apparaissent ici lorsque le backend les expose.
              </p>
              <div className="mt-5 space-y-3">
                {(data?.consent_history || []).slice(0, 5).map((item, index) => (
                  <div key={`${item.consent_key}-${item.created_at || index}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-white">
                        {consentLabels[item.consent_key] || item.consent_key}
                      </p>
                      <p className="text-xs text-gray-500">{formatPrivacyDate(item.created_at)}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      Consentement {item.accepted ? "active" : "desactive"}
                      {item.policy_version ? ` - version ${item.policy_version}` : ""}.
                    </p>
                  </div>
                ))}
                {(data?.consent_history || []).length === 0 && (
                  <p className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-400">
                    Aucun evenement sensible recent a afficher.
                  </p>
                )}
              </div>
            </section>

            <section id="policy" className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Transparence</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                White Rock applique une logique privacy by design : minimisation
                des donnees, consentements historises, audit des actions sensibles,
                expiration automatique des exports et suppression differee avec
                delai de securite.
              </p>
            </section>
          </div>
        )}
      </main>
    </AuthExperienceShell>
  );
}

