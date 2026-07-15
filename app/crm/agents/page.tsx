"use client";

import { useCrm } from "../../_crm/context";
import { Badge, Field, Icon } from "../../_crm/components";
import { agentCards as initialAgentCards } from "../../_crm/data";

export default function AgentsPage() {
  const { botConfigs, setBotConfigs } = useCrm();

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      <section className="space-y-6">
        {/* Bot Customizer Controls Panel */}
        <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-lg backdrop-blur transition-colors duration-200">
          <div className="mb-4 flex items-center justify-between premium-border-b pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">AI Responder Configuration</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Define prompts and voice profiles for autonomous bots</p>
            </div>
            <Icon name="agent" className="h-5 w-5 text-teal-400" />
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <Field label="Meta Chat Bot System Prompt (WhatsApp, Instagram, Facebook)">
                <textarea
                  value={botConfigs.metaPrompt}
                  onChange={(e) => setBotConfigs(prev => ({ ...prev, metaPrompt: e.target.value }))}
                  className="mt-1 h-20 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 py-2 text-xs text-[var(--text-title)] outline-none focus:border-teal-500 resize-none font-medium leading-relaxed transition-colors duration-200"
                />
              </Field>
            </div>

            <div>
              <Field label="AI Phone Agent Callback Prompt Instruction">
                <textarea
                  value={botConfigs.callPrompt}
                  onChange={(e) => setBotConfigs(prev => ({ ...prev, callPrompt: e.target.value }))}
                  className="mt-1 h-20 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 py-2 text-xs text-[var(--text-title)] outline-none focus:border-teal-500 resize-none font-medium leading-relaxed transition-colors duration-200"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Agent Voice Model">
                <select
                  value={botConfigs.voice}
                  onChange={(e) => setBotConfigs(prev => ({ ...prev, voice: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                >
                  <option value="Bella (Female)">Bella (Female) - Warm & Professional</option>
                  <option value="Marcus (Male)">Marcus (Marcus) - Confident & Clear</option>
                  <option value="Sophia (Female)">Sophia (Sophia) - Friendly & Polite</option>
                  <option value="David (Male)">David (David) - Executive & Authoritative</option>
                </select>
              </Field>

              <div>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Meta Channels Active</span>
                <div className="flex gap-4 mt-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-body)] hover:text-[var(--text-title)]">
                    <input
                      type="checkbox"
                      checked={botConfigs.channels.whatsapp}
                      onChange={(e) => setBotConfigs(prev => ({ ...prev, channels: { ...prev.channels, whatsapp: e.target.checked } }))}
                      className="accent-teal-500 rounded border-[var(--border-color)]"
                    />
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-body)] hover:text-[var(--text-title)]">
                    <input
                      type="checkbox"
                      checked={botConfigs.channels.instagram}
                      onChange={(e) => setBotConfigs(prev => ({ ...prev, channels: { ...prev.channels, instagram: e.target.checked } }))}
                      className="accent-teal-500 rounded border-[var(--border-color)]"
                    />
                    Instagram
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-body)] hover:text-[var(--text-title)]">
                    <input
                      type="checkbox"
                      checked={botConfigs.channels.facebook}
                      onChange={(e) => setBotConfigs(prev => ({ ...prev, channels: { ...prev.channels, facebook: e.target.checked } }))}
                      className="accent-teal-500 rounded border-[var(--border-color)]"
                    />
                    Facebook Messenger
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert("AI Agent Configurations Saved Locally.")}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-bold text-white shadow-md hover:bg-teal-500 transition cursor-pointer"
                type="button"
              >
                Save Configurations
              </button>
            </div>
          </div>
        </div>

        {/* AI Bot Cards stats representation */}
        <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-lg backdrop-blur transition-colors duration-200">
          <div className="mb-4 flex items-center justify-between premium-border-b pb-3">
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">AI Bot Deployments</h2>
            <Icon name="agent" className="h-5 w-5 text-teal-400" />
          </div>
          <div className="space-y-4">
            {initialAgentCards.map((agent) => (
              <article key={agent.name} className="rounded-xl premium-border bg-[var(--bg-lane)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${agent.accent} shadow-md`}>
                    <Icon name={agent.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text-title)] text-sm">{agent.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{agent.channels}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-xs select-none">
                  <div>
                    <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Leads Handled</p>
                    <p className="text-base font-bold text-[var(--text-title)] mt-0.5">{agent.name === "AI Call Responder" ? botConfigs.voice ? "31" : "0" : "146"}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Confidence Conv.</p>
                    <p className="text-base font-bold text-[var(--text-title)] mt-0.5">{agent.conversion}%</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Active Queue</p>
                    <p className="text-base font-bold text-[var(--text-title)] mt-0.5">{agent.queue} tasks</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <Badge className="bg-emerald-950/45 text-emerald-500 dark:text-emerald-400 ring-emerald-500/20">LIVE STATUS</Badge>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">{agent.endpoint}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
