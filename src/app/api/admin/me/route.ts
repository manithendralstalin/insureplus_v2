import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveAdminFromRequest } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = resolveAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    admin: { adminId: admin.adminId, name: admin.name, email: admin.email, createdAt: admin.createdAt },
  });
}
