"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockThreads = [
  {
    id: "th-1",
    prospectName: "David Chen",
    company: "CloudScale Inc",
    email: "david.chen@cloudscale.io",
    subject: "Re: Quick question regarding CloudScale's outbound deliverability",
    snippet: "Hi Alex, interesting timing. We are looking into this. Can you send over a deck?",
    sentiment: "INTERESTED",
    unread: true,
    time: "10:24 AM",
    cadence: "Enterprise SaaS Outbound Q4",
    step: "Step 1 (Email)",
    messages: [
      {
        sender: "Alex Mercer",
        isOutbound: true,
        time: "Yesterday 9:15 AM",
        body: "Hi David,\n\nI noticed CloudScale is scaling outbound sales this quarter. Most revenue leaders we speak with struggle with cold emails landing in spam and reps burning hours switching between their dialer and CRM.\n\nAMS solves this with automated mailbox rotation and a native WebRTC power dialer directly inside the cadence.\n\nWorth a brief 10-minute sync this Thursday at 2pm?\n\nBest,\nAlex Mercer",
      },
      {
        sender: "David Chen",
        isOutbound: false,
        time: "Today 10:24 AM",
        body: "Hi Alex, interesting timing. We are looking into this right now as our current setup with Outreach has deliverability drop-offs. Can you send over a demo link or deck before we chat?",
      },
    ],
  },
  {
    id: "th-2",
    prospectName: "Elena Rostova",
    company: "Apex Hyperautomation",
    email: "elena@apex.ai",
    subject: "Re: Scaling RevOps with AMS",
    snippet: "I am out of the office until next Monday. Please reach out then.",
    sentiment: "OOO",
    unread: false,
    time: "Yesterday",
    cadence: "Enterprise SaaS Outbound Q4",
    step: "Step 3 (Email)",
    messages: [
      {
        sender: "Elena Rostova",
        isOutbound: false,
        time: "Yesterday 3:10 PM",
        body: "I am out of the office attending SaaStr until next Monday with limited email access. Please contact support@apex.ai for urgent matters.",
      },
    ],
  },
  {
    id: "th-3",
    prospectName: "Marcus Vance",
    company: "Vance Cybernetics",
    email: "m.vance@vancecyber.com",
    subject: "Re: Multi-channel sales cadence demo",
    snippet: "Not interested at this time, check back with us next fiscal quarter.",
    sentiment: "OBJECTION",
    unread: false,
    time: "2 days ago",
    cadence: "Mid-Market Cold Cadence",
    step: "Step 1 (Email)",
    messages: [
      {
        sender: "Marcus Vance",
        isOutbound: false,
        time: "2 days ago",
        body: "Not interested at this time, budget is locked for Q3. Check back with us next fiscal quarter.",
      },
    ],
  },
];

export default function UnifiedInboxPage() {
  const [threads, setThreads] = useState(mockThreads);
  const [selectedThreadId, setSelectedThreadId] = useState("th-1");
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const handleSendReply = () => {
    if (!replyText) return;
    setIsSending(true);

    setTimeout(() => {
      selectedThread.messages.push({
        sender: "Alex Mercer",
        isOutbound: true,
        time: "Just now",
        body: replyText,
      });
      setReplyText("");
      setIsSending(false);
    }, 600);
  };

  const handleGenerateAiRebuttal = () => {
    setReplyText(
      `Hi ${selectedThread.prospectName},\n\nTotally understand! Attached is our 2-page executive summary on how AMS maintains 98% deliverability with native WebRTC dialer synchronization.\n\nHere is my calendar link to grab 10 minutes when convenient: https://cal.com/alex-ams\n\nBest,\nAlex`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-112px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-indigo-400" />
            Unified Multi-Mailbox Sales Inbox
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated prospect responses across rotated sending accounts with automatic sequence-pause and sentiment analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Auto-Pause on Reply: ACTIVE
          </span>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl bg-[#0E1524] border border-[#1E2C44] overflow-hidden shadow-sm">
        {/* Left: Thread List (5 Cols) */}
        <div className="lg:col-span-5 border-r border-[#1E2C44] flex flex-col min-h-0">
          <div className="p-3.5 border-b border-[#1E2C44] bg-[#121A2B]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inbox..."
                className="w-full bg-[#18233A] border border-[#263756] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1A253A]">
            {threads.map((t) => {
              const isSelected = t.id === selectedThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedThreadId(t.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors relative",
                    isSelected ? "bg-[#162138]" : "hover:bg-[#121A2C]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      {t.prospectName}
                      {t.unread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">{t.time}</span>
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
                        "text-[10px] font-extrabold px-2 py-0.5 rounded-md",
                        t.sentiment === "INTERESTED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : t.sentiment === "OOO"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-700 text-slate-300"
                      )}
                    >
                      {t.sentiment === "INTERESTED"
                        ? "Interested"
                        : t.sentiment === "OOO"
                        ? "Out of Office"
                        : "Objection"}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {t.company}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Viewer & Composer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-[#0B101C]">
          {/* Thread Header Info */}
          <div className="p-4 border-b border-[#1E2C44] bg-[#101728] flex items-center justify-between">
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
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                <PauseCircle className="w-3.5 h-3.5" /> Sequence Paused
              </span>
            </div>
          </div>

          {/* Thread Body Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {selectedThread.messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-2xl border text-xs max-w-xl",
                  m.isOutbound
                    ? "ml-auto bg-[#17223B] border-[#293B5E] text-slate-200"
                    : "mr-auto bg-[#131B2C] border-[#1F2C46] text-white"
                )}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 pb-1 border-b border-white/5">
                  <span className="font-bold text-white">{m.sender}</span>
                  <span>{m.time}</span>
                </div>
                <div className="whitespace-pre-line leading-relaxed">{m.body}</div>
              </div>
            ))}
          </div>

          {/* Quick AI & Reply Composer */}
          <div className="p-4 border-t border-[#1E2C44] bg-[#101728] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Quick Reply & AI Assist
              </span>
              <button
                onClick={handleGenerateAiRebuttal}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold hover:bg-indigo-500/30 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Draft Calendar Response</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Write response to ${selectedThread.prospectName}...`}
              className="w-full bg-[#151F34] border border-[#243554] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Sending from primary mailbox: alex@ams-outreach.com
              </span>

              <button
                disabled={isSending || !replyText}
                onClick={handleSendReply}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Sending..." : "Send Reply & Resume"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
