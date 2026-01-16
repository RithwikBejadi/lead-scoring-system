/**
 * FILE: lead.routes.js
 * PURPOSE: HTTP routes for lead creation, retrieval, and intelligence
 * FLOW: Client → API → Service → Queue (async processing)
 * RELATED:
 *   - lead.controller.js (CRUD operations)
 *   - intelligence.controller.js (scoring intelligence)
 *   - ../../../shared/queue (event queue)
 */

const router = require("express").Router();
const controller = require("./lead.controller");
const intelligenceController = require("./intelligence.controller");
const Lead = require("../../models/Lead");

async function getAllLeads(req, res, next) {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(100);
    res.json(leads);
  } catch (err) {
    next(err);
  }
}

// Export leads as CSV
async function exportLeads(req, res, next) {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    // CSV header
    const headers = [
      "Name",
      "Email",
      "Company",
      "Score",
      "Stage",
      "Created At",
    ];
    const csvRows = [headers.join(",")];

    // CSV data rows
    leads.forEach((lead) => {
      const row = [
        `"${(lead.name || "").replace(/"/g, '""')}"`,
        `"${(lead.email || "").replace(/"/g, '""')}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        lead.currentScore || 0,
        `"${lead.leadStage || lead.status || "cold"}"`,
        `"${lead.createdAt ? new Date(lead.createdAt).toISOString() : ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="leads-export.csv"'
    );
    res.send(csvRows.join("\n"));
  } catch (err) {
    next(err);
  }
}

// Leaderboard - top leads by score
async function getLeaderboard(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leads = await Lead.find().sort({ currentScore: -1 }).limit(limit);

    // Map to expected format
    const leaderboard = leads.map((l) => ({
      _id: l._id,
      name: l.name,
      email: l.email,
      company: l.company,
      score: l.currentScore || 0,
      stage: l.leadStage || l.status || "cold",
      createdAt: l.createdAt,
    }));

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
}

router.get("/", getAllLeads);
router.get("/export", exportLeads);
router.get("/leaderboard", getLeaderboard);
router.post("/", controller.createNewLead);
router.get("/:id", controller.fetchLead);
router.get("/:id/history", controller.fetchLeadHistory);
router.get("/:id/intelligence", intelligenceController.getLeadIntelligence);

module.exports = router;
