import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/axios.config";

const Header = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState(null);
  const [project, setProject] = useState(null);

  // Fetch system health and project every 15s
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const r = await api.get("/health");
        setHealth(r.data);
      } catch {
        setHealth(null);
      }
    };
    const fetchProject = async () => {
      try {
        const r = await api.get("/auth/project");
        if (r.data?.success) setProject(r.data.data.project);
      } catch {
        // silently fail — project name is optional UI enhancement
      }
    };
    checkHealth();
    fetchProject();
    const t = setInterval(checkHealth, 15000);
    return () => clearInterval(t);
  }, []);

  const statusDot = (ok) =>
    ok
      ? "w-2 h-2 rounded-full bg-success mr-1.5 inline-block"
      : "w-2 h-2 rounded-full bg-error mr-1.5 inline-block animate-pulse";

  const apiOk = health?.mongodb === "connected";
  const redisOk = health?.redis === "connected";

  // User initials for avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "?";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const projectName = project?.name || "My Project";

  return (
    <header className="h-14 border-b border-google-border bg-surface-light dark:bg-surface-dark flex items-center justify-between px-6 z-40 shrink-0">
      {/* Left: Project selector + Greeting */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-semibold">
            {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="material-icons text-sm text-primary">folder</span>
            <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              {projectName}
            </span>
          </div>
        </div>
      </div>

      {/* Right: system health + user avatar */}
      <div className="flex items-center space-x-6">
        {/* System health indicators */}
        <div className="hidden lg:flex items-center space-x-4 border-x px-6 border-google-border h-14">
          <div className="flex items-center text-[11px] font-medium">
            <span className={statusDot(apiOk)} />
            <span className="text-text-secondary-light dark:text-text-secondary-dark mr-1 uppercase">
              DB:
            </span>
            <span className={apiOk ? "text-success" : "text-error"}>
              {health ? (apiOk ? "Connected" : "Down") : "..."}
            </span>
          </div>
          <div className="flex items-center text-[11px] font-medium">
            <span className={statusDot(redisOk)} />
            <span className="text-text-secondary-light dark:text-text-secondary-dark mr-1 uppercase">
              Redis:
            </span>
            <span className={redisOk ? "text-success" : "text-error"}>
              {health ? (redisOk ? "Ready" : "Down") : "..."}
            </span>
          </div>
          <div className="flex items-center text-[11px] font-medium">
            <span className={statusDot(!!health)} />
            <span className="text-text-secondary-light dark:text-text-secondary-dark mr-1 uppercase">
              API:
            </span>
            <span className={health ? "text-success" : "text-error"}>
              {health ? "Green" : "Offline"}
            </span>
          </div>
        </div>

        {/* User avatar with tooltip */}
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/30">
              {initials}
            </div>
          )}
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark leading-tight">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
