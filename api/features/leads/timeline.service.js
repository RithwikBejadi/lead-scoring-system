const Lead = require("../../models/Lead");
const Event = require("../../models/Event");
const ScoreHistory = require("../../models/ScoreHistory");

class LeadNotFoundError extends Error {
  constructor(leadId) {
    super(`Lead ${leadId} not found`);
    this.name = "LeadNotFoundError";
  }
}

/**
 * Get lead timeline grouped by sessions
 *
 * Returns:
 * - Lead info (score, stage)
 * - Events grouped by sessionId
 * - Score deltas from history
 */
async function getLeadTimeline(leadId) {
  // 1. Validate lead exists
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new LeadNotFoundError(leadId);
  }

  // 2. Fetch all events for this lead, sorted by timestamp
  const events = await Event.find({ leadId }).sort({ timestamp: 1 }).lean();

  // 3. Fetch score history for delta calculation
  const scoreHistory = await ScoreHistory.find({ leadId })
    .sort({ timestamp: 1 })
    .lean();

  // Create a map of eventId -> delta
  const deltaMap = {};
  scoreHistory.forEach((hist) => {
    if (hist.eventId) {
      deltaMap[hist.eventId] = hist.delta || 0;
    }
  });

  // 4. Group events by sessionId
  const sessionMap = new Map();

  events.forEach((event) => {
    const sid = event.sessionId || "no-session";

    if (!sessionMap.has(sid)) {
      sessionMap.set(sid, {
        sessionId: sid,
        startedAt: event.timestamp,
        events: [],
      });
    }

    sessionMap.get(sid).events.push({
      event: event.eventType,
      timestamp: event.timestamp,
      properties: event.properties,
      delta: deltaMap[event.eventId] || 0,
    });
  });

  // 5. Convert to array
  const sessions = Array.from(sessionMap.values());

  // 6. Return formatted response
  return {
    lead: {
      id: lead._id,
      anonymousId: lead.anonymousId,
      name: lead.name,
      email: lead.email,
      score: lead.currentScore,
      stage: lead.leadStage,
      velocityScore: lead.velocityScore,
    },
    sessions,
    totalEvents: events.length,
  };
}

module.exports = {
  getLeadTimeline,
  LeadNotFoundError,
};
