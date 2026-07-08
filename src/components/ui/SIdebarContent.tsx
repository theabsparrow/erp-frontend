import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { navigationRoutes } from "@/constants/navigationRoute";
import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/AuthProvider";
import { filterRoutesByPermissions } from "@/utills/filterRoutesByPermissions";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, user } = useAuth();
  const visibleRoutes = filterRoutesByPermissions(
    navigationRoutes,
    user?.permissions ?? [],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          E
        </div>
        <span className="font-semibold text-white text-base tracking-tight">
          ERP System
        </span>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-white/10">
        <p className="text-xs text-violet-400 capitalize">{user?.roleName}</p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1 px-3 py-4 overflow-y-auto">
        {visibleRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-900/40"
                  : "text-slate-400 hover:bg-white/8 hover:text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                <route.icon
                  size={17}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                <span>{route.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
