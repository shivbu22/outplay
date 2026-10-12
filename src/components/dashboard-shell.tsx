"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SoftphoneWidget } from "@/components/dialer/softphone-widget";
import { AddProspectModal } from "@/components/add-prospect-modal";
import { useRealtime, ConnectionStatus } from "@/hooks/use-realtime";

interface DashboardContextType {
  openDialer: (number?: string, name?: string, id?: string) => void;
  openAddProspect: () => void;
  tenant: {
    name: string;
    brandColor: string;
    isWhiteLabeled: boolean;
  };
  refreshTenant: () => Promise<void>;
  realtimeStatus: ConnectionStatus;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardShell");
  }
  return context;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // Softphone state
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [dialerNumber, setDialerNumber] = useState("");
  const [dialerName, setDialerName] = useState("");
  const [dialerProspectId, setDialerProspectId] = useState("");

  // Add Prospect state
  const [isAddProspectOpen, setIsAddProspectOpen] = useState(false);

  // Real-time Event Stream connection
  const realtime = useRealtime();

  // Tenant / White-Label branding state
  const [tenant, setTenant] = useState({
    name: "AMS Outreach",
    brandColor: "#6366F1",
    isWhiteLabeled: false,
  });

  const fetchTenant = async () => {
    try {
      const res = await fetch("/api/tenant");
      if (res.ok) {
        const data = await res.json();
        const tData = data.tenant || data;
        setTenant({
          name: tData.name || "AMS Outreach",
          brandColor: tData.brandColor || "#6366F1",
          isWhiteLabeled: Boolean(tData.isWhiteLabeled),
        });
      }
    } catch (err) {
      console.error("Error fetching tenant config:", err);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, []);

  const openDialer = (number?: string, name?: string, id?: string) => {
    if (number) setDialerNumber(number);
    if (name) setDialerName(name);
    if (id) setDialerProspectId(id);
    setIsDialerOpen(true);
  };

  const openAddProspect = () => {
    setIsAddProspectOpen(true);
  };

  return (
    <DashboardContext.Provider
      value={{
        openDialer,
        openAddProspect,
        tenant,
        refreshTenant: fetchTenant,
        realtimeStatus: realtime.status,
      }}
    >
      <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans">
        {/* Persistent Dynamic Sidebar */}
        <Sidebar
          tenantName={tenant.name}
          brandColor={tenant.brandColor}
          isWhiteLabeled={tenant.isWhiteLabeled}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            onOpenDialer={() => openDialer()}
            onOpenAddProspect={openAddProspect}
            realtimeStatus={realtime.status}
          />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>

        {/* Global Floating WebRTC Softphone */}
        <SoftphoneWidget
          isOpen={isDialerOpen}
          onClose={() => setIsDialerOpen(false)}
          initialNumber={dialerNumber}
          initialProspectName={dialerName}
          initialProspectId={dialerProspectId}
          onCallLogged={() => {
            // Trigger custom event or context update if needed
            window.dispatchEvent(new Event("ams:call-logged"));
          }}
        />

        {/* Global Add Prospect Modal */}
        <AddProspectModal
          isOpen={isAddProspectOpen}
          onClose={() => setIsAddProspectOpen(false)}
          onProspectAdded={() => {
            window.dispatchEvent(new Event("ams:prospect-created"));
          }}
        />
      </div>
    </DashboardContext.Provider>
  );
}
