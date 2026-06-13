"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import BrandMark from "@/components/BrandMark";
import { apiFetch } from "@/lib/api-client";

type ReportItem = {
  label?: string;
  value?: number;
  percent?: number;
  title?: string;
  description?: string;
  why?: string;
  next_action?: string;
  impact?: string;
};

type WealthReport = {
  generated_at?: string;
  mask_sensitive?: boolean;
  company?: Record<string, string>;
  legal?: Record<string, string>;
  user?: Record<string, string | boolean | null>;
  profile?: Record<string, string | boolean | string[] | null>;
  finance?: {
    totals?: Record<string, number>;
    chart?: ReportItem[];
  };
  wealth?: {
    visible_wealth?: number;
    projected_wealth?: number;
    potential_gap?: number;
    completion_percent?: number;
    breakdown?: ReportItem[];
  };
  portfolio?: {
    total_value?: number;
    total_gain?: number;
    total_gain_percent?: number;
    allocation?: ReportItem[];
  };
  real_estate?: {
    totals?: Record<string, number>;
  };
  business?: {
    metrics?: Record<string, number>;
    narrative?: Record<string, string>;
    decision?: Record<string, string>;
  };
  intelligence?: {
    global_score?: number;
    level?: string;
    score_details?: Record<string, number>;
    advice?: string[];
    opportunities?: ReportItem[];
  };
  ceo_daily_briefing?: {
    headline?: string;
    priority_score?: number;
    why_today?: string;
    expected_outcome?: string;
    alternative_action?: string;
    metrics?: Record<string, number>;
    risk?: { description?: string };
    opportunity?: { description?: string };
    recommended_action?: { description?: string; estimated_time?: string };
    primary_action?: {
      type?: string;
      title?: string;
      description?: string;
      cta_label?: string;
      xp?: number;
      why?: string;
    };
    daily_loop?: {
      tasks?: DailyLoopTask[];
      history?: DailyLoopAction[];
    };
  };
  daily_loop_report?: {
    headline?: string;
    next_focus?: string;
    actions?: DailyLoopAction[];
    tasks?: DailyLoopTask[];
    open_tasks?: DailyLoopTask[];
    done_tasks?: DailyLoopTask[];
    xp_awarded?: number;
  };
  sources?: string[];
};

type DailyLoopAction = {
  action_key?: string;
  action_label?: string;
  action_title?: string;
  action_description?: string;
  status?: string;
  status_label?: string;
  xp_awarded?: number;
  created_at?: string | null;
};

type DailyLoopTask = {
  id?: number;
  title?: string;
  description?: string;
  mission_key?: string | null;
  priority?: string;
  status?: string;
  status_label?: string;
  created_at?: string | null;
  completed_at?: string | null;
};

const colors = ["#ffd21a", "#3fa9f5", "#16d99a", "#ff4d4f"];

const money = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const fmtMoney = (value?: number) => `${money.format(Number(value || 0))} EUR`;
const fmtDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(value))
    : "Date indisponible";

