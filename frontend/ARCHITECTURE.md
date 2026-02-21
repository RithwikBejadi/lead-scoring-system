# LeadPulse OS — Exhaustive Frontend Architecture Manual

This document provides a highly technical, granular, property-by-property, state-by-state teardown of the entire frontend architecture (LeadPulse OS / `UI/` folder). It covers the exact hooks, API interactions, props, conditional logic branches, tailwind styling, and real-time socket communication for every single file.

---

## Table of Contents

1. [Application Shell & Routing Layer (`App.jsx`, `main.jsx`, `config.js`)](#1-application-shell--routing-layer)
2. [Global State Providers (`AuthContext.jsx`, `ToastContext.jsx`)](#2-global-state-providers)
3. [API Layer (`api/`)](#3-api-layer)
4. [Real-time Communication (`sockets/socket.js`)](#4-real-time-communication)
5. [Dashboard Components (`components/dashboard/`)](#5-dashboard-components)
6. [Leads Management Pages & Components (`components/leads/`)](#6-leads-management-pages--components)
7. [Navigation & Layout Models (`Sidebar.jsx`, `Header.jsx`)](#7-navigation--layout-models)
8. [Marketing Pages (`components/landing/`)](#8-marketing-pages)

---

## 1. Application Shell & Routing Layer

### `src/main.jsx`

**Purpose**: The absolute entry point that bootstraps React DOM and injects the Context Provider stack.
**Logic Flow**:

- Mounts `<StrictMode>` to root.
- Injects `<BrowserRouter>` for HTML5 History API routing.
- Injects `<ToastProvider>` — manages globally accessible toast notifications (must encapsulate AuthProvider so signin/out errors can fire toasts).
- Injects `<AuthProvider>` — fetches `/auth/me` on mount to rehydrate session.
- Invokes `<App />`.

### `src/config.js`

**Purpose**: Multi-environment variable fallback module.
**State/Variables**:

- `API_URL`: Pulls `import.meta.env.VITE_API_URL`. Falls back dynamically. If `window.location.hostname === "localhost"`, defaults to `http://localhost:4000/api`, else `https://lead-scoring-api-f8x4.onrender.com/api`.
- `WS_URL`: Pulls `VITE_WS_URL`. Falls back similarly for Socket.IO targets.
- `GOOGLE_CLIENT_ID`: Pulls `VITE_GOOGLE_CLIENT_ID` natively (needed for `react-google-login` or native script injections).

### `src/App.jsx`

**Purpose**: Central routing map. Comprises conditional rendering logic, shells, layout definitions, and wrapper components.

#### `<ProtectedRoute />`

**Props**: `children` (React Node).
**Hook Imports**:

- `const { isAuthenticated, isLoading } = useAuth();`
  **Logic**:
- **Condition 1**: `if (isLoading)`: returns a full-screen loading spinner (spinning `sync` material icon) with `bg-background-light`.
- **Condition 2**: `if (!isAuthenticated)`: returns `<Navigate to="/login" replace />`.
- **Fallthrough**: Returns `children`.

#### `<Dashboard />` (Component Function)

**Props**: `onNavigateLeads` (function callback passed down).
**State**:

- `dashboardStats` (Object | null): stores the aggregate 4 metrics fetched from API.
  **Hooks**:
- `loadStats = useCallback(async () => {...})`: fetches `analyticsApi.getDashboardStats()` and executes `setDashboardStats(r.data)`.
- `useEffect(() => {...}, [loadStats])`: calls `loadStats()` immediately, sets interval timer to call it every 30000ms. Cleans up interval on unmount.
  **Data Modeling (`buildMetrics()`)**:
- Parses `totalEvents, identityResolutions, avgLatency, qualifiedLeads` out of `dashboardStats`.
- **Mathematical Formatter**: `totalEvents >= 1000 ? (events/1000).toFixed(1)+'k' : totalEvents`. Identical logic applied to resolutions.
- Array generation: Returns an array of 4 objects mapped to `<MetricCard>`:
  - Metric 1: Processing Velocity. Compares `avgLatency > 200` to inject `warning` vs `success` classes. Custom CSS array of bar charts (static visualizer).
  - Metric 4: Active Qualified Leads. Maps if `qualifiedLeads > 0` conditionally sets `success`/`warning`.
    **Render Hierarchy**:
- Responsive Grid 1: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for iterating `buildMetrics()`.
- Responsive Grid 2: `grid-cols-12`, `<ThroughputChart />` and `<QueueHealth />`.
- Responsive Grid 3: `<ScoreMutations />` and `<AutomationLog />`.

#### `<LeadsWrapper />` (Component Function)

**Purpose**: High-Order wrapper to abstract data fetching from the purely visual `Leads.jsx` page.
**State**:

- `leads` (Array, defaults `[]`): stores exact DB array of leads.
- `leadsLoading` (Boolean, defaults `true`).
  **Hooks**:
- `loadLeads = useCallback()`: `leadsApi.getAll({ limit: 200 })`. Maps `setLeads(r.data.leads)`. Error catch resets to `[]`.
- `useEffect()`: calls `loadLeads` once on mount.
  **Render**: passes state down to `<Leads leads={leads} leadsLoading={leadsLoading} onRefresh={loadLeads} />`.

#### `<AppShell />` (Component Function)

**Purpose**: Renders the persistent Layout shell surrounding authenticated routes.
**Constants**:

- CSS String: `bg-background-light dark:bg-background-dark text-text-primary-light ... h-screen flex overflow-hidden`.
  **Route Table**:
- `Route /`: -> `<Dashboard />`
- `Route /dashboard`: -> `<Dashboard />`
- `Route /leads`: -> `<LeadsWrapper />`
- `Route /events`: -> `<ComingSoon icon="bolt" label="Events Stream" />` (Placeholder)
- `Route /automation`: -> `<ComingSoon icon="auto_fix_high" label="Automation Engine" />`
- `Route /scoring`: -> `<ComingSoon />`
- `Route /simulator`: -> `<Simulator />`
- `Route /settings`: -> `<Settings />`
- `Route *`: -> `<Navigate to="/" replace />` (Catch-all redirect).

#### `<App />` (Root Logic Component)

**Hooks**:

- pulls `isAuthenticated, isLoading` from `useAuth()`.
  **Route Table**:
- `Route /landing`: `<Landing />`
- `Route /login`: Terneray - `isAuthenticated ? <Navigate to="/" /> : <SignIn />`
- `Route /signup`: Terneray - `isAuthenticated ? <Navigate to="/" /> : <SignUp />`
- `Route /*`: Protects the entire `<AppShell />` tree.

---

## 2. Global State Providers

### `src/contexts/AuthContext.jsx`

**Purpose**: Central nervous system for JWT, user objects, persisting auth rules across refreshes.
**Exports**: `AuthContext, AuthProvider, useAuth()`.
**State Variables**:

- `user`: Object | null. `name, email, role, _id`.
- `isAuthenticated`: Boolean. derived essentially from `!!user`.
- `isLoading`: Boolean. Default `true` because it must await `/auth/me`.
  **Lifecycle Mount `useEffect`**:
- Reads `localStorage.getItem("authToken")`. If false, `isLoading(false), isAuthenticated(false)`.
- If true, calls `authApi.getMe()`.
- Yields `success => setUser(user)`, `error => logout()`.
  **Auth Actions**:
- `login(email, password)`: -> `authApi.login()`. If success, grabs `r.token, r.user`. Persists token to `localStorage`, populates user.
- `register(name, company, email, password)`: -> `authApi.register()`. Persists token, populates user.
- `googleLogin(token)`: handles OAuth callback.
- `logout()`: rips out `localStorage.removeItem("authToken")`, zeroes out user and auth objects.

### `src/contexts/ToastContext.jsx`

**State Variables**:

- `toasts`: Array of objects { `id, type, message` }.
  **Core methods**:
- `addToast(type, message)`: generates UUID, maps object to `setToasts(prev => [...prev, newToast])`.
- Auto-dismisser: sets `setTimeout` dynamically for 3000ms (unless user manually clears it) which triggers `removeToast(id)`.
- Reusable export hooks: `success(msg), error(msg), warning(msg), info(msg)` wrappers for `<ToastProvider>`.
  **Visual Representation**:
- Fixed container at `bottom-4 right-4 z-50 flex-col-reverse space-y-reverse space-y-2`.
- Conditional Background Classes:
  - `success`: `bg-success text-white border-none shadow-lg`
  - `error`: `bg-error text-white`
  - Material icons mapped: `check_circle` (success), `error_outline` (error), `warning_amber`.

---

## 3. API Layer

### Axios Instance (`src/api/axios.config.js`)

**Setup**: BaseURL derived from `config.js` -> `API_URL`.
**Request Interceptor**:

- `config.headers.Authorization = 'Bearer ${token}'`. Injected blindly if `localStorage` has token.
  **Response Interceptor**:
- Success bypasses logic.
- Error code `401 Unauthorized`:
  - Ejects user! Automatically executes `localStorage.removeItem("authToken")` and hard-navigates `window.location.href = "/login"`.
- Error code `429 Too Many Requests`: Trigger console error warnings (Redis rate limiter kicked off).

### Modules

- **`analytics.api.js`**:
  - `getDashboardStats()`: `GET /analytics/dashboard`.
  - `getThroughputData(hours)`: `GET /analytics/throughput?hours=24`.
  - `getQueueHealth()`: `GET /analytics/queue-health`.
  - `getScoreMutations(limit)`: `GET /analytics/score-mutations?limit=10`.
  - `getAutomationLogs(limit)`: `GET /analytics/automation-logs?limit=20`.
- **`leads.api.js`**:
  - `getAll()`: paginated leads list from Mongo.
  - `getTimeline(leadId)`: `GET /leads/:id/timeline`. Aggregates all web events mapped to score changes.
  - `exportCSV()`: `GET /leads/export` => Parses `responseType: "blob"`. DOM manipulation: Creates generic `document.createElement("a")` element, attaches `window.URL.createObjectURL([blob])`, fires `.click()`, unbinds URL to clear memory.
- **`events.api.js`**: `POST /events/ingest`. Fires arbitrary payloads testing the Redis scoring pipeline.

---

## 4. Real-time Communication

### `src/sockets/socket.js`

**Architecture**: Singleton implementation wrapping `socket.io-client`.
**Constants/Variables**: `let socket = null;`.
**Lifecycle `initSocket()`**:

- Extracts JWT from local storage.
- Re-constructs Socket client aiming at `WS_URL` with `{ auth: { token: token } }` for handshake validation.
- Configures retry logic: `reconnectionDelay: 1000`, `reconnectionAttempts: 5`.
  **Event Listeners/Hooks** (_all return cleanup unbind functions_):
- `subscribeToLeadUpdates(cb)`: Binds `socket.on("leadUpdated", cb)`.
- `subscribeToScoreMutations(cb)`: Binds `socket.on("scoreMutation", cb)`.
- `subscribeToAutomations(cb)`: Binds `socket.on("automationExecuted", cb)`. Handles triggered notifications when queue jobs finish.

---

## 5. Dashboard Components

### `<MetricCard />`

**Props**: `{ title, value, change, changeType, subtext, bars }`.
**Visual Engine**:

- Renders mini-bar chart visuals passed down as `<div style={{ height: item.h }} className={item.color}>`.
- Displays dynamic numeric formats for main `value` block (e.g. `12.5k` or `< 1ms`).

### `<ThroughputChart />`

**Props**: none. (Encapsulated component).
**State**:

- `data`: array mapping `{ events: Number, mutations: Number }` representing epochs.
- `loading`: boolean.
  **Lifecycle**:
- Loads data on mount via `analyticsApi.getThroughputData()`. Sets interval 30s polling loop (no websocket dependency as it aggregates temporal windows).
  **DOM Structure**:
- Normalizes data: `maxValue = Math.max(maxEvents, Math.maxMutations)`. Height calculation relies on converting bounds `(item.events/maxValue)*250px`.
- Draws overlay visual: two background spans. One overlaps the other based on normalized ratio, generating layered histogram appearance via pure CSS divs instead of `<canvas>` Recharts. Allows high-performance rendering.

### `<QueueHealth />`

**Data Fetching**: Pulls via `analyticsApi.getQueueHealth()`, polling loop every 10,000ms.
**Data Model (`queueData`)**:

- `{ waiting, active, completed, failed, workers, maxWorkers }`
  **Compute Logic**:
- `workerPercentage = (workers/maxWorkers) * 100` -> applied to width of inline CSS bar.
- `waitingPercentage = min((waiting/5000)*100, 100)`. Caps max visual fill to 5k jobs, normalizing the progression bar.
- Logic trigger: `if (failed > 10)` -> unhides the red "Dead Letter Queue" alert node. Mounts severe warning text (`bg-red-50 text-error`).

### `<ScoreMutations />`

**Props**: `onNavigateLeads`.
**Data Fetching**: Pulls `analyticsApi.getScoreMutations(10)` every 15,000ms loop.
**Table Columns**: `Lead Entity`, `Event Type`, `Delta`, `Score`.
**Logic Formatting**:

- Map parses `mutation.delta`. `delta >= 0 ? "+X" : "-X"`. Assigns color conditionals `text-success` vs `text-error`.
- Renders `eventType` inside tiny stylized badges. Empty state fallback injected cleanly.

### `<AutomationLog />`

**State**: `logs` Array.
**Feature Design**: This presents a scrolling terminal-like display of webhook triggers, slack notification outputs etc.
**Hooks**:

- Pulls initialization data from `getAutomationLogs(15)`.
- _Note: the architecture assumes pooling here, though sockets could stream._ Polling every 10s.
  **Formatter**:
- `<span font-mono>` with timestamp parsed via `date.toLocaleTimeString("en-US", { hour12: false })` giving 24H military output format e.g. `[14:32:01] email_sent: ...`

---

## 6. Leads Management Pages & Components

### `src/pages/Leads.jsx`

**Role**: Holds complex filtering/search state memory.
**Props**: `{ leads, leadsLoading, onRefresh }`.
**State**:

- `selectedLead` (Object | null): Identifies the DOM target triggering the drawer opening.
- `searchQuery` (String): Raw string tracking search input typing.
- `stageFilter` (Enum String): 'all', 'qualified', 'hot', 'warm', 'cold'.
  **Data Compute Pipeline (`useMemo(filteredLeads)`)**:
- First iterates `searchQuery`. Maps query against `name`, `email`, `anonymousId` with standard `.toLowerCase()` string matching.
- Second iterates `stageFilter`. Takes the filtered array and filters again against `<lead.currentScore>`:
  - `qualified`: >= 85
  - `hot`: 70 to 84
  - `warm`: 40 to 69
  - `cold`: < 40.
    **Prop Drilling**: Yields filtered array into `<FilterBar>`, `<LeadsTable>`, `<PaginationFooter>`.

### `<FilterBar />`

**Props**: `{ stageFilter, onStageChange, totalCount, filteredCount }`.
**Constants**:
`STAGES = [{ key: "qualified", label: "Qualified (85+)" }, ...etc]`
**DOM UI**:

- Renders pills. Selected pill gets `bg-primary/10 border-primary/30`. Unselected remains gray stringly typed fallback.
- Adds an embedded `x` clear button to custom pills triggering `onStageChange("all")`.

### `<LeadsHeader />`

**UX Features**:

- Sticky header (`sticky top-0 z-30`).
- Debounced search visualizer text input (`pl-10 pr-4`). Controlled input bound securely to `searchQuery`.
- Button: `Export CSV`. Function triggers Async -> sets `isExporting`, `await leadsApi.exportCSV()`, clears state. Handles the `disabled={isExporting}` CSS hook preventing double spam.

### `<LeadsTable />`

**Pure View Component** - No explicit internal state, just maps prop lists mapping.
**Helper Functions** (`outside component closure for performance`):

- `getStageConfig(score)`: returns `{ stage: 'Hot', stageBg: 'bg-primary' }`. Same brackets mapped as standard.
- `getVelocityConfig(velocityScore, eventsLast24h)`:
  - math: `min(velocityScore/10, 10)` normalizes. Applies fractional logic generating `%` CSS width block for velocity progress bar indicator.
- `getRiskConfig(velocityScore, lastEventAt, currentScore)`:
  - Computes `daysSinceLastEvent = (Date.now() - new Date(lastEventAt)) / 86400000ms`.
  - Determines risk band based on inactivity or low recent threshold signals. Assigns "High Risk (Churn)" (red badge) or "Low Risk" (green badge).
- `formatTimestamp()`: Custom relative time library logic, avoiding moment.js bloat. Computes diffs returning `Just now`, `xm ago`, etc.
  **Avatar Mapping**:
- Tries extracting `.image`. Else parses initials by splitting `.name` spaces, checking lengths, fallback to `email` sub string. Fallback `??`. Appends DOM badge indicator floating absolute positioned icon showing identity link resolution.

### `<IntelligenceDrawer />`

**Props**: `{ open, lead, onClose }`.
**State**:

- `timeline` (Array bounds): fetched via `leadsApi.getTimeline`.
- `timelineLoading` (Bool): prevents hydration flashing.
- `recalculating` (Bool): button state locker.
  **Lifecycle**:
- Triggers inside `useEffect()` solely when `open` and `lead?._id` properties pivot to truthy bindings. Unmount cleans pending variables (`cancelled = true` concurrency control to stop promise execution conflicts on quick clicks).
  **Drawer Visuals Structure**:
- `<aside>` positioned `fixed right-0 inset-y-0 w-[420px]`.
- Top header details basic generic stats.
- Map iterates `timeline?.sessions.flatMap()`, sorts backwards timestamp mapping descending chronological display line.
  **Event Mapping Dictionary**:
- `EVENT_ICONS`: "page_view" -> "visibility", "click" -> "ads_click", "login" -> "login".
- Activity line visual builds an absolute-positioned border CSS line connecting icons generating a vertical "flight path" visual of event histories. Appends `+X pts` score delta badge directly associated with event itemization.

---

## 7. Navigation & Layout Models

### `<Sidebar />`

**Props**: none. (Gets current route out of `useLocation().pathname`).
**Behavior**: Left nav layout `w-64 bg-surface...`. Hidden under `md:` media query breakpoints (`hidden md:flex`).
**Routes Mapping Elements**:

- Monitor Category: Dashboard, Leads, Events.
- Orchestration Category: Automation, Scoring Rules.
- Developer Category: Simulator, Settings.
- User Box: Sticky at `bottom-0`, bounds with `border-t`. Unwraps `user.name` string extracting `[0].toUpperCase()` avatar logic inline. Mounts `handleLogout()` trigger executing `AuthContext` rip operation.

### `<Header />`

**Props**: none.
**Role**: Provides live infrastructure monitoring overview and Project scoping.
**State Engine**:

- `health` Object: tracks `api, db, redis` connection statuses.
- `project` String: grabs exact namespace string.
  **Networking/Polling**:
- `useEffect`: Creates internal polling async func looping at 15000ms polling `/health`. Expects MongoDB and Upstash Redis pings. Updates dots from red `bg-error` -> green `animate-pulse bg-success` if response `200 ok`.
- Renders mobile responsive hamburger triggers to expose hidden mobile overlay nav (implementation pending/injected via DOM manipulation conditionally based on CSS).

---

## 8. Marketing Pages

### `src/components/landing/`

This entire subfolder compiles into the unauthenticated entry `/landing`.

- **`Hero.jsx`**: "Identify the 10%...". Has `<form>` for quick email CTA (non-functional mock hook, visually robust). Renders mocked `<MetricsCard/>` floating elements in visual box mapping to 3d-effect rotations.
- **`Features.jsx`**: Grid `grid-cols-1 md:grid-cols-2` layout mapping Core capabilities (Real-time scoring mapping to Redis, Intent Recognition, Deep integrations etc.).
- **`TechStack.jsx`**: Visually maps MongoDB, Redis, Node logos displaying infra scale capability claims (Events/sec, Latency logic bounds).
- **`SocialProof.jsx`**: Mocks 5-star validation blocks.
- **`CTA.jsx`**: Dark mode background gradient call to action linking `/signup`.
- **`Navbar.jsx`**: Simplified unauthenticated variant navigation hiding dashboard, providing links exclusively for `/login` and `/signup`.

## Summary Architectural Axioms

1. **Data Segregation**: Context strictly owns Auth/State identity logic. Page level wraps generic array fetch routines. Child components map visual UI properties off exact prop drilling formats safely decoupled from DOM state bounds.
2. **Polling over Sockets (Gracefulness Strategy)**: Charts execute 15-30s temporal polling loops explicitly tracking `setTimeout`. Sockets are strictly restricted to event-based stream inputs (Automation triggers) preventing extreme UI repaints over 120hz frame allocations.
3. **Optimistic Loading States**: Components guarantee safe array `[]` or null instantiation to gracefully load skeletal frames globally, mapping against Tailwind `animate-spin` nodes.
4. **Tailwind Abstractions**: The design strictly avoids arbitrary pixel sizing (`p-[124px]`). Relying explicitly on native tokens and customized configurations for theming `text-text-primary-light` resolving `window.matchMedia(dark scheme)` properties dynamically via system queries.
