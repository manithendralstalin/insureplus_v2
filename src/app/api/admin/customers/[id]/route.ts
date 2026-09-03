import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveAdminFromRequest } from "@/lib/admin-session";
import { adminEditCustomerSchema } from "@/lib/schemas";
import {
  getCustomerById,
  getPolicies,
  getPayments,
  getClaims,
  getDocuments,
  updateCustomerByAdmin,
  deleteCustomerCascade,
} from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = resolveAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const customer = getCustomerById(id);
  if (!customer) {
    return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
  }

  const policies = getPolicies().filter((p) => p.customerId === id);
  const policyIds = new Set(policies.map((p) => p.policyId));
  const payments = getPayments().filter((p) => policyIds.has(p.policyId));
  const claims = getClaims().filter((c) => policyIds.has(c.policyId));
  const documents = getDocuments().filter((d) => policyIds.has(d.policyId));

  return NextResponse.json({ ok: true, customer, policies, payments, claims, documents });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = resolveAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body", detail: err instanceof Error ? err.stack : String(err) },
      { status: 400 }
    );
  }

  const parsed = adminEditCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const result = await updateCustomerByAdmin(id, parsed.data);
  if (result.status === "not_found") {
    return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
  }
  if (result.status === "email_taken") {
    return NextResponse.json(
      { ok: false, error: "That email is already used by another customer." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, customer: result.customer });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = resolveAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteCustomerCascade(id);
  if (result === "not_found") {
    return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
