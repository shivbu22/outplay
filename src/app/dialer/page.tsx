"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Phone,
  Play,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Voicemail,
  ShieldAlert,
  Sparkles,
  Volume2,
  Mic,
  RotateCw,
  Search,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";

export default function DialerPage() {
  const { openDialer } = useDashboard();

  const [tasks, setTasks] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingLogId, setPlayingLogId] = useState<string | null>(null);

  const loadDialerData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dialer");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setCallLogs(data.callLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDialerData();

    const handleCallLogged = () => loadDialerData();
    window.addEventListener("ams:call-logged", handleCallLogged);
    return () => window.removeEventListener("ams:call-logged", handleCallLogged);
  }, []);

  const handleStartPowerDialer = () => {
    if (tasks.length > 0) {
      const first = tasks[0];
      openDialer(
        first.prospect.phone,
        `${first.prospect.firstName} ${first.prospect.lastName}`,
        first.prospect.id
      );
    } else {
      openDialer();
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-6 h-6 text-teal-400" />
            WebRTC Sales Dialer Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            In-browser softphone with automated voicemail drops, 1-click power dialing, and instant disposition logging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadDialerData()}
            className="p-2 rounded-xl bg-[#141C2E] border border-[#222E46] text-slate-400 hover:text-white transition-colors"
            title="Refresh queue"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartPowerDialer}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>Start Power Dialer Session</span>
          </button>
        </div>
      </div>

      {/* Dialer Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0E1524] border border-[#1E2C44]">
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            Calls Due in Queue
          </span>
          <div className="mt-2 text-2xl font-black text-white">{tasks.length}</div>
          <span className="text-[10px] text-teal-400 font-semibold">Ready to dial</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1524] border border-[#1E2C44]">
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            Calls Logged Today
          </span>
          <div className="mt-2 text-2xl font-black text-white">{callLogs.length}</div>
          <span className="text-[10px] text-slate-400">Total logged calls</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1524] border border-[#1E2C44]">
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            Connect Rate %
          </span>
          <div className="mt-2 text-2xl font-black text-teal-400">32.4%</div>
          <span className="text-[10px] text-emerald-400 font-semibold">+4.2% vs avg</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1524] border border-[#1E2C44]">
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            Voicemail Drop Speed
          </span>
          <div className="mt-2 text-2xl font-black text-indigo-400">1-Click</div>
          <span className="text-[10px] text-slate-400">Audio template active</span>
        </div>
      </div>

      {/* Main Grid: Scheduled Queue (Left) & Call History Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Action Queue (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Call Tasks ({tasks.length})
            </span>
          </div>

          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] divide-y divide-[#1A253A] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading call tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                No pending calls in queue. Your power dialer is clear!
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-[#141C2E] transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 border border-teal-500/30 text-teal-300 font-bold flex items-center justify-center">
                      {task.prospect.firstName[0]}
                      {task.prospect.lastName ? task.prospect.lastName[0] : ""}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">
                        {task.prospect.firstName} {task.prospect.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {task.prospect.title || "Executive"} • {task.prospect.companyName || "Organization"}
                      </div>
                      <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                        {task.prospect.phone || "No phone listed"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      openDialer(
                        task.prospect.phone,
                        `${task.prospect.firstName} ${task.prospect.lastName}`,
                        task.prospect.id
                      )
                    }
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:brightness-110 shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 fill-white" />
                    <span>Dial</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Call Logs & Dispositions (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Call Logs & Recordings
            </span>
          </div>

          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] divide-y divide-[#1A253A] overflow-hidden">
            {callLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No calls logged yet. Start dialing to view call dispositions and recordings.
              </div>
            ) : (
              callLogs.map((log) => {
                const isPlaying = playingLogId === log.id;
                return (
                  <div key={log.id} className="p-4 hover:bg-[#141C2E] transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {log.prospect
                            ? `${log.prospect.firstName} ${log.prospect.lastName}`
                            : "Prospect"}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[11px] text-slate-400">
                          {log.rep ? `${log.rep.firstName} (Rep)` : "Rep"}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide",
                          log.disposition === "MEETING_BOOKED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : log.disposition === "INTERESTED"
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : log.disposition === "VOICEMAIL_DROP"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-700/30 text-slate-400 border border-slate-700/50"
                        )}
                      >
                        {log.disposition.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDuration(log.durationSeconds)}
                        </span>
                        {log.notes && (
                          <span className="text-[11px] text-slate-300 italic">
                            "{log.notes}"
                          </span>
                        )}
                      </div>

                      {/* Mock Audio Player */}
                      <button
                        onClick={() => setPlayingLogId(isPlaying ? null : log.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors",
                          isPlaying
                            ? "bg-emerald-500 text-white animate-pulse"
                            : "bg-[#18233C] text-slate-300 hover:text-white"
                        )}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isPlaying ? "Playing..." : "Play Audio"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
