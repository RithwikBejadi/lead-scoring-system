import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [leadRes, intRes, histRes] = await Promise.all([
        api.getLead(id),
        api.getLeadIntelligence(id),
        api.getLeadHistory(id)
      ]);
      setLead(leadRes.data);
      setIntelligence(intRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!lead) return <div className="error">Lead not found</div>;

  const chartData = {
    labels: history.map(h => new Date(h.timestamp).toLocaleString()),
    datasets: [{
      label: 'Score',
      data: history.map(h => h.newScore),
      borderColor: '#2563eb',
      tension: 0.1
    }]
  };

  return (
    <div>
      <Link to="/">← Back to Leads</Link>
      
      <div className="stats" style={{marginTop: '1rem'}}>
        <div className="stat-card">
          <h3>Current Score</h3>
          <p>{lead.currentScore}</p>
        </div>
        <div className="stat-card">
          <h3>Stage</h3>
          <p style={{fontSize: '1.5rem'}}>{lead.leadStage.toUpperCase()}</p>
        </div>
        {intelligence && (
          <>
            <div className="stat-card">
              <h3>Velocity</h3>
              <p style={{fontSize: '1.5rem'}}>{intelligence.velocity}</p>
            </div>
            <div className="stat-card">
              <h3>Risk</h3>
              <p style={{fontSize: '1.5rem'}}>{intelligence.risk}</p>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>{lead.name}</h3>
        <p>{lead.email} | {lead.company}</p>
        {intelligence && (
          <div style={{marginTop: '1rem'}}>
            <strong>Next Action:</strong> {intelligence.nextAction}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Score History</h3>
        <Line data={chartData} />
      </div>

      <div className="card">
        <h3>Event Timeline</h3>
        <div className="timeline">
          {history.map((item, idx) => (
            <div key={idx} className="timeline-item">
              <strong>{item.eventType}</strong>
              <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                {new Date(item.timestamp).toLocaleString()} | +{item.points} points
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
