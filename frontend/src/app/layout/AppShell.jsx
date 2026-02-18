/**
 * AppShell — persistent layout wrapper for all authenticated pages.
 * Contains Sidebar + main content area.
 */

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-neutral-100 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarCollapsed(p => !p)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
