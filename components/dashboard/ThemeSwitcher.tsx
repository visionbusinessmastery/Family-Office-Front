"use client";

import { useEffect, useState } from "react";

const themes = [
  { key: "midnight", label: "Midnight" },
  { key: "arctic", label: "Arctic" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("wealthTheme") || "midnight"
      : "midnight"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const updateTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    localStorage.setItem("wealthTheme", nextTheme);
  };

  return (
    <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
      {themes.map((item) => (
        <button
          key={item.key}
          onClick={() => updateTheme(item.key)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            theme === item.key
              ? "bg-white text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
