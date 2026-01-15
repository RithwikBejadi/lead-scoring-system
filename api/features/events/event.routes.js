const router = require("express").Router();
const { createEvent } = require("./event.controller");

router.post("/", createEvent);

module.exports = router;
