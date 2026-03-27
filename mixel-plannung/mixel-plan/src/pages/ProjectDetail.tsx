import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import type { Id } from "../../convex/_generated/dataModel";
import {
  ArrowLeft, Github, ExternalLink, CheckCircle2, Plus, Trash2,
  Share2, Copy, Check, GitCommit, Sparkles, Edit3, Save, X,
  RefreshCw, AlertCircle, Link2, MoreHorizontal, ChevronDown,
  Circle, Clock, CheckCheck, Ban, MessageSquare,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "discovery", label: "Discovery" },
  { value: "planning", label: "Planning" },
  { value: "development", label: "Development" },
  { value: "testing", label: "Testing" },
  { value: "deployed", label: "Deployed" },
  { value: "paused", label: "Paused" },
] as const;

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];
const PHASES = ["discovery", "planning", "development", "testing"];

const STATUS_BADGE: Record<string, string> = {
  discovery: "badge-discovery", planning: "badge-planning",
  development: "badge-development", testing: "badge-testing",
  deployed: "badge-deployed", paused: "badge-paused",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "badge-low", medium: "badge-medium", high: "badge-high", critical: "badge-critical",
};

const TASK_STATUS_OPTIONS = [
  { value: "todo", label: "To Do", icon: Circle, color: "text-muted" },
  { value: "in-progress", label: "In Progress", icon: Clock, color: "text-info" },
  { value: "done", label: "Done", icon: CheckCheck, color: "text-success" },
  { value: "blocked", label: "Blocked", icon: Ban, color: "text-danger" },
] as const;

