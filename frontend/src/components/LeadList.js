import React, { useState, useEffect } from 'react';

const STAGE_COLORS = {
  cold: 'bg-blue-100 text-blue-800',
  warm: 'bg-orange-100 text-orange-800',
  hot: 'bg-pink-100 text-pink-800',
  qualified: 'bg-green-100 text-green-800'
};

function LeadList({ apiUrl, onSelectLead }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/leads`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 3000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (loading) return <div className="text-center py-10 text-gray-600">Loading leads...</div>;
  if (error) return <div className="bg-red-100 text-red-800 p-4 rounded">Error: {error}</div>;
  if (!leads.length) return <div className="text-center py-20 text-gray-400">No leads yet. Create one in Event Trigger panel.</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">All Leads</h2>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Velocity</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {leads.map(lead => (
            <tr 
              key={lead._id} 
              onClick={() => onSelectLead(lead)}
              className="hover:bg-gray-50 cursor-pointer transition"
            >
              <td className="px-6 py-4">{lead.name || 'N/A'}</td>
              <td className="px-6 py-4 text-gray-600">{lead.email}</td>
              <td className="px-6 py-4"><span className="font-bold text-lg">{lead.currentScore || 0}</span></td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STAGE_COLORS[lead.leadStage || 'cold']}`}>
                  {(lead.leadStage || 'cold').toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{lead.eventsLast24h || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadList;
