const service = require("./event.service");

exports.createEvent = async (req, res) => {
  try {
    const result = await service.ingestEvent(req.body);
    res.json(result);
  } catch (err) {
    console.error("INGEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
