"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PhoneCall,
  Phone,
  PhoneOff,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Voicemail,
  ShieldAlert,
  Volume2,
  VolumeX,
  RotateCw,
  Search,
  ChevronRight,
  User,
  Building,
  Mail,
  Flame,
  Check,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";
import { playDtmfTone, playCallRecordingSimulation } from "@/lib/dtmf";

interface TaskItem {
  id: string;
  tenantId: string;
  prospectId: string;
  channel: string;
  status: string;
  dueAt: string;
  notes?: string | null;
  prospect: {
    id: string;
    firstName: string;
    lastName: string;
    title?: string | null;
    companyName?: string | null;
    email: string;
    phone?: string | null;
    timezone?: string | null;
    status: string;
  };
  assignedRep?: {
    firstName: string;
    lastName: string;
  } | null;
}

interface CallLogItem {
  id: string;
  prospectId: string;
  repId: string;
  durationSeconds: number;
  disposition: string;
  notes?: string | null;
  createdAt: string;
  prospect?: {
    firstName: string;
    lastName: string;
    companyName?: string | null;
    phone?: string | null;
  } | null;
  rep?: {
    firstName: string;
    lastName: string;
  } | null;
}

const DISPOSITIONS = [
  { id: "MEETING_BOOKED", label: "Meeting Booked", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "INTERESTED", label: "Interested / Call Back", color: "bg-teal-500/20 text-teal-300 border-teal-500/40" },
  { id: "LEFT_VOICEMAIL", label: "Left Voicemail Drop", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "NO_ANSWER", label: "No Answer / Ring Out", color: "bg-slate-700/40 text-slate-300 border-slate-600/40" },
  { id: "BUSY", label: "Busy Line", color: "bg-slate-700/40 text-slate-300 border-slate-600/40" },
  { id: "BAD_DATA", label: "Wrong Number / Gatekeeper", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
];

const VOICEMAIL_TEMPLATES = [
  { id: "vm-1", name: "Executive Outbound Hook", duration: "24s", text: "Hi, this is Alex from AMS. I saw your team scaling outreach and wanted to share how we automated 30% more pipeline..." },
  { id: "vm-2", name: "Enterprise API Follow-up", duration: "18s", text: "Following up on my note regarding your Q4 integration requirements. Dropping a quick calendar invite." },
  { id: "vm-3", name: "Cold Reconnect Value-Prop", duration: "29s", text: "Wanted to check if you're still reviewing sales engagement platforms this quarter. Let's touch base." },
];

export default function DialerPage() {
  const { openDialer } = useDashboard();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected prospect in queue
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0);
  const [activeDisposition, setActiveDisposition] = useState("MEETING_BOOKED");
  const [logNotes, setLogNotes] = useState("");
  const [manualDuration, setManualDuration] = useState("45");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Audio simulation state for recordings & VM drops
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Keypad input state
  const [keypadInput, setKeypadInput] = useState("");

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
      console.error("Failed to load dialer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDialerData();

    const handleCallLogged = () => {
      loadDialerData();
      setSuccessToast("Call disposition logged successfully");
      setTimeout(() => setSuccessToast(null), 3000);
    };

    window.addEventListener("ams:call-logged", handleCallLogged);
    return () => {
      window.removeEventListener("ams:call-logged", handleCallLogged);
      if (stopAudioRef.current) stopAudioRef.current();
    };
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${t.prospect.firstName} ${t.prospect.lastName}`.toLowerCase();
    const company = (t.prospect.companyName || "").toLowerCase();
    const phone = (t.prospect.phone || "").toLowerCase();
    return name.includes(q) || company.includes(q) || phone.includes(q);
  });

  const activeTask: TaskItem | undefined = filteredTasks[selectedTaskIndex] || filteredTasks[0];

  const handleDialCurrent = () => {
    if (!activeTask) {
      openDialer();
      return;
    }
    openDialer(
      activeTask.prospect.phone || undefined,
      `${activeTask.prospect.firstName} ${activeTask.prospect.lastName}`,
      activeTask.prospect.id
    );
  };

  const handleKeyPress = (char: string) => {
    playDtmfTone(char);
    setKeypadInput((prev) => prev + char);
  };

  const handlePlayAudio = (id: string, durationSec = 4) => {
    if (playingAudioId === id) {
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    if (stopAudioRef.current) {
      stopAudioRef.current();
    }

    setPlayingAudioId(id);
    stopAudioRef.current = playCallRecordingSimulation(durationSec, () => {
      setPlayingAudioId(null);
      stopAudioRef.current = null;
    });
  };

  const handleQuickLogDisposition = async () => {
    if (!activeTask) return;
    setIsSubmittingLog(true);

    try {
      const res = await fetch("/api/dialer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: activeTask.prospect.id,
          disposition: activeDisposition,
          durationSeconds: parseInt(manualDuration, 10) || 0,
          notes: logNotes || `Direct disposition from Power Dialer Workspace`,
        }),
      });

      if (res.ok) {
        setLogNotes("");
        setSuccessToast(`Disposition logged for ${activeTask.prospect.firstName}`);
        setTimeout(() => setSuccessToast(null), 3000);
        window.dispatchEvent(new CustomEvent("ams:call-logged"));
        await loadDialerData();
        // Advance to next task if available
        if (selectedTaskIndex < filteredTasks.length - 1) {
          setSelectedTaskIndex((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error("Failed to log call:", err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  // Dynamic Telemetry Metrics
  const totalCallsLogged = callLogs.length;
  const totalTalkTimeSecs = callLogs.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const meetingsBookedCount = callLogs.filter((c) => c.disposition === "MEETING_BOOKED").length;
  const connectedCallsCount = callLogs.filter(
    (c) => c.durationSeconds > 0 && !["NO_ANSWER", "BUSY"].includes(c.disposition)
  ).length;
  const connectRatePercent = totalCallsLogged > 0
    ? ((connectedCallsCount / totalCallsLogged) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 text-teal-400" />
            Power Dialer & WebRTC Voice Cockpit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise sales engagement dialer with ITU dual-tone frequencies, voicemail drops, and instant disposition workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {successToast && (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-fade-in flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{successToast}</span>
            </div>
          )}

          <button
            onClick={() => loadDialerData()}
            className="p-2 rounded-lg bg-[var(--ams-surface-1)] border border-[var(--ams-border)] text-slate-300 hover:text-white transition-colors"
            title="Refresh queue"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDialCurrent}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-sm transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>Launch WebRTC Softphone</span>
          </button>
        </div>
      </div>

      {/* Dynamic Telemetry Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Calls Due In Queue
          </span>
          <div className="mt-1.5 text-2xl font-bold text-white font-mono tabular-nums">
            {tasks.length}
          </div>
          <span className="text-[10px] text-teal-400 font-medium">Pending cadences</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Calls Logged
          </span>
          <div className="mt-1.5 text-2xl font-bold text-white font-mono tabular-nums">
            {totalCallsLogged}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Recorded calls</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Talk Time
          </span>
          <div className="mt-1.5 text-2xl font-bold text-teal-400 font-mono tabular-nums">
            {formatDuration(totalTalkTimeSecs)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Active call duration</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Connect Rate
          </span>
          <div className="mt-1.5 text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {connectRatePercent}%
          </div>
          <span className="text-[10px] text-emerald-400/80 font-medium">{connectedCallsCount} connected calls</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Meetings Booked
          </span>
          <div className="mt-1.5 text-2xl font-bold text-indigo-400 font-mono tabular-nums">
            {meetingsBookedCount}
          </div>
          <span className="text-[10px] text-indigo-400/80 font-medium">Converted demos</span>
        </div>
      </div>

      {/* Main 3-Column Power Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheduled Queue (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Cadence Call Queue ({filteredTasks.length})
            </span>
            <span className="text-[10px] text-slate-400">Step due priority</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search queue by prospect, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--ams-surface-1)] border border-[var(--ams-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)] divide-y divide-[var(--ams-border)] overflow-hidden max-h-[580px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading call tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <p>No pending calls in queue. Your cadence dialer is up to date.</p>
              </div>
            ) : (
              filteredTasks.map((task, idx) => {
                const isSelected = activeTask?.id === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskIndex(idx)}
                    className={cn(
                      "p-3.5 cursor-pointer transition-colors flex items-center justify-between",
                      isSelected
                        ? "bg-[var(--ams-surface-2)] border-l-2 border-l-teal-400"
                        : "hover:bg-[var(--ams-surface-2)]/50"
                    )}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <span>{task.prospect.firstName} {task.prospect.lastName}</span>
                        {task.prospect.status === "MEETING_BOOKED" && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            Booked
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {task.prospect.title || "Executive"} • {task.prospect.companyName || "Organization"}
                      </div>
                      <div className="text-[10px] text-teal-400 font-mono">
                        {task.prospect.phone || "No phone listed"}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDialer(
                          task.prospect.phone || undefined,
                          `${task.prospect.firstName} ${task.prospect.lastName}`,
                          task.prospect.id
                        );
                      }}
                      className="p-2 rounded-lg bg-[var(--ams-surface-3)] hover:bg-teal-600 text-slate-300 hover:text-white transition-colors"
                      title="Launch Dial"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Active Prospect Cockpit & Disposition Logger (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--ams-border)] pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Active Contact Dossier
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                {activeTask ? `Task ${selectedTaskIndex + 1} of ${filteredTasks.length}` : "No task selected"}
              </span>
            </div>

            {activeTask ? (
              <div className="space-y-4">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white">
                      {activeTask.prospect.firstName} {activeTask.prospect.lastName}
                    </h2>
                    <div className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activeTask.prospect.companyName || "Target Account"}</span>
                      <span className="text-slate-600">•</span>
                      <span>{activeTask.prospect.title || "Decision Maker"}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Timezone</span>
                    <span className="text-xs font-semibold text-teal-400 font-mono">
                      {activeTask.prospect.timezone || "America/New_York"}
                    </span>
                  </div>
                </div>

                {/* Direct Contact Links */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--ams-surface-2)] border border-[var(--ams-border)] space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Direct Phone</span>
                    <div className="font-mono text-white font-semibold">
                      {activeTask.prospect.phone || "+1 (555) 000-0000"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--ams-surface-2)] border border-[var(--ams-border)] space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Verified Email</span>
                    <div className="truncate text-white font-mono">
                      {activeTask.prospect.email}
                    </div>
                  </div>
                </div>

                {/* Cadence Step Instructions / Talking Points */}
                <div className="p-3 rounded-lg bg-[var(--ams-surface-2)] border border-[var(--ams-border)] space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Cadence Call Notes & Talking Points
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeTask.notes || "Click-to-dial via AMS WebRTC softphone. If voicemail beep is heard, use 1-click voicemail drop template #1."}
                  </p>
                </div>

                {/* Direct Disposition Logger */}
                <div className="pt-2 border-t border-[var(--ams-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Log Call Disposition
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Duration (s):</span>
                      <input
                        type="number"
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value)}
                        className="w-14 px-2 py-0.5 rounded bg-[var(--ams-surface-2)] border border-[var(--ams-border)] text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {DISPOSITIONS.map((disp) => {
                      const isChosen = activeDisposition === disp.id;
                      return (
                        <button
                          key={disp.id}
                          type="button"
                          onClick={() => setActiveDisposition(disp.id)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all text-left",
                            isChosen
                              ? disp.color
                              : "bg-[var(--ams-surface-2)] border-[var(--ams-border)] text-slate-400 hover:text-white"
                          )}
                        >
                          {disp.label}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Log call conversation notes, prospect objections, or follow-up commitments..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--ams-surface-2)] border border-[var(--ams-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={handleDialCurrent}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 fill-white" />
                      <span>Dial Contact</span>
                    </button>

                    <button
                      onClick={handleQuickLogDisposition}
                      disabled={isSubmittingLog}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--ams-surface-3)] hover:bg-slate-700 border border-[var(--ams-border)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingLog ? "Logging..." : "Log & Next"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a contact from the queue to review talking points and dial.
              </div>
            )}
          </div>

          {/* Voicemail Drop Templates */}
          <div className="p-4 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Voicemail className="w-3.5 h-3.5 text-teal-400" />
                1-Click Voicemail Drops
              </span>
              <span className="text-[10px] text-slate-400">Audio synthesis active</span>
            </div>

            <div className="space-y-2">
              {VOICEMAIL_TEMPLATES.map((vm) => {
                const isPlaying = playingAudioId === vm.id;
                return (
                  <div
                    key={vm.id}
                    className="p-2.5 rounded-lg bg-[var(--ams-surface-2)] border border-[var(--ams-border)] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{vm.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({vm.duration})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">"{vm.text}"</p>
                    </div>

                    <button
                      onClick={() => handlePlayAudio(vm.id, 4)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0",
                        isPlaying
                          ? "bg-teal-500 text-white"
                          : "bg-[var(--ams-surface-3)] text-slate-300 hover:text-white"
                      )}
                    >
                      {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isPlaying ? "Playing" : "Preview"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Keypad & Call Recording Logs (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* DTMF Keypad */}
          <div className="p-4 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                DTMF Acoustic Keypad
              </span>
              <span className="text-[9px] text-teal-400 font-mono">ITU Dual-Tone</span>
            </div>

            <div className="relative">
              <input
                type="text"
                readOnly
                placeholder="Dial digits..."
                value={keypadInput}
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--ams-surface-2)] border border-[var(--ams-border)] text-xs text-white text-center font-mono tracking-widest"
              />
              {keypadInput && (
                <button
                  onClick={() => setKeypadInput("")}
                  className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { digit: "1", sub: "" },
                { digit: "2", sub: "ABC" },
                { digit: "3", sub: "DEF" },
                { digit: "4", sub: "GHI" },
                { digit: "5", sub: "JKL" },
                { digit: "6", sub: "MNO" },
                { digit: "7", sub: "PQRS" },
                { digit: "8", sub: "TUV" },
                { digit: "9", sub: "WXYZ" },
                { digit: "*", sub: "" },
                { digit: "0", sub: "+" },
                { digit: "#", sub: "" },
              ].map((k) => (
                <button
                  key={k.digit}
                  type="button"
                  onClick={() => handleKeyPress(k.digit)}
                  className="h-10 rounded-lg bg-[var(--ams-surface-2)] hover:bg-[var(--ams-surface-3)] active:bg-teal-600/30 border border-[var(--ams-border)] flex flex-col items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold text-white font-mono leading-none">{k.digit}</span>
                  {k.sub && <span className="text-[8px] text-slate-400 leading-none mt-0.5">{k.sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Call History & Recording Previews */}
          <div className="p-4 rounded-xl bg-[var(--ams-surface-1)] border border-[var(--ams-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Call History & Audio
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{callLogs.length} logs</span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto divide-y divide-[var(--ams-border)]">
              {callLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No calls logged yet. Start dialing to view call dispositions.
                </div>
              ) : (
                callLogs.slice(0, 10).map((log) => {
                  const isPlaying = playingAudioId === log.id;
                  return (
                    <div key={log.id} className="pt-2 space-y-1.5 first:pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">
                          {log.prospect
                            ? `${log.prospect.firstName} ${log.prospect.lastName}`
                            : "Prospect"}
                        </span>

                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            log.disposition === "MEETING_BOOKED"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : log.disposition === "INTERESTED"
                              ? "bg-teal-500/20 text-teal-300"
                              : log.disposition === "LEFT_VOICEMAIL"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-700/40 text-slate-300"
                          )}
                        >
                          {log.disposition.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">{formatDuration(log.durationSeconds)}</span>

                        <button
                          onClick={() => handlePlayAudio(log.id, 4)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors",
                            isPlaying
                              ? "bg-emerald-600 text-white"
                              : "bg-[var(--ams-surface-2)] text-slate-300 hover:text-white"
                          )}
                        >
                          {isPlaying ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                          <span>{isPlaying ? "Playing..." : "Play Audio"}</span>
                        </button>
                      </div>

                      {log.notes && (
                        <p className="text-[10px] text-slate-400 italic truncate">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
