import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandMark({ compact = false, className = "" }: BrandMarkProps) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <div
        className={`shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/10 ${
          compact ? "h-10 w-10" : "h-14 w-14"
        }`}
      >
        <Image
          src="/logo.png"
          alt="WHITE ROCK"
          width={compact ? 40 : 56}
          height={compact ? 40 : 56}
          className="h-full w-full object-cover"
          priority={!compact}
        />
      </div>
      <div className="min-w-0">
        <p
          className={`truncate font-black tracking-[0.18em] text-white ${
            compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-5xl"
          }`}
        >
          WHITE ROCK
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/45 sm:text-xs">
          by Vision Business
        </p>
        {!compact && (
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#3fa9f5]">
            Wealth Operating System
          </p>
        )}
      </div>
    </div>
  );
}
