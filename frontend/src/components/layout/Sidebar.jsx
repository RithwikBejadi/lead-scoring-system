import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

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
    { path: "/dashboard", icon: "dashboard", label: "Dashboard", section: "platform" },
    { path: "/leads", icon: "group", label: "All Leads", section: "platform" },
    { path: "/rules", icon: "tune", label: "Scoring Models", section: "platform" },
    { path: "/leaderboard", icon: "hub", label: "Integrations", section: "platform" },
  ];

  const systemItems = [
    { path: "/settings", icon: "settings", label: "Settings" },
    { path: "/team", icon: "shield_person", label: "Team Access" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex-shrink-0 border-r border-black bg-white 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className="flex-1 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-black">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-black flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-black">LeadScorer</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
            <div className="text-xs font-mono text-black mb-2 uppercase tracking-wider px-3">Platform</div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 transition-all font-medium border ${
                  isActive(item.path)
                    ? "bg-black text-white border-black"
                    : "text-black hover:bg-gray-100 hover:text-black border-transparent hover:border-black"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            
            <div className="mt-8 text-xs font-mono text-black mb-2 uppercase tracking-wider px-3">System</div>
            {systemItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 transition-all font-medium border ${
                  isActive(item.path)
                    ? "bg-black text-white border-black"
                    : "text-black hover:bg-gray-100 hover:text-black border-transparent hover:border-black"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile / Bottom */}
        <div className="p-4 border-t border-black">
          <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-gray-100 border border-transparent hover:border-black">
            <div className="w-8 h-8 bg-black overflow-hidden border border-black">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover grayscale"
                src="https://ui-avatars.com/api/?name=Jane+Doe&background=000&color=fff"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-black">Jane Doe</span>
              <span className="text-xs text-black">Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
