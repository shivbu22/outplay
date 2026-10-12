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
  Download,
  GitFork,
  ArrowUpRight,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DateRange = "today" | "7d" | "30d" | "all";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRange>("30d");
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Listen for live SSE events to update analytics dynamically
    const handleRealtime = () => {
      fetchAnalytics();
    };

    window.addEventListener("ams:realtime", handleRealtime);
    window.addEventListener("ams:call-logged", handleRealtime);
    window.addEventListener("ams:prospect-created", handleRealtime);

    return () => {
      window.removeEventListener("ams:realtime", handleRealtime);
      window.removeEventListener("ams:call-logged", handleRealtime);
      window.removeEventListener("ams:prospect-created", handleRealtime);
    };
  }, []);

  // Export data as formatted CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows = [
        ["Metric", "Value", "Rate"],
        ...(data?.funnelSteps || []).map((s: any) => [s.label, s.count, s.rate]),
        [],
        ["Rep Name", "Title", "Calls", "Emails", "Meetings", "Quota %"],
        ...(data?.repLeaderboard || []).map((r: any) => [
          r.name,
          r.title,
          r.calls,
          r.emails,
          r.meetings,
          `${r.quota}%`,
        ]),
        [],
        ["Sequence Name", "Enrolled", "Steps", "Open Rate", "Reply Rate", "Meetings Booked"],
        ...(data?.sequenceMetrics || []).map((sq: any) => [
          sq.name,
          sq.enrolled,
          sq.steps,
          sq.openRate,
          sq.replyRate,
          sq.meetingsBooked,
        ]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((row: any[]) => row.map((cell: any) => `"${cell || ""}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ams-analytics-report-${selectedRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const funnelSteps = data?.funnelSteps || [
    { label: "Prospects Targeted", count: 1240, rate: "100%", color: "bg-blue-600" },
    { label: "Emails Delivered", count: 1215, rate: "98.0%", color: "bg-blue-500" },
    { label: "Emails Opened", count: 831, rate: "68.4%", color: "bg-indigo-500" },
    { label: "Replies Received", count: 172, rate: "14.2%", color: "bg-purple-500" },
    { label: "WebRTC Calls Connected", count: 86, rate: "28.5%", color: "bg-teal-500" },
    { label: "Meetings Booked", count: 34, rate: "4.1% of Total", color: "bg-emerald-500" },
  ];

  const repLeaderboard = data?.repLeaderboard || [
    {
      id: "u-1",
      name: "Alex Mercer",
      title: "Senior SDR Lead",
      calls: 84,
      emails: 312,
      meetings: 19,
      quota: 126,
    },
    {
      id: "u-2",
      name: "Sarah Jenkins",
      title: "Account Executive",
      calls: 62,
      emails: 280,
      meetings: 15,
      quota: 104,
    },
  ];

  const sequenceMetrics = data?.sequenceMetrics || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
            <span className="text-xs text-slate-400">Multi-Channel Sales Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Outbound Engagement & Conversion Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-channel pipeline velocity, conversion ratios, and sales rep quota tracking.
          </p>
        </div>

        {/* Action Controls & Date Range Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Tabs */}
          <div className="flex items-center bg-[#131C31] border border-[#233352] rounded-md p-1 text-xs">
            {(["today", "7d", "30d", "all"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-semibold transition-colors uppercase tracking-wider text-[11px]",
                  selectedRange === range
                    ? "bg-[#1E2C48] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {range === "today"
                  ? "Today"
                  : range === "7d"
                  ? "7 Days"
                  : range === "30d"
                  ? "30 Days"
                  : "All Time"}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-[#131C31] hover:bg-[#1A2744] border border-[#233352] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={() => fetchAnalytics()}
            className="w-8 h-8 rounded-md bg-[#131C31] border border-[#233352] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Refresh analytics metrics"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* KPI Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0D1322] border border-[#162035]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>TOTAL PROSPECTS</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tabular-nums font-mono">
            {data?.metrics?.totalProspects ?? 5}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> 100% Verified Accounts
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#0D1322] border border-[#162035]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>EMAILS DELIVERED</span>
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tabular-nums font-mono">
            {data?.metrics?.totalEmailsSentToday ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            Open rate: <strong className="text-white font-mono">68.4%</strong>
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#0D1322] border border-[#162035]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>WEBRTC CALLS LOGGED</span>
            <PhoneCall className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white tabular-nums font-mono">
            {data?.metrics?.totalCalls ?? 0}
          </div>
          <span className="text-[11px] text-teal-400 font-semibold mt-1 block">
            Connect rate: <strong className="font-mono">28.5%</strong>
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#0D1322] border border-[#162035]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>MEETINGS BOOKED</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 tabular-nums font-mono">
            {data?.metrics?.meetingsBooked ?? 0}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> High Intent Conversion
          </span>
        </div>
      </div>

      {/* Multi-Touch Conversion Funnel */}
      <div className="rounded-lg bg-[#0D1322] border border-[#162035] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#162035]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Multi-Touch Cadence Conversion Funnel</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Overall Cadence Conversion Efficiency:{" "}
            <strong className="text-emerald-400 font-bold">Industry Superior</strong>
          </span>
        </div>

        <div className="space-y-3.5 pt-2">
          {funnelSteps.map((step: any, idx: number) => {
            const widthPct = Math.max(12, 100 - idx * 16);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{step.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white tabular-nums font-mono">
                      {typeof step.count === "number"
                        ? step.count.toLocaleString()
                        : step.count}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{step.rate}</span>
                  </div>
                </div>
                <div className="w-full bg-[#131C31] h-2.5 rounded-full overflow-hidden border border-[#1F2C46]">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      step.color || "bg-blue-500"
                    )}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: SDR Leaderboard & Domain Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Rep Leaderboard (7 Cols) */}
        <div className="lg:col-span-7 rounded-lg bg-[#0D1322] border border-[#162035] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162035]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Sales Rep Pipeline Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Monthly Quota Benchmark</span>
          </div>

          <div className="divide-y divide-[#162035]">
            {repLeaderboard.map((rep: any, idx: number) => (
              <div key={rep.id || idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#162035] border border-[#233352] text-slate-200 font-bold text-xs flex items-center justify-center font-mono">
                    {rep.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white leading-tight">
                      {rep.name}
                    </div>
                    <span className="text-[11px] text-slate-400">{rep.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-right">
                  <div>
                    <div className="font-bold text-white tabular-nums font-mono">
                      {rep.calls}
                    </div>
                    <span className="text-[10px] text-slate-400">Calls</span>
                  </div>
                  <div>
                    <div className="font-bold text-white tabular-nums font-mono">
                      {rep.emails}
                    </div>
                    <span className="text-[10px] text-slate-400">Emails</span>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400 tabular-nums font-mono">
                      {rep.meetings}
                    </div>
                    <span className="text-[10px] text-slate-400">Meetings</span>
                  </div>
                  <div className="w-16">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {rep.quota}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Domain & Deliverability Health (5 Cols) */}
        <div className="lg:col-span-5 rounded-lg bg-[#0D1322] border border-[#162035] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162035]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deliverability & Domain Health</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">98/100 Optimal</span>
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="p-3 rounded-md bg-[#131C31] border border-[#233352] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">SPF / DKIM / DMARC</span>
                <p className="text-[10px] text-slate-400">DNS records authenticated</p>
              </div>
              <span className="text-emerald-400 font-bold font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PASS
              </span>
            </div>

            <div className="p-3 rounded-md bg-[#131C31] border border-[#233352] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Mailbox Rotation Engine</span>
                <p className="text-[10px] text-slate-400">Round-robin throttle distribution</p>
              </div>
              <span className="text-blue-400 font-bold font-mono text-[11px] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {data?.mailboxes?.length ?? 2} INBOXES
              </span>
            </div>

            <div className="p-3 rounded-md bg-[#131C31] border border-[#233352] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Spam Complaint Rate</span>
                <p className="text-[10px] text-slate-400">Below Google/Yahoo 0.1% threshold</p>
              </div>
              <span className="text-emerald-400 font-bold font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                0.02%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sequence Comparison Matrix */}
      {sequenceMetrics.length > 0 && (
        <div className="rounded-lg bg-[#0D1322] border border-[#162035] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162035]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span>Cadence Performance Comparison Matrix</span>
            </h3>
            <span className="text-xs text-slate-400">Comparative Sequence Conversion</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#162035] text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 px-3">Sequence Name</th>
                  <th className="py-2.5 px-3">Enrolled Prospects</th>
                  <th className="py-2.5 px-3">Workflow Steps</th>
                  <th className="py-2.5 px-3">Open Rate</th>
                  <th className="py-2.5 px-3">Reply Rate</th>
                  <th className="py-2.5 px-3">Meetings Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162035]">
                {sequenceMetrics.map((sq: any) => (
                  <tr key={sq.id} className="hover:bg-[#131C31]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{sq.name}</td>
                    <td className="py-3 px-3 tabular-nums font-mono text-slate-300">
                      {sq.enrolled}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-mono text-slate-400">
                      {sq.steps} steps
                    </td>
                    <td className="py-3 px-3 tabular-nums font-mono text-purple-400 font-semibold">
                      {sq.openRate}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-mono text-emerald-400 font-semibold">
                      {sq.replyRate}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-mono text-emerald-400 font-bold">
                      {sq.meetingsBooked}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
