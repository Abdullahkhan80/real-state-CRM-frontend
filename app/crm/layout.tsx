"use client";

import { ReactNode, useState, useEffect } from "react";
import { CrmProvider } from "../_crm/context";
import { Shell } from "../_crm/components";

export default function CrmLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nexa_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      document.documentElement.className = "dark";
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("nexa_theme", nextTheme);
    document.documentElement.className = nextTheme;
  };

  return (
    <CrmProvider>
      <Shell theme={theme} onToggleTheme={handleToggleTheme}>
        {children}
      </Shell>
    </CrmProvider>
  );
}
