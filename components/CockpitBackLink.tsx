import Link from "next/link";

type CockpitBackLinkProps = {
  className?: string;
};

export default function CockpitBackLink({ className = "" }: CockpitBackLinkProps) {
  return (
    <Link
      href="/dashboard"
      prefetch
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-gray-100 transition hover:border-[#3fa9f5]/40 hover:bg-[#3fa9f5]/10 ${className}`}
    >
      Retour cockpit
    </Link>
  );
}
