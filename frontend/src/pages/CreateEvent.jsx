import { useState, useEffect } from "react";
import { api } from "../api";

export default function CreateEvent() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    eventType: "page_view",
    leadId: "",
    email: "",
    name: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [createLead, setCreateLead] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const res = await api.getLeads();
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (createLead) {
        // Create new lead first
        const leadRes = await api.createLead({
          name: formData.name,
          email: formData.email,
          company: formData.company,
        });
        formData.leadId = leadRes.data._id;
      }

      await api.createEvent({
        eventType: formData.eventType,
        leadId: formData.leadId,
      });

      setMessage({
        type: "success",
        text: "Event created! Processing asynchronously...",
      });
      setFormData({ ...formData, eventType: "page_view" });
      loadLeads();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fire Event</h2>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-100"
              : "bg-green-50 text-green-700 border border-green-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createLead}
            onChange={(e) => setCreateLead(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Create new lead</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {createLead ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lead *
            </label>
            <select
              value={formData.leadId}
              onChange={(e) =>
                setFormData({ ...formData, leadId: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Choose a lead...</option>
              {leads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name} ({lead.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            value={formData.eventType}
            onChange={(e) =>
              setFormData({ ...formData, eventType: e.target.value })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
          >
            <option value="page_view">Page View (+5)</option>
            <option value="signup">Signup (+20)</option>
            <option value="demo_request">Demo Request (+50)</option>
            <option value="contract_signed">Contract Signed (+100)</option>
            <option value="download">Download (+10)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Processing..." : "Fire Event"}
        </button>
      </form>
    </div>
  );
}
