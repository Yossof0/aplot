/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as chats from "../chats.js";
import type * as crons from "../crons.js";
import type * as invites from "../invites.js";
import type * as lib_durations from "../lib/durations.js";
import type * as lib_plans from "../lib/plans.js";
import type * as lib_pricing from "../lib/pricing.js";
import type * as lib_session from "../lib/session.js";
import type * as logs from "../logs.js";
import type * as messages from "../messages.js";
import type * as pricingQueries from "../pricingQueries.js";
import type * as servers from "../servers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  chats: typeof chats;
  crons: typeof crons;
  invites: typeof invites;
  "lib/durations": typeof lib_durations;
  "lib/plans": typeof lib_plans;
  "lib/pricing": typeof lib_pricing;
  "lib/session": typeof lib_session;
  logs: typeof logs;
  messages: typeof messages;
  pricingQueries: typeof pricingQueries;
  servers: typeof servers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
