import React, { useState, useEffect } from 'react';

function EventPanel({ apiUrl }) {
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadName, setNewLeadName] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${apiUrl}/leads`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createLead = async (e) => {
    e.preventDefault();
    if (!newLeadEmail) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newLeadEmail, name: newLeadName })
      });

      if (!res.ok) throw new Error('Failed to create lead');
      
      const data = await res.json();
      setMessage({ type: 'success', text: `Lead created: ${data.lead._id}` });
      setNewLeadEmail('');
      setNewLeadName('');
      await fetchLeads();
      setSelectedLeadId(data.lead._id);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fireEvent = async (eventType) => {
    if (!selectedLeadId) {
      setMessage({ type: 'error', text: 'Please select a lead first' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          eventType,
          eventId: `${eventType}_${Date.now()}`
        })
      });

      if (!res.ok) throw new Error('Failed to fire event');
      
      setMessage({ type: 'success', text: `Event "${eventType}" fired successfully` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">Create New Lead</h2>
        <form onSubmit={createLead} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email *</label>
            <input
              type="email"
              value={newLeadEmail}
              onChange={(e) => setNewLeadEmail(e.target.value)}
              placeholder="lead@example.com"
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            Create Lead
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">Fire Events</h2>
        
        {message && (
          <div className={`p-4 rounded mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Select Lead *</label>
          <select 
            value={selectedLeadId} 
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Choose a lead --</option>
            {leads.map(lead => (
              <option key={lead._id} value={lead._id}>
                {lead.email} (Score: {lead.currentScore || 0})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => fireEvent('page_view')} 
            disabled={loading || !selectedLeadId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            🔍 Page View
          </button>
          <button 
            onClick={() => fireEvent('signup')} 
            disabled={loading || !selectedLeadId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            ✍️ Signup
          </button>
          <button 
            onClick={() => fireEvent('download')} 
            disabled={loading || !selectedLeadId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            ⬇️ Download
          </button>
          <button 
            onClick={() => fireEvent('email_open')} 
            disabled={loading || !selectedLeadId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            📧 Email Open
          </button>
          <button 
            onClick={() => fireEvent('demo_request')} 
            disabled={loading || !selectedLeadId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            🎯 Demo Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventPanel;
