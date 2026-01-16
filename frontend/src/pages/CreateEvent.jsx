import { useState, useEffect } from 'react';
import { api } from '../api';

export default function CreateEvent() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    eventType: 'page_view',
    leadId: '',
    email: '',
    name: '',
    company: ''
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
          company: formData.company
        });
        formData.leadId = leadRes.data._id;
      }

      await api.createEvent({
        eventType: formData.eventType,
        leadId: formData.leadId
      });

      setMessage({ type: 'success', text: 'Event created! Processing asynchronously...' });
      setFormData({ ...formData, eventType: 'page_view' });
      loadLeads();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Fire Event</h2>
      
      {message && (
        <div className={message.type === 'error' ? 'error' : 'badge badge-qualified'} style={{padding: '1rem', marginBottom: '1rem'}}>
          {message.text}
        </div>
      )}

      <div style={{marginBottom: '1rem'}}>
        <label>
          <input 
            type="checkbox" 
            checked={createLead}
            onChange={(e) => setCreateLead(e.target.checked)}
          />
          {' '}Create new lead
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        {createLead ? (
          <>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>Select Lead *</label>
            <select
              value={formData.leadId}
              onChange={(e) => setFormData({...formData, leadId: e.target.value})}
              required
            >
              <option value="">Choose a lead...</option>
              {leads.map(lead => (
                <option key={lead._id} value={lead._id}>
                  {lead.name} ({lead.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Event Type *</label>
          <select
            value={formData.eventType}
            onChange={(e) => setFormData({...formData, eventType: e.target.value})}
            required
          >
            <option value="page_view">Page View (+5)</option>
            <option value="signup">Signup (+20)</option>
            <option value="demo_request">Demo Request (+50)</option>
            <option value="contract_signed">Contract Signed (+100)</option>
            <option value="download">Download (+10)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'Processing...' : 'Fire Event'}
        </button>
      </form>
    </div>
  );
}
