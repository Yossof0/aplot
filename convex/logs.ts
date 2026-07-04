import { query } from "./_generated/server";
import { v } from "convex/values";

export const listServerLogs = query({
  args: {
    serverId: v.id("servers"),
    paginationOptsCursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this server.");
    }

    // Simple cap-based pagination placeholder — swap for ctx.db.query(...).paginate()
    // with Convex's usePaginatedQuery on the client once the dashboard UI exists.
    return await ctx.db
      .query("serverLogs")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .order("desc")
      .take(50);
  },
});
