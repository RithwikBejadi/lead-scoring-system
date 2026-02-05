import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/LeadActivity.css";

const LeadActivity = () => {
  const { id } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/leads/${id}/timeline`,
        );
        setTimeline(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading timeline...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!timeline) {
    return <div className="error">No timeline data found</div>;
  }

  const { lead, sessions, totalEvents } = timeline;

  return (
    <div className="lead-activity">
      <div className="header">
        <Link to="/leads" className="back-link">
          ← Back to Leads
        </Link>
        <h1>Lead Activity</h1>
      </div>

      {/* Lead Summary */}
      <div className="lead-summary">
        <div className="summary-card">
          <h2>Lead Information</h2>
          <div className="lead-info">
            <div className="info-row">
              <span className="label">ID:</span>
              <span className="value">{lead.anonymousId || lead.id}</span>
            </div>
            {lead.name && (
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{lead.name}</span>
              </div>
            )}
            {lead.email && (
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{lead.email}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Score:</span>
              <span className="value score">{lead.score}</span>
            </div>
            <div className="info-row">
              <span className="label">Stage:</span>
              <span className={`badge badge-${lead.stage}`}>{lead.stage}</span>
            </div>
            <div className="info-row">
              <span className="label">Total Events:</span>
              <span className="value">{totalEvents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline">
        <h2>Activity Timeline</h2>
        {sessions.length === 0 ? (
          <p className="no-sessions">No activity recorded</p>
        ) : (
          sessions.map((session, idx) => (
            <div key={idx} className="session-block">
              <div className="session-header">
                <h3>Session {idx + 1}</h3>
                <span className="session-id">{session.sessionId}</span>
                <span className="session-time">
                  {new Date(session.startedAt).toLocaleString()}
                </span>
                <span className="event-count">
                  {session.events.length} events
                </span>
              </div>
              <div className="events-list">
                {session.events.map((event, eventIdx) => (
                  <div key={eventIdx} className="event-card">
                    <div className="event-header">
                      <span className="event-type">{event.event}</span>
                      <span className="event-time">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.delta !== 0 && (
                        <span
                          className={`score-delta ${event.delta > 0 ? "positive" : "negative"}`}
                        >
                          {event.delta > 0 ? "+" : ""}
                          {event.delta}
                        </span>
                      )}
                    </div>
                    {event.properties &&
                      Object.keys(event.properties).length > 0 && (
                        <div className="event-properties">
                          {Object.entries(event.properties).map(
                            ([key, value]) => (
                              <div key={key} className="property">
                                <span className="property-key">{key}:</span>
                                <span className="property-value">
                                  {JSON.stringify(value)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeadActivity;
