const { ingestEvent } = require("./event.service");

async function createEvent(req, res, next) {
  try {
    const result = await ingestEvent(req.body);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createEvent };
