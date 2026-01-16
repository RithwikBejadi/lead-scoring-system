import React, { useState } from 'react';
import LeadList from './components/LeadList';
import LeadDetail from './components/LeadDetail';
import EventPanel from './components/EventPanel';

const API_URL = 'http://localhost:4000/api';

function App() {
  const [view, setView] = useState('list');
  const [selectedLead, setSelectedLead] = useState(null);

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Lead Scoring System</h1>
        <div className="flex gap-2 mt-4">
          <button 
            className={`px-4 py-2 rounded transition ${view === 'list' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setView('list')}
          >
            Lead List
          </button>
          <button 
            className={`px-4 py-2 rounded transition ${view === 'events' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setView('events')}
          >
            Event Trigger
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {view === 'list' && (
          <LeadList apiUrl={API_URL} onSelectLead={handleSelectLead} />
        )}

        {view === 'detail' && selectedLead && (
          <LeadDetail apiUrl={API_URL} lead={selectedLead} onBack={handleBack} />
        )}

        {view === 'events' && (
          <EventPanel apiUrl={API_URL} />
        )}
      </div>
    </div>
  );
}

export default App;
