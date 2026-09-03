import "server-only";
import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { getAdminById } from "./excel";
import { ADMIN_SESSION_SECRET as SESSION_SECRET } from "./config";
import type { Admin } from "./types";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 100 * 365 * 24 * 60 * 60 * 1000; // effectively never expires

function sign(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

export function createAdminSession(adminId: string): string {
  const payload = JSON.stringify({ adminId, exp: Date.now() + SESSION_TTL_MS });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function verifyToken(token: string): { adminId: string } | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const { adminId, exp } = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (typeof adminId !== "string" || typeof exp !== "number" || exp < Date.now()) return null;
    return { adminId };
  } catch {
    return null;
  }
}

/** No-op: stateless tokens have nothing server-side to invalidate — clearing the cookie is enough. */
export function destroyAdminSession(_token: string | undefined | null): void {}

/** Resolves the logged-in admin from the request's session cookie, or null if not authenticated. */
export function resolveAdminFromRequest(req: NextRequest): Admin | null {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const verified = verifyToken(token);
  if (!verified) return null;
  return getAdminById(verified.adminId) ?? null;
}
