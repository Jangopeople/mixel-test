import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== userId) return [];
    return await ctx.db.query("tasks")
      .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("tasks")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in-progress"), v.literal("done"), v.literal("blocked")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    phase: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    order: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("tasks", { ...args, userId, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("todo"), v.literal("in-progress"), v.literal("done"), v.literal("blocked"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
    phase: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    order: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await requireUser(ctx);
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    const filtered = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    const updates: any = { ...filtered, updatedAt: Date.now() };
    if (filtered.status === "done" && task.status !== "done") {
      updates.completedAt = Date.now();
    } else if (filtered.status && filtered.status !== "done") {
      updates.completedAt = undefined;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx);
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: {
    updates: v.array(v.object({ id: v.id("tasks"), order: v.number() })),
  },
  handler: async (ctx, { updates }) => {
    await requireUser(ctx);
    for (const { id, order } of updates) {
      await ctx.db.patch(id, { order });
    }
  },
});
