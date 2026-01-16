const ScoringRule = require("../../models/ScoringRule");

/**
 * Get all scoring rules
 */
async function getAllRules() {
  return ScoringRule.find().sort({ eventType: 1 });
}

/**
 * Get a single rule by ID
 */
async function getRuleById(id) {
  return ScoringRule.findById(id);
}

/**
 * Create a new scoring rule
 */
async function createRule(ruleData) {
  const rule = new ScoringRule(ruleData);
  return rule.save();
}

/**
 * Update an existing rule
 */
async function updateRule(id, updates) {
  return ScoringRule.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

/**
 * Delete a rule
 */
async function deleteRule(id) {
  return ScoringRule.findByIdAndDelete(id);
}

/**
 * Get points for a specific event type
 */
async function getPointsForEventType(eventType) {
  const rule = await ScoringRule.findOne({ eventType, active: true });
  return rule ? rule.points : 0;
}

/**
 * Seed default rules if none exist
 */
async function seedDefaultRules() {
  const count = await ScoringRule.countDocuments();
  if (count === 0) {
    const defaultRules = [
      {
        eventType: "page_view",
        name: "Page View",
        description: "User viewed a page on the website",
        points: 5,
        active: true,
      },
      {
        eventType: "email_open",
        name: "Email Open",
        description: "User opened a marketing email",
        points: 10,
        active: true,
      },
      {
        eventType: "form_submit",
        name: "Form Submission",
        description: "User submitted a form or signed up",
        points: 20,
        active: true,
      },
      {
        eventType: "demo_request",
        name: "Demo Request",
        description: "User requested a product demo",
        points: 50,
        active: true,
      },
      {
        eventType: "contract_signed",
        name: "Contract Signed",
        description: "Lead signed a contract or made a purchase",
        points: 100,
        active: true,
      },
      {
        eventType: "webinar_attendance",
        name: "Webinar Attendance",
        description: "User attended a webinar",
        points: 25,
        active: true,
      },
      {
        eventType: "pricing_page_visit",
        name: "Pricing Page Visit",
        description: "User visited the pricing page",
        points: 15,
        active: true,
      },
      {
        eventType: "signup",
        name: "Account Signup",
        description: "User created an account",
        points: 30,
        active: true,
      },
      {
        eventType: "download",
        name: "Content Download",
        description: "User downloaded content (ebook, whitepaper)",
        points: 15,
        active: true,
      },
      {
        eventType: "unsubscribe",
        name: "Unsubscribed",
        description: "User unsubscribed from emails",
        points: -20,
        active: true,
      },
    ];
    await ScoringRule.insertMany(defaultRules);
    console.log("[Rules] Seeded default scoring rules");
  }
}

module.exports = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  getPointsForEventType,
  seedDefaultRules,
};
