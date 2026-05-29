"use client";

import { useEffect, useState } from "react";

const themes = [
  { key: "dark", label: "Dark" },
  { key: "light", label: "Light" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("wealthTheme") || "dark"
      : "dark"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme =
      theme === "light" ? "light" : "dark";
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
