import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const s = await ctx.db.query("settings").withIndex("by_user_key", (q: any) => q.eq("userId", userId).eq("key", key)).first();
    return s?.value ?? null;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("settings").withIndex("by_user_key", (q: any) => q.eq("userId", userId).eq("key", key)).first();
    if (existing) await ctx.db.patch(existing._id, { value });
    else await ctx.db.insert("settings", { userId, key, value });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};
    const all = await ctx.db.query("settings").withIndex("by_user_key", (q: any) => q.eq("userId", userId)).collect();
    return Object.fromEntries(all.map((s: any) => [s.key, s.value]));
  },
});
