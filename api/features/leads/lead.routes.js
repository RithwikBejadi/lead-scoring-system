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

async function getAllLeads(req, res, next) {
  try {
    const Lead = require("../../models/Lead");
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(100);
    res.json(leads);
  } catch (err) {
    next(err);
  }
}

router.get("/", getAllLeads);
router.post("/", controller.createNewLead);
router.get("/:id", controller.fetchLead);
router.get("/:id/history", controller.fetchLeadHistory);
router.get("/:id/intelligence", intelligenceController.getLeadIntelligence);

module.exports = router;
