"use client";

import type { AffiliatePartnerData } from "@/lib/types";

type AffiliatePartnersPanelProps = {
  data?: AffiliatePartnerData | null;
};

const categoryTone = (category?: string) => {
  switch ((category || "").toLowerCase()) {
    case "ai_business":
    case "business":
    case "startup":
      return "border-[#16d99a]/25 bg-[#16d99a]/10 text-[#16d99a]";
    case "banking":
    case "market":
    case "stocks":
    case "etf":
    case "trading":
      return "border-[#3fa9f5]/25 bg-[#3fa9f5]/10 text-[#8bd0ff]";
    case "crypto":
    case "commodities":
      return "border-[#ffd21a]/25 bg-[#ffd21a]/10 text-[#ffd21a]";
    default:
      return "border-[#f87171]/25 bg-[#f87171]/10 text-[#fca5a5]";
  }
};

export default function AffiliatePartnersPanel({
  data,
}: AffiliatePartnersPanelProps) {
  const partners = data?.partners || [];

  const openPartner = (url?: string) => {
    if (!url || typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#ffd21a]">
            Partenaires
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Opportunites partenaires
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">
            Des partenaires repertories par le backend pour explorer outils, plateformes et services utiles selon les univers White Rock.
          </p>
        </div>
        <span className="text-sm text-[#3fa9f5]">
          {partners.length} partenaire(s)
        </span>
      </div>

      {partners.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-400">
          Aucun partenaire disponible pour le moment.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => (
            <article
              key={partner.id || `${partner.category}-${partner.name}`}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    {partner.category_label || partner.category || "Partenaire"}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-white">
                    {partner.name || "Partenaire"}
                  </h3>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${categoryTone(partner.category)}`}
                >
                  {partner.category_label || partner.category || "WR"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                {partner.description || "Partenaire repertorie par le backend White Rock."}
              </p>
              {partner.benefit && partner.benefit !== partner.description && (
                <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm leading-relaxed text-gray-400">
                  {partner.benefit}
                </p>
              )}

              <button
                type="button"
                onClick={() => openPartner(partner.url)}
                disabled={!partner.url}
                className="mt-4 w-full rounded-xl border border-[#3fa9f5]/35 bg-[#3fa9f5]/10 px-4 py-3 text-sm font-bold text-[#8bd0ff] transition hover:border-[#3fa9f5]/60 hover:bg-[#3fa9f5]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Decouvrir
              </button>
            </article>
          ))}
        </div>
      )}

      {data?.sync && (
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Synchronisation: {data.sync}
        </p>
      )}
    </section>
  );
}
