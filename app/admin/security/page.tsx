"use client";

import { useEffect, useState } from "react";
import AuthExperienceShell from "@/components/AuthExperienceShell";
import CockpitBackLink from "@/components/CockpitBackLink";
import { apiFetch } from "@/lib/api-client";
import { MetricCard, WealthToast } from "@/components/ui/WealthUI";

type SecuritySummary = {
  events: Array<{ event_type: string; severity: string; count: number }>;
  recent: Array<{
    event_type: string;
    severity: string;
    email?: string;
    ip_address?: string;
    created_at?: string;
  }>;
  rate_limits: Array<{ scope: string; actors: number; requests: number }>;
  suspicious_ips: Array<{ ip_address: string; events: number }>;
};

export default function SecurityAdminPage() {
  const [data, setData] = useState<SecuritySummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    apiFetch<SecuritySummary>("/security/admin/summary", token)
      .then(setData)
      .catch((error) => {
        setToast(error instanceof Error ? error.message : "Acces securite indisponible.");
      });
  }, []);

  return (
    <AuthExperienceShell fullScreen>
      <WealthToast message={toast} type="error" onClose={() => setToast(null)} />
      <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-5 py-24 text-white">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-red-200">
              Security Operations
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-5xl">
              Surveillance production
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
              Vue interne des signaux de securite, abus, limites et evenements sensibles.
            </p>
          </div>
          <CockpitBackLink />
        </div>

        {!data ? (
          <div className="rounded-2xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl">
            <div className="h-4 w-48 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/[0.05]" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-3 sm:grid-cols-4">
              <MetricCard label="Evenements 7j" value={data.events.reduce((sum, item) => sum + item.count, 0)} tone="primary" />
              <MetricCard label="Rate limit scopes" value={data.rate_limits.length} />
              <MetricCard label="IPs suspectes" value={data.suspicious_ips.length} tone="danger" />
              <MetricCard label="Alertes recentes" value={data.recent.length} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <h2 className="text-2xl font-black">Evenements</h2>
                <div className="mt-4 space-y-2">
                  {data.events.map((event) => (
                    <div key={`${event.event_type}-${event.severity}`} className="flex justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-sm">
                      <span>{event.event_type}</span>
                      <span className="text-gray-400">{event.severity} · {event.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <h2 className="text-2xl font-black">Limites</h2>
                <div className="mt-4 space-y-2">
                  {data.rate_limits.map((item) => (
                    <div key={item.scope} className="flex justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-sm">
                      <span>{item.scope}</span>
                      <span className="text-gray-400">{item.requests} demandes · {item.actors} acteurs</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
              <h2 className="text-2xl font-black">Journal recent</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                {data.recent.map((event, index) => (
                  <div
                    key={`${event.event_type}-${event.created_at}-${index}`}
                    className="grid gap-2 border-b border-white/10 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_0.8fr_0.8fr_0.8fr]"
                  >
                    <span>{event.event_type}</span>
                    <span className="text-gray-400">{event.severity}</span>
                    <span className="text-gray-400">{event.email || event.ip_address || "-"}</span>
                    <span className="text-gray-500">{event.created_at || "-"}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </AuthExperienceShell>
  );
}
