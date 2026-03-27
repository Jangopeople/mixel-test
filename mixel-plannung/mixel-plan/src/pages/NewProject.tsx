import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import {
  Check, ChevronRight, ChevronLeft, Plus, X, Sparkles, Loader2,
  Layers, Zap, AlertCircle,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Client Info" },
  { id: 2, label: "Brief & Budget" },
  { id: 3, label: "AI Discovery" },
  { id: 4, label: "Review" },
];

const APP_TYPES = [
  "Web App", "Mobile", "API", "Full-stack", "Landing Page", "E-commerce", "SaaS", "Dashboard",
];

const CURRENCIES = ["CHF", "EUR", "USD"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const AI_SYSTEM_PROMPT = `You are Mixel IT's senior project planning assistant. Analyze the client project brief and return a JSON object with these exact fields:
{
  "requirements": ["5-8 functional requirements"],
  "features": ["6-10 key features with descriptions"],
  "techStack": {"frontend":"...","backend":"...","database":"...","deployment":"...","styling":"..."},
  "milestones": [{"title":"...","phase":"discovery|planning|development|testing","daysFromStart":14}],
  "risks": ["potential risks"],
  "estimatedWeeks": 12
}
Return only valid JSON, no markdown.`;

export default function NewProject() {
  const [step, setStep] = useState(1);
  // Step 1
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [appType, setAppType] = useState("");
  // Step 2
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("CHF");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState("");
  // Step 3
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiInput, setAiInput] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.2");
  const [aiStreamText, setAiStreamText] = useState("");
  // Saving
  const [saving, setSaving] = useState(false);

  const createProject = useMutation(api.projects.create);
  const addMilestone = useMutation(api.projects.addMilestone);
  const navigate = useNavigate();

  async function runAI() {
    const brief = aiInput || description;
    if (!brief.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiStreamText("");
    setAiResult(null);

    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          stream: true,
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { role: "user", content: `Client: ${clientName}\nApp type: ${appType || "not specified"}\nBrief: ${brief}` },
          ],
        }),
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      let fullText = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const content = parsed?.message?.content ?? "";
            fullText += content;
            setAiStreamText(fullText);
          } catch {}
        }
      }

      // Parse JSON from the response
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response as JSON");
      const parsed = JSON.parse(jsonMatch[0]);
      setAiResult(parsed);
      if (parsed.requirements?.length) setRequirements(parsed.requirements);
      if (parsed.features?.length) setFeatures(parsed.features);
      if (parsed.techStack) setTechStack(parsed.techStack);
      if (parsed.milestones?.length) setMilestones(parsed.milestones);
    } catch (e: any) {
      setAiError(e.message ?? "AI generation failed. Is Ollama running?");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim() || !clientName.trim()) return;
    setSaving(true);
    try {
      const projectId = await createProject({
        name: name.trim(),
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        clientCompany: clientCompany.trim() || undefined,
        description: description.trim() || undefined,
        appType: appType || undefined,
        requirements: requirements.length ? requirements : undefined,
        features: features.length ? features : undefined,
        techStack: techStack || undefined,
        budgetEstimated: budget ? parseFloat(budget) : undefined,
        currency: currency || undefined,
        targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
        priority: (priority as any) || undefined,
      });

      // Create milestones
      const startDate = Date.now();
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        await addMilestone({
          projectId,
          title: m.title,
          phase: m.phase,
          dueDate: startDate + (m.daysFromStart ?? (i + 1) * 14) * 86400000,
          order: i,
        });
      }

      navigate(`/projects/${projectId}`);
    } catch (e: any) {
      alert(e.message ?? "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  const canNext1 = name.trim().length > 0 && clientName.trim().length > 0;
  const canNext2 = description.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">New Project</h1>
        <p className="text-sm text-muted mt-1">Set up your client project in 4 steps</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                step > s.id ? "bg-success text-white" :
                step === s.id ? "bg-accent text-white" :
                "bg-surface2 text-muted border border-border"
              }`}>
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === s.id ? "text-text" : "text-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${step > s.id ? "bg-success/40" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="card p-6 mb-6 animate-fade-in">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Project Name *</label>
                <input className="input" placeholder="e.g. Acme Corp Portal" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Client Name *</label>
                <input className="input" placeholder="John Smith" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div>
                <label className="label">Company</label>
                <input className="input" placeholder="Acme Corp" value={clientCompany} onChange={e => setClientCompany(e.target.value)} />
              </div>
              <div>
                <label className="label">Client Email</label>
                <input className="input" type="email" placeholder="john@acme.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">App Type</label>
                <select className="input" value={appType} onChange={e => setAppType(e.target.value)}>
                  <option value="">Select type…</option>
                  {APP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text mb-4">Brief & Budget</h2>
            <div>
              <label className="label">Project Description *</label>
              <textarea
                className="input h-32"
                placeholder="Describe the project: what it does, who will use it, key goals..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="label">Budget Estimate</label>
                <input className="input" type="number" placeholder="15000" value={budget} onChange={e => setBudget(e.target.value)} />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Target Date</label>
                <input className="input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="">Select…</option>
                  {PRIORITIES.map(p => <option key={p} value={p} style={{ textTransform: "capitalize" }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text mb-1">AI Discovery</h2>
            <p className="text-sm text-muted mb-4">Analyze your brief with Ollama to generate requirements, features, and a tech stack.</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ollama URL</label>
                <input className="input" value={ollamaUrl} onChange={e => setOllamaUrl(e.target.value)} />
              </div>
              <div>
                <label className="label">Model</label>
                <input className="input" value={ollamaModel} onChange={e => setOllamaModel(e.target.value)} placeholder="llama3.2" />
              </div>
            </div>

            <div>
              <label className="label">Project Brief</label>
              <textarea
                className="input h-24"
                placeholder="Paste or type your project brief..."
                value={aiInput || description}
                onChange={e => setAiInput(e.target.value)}
              />
            </div>
            {aiInput === "" && description && (
              <button
                className="btn-ghost text-xs"
                onClick={() => setAiInput(description)}
              >
                <Plus className="w-3.5 h-3.5" /> Paste from Step 2 brief
              </button>
            )}

            <button
              className="btn-primary w-full justify-center"
              onClick={runAI}
              disabled={aiLoading || !(aiInput || description).trim()}
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiLoading ? "Analyzing…" : "Analyze with AI"}
            </button>

            {aiError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{aiError}</p>
                  <p className="text-xs mt-1 opacity-70">Start Ollama with: <code>OLLAMA_ORIGINS=https://plan.mixel.ch ollama serve</code></p>
                </div>
              </div>
            )}

            {aiLoading && aiStreamText && (
              <div className="p-3 rounded-lg bg-surface2 border border-border text-xs text-muted font-mono max-h-32 overflow-y-auto">
                {aiStreamText}
              </div>
            )}

            {aiResult && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-success text-sm font-medium">
                  <Check className="w-4 h-4" /> AI analysis complete
                </div>

                {requirements.length > 0 && (
                  <div className="card p-4">
                    <p className="section-title">Requirements ({requirements.length})</p>
                    <ul className="space-y-1">
                      {requirements.map((r, i) => (
                        <li key={i} className="text-sm text-text flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {features.length > 0 && (
                  <div className="card p-4">
                    <p className="section-title">Features ({features.length})</p>
                    <ul className="space-y-1">
                      {features.slice(0, 5).map((f, i) => (
                        <li key={i} className="text-sm text-text flex items-start gap-2">
                          <Zap className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />{f}
                        </li>
                      ))}
                      {features.length > 5 && <li className="text-xs text-muted">+{features.length - 5} more</li>}
                    </ul>
                  </div>
                )}

                {techStack && (
                  <div className="card p-4">
                    <p className="section-title">Tech Stack</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(techStack).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2">
                          <span className="text-xs text-muted capitalize w-20">{k}</span>
                          <span className="text-xs text-text font-medium">{v as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult.estimatedWeeks && (
                  <p className="text-sm text-muted">Estimated: <span className="text-text font-medium">{aiResult.estimatedWeeks} weeks</span></p>
                )}
              </div>
            )}

            {!aiResult && (
              <p className="text-xs text-muted text-center">
                You can skip AI and continue manually — requirements and features can be added later.
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text mb-4">Review & Create</h2>
            <div className="space-y-3">
              <ReviewRow label="Project" value={name} />
              <ReviewRow label="Client" value={`${clientName}${clientCompany ? ` · ${clientCompany}` : ""}`} />
              {clientEmail && <ReviewRow label="Email" value={clientEmail} />}
              {appType && <ReviewRow label="Type" value={appType} />}
              {description && <ReviewRow label="Description" value={description} truncate />}
              {budget && <ReviewRow label="Budget" value={`${budget} ${currency}`} />}
              {targetDate && <ReviewRow label="Target" value={new Date(targetDate).toLocaleDateString("en-GB")} />}
              {priority && <ReviewRow label="Priority" value={priority} />}
              {requirements.length > 0 && <ReviewRow label="Requirements" value={`${requirements.length} items`} />}
              {features.length > 0 && <ReviewRow label="Features" value={`${features.length} items`} />}
              {milestones.length > 0 && <ReviewRow label="Milestones" value={`${milestones.length} items`} />}
              {techStack && (
                <ReviewRow label="Stack" value={[techStack.frontend, techStack.backend, techStack.deployment].filter(Boolean).join(" · ")} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          className="btn-secondary"
          onClick={() => step === 1 ? navigate("/") : setStep(s => s - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? "Cancel" : "Back"}
        </button>

        {step < 4 ? (
          <button
            className="btn-primary"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && !canNext1 || step === 2 && !canNext2}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={saving || !name.trim() || !clientName.trim()}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            {saving ? "Creating…" : "Create Project"}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-text ${truncate ? "line-clamp-2" : ""}`}>{value}</span>
    </div>
  );
}
