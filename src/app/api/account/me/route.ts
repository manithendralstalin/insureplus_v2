import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CUSTOMER_SESSION_COOKIE, customerIdFromSession } from "@/lib/customer-session";
import {
  getCustomerById,
  getPolicies,
  getPayments,
  getClaims,
  getDocuments,
} from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the logged-in customer's account (profile, policies, payments, claims,
 * documents).
 *
 * VULNERABILITY — Improper Session Management (critical). The account is
 * resolved ONLY from the `session` cookie value, which is predictable and
 * forgeable (see src/lib/customer-session.ts). There is no check that the caller
 * actually owns the session, so pasting another user's session id into the
 * request returns THAT user's data.
 */
export async function GET(req: NextRequest) {
  const raw = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const customerId = customerIdFromSession(raw);
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
  }

  const customer = getCustomerById(customerId);
  if (!customer) {
    return NextResponse.json({ ok: false, error: "Unknown session" }, { status: 401 });
  }

  const policies = getPolicies().filter((p) => p.customerId === customer.customerId);
  const policyIds = new Set(policies.map((p) => p.policyId));
  const payments = getPayments()
    .filter((p) => policyIds.has(p.policyId))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const claims = getClaims()
    .filter((c) => policyIds.has(c.policyId))
    .sort((a, b) => (b.submittedDate || "").localeCompare(a.submittedDate || ""));
  const documents = getDocuments().filter((d) => policyIds.has(d.policyId));

  const { password: _password, ...safeCustomer } = customer;

  return NextResponse.json({ ok: true, customer: safeCustomer, policies, payments, claims, documents });
}