function Metric({
  label,
  value,
  tone = "blue",
}: {
  label: string;
  value: string;
  tone?: "blue" | "green" | "yellow" | "red";
}) {
  const styles = {
    blue: "border-[#3fa9f5]/35 bg-[#3fa9f5]/10 text-[#3fa9f5]",
    green: "border-[#16d99a]/35 bg-[#16d99a]/10 text-[#16d99a]",
    yellow: "border-[#ffd21a]/35 bg-[#ffd21a]/10 text-[#ffd21a]",
    red: "border-[#ff4d4f]/35 bg-[#ff4d4f]/10 text-[#ffb3b3]",
  };
  return (
    <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <p className="text-xs uppercase tracking-widest text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-zinc-950 p-5 ${className}`}>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function WealthReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<WealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maskSensitive, setMaskSensitive] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("access_token")
        : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch<WealthReport>(`/profile/wealth-report?mask_sensitive=${maskSensitive}`, token)
      .then(setReport)
      .catch((err) => {
        setReport(null);
        setError(
          err instanceof Error
            ? err.message
            : "Synthese indisponible. Redemarre le backend si la route vient d'etre ajoutee."
        );
      })
      .finally(() => setLoading(false));
  }, [maskSensitive, router]);

  const scoreData = useMemo(
    () =>
      Object.entries(report?.intelligence?.score_details || {}).map(([label, value]) => ({
        label,
        value: Number(value || 0),
      })),
    [report]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <BrandMark compact />
        <p className="mt-8 text-sm text-gray-400">Generation de la synthese...</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <BrandMark compact />
        <p className="mt-8 text-sm text-gray-400">
          {error || "Rapport indisponible."}
        </p>
      </main>
    );
  }

  const finance = report.finance?.totals || {};
  const realEstate = report.real_estate?.totals || {};
  const business = report.business?.metrics || {};

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white print:bg-white print:px-0 print:py-0 print:text-black">
      <style jsx global>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
          .print-page {
            border: 0 !important;
            box-shadow: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-5 print:max-w-none">
        <div className="print-hidden flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-gray-200"
          >
            Retour dashboard
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={maskSensitive}
                onChange={(event) => setMaskSensitive(event.target.checked)}
              />
              Masquer les infos sensibles
            </label>
            <button
              onClick={() => window.print()}
              className="rounded-xl bg-[#3fa9f5] px-4 py-2 text-sm font-black text-white"
            >
              Exporter en PDF
            </button>
          </div>
        </div>

        <section className="print-page rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(63,169,245,0.18),_transparent_35%),linear-gradient(135deg,#080b12,#020202)] p-6 print:bg-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <BrandMark />
            <div className="max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-4 print:border-gray-200 print:bg-white">
              <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">Synthese patrimoniale</p>
              <h1 className="mt-2 text-3xl font-black">Rapport complet utilisateur</h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-400 print:text-gray-700">
                Donnees consolidees par le backend White Rock. Document genere le {fmtDate(report.generated_at)}.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#ffd21a] print:text-gray-700">
                {report.legal?.disclaimer}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Patrimoine suivi" value={fmtMoney(report.wealth?.visible_wealth)} tone="blue" />
          <Metric label="Potentiel projete" value={fmtMoney(report.wealth?.projected_wealth)} tone="green" />
          <Metric label="Cashflow mensuel" value={fmtMoney(finance.cashflow)} tone={Number(finance.cashflow || 0) >= 0 ? "green" : "red"} />
          <Metric label="Score Family Office" value={`${report.intelligence?.global_score || 0}/100`} tone="yellow" />
        </div>

        {report.ceo_daily_briefing && (
          <Panel title="CEO Daily Briefing">
            <p className="text-lg font-black leading-snug text-white print:text-black">
              {report.ceo_daily_briefing.headline}
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
                <p className="text-xs uppercase tracking-widest text-red-200">Risque principal</p>
                <p className="mt-2 text-sm text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.risk?.description}
                </p>
              </div>
              <div className="rounded-xl border border-[#16d99a]/20 bg-[#16d99a]/10 p-4">
                <p className="text-xs uppercase tracking-widest text-[#16d99a]">Action recommandee</p>
                <p className="mt-2 text-sm text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.recommended_action?.description}
                </p>
              </div>
              <div className="rounded-xl border border-[#ffd21a]/20 bg-[#ffd21a]/10 p-4">
                <p className="text-xs uppercase tracking-widest text-[#ffd21a]">Opportunite</p>
                <p className="mt-2 text-sm text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.opportunity?.description}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[0.7fr_1.15fr_1.15fr]">
              <div className="rounded-xl border border-[#3fa9f5]/20 bg-[#3fa9f5]/10 p-4">
                <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">Priorite documentee</p>
                <p className="mt-2 text-2xl font-black text-white print:text-black">
                  {Number(report.ceo_daily_briefing.priority_score || 0)}/100
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 print:border-gray-200 print:bg-white">
                <p className="text-xs uppercase tracking-widest text-gray-500">Pourquoi maintenant</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.why_today ||
                    "Action priorisee par le backend White Rock."}
                </p>
              </div>
              <div className="rounded-xl border border-[#16d99a]/20 bg-[#16d99a]/10 p-4">
                <p className="text-xs uppercase tracking-widest text-[#16d99a]">Resultat attendu</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.expected_outcome ||
                    "Progression documentee et decision suivante plus fiable."}
                </p>
              </div>
            </div>
            {report.ceo_daily_briefing.alternative_action && (
              <div className="mt-4 rounded-xl border border-[#ffd21a]/20 bg-[#ffd21a]/10 p-4">
                <p className="text-xs uppercase tracking-widest text-[#ffd21a]">Alternative prudente</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.alternative_action}
                </p>
              </div>
            )}
            {report.ceo_daily_briefing.primary_action && (
              <div className="mt-4 rounded-xl border border-[#16d99a]/20 bg-[#16d99a]/10 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#16d99a]">
                      Action prioritaire documentee
                    </p>
                    <h3 className="mt-2 text-lg font-black text-white print:text-black">
                      {report.ceo_daily_briefing.primary_action.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#16d99a]/30 px-3 py-1 text-xs uppercase text-[#16d99a]">
                    {report.ceo_daily_briefing.primary_action.type || "action"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-200 print:text-gray-700">
                  {report.ceo_daily_briefing.primary_action.description}
                </p>
                {report.ceo_daily_briefing.primary_action.why && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-300 print:text-gray-700">
                    {report.ceo_daily_briefing.primary_action.why}
                  </p>
                )}
                <p className="mt-3 text-sm font-black text-[#16d99a]">
                  {report.ceo_daily_briefing.primary_action.cta_label || "Executer"}
                  {Number(report.ceo_daily_briefing.primary_action.xp || 0) > 0
                    ? ` - +${report.ceo_daily_briefing.primary_action.xp} XP`
                    : ""}
                </p>
              </div>
            )}
          </Panel>
        )}

        {report.daily_loop_report && (
          <Panel title="Boucle de progression documentee">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-lg font-black leading-snug text-white print:text-black">
                  {report.daily_loop_report.headline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-300 print:text-gray-700">
                  Prochaine priorite documentee:{" "}
                  {report.daily_loop_report.next_focus ||
                    "Aucune priorite ouverte pour le moment."}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Metric
                  label="Decisions"
                  value={`${report.daily_loop_report.actions?.length || 0}`}
                  tone="blue"
                />
                <Metric
                  label="Taches faites"
                  value={`${report.daily_loop_report.done_tasks?.length || 0}`}
                  tone="green"
                />
                <Metric
                  label="XP briefing"
                  value={`${report.daily_loop_report.xp_awarded || 0}`}
                  tone="yellow"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 print:border-gray-200 print:bg-white">
                <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
                  Decisions recentes
                </p>
                <div className="mt-3 space-y-3">
                  {(report.daily_loop_report.actions || []).slice(0, 5).map((action, index) => (
                    <div key={`${action.created_at || index}-${action.action_key}`} className="rounded-xl border border-white/10 bg-black/25 p-3 print:border-gray-200 print:bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-white print:text-black">
                          {action.action_title || action.action_label || "Decision du briefing"}
                        </p>
                        <span className="text-xs text-gray-500">
                          {action.created_at ? fmtDate(action.created_at) : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-gray-400 print:text-gray-700">
                        Statut: {action.status_label || action.status || "enregistre"}
                        {Number(action.xp_awarded || 0) > 0
                          ? ` - ${action.xp_awarded} XP`
                          : ""}
                      </p>
                    </div>
                  ))}
                  {(report.daily_loop_report.actions || []).length === 0 && (
                    <p className="text-sm text-gray-400 print:text-gray-700">
                      Aucune decision quotidienne documentee pour le moment.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 print:border-gray-200 print:bg-white">
                <p className="text-xs uppercase tracking-widest text-[#16d99a]">
                  Actions suivies
                </p>
                <div className="mt-3 space-y-3">
                  {(report.daily_loop_report.tasks || []).slice(0, 5).map((task) => (
                    <div key={task.id || task.title} className="rounded-xl border border-white/10 bg-black/25 p-3 print:border-gray-200 print:bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-white print:text-black">
                          {task.title || "Action suivie"}
                        </p>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase text-gray-400 print:border-gray-300">
                          {task.status_label || task.status || "a suivre"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-gray-400 print:text-gray-700">
                        {task.description || "Action issue du briefing quotidien."}
                      </p>
                    </div>
                  ))}
                  {(report.daily_loop_report.tasks || []).length === 0 && (
                    <p className="text-sm text-gray-400 print:text-gray-700">
                      Aucune action suivie n'est encore documentee.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Lecture patrimoniale">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.wealth?.breakdown || []}>
                  <CartesianGrid stroke="rgba(255,255,255,.08)" />
                  <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <Tooltip formatter={(value) => fmtMoney(Number(value))} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {(report.wealth?.breakdown || []).map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Structure financiere">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(report.finance?.chart || []).filter((item) => Number(item.value || 0) > 0)}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={104}
                    paddingAngle={3}
                  >
                    {(report.finance?.chart || []).map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmtMoney(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Investissements">
            <div className="space-y-3">
              <Metric label="Valeur totale" value={fmtMoney(report.portfolio?.total_value)} />
              <Metric label="Plus / moins-value" value={fmtMoney(report.portfolio?.total_gain)} tone={Number(report.portfolio?.total_gain || 0) >= 0 ? "green" : "red"} />
              <Metric label="Performance" value={`${Number(report.portfolio?.total_gain_percent || 0).toFixed(2)}%`} tone="yellow" />
            </div>
          </Panel>

          <Panel title="Immobilier">
            <div className="space-y-3">
              <Metric label="Valeur estimee" value={fmtMoney(realEstate.total_estimated_value)} tone="green" />
              <Metric label="Plus-value latente" value={fmtMoney(realEstate.total_potential_gain)} tone="yellow" />
              <Metric label="Rendement locatif" value={`${Number(realEstate.average_rental_yield || 0).toFixed(2)}%`} tone="blue" />
            </div>
          </Panel>

          <Panel title="Business">
            <div className="space-y-3">
              <Metric label="Chiffre d'affaires" value={fmtMoney(business.revenue)} tone="blue" />
              <Metric label="Charges" value={fmtMoney(business.charges)} tone="red" />
              <Metric label="Resultat" value={fmtMoney(business.result)} tone={Number(business.result || 0) >= 0 ? "green" : "red"} />
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Scorecard">
            {scoreData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={scoreData}>
                    <PolarGrid stroke="rgba(255,255,255,.14)" />
                    <PolarAngleAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#3fa9f5" fill="#3fa9f5" fillOpacity={0.26} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Scorecard non disponible.</p>
            )}
          </Panel>

          <Panel title="Priorites et opportunites">
            <div className="space-y-3">
              {(report.intelligence?.opportunities || []).slice(0, 5).map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-bold text-white">{item.title || item.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">
                    {item.why || item.description || item.impact || item.next_action || "Signal identifie par le moteur White Rock."}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Mentions et sources">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-bold">Donnees declaratives</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-400 print:text-gray-700">
                {report.legal?.data_notice}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-bold">{report.company?.company_name}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-400 print:text-gray-700">
                {report.company?.footer_note}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Sources: {(report.sources || []).join(", ")}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
