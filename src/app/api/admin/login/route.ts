import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas";
import { verifyAdminPassword } from "@/lib/excel";
import { createAdminSession, ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { parseCredentialBody } from "@/lib/request-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    // Accept form, strict-JSON, and loose (unquoted) JSON bodies so credentials
    // can be sent in whatever shape is convenient to hand-edit in tools like
    // Burp Repeater / Intruder.
    body = await parseCredentialBody(req);
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body", detail: err instanceof Error ? err.stack : String(err) },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const admin = verifyAdminPassword(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = createAdminSession(admin.adminId);
  const res = NextResponse.json({
    ok: true,
    admin: { adminId: admin.adminId, name: admin.name, email: admin.email, createdAt: admin.createdAt },
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });
  return res;
}
