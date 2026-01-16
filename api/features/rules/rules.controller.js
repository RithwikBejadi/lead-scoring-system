const rulesService = require("./rules.service");

/**
 * GET /api/rules - Get all scoring rules
 */
async function getAllRules(req, res) {
  try {
    const rules = await rulesService.getAllRules();
    res.json(rules);
  } catch (err) {
    console.error("[Rules] Error fetching rules:", err);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
}

/**
 * GET /api/rules/:id - Get single rule by ID
 */
async function getRuleById(req, res) {
  try {
    const rule = await rulesService.getRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (err) {
    console.error("[Rules] Error fetching rule:", err);
    res.status(500).json({ error: "Failed to fetch rule" });
  }
}

/**
 * POST /api/rules - Create new scoring rule
 */
async function createRule(req, res) {
  try {
    const rule = await rulesService.createRule(req.body);
    res.status(201).json(rule);
  } catch (err) {
    console.error("[Rules] Error creating rule:", err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Rule for this event type already exists" });
    }
    res.status(500).json({ error: "Failed to create rule" });
  }
}

/**
 * PUT /api/rules/:id - Update existing rule
 */
async function updateRule(req, res) {
  try {
    const { points, active, name, description } = req.body;
    const updates = {};
    if (points !== undefined) updates.points = points;
    if (active !== undefined) updates.active = active;
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const rule = await rulesService.updateRule(req.params.id, updates);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (err) {
    console.error("[Rules] Error updating rule:", err);
    res.status(500).json({ error: "Failed to update rule" });
  }
}

/**
 * DELETE /api/rules/:id - Delete a rule
 */
async function deleteRule(req, res) {
  try {
    const rule = await rulesService.deleteRule(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json({ message: "Rule deleted successfully" });
  } catch (err) {
    console.error("[Rules] Error deleting rule:", err);
    res.status(500).json({ error: "Failed to delete rule" });
  }
}

module.exports = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
};
