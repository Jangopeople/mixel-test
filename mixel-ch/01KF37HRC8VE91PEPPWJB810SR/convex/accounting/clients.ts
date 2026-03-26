import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";

/** Shared helper: verify auth + accounting access, return user doc */
async function requireAccountingAccess(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) {
    throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });
  }
  const hasAccountingAccess =
    user.portalAccess?.accounting === true || user.accountingAccess === true;
  if (!hasAccountingAccess) {
    throw new ConvexError({ code: "FORBIDDEN", message: "No accounting access" });
  }
  return user;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAccountingAccess(ctx);
    return await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getById = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Client not found" });
    }
    return client;
  },
});

export const create = mutation({
  args: {
    companyName: v.string(),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    zip: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAccountingAccess(ctx);
    return await ctx.db.insert("clients", {
      userId: user._id,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    clientId: v.id("clients"),
    companyName: v.string(),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    zip: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);
    const { clientId, ...data } = args;
    const client = await ctx.db.get(clientId);
    if (!client) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Client not found" });
    }
    await ctx.db.patch(clientId, data);
    return clientId;
  },
});

export const remove = mutation({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Client not found" });
    }
    // Check for linked offers
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .first();
    if (offers) {
      throw new ConvexError({ code: "CONFLICT", message: "Client has linked offers and cannot be deleted" });
    }
    // Check for linked invoices
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .first();
    if (invoices) {
      throw new ConvexError({ code: "CONFLICT", message: "Client has linked invoices and cannot be deleted" });
    }
    await ctx.db.delete(args.clientId);
  },
});
