require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const queue = require("../queue/eventQueue");
const Event = require("../worker/models/Event");
const Lead = require("../worker/models/Lead");
const ScoreHistory = require("../worker/models/ScoreHistory");


const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.post("/events", async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, processed: false });
    await queue.add(
      { leadId: event.leadId },
      {
        jobId: `lead-${event.leadId}`,
        removeOnComplete: true,
        attempts: 3,
        backoff: 5000
      }
    );
    res.send({ status: "queued" });
  } catch (e) {
    if (e.code === 11000) return res.send({ status: "duplicate" });
    throw e;
  }
});

app.listen(process.env.PORT, () => console.log(`API running on ${process.env.PORT}`));
