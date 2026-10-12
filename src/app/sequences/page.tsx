"use client";

import React, { useState, useEffect } from "react";
import {
  GitFork,
  Plus,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Settings,
  ChevronRight,
  ShieldCheck,
  Check,
  Trash2,
  X,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
  </svg>
);

export default function SequencesPage() {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSequence, setSelectedSequence] = useState<any>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);

  // New Sequence Form
  const [newSeqName, setNewSeqName] = useState("");
  const [newSeqDesc, setNewSeqDesc] = useState("");

  // Add Step Form
  const [stepChannel, setStepChannel] = useState("EMAIL");
  const [stepWaitDays, setStepWaitDays] = useState(2);
  const [stepSubject, setStepSubject] = useState("");
  const [stepBody, setStepBody] = useState("");
  const [stepInstruction, setStepInstruction] = useState("");

  // AI Assistant Form
  const [aiPersona, setAiPersona] = useState("VP of Sales / RevOps Director");
  const [aiValueProp, setAiValueProp] = useState(
    "Automate multi-channel outreach (email rotation + WebRTC dialer) with zero spam deliverability risk"
  );
  const [aiGeneratedSubject, setAiGeneratedSubject] = useState("");
  const [aiGeneratedBody, setAiGeneratedBody] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const loadSequences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sequences");
      if (res.ok) {
        const data = await res.json();
        setSequences(data.sequences || []);
        if (data.sequences && data.sequences.length > 0 && !selectedSequence) {
          setSelectedSequence(data.sequences[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSequences();
  }, []);

  const handleCreateSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeqName) return;

    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSeqName,
          description: newSeqDesc,
          scheduleTimezone: "America/New_York",
          throttleDailyLimit: 50,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewSeqName("");
        setNewSeqDesc("");
        setIsCreateModalOpen(false);
        await loadSequences();
        setSelectedSequence(data.sequence);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAiGenerator = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGeneratedSubject("Quick question regarding {{companyName}}'s outbound cadence deliverability");
      setAiGeneratedBody(
        `Hi {{firstName}},\n\nI noticed {{companyName}} is scaling outbound sales this quarter. Most revenue leaders we speak with struggle with cold emails landing in spam and reps burning hours switching between their dialer and CRM.\n\nAMS solves this with automated mailbox rotation and a native WebRTC power dialer directly inside the cadence.\n\nWorth a brief 10-minute sync this Thursday at 2pm?\n\nBest,\nAlex Mercer`
      );
      setAiGenerating(false);
    }, 800);
  };

  const handleInsertAiCopy = () => {
    setStepSubject(aiGeneratedSubject);
    setStepBody(aiGeneratedBody);
    setIsAiModalOpen(false);
    setIsAddStepModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-indigo-400" />
            Multi-Channel Sequences & Cadences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build high-converting automated sequences across Email, WebRTC Calls, SMS, and LinkedIn touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Copywriter</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Cadence</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left List / Right Cadence Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Cadences List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Cadences ({sequences.length})
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading sequences...</div>
            ) : sequences.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-[#0E1524] rounded-2xl border border-[#1E2C44]">
                No sequences found. Create your first sequence above.
              </div>
            ) : (
              sequences.map((seq) => {
                const isSelected = selectedSequence?.id === seq.id;
                return (
                  <div
                    key={seq.id}
                    onClick={() => setSelectedSequence(seq)}
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none",
                      isSelected
                        ? "bg-[#141E33] border-indigo-500/50 shadow-lg shadow-indigo-950/40"
                        : "bg-[#0E1524] border-[#1E2C44] hover:bg-[#121A2C] hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {seq.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">
                      {seq.description || "Multi-touch outreach sequence with automated mailings."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1C273D]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <strong className="text-slate-200">{seq._count?.enrollments || 0}</strong> enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          <strong className="text-slate-200">{seq.steps?.length || 0}</strong> steps
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Visual Cadence Builder */}
        <div className="lg:col-span-7">
          {selectedSequence ? (
            <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-6 shadow-sm space-y-6">
              {/* Cadence Config Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2C44]">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {selectedSequence.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Mailbox Rotation: <strong className="text-slate-300">Enabled</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Daily Limit: <strong className="text-slate-300">{selectedSequence.throttleDailyLimit} sends/day</strong>
                    </span>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">Stop on reply</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddStepModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              {/* Visual Step Workflow Tree */}
              <div className="space-y-4 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#202E48]">
                {selectedSequence.steps && selectedSequence.steps.length > 0 ? (
                  selectedSequence.steps.map((step: any, index: number) => {
                    return (
                      <div key={step.id || index} className="relative pl-12">
                        {/* Step Circle Indicator */}
                        <div className="absolute left-2.5 -translate-x-1/2 top-3 w-5 h-5 rounded-full bg-[#18233C] border-2 border-indigo-500 text-[10px] font-bold text-indigo-400 flex items-center justify-center">
                          {step.stepOrder}
                        </div>

                        {/* Step Card */}
                        <div className="p-4 rounded-xl bg-[#141C2E] border border-[#222E46] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5",
                                  step.channel === "EMAIL"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : step.channel === "CALL"
                                    ? "bg-teal-500/20 text-teal-300"
                                    : step.channel === "SMS"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : step.channel === "LINKEDIN"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-slate-700 text-slate-300"
                                )}
                              >
                                {step.channel === "EMAIL" && <Mail className="w-3.5 h-3.5" />}
                                {step.channel === "CALL" && <Phone className="w-3.5 h-3.5" />}
                                {step.channel === "SMS" && <MessageSquare className="w-3.5 h-3.5" />}
                                {step.channel === "LINKEDIN" && <LinkedinIcon className="w-3.5 h-3.5" />}
                                {step.channel === "TASK" && <CheckSquare className="w-3.5 h-3.5" />}
                                <span>{step.channel}</span>
                              </span>
                              <span className="text-xs font-bold text-white">
                                Step #{step.stepOrder}
                              </span>
                            </div>

                            <span className="text-[11px] font-semibold text-slate-400 bg-[#1A253A] px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              Wait {step.waitDays} {step.waitDays === 1 ? "day" : "days"}
                            </span>
                          </div>

                          {/* Content Preview */}
                          {step.channel === "EMAIL" ? (
                            <div className="space-y-1 bg-[#0E1524] p-3 rounded-lg border border-[#1E2B42] text-xs">
                              <div className="font-semibold text-slate-300">
                                <span className="text-slate-500">Subject: </span>
                                {step.subjectTemplate || "(No subject set)"}
                              </div>
                              <div className="text-slate-400 whitespace-pre-line text-[11px] mt-1 line-clamp-3">
                                {step.bodyTemplate || "(No body set)"}
                              </div>
                            </div>
                          ) : step.channel === "CALL" ? (
                            <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E2B42] text-xs space-y-1">
                              <div className="font-semibold text-teal-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> Power Dialer Script Trigger
                              </div>
                              <p className="text-slate-300 text-[11px]">
                                {step.taskInstruction || "Softphone discovery call. Goal: pitch value proposition and book 15-min discovery."}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-[#0E1524] p-3 rounded-lg border border-[#1E2B42] text-xs">
                              <p className="text-slate-300 text-[11px]">
                                {step.taskInstruction || step.smsTemplate || "Touchpoint executed automatically."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No steps in this cadence. Click "Add Step" to begin building.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-slate-500 text-xs rounded-2xl bg-[#0E1524] border border-[#1E2C44]">
              Select a sequence on the left to view its cadence.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Sequence */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0F1626] border border-[#22304C] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22304C]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork className="w-4 h-4 text-indigo-400" />
                Create Multi-Channel Cadence
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSequence} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Cadence Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSeqName}
                  onChange={(e) => setNewSeqName(e.target.value)}
                  placeholder="E.g. Enterprise Tier-1 Inbound Follow-Up"
                  className="w-full bg-[#162138] border border-[#263756] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description / Strategy Target
                </label>
                <textarea
                  rows={2}
                  value={newSeqDesc}
                  onChange={(e) => setNewSeqDesc(e.target.value)}
                  placeholder="Targeting Series B+ CTOs and Heads of Infrastructure..."
                  className="w-full bg-[#162138] border border-[#263756] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 shadow-md"
                >
                  Create Cadence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Copywriter */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0F1626] border border-[#22304C] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22304C]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">AI Cold Outreach Copywriter</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Buyer Persona
                </label>
                <input
                  type="text"
                  value={aiPersona}
                  onChange={(e) => setAiPersona(e.target.value)}
                  className="w-full bg-[#162138] border border-[#263756] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Core Value Proposition / Pain Point
                </label>
                <textarea
                  rows={2}
                  value={aiValueProp}
                  onChange={(e) => setAiValueProp(e.target.value)}
                  className="w-full bg-[#162138] border border-[#263756] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                disabled={aiGenerating}
                onClick={handleRunAiGenerator}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {aiGenerating ? "Generating Personalized Pitch..." : "Generate High-Converting Copy"}
              </button>

              {aiGeneratedSubject && (
                <div className="space-y-3 pt-3 border-t border-[#202E48] animate-in fade-in">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                      Generated Subject
                    </label>
                    <div className="p-2.5 rounded-xl bg-[#131B2C] border border-[#23314B] text-xs font-semibold text-white">
                      {aiGeneratedSubject}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                      Generated Email Body
                    </label>
                    <div className="p-3 rounded-xl bg-[#131B2C] border border-[#23314B] text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {aiGeneratedBody}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={handleInsertAiCopy}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Insert into Step Editor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Step */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0F1626] border border-[#22304C] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22304C]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Cadence Touchpoint
              </h3>
              <button
                onClick={() => setIsAddStepModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Channel Touchpoint
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["EMAIL", "CALL", "SMS", "LINKEDIN"].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setStepChannel(ch)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold transition-all text-center",
                        stepChannel === ch
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-[#162138] text-slate-400 hover:text-white"
                      )}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Wait Delay (Days after previous step)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={stepWaitDays}
                  onChange={(e) => setStepWaitDays(Number(e.target.value))}
                  className="w-full bg-[#162138] border border-[#263756] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {stepChannel === "EMAIL" ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Subject Line (Supports {"{{firstName}}"}, {"{{companyName}}"})
                    </label>
                    <input
                      type="text"
                      value={stepSubject}
                      onChange={(e) => setStepSubject(e.target.value)}
                      placeholder="E.g. Thoughts on {{companyName}}'s pipeline"
                      className="w-full bg-[#162138] border border-[#263756] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Email Body Template
                    </label>
                    <textarea
                      rows={4}
                      value={stepBody}
                      onChange={(e) => setStepBody(e.target.value)}
                      placeholder="Hi {{firstName}}..."
                      className="w-full bg-[#162138] border border-[#263756] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Call Script / Task Instruction
                  </label>
                  <textarea
                    rows={3}
                    value={stepInstruction}
                    onChange={(e) => setStepInstruction(e.target.value)}
                    placeholder="Instructions for the SDR when executing this touchpoint..."
                    className="w-full bg-[#162138] border border-[#263756] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStepModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Step successfully appended to cadence!");
                    setIsAddStepModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
                >
                  Save Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
