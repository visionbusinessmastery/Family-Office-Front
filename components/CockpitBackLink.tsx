import Link from "next/link";

type CockpitBackLinkProps = {
  className?: string;
};

export default function CockpitBackLink({ className = "" }: CockpitBackLinkProps) {
  return (
    <Link
      href="/dashboard"
      prefetch
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#3fa9f5]/45 bg-[#3fa9f5]/10 px-4 py-2.5 text-sm font-black text-[#8bd0ff] shadow-lg shadow-[#3fa9f5]/10 transition hover:-translate-y-0.5 hover:border-[#3fa9f5]/70 hover:bg-[#3fa9f5]/20 hover:text-white ${className}`}
    >
      <span aria-hidden="true">←</span>
      <span>Retour cockpit</span>
    </Link>
  );
}
