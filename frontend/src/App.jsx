/**
 * FILE: App.jsx
 * PURPOSE: Root app — wraps all providers and mounts the new developer-tool router.
 * Nav: Overview → Events → Leads → Rules → Automations → Integrations → System
 */

import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./app/providers/SocketProvider";
import AppRouter from "./app/router";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRouter />
          </BrowserRouter>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
