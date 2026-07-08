import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarContent } from "./SIdebarContent";
import { Menu, X } from "lucide-react";

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
          mobileOpen ? "translate-x-0" : "-translate-x-full",
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
