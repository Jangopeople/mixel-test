import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import {
  Search, Star, GitFork, ExternalLink, Link2, Github,
  Code, Filter, Zap, BookOpen, AlertTriangle, X, Loader2,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

type GHRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  url: string;
  cloneUrl: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  isPrivate: boolean;
  isTemplate: boolean;
  defaultBranch: string;
  updatedAt: string;
  openIssues: number;
};

const QUICK_SEARCHES = [
  { label: "Convex starters", query: "convex starter", icon: Zap },
  { label: "React + Vite", query: "react vite template", icon: Code },
  { label: "SaaS boilerplate", query: "saas boilerplate react", icon: BookOpen },
  { label: "Cloudflare Pages", query: "cloudflare pages react", icon: Github },
];

const LANGUAGES = ["", "TypeScript", "JavaScript", "Python", "Go", "Rust"];

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
};

export default function GitHubExplorer() {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("");
  const [templatesOnly, setTemplatesOnly] = useState(false);
  const [results, setResults] = useState<{ repos: GHRepo[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkingRepo, setLinkingRepo] = useState<GHRepo | null>(null);

  const searchRepos = useAction(api.github.searchRepos);
  const projects = useQuery(api.projects.list) ?? [];
  const linkRepo = useMutation(api.projects.linkRepo);
  const navigate = useNavigate();

  const githubToken = useQuery(api.settings.get, { key: "github_token" });
  const hasToken = !!githubToken;

  async function doSearch(q = query) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchRepos({
        query: q.trim(),
        language: language || undefined,
        isTemplate: templatesOnly || undefined,
        perPage: 12,
      });
      setResults(res as any);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLink(repo: GHRepo, projectId: string) {
    await linkRepo({
      id: projectId as Id<"projects">,
      owner: repo.owner,
      name: repo.name,
      url: repo.url,
      cloneUrl: repo.cloneUrl,
      defaultBranch: repo.defaultBranch,
      isPrivate: repo.isPrivate,
    });
    setLinkingRepo(null);
    navigate(`/projects/${projectId}`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">GitHub Explorer</h1>
        <p className="text-sm mt-1 text-muted">Search repositories and link them to your projects</p>
      </div>

      {/* Token warning */}
      {!hasToken && (
        <div className="card p-4 flex items-start gap-3 border-warning/30 bg-warning/5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning" />
          <div className="text-sm">
            <p className="font-medium text-warning">GitHub token not configured</p>
            <p className="text-xs mt-0.5 text-muted">
              Without a token you're limited to 60 requests/hour.{" "}
              <button className="text-accent-light underline" onClick={() => navigate("/settings")}>
                Add your token in Settings →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              className="input pl-9"
              placeholder="Search GitHub repositories…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
            />
          </div>
          <button className="btn-primary" onClick={() => doSearch()} disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted" />
          <select
            className="input text-xs py-1.5 w-auto"
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l || "Any language"}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
            <input type="checkbox" checked={templatesOnly} onChange={e => setTemplatesOnly(e.target.checked)} />
            Templates only
          </label>
        </div>
      </div>

      {/* Quick searches */}
      {!results && !loading && (
        <div>
          <p className="section-title">Quick searches</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map(({ label, query: q, icon: Icon }) => (
              <button key={label} className="btn-secondary text-xs" onClick={() => { setQuery(q); doSearch(q); }}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-4 flex items-center gap-2 border-danger/30 bg-danger/5">
          <AlertTriangle className="w-4 h-4 text-danger" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">
              <span className="font-semibold text-text">{results.total.toLocaleString()}</span> results
            </p>
            <button className="btn-ghost text-xs" onClick={() => setResults(null)}>
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          {results.repos.length === 0 ? (
            <div className="card p-12 text-center">
              <Github className="w-8 h-8 mx-auto mb-3 text-muted" />
              <p className="text-sm text-muted">No repositories found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.repos.map(repo => (
                <RepoCard key={repo.id} repo={repo} onLink={() => setLinkingRepo(repo)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Link modal */}
      {linkingRepo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <div className="card p-6 max-w-sm w-full animate-fade-in shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-text">Link Repository</h3>
                <p className="text-xs mt-0.5 text-muted">
                  Link <strong className="text-text">{linkingRepo.fullName}</strong> to a project:
                </p>
              </div>
              <button className="btn-ghost p-1.5" onClick={() => setLinkingRepo(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm mb-3 text-muted">No projects yet.</p>
                <button className="btn-primary text-xs" onClick={() => { setLinkingRepo(null); navigate("/new"); }}>
                  Create a project first
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {projects.map(p => (
                  <button
                    key={p._id}
                    className="card-hover w-full text-left p-3"
                    onClick={() => handleLink(linkingRepo, p._id)}
                  >
                    <p className="text-sm font-medium text-text">{p.name}</p>
                    <p className="text-xs text-muted">{p.clientName}</p>
                  </button>
                ))}
              </div>
            )}
            <button className="btn-secondary w-full text-xs justify-center" onClick={() => setLinkingRepo(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo, onLink }: { repo: GHRepo; onLink: () => void }) {
  const langColor = LANG_COLORS[repo.language ?? ""] ?? "#6b7280";

  return (
    <div className="card-hover p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-text hover:text-accent-light transition-colors truncate max-w-xs"
              onClick={e => e.stopPropagation()}
            >
              {repo.fullName}
            </a>
            {repo.isTemplate && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-light font-medium">Template</span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-muted line-clamp-2">{repo.description}</p>
          )}
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-text transition-colors flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 4).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-surface2 border border-border text-muted">{t}</span>
          ))}
        </div>
      )}

      <div className="divider pt-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: langColor }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" /> {repo.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" /> {repo.forks.toLocaleString()}
          </span>
        </div>
        <button className="btn-primary py-1.5 text-xs" onClick={onLink}>
          <Link2 className="w-3 h-3" /> Link
        </button>
      </div>
    </div>
  );
}
