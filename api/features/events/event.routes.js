const express = require("express");
const router = express.Router();
const { ingestEvent } = require("./event.controller");

router.post("/api/events", async (req, res, next) => {
  try {
    const result = await ingestEvent(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
