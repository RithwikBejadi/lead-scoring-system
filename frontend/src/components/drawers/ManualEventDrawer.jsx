/**
 * FILE: components/drawers/ManualEventDrawer.jsx
 * PURPOSE: Slide-out drawer for manually logging lead events
 * DATA FLOW: Searches leads, submits event via eventsApi, shows toast on success
 */

import { useState, useEffect } from "react";
import { leadsApi } from "../../api/leads.api";
import { eventsApi } from "../../api/events.api";
import { useToast } from "../../context/ToastContext";

function ManualEventDrawer({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    eventType: "direct_call",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Event types with point values
  const eventTypes = [
    { value: "demo_attended", label: "Demo Attended", points: 20 },
    { value: "direct_call", label: "Direct Call - Outbound", points: 15 },
    { value: "email_response", label: "Email Response", points: 5 },
    { value: "webinar_signup", label: "Webinar Signup", points: 10 },
    { value: "meeting_booked", label: "Meeting Booked", points: 30 },
    { value: "pricing_view", label: "Pricing Page Visit", points: 15 },
    { value: "form_submit", label: "Form Submission", points: 10 },
  ];

  useEffect(() => {
    if (isOpen) {
      loadLeads();
    }
  }, [isOpen]);

  const loadLeads = async () => {
    try {
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (err) {
      console.error("[ManualEventDrawer] Error loading leads:", err);
    }
  };

  const filteredLeads = leads
    .filter((lead) => {
      const search = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.company?.toLowerCase().includes(search)
      );
    })
    .slice(0, 5);

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setSearchTerm(lead.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) {
      showToast("Please select a lead", "error");
      return;
    }

    try {
      setSubmitting(true);

      // Create timestamp from date and time inputs
      const timestamp = new Date(`${formData.date}T${formData.time}`);

      // Generate unique event ID
      const eventId = `manual-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      await eventsApi.create({
        eventId,
        leadId: selectedLead._id,
        eventType: formData.eventType,
        timestamp: timestamp.toISOString(),
        metadata: {
          notes: formData.notes,
          source: "manual_entry",
        },
      });

      const eventLabel =
        eventTypes.find((e) => e.value === formData.eventType)?.label ||
        formData.eventType;
      showToast(
        `Event "${eventLabel}" logged for ${selectedLead.name}`,
        "success"
      );

      // Reset form
      setSelectedLead(null);
      setSearchTerm("");
      setFormData({
        eventType: "direct_call",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: "",
      });
      onClose();
    } catch (err) {
      console.error("[ManualEventDrawer] Submit error:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to log event";
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col drawer-enter border-l border-slate-200 sm:rounded-l-2xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-white sm:rounded-tl-2xl">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
              Log Manual Interaction
            </h1>
            <p className="text-slate-500 text-sm font-normal">
              Manually trigger an event to update lead score.
            </p>
          </div>
          <button
            onClick={onClose}
            className="group p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined group-hover:text-slate-900">
              close
            </span>
          </button>
        </div>

        {/* Body Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-8"
        >
          {/* Lead Selector */}
          <div className="space-y-3 relative">
            <label className="block text-sm font-bold text-slate-900">
              Select Lead <span className="text-red-500">*</span>
            </label>
            <div className="relative z-20">
              <div
                className={`flex items-center w-full rounded-lg border px-3.5 py-2.5 shadow-sm transition-all ${
                  showDropdown
                    ? "border-primary ring-4 ring-primary/10"
                    : "border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-primary mr-3">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) setSelectedLead(null);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full bg-transparent border-none p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                  placeholder="Search leads by name, email..."
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLead(null);
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && filteredLeads.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Top Matches
                    </p>
                  </div>
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead._id}
                      onClick={() => handleSelectLead(lead)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedLead?._id === lead._id
                          ? "bg-primary/5 border-l-[3px] border-primary"
                          : "hover:bg-slate-50 border-l-[3px] border-transparent"
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                        {lead.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {lead.name}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Lead
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {lead.email} • {lead.company}
                        </p>
                      </div>
                      {selectedLead?._id === lead._id && (
                        <span className="material-symbols-outlined text-primary">
                          check
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedLead && (
              <p className="text-xs text-slate-500 pl-1">
                Selected:{" "}
                <span className="font-medium text-primary">
                  {selectedLead.name}
                </span>
              </p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              Event Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} (+{type.points} pts)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <span className="material-symbols-outlined text-xl">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="block text-sm font-bold text-slate-900">
                Notes
              </label>
              <span className="text-xs text-slate-400">Optional</span>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Add context about the interaction, customer sentiment, or follow-up items..."
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 flex gap-3 items-start">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5">
              info
            </span>
            <p className="text-xs text-primary leading-relaxed">
              Submitting this event will immediately recalculate the lead score
              and update the dashboard in real-time.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 sm:rounded-bl-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || !selectedLead}
            className="group relative px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {submitting ? "Submitting..." : "Submit Event"}
            </span>
            <span className="material-symbols-outlined text-lg relative z-10 group-hover:translate-x-1 transition-transform">
              send
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default ManualEventDrawer;
