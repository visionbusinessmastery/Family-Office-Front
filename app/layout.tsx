import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, Quicksand } from "next/font/google";
import CookieConsentBanner from "@/components/privacy/CookieConsentBanner";
import EthanFloatingAdvisor from "@/components/dashboard/EthanFloatingAdvisor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* 🎯 Branding Family Office */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Family Office 2.0 | Vision Business Mastery",
  description:
    "Construis ton système financier personnel : business, investissement et structuration de capital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-white"
        style={{
          fontFamily: "var(--font-quicksand)",
        }}
      >
        {children}
        <EthanFloatingAdvisor />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
