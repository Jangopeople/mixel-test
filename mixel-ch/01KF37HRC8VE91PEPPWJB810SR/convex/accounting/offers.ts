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

const offerStatusValidator = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("expired"),
);

/** List all offers for the current user */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAccountingAccess(ctx);
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Enrich with client name
    return await Promise.all(
      offers.map(async (offer) => {
        const client = await ctx.db.get(offer.clientId);
        return {
          ...offer,
          clientName: client?.companyName ?? "Unbekannt",
        };
      }),
    );
  },
});

/** Get a single offer with its line items */
export const getById = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);
    const offer = await ctx.db.get(args.offerId);
    if (!offer) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Offer not found" });
    }
    const items = await ctx.db
      .query("offerItems")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();
    const client = await ctx.db.get(offer.clientId);
    return {
      ...offer,
      clientName: client?.companyName ?? "Unbekannt",
      items: items.sort((a, b) => a.position - b.position),
    };
  },
});

/** Generate the next offer number (e.g. OFF-2026-0001) */
async function generateOfferNumber(ctx: QueryCtx | MutationCtx, userId: string) {
  const year = new Date().getFullYear();
  const prefix = `OFF-${year}-`;
  // Count existing offers for this user this year
  const allOffers = await ctx.db
    .query("offers")
    .withIndex("by_user", (q) => q.eq("userId", userId as Parameters<typeof q.eq>[1]))
    .collect();
  const thisYearOffers = allOffers.filter((o) => o.offerNumber.startsWith(prefix));
  const nextNum = thisYearOffers.length + 1;
  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

/** Create an offer with line items */
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    title: v.string(),
    issueDate: v.string(),
    validUntil: v.string(),
    vatRate: v.number(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit: v.string(),
        unitPrice: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireAccountingAccess(ctx);

    // Verify client exists
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Client not found" });
    }

    // Calculate totals
    const itemsWithTotals = args.items.map((item, index) => ({
      ...item,
      position: index + 1,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    }));
    const subtotal = Math.round(itemsWithTotals.reduce((sum, i) => sum + i.total, 0) * 100) / 100;
    const vatAmount = Math.round(subtotal * (args.vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    const offerNumber = await generateOfferNumber(ctx, user._id);

    const offerId = await ctx.db.insert("offers", {
      userId: user._id,
      clientId: args.clientId,
      offerNumber,
      title: args.title,
      status: "draft",
      issueDate: args.issueDate,
      validUntil: args.validUntil,
      subtotal,
      vatRate: args.vatRate,
      vatAmount,
      total,
      notes: args.notes,
    });

    // Insert line items
    for (const item of itemsWithTotals) {
      await ctx.db.insert("offerItems", {
        offerId,
        position: item.position,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
      });
    }

    return offerId;
  },
});

/** Update an offer (only drafts can be fully edited) */
export const update = mutation({
  args: {
    offerId: v.id("offers"),
    clientId: v.id("clients"),
    title: v.string(),
    issueDate: v.string(),
    validUntil: v.string(),
    vatRate: v.number(),
    notes: v.optional(v.string()),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unit: v.string(),
        unitPrice: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);

    const offer = await ctx.db.get(args.offerId);
    if (!offer) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Offer not found" });
    }
    if (offer.status !== "draft") {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Nur Entwürfe können bearbeitet werden" });
    }

    // Recalculate
    const itemsWithTotals = args.items.map((item, index) => ({
      ...item,
      position: index + 1,
      total: Math.round(item.quantity * item.unitPrice * 100) / 100,
    }));
    const subtotal = Math.round(itemsWithTotals.reduce((sum, i) => sum + i.total, 0) * 100) / 100;
    const vatAmount = Math.round(subtotal * (args.vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    await ctx.db.patch(args.offerId, {
      clientId: args.clientId,
      title: args.title,
      issueDate: args.issueDate,
      validUntil: args.validUntil,
      vatRate: args.vatRate,
      subtotal,
      vatAmount,
      total,
      notes: args.notes,
    });

    // Delete old items and re-insert
    const oldItems = await ctx.db
      .query("offerItems")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();
    for (const old of oldItems) {
      await ctx.db.delete(old._id);
    }
    for (const item of itemsWithTotals) {
      await ctx.db.insert("offerItems", {
        offerId: args.offerId,
        position: item.position,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
      });
    }

    return args.offerId;
  },
});

/** Change offer status */
export const updateStatus = mutation({
  args: {
    offerId: v.id("offers"),
    status: offerStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);
    const offer = await ctx.db.get(args.offerId);
    if (!offer) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Offer not found" });
    }
    await ctx.db.patch(args.offerId, { status: args.status });
  },
});

/** Delete an offer and its items (only drafts) */
export const remove = mutation({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    await requireAccountingAccess(ctx);
    const offer = await ctx.db.get(args.offerId);
    if (!offer) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Offer not found" });
    }
    if (offer.status !== "draft") {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Nur Entwürfe können gelöscht werden" });
    }

    // Check for linked invoices
    const linkedInvoice = await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("offerId"), args.offerId))
      .first();
    if (linkedInvoice) {
      throw new ConvexError({ code: "CONFLICT", message: "Offerte hat verknüpfte Rechnungen" });
    }

    // Delete items
    const items = await ctx.db
      .query("offerItems")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(args.offerId);
  },
});
