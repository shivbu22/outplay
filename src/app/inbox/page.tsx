"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  PauseCircle,
  Archive,
  ArrowUpRight,
  User,
  Search,
  RefreshCw,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard-shell";

export default function UnifiedInboxPage() {
  const { openDialer } = useDashboard();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadInbox = async () => {
    try {
      const res = await fetch("/api/inbox");
      if (res.ok) {
        const data = await res.json();
        const ths = data.threads || [];
        setThreads(ths);
        if (ths.length > 0 && !selectedThreadId) {
          setSelectedThreadId(ths[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();

    // Listen for live SSE inbound replies
    const handleRealtime = (customEvt: any) => {
      const event = customEvt.detail;
      if (!event) return;

      if (event.type === "PROSPECT_REPLIED") {
        loadInbox();
      }
    };

    window.addEventListener("ams:realtime", handleRealtime);
    return () => {
      window.removeEventListener("ams:realtime", handleRealtime);
    };
  }, []);

  const selectedThread =
    threads.find((t) => t.id === selectedThreadId) || threads[0] || null;

  const handleSendReply = async () => {
    if (!replyText || !selectedThread) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: selectedThread.prospectId,
          replyText,
        }),
      });

      if (res.ok) {
        // Optimistically add message
        selectedThread.messages.push({
          id: `m-${Date.now()}`,
          sender: "Alex Mercer",
          isOutbound: true,
          time: "Just now",
          body: replyText,
        });
        setReplyText("");
      }
    } catch (err) {
      console.error("Failed to dispatch reply:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateAiRebuttal = () => {
    if (!selectedThread) return;
    setReplyText(
      `Hi ${selectedThread.prospectName},\n\nTotally understand! Attached is our 2-page executive summary on how AMS maintains 98% deliverability with native WebRTC dialer synchronization.\n\nHere is my calendar link to grab 10 minutes when convenient: https://cal.com/alex-ams\n\nBest,\nAlex`
    );
  };

  const filteredThreads = threads.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.prospectName?.toLowerCase().includes(q) ||
      t.company?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-112px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Inbox
            </span>
            <span className="text-xs text-slate-400">Multi-Mailbox Aggregation</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-indigo-400" />
            Unified Sales Inbox & Reply Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated prospect responses across rotated sending mailboxes with automatic cadence-pause and sentiment analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Auto-Pause on Reply: ACTIVE
          </span>
          <button
            onClick={loadInbox}
            className="w-8 h-8 rounded-md bg-[#131C31] border border-[#233352] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Refresh Inbox"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-lg bg-[#0D1322] border border-[#162035] overflow-hidden shadow-sm">
        {/* Left: Thread List (5 Cols) */}
        <div className="lg:col-span-5 border-r border-[#162035] flex flex-col min-h-0">
          <div className="p-3 border-b border-[#162035] bg-[#0E1524]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prospect replies..."
                className="w-full bg-[#131C31] border border-[#233352] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#162035]">
            {filteredThreads.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No active prospect replies yet.
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === selectedThreadId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedThreadId(t.id)}
                    className={cn(
                      "p-3.5 cursor-pointer transition-colors relative",
                      isSelected ? "bg-[#141E33]" : "hover:bg-[#121A2C]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-2">
                        {t.prospectName}
                        {t.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.time}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-300 truncate">
                      {t.subject}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {t.snippet}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono",
                          t.sentiment === "POSITIVE" || t.sentiment === "INTERESTED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : t.sentiment === "OOO"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        )}
                      >
                        {t.sentiment === "POSITIVE" || t.sentiment === "INTERESTED"
                          ? "Interested"
                          : t.sentiment === "OOO"
                          ? "Out of Office"
                          : "Objection"}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {t.company}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Viewer & Composer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-[#0B0F19]">
          {selectedThread ? (
            <>
              {/* Thread Header Info */}
              <div className="p-4 border-b border-[#162035] bg-[#0E1524] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {selectedThread.prospectName}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      &lt;{selectedThread.email}&gt;
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cadence:{" "}
                    <span className="text-indigo-400 font-semibold">
                      {selectedThread.cadence}
                    </span>{" "}
                    • {selectedThread.step}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                    <PauseCircle className="w-3.5 h-3.5" /> Cadence Paused
                  </span>

                  <button
                    onClick={() => openDialer("", selectedThread.prospectName, selectedThread.prospectId)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-[#1E2D4A] border border-[#233352] text-xs font-bold text-white transition-colors"
                    title="Launch softphone for this prospect"
                  >
                    <Phone className="w-3 h-3 text-blue-400" />
                    <span>Call</span>
                  </button>
                </div>
              </div>

              {/* Thread Body Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {selectedThread.messages?.map((m: any, idx: number) => (
                  <div
                    key={m.id || idx}
                    className={cn(
                      "p-4 rounded-lg border text-xs max-w-xl",
                      m.isOutbound
                        ? "ml-auto bg-[#141E33] border-[#223354] text-slate-200"
                        : "mr-auto bg-[#0E1524] border-[#1C2840] text-white"
                    )}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 pb-1 border-b border-white/5 font-mono">
                      <span className="font-bold text-white">{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <div className="whitespace-pre-line leading-relaxed">{m.body}</div>
                  </div>
                ))}
              </div>

              {/* Quick AI & Reply Composer */}
              <div className="p-4 border-t border-[#162035] bg-[#0E1524] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Response & AI Copilot
                  </span>
                  <button
                    onClick={handleGenerateAiRebuttal}
                    className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-bold hover:bg-blue-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>AI Draft Calendar Response</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write response to ${selectedThread.prospectName}...`}
                  className="w-full bg-[#131C31] border border-[#233352] rounded-md p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Sending via: alex@ams-outreach.com
                  </span>

                  <button
                    disabled={isSending || !replyText}
                    onClick={handleSendReply}
                    className="px-4 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? "Dispatching..." : "Send Reply"}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a thread to view conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
