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
  sources?: string[];
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

    setLoading(true);
    apiFetch<WealthReport>(`/profile/wealth-report?mask_sensitive=${maskSensitive}`, token)
      .then(setReport)
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
        <p className="mt-8 text-sm text-gray-400">Rapport indisponible.</p>
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
