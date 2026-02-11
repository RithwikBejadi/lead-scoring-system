import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === "/leads") {
      return (
        location.pathname === "/leads" ||
        location.pathname.startsWith("/leads/")
      );
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { path: "/leads", icon: "group", label: "Leads" },
    { path: "/rules", icon: "tune", label: "Scoring Models" },
    { path: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  ];

  const systemItems = [
    { path: "/settings", icon: "settings", label: "Settings" },
    { path: "/team", icon: "shield_person", label: "Team Access" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get user initials for avatar
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

      {/* Sidebar - Brutalist Style */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex-shrink-0 bg-white border-r border-black
          flex flex-col
          transform transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">bolt</span>
            </div>
            <span className="font-black text-lg tracking-tight uppercase">
              LeadScorer
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col py-6 px-4 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">
            Platform
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                isActive(item.path)
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mt-8 mb-3">
            System
          </div>
          {systemItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
                isActive(item.path)
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Profile + Logout */}
        <div className="border-t border-black">
          <div className="p-4">
            <div className="flex items-center gap-3 px-2 py-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-black truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
