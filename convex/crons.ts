import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sweep expired servers",
  { minutes: 15 },
  internal.servers.sweepExpired,
);

crons.interval(
  "archive expired servers past grace window",
  { hours: 1 },
  internal.servers.archiveExpired,
);

export default crons;
