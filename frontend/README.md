# Lead Scoring System - Frontend

Modern, production-ready frontend for the Event-Driven Lead Scoring System. Built with React 19, Vite, and Tailwind CSS 4, featuring real-time updates via WebSockets and comprehensive authentication.

## Features

✅ **Modern UI**: Beautiful, responsive interface with dark mode support  
✅ **Real-time Updates**: Socket.IO integration for live dashboard data  
✅ **Authentication**: JWT + Google OAuth support  
✅ **API Integration**: Complete REST API client with automatic token management  
✅ **Lead Management**: View, create, and track leads in real-time  
✅ **Dashboard Analytics**: Live metrics and charts  
✅ **Routing**: React Router for smooth navigation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Start Backend Services

Make sure the backend API and Worker are running:

```bash
# In the lead-scoring-system directory
cd api && npm start &
cd ../worker && npm start &
```

## Project Structure

```
src/
├── api/                    # API integration layer
│   ├── axios.config.js    # Axios instance with interceptors
│   ├── auth.api.js        # Authentication endpoints
│   ├── leads.api.js       # Lead management
│   ├── events.api.js      # Event ingestion
│   ├── rules.api.js       # Scoring rules
│   └── leaderboard.api.js # Analytics
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── dashboard/        # Dashboard widgets
│   ├── landing/          # Landing page sections
│   ├── signin/           # Sign in components
│   └── signup/           # Sign up components
├── contexts/              # React Context providers
│   ├── AuthContext.jsx   # Authentication state
│   └── ToastContext.jsx  # Notifications
├── pages/                 # Route pages
│   ├── Landing.jsx       # Public landing page
│   ├── SignIn.jsx        # Login page
│   ├── SignUp.jsx        # Registration page
│   ├── DashboardWrapper.jsx  # Dashboard with API data
│   └── LeadsWrapper.jsx      # Leads with API data
├── sockets/              # Socket.IO client
│   └── socket.js         # WebSocket connection
├── config.js             # Environment configuration
└── App.jsx               # Main app router
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. User registers or logs in via email/password or Google OAuth
2. JWT token stored in localStorage
3. Token automatically included in all API requests
4. Protected routes redirect to login if unauthenticated
5. Real-time Socket.IO connection established on login

## API Integration

All API calls use the centralized axios instance (`src/api/axios.config.js`) with:

- Automatic JWT token injection
- Response/request interceptors
- Error handling
- 401 redirect to login

Example:

```javascript
import { leadsApi } from "./api/leads.api";

// Get all leads
const leads = await leadsApi.getAll();

// Create new lead
const newLead = await leadsApi.create({ name, email, company });
```

## Real-time Updates

Socket.IO client provides real-time updates for:

- Lead score changes
- New events
- Automation executions

Example:

```javascript
import { subscribeToLeadUpdates } from "./sockets/socket";

// Subscribe to updates
const unsubscribe = subscribeToLeadUpdates((data) => {
  console.log("Lead updated:", data);
  // Update UI accordingly
});

// Cleanup
unsubscribe();
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel deploy --prod
```

Set environment variables in Vercel dashboard:

- `VITE_API_URL` - Your API URL
- `VITE_WS_URL` - Your WebSocket URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Environment Variables

| Variable                | Description            | Default                     |
| ----------------------- | ---------------------- | --------------------------- |
| `VITE_API_URL`          | Backend API URL        | `http://localhost:4000/api` |
| `VITE_WS_URL`           | WebSocket URL          | `http://localhost:4000`     |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | -                           |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
