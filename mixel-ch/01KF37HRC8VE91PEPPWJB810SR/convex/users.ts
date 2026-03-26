import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const portalValidator = v.union(
  v.literal("accounting"),
  v.literal("ticketsystem"),
  v.literal("marketing"),
  v.literal("mixekai"),
  v.literal("kyc"),
);

type PortalKey = "accounting" | "ticketsystem" | "marketing" | "mixekai" | "kyc";
type PortalAccessMap = Record<PortalKey, boolean>;

function getPortalAccessMap(user: Doc<"users"> | null | undefined): PortalAccessMap {
  return {
    accounting:
      user?.portalAccess?.accounting === true || user?.accountingAccess === true,
    ticketsystem: user?.portalAccess?.ticketsystem === true,
    marketing: user?.portalAccess?.marketing === true,
    mixekai: user?.portalAccess?.mixekai === true,
    kyc: user?.portalAccess?.kyc === true,
  };
}

/** Create/update current user from auth identity */
export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user !== null) {
      const portalAccess = getPortalAccessMap(user);
      const needsAccountingSync =
        user.accountingAccess === true && user.portalAccess?.accounting !== true;
      if (needsAccountingSync) {
        await ctx.db.patch(user._id, {
          portalAccess: {
            ...portalAccess,
            accounting: true,
          },
        });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      portalAccess: {
        accounting: false,
        ticketsystem: false,
        marketing: false,
        mixekai: false,
        kyc: false,
      },
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Called getCurrentUser without authentication present",
      });
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user;
  },
});

/** Access summary for client portals used by the public header */
export const getPortalAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        authenticated: false,
        hasUser: false,
        isAdmin: false,
        reason: "unauthenticated" as const,
        hasAnyPortalAccess: false,
        user: null,
        portalAccess: getPortalAccessMap(null),
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      return {
        authenticated: true,
        hasUser: false,
        isAdmin: false,
        reason: "no_user" as const,
        hasAnyPortalAccess: false,
        user: {
          name: identity.name ?? null,
          email: identity.email ?? null,
        },
        portalAccess: getPortalAccessMap(null),
      };
    }

    const portalAccess = getPortalAccessMap(user);
    const hasAnyPortalAccess = Object.values(portalAccess).some(Boolean);
    return {
      authenticated: true,
      hasUser: true,
      isAdmin: user.isAdmin === true,
      reason: hasAnyPortalAccess
        ? ("approved" as const)
        : ("not_approved" as const),
      hasAnyPortalAccess,
      user: {
        name: user.name ?? identity.name ?? null,
        email: user.email ?? identity.email ?? null,
      },
      portalAccess,
    };
  },
});

/** Check if current user has accounting access + admin status */
export const checkAccountingAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        hasAccess: false,
        isAdmin: false,
        reason: "unauthenticated" as const,
      };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) {
      return { hasAccess: false, isAdmin: false, reason: "no_user" as const };
    }

    const hasAccountingAccess = getPortalAccessMap(user).accounting;
    if (!hasAccountingAccess) {
      return {
        hasAccess: false,
        isAdmin: false,
        reason: "not_approved" as const,
      };
    }
    return {
      hasAccess: true,
      isAdmin: user.isAdmin === true,
      reason: "approved" as const,
    };
  },
});

/** Grant or revoke accounting access — admin only */
export const setAccountingAccess = mutation({
  args: {
    userId: v.id("users"),
    hasAccess: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
    }
    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!admin || !admin.isAdmin) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Nur Administratoren können den Zugang verwalten",
      });
    }
    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });
    }

    const portalAccess = getPortalAccessMap(target);
    await ctx.db.patch(args.userId, {
      accountingAccess: args.hasAccess,
      portalAccess: {
        ...portalAccess,
        accounting: args.hasAccess,
      },
    });
  },
});

/** Grant or revoke access for one client portal — admin only */
export const setPortalAccess = mutation({
  args: {
    userId: v.id("users"),
    portal: portalValidator,
    hasAccess: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
    }
    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!admin || !admin.isAdmin) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Nur Administratoren können den Zugang verwalten",
      });
    }

    const target = await ctx.db.get(args.userId);
    if (!target) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });
    }

    const portalAccess = getPortalAccessMap(target);

    if (args.portal === "accounting") {
      await ctx.db.patch(args.userId, {
        accountingAccess: args.hasAccess,
        portalAccess: {
          ...portalAccess,
          accounting: args.hasAccess,
        },
      });
      return;
    }

    if (args.portal === "ticketsystem") {
      await ctx.db.patch(args.userId, {
        portalAccess: {
          ...portalAccess,
          ticketsystem: args.hasAccess,
        },
      });
      return;
    }

    if (args.portal === "marketing") {
      await ctx.db.patch(args.userId, {
        portalAccess: {
          ...portalAccess,
          marketing: args.hasAccess,
        },
      });
      return;
    }

    if (args.portal === "mixekai") {
      await ctx.db.patch(args.userId, {
        portalAccess: {
          ...portalAccess,
          mixekai: args.hasAccess,
        },
      });
      return;
    }

    await ctx.db.patch(args.userId, {
      portalAccess: {
        ...portalAccess,
        kyc: args.hasAccess,
      },
    });
  },
});

/** List all users — admin only */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Not logged in" });
    }
    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!admin || !admin.isAdmin) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Nur Administratoren" });
    }
    return await ctx.db.query("users").collect();
  },
});
