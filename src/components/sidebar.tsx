"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitFork,
  PhoneCall,
  Inbox,
  BarChart3,
  Settings,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tenantName?: string;
  brandColor?: string;
  isWhiteLabeled?: boolean;
}

export function Sidebar({
  tenantName = "AMS Outreach",
  brandColor = "#3B82F6",
  isWhiteLabeled = false,
}: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Prospects", href: "/prospects", icon: Users },
    { name: "Sequences", href: "/sequences", icon: GitFork },
    { name: "Sales Dialer", href: "/dialer", icon: PhoneCall, badge: "WebRTC" },
    { name: "Unified Inbox", href: "/inbox", icon: Inbox },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "White-Label & Settings", href: "/settings/branding", icon: Settings },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-[#162035] bg-[#0D1322] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#162035]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white shadow-sm"
            style={{
              backgroundColor: brandColor,
            }}
          >
            <Zap className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1.5">
              {tenantName}
              {isWhiteLabeled && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Custom
                </span>
              )}
            </span>
            <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase">
              Sales Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workspace
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/10 text-white border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#151D2F]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mailbox Health & Deliverability Footer Card */}
      <div className="p-3 border-t border-[#1F293D]">
        <div className="p-3 rounded-xl bg-[#141C2E] border border-[#222E46] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mailbox Health
            </span>
            <span className="text-emerald-400 font-bold">98% Optimal</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full w-[98%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>2 Active Mailboxes</span>
            <span>Rotation On</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
