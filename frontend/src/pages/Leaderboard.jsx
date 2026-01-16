import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Leaderboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="card">
      <h2>🏆 Top Leads</h2>
      
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Email</th>
            <th>Score</th>
            <th>Stage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr key={lead._id}>
              <td><strong>#{idx + 1}</strong></td>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td><strong>{lead.currentScore}</strong></td>
              <td><span className={`badge badge-${lead.leadStage}`}>{lead.leadStage.toUpperCase()}</span></td>
              <td>
                <Link to={`/leads/${lead._id}`}>
                  <button className="btn btn-primary">View</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
