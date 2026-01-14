const router = require("express").Router();
const controller = require("./event.controller");

router.post("/", controller.createEvent);

module.exports = router;
