import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Github, Check, Eye, EyeOff, ExternalLink, RefreshCw, Trash2,
  Sparkles, AlertCircle, LogOut, User,
} from "lucide-react";

export default function Settings() {
  const allSettings = useQuery(api.settings.getAll) ?? {};
  const setSetting = useMutation(api.settings.set);
  const verifyToken = useAction(api.github.verifyToken);
  const { signOut } = useAuthActions();

  // AI settings
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.2");
  const [ollamaStatus, setOllamaStatus] = useState<"idle" | "ok" | "error">("idle");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [testingOllama, setTestingOllama] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  // GitHub settings
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [ghUser, setGhUser] = useState<{ login: string; name: string; avatarUrl: string } | null>(null);
  const [ghError, setGhError] = useState<string | null>(null);
  const [ghSaving, setGhSaving] = useState(false);
  const [ghSaved, setGhSaved] = useState(false);

  useEffect(() => {
    if (allSettings.ollama_url) setOllamaUrl(allSettings.ollama_url);
    if (allSettings.ollama_model) setOllamaModel(allSettings.ollama_model);
    if (allSettings.github_token) setToken(allSettings.github_token);
  }, [allSettings]);

  async function testOllama() {
    setTestingOllama(true);
    setOllamaStatus("idle");
    setAvailableModels([]);
    try {
      const res = await fetch(`${ollamaUrl}/api/tags`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const models = (data.models ?? []).map((m: any) => m.name);
      setAvailableModels(models);
      setOllamaStatus("ok");
    } catch {
      setOllamaStatus("error");
    } finally {
      setTestingOllama(false);
    }
  }

  async function saveAiSettings() {
    await setSetting({ key: "ollama_url", value: ollamaUrl });
    await setSetting({ key: "ollama_model", value: ollamaModel });
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  }

  async function handleGhSave() {
    const t = token.trim();
    if (!t) return;
    setGhSaving(true);
    setGhError(null);
    try {
      const user = await verifyToken({ token: t });
      if (!user) { setGhError("Token is invalid or expired"); return; }
      setGhUser(user);
      await setSetting({ key: "github_token", value: t });
      setGhSaved(true);
      setTimeout(() => setGhSaved(false), 2000);
    } catch (e: any) {
      setGhError(e.message ?? "Verification failed");
    } finally {
      setGhSaving(false);
    }
  }

  async function handleGhClear() {
    await setSetting({ key: "github_token", value: "" });
    setToken(""); setGhUser(null); setGhError(null);
  }

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-muted mt-1">Configure AI, GitHub, and account preferences</p>
      </div>

      {/* AI Configuration */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-light" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">AI Configuration</h2>
            <p className="text-xs text-muted">Powered by Ollama (runs locally)</p>
          </div>
        </div>

        <div>
          <label className="label">Ollama URL</label>
          <input
            className="input"
            value={ollamaUrl}
            onChange={e => setOllamaUrl(e.target.value)}
            placeholder="http://localhost:11434"
          />
        </div>

        <div>
          <label className="label">Model</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={ollamaModel}
              onChange={e => setOllamaModel(e.target.value)}
              placeholder="llama3.2"
            />
            <button className="btn-secondary" onClick={testOllama} disabled={testingOllama}>
              {testingOllama ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Detect
            </button>
          </div>
          {availableModels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {availableModels.map(m => (
                <button
                  key={m}
                  className={`text-xs px-2 py-1 rounded-md border transition-all ${
                    ollamaModel === m ? "bg-accent/20 border-accent/40 text-accent-light" : "bg-surface2 border-border text-muted hover:text-text"
                  }`}
                  onClick={() => setOllamaModel(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {ollamaStatus === "ok" && (
          <div className="flex items-center gap-2 text-sm text-success">
            <Check className="w-4 h-4" /> Ollama connected — {availableModels.length} model{availableModels.length !== 1 ? "s" : ""} available
          </div>
        )}
        {ollamaStatus === "error" && (
          <div className="flex items-start gap-2 text-sm text-danger">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>Cannot reach Ollama</p>
              <p className="text-xs mt-0.5 text-muted">Start with: <code className="text-danger/80">OLLAMA_ORIGINS=https://plan.mixel.ch ollama serve</code></p>
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-surface2 border border-border text-xs text-muted">
          To allow plan.mixel.ch to call Ollama, start it with:<br />
          <code className="text-text">OLLAMA_ORIGINS=https://plan.mixel.ch ollama serve</code>
        </div>

        <button className="btn-primary" onClick={saveAiSettings}>
          {aiSaved ? <Check className="w-4 h-4" /> : null}
          {aiSaved ? "Saved!" : "Save AI Settings"}
        </button>
      </section>

      {/* GitHub Integration */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center border border-border">
            <Github className="w-4 h-4 text-text" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">GitHub Integration</h2>
            <p className="text-xs text-muted">Search and link repositories to projects</p>
          </div>
        </div>

        {ghUser && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <img src={ghUser.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-medium text-text">{ghUser.name || ghUser.login}</p>
              <p className="text-xs text-muted">@{ghUser.login}</p>
            </div>
            <a
              href={`https://github.com/${ghUser.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-muted hover:text-text"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        <div>
          <label className="label">Personal Access Token</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input pr-10"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_..."
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                onClick={() => setShowToken(!showToken)}
                type="button"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {token && (
              <button className="btn-ghost p-2.5" onClick={handleGhClear}>
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-1.5">
            Needs <code>repo</code> scope.{" "}
            <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">
              Create token <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>
        </div>

        {ghError && (
          <div className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="w-4 h-4" /> {ghError}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleGhSave}
          disabled={ghSaving || !token.trim()}
        >
          {ghSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : ghSaved ? <Check className="w-4 h-4" /> : <Github className="w-4 h-4" />}
          {ghSaved ? "Saved!" : ghSaving ? "Verifying…" : "Verify & Save Token"}
        </button>
      </section>

      {/* Account */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center border border-border">
            <User className="w-4 h-4 text-text" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Account</h2>
            <p className="text-xs text-muted">Mixel Plan — plan.mixel.ch</p>
          </div>
        </div>

        <button
          className="btn-danger w-full justify-center"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </section>
    </div>
  );
}
