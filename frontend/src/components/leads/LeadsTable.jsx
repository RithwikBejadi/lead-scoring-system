import React from "react";

/**
 * Helper functions to calculate derived display properties from lead data
 */
const getStageConfig = (score) => {
  if (score >= 85) {
    return {
      stage: "Qualified",
      stageBg: "bg-indigo-600",
      stageColor: "text-white",
    };
  } else if (score >= 70) {
    return {
      stage: "Hot",
      stageBg: "bg-primary",
      stageColor: "text-white",
    };
  } else if (score >= 40) {
    return {
      stage: "Warm",
      stageBg: "bg-blue-100",
      stageColor: "text-blue-700",
    };
  } else {
    return {
      stage: "Cold",
      stageBg: "bg-slate-100",
      stageColor: "text-slate-500",
    };
  }
};

const getVelocityConfig = (velocityScore, eventsLast24h) => {
  // Normalize velocity to 0-10 scale
  const normalizedVelocity = Math.min(velocityScore / 10, 10);
  const velocityValue = normalizedVelocity.toFixed(1);
  const velocityWidth = `${(normalizedVelocity / 10) * 100}%`;

  // Determine velocity change (placeholder - would need historical data)
  let velocityChange = "~ 0%";
  let velocityChangeColor = "text-slate-400";

  if (eventsLast24h > 5) {
    velocityChange = `↑ ${Math.min(eventsLast24h * 3, 50)}%`;
    velocityChangeColor = "text-green-500";
  } else if (eventsLast24h < 2) {
    velocityChange = `↓ ${20 + eventsLast24h * 10}%`;
    velocityChangeColor = "text-red-500";
  }

  // Bar color based on velocity
  let velocityBarColor = "bg-slate-400";
  if (normalizedVelocity >= 7) velocityBarColor = "bg-primary";
  else if (normalizedVelocity >= 4) velocityBarColor = "bg-blue-300";

  return {
    velocityValue,
    velocityChange,
    velocityChangeColor,
    velocityBarColor,
    velocityBarWidth: velocityWidth,
  };
};

const getRiskConfig = (velocityScore, lastEventAt, currentScore) => {
  const daysSinceLastEvent = lastEventAt
    ? Math.floor((Date.now() - new Date(lastEventAt)) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSinceLastEvent > 7 || velocityScore < 1) {
    return {
      riskLevel: "High Risk (Churn)",
      riskColor: "bg-red-500",
      riskTextColor: "text-red-600",
    };
  } else if (daysSinceLastEvent > 3 || velocityScore < 3) {
    return {
      riskLevel: "Medium Risk",
      riskColor: "bg-amber-500",
      riskTextColor: "text-amber-600",
    };
  } else {
    return {
      riskLevel: "Low Risk",
      riskColor: "bg-green-500",
      riskTextColor: "text-green-600",
    };
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Never";

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const LeadsTable = ({ onSelectLead, selectedLeadId, leads = [] }) => {
  // Transform API lead data to display format
  const transformedLeads = leads.map((lead) => {
    const stageConfig = getStageConfig(lead.currentScore || 0);
    const velocityConfig = getVelocityConfig(
      lead.velocityScore || 0,
      lead.eventsLast24h || 0,
    );
    const riskConfig = getRiskConfig(
      lead.velocityScore || 0,
      lead.lastEventAt,
      lead.currentScore || 0,
    );

    // Get initials for avatar
    const getInitials = (name, email) => {
      if (name && name.trim()) {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      }
      if (email) {
        return email.substring(0, 2).toUpperCase();
      }
      return "??";
    };

    return {
      id: lead._id,
      name:
        lead.name ||
        lead.email ||
        `Anonymous (${lead.anonymousId?.substring(0, 8)})`,
      email: lead.email || lead.anonymousId,
      image: null, // API doesn't provide images
      initial: getInitials(lead.name, lead.email),
      initialBg: "bg-slate-200 dark:bg-slate-800",
      initialColor: "text-slate-500",
      score: lead.currentScore || 0,
      ...stageConfig,
      ...velocityConfig,
      ...riskConfig,
      lastEvent: lead.lastEventType || "unknown",
      lastEventTime: formatTimestamp(lead.lastEventAt),
      rawLead: lead, // Keep original data for drawer
    };
  });

  // Empty state
  if (transformedLeads.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mx-6 p-12">
        <div className="text-center">
          <span className="material-icons text-6xl text-slate-300 dark:text-slate-700 mb-4">
            groups
          </span>
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            No Leads Yet
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Start tracking leads by adding the integration snippet to your
            website
          </p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Or use the{" "}
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              Simulator
            </span>{" "}
            to create test leads
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mx-6">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider font-semibold">
            <th className="px-6 py-4">Lead Identity</th>
            <th className="px-6 py-4">Score & Stage</th>
            <th className="px-6 py-4">Engagement Velocity</th>
            <th className="px-6 py-4">Risk Analysis</th>
            <th className="px-6 py-4">Last Event</th>
            <th className="px-6 py-4 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-slate-800 text-sm">
          {transformedLeads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelectLead(lead.rawLead)}
              className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors ${selectedLeadId === lead.id ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {lead.image ? (
                      <img
                        src={lead.image}
                        alt=""
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${lead.initialBg} ${lead.initialColor}`}
                      >
                        {lead.initial}
                      </div>
                    )}
                    {/* Show linked icon for identified leads */}
                    {lead.email && (
                      <div
                        className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                        title="Identity Resolved"
                      >
                        <span className="material-icons text-[12px]">link</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {lead.name}
                    </div>
                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {lead.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="tabular-nums font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {lead.score}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${lead.stageBg} ${lead.stageColor}`}
                  >
                    {lead.stage}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="w-32">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {lead.velocityValue}/10
                    </span>
                    <span className={`${lead.velocityChangeColor} font-bold`}>
                      {lead.velocityChange}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`${lead.velocityBarColor} h-full rounded-full`}
                      style={{ width: lead.velocityBarWidth }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${lead.riskColor}`}
                  ></div>
                  <span className={`text-xs font-medium ${lead.riskTextColor}`}>
                    {lead.riskLevel}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
                <div className="flex flex-col">
                  <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded self-start text-text-primary-light dark:text-text-primary-dark font-mono">
                    {lead.lastEvent}
                  </code>
                  <span className="text-[10px] mt-1">{lead.lastEventTime}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="material-icons text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  chevron_right
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable;
