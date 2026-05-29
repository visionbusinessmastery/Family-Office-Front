"use client";

import BrandMark from "@/components/BrandMark";

type AuthExperienceShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  compactBrand?: boolean;
  fullScreen?: boolean;
};

export default function AuthExperienceShell({
  children,
  title,
  subtitle,
  compactBrand = true,
  fullScreen = false,
}: AuthExperienceShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[url('/bg-family-office.jpg')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/82 to-[#061827]/90" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="pointer-events-none absolute left-[-10%] top-[18%] h-52 w-52 rounded-full bg-[#3fa9f5]/20 blur-3xl floating-glow" />
      <div className="pointer-events-none absolute bottom-[12%] right-[-8%] h-56 w-56 rounded-full bg-amber-300/15 blur-3xl floating-glow floating-glow-delay" />
      <svg
        className="wealth-lines pointer-events-none absolute inset-0 h-full w-full opacity-60"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 560 C180 480 300 500 460 420 C620 340 760 360 920 270 C1040 205 1120 190 1200 150"
          className="wealth-line wealth-line-one"
        />
        <path
          d="M0 650 C240 610 360 560 520 570 C710 585 820 470 980 430 C1080 405 1150 410 1200 380"
          className="wealth-line wealth-line-two"
        />
      </svg>

      <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-8">
        <BrandMark compact={compactBrand} />
      </div>

      {fullScreen ? (
        children
      ) : (
      <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-24">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-black text-white">{title}</h1>}
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
      )}
    </main>
  );
}
