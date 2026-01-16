import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadLeads = async () => {
    try {
      const res = await api.getLeads();
      setLeads(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage) => {
    return <span className={`badge badge-${stage}`}>{stage.toUpperCase()}</span>;
  };

  if (loading) return <div className="loading">Loading leads...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="card">
      <h2>All Leads</h2>
      
      {leads.length === 0 ? (
        <div className="empty">
          <p>No leads yet. Create one from the Events page.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Score</th>
              <th>Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.company || '-'}</td>
                <td><strong>{lead.currentScore}</strong></td>
                <td>{getStageBadge(lead.leadStage)}</td>
                <td>
                  <Link to={`/leads/${lead._id}`}>
                    <button className="btn btn-primary">View</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
