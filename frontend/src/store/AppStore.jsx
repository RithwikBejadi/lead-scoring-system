/**
 * AppStore — normalized global state for the lead scoring UI.
 *
 * Shape:
 *   leads:    { byId: {}, allIds: [] }
 *   pipeline: { cold: [], warm: [], hot: [], qualified: [] }   ← IDs only
 *   activity: { feedIds: [], byId: {} }                        ← newest-first, max 200
 *   metrics:  { countsByStage, heatingUpIds, goingColdIds, newlyQualifiedIds, eventsPerSec }
 *   ui:       { socketConnected, hydrated, queueDepth, activeJobs, workerActive, queueLag }
 *
 * Socket reducer contract (leadUpdated must update four places):
 *   1. leads.byId[id]
 *   2. Move id between pipeline buckets
 *   3. Recompute metrics
 *   4. ui.openLeadId  (signal to LeadDetailPage if that lead is open)
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { leadsApi } from "../api/leads.api.js";
import { analyticsApi } from "../api/analytics.api.js";
import { initSocket } from "../sockets/socket.js";

// ─── Stage helper ────────────────────────────────────────────────────────────

export function stageKey(score) {
  if (score >= 85) return "qualified";
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

// ─── Metrics computation (O(n) over allIds, rerun after every upsert) ────────

function computeMetrics(byId, allIds) {
  const countsByStage = { cold: 0, warm: 0, hot: 0, qualified: 0 };
  const heatingUpIds = [];
  const goingColdIds = [];
  const newlyQualifiedIds = [];
  const now = Date.now();

  allIds.forEach((id) => {
    const lead = byId[id];
    if (!lead) return;

    const score = lead.currentScore ?? lead.score ?? 0;
    const stage = stageKey(score);
    countsByStage[stage]++;

    const velocity = lead.velocity ?? lead.velocityScore ?? 0;
    const daysSinceLast = lead.lastEventAt
      ? (now - new Date(lead.lastEventAt)) / 86_400_000
      : Infinity;

    if (velocity > 30) heatingUpIds.push(id);
    if (daysSinceLast > 7 && score < 85) goingColdIds.push(id);
    if (score >= 85) newlyQualifiedIds.push(id);
  });

  heatingUpIds.sort((a, b) => {
    const va = byId[a]?.velocity ?? byId[a]?.velocityScore ?? 0;
    const vb = byId[b]?.velocity ?? byId[b]?.velocityScore ?? 0;
    return vb - va;
  });

  return {
    countsByStage,
    heatingUpIds: heatingUpIds.slice(0, 5),
    goingColdIds: goingColdIds.slice(0, 5),
    newlyQualifiedIds: newlyQualifiedIds.slice(0, 5),
  };
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState = {
  leads: { byId: {}, allIds: [] },
  pipeline: { cold: [], warm: [], hot: [], qualified: [] },
  activity: { feedIds: [], byId: {} },
  metrics: {
    countsByStage: { cold: 0, warm: 0, hot: 0, qualified: 0 },
    heatingUpIds: [],
    goingColdIds: [],
    newlyQualifiedIds: [],
    eventsThisWindow: 0,
    eventsPerSec: 0,
  },
  ui: {
    socketConnected: false,
    hydrated: false,
    queueDepth: 0,
    activeJobs: 0,
    workerActive: false,
    queueLag: 0,
    openLeadId: null,
  },
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    // ── Bulk hydration from initial API fetch ──
    case "HYDRATE_LEADS": {
      const leads = action.payload;
      const byId = {};
      const allIds = [];
      const pipeline = { cold: [], warm: [], hot: [], qualified: [] };

      leads.forEach((lead) => {
        const id = lead._id;
        if (!id) return;
        byId[id] = lead;
        allIds.push(id);
        pipeline[stageKey(lead.currentScore ?? lead.score ?? 0)].push(id);
      });

      const metrics = computeMetrics(byId, allIds);
      return {
        ...state,
        leads: { byId, allIds },
        pipeline,
        metrics: { ...state.metrics, ...metrics },
        ui: { ...state.ui, hydrated: true },
      };
    }

    // ── Single lead upsert from socket or optimistic update ──
    case "UPSERT_LEAD": {
      const lead = action.payload;
      const id = lead._id ?? lead.id;
      if (!id) return state;

      const prevLead = state.leads.byId[id];
      const prevStage = prevLead
        ? stageKey(prevLead.currentScore ?? prevLead.score ?? 0)
        : null;
      const newScore = lead.currentScore ?? lead.score ?? 0;
      const newStage = stageKey(newScore);

      const newById = {
        ...state.leads.byId,
        [id]: { ...(prevLead ?? {}), ...lead },
      };
      const newAllIds = prevLead
        ? state.leads.allIds
        : [...state.leads.allIds, id];

      // ── Place 2: move between pipeline buckets ──
      let newPipeline = state.pipeline;
      const stageChanged = prevStage !== null && prevStage !== newStage;
      const notInBucket = !state.pipeline[newStage].includes(id);

      if (stageChanged || notInBucket) {
        const cold = [...state.pipeline.cold];
        const warm = [...state.pipeline.warm];
        const hot = [...state.pipeline.hot];
        const qualified = [...state.pipeline.qualified];
        const buckets = { cold, warm, hot, qualified };

        // Remove from old bucket (all buckets for safety)
        ["cold", "warm", "hot", "qualified"].forEach((s) => {
          const idx = buckets[s].indexOf(id);
          if (idx !== -1) buckets[s].splice(idx, 1);
        });
        // Add to new bucket (prepend = most recent first)
        if (!buckets[newStage].includes(id)) {
          buckets[newStage].unshift(id);
        }
        newPipeline = buckets;
      }

      // ── Place 3: recompute metrics ──
      const metrics = computeMetrics(newById, newAllIds);

      return {
        ...state,
        leads: { byId: newById, allIds: newAllIds },
        pipeline: newPipeline,
        metrics: { ...state.metrics, ...metrics },
        // Place 4: openLeadId signal is already in ui — LeadDetailPage reads it
      };
    }

    // ── Prepend to activity feed ──
    case "PREPEND_ACTIVITY": {
      const event = action.payload;
      const id =
        event._id ?? event.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newFeedIds = [id, ...state.activity.feedIds].slice(0, 200);
      const newById = { ...state.activity.byId, [id]: event };

      return {
        ...state,
        activity: { feedIds: newFeedIds, byId: newById },
        metrics: {
          ...state.metrics,
          eventsThisWindow: (state.metrics.eventsThisWindow ?? 0) + 1,
        },
      };
    }

    // ── Batch of events (from 100ms buffer) ──
    case "BATCH_PREPEND_ACTIVITY": {
      const events = action.payload; // array, newest-first
      const newByIdEntries = {};
      const newIds = [];
      events.forEach((event) => {
        const id =
          event._id ?? event.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        newByIdEntries[id] = event;
        newIds.push(id);
      });
      const newFeedIds = [...newIds, ...state.activity.feedIds].slice(0, 200);
      const newById = { ...state.activity.byId, ...newByIdEntries };

      return {
        ...state,
        activity: { feedIds: newFeedIds, byId: newById },
        metrics: {
          ...state.metrics,
          eventsThisWindow: (state.metrics.eventsThisWindow ?? 0) + events.length,
        },
      };
    }

    case "SET_SOCKET_CONNECTED":
      return { ...state, ui: { ...state.ui, socketConnected: action.payload } };

    case "SET_QUEUE_STATS":
      return { ...state, ui: { ...state.ui, ...action.payload } };

    case "SET_OPEN_LEAD":
      return { ...state, ui: { ...state.ui, openLeadId: action.payload } };

    // Tick every 10s: compute events/sec from rolling window, reset counter
    case "TICK_METRICS": {
      const eventsPerSec = ((state.metrics.eventsThisWindow ?? 0) / 10).toFixed(1);
      return {
        ...state,
        metrics: { ...state.metrics, eventsPerSec, eventsThisWindow: 0 },
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStoreContext = createContext(null);

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

// ─── Socket bridge (mounted once inside AppStoreProvider) ────────────────────

function StoreSocketBridge({ dispatch }) {
  const pendingEvents = useRef([]);
  const flushTimer = useRef(null);

  const flushEvents = useCallback(() => {
    const batch = pendingEvents.current.splice(0);
    if (batch.length === 0) return;
    dispatch({ type: "BATCH_PREPEND_ACTIVITY", payload: batch });
  }, [dispatch]);

  useEffect(() => {
    const socket = initSocket();

    // Track connection state
    const onConnect = () => dispatch({ type: "SET_SOCKET_CONNECTED", payload: true });
    const onDisconnect = () =>
      dispatch({ type: "SET_SOCKET_CONNECTED", payload: false });
    if (socket.connected) dispatch({ type: "SET_SOCKET_CONNECTED", payload: true });

    // leadUpdated → UPSERT_LEAD (updates 4 places in reducer)
    const onLeadUpdated = (lead) => {
      dispatch({ type: "UPSERT_LEAD", payload: lead });
    };

    // eventReceived → batched PREPEND_ACTIVITY (100ms buffer prevents 50 rerenders/sec)
    const onEventReceived = (event) => {
      pendingEvents.current.push(event);
      if (!flushTimer.current) {
        flushTimer.current = setTimeout(() => {
          flushTimer.current = null;
          flushEvents();
        }, 100);
      }
    };

    // scoreMutation → also upsert lead (score field)
    const onScoreMutation = (mutation) => {
      if (mutation.leadId || mutation._id) {
        dispatch({
          type: "UPSERT_LEAD",
          payload: { _id: mutation.leadId ?? mutation._id, currentScore: mutation.newScore ?? mutation.score },
        });
      }
      // Also treat it as an activity event
      onEventReceived({ ...mutation, eventType: "score_mutation" });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("leadUpdated", onLeadUpdated);
    socket.on("eventReceived", onEventReceived);
    socket.on("scoreMutation", onScoreMutation);

    // Tick every 10s for eventsPerSec calculation
    const tickInterval = setInterval(() => {
      dispatch({ type: "TICK_METRICS" });
    }, 10_000);

    // Poll queue stats every 30s
    const pollQueueStats = async () => {
      try {
        const data = await analyticsApi.getQueueHealth();
        dispatch({
          type: "SET_QUEUE_STATS",
          payload: {
            queueDepth: data?.queue?.waiting ?? data?.waiting ?? 0,
            activeJobs: data?.queue?.active ?? data?.active ?? 0,
            workerActive: (data?.queue?.active ?? data?.active ?? 0) > 0,
            queueLag: data?.lagMs ?? data?.lag ?? 0,
          },
        });
      } catch {
        // silently ignore — debug overlay shows last known values
      }
    };

    pollQueueStats();
    const queueInterval = setInterval(pollQueueStats, 30_000);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("leadUpdated", onLeadUpdated);
      socket.off("eventReceived", onEventReceived);
      socket.off("scoreMutation", onScoreMutation);
      clearInterval(tickInterval);
      clearInterval(queueInterval);
      if (flushTimer.current) clearTimeout(flushTimer.current);
    };
  }, [dispatch, flushEvents]);

  return null; // purely side-effect component
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate leads once on mount
  useEffect(() => {
    leadsApi
      .getAll({ limit: 500 })
      .then((data) => {
        const leads = Array.isArray(data) ? data : data?.leads ?? data?.data ?? [];
        dispatch({ type: "HYDRATE_LEADS", payload: leads });
      })
      .catch(() => {
        // Fail silently; pages fall back to their own fetches
        dispatch({ type: "HYDRATE_LEADS", payload: [] });
      });
  }, []);

  return (
    <AppStoreContext.Provider value={{ state, dispatch }}>
      <StoreSocketBridge dispatch={dispatch} />
      {children}
    </AppStoreContext.Provider>
  );
}
