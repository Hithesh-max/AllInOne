import React from 'react';
import { Settings as SettingsIcon, Bell, Eye, Key, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-200">System Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure interface notifications, credentials, and API connection tokens</p>
      </div>

      <div className="glass-card p-6 border border-white/5 space-y-6">
        {/* API Configurations */}
        <div className="flex gap-4 items-start pb-6 border-b border-white/5">
          <Key className="h-5 w-5 text-brand-purple shrink-0 mt-1" />
          <div className="space-y-2 w-full">
            <h3 className="font-bold text-sm text-slate-200">API Connection Keys</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              CampusCopilot defaults to rule-based fallback generators when OpenAI/Gemini keys are omitted. Provide API tokens below or configure them inside your local `.env` file to enable live agentic searches.
            </p>
            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Tavily Web Search Key</span>
                <input type="password" placeholder="tvly-••••••••••••••••••••••••••••••••" className="glass-input text-xs py-2.5" disabled />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">OpenAI GPT Secret Key</span>
                <input type="password" placeholder="sk-proj-••••••••••••••••••••••••••••••••" className="glass-input text-xs py-2.5" disabled />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications config */}
        <div className="flex gap-4 items-start pb-6 border-b border-white/5">
          <Bell className="h-5 w-5 text-brand-cyan shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-200">Alert Schedules</h3>
            <p className="text-[11px] text-slate-400 leading-normal">Configure when and how alerts are sent.</p>
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-3 text-xs text-slate-300">
                <input type="checkbox" defaultChecked className="rounded accent-brand-purple" />
                Enable Gmail alerts for internship deadlines
              </label>
              <label className="flex items-center gap-3 text-xs text-slate-300">
                <input type="checkbox" defaultChecked className="rounded accent-brand-purple" />
                Enable Dashboard push logs for calendar tasks
              </label>
            </div>
          </div>
        </div>

        {/* Privacy config */}
        <div className="flex gap-4 items-start">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-200">Security Credentials</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Shared profile details are encrypted in the local database. Session tokens are signed using JWT (HS256) standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
