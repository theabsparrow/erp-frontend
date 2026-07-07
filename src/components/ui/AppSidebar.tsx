import { NavLink } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { navigationRoutes } from "@/constants/navigationRoute";
import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/AuthProvider";
import { filterRoutesByPermissions } from "@/utills/filterRoutesByPermissions";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, user } = useAuth();
  const visibleRoutes = filterRoutesByPermissions(
    navigationRoutes,
    user?.permissions ?? []
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
        <p className="text-xs text-slate-400 truncate">{user?.userId}</p>
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
                  : "text-slate-400 hover:bg-white/8 hover:text-white"
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

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#0f0f13] border-r border-white/10 min-h-screen sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile: top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 h-14 bg-[#0f0f13] border-b border-white/10">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="font-semibold text-white text-sm">ERP System</span>
      </div>

      {/* ── Mobile: backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ── */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#0f0f13] border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
