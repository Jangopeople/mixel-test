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
    return await ctx.db.query("milestones")
      .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
      .order("asc").collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    phase: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.db.insert("milestones", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("milestones"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    phase: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireUser(ctx);
    const filtered = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    await ctx.db.patch(id, filtered);
  },
});

export const markComplete = mutation({
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

export const remove = mutation({
  args: { id: v.id("milestones") },
  handler: async (ctx, { id }) => {
    await requireUser(ctx);
    await ctx.db.delete(id);
  },
});
