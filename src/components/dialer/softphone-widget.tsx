"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Minimize2,
  Maximize2,
  Delete,
  Voicemail,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SoftphoneWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialNumber?: string;
  initialProspectName?: string;
  initialProspectId?: string;
  onCallLogged?: () => void;
}

type CallState = "IDLE" | "DIALING" | "CONNECTED" | "DISPOSITION";

export function SoftphoneWidget({
  isOpen,
  onClose,
  initialNumber = "",
  initialProspectName = "",
  initialProspectId = "",
  onCallLogged,
}: SoftphoneWidgetProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);
  const [prospectName, setProspectName] = useState(initialProspectName);
  const [prospectId, setProspectId] = useState(initialProspectId);

  const [callState, setCallState] = useState<CallState>("IDLE");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Disposition fields
  const [selectedDisposition, setSelectedDisposition] = useState("MEETING_BOOKED");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize initial props
  useEffect(() => {
    if (initialNumber) setPhoneNumber(initialNumber);
    if (initialProspectName) setProspectName(initialProspectName);
    if (initialProspectId) setProspectId(initialProspectId);
  }, [initialNumber, initialProspectName, initialProspectId]);

  // Call timer effect
  useEffect(() => {
    let interval: any = null;
    if (callState === "CONNECTED") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callState === "IDLE") setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleStartCall = () => {
    if (!phoneNumber) return;
    setCallState("DIALING");
    // Simulate connection after 2 seconds
    setTimeout(() => {
      setCallState("CONNECTED");
    }, 2000);
  };

  const handleEndCall = () => {
    setCallState("DISPOSITION");
  };

  const handleVoicemailDrop = () => {
    setNotes((prev) => (prev ? prev + " | Voicemail dropped: Template #2" : "Voicemail dropped: Template #2"));
    setSelectedDisposition("VOICEMAIL_DROP");
    setCallState("DISPOSITION");
  };

  const handleSaveDisposition = async () => {
    setIsSubmitting(true);
    try {
      if (prospectId) {
        await fetch("/api/dialer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectId,
            durationSeconds: callDuration,
            disposition: selectedDisposition,
            notes,
          }),
        });
      }
      if (onCallLogged) onCallLogged();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setCallState("IDLE");
      setNotes("");
      onClose();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300 shadow-2xl rounded-2xl border border-[#23314B] bg-[#0E1524] overflow-hidden",
        isMinimized ? "w-72 h-14" : "w-80 h-[520px]"
      )}
    >
      {/* Header */}
      <div className="h-14 px-4 bg-[#141E33] border-b border-[#23314B] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 fill-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">
              {prospectName || "WebRTC Softphone"}
            </h4>
            <p className="text-[10px] text-slate-400">
              {callState === "CONNECTED"
                ? `Active Call • ${formatTimer(callDuration)}`
                : callState === "DIALING"
                ? "Calling..."
                : "Ready to Dial"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-7 h-7 rounded-md hover:bg-[#1E2C48] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 flex flex-col h-[calc(520px-56px)] justify-between">
          {/* Active Call / Dialing State */}
          {callState === "CONNECTED" || callState === "DIALING" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              {/* Pulsing Avatar */}
              <div className="relative">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all shadow-lg",
                    callState === "CONNECTED"
                      ? "bg-gradient-to-tr from-emerald-500 to-teal-400 animate-pulse"
                      : "bg-gradient-to-tr from-indigo-500 to-rose-500"
                  )}
                >
                  {prospectName
                    ? prospectName.slice(0, 2).toUpperCase()
                    : phoneNumber.slice(-2)}
                </div>
                {callState === "CONNECTED" && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0E1524]" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white">
                  {prospectName || "Direct Prospect Call"}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{phoneNumber}</p>
              </div>

              {/* Status and Waveform */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18233C] border border-[#243354]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce" />
                  <span
                    className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-2 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {callState === "DIALING" ? "Ringing..." : formatTimer(callDuration)}
                </span>
              </div>

              {/* Mid-Call Action Buttons */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                    isMuted
                      ? "bg-rose-500 text-white"
                      : "bg-[#18233C] text-slate-300 hover:bg-[#202E4E]"
                  )}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleVoicemailDrop}
                  className="px-3.5 py-2.5 rounded-xl bg-[#1E293B] border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Voicemail className="w-4 h-4 text-amber-400" />
                  Drop VM
                </button>

                <button
                  onClick={handleEndCall}
                  className="w-11 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow-lg shadow-rose-600/30"
                  title="Hang Up"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : callState === "DISPOSITION" ? (
            /* Disposition / Call Outcome Form */
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Log Call Outcome</span>
                </div>

                <div className="space-y-2 mb-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Disposition Status
                  </label>
                  <select
                    value={selectedDisposition}
                    onChange={(e) => setSelectedDisposition(e.target.value)}
                    className="w-full bg-[#131C31] border border-[#233352] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="MEETING_BOOKED">Meeting Booked</option>
                    <option value="INTERESTED">Interested (Follow Up)</option>
                    <option value="LEFT_VOICEMAIL">Left Voicemail</option>
                    <option value="VOICEMAIL_DROP">Dropped Automated VM</option>
                    <option value="GATEKEEPER">Gatekeeper Screened</option>
                    <option value="NO_ANSWER">No Answer</option>
                    <option value="BUSY">Line Busy</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    Call Notes & Insights
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Wants demo on Friday 2pm with CEO..."
                    className="w-full bg-[#18233C] border border-[#27385A] rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSaveDisposition}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Outcome & Next"}
              </button>
            </div>
          ) : (
            /* IDLE Keypad & Dial State */
            <div className="flex-1 flex flex-col justify-between">
              {/* Number Input Bar */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number..."
                  className="w-full bg-[#141E33] border border-[#23314B] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-center tracking-wider"
                />
                {phoneNumber && (
                  <button
                    onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dialpad Matrix */}
              <div className="grid grid-cols-3 gap-2 px-2 my-auto">
                {keypad.map((k) => (
                  <button
                    key={k}
                    onClick={() => setPhoneNumber((prev) => prev + k)}
                    className="h-10 rounded-xl bg-[#141E33] border border-[#222E46] text-white font-bold text-sm hover:bg-[#1E2C48] hover:border-indigo-500/40 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* Call Trigger Button */}
              <button
                disabled={!phoneNumber}
                onClick={handleStartCall}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all mt-2 shadow-lg",
                  phoneNumber
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 shadow-emerald-500/25"
                    : "bg-slate-800 text-slate-400 cursor-not-allowed"
                )}
              >
                <Phone className="w-4 h-4 fill-white" />
                Start Call via WebRTC
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
