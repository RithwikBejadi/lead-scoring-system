import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Helper to check if a route is active
  const isActive = (path) => {
    if (path === "/leads") {
      return (
        location.pathname === "/leads" ||
        location.pathname.startsWith("/leads/")
      );
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - SysIntel Design */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex-shrink-0 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark
          flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span className="material-icons">data_usage</span>
            <span>SysIntel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link
                to="/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/dashboard")
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
                }`}
              >
                <span className="material-icons text-xl">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/leads"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/leads")
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
                }`}
              >
                <span className="material-icons text-xl">people_alt</span>
                Leads
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/events")
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
                }`}
              >
                <span className="material-icons text-xl">event_note</span>
                Events
              </Link>
            </li>
            <li>
              <Link
                to="/automation"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/automation")
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
                }`}
              >
                <span className="material-icons text-xl">
                  settings_input_component
                </span>
                Automation
              </Link>
            </li>
            <li>
              <div className="my-2 border-t border-border-light dark:border-border-dark mx-3"></div>
            </li>
            <li>
              <Link
                to="/settings"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive("/settings")
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
                }`}
              >
                <span className="material-icons text-xl">settings</span>
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile Snippet */}
        <div className="border-t border-border-light dark:border-border-dark">
          <div className="p-4">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-error hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-border-light dark:border-border-dark"
          >
            <span className="material-icons text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
