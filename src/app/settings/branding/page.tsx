"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Sparkles,
  Zap,
  Globe,
  Palette,
  ShieldCheck,
  Check,
  Building,
  Image as ImageIcon,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";

const presetColors = [
  { name: "Electric Indigo", hex: "#6366F1" },
  { name: "Cyan Teal", hex: "#0EA5E9" },
  { name: "Emerald Growth", hex: "#10B981" },
  { name: "Rose Crimson", hex: "#F43F5E" },
  { name: "Amber Gold", hex: "#F59E0B" },
  { name: "Violet Royal", hex: "#8B5CF6" },
];

export default function BrandingSettingsPage() {
  const { tenant, refreshTenant } = useDashboard();

  const [name, setName] = useState(tenant.name);
  const [brandColor, setBrandColor] = useState(tenant.brandColor);
  const [logoUrl, setLogoUrl] = useState("");
  const [customDomain, setCustomDomain] = useState("outreach.agency.io");
  const [isWhiteLabeled, setIsWhiteLabeled] = useState(tenant.isWhiteLabeled);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setName(tenant.name);
    setBrandColor(tenant.brandColor);
    setIsWhiteLabeled(tenant.isWhiteLabeled);
  }, [tenant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brandColor,
          logoUrl,
          customDomain,
          isWhiteLabeled,
        }),
      });

      if (res.ok) {
        await refreshTenant();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          White-Label & Agency Customization
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize platform brand identity, accent palette, custom domain mapping, and white-label client presentation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-6 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Branding settings updated and applied across workspace!
              </div>
            )}

            {/* Platform Brand Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Workspace / Agency Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Vanguard Sales Engine"
                className="w-full bg-[#162138] border border-[#263756] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Custom Brand Accent Color */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Primary Brand Accent Color
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {presetColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setBrandColor(c.hex)}
                    className={cn(
                      "p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center",
                      brandColor.toLowerCase() === c.hex.toLowerCase()
                        ? "border-white bg-[#1A253E] scale-105"
                        : "border-[#222E46] bg-[#141C2E] hover:bg-[#1A253E]"
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full shadow"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[9px] font-bold text-slate-300 truncate w-full">
                      {c.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#6366F1"
                  className="w-32 bg-[#162138] border border-[#263756] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Custom Domain (CNAME) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Custom CNAME Domain Mapping
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="outreach.yourdomain.com"
                  className="w-full bg-[#162138] border border-[#263756] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Point your DNS CNAME record to <code className="text-indigo-400">cname.ams-outreach.com</code>
              </p>
            </div>

            {/* White-Label Toggle */}
            <div className="p-4 rounded-xl bg-[#141C2E] border border-[#222E46] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  White-Label Mode
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Removes all default AMS branding marks, login footers, and badges for client-facing portals.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWhiteLabeled}
                  onChange={(e) => setIsWhiteLabeled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving Changes..." : "Apply & Save Branding"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Live Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Real-Time Live Preview
          </div>

          <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-5 shadow-sm space-y-4">
            <span className="text-[11px] font-semibold text-slate-400">
              Navigation Header Preview:
            </span>

            {/* Header simulation */}
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E2C44] flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow"
                style={{
                  background: `linear-gradient(135deg, ${brandColor} 0%, #4F46E5 100%)`,
                }}
              >
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  {name || "Brand Name"}
                  {isWhiteLabeled && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Custom
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">Sales Engine</span>
              </div>
            </div>

            {/* CTA Button preview */}
            <span className="text-[11px] font-semibold text-slate-400 block pt-2">
              Primary Brand Accent Button:
            </span>
            <button
              style={{ backgroundColor: brandColor }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all brightness-100 hover:brightness-110"
            >
              Action Button with {brandColor}
            </button>

            {/* Custom domain badge */}
            <div className="p-3 rounded-xl bg-[#141C2E] border border-[#222E46] text-xs space-y-1">
              <div className="font-semibold text-slate-300">Tenant Domain:</div>
              <div className="font-mono text-indigo-400 text-[11px]">
                https://{customDomain || "outreach.ams-outreach.com"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
