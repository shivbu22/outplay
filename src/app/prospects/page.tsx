"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Upload,
  UserPlus,
  Building,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  MoreVertical,
  Layers,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";

export default function ProspectsPage() {
  const { openDialer, openAddProspect } = useDashboard();

  const [prospects, setProspects] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvSuccessMessage, setCsvSuccessMessage] = useState("");

  // Bulk Enrollment Modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [availableSequences, setAvailableSequences] = useState<any[]>([]);
  const [selectedSequenceId, setSelectedSequenceId] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState("");

  const handleOpenEnrollModal = async () => {
    setIsEnrollModalOpen(true);
    setEnrollMessage("");
    try {
      const res = await fetch("/api/sequences");
      if (res.ok) {
        const d = await res.json();
        setAvailableSequences(d.sequences || []);
        if (d.sequences?.length > 0) {
          setSelectedSequenceId(d.sequences[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnrollSelected = async () => {
    if (!selectedSequenceId || selectedProspectIds.length === 0) return;
    setIsEnrolling(true);
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ENROLL",
          sequenceId: selectedSequenceId,
          prospectIds: selectedProspectIds,
        }),
      });
      if (res.ok) {
        setEnrollMessage(`Enrolled ${selectedProspectIds.length} prospects into cadence.`);
        setTimeout(() => {
          setIsEnrollModalOpen(false);
          setEnrollMessage("");
          setSelectedProspectIds([]);
          loadProspects();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnrolling(false);
    }
  };

  const loadProspects = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/prospects", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (selectedStatus !== "ALL") url.searchParams.set("status", selectedStatus);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setProspects(data.prospects || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to fetch prospects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspects();

    const handleCreated = () => loadProspects();
    window.addEventListener("ams:prospect-created", handleCreated);
    return () => window.removeEventListener("ams:prospect-created", handleCreated);
  }, [search, selectedStatus]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProspectIds(prospects.map((p) => p.id));
    } else {
      setSelectedProspectIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSimulateCsvImport = async () => {
    try {
      const sampleContacts = [
        {
          firstName: "Evelyn",
          lastName: "Shaw",
          email: "evelyn.shaw@datadog.mock",
          phone: "+1 (415) 890-1234",
          companyName: "Datadog Systems",
          title: "Director of Infrastructure",
        },
        {
          firstName: "Marcus",
          lastName: "Brody",
          email: "m.brody@cloudflare.mock",
          phone: "+1 (415) 345-6789",
          companyName: "Cloudflare Edge",
          title: "VP of Security",
        },
      ];

      for (const contact of sampleContacts) {
        await fetch("/api/prospects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contact),
        });
      }

      setCsvSuccessMessage("Successfully imported 2 sample prospects from CSV!");
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvSuccessMessage("");
        loadProspects();
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Prospects & Accounts Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage target decision-makers, track sequence stages, and trigger click-to-dial softphone calls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141C2E] border border-[#222E46] text-slate-300 hover:text-white hover:bg-[#1A253E] transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={openAddProspect}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Prospect</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] p-4 space-y-4 shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { key: "ALL", label: "All Contacts" },
            { key: "ACTIVE", label: "In Cadence" },
            { key: "MEETING_BOOKED", label: "Meetings Booked" },
            { key: "REPLIED", label: "Replied" },
            { key: "UNENROLLED", label: "Not Enrolled" },
            { key: "BOUNCED", label: "Bounced" },
          ].map((tab) => {
            const isActive = selectedStatus === tab.key;
            const count = counts[tab.key] ?? (tab.key === "ALL" ? prospects.length : 0);

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-2",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-[#151D2F]"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-md font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-[#162138] text-slate-400"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Bulk Actions Bar */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#1A253A]">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              className="w-full bg-[#131B2C] border border-[#202E48] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {selectedProspectIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-indigo-400">
                {selectedProspectIds.length} selected
              </span>
              <button
                onClick={handleOpenEnrollModal}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold hover:bg-indigo-500/30 transition-colors"
              >
                Enroll in Sequence
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prospect Table */}
      <div className="rounded-2xl bg-[#0E1524] border border-[#1E2C44] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#121A2B] border-b border-[#1E2C44] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      prospects.length > 0 &&
                      selectedProspectIds.length === prospects.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded bg-[#18233C] border-[#293B5E] text-indigo-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">Prospect Name</th>
                <th className="py-3 px-4">Company & Title</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Active Cadence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Instant Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A253A]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="w-4 h-4 bg-[#1A2640] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-32 h-4 bg-[#1A2640] rounded mb-1" /><div className="w-20 h-2.5 bg-[#141C31] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-4 bg-[#1A2640] rounded mb-1" /><div className="w-16 h-2.5 bg-[#141C31] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-28 h-4 bg-[#1A2640] rounded mb-1" /><div className="w-20 h-2.5 bg-[#141C31] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-6 bg-[#1A2640] rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-16 h-5 bg-[#1A2640] rounded-full" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="w-8 h-8 bg-[#1A2640] rounded ml-auto" /></td>
                  </tr>
                ))
              ) : prospects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No prospects found matching your search.
                  </td>
                </tr>
              ) : (
                prospects.map((p) => {
                  const isSelected = selectedProspectIds.includes(p.id);
                  const activeEnrollment = p.enrollments && p.enrollments[0];

                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "hover:bg-[#141C2E]/70 transition-colors",
                        isSelected && "bg-indigo-950/20"
                      )}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded bg-[#18233C] border-[#293B5E] text-indigo-600 focus:ring-0"
                        />
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center">
                            {p.firstName[0]}
                            {p.lastName ? p.lastName[0] : ""}
                          </div>
                          <div>
                            <div className="font-bold text-white leading-tight">
                              {p.firstName} {p.lastName}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {p.timezone || "America/New_York"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company & Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {p.companyName || p.account?.name || "Independent"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.title || "Not specified"}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium">{p.email}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.phone || "No phone listed"}
                        </div>
                      </td>

                      {/* Active Cadence */}
                      <td className="py-3.5 px-4">
                        {activeEnrollment ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#151F33] border border-[#243452] text-[11px] text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="font-semibold truncate max-w-[140px]">
                              {activeEnrollment.sequence.name}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              (Step {activeEnrollment.currentStepNumber})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Unenrolled</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1",
                            p.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : p.status === "MEETING_BOOKED"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : p.status === "REPLIED"
                              ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                              : p.status === "BOUNCED"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : "bg-slate-700/30 text-slate-400 border border-slate-700/50"
                          )}
                        >
                          {p.status === "MEETING_BOOKED"
                            ? "Meeting Booked"
                            : p.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Call Button */}
                          <button
                            onClick={() =>
                              openDialer(
                                p.phone || "",
                                `${p.firstName} ${p.lastName}`,
                                p.id
                              )
                            }
                            className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 transition-colors"
                            title="Call via WebRTC Softphone"
                          >
                            <Phone className="w-3.5 h-3.5 fill-teal-300" />
                          </button>

                          {/* Email Trigger */}
                          <a
                            href={`mailto:${p.email}`}
                            className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
                            title="Compose Direct Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0F1626] border border-[#22304C] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#22304C]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                Import Prospects CSV
              </h3>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {csvSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {csvSuccessMessage}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Upload any CSV export from ZoomInfo, Apollo, Sales Navigator, or HubSpot. AMS automatically detects columns: First Name, Last Name, Email, Phone, Company, and Title.
                </p>

                <div className="border-2 border-dashed border-[#293B5E] rounded-xl p-8 text-center bg-[#131B2D]">
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-white">Click to upload contacts.csv</p>
                  <p className="text-[10px] text-slate-400 mt-1">UTF-8 encoded CSV up to 10MB</p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCsvModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSimulateCsvImport}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 shadow-md"
                  >
                    Run Demo CSV Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Cadence Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0E1524] border border-[#222E46] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2C44]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Enroll {selectedProspectIds.length} Prospects into Cadence
                </h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {enrollMessage ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {enrollMessage}
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-300">
                  Select the target multi-channel sequence to initiate automated touches across email, phone, and LinkedIn.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Target Cadence
                  </label>
                  <select
                    value={selectedSequenceId}
                    onChange={(e) => setSelectedSequenceId(e.target.value)}
                    className="w-full bg-[#131C31] border border-[#233352] rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {availableSequences.map((seq) => (
                      <option key={seq.id} value={seq.id}>
                        {seq.name} ({seq.steps?.length || 0} steps • {seq._count?.enrollments || 0} enrolled)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-[#131C31] border border-[#233352] text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Initial Step:</span>
                    <strong className="text-white">Step #1 (Automated Email)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mailbox Rotation:</span>
                    <strong className="text-emerald-400">Round-Robin Active</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Stop on Reply:</span>
                    <strong className="text-blue-400">Yes (Auto-Pause)</strong>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isEnrolling || !selectedSequenceId}
                    onClick={handleEnrollSelected}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEnrolling ? "Enrolling..." : `Enroll ${selectedProspectIds.length} Prospects`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
