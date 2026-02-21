import React, { useState } from "react";
import api from "../api/axios.config";

const Simulator = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentLead, setCurrentLead] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  React.useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await api.get("/auth/project");
      if (response.data?.data?.project?.apiKey) {
        setApiKey(response.data.data.project.apiKey);
        addLog("API Key loaded successfully", "success");
      } else {
        addLog("Failed to load API Key", "error");
      }
    } catch (error) {
      addLog(`Failed to load API Key: ${error.message}`, "error");
    }
  };

  const addLog = (message, type = "info") => {
    setLogs((prev) => [{ timestamp: new Date(), message, type }, ...prev]);
  };

  const createLead = async () => {
    setLoading(true);
    try {
      const randomId = Math.floor(Math.random() * 10000);
      const leadData = {
        email: `test_user_${randomId}@example.com`,
        name: `Test User ${randomId}`,
        company: "Acme Corp",
      };

      // In a real scenario, this would be an ingestion call or an identify call
      // For this simulator, we'll hit the ingestion endpoint which creates/updates leads
      const response = await api.post("/ingest/event", {
        apiKey: apiKey,
        event: "IDENTIFY",
        anonymousId: leadData.email,
        properties: leadData,
      });

      if (response.data) {
        setCurrentLead(leadData);
        addLog(`Created/Identified Lead: ${leadData.email}`, "success");
      }
    } catch (error) {
      addLog(`Error creating lead: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const sendEvent = async (eventType, scoreImpact) => {
    if (!currentLead) {
      addLog("Please create/identify a lead first", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/ingest/event", {
        apiKey: apiKey,
        event: eventType,
        anonymousId: currentLead.email,
        properties: {
          url: window.location.href,
          simulation: true,
        },
      });

      addLog(`Sent Event: ${eventType} (Impact: ~${scoreImpact})`, "success");
    } catch (error) {
      addLog(`Error sending event: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-google-border">
        <h2 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">
          Lead Scoring Simulator
        </h2>
        <p className="mb-6 text-text-secondary-light dark:text-text-secondary-dark">
          Use this tool to simulate user actions and generate data for the
          dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                1. Identity
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  {currentLead ? (
                    <div className="text-sm">
                      <p className="font-bold text-success">
                        {currentLead.name}
                      </p>
                      <p className="text-xs text-text-secondary-light">
                        {currentLead.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-text-secondary-light">
                      No lead selected
                    </span>
                  )}
                </div>
                <button
                  onClick={createLead}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                >
                  {currentLead ? "Switch User" : "Create Test User"}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                2. Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => sendEvent("PAGE_VIEW", 1)}
                  disabled={loading || !currentLead}
                  className="p-3 bg-white dark:bg-slate-700 border border-google-border rounded hover:border-primary transition-colors text-left"
                >
                  <div className="font-bold text-sm">Page View</div>
                  <div className="text-xs text-text-secondary-light">
                    +1 Score
                  </div>
                </button>
                <button
                  onClick={() => sendEvent("PRICING_VIEW", 5)}
                  disabled={loading || !currentLead}
                  className="p-3 bg-white dark:bg-slate-700 border border-google-border rounded hover:border-primary transition-colors text-left"
                >
                  <div className="font-bold text-sm">Pricing View</div>
                  <div className="text-xs text-text-secondary-light">
                    +5 Score
                  </div>
                </button>
                <button
                  onClick={() => sendEvent("WEBINAR_SIGNUP", 15)}
                  disabled={loading || !currentLead}
                  className="p-3 bg-white dark:bg-slate-700 border border-google-border rounded hover:border-primary transition-colors text-left"
                >
                  <div className="font-bold text-sm">Webinar Signup</div>
                  <div className="text-xs text-text-secondary-light">
                    +15 Score
                  </div>
                </button>
                <button
                  onClick={() => sendEvent("REQUEST_DEMO", 50)}
                  disabled={loading || !currentLead}
                  className="p-3 bg-white dark:bg-slate-700 border border-google-border rounded hover:border-primary transition-colors text-left"
                >
                  <div className="font-bold text-sm">Request Demo</div>
                  <div className="text-xs text-text-secondary-light">
                    +50 Score (Hot)
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-[300px] overflow-y-auto">
            <h3 className="text-slate-500 mb-2 uppercase tracking-wider text-[10px] font-bold">
              Simulator Logs
            </h3>
            <div className="space-y-1">
              {logs.length === 0 && (
                <span className="opacity-50">Waiting for actions...</span>
              )}
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`${log.type === "error" ? "text-red-400" : log.type === "warning" ? "text-yellow-400" : "text-green-400"}`}
                >
                  <span className="opacity-50">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>{" "}
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
