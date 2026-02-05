/**
 * Lead Scoring System - Tracking SDK v0
 * Minimal, standalone tracking script
 *
 * Usage:
 * <script src="https://your-domain/sdk/ls.js" data-api-key="pk_xxx"></script>
 *
 * Tracks: page_view only
 * Generates: anonymousId (persisted), sessionId (per tab)
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
    try {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = "anon_" + generateUUID();
        localStorage.setItem(STORAGE_KEY, id);
      }
      return id;
    } catch (e) {
      // localStorage not available - generate ephemeral ID
      return "anon_" + generateUUID();
    }
  }

  /**
   * Generate sessionId (per page load)
   */
  function getSessionId() {
    return "sess_" + generateUUID();
  }

  /**
   * Send event to backend
   * Silently fails - never breaks host site
   */
  function sendEvent(eventData) {
    try {
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
   * Track page view
   */
  function trackPageView() {
    const anonymousId = getAnonymousId();
    const sessionId = getSessionId();

    const eventData = {
      apiKey: apiKey,
      event: "page_view",
      anonymousId: anonymousId,
      sessionId: sessionId,
      properties: {
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer || "(direct)",
        title: document.title,
      },
    };

    sendEvent(eventData);
  }

  // Track page view on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackPageView);
  } else {
    trackPageView();
  }
})();
