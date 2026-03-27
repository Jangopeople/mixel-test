import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams } from "react-router-dom";
import { CheckCircle2, Layers, Zap, AlertCircle } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  discovery: "badge-discovery", planning: "badge-planning",
  development: "badge-development", testing: "badge-testing",
  deployed: "badge-deployed", paused: "badge-paused",
};

export default function ClientWorkspace() {
  const { token } = useParams<{ token: string }>();
  const project = useQuery(api.projects.getByShareToken, { token: token ?? "" });
  const milestones = useQuery(
    api.projects.getMilestones,
    project ? { projectId: project._id } : "skip"
  );

  if (project === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="card p-12 text-center max-w-sm">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-muted" />
          <h2 className="text-lg font-semibold text-text mb-2">Project not available</h2>
          <p className="text-sm text-muted">
            This link has expired or the project owner has disabled sharing.
          </p>
        </div>
      </div>
    );
  }

  const phases = ["discovery", "planning", "development", "testing"];
  const grouped = phases.reduce((acc, p) => {
    acc[p] = (milestones ?? []).filter((m: any) => m.phase === p || (!m.phase && p === "planning"));
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-bg pb-16">
      {/* Header */}
      <header className="border-b border-border bg-[#0d0d16] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">{project.name}</p>
              {project.clientCompany && <p className="text-xs text-muted">{project.clientCompany}</p>}
            </div>
          </div>
          <span className={`${STATUS_BADGE[project.status] ?? "badge-paused"}`} style={{ textTransform: "capitalize" }}>
            {project.status}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 animate-fade-in">
        {/* Description */}
        {project.description && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-text mb-3">About this project</h2>
            <p className="text-text/80 leading-relaxed">{project.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          {/* Requirements */}
          {project.requirements && project.requirements.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-text mb-3">Requirements</h2>
              <ul className="space-y-2">
                {project.requirements.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-text mb-3">Features</h2>
              <ul className="space-y-2">
                {project.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <Zap className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tech stack */}
        {project.techStack && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text mb-3">Technology Stack</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(project.techStack).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface2 border border-border">
                  <span className="text-xs text-muted capitalize">{k}:</span>
                  <span className="text-xs font-medium text-text">{v as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap / Milestones */}
        {milestones && milestones.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-text mb-4">Roadmap</h2>
            <div className="space-y-4">
              {phases.map(phase => {
                const ms = grouped[phase];
                if (!ms.length) return null;
                return (
                  <div key={phase}>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 capitalize">{phase}</p>
                    <div className="space-y-2 ml-2">
                      {ms.map((m: any) => (
                        <div key={m._id} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            m.completedAt ? "bg-success/20 border-success" : "border-border"
                          }`}>
                            {m.completedAt && <div className="w-2 h-2 rounded-full bg-success" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${m.completedAt ? "line-through text-muted" : "text-text"}`}>{m.title}</p>
                            {m.dueDate && (
                              <p className="text-xs text-muted">
                                {new Date(m.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          Powered by <span className="text-text font-medium">Mixel IT</span>
        </div>
      </footer>
    </div>
  );
}
