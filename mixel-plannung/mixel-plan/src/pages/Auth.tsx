import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Layers, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const email = (data.get("email") as string) ?? "";
    const password = (data.get("password") as string) ?? "";
    const name = (data.get("name") as string) ?? "";
    try {
      await signIn("password", { email, password, flow: mode, ...(mode === "signUp" ? { name } : {}) });
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-info/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-accent shadow-lg shadow-accent/30">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">Mixel Plan</h1>
          <p className="text-sm mt-1 text-muted">
            {mode === "signIn" ? "Sign in to your workspace" : "Create your workspace"}
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signUp" && (
              <div>
                <label className="label">Name</label>
                <input className="input" name="name" placeholder="Your name" autoComplete="name" required />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  className="input pl-10"
                  name="email"
                  type="email"
                  placeholder="you@mixel.ch"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  className="input pl-10 pr-10"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-lg text-sm bg-danger/10 border border-danger/20 text-danger">
                {error}
              </div>
            )}

            <button className="btn-primary w-full justify-center py-2.5" disabled={loading} type="submit">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 pt-4 text-center border-t border-border">
            <p className="text-sm text-muted">
              {mode === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <button
                className="font-semibold text-accent-light hover:text-accent transition-colors"
                onClick={() => { setMode(m => m === "signIn" ? "signUp" : "signIn"); setError(null); }}
              >
                {mode === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Feature hint */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
          <Sparkles className="w-3.5 h-3.5 text-accent-light" />
          AI discovery · GitHub integration · Client workspaces
        </div>
      </div>
    </div>
  );
}
