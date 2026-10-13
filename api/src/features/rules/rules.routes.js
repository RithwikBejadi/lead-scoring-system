const router = require("express").Router();
const controller = require("./rules.controller");

// GET /api/rules - Get all scoring rules
router.get("/", controller.getAllRules);

// GET /api/rules/:id - Get single rule
router.get("/:id", controller.getRuleById);

// POST /api/rules - Create new rule
router.post("/", controller.createRule);

// PUT /api/rules/:id - Update rule
router.put("/:id", controller.updateRule);

// DELETE /api/rules/:id - Delete rule
router.delete("/:id", controller.deleteRule);

module.exports = router;
