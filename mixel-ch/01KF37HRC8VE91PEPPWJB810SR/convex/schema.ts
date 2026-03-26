import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    accountingAccess: v.optional(v.boolean()),
    portalAccess: v.optional(
      v.object({
        accounting: v.optional(v.boolean()),
        ticketsystem: v.optional(v.boolean()),
        marketing: v.optional(v.boolean()),
        mixekai: v.optional(v.boolean()),
        kyc: v.optional(v.boolean()),
      }),
    ),
    isAdmin: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),

  clients: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    contactPerson: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    street: v.optional(v.string()),
    zip: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  offers: defineTable({
    userId: v.id("users"),
    clientId: v.id("clients"),
    offerNumber: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    issueDate: v.string(),
    validUntil: v.string(),
    subtotal: v.number(),
    vatRate: v.number(),
    vatAmount: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_client", ["clientId"])
    .index("by_user_and_status", ["userId", "status"]),

  offerItems: defineTable({
    offerId: v.id("offers"),
    position: v.number(),
    description: v.string(),
    quantity: v.number(),
    unit: v.string(),
    unitPrice: v.number(),
    total: v.number(),
  }).index("by_offer", ["offerId"]),

  invoices: defineTable({
    userId: v.id("users"),
    clientId: v.id("clients"),
    offerId: v.optional(v.id("offers")),
    invoiceNumber: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled"),
    ),
    issueDate: v.string(),
    dueDate: v.string(),
    subtotal: v.number(),
    vatRate: v.number(),
    vatAmount: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_client", ["clientId"])
    .index("by_user_and_status", ["userId", "status"]),

  invoiceItems: defineTable({
    invoiceId: v.id("invoices"),
    position: v.number(),
    description: v.string(),
    quantity: v.number(),
    unit: v.string(),
    unitPrice: v.number(),
    total: v.number(),
  }).index("by_invoice", ["invoiceId"]),
});
