import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    clientCompany: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("discovery"),
      v.literal("planning"),
      v.literal("development"),
      v.literal("testing"),
      v.literal("deployed"),
      v.literal("paused")
    ),
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
    shareToken: v.optional(v.string()),
    shareEnabled: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    phase: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    order: v.number(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]).index("by_user", ["userId"]),

  milestones: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    phase: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  repoActivity: defineTable({
    projectId: v.id("projects"),
    eventType: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    author: v.optional(v.string()),
    timestamp: v.number(),
    sha: v.optional(v.string()),
  }).index("by_project", ["projectId"]),

  aiChats: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    messages: v.string(), // JSON array
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  settings: defineTable({
    userId: v.id("users"),
    key: v.string(),
    value: v.string(),
  }).index("by_user_key", ["userId", "key"]),
});
