"use client";

import React from "react";
import { Search, Bell, Sparkles, Phone, Plus } from "lucide-react";

interface TopbarProps {
  onOpenDialer?: (number?: string, name?: string) => void;
  onOpenAddProspect?: () => void;
}

export function Topbar({ onOpenDialer, onOpenAddProspect }: TopbarProps) {
  return (
    <header className="h-16 border-b border-[#1F293D] bg-[#0E1320]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prospects, sequences, companies..."
            className="w-full bg-[#141C2E] border border-[#222E46] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Quick Action Buttons & Profile */}
      <div className="flex items-center gap-3">
        {/* Click to Open Softphone */}
        <button
          onClick={() => onOpenDialer && onOpenDialer()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#1A2338] border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <Phone className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
          <span>Open Softphone</span>
        </button>

        {/* Quick Add Prospect */}
        <button
          onClick={() => onOpenAddProspect && onOpenAddProspect()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prospect</span>
        </button>

        {/* Notification Bell */}
        <div className="w-9 h-9 rounded-xl bg-[#141C2E] border border-[#222E46] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-[#0E1320]" />
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1F293D]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
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
