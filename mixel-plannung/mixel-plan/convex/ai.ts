// NOTE: AI calls happen directly in the browser to localhost:11434
// This file just handles saving/loading chat history
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getChat = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const chat = await ctx.db.query("aiChats").withIndex("by_project", (q: any) => q.eq("projectId", projectId)).first();
    return chat ?? null;
  },
});

export const saveChat = mutation({
  args: { projectId: v.id("projects"), messages: v.string() },
  handler: async (ctx, { projectId, messages }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("aiChats").withIndex("by_project", (q: any) => q.eq("projectId", projectId)).first();
    if (existing) await ctx.db.patch(existing._id, { messages, updatedAt: Date.now() });
    else await ctx.db.insert("aiChats", { projectId, userId, messages, updatedAt: Date.now() });
  },
});
