const express = require("express");
const router = express.Router();
const { createProject } = require("./project.controller");

router.post("/", createProject);

module.exports = router;
