"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  PhoneCall,
  Mail,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  GitFork,
  Play,
  Clock,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";

export default function DashboardHome() {
  const { openDialer, openAddProspect, tenant } = useDashboard();

  const [metrics, setMetrics] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [callTasks, setCallTasks] = useState<any[]>([]);
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTicking, setIsTicking] = useState(false);
  const [tickMessage, setTickMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [analyticsRes, dialerRes, seqRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/dialer"),
        fetch("/api/sequences"),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setMetrics(aData.metrics);
        setActivities(aData.recentActivities || []);
      }

      if (dialerRes.ok) {
        const dData = await dialerRes.json();
        setCallTasks(dData.tasks || []);
      }

      if (seqRes.ok) {
        const sData = await seqRes.json();
        setSequences(sData.sequences || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerTick = async () => {
    setIsTicking(true);
    setTickMessage(null);
    try {
      const res = await fetch("/api/cadence/tick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxBatch: 2 }),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.result?.executed || 0;
        setTickMessage(`Engine tick executed ${count} active step${count === 1 ? "" : "s"}`);
        setTimeout(() => setTickMessage(null), 4000);
      }
    } catch (err) {
      console.error("Cadence tick execution failed:", err);
    } finally {
      setIsTicking(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for SSE real-time stream events
    const handleRealtimeEvent = (customEvt: any) => {
      const event = customEvt.detail;
      if (!event) return;

      if (event.type === "ACTIVITY_CREATED" && event.data) {
        setActivities((prev) => {
          const item = event.data;
          if (prev.some((p) => p.id === item.id)) return prev;
          return [item, ...prev].slice(0, 15);
        });
      } else if (event.type === "EMAIL_SENT" && event.data) {
        setActivities((prev) => {
          const item = event.data;
          if (prev.some((p) => p.id === item.id)) return prev;
          return [item, ...prev].slice(0, 15);
        });
        setMetrics((prev: any) =>
          prev
            ? {
                ...prev,
                totalEmailsSentToday: (prev.totalEmailsSentToday || 0) + 1,
              }
            : prev
        );
      } else if (event.type === "PROSPECT_REPLIED" && event.data) {
        const p = event.data.prospect;
        const fakeAct = {
          id: "rep_" + Date.now(),
          type: "EMAIL_REPLIED",
          prospect: p,
          metadata: JSON.stringify({
            subject: event.data.subject,
            sentiment: event.data.sentiment,
          }),
          createdAt: new Date().toISOString(),
        };
        setActivities((prev) => [fakeAct, ...prev].slice(0, 15));
        setMetrics((prev: any) =>
          prev ? { ...prev, replyRate: "16.8%" } : prev
        );
      } else if (event.type === "CALL_LOGGED") {
        loadData();
      } else if (event.type === "CADENCE_STEP_ADVANCED") {
        fetch("/api/dialer")
          .then((r) => r.json())
          .then((d) => setCallTasks(d.tasks || []))
          .catch(() => {});
      } else if (event.type === "METRIC_UPDATE") {
        fetch("/api/analytics")
          .then((r) => r.json())
          .then((a) => {
            if (a.metrics) setMetrics(a.metrics);
          })
          .catch(() => {});
      }
    };

    const handleRefresh = () => loadData();
    window.addEventListener("ams:realtime", handleRealtimeEvent);
    window.addEventListener("ams:call-logged", handleRefresh);
    window.addEventListener("ams:prospect-created", handleRefresh);

    return () => {
      window.removeEventListener("ams:realtime", handleRealtimeEvent);
      window.removeEventListener("ams:call-logged", handleRefresh);
      window.removeEventListener("ams:prospect-created", handleRefresh);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative rounded-lg bg-[#0D1322] border border-[#162035] p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active SSE Engine
              </span>
              <span className="text-xs text-slate-400">
                {tenant.name} Control Cockpit
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Good morning, Alex.
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              You have <span className="text-indigo-400 font-bold">{callTasks.length} calls</span> queued for today, and automated sequences are actively engaging{" "}
              <span className="text-emerald-400 font-bold">
                {metrics ? metrics.totalProspects : "..."} prospects
              </span> across email, phone, and LinkedIn.
            </p>
            {tickMessage && (
              <p className="text-xs font-mono text-emerald-400 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded inline-block">
                • {tickMessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Realtime Cadence Trigger */}
            <button
              disabled={isTicking}
              onClick={handleTriggerTick}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-[#152033] hover:bg-[#1C2C48] border border-[#233452] transition-all hover:scale-[1.02]"
              title="Runs one tick of automated cadences in real-time"
            >
              <Play
                className={cn(
                  "w-3.5 h-3.5 text-amber-400 fill-amber-400",
                  isTicking && "animate-spin"
                )}
              />
              <span>{isTicking ? "Ticking Engine..." : "Run Cadence Tick"}</span>
            </button>

            <button
              onClick={() => {
                if (callTasks.length > 0) {
                  const first = callTasks[0];
                  openDialer(
                    first.prospect.phone,
                    `${first.prospect.firstName} ${first.prospect.lastName}`,
                    first.prospect.id
                  );
                } else {
                  openDialer();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <PhoneCall className="w-4 h-4 fill-white" />
              <span>Launch Power Dialer</span>
            </button>

            <button
              onClick={openAddProspect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1C263E] hover:bg-[#23304F] border border-[#2B3B5E] transition-all hover:scale-[1.02]"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Add Prospect</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Prospects */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-[#1E2C44] hover:border-indigo-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Prospects
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics ? metrics.totalProspects : "..."}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 3 active cadences</p>
        </div>

        {/* Card 2: Email Performance */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-[#1E2C44] hover:border-indigo-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Emails Sent / Open %
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics ? metrics.totalEmailsSentToday : 0}
            </span>
            <span className="text-xs font-bold text-purple-400">
              {metrics ? metrics.openRate : "68%"} Open
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Reply rate: <span className="text-slate-200 font-semibold">{metrics?.replyRate || "14.2%"}</span>
          </p>
        </div>

        {/* Card 3: Calls Logged & Connect Rate */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-[#1E2C44] hover:border-indigo-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              WebRTC Calls Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics ? metrics.totalCalls : "..."}
            </span>
            <span className="text-xs font-bold text-teal-400">
              {metrics ? metrics.connectRate : "28.5%"} Connect
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Voicemail drops: <span className="text-slate-200 font-semibold">100% delivered</span>
          </p>
        </div>

        {/* Card 4: Meetings Booked */}
        <div className="p-5 rounded-2xl bg-[#0E1524] border border-[#1E2C44] hover:border-indigo-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Meetings Booked
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              {metrics ? metrics.meetingsBooked : "..."}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> High Intent
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pipeline: <span className="text-slate-200 font-semibold">$145,000 Est.</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Dialer Queue & Active Sequences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Power Dialer Queue & Active Sequences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Power Dialer Daily Queue */}
          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2C44]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Power Dialer Action Queue</h3>
                  <p className="text-[11px] text-slate-400">Scheduled cadence call tasks ready for 1-click execution</p>
                </div>
              </div>
              <Link
                href="/dialer"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Dialer View</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#1A253A] mt-2">
              {callTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  All scheduled calls completed for today! Great job.
                </div>
              ) : (
                callTasks.map((t) => (
                  <div
                    key={t.id}
                    className="py-3.5 flex items-center justify-between hover:bg-[#141C2E]/60 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white">
                        {t.prospect.firstName[0]}
                        {t.prospect.lastName ? t.prospect.lastName[0] : ""}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {t.prospect.firstName} {t.prospect.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {t.prospect.title || "Decision Maker"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-slate-300">{t.prospect.phone || "No phone"}</span>
                          <span className="text-slate-500">•</span>
                          <span>{t.title}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        openDialer(
                          t.prospect.phone,
                          `${t.prospect.firstName} ${t.prospect.lastName}`,
                          t.prospect.id
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:brightness-110 shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3 h-3 fill-white" />
                      <span>Dial Now</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Multi-Channel Cadences */}
          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2C44]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Active Multi-Channel Sequences</h3>
                  <p className="text-[11px] text-slate-400">Automated step workflows executing across channels</p>
                </div>
              </div>
              <Link
                href="/sequences"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>Manage Sequences</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#1A253A] mt-2">
              {sequences.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sequences configured yet.
                </div>
              ) : (
                sequences.map((s) => (
                  <div key={s.id} className="py-4 hover:bg-[#141C2E]/60 px-2 rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{s.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {s._count?.enrollments || 0} enrolled prospects
                      </span>
                    </div>

                    {/* Step Visual Chain */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {s.steps && s.steps.length > 0 ? (
                        s.steps.map((st: any, idx: number) => (
                          <React.Fragment key={st.id || idx}>
                            <div className="shrink-0 px-2.5 py-1 rounded-lg bg-[#151F33] border border-[#243452] flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                              <span className="text-[10px] font-bold text-indigo-400 font-mono">
                                #{st.stepOrder}
                              </span>
                              <span className="font-semibold">
                                {st.channel === "EMAIL"
                                  ? "Email"
                                  : st.channel === "CALL"
                                  ? "Call"
                                  : st.channel === "SMS"
                                  ? "SMS"
                                  : st.channel === "LINKEDIN"
                                  ? "LinkedIn"
                                  : "Task"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                (+{st.waitDays}d)
                              </span>
                            </div>
                            {idx < s.steps.length - 1 && (
                              <span className="text-slate-600 text-xs">→</span>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500">No steps defined</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Activity Feed & Mailbox Status */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2C44]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Prospect Stream
                </h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-3.5 mt-3.5">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No activity events logged yet.
                </div>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-xs">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5",
                        a.type === "MEETING_BOOKED"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : a.type === "EMAIL_REPLIED"
                          ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                          : a.type === "EMAIL_SENT"
                          ? "bg-blue-500/20 text-blue-400"
                          : a.type === "EMAIL_OPENED"
                          ? "bg-purple-500/20 text-purple-400"
                          : a.type === "CALL_SCHEDULED"
                          ? "bg-amber-500/20 text-amber-400"
                          : a.type === "LINKEDIN_TOUCH" || a.type === "LINKEDIN_CONNECT"
                          ? "bg-sky-500/20 text-sky-400"
                          : "bg-teal-500/20 text-teal-400"
                      )}
                    >
                      {a.type === "MEETING_BOOKED" ? (
                        <CalendarCheck className="w-3.5 h-3.5" />
                      ) : a.type === "EMAIL_REPLIED" ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : a.type === "EMAIL_SENT" || a.type === "EMAIL_OPENED" ? (
                        <Mail className="w-3.5 h-3.5" />
                      ) : a.type === "CALL_SCHEDULED" ? (
                        <Phone className="w-3.5 h-3.5" />
                      ) : a.type === "CALL_LOGGED" ? (
                        <PhoneCall className="w-3.5 h-3.5" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 font-medium leading-tight">
                        <span className="font-bold text-white">
                          {a.prospect
                            ? `${a.prospect.firstName} ${a.prospect.lastName}`
                            : "Prospect"}
                        </span>{" "}
                        {a.type === "MEETING_BOOKED"
                          ? "agreed to meeting via phone call"
                          : a.type === "EMAIL_REPLIED"
                          ? "replied to cadence email with high intent"
                          : a.type === "EMAIL_SENT"
                          ? "dispatched automated cadence email"
                          : a.type === "EMAIL_OPENED"
                          ? "opened cadence email"
                          : a.type === "CALL_SCHEDULED"
                          ? "queued cadence phone task in power dialer"
                          : a.type === "CALL_LOGGED"
                          ? "completed telephone outreach"
                          : a.type === "LINKEDIN_TOUCH"
                          ? "dispatched automated LinkedIn touchpoint"
                          : a.type === "LINKEDIN_CONNECT"
                          ? "accepted LinkedIn invitation"
                          : a.type.toLowerCase().replace(/_/g, " ")}
                      </p>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mailbox Sending Warmup Widget */}
          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Automated Mailbox Rotation
            </h4>
            <div className="p-3 rounded-xl bg-[#141C2E] border border-[#222E46] space-y-2">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">alex@ams-outreach.com</span>
                <span className="text-emerald-400">Active (45/50)</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[90%]" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141C2E] border border-[#222E46] space-y-2">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">alex.growth@ams-mail.net</span>
                <span className="text-indigo-400">Warmup (25/30)</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[83%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