type TabId = "overview" | "tasks" | "timeline" | "notes" | "activity" | "share";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = useQuery(api.projects.get, { id: id as Id<"projects"> });
  const milestones = useQuery(api.projects.getMilestones, { projectId: id as Id<"projects"> });
  const activity = useQuery(api.projects.getActivity, { projectId: id as Id<"projects"> });
  const tasks = useQuery(api.tasks.list, { projectId: id as Id<"projects"> }) ?? [];

  const update = useMutation(api.projects.update);
  const removeProject = useMutation(api.projects.remove);
  const addMilestone = useMutation(api.projects.addMilestone);
  const completeMilestone = useMutation(api.projects.completeMilestone);
  const deleteMilestone = useMutation(api.projects.deleteMilestone);
  const enableSharing = useMutation(api.projects.enableSharing);
  const saveActivity = useMutation(api.projects.saveActivity);
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const fetchCommits = useAction(api.github.fetchCommits);

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [fetchingActivity, setFetchingActivity] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", phase: "planning", dueDate: "" });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const notesTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showMenu, setShowMenu] = useState(false);

  // Initialize notes
  useEffect(() => {
    if (project?.notes !== undefined) setNotes(project.notes ?? "");
  }, [project?.notes]);

  // Auto-save notes
  useEffect(() => {
    if (!project) return;
    if (notes === (project.notes ?? "")) return;
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      update({ id: project._id, notes });
    }, 1000);
    return () => clearTimeout(notesTimer.current);
  }, [notes]);

  if (project === undefined) return <LoadingState />;
  if (project === null) return <NotFound onBack={() => navigate("/")} />;

  const shareUrl = project.shareToken
    ? `${window.location.origin}/share/${project.shareToken}`
    : null;

  async function handleCopyShare() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleShare() {
    setShareLoading(true);
    try {
      await enableSharing({ id: project!._id, enabled: !project!.shareEnabled });
    } finally {
      setShareLoading(false);
    }
  }

  async function handleFetchCommits() {
    if (!project?.githubRepo) return;
    setFetchingActivity(true);
    try {
      const commits = await fetchCommits({
        owner: project.githubRepo.owner,
        repo: project.githubRepo.name,
      });
      for (const c of commits) {
        await saveActivity({
          projectId: project._id,
          eventType: "commit",
          title: c.message,
          url: c.url,
          author: c.author,
          timestamp: c.timestamp,
          sha: c.sha,
        });
      }
    } finally {
      setFetchingActivity(false);
    }
  }

  async function handleAddMilestone() {
    if (!newMilestone.title.trim()) return;
    await addMilestone({
      projectId: project!._id,
      title: newMilestone.title,
      phase: newMilestone.phase,
      dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate).getTime() : undefined,
      order: (milestones?.length ?? 0),
    });
    setNewMilestone({ title: "", phase: "planning", dueDate: "" });
    setShowMilestoneForm(false);
  }

  async function handleAddTask(status: string) {
    const title = (newTaskInputs[status] ?? "").trim();
    if (!title) return;
    await createTask({
      projectId: project!._id,
      title,
      status: status as any,
      priority: "medium",
      order: tasks.filter(t => t.status === status).length,
    });
    setNewTaskInputs(prev => ({ ...prev, [status]: "" }));
  }

  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: `Tasks${tasks.length ? ` (${tasks.length})` : ""}` },
    { id: "timeline", label: `Timeline${milestones?.length ? ` (${milestones.length})` : ""}` },
    { id: "notes", label: "Notes" },
    { id: "activity", label: "Activity" },
    { id: "share", label: "Share" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button className="btn-ghost -ml-1 text-muted" onClick={() => navigate("/")}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editField === "name" ? (
              <div className="flex items-center gap-2">
                <input
                  className="input text-xl font-bold"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { update({ id: project._id, name: editValue }); setEditField(null); }
                    if (e.key === "Escape") setEditField(null);
                  }}
                  autoFocus
                />
                <button className="btn-primary py-1" onClick={() => { update({ id: project._id, name: editValue }); setEditField(null); }}>
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button className="btn-ghost py-1" onClick={() => setEditField(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold text-text cursor-pointer hover:text-accent-light transition-colors group flex items-center gap-2"
                onClick={() => { setEditField("name"); setEditValue(project.name); }}
              >
                {project.name}
                <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
              </h1>
            )}
            <p className="text-sm text-muted mt-1">
              {project.clientName}{project.clientCompany ? ` · ${project.clientCompany}` : ""}
              {project.clientEmail && <span className="ml-2 text-subtle">· {project.clientEmail}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status dropdown */}
            <div className="relative">
              <button
                className={`${STATUS_BADGE[project.status] ?? "badge-paused"} cursor-pointer flex items-center gap-1`}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
              >
                <span style={{ textTransform: "capitalize" }}>{project.status}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showStatusMenu && (
                <div className="absolute top-8 right-0 card py-1 min-w-36 z-20 shadow-xl">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      className="w-full text-left px-3 py-1.5 text-sm text-muted hover:text-text hover:bg-surface2 transition-colors"
                      onClick={() => { update({ id: project._id, status: s.value as any }); setShowStatusMenu(false); }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {project.priority && (
              <span className={PRIORITY_BADGE[project.priority] ?? "badge-low"} style={{ textTransform: "capitalize" }}>
                {project.priority}
              </span>
            )}
            {/* 3-dot menu */}
            <div className="relative">
              <button className="btn-ghost p-2" onClick={() => setShowMenu(!showMenu)}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute top-9 right-0 card py-1 min-w-40 z-20 shadow-xl">
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                    onClick={async () => {
                      setShowMenu(false);
                      if (!confirm(`Delete "${project.name}"?`)) return;
                      await removeProject({ id: project._id });
                      navigate("/");
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-2" />
                    Delete Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-0">
        {TABS.map(t => (
          <button
            key={t.id}
            className={activeTab === t.id ? "tab-active" : "tab"}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "overview" && (
          <OverviewTab
            project={project}
            onUpdate={(fields) => update({ id: project._id, ...fields })}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            tasks={tasks}
            newTaskInputs={newTaskInputs}
            setNewTaskInputs={setNewTaskInputs}
            expandedTask={expandedTask}
            setExpandedTask={setExpandedTask}
            onAddTask={handleAddTask}
            onUpdateTask={(taskId: Id<"tasks">, fields: any) => updateTask({ id: taskId, ...fields })}
            onDeleteTask={(taskId: Id<"tasks">) => removeTask({ id: taskId })}
          />
        )}
        {activeTab === "timeline" && (
          <TimelineTab
            milestones={milestones ?? []}
            newMilestone={newMilestone}
            setNewMilestone={setNewMilestone}
            showForm={showMilestoneForm}
            setShowForm={setShowMilestoneForm}
            onAdd={handleAddMilestone}
            onComplete={(id: Id<"milestones">) => completeMilestone({ id })}
            onDelete={(id: Id<"milestones">) => deleteMilestone({ id })}
          />
        )}
        {activeTab === "notes" && (
          <NotesTab notes={notes} setNotes={setNotes} />
        )}
        {activeTab === "activity" && (
          <ActivityTab
            activity={activity ?? []}
            hasRepo={!!project.githubRepo}
            fetching={fetchingActivity}
            onFetch={handleFetchCommits}
          />
        )}
        {activeTab === "share" && (
          <ShareTab
            project={project}
            shareUrl={shareUrl}
            loading={shareLoading}
            copied={copied}
            onToggle={handleToggleShare}
            onCopy={handleCopyShare}
          />
        )}
      </div>

      {/* AI Chat button */}
      <AiChatButton projectId={project._id} projectName={project.name} />
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ project, onUpdate }: { project: any; onUpdate: (f: any) => void }) {
  const [editField, setEditField] = useState<string | null>(null);
  const [val, setVal] = useState("");

  function startEdit(field: string, current: string) {
    setEditField(field);
    setVal(current ?? "");
  }

  function save(field: string) {
    onUpdate({ [field]: val || undefined });
    setEditField(null);
  }

  const techKeys = ["frontend", "backend", "database", "deployment", "styling"];

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* Left col */}
      <div className="col-span-3 space-y-4">
        {/* Description */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Description</p>
            <button className="btn-ghost p-1 text-xs" onClick={() => startEdit("description", project.description ?? "")}>
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
          {editField === "description" ? (
            <div className="space-y-2">
              <textarea className="input h-24" value={val} onChange={e => setVal(e.target.value)} autoFocus />
              <div className="flex gap-2">
                <button className="btn-primary text-xs py-1" onClick={() => save("description")}>Save</button>
                <button className="btn-ghost text-xs py-1" onClick={() => setEditField(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{project.description || <span className="italic opacity-50">No description yet</span>}</p>
          )}
        </div>

        {/* Client info */}
        <div className="card p-4">
          <p className="section-title">Client Details</p>
          <div className="space-y-2">
            {[
              { label: "Name", field: "clientName", value: project.clientName },
              { label: "Email", field: "clientEmail", value: project.clientEmail },
              { label: "Company", field: "clientCompany", value: project.clientCompany },
            ].map(({ label, field, value }) => (
              <div key={field} className="flex items-center gap-3">
                <span className="text-xs text-muted w-16">{label}</span>
                {editField === field ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input className="input py-1 text-xs flex-1" value={val} onChange={e => setVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") save(field); if (e.key === "Escape") setEditField(null); }}
                      autoFocus />
                    <button className="btn-primary py-1 px-2 text-xs" onClick={() => save(field)}>Save</button>
                    <button className="btn-ghost py-1 px-2 text-xs" onClick={() => setEditField(null)}>Cancel</button>
                  </div>
                ) : (
                  <button
                    className="text-sm text-text hover:text-accent-light transition-colors flex-1 text-left"
                    onClick={() => startEdit(field, value ?? "")}
                  >
                    {value || <span className="text-muted italic text-xs">Click to add</span>}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="card p-4">
          <p className="section-title">Budget</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted mb-1">Estimated</p>
              <p className="text-lg font-semibold text-text">
                {project.budgetEstimated
                  ? `${project.budgetEstimated.toLocaleString()} ${project.currency ?? "CHF"}`
                  : <span className="text-sm text-muted italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Actual</p>
              <p className="text-lg font-semibold text-text">
                {project.budgetActual
                  ? `${project.budgetActual.toLocaleString()} ${project.currency ?? "CHF"}`
                  : <span className="text-sm text-muted italic">Not tracked</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right col */}
      <div className="col-span-2 space-y-4">
        {/* App Type & dates */}
        <div className="card p-4 space-y-3">
          <p className="section-title">Project Info</p>
          <div className="space-y-2">
            {[
              { label: "Type", value: project.appType },
              { label: "Target", value: project.targetDate ? new Date(project.targetDate).toLocaleDateString("en-GB") : null },
              { label: "Started", value: project.startDate ? new Date(project.startDate).toLocaleDateString("en-GB") : null },
              { label: "Created", value: new Date(project.createdAt).toLocaleDateString("en-GB") },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-xs text-muted w-16 flex-shrink-0">{label}</span>
                <span className="text-sm text-text">{value ?? <span className="italic text-muted text-xs">—</span>}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        {project.techStack && (
          <div className="card p-4">
            <p className="section-title">Tech Stack</p>
            <div className="space-y-2">
              {techKeys.map(k => project.techStack?.[k] ? (
                <div key={k} className="flex items-center gap-3">
                  <span className="text-xs text-muted w-20 capitalize">{k}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent-light">{project.techStack[k]}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* GitHub repo */}
        <div className="card p-4">
          <p className="section-title">GitHub Repository</p>
          {project.githubRepo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-muted" />
                <a
                  href={project.githubRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-light hover:underline flex items-center gap-1"
                >
                  {project.githubRepo.owner}/{project.githubRepo.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-muted">Branch: {project.githubRepo.defaultBranch}</p>
              <button
                className="btn-ghost text-xs mt-1"
                onClick={() => onUpdate({ githubRepo: undefined })}
              >
                <X className="w-3 h-3" /> Unlink
              </button>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-xs text-muted mb-2">No repository linked</p>
              <a href="/explore" className="btn-secondary text-xs py-1">
                <Link2 className="w-3.5 h-3.5" /> Browse GitHub
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="card p-4">
            <p className="section-title">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag: string) => (
                <span key={tag} className="badge bg-surface2 text-muted border border-border">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tasks (Kanban) ──────────────────────────────────────────────────────────

function TasksTab({ tasks, newTaskInputs, setNewTaskInputs, expandedTask, setExpandedTask, onAddTask, onUpdateTask, onDeleteTask }: any) {
  const columns = TASK_STATUS_OPTIONS.map(col => ({
    ...col,
    tasks: tasks.filter((t: any) => t.status === col.value).sort((a: any, b: any) => a.order - b.order),
  }));

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(col => {
        const Icon = col.icon;
        return (
          <div key={col.value} className="card p-3 flex flex-col gap-2 min-h-64">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${col.color}`} />
              <span className="text-sm font-medium text-text">{col.label}</span>
              <span className="ml-auto text-xs text-muted">{col.tasks.length}</span>
            </div>

            {col.tasks.map((task: any) => (
              <TaskCard
                key={task._id}
                task={task}
                isExpanded={expandedTask === task._id}
                onToggleExpand={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                onUpdate={(fields: any) => onUpdateTask(task._id, fields)}
                onDelete={() => onDeleteTask(task._id)}
              />
            ))}

            {/* Add task input */}
            <div className="mt-auto pt-2">
              {newTaskInputs[col.value] !== undefined ? (
                <div className="space-y-1">
                  <input
                    className="input text-xs py-1.5"
                    placeholder="Task title…"
                    value={newTaskInputs[col.value]}
                    onChange={e => setNewTaskInputs((prev: any) => ({ ...prev, [col.value]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === "Enter") onAddTask(col.value);
                      if (e.key === "Escape") setNewTaskInputs((prev: any) => { const n = { ...prev }; delete n[col.value]; return n; });
                    }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button className="btn-primary text-xs py-1 flex-1" onClick={() => onAddTask(col.value)}>Add</button>
                    <button className="btn-ghost text-xs py-1" onClick={() => setNewTaskInputs((prev: any) => { const n = { ...prev }; delete n[col.value]; return n; })}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full text-xs text-muted hover:text-text flex items-center gap-1 py-1 transition-colors"
                  onClick={() => setNewTaskInputs((prev: any) => ({ ...prev, [col.value]: "" }))}
                >
                  <Plus className="w-3.5 h-3.5" /> Add task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, isExpanded, onToggleExpand, onUpdate, onDelete }: any) {
  const PRIORITY_BADGE: Record<string, string> = {
    low: "badge-low", medium: "badge-medium", high: "badge-high", critical: "badge-critical",
  };
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(task.title);

  return (
    <div className="bg-surface2 border border-border rounded-lg p-2.5 group hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between gap-1">
        <button className="text-xs text-text text-left flex-1 leading-snug" onClick={onToggleExpand}>
          {task.title}
        </button>
        <button className="opacity-0 group-hover:opacity-100 p-0.5 text-muted hover:text-danger transition-all" onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className={`${PRIORITY_BADGE[task.priority] ?? "badge-low"} text-[10px] px-1.5`} style={{ textTransform: "capitalize" }}>{task.priority}</span>
        {task.phase && <span className="badge bg-surface text-muted border border-border text-[10px] px-1.5">{task.phase}</span>}
        {task.dueDate && (
          <span className={`text-[10px] ${task.dueDate < Date.now() && task.status !== "done" ? "text-danger" : "text-muted"}`}>
            {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-2 animate-fade-in">
          <select
            className="input text-xs py-1"
            value={task.status}
            onChange={e => onUpdate({ status: e.target.value })}
          >
            {TASK_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="input text-xs py-1"
            value={task.priority}
            onChange={e => onUpdate({ priority: e.target.value })}
          >
            {["low", "medium", "high", "critical"].map(p => <option key={p} value={p} style={{ textTransform: "capitalize" }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <input
            className="input text-xs py-1"
            type="date"
            value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
            onChange={e => onUpdate({ dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
          />
          <input
            className="input text-xs py-1"
            placeholder="Phase (e.g. development)"
            value={task.phase ?? ""}
            onChange={e => onUpdate({ phase: e.target.value || undefined })}
          />
        </div>
      )}
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function TimelineTab({ milestones, newMilestone, setNewMilestone, showForm, setShowForm, onAdd, onComplete, onDelete }: any) {
  const grouped = PHASES.reduce((acc, phase) => {
    acc[phase] = milestones.filter((m: any) => m.phase === phase || (!m.phase && phase === "planning"));
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-5">
      {PHASES.map(phase => {
        const ms = grouped[phase];
        if (ms.length === 0) return null;
        return (
          <div key={phase} className="card p-4">
            <p className="section-title capitalize">{phase}</p>
            <div className="space-y-2">
              {ms.map((m: any) => (
                <div key={m._id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0 group">
                  <button
                    className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      m.completedAt ? "border-success bg-success/20" : "border-border hover:border-success"
                    }`}
                    onClick={() => onComplete(m._id)}
                  >
                    {m.completedAt && <Check className="w-3 h-3 text-success" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${m.completedAt ? "line-through text-muted" : "text-text"}`}>{m.title}</p>
                    {m.dueDate && (
                      <p className={`text-xs ${m.dueDate < Date.now() && !m.completedAt ? "text-danger" : "text-muted"}`}>
                        Due {new Date(m.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger transition-all"
                    onClick={() => onDelete(m._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add milestone */}
      {showForm ? (
        <div className="card p-4 space-y-3">
          <p className="section-title">New Milestone</p>
          <input className="input" placeholder="Milestone title" value={newMilestone.title} onChange={e => setNewMilestone((prev: any) => ({ ...prev, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phase</label>
              <select className="input" value={newMilestone.phase} onChange={e => setNewMilestone((prev: any) => ({ ...prev, phase: e.target.value }))}>
                {PHASES.map(p => <option key={p} value={p} style={{ textTransform: "capitalize" }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" value={newMilestone.dueDate} onChange={e => setNewMilestone((prev: any) => ({ ...prev, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={onAdd}>Add Milestone</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn-secondary w-full justify-center" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      )}
    </div>
  );
}

// ─── Notes ───────────────────────────────────────────────────────────────────

function NotesTab({ notes, setNotes }: { notes: string; setNotes: (v: string) => void }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title">Project Notes</p>
        <span className="text-xs text-muted">{notes.length} chars · Auto-saved</span>
      </div>
      <textarea
        className="input h-80 font-mono text-sm"
        placeholder="Add internal notes, meeting summaries, decisions..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
    </div>
  );
}

// ─── Activity ────────────────────────────────────────────────────────────────

function ActivityTab({ activity, hasRepo, fetching, onFetch }: any) {
  return (
    <div className="space-y-4">
      {hasRepo && (
        <div className="flex justify-end">
          <button className="btn-secondary" onClick={onFetch} disabled={fetching}>
            {fetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync GitHub Commits
          </button>
        </div>
      )}

      {activity.length === 0 ? (
        <div className="card p-12 text-center">
          <GitCommit className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-text font-medium mb-1">No activity yet</p>
          <p className="text-sm text-muted">
            {hasRepo ? "Click Sync to fetch GitHub commits" : "Link a GitHub repository to track commits"}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-border">
          {activity.map((a: any) => (
            <div key={a._id} className="p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-surface2 flex items-center justify-center flex-shrink-0 mt-0.5">
                <GitCommit className="w-3.5 h-3.5 text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{a.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {a.author} · {new Date(a.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
              {a.url && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text transition-colors flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Share ───────────────────────────────────────────────────────────────────

function ShareTab({ project, shareUrl, loading, copied, onToggle, onCopy }: any) {
  return (
    <div className="max-w-lg space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-text">Client Sharing</p>
            <p className="text-xs text-muted mt-0.5">Share a read-only view with your client</p>
          </div>
          <button
            className={`relative w-11 h-6 rounded-full transition-colors ${project.shareEnabled ? "bg-accent" : "bg-surface2 border border-border"}`}
            onClick={onToggle}
            disabled={loading}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${project.shareEnabled ? "translate-x-5.5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {project.shareEnabled && shareUrl && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <input className="input text-xs flex-1" value={shareUrl} readOnly />
              <button className="btn-secondary text-xs py-2" onClick={onCopy}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card p-4">
        <p className="section-title">What clients can see</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-success font-medium mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Visible
            </p>
            <ul className="space-y-1 text-muted">
              <li>Project status</li>
              <li>Description</li>
              <li>Features list</li>
              <li>Requirements</li>
              <li>Milestone timeline</li>
              <li>Tech stack</li>
            </ul>
          </div>
          <div>
            <p className="text-danger font-medium mb-2 flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Hidden
            </p>
            <ul className="space-y-1 text-muted">
              <li>Internal notes</li>
              <li>Budget details</li>
              <li>Internal tasks</li>
              <li>GitHub activity</li>
              <li>Client email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Chat Button ───────────────────────────────────────────────────────────

function AiChatButton({ projectId, projectName }: { projectId: Id<"projects">; projectName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-6 right-6 btn-primary shadow-lg shadow-accent/20 z-30"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="w-4 h-4" />
        AI Assistant
      </button>

      {open && (
        <AiChatPanel projectId={projectId} projectName={projectName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function AiChatPanel({ projectId, projectName, onClose }: { projectId: Id<"projects">; projectName: string; onClose: () => void }) {
  const savedChat = useQuery(api.ai.getChat, { projectId });
  const saveChat = useMutation(api.ai.saveChat);
  const settings = useQuery(api.settings.getAll) ?? {};

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ollamaUrl = settings.ollama_url ?? "http://localhost:11434";
  const ollamaModel = settings.ollama_model ?? "llama3.2";

  // Load saved messages
  useEffect(() => {
    if (savedChat?.messages) {
      try { setMessages(JSON.parse(savedChat.messages)); } catch {}
    }
  }, [savedChat]);

  // Check Ollama
  useEffect(() => {
    fetch(`${ollamaUrl}/api/tags`).then(r => setOllamaOk(r.ok)).catch(() => setOllamaOk(false));
  }, [ollamaUrl]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(content?: string) {
    const text = content ?? input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          stream: true,
          messages: [
            { role: "system", content: `You are a helpful AI assistant for the project "${projectName}". Help the user plan, organize, and improve their project.` },
            ...newMessages,
          ],
        }),
      });

      if (!res.ok) throw new Error("Ollama request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      let assistantContent = "";
      const updatedMessages = [...newMessages, { role: "assistant" as const, content: "" }];
      setMessages(updatedMessages);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n").filter(Boolean)) {
          try {
            const parsed = JSON.parse(line);
            assistantContent += parsed?.message?.content ?? "";
            setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
          } catch {}
        }
      }

      const final = [...newMessages, { role: "assistant" as const, content: assistantContent }];
      setMessages(final);
      await saveChat({ projectId, messages: JSON.stringify(final) });
    } catch (e: any) {
      setMessages([...newMessages, { role: "assistant" as const, content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  const QUICK_ACTIONS = [
    "Generate requirements for this project",
    "Suggest a tech stack",
    "Create a milestone plan",
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#0d0d16] border-l border-border flex flex-col z-40 shadow-2xl animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-light" />
          <span className="text-sm font-semibold text-text">AI Assistant</span>
          <span className={`w-2 h-2 rounded-full ${ollamaOk === true ? "bg-success" : ollamaOk === false ? "bg-danger" : "bg-muted animate-pulse"}`} />
        </div>
        <button className="btn-ghost p-1.5" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted text-center mb-4">Quick actions:</p>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action}
                className="w-full text-left text-xs p-3 rounded-lg bg-surface2 border border-border text-muted hover:text-text hover:border-accent/30 transition-all"
                onClick={() => send(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "bg-accent text-white"
                : "bg-surface2 text-text border border-border"
            }`}>
              {m.content || (loading && m.role === "assistant" ? (
                <span className="flex items-center gap-1 text-muted">
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 bg-muted rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                </span>
              ) : "")}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {ollamaOk === false && (
          <p className="text-xs text-danger mb-2">Ollama not reachable. Start with: <code>OLLAMA_ORIGINS=https://plan.mixel.ch ollama serve</code></p>
        )}
        <div className="flex gap-2">
          <input
            className="input flex-1 text-sm"
            placeholder="Ask anything about this project…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            disabled={loading}
          />
          <button
            className="btn-primary px-3"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="card p-5">
        <div className="skeleton h-7 w-64 rounded mb-2" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-6 rounded" />)}
      </div>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="card p-16 text-center">
      <AlertCircle className="w-8 h-8 text-danger mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-text mb-2">Project not found</h3>
      <p className="text-sm text-muted mb-4">This project may have been deleted or you don't have access.</p>
      <button className="btn-primary" onClick={onBack}>Back to Dashboard</button>
    </div>
  );
}
