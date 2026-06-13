"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api-client";

type ContactNetwork = {
  key?: string;
  label?: string;
  url?: string;
  display?: string;
  icon?: string;
};

type ContactData = {
  brand?: string;
  title?: string;
  description?: string;
  email?: string;
  website?: string;
  networks?: ContactNetwork[];
};

const fallbackContact: ContactData = {
  brand: "Vision Business Mastery",
  title: "Contact et reseau",
  description: "Retrouve Vision Business Mastery sur les principaux canaux officiels.",
  networks: [
    {
      key: "email",
      label: "Email",
      url: "mailto:visionbusinessmastery@gmail.com",
      display: "visionbusinessmastery@gmail.com",
      icon: "mail",
    },
  ],
};

const iconLabels: Record<string, string> = {
  mail: "@",
  web: "W",
  facebook: "f",
  linkedin: "in",
  youtube: "YT",
  instagram: "IG",
  tiktok: "TT",
};

const iconColors: Record<string, string> = {
  mail: "border-[#ffd21a]/35 bg-[#ffd21a]/10 text-[#ffd21a]",
  web: "border-[#3fa9f5]/35 bg-[#3fa9f5]/10 text-[#3fa9f5]",
  facebook: "border-[#3fa9f5]/35 bg-[#3fa9f5]/10 text-[#3fa9f5]",
  linkedin: "border-[#3fa9f5]/35 bg-[#3fa9f5]/10 text-[#3fa9f5]",
  youtube: "border-[#ff4d4f]/35 bg-[#ff4d4f]/10 text-[#ffb3b3]",
  instagram: "border-[#16d99a]/35 bg-[#16d99a]/10 text-[#16d99a]",
  tiktok: "border-white/15 bg-white/[0.05] text-white",
};

export default function ContactLinks({
  variant = "footer",
}: {
  variant?: "footer" | "panel" | "compact";
}) {
  const [data, setData] = useState<ContactData>(fallbackContact);

  useEffect(() => {
    fetch(getApiUrl("/company/contact"))
      .then((response) => (response.ok ? response.json() : fallbackContact))
      .then((payload) => setData(payload || fallbackContact))
      .catch(() => setData(fallbackContact));
  }, []);

  const networks = data.networks || [];

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {networks.map((item) => (
          <a
            key={item.key || item.label}
            href={item.url}
            target={item.url?.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-black ${
              iconColors[item.icon || "web"] || iconColors.web
            }`}
            aria-label={item.label}
          >
            {iconLabels[item.icon || "web"] || "W"}
          </a>
        ))}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <footer className="flex flex-col gap-3 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <span>{data.brand || "Vision Business Mastery"}</span>
        <ContactLinks variant="compact" />
      </footer>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <p className="text-xs uppercase tracking-widest text-[#3fa9f5]">
        {data.brand || "Vision Business Mastery"}
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        {data.title || "Contact et reseau"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">
        {data.description}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {networks.map((item) => (
          <a
            key={item.key || item.label}
            href={item.url}
            target={item.url?.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#3fa9f5]/40 hover:bg-[#3fa9f5]/10"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-black ${
                  iconColors[item.icon || "web"] || iconColors.web
                }`}
              >
                {iconLabels[item.icon || "web"] || "W"}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-white">{item.label}</p>
                <p className="truncate text-xs text-gray-500 group-hover:text-gray-300">
                  {item.display || item.url}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
