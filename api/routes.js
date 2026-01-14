const router = require("express").Router();
const eventRoutes = require("./features/events/event.routes");

router.use("/events", eventRoutes);

module.exports = router;
