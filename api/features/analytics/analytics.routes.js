/**
 * FILE: analytics.routes.js
 * PURPOSE: Routes for analytics and dashboard statistics
 */

const router = require("express").Router();
const controller = require("./analytics.controller");

router.get("/dashboard", controller.getDashboardStats);
router.get("/throughput", controller.getThroughputData);
router.get("/queue-health", controller.getQueueHealth);
router.get("/score-mutations", controller.getScoreMutations);
router.get("/automation-logs", controller.getAutomationLogs);

module.exports = router;
