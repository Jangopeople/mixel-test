import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  LayoutDashboard, Plus, Github, Settings, LogOut, Layers, Folder,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/explore", icon: Github, label: "GitHub Explorer", end: false },
  { to: "/settings", icon: Settings, label: "Settings", end: false },
];

function statusDot(status: string) {
  const colors: Record<string, string> = {
    discovery: "bg-warning", planning: "bg-info", development: "bg-accent-light",
    testing: "bg-orange-400", deployed: "bg-success", paused: "bg-muted",
  };
  return colors[status] ?? "bg-muted";
}

export default function Layout() {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const projects = useQuery(api.projects.list) ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#0d0d16] border-r border-border">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-accent">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text">Mixel Plan</p>
            <p className="text-[10px] text-muted">plan.mixel.ch</p>
          </div>
        </div>

        {/* New project button */}
        <div className="px-3 pt-4 pb-2">
          <button
            className="btn-primary w-full justify-center text-xs py-2"
            onClick={() => navigate("/new")}
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <span className={isActive ? "sidebar-link-active" : "sidebar-link"}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </span>
              )}
            </NavLink>
          ))}

          {/* Recent projects */}
          {projects.length > 0 && (
            <div className="pt-5">
              <p className="section-title px-3">Recent Projects</p>
              {projects.slice(0, 6).map((p) => (
                <NavLink key={p._id} to={`/projects/${p._id}`}>
                  {({ isActive }) => (
                    <span className={isActive ? "sidebar-link-active" : "sidebar-link"}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(p.status)}`} />
                      <span className="truncate text-xs">{p.name}</span>
                    </span>
                  )}
                </NavLink>
              ))}
              {projects.length > 6 && (
                <button
                  className="sidebar-link w-full text-xs"
                  onClick={() => navigate("/")}
                >
                  <Folder className="w-3.5 h-3.5" />
                  All projects ({projects.length})
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-border space-y-1">
          <button
            onClick={() => signOut()}
            className="btn-ghost w-full justify-start text-xs text-muted"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-bg">
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
