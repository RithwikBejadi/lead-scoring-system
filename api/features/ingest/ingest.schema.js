/**
 * FILE: ingest.schema.js
 * PURPOSE: Input validation schemas for event ingestion
 * LIBRARY: Zod for runtime type validation
 */

const { z } = require("zod");

/**
 * Event payload schema
 * Validates all incoming events from SDK
 */
const eventPayloadSchema = z.object({
  // API key (required)
  apiKey: z
    .string()
    .min(10, "API key must be at least 10 characters")
    .max(128, "API key too long"),

  // Event type (required)
  event: z
    .string()
    .min(1, "Event type cannot be empty")
    .max(64, "Event type too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Event type must be alphanumeric with underscores",
    ),

  // Anonymous ID (required)
  anonymousId: z
    .string()
    .min(1, "Anonymous ID cannot be empty")
    .max(128, "Anonymous ID too long"),

  // Session ID (optional)
  sessionId: z.string().max(128, "Session ID too long").optional(),

  // Event properties (optional)
  properties: z
    .record(z.any())
    .refine(
      (props) => {
        const size = JSON.stringify(props).length;
        return size <= 5000; // 5KB limit
      },
      { message: "Properties object too large (max 5KB)" },
    )
    .optional(),
});

/**
 * Validate event payload
 * @param {object} payload - Raw request body
 * @returns {object} { success: boolean, data?: object, error?: object }
 */
function validateEventPayload(payload) {
  try {
    const validated = eventPayloadSchema.parse(payload);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: "Invalid event payload",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
      };
    }
    return {
      success: false,
      error: {
        message: "Validation error",
        details: [{ message: error.message }],
      },
    };
  }
}

/**
 * Sanitize properties object
 * - Limits nesting depth
 * - Removes circular references
 * - Truncates long strings
 */
function sanitizeProperties(props, maxDepth = 2, currentDepth = 0) {
  if (!props || typeof props !== "object") return props;

  if (currentDepth >= maxDepth) {
    return { _truncated: true, reason: "max_depth_exceeded" };
  }

  if (Array.isArray(props)) {
    return props
      .slice(0, 100)
      .map((item) => sanitizeProperties(item, maxDepth, currentDepth + 1));
  }

  const sanitized = {};
  let count = 0;
  const maxKeys = 50; // Limit number of keys

  for (const [key, value] of Object.entries(props)) {
    if (count >= maxKeys) break;

    // Truncate long strings
    if (typeof value === "string") {
      sanitized[key] = value.slice(0, 1000);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeProperties(value, maxDepth, currentDepth + 1);
    } else {
      sanitized[key] = value;
    }

    count++;
  }

  return sanitized;
}

module.exports = {
  validateEventPayload,
  sanitizeProperties,
  eventPayloadSchema,
};
