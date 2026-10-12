"use client";

import React from "react";
import { Search, Bell, Phone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onOpenDialer?: (number?: string, name?: string) => void;
  onOpenAddProspect?: () => void;
  realtimeStatus?: string;
}

export function Topbar({
  onOpenDialer,
  onOpenAddProspect,
  realtimeStatus = "CONNECTED",
}: TopbarProps) {
  return (
    <header className="h-14 border-b border-[#162035] bg-[#0D1322] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input & Live Engine Badge */}
      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prospects, sequences (Ctrl+K)..."
            className="w-full bg-[#131C31] border border-[#233352] rounded-md pl-8 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Real-time Status Badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border",
            realtimeStatus === "CONNECTED"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : realtimeStatus === "CONNECTING"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}
          title={`SSE Engine: ${realtimeStatus}`}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              realtimeStatus === "CONNECTED"
                ? "bg-emerald-400 animate-pulse"
                : realtimeStatus === "CONNECTING"
                ? "bg-amber-400 animate-ping"
                : "bg-rose-400"
            )}
          />
          <span>{realtimeStatus === "CONNECTED" ? "LIVE SSE" : realtimeStatus}</span>
        </div>
      </div>

      {/* Quick Action Buttons & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Click to Open Softphone */}
        <button
          onClick={() => onOpenDialer && onOpenDialer()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#131C31] border border-[#233352] text-slate-200 hover:bg-[#1A2640] transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-blue-400" />
          <span>Softphone</span>
        </button>

        {/* Quick Add Prospect */}
        <button
          onClick={() => onOpenAddProspect && onOpenAddProspect()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Prospect</span>
        </button>

        {/* Notification Bell */}
        <div className="w-8 h-8 rounded-md bg-[#131C31] border border-[#233352] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors relative">
          <Bell className="w-3.5 h-3.5" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute top-2 right-2" />
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#162035]">
          <div className="w-7 h-7 rounded-md bg-[#1A2640] border border-[#233352] flex items-center justify-center text-[11px] font-bold text-slate-200">
            AM
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 leading-tight">Alex Mercer</span>
            <span className="text-[10px] text-slate-400 font-medium">Sales Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
