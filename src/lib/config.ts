// Shared config constants. Deliberately has no "server-only" guard so it can be
// imported from client components too (used by a debug log in the admin login form).
export const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "insureplus-dev-admin-session-secret";
