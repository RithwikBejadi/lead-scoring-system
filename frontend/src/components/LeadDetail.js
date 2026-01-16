import React, { useState, useEffect } from 'react';

const STAGE_COLORS = {
  cold: 'bg-blue-100 text-blue-800',
  warm: 'bg-orange-100 text-orange-800',
  hot: 'bg-pink-100 text-pink-800',
  qualified: 'bg-green-100 text-green-800'
};

function LeadDetail({ apiUrl, lead, onBack }) {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const res = await fetch(`${apiUrl}/leads/${lead._id}/intelligence`);
        if (!res.ok) throw new Error('Failed to fetch intelligence');
        const data = await res.json();
        setIntelligence(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIntelligence();
    const interval = setInterval(fetchIntelligence, 3000);
    return () => clearInterval(interval);
  }, [apiUrl, lead._id]);

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={onBack} 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          ← Back to List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-2">{lead.name || 'Lead'}</h2>
        <p className="text-gray-600 mb-6">{lead.email}</p>
        
        <div className="text-7xl font-bold text-blue-600 mb-8">{lead.currentScore || 0}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Stage</h3>
            <div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${STAGE_COLORS[lead.leadStage || 'cold']}`}>
                {(lead.leadStage || 'cold').toUpperCase()}
              </span>
            </div>
          </div>

          {intelligence && (
            <>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Velocity</h3>
                <div className="text-3xl font-bold">{intelligence.intelligence?.velocity || 0}</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Events (24h)</h3>
                <div className="text-3xl font-bold">{lead.eventsLast24h || 0}</div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Risk</h3>
                <div className="text-3xl font-bold uppercase">
                  {intelligence.intelligence?.risk || 'unknown'}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Next Action</h3>
                <div className="text-xl font-bold text-blue-600">
                  {intelligence.intelligence?.nextAction || 'monitor'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeadDetail;
