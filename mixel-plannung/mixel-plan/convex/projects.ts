import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    const project = await ctx.db.get(id);
    if (!project) return null;
    if (project.userId !== userId) return null;
    return project;
  },
});

export const getByShareToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const project = await ctx.db
      .query("projects")
      .filter((q: any) => q.eq(q.field("shareToken"), token))
      .first();
    if (!project?.shareEnabled) return null;
    return project;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    description: v.optional(v.string()),
    appType: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    techStack: v.optional(v.object({
      frontend: v.optional(v.string()),
      backend: v.optional(v.string()),
      database: v.optional(v.string()),
      deployment: v.optional(v.string()),
      styling: v.optional(v.string()),
    })),
    budgetEstimated: v.optional(v.number()),
    currency: v.optional(v.string()),
    targetDate: v.optional(v.number()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("projects", {
      ...args,
      userId,
      status: "discovery",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("discovery"), v.literal("planning"), v.literal("development"),
      v.literal("testing"), v.literal("deployed"), v.literal("paused")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
    appType: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    features: v.optional(v.array(v.string())),
    techStack: v.optional(v.object({
      frontend: v.optional(v.string()),
      backend: v.optional(v.string()),
      database: v.optional(v.string()),
      deployment: v.optional(v.string()),
      styling: v.optional(v.string()),
    })),
    budgetEstimated: v.optional(v.number()),
    budgetActual: v.optional(v.number()),
    currency: v.optional(v.string()),
    startDate: v.optional(v.number()),
    targetDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    githubRepo: v.optional(v.object({
      owner: v.string(),
      name: v.string(),
      url: v.string(),
      cloneUrl: v.string(),
      defaultBranch: v.string(),
      isPrivate: v.boolean(),
    })),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUser(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    const filtered = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    // Cascade delete
    const tasks = await ctx.db.query("tasks").withIndex("by_project", (q: any) => q.eq("projectId", id)).collect();
    for (const t of tasks) await ctx.db.delete(t._id);
    const milestones = await ctx.db.query("milestones").withIndex("by_project", (q: any) => q.eq("projectId", id)).collect();
    for (const m of milestones) await ctx.db.delete(m._id);
    const activity = await ctx.db.query("repoActivity").withIndex("by_project", (q: any) => q.eq("projectId", id)).collect();
    for (const a of activity) await ctx.db.delete(a._id);
    const chats = await ctx.db.query("aiChats").withIndex("by_project", (q: any) => q.eq("projectId", id)).collect();
    for (const c of chats) await ctx.db.delete(c._id);
    await ctx.db.delete(id);
  },
});

export const generateShareToken = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    await ctx.db.patch(id, { shareToken: token, updatedAt: Date.now() });
    return token;
  },
});

export const toggleShare = mutation({
  args: { id: v.id("projects"), enabled: v.boolean() },
  handler: async (ctx, { id, enabled }) => {
    const userId = await requireUser(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    let token = project.shareToken;
    if (enabled && !token) {
      token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    }
    await ctx.db.patch(id, { shareEnabled: enabled, shareToken: token, updatedAt: Date.now() });
    return token;
  },
});

// Keep legacy mutation names for backward compat
export const linkRepo = mutation({
  args: {
    id: v.id("projects"),
    owner: v.string(), name: v.string(), url: v.string(),
    cloneUrl: v.string(), defaultBranch: v.optional(v.string()), isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, owner, name, url, cloneUrl, defaultBranch, isPrivate }) => {
    const userId = await requireUser(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, {
      githubRepo: {
        owner, name, url, cloneUrl,
        defaultBranch: defaultBranch ?? "main",
        isPrivate: isPrivate ?? false,
      },
      status: "development",
      updatedAt: Date.now(),
    });
  },
});

export const enableSharing = mutation({
  args: { id: v.id("projects"), enabled: v.boolean() },
  handler: async (ctx, { id, enabled }) => {
    const userId = await requireUser(ctx);
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) throw new Error("Not found");
    let token = project.shareToken;
    if (enabled && !token) {
      token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    }
    await ctx.db.patch(id, { shareEnabled: enabled, shareToken: token, updatedAt: Date.now() });
    return token;
  },
});

// Milestones (kept in projects.ts for compatibility)
export const getMilestones = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db.query("milestones")
      .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
      .order("asc").collect();
  },
});

export const addMilestone = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    phase: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db.insert("milestones", { ...args, createdAt: Date.now() });
  },
});

export const completeMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    const m = await ctx.db.get(id);
    if (m?.completedAt) {
      await ctx.db.patch(id, { completedAt: undefined });
    } else {
      await ctx.db.patch(id, { completedAt: Date.now() });
    }
  },
});

export const deleteMilestone = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});

export const getActivity = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db.query("repoActivity")
      .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
      .order("desc").take(20);
  },
});

export const saveActivity = mutation({
  args: {
    projectId: v.id("projects"),
    eventType: v.string(), title: v.string(),
    url: v.optional(v.string()), author: v.optional(v.string()),
    timestamp: v.number(), sha: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.sha) {
      const existing = await ctx.db.query("repoActivity")
        .withIndex("by_project", (q: any) => q.eq("projectId", args.projectId))
        .filter((q: any) => q.eq(q.field("sha"), args.sha)).first();
      if (existing) return existing._id;
    }
    return await ctx.db.insert("repoActivity", args);
  },
});
