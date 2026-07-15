"use client";

import { FormEvent, useState, useEffect } from "react";
import { CrmDashboard } from "./_crm/dashboard";
import { apiBase } from "./_crm/data";
import { Icon } from "./_crm/icon";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we are already logged in from localStorage
  useEffect(() => {
    const token = localStorage.getItem("nexa_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (response.ok && payload.success) {
        localStorage.setItem("nexa_token", payload.data?.accessToken || "demo-token");
        localStorage.setItem("nexa_user", JSON.stringify(payload.data?.user || { name: "System Admin", role: "ADMIN" }));
        setIsAuthenticated(true);
      } else {
        setError(payload.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      // Fallback to offline demo mode
      console.log("Backend offline or DB error, using offline verification...", err);
      if (email === "admin@nexaestate.local" && password === "ChangeMe!2026") {
        localStorage.setItem("nexa_token", "demo-token-12345");
        localStorage.setItem("nexa_user", JSON.stringify({ name: "System Admin", role: "ADMIN", email }));
        setIsAuthenticated(true);
      } else if (email === "demo@nexaestate.local") {
        localStorage.setItem("nexa_token", "demo-token-67890");
        localStorage.setItem("nexa_user", JSON.stringify({ name: "Demo User", role: "SALES_AGENT", email }));
        setIsAuthenticated(true);
      } else {
        setError("Could not connect to backend. Use credentials: admin@nexaestate.local / ChangeMe!2026");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: "ADMIN" | "SALES_AGENT") => {
    setLoading(true);
    setTimeout(() => {
      if (role === "ADMIN") {
        localStorage.setItem("nexa_token", "demo-token-admin");
        localStorage.setItem("nexa_user", JSON.stringify({ name: "System Admin", role: "ADMIN", email: "admin@nexaestate.local" }));
      } else {
        localStorage.setItem("nexa_token", "demo-token-agent");
        localStorage.setItem("nexa_user", JSON.stringify({ name: "Sara Khan", role: "SALES_AGENT", email: "sara@nexaestate.local" }));
      }
      setIsAuthenticated(true);
      setLoading(false);
    }, 800);
  };

  if (isAuthenticated) {
    return <CrmDashboard />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090d16] font-sans text-zinc-100">
      {/* Background visual graphics */}
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[80vw] w-[80vw] rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="relative w-full max-w-md px-6">
        {/* Logo / Branding */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/30">
            <Icon name="home" className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NexaEstate AI CRM</h1>
          <p className="mt-1 text-sm text-zinc-400">Autonomous Real Estate Sales Operations</p>
        </div>

        {/* Login Form Panel */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Workspace Sign In</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-xs font-medium text-rose-400 ring-1 ring-rose-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@nexaestate.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-teal-500 focus:bg-white/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-teal-500 focus:bg-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            <span>OR QUICK ACCESS</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemoLogin("ADMIN")}
              type="button"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
            >
              <Icon name="shield" className="h-3.5 w-3.5 text-teal-400" />
              Demo Admin
            </button>
            <button
              onClick={() => handleDemoLogin("SALES_AGENT")}
              type="button"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
            >
              <Icon name="agent" className="h-3.5 w-3.5 text-teal-400" />
              Demo Agent
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          Powered by NexaEstate AI Call & Chat Agent. All rights reserved.
        </p>
      </div>
    </main>
  );
}