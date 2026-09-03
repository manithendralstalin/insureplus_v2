import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas";
import { parseCredentialBody } from "@/lib/request-body";
import { CUSTOMER_SESSION_COOKIE, createCustomerSession } from "@/lib/customer-session";
import {
  verifyCustomerPassword,
  getPolicies,
  getPayments,
  getClaims,
  getDocuments,
} from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST (not GET) so the password is never sent as a URL query param /
// logged in server access logs or browser history.
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

  const customer = verifyCustomerPassword(parsed.data.email, parsed.data.password);
  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 }
    );
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

  const res = NextResponse.json({ ok: true, customer: safeCustomer, policies, payments, claims, documents });
  // Issue the (predictable, swappable) customer session cookie. Deliberately
  // not httpOnly, with a year-long lifetime and no signature — see
  // src/lib/customer-session.ts.
  res.cookies.set(CUSTOMER_SESSION_COOKIE, createCustomerSession(customer.customerId), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
