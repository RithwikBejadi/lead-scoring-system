const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const {
  rebuildLead,
  rebuildProject,
  systemHealth,
  getFailedJobs,
  retryFailedJob
} = require('./admin.controller');

// All admin routes require authentication
router.use(authenticate);

// Rebuild operations
router.post('/rebuild/:leadId', rebuildLead);
router.post('/rebuild-project/:projectId', rebuildProject);

// System health
router.get('/system-health', systemHealth);

// Failed jobs management
router.get('/failed-jobs', getFailedJobs);
router.post('/retry-failed/:jobId', retryFailedJob);

module.exports = router;
