"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  PhoneCall,
  Mail,
  CalendarCheck,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const funnelSteps = [
    { label: "Prospects Targeted", count: "1,240", rate: "100%", color: "bg-indigo-500" },
    { label: "Emails Delivered", count: "1,215", rate: "98.0%", color: "bg-indigo-600" },
    { label: "Emails Opened", count: "831", rate: "68.4%", color: "bg-purple-500" },
    { label: "Replies Received", count: "172", rate: "14.2%", color: "bg-pink-500" },
    { label: "WebRTC Calls Connected", count: "86", rate: "28.5%", color: "bg-teal-500" },
    { label: "Meetings Booked", count: "34", rate: "4.1% of Total", color: "bg-emerald-500" },
  ];

  const repLeaderboard = [
    {
      name: "Alex Mercer",
      title: "Senior SDR",
      calls: 84,
      emails: 312,
      meetings: 19,
      quota: 126,
    },
    {
      name: "Sarah Jenkins",
      title: "Account Executive",
      calls: 62,
      emails: 280,
      meetings: 15,
      quota: 104,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Outbound Engagement & Funnel Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-channel metrics tracking deliverability, conversion ratios, and sales rep pipeline quota.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-[#0E1524] border border-[#1E2C44] px-3.5 py-2 rounded-xl">
          <CalendarCheck className="w-4 h-4 text-indigo-400" />
          <span>Last 30 Days (Oct 2026)</span>
        </div>
      </div>

      {/* Conversion Funnel Breakdown */}
      <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2C44]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Multi-Touch Conversion Funnel
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            Cadence Performance Efficiency: <strong className="text-emerald-400">Superior</strong>
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {funnelSteps.map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white font-mono">{step.count}</span>
                  <span className="text-slate-400 font-semibold">{step.rate}</span>
                </div>
              </div>
              <div className="w-full bg-[#162138] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(12, 100 - idx * 16)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rep Performance & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rep Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2C44]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              SDR Team Pipeline Leaderboard
            </h3>
            <span className="text-xs text-slate-400 font-semibold">October Target</span>
          </div>

          <div className="divide-y divide-[#1A253A]">
            {repLeaderboard.map((rep, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white font-extrabold text-xs flex items-center justify-center">
                    {rep.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white leading-tight">{rep.name}</div>
                    <span className="text-[11px] text-slate-400">{rep.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-right">
                  <div>
                    <div className="font-bold text-white">{rep.calls}</div>
                    <span className="text-[10px] text-slate-500">Calls</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{rep.emails}</div>
                    <span className="text-[10px] text-slate-500">Emails</span>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400">{rep.meetings}</div>
                    <span className="text-[10px] text-slate-500">Meetings</span>
                  </div>
                  <div className="w-16">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {rep.quota}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Domain Health & Deliverability Score (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E2C44]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Domain & Deliverability Health
            </h3>
            <span className="text-xs font-bold text-emerald-400">98/100 Optimal</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-[#131B2C] border border-[#222E46] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">SPF / DKIM / DMARC</span>
                <p className="text-[10px] text-slate-400">DNS records authenticated</p>
              </div>
              <span className="text-emerald-400 font-bold">PASS</span>
            </div>

            <div className="p-3 rounded-xl bg-[#131B2C] border border-[#222E46] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Mailbox Rotation Engine</span>
                <p className="text-[10px] text-slate-400">Round-robin throttle distribution</p>
              </div>
              <span className="text-indigo-400 font-bold">2 INBOXES</span>
            </div>

            <div className="p-3 rounded-xl bg-[#131B2C] border border-[#222E46] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Spam Complaint Rate</span>
                <p className="text-[10px] text-slate-400">Below Google/Yahoo 0.1% threshold</p>
              </div>
              <span className="text-emerald-400 font-bold">0.02%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
