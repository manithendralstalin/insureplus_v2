import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveAdminFromRequest } from "@/lib/admin-session";
import { getCustomers, getPolicies } from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = resolveAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const policies = getPolicies();
  const customers = getCustomers().map((c) => ({
    ...c,
    policyCount: policies.filter((p) => p.customerId === c.customerId).length,
  }));

  return NextResponse.json({ ok: true, customers });
}
