import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import {
  Plus, Folder, Rocket, Clock, Trash2, ExternalLink, Sparkles, ArrowRight, TrendingUp,
  AlertTriangle, Users,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

const STATUS_BADGE: Record<string, string> = {
  discovery: "badge-discovery",
  planning: "badge-planning",
  development: "badge-development",
  testing: "badge-testing",
  deployed: "badge-deployed",
  paused: "badge-paused",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
  critical: "badge-critical",
};

export default function Dashboard() {
  const projects = useQuery(api.projects.list) ?? [];
  const allTasks = useQuery(api.tasks.listAll) ?? [];
  const remove = useMutation(api.projects.remove);
  const navigate = useNavigate();

  const now = Date.now();
  const stats = {
    active: projects.filter(p => ["development", "planning"].includes(p.status)).length,
    openTasks: allTasks.filter(t => t.status !== "done").length,
    overdue: allTasks.filter(t => t.dueDate && t.dueDate < now && t.status !== "done").length,
    clients: new Set(projects.map(p => p.clientName)).size,
  };

  const isLoading = projects === undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm mt-1 text-muted">Plan and track your client projects</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/new")}>
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Projects", value: stats.active, icon: Folder, color: "text-accent-light", bg: "bg-accent/10" },
          { label: "Open Tasks", value: stats.openTasks, icon: Clock, color: "text-info", bg: "bg-info/10" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
          { label: "Clients", value: stats.clients, icon: Users, color: "text-success", bg: "bg-success/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              {isLoading ? (
                <div className="skeleton w-8 h-6 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-text">{value}</p>
              )}
              <p className="text-xs text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => navigate("/new")} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="section-title">All Projects ({projects.length})</p>
            <span className="text-xs text-muted">Sorted by recent</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard
                key={p._id}
                project={p}
                tasks={allTasks.filter(t => t.projectId === p._id)}
                onOpen={() => navigate(`/projects/${p._id}`)}
                onDelete={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${p.name}"? This cannot be undone.`))
                    await remove({ id: p._id as Id<"projects"> });
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectCard({
  project: p,
  tasks,
  onOpen,
  onDelete,
}: {
  project: any;
  tasks: any[];
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const done = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < Date.now() && t.status !== "done").length;
  const targetDateStr = p.targetDate
    ? new Date(p.targetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="card-hover p-5 cursor-pointer group" onClick={onOpen}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={STATUS_BADGE[p.status] ?? "badge-paused"} style={{ textTransform: "capitalize" }}>
              {p.status}
            </span>
            {p.priority && (
              <span className={PRIORITY_BADGE[p.priority] ?? "badge-low"} style={{ textTransform: "capitalize" }}>
                {p.priority}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-text truncate">{p.name}</h3>
          <p className="text-xs text-muted mt-0.5">{p.clientName}{p.clientCompany ? ` · ${p.clientCompany}` : ""}</p>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all text-muted hover:text-danger"
          onClick={onDelete}
          title="Delete project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {p.description && (
        <p className="text-sm text-muted line-clamp-2 mb-3">{p.description}</p>
      )}

      {p.techStack && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[p.techStack.frontend, p.techStack.backend, p.techStack.deployment]
            .filter(Boolean)
            .slice(0, 3)
            .map((t: string) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 text-accent-light">{t}</span>
            ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>{done}/{total} tasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-surface2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="divider pt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{timeAgo(p.updatedAt)}</span>
          {overdue > 0 && (
            <span className="text-danger flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />{overdue} overdue
            </span>
          )}
          {targetDateStr && <span>Due {targetDateStr}</span>}
        </div>
        <div className="flex items-center gap-2">
          {p.githubRepo && (
            <a
              href={p.githubRepo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-muted hover:text-text transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="card p-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-accent/10">
        <TrendingUp className="w-8 h-8 text-accent-light" />
      </div>
      <h3 className="text-xl font-semibold text-text mb-2">Create your first project</h3>
      <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
        Use the AI-powered wizard to plan client applications — requirements, tech stack, timeline, and GitHub in minutes.
      </p>
      <button className="btn-primary" onClick={onNew}>
        <Sparkles className="w-4 h-4" /> Start with AI Discovery
      </button>
    </div>
  );
}
