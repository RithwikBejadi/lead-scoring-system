/**
 * Lead Scoring System - Tracking SDK v1.0
 * Behavioral tracking with intent capture
 *
 * Usage:
 * <script src="https://your-domain/sdk/ls.js" data-api-key="pk_xxx"></script>
 *
 * Tracks: page_view, click, form_submit, custom events
 * Public API: window.ls.track(), window.ls.identify()
 */

(function () {
  "use strict";

  // Get API key from script tag
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");

  if (!apiKey) {
    console.warn("[LS] No API key provided");
    return;
  }

  const API_ENDPOINT = "http://localhost:4000/api/ingest/event";
  const STORAGE_KEY = "ls_anonymous_id";

  // State
  let anonymousId = null;
  let sessionId = null;
  let sessionStart = Date.now();
  let lastClick = 0;

  /**
   * Generate UUID v4
   */
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  /**
   * Get or create anonymousId (persistent)
   */
  function getAnonymousId() {
    if (anonymousId) return anonymousId;

    try {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = "anon_" + generateUUID();
        localStorage.setItem(STORAGE_KEY, id);
      }
      anonymousId = id;
      return id;
    } catch (e) {
      // localStorage not available - generate ephemeral ID
      anonymousId = "anon_" + generateUUID();
      return anonymousId;
    }
  }

  /**
   * Get or create sessionId (per page load)
   */
  function getSessionId() {
    if (!sessionId) {
      sessionId = "sess_" + generateUUID();
    }
    return sessionId;
  }

  /**
   * Send event to backend
   * Silently fails - never breaks host site
   */
  function sendEvent(event, properties = {}) {
    try {
      const eventData = {
        apiKey: apiKey,
        event: event,
        anonymousId: getAnonymousId(),
        sessionId: getSessionId(),
        properties: properties,
      };

      // Use sendBeacon if available (more reliable)
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(eventData)], {
          type: "application/json",
        });
        navigator.sendBeacon(API_ENDPOINT, blob);
      } else {
        // Fallback to fetch
        fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
          keepalive: true,
        }).catch(function () {
          // Silent fail
        });
      }
    } catch (e) {
      // Silent fail - never break host site
    }
  }

  /**
   * Throttle helper - prevent spam
   */
  function shouldSendClick(delay = 800) {
    const now = Date.now();
    if (now - lastClick < delay) return false;
    lastClick = now;
    return true;
  }

  /**
   * Track page view
   */
  function trackPageView() {
    sendEvent("page_view", {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer || "(direct)",
      title: document.title,
    });
  }

  /**
   * Track click events
   */
  function setupClickTracking() {
    document.addEventListener("click", function (e) {
      const el = e.target.closest("a, button, [data-ls-event]");
      if (!el) return;

      // Throttle to prevent spam
      if (!shouldSendClick()) return;

      const payload = {
        tag: el.tagName,
        text: el.innerText?.trim().slice(0, 80) || null,
        id: el.id || null,
        class: el.className || null,
        href: el.href || null,
      };

      // Custom event name from data attribute
      const customEvent = el.getAttribute("data-ls-event");
      const eventName = customEvent || "click";

      sendEvent(eventName, payload);
    });
  }

  /**
   * Track form submissions
   */
  function setupFormTracking() {
    document.addEventListener("submit", function (e) {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;

      // Extract field names only (NOT values - privacy)
      const fields = Array.from(form.elements)
        .filter((el) => el.name)
        .map((el) => el.name);

      sendEvent("form_submit", {
        action: form.action || null,
        method: form.method || "GET",
        fields: fields,
      });
    });
  }

  /**
   * Track session end
   */
  function setupSessionTracking() {
    window.addEventListener("beforeunload", function () {
      sendEvent("session_end", {
        durationMs: Date.now() - sessionStart,
      });
    });
  }

  /**
   * Public API
   */
  window.ls = {
    /**
     * Track custom event
     * @param {string} event - Event name
     * @param {object} properties - Event properties
     */
    track: function (event, properties = {}) {
      sendEvent(event, properties);
    },

    /**
     * Identify user
     * @param {string} email - User email
     * @param {object} traits - Additional user traits
     */
    identify: function (email, traits = {}) {
      sendEvent("identify", {
        email: email,
        ...traits,
      });
    },
  };

  /**
   * Initialize SDK
   */
  function init() {
    // Track page view on load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", trackPageView);
    } else {
      trackPageView();
    }

    // Set up event listeners
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        setupClickTracking();
        setupFormTracking();
        setupSessionTracking();
      });
    } else {
      setupClickTracking();
      setupFormTracking();
      setupSessionTracking();
    }
  }

  // Start tracking
  init();
})();
