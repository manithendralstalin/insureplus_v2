import { NextResponse } from "next/server";
import { claimSchema } from "@/lib/schemas";
import { addClaim, getClaims, getPolicies, newClaimId } from "@/lib/excel";
import type { Claim } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get("policyId");
  const claimId = searchParams.get("claimId");
  let claims = getClaims();
  if (policyId) claims = claims.filter((c) => c.policyId.toUpperCase() === policyId.toUpperCase());
  if (claimId) claims = claims.filter((c) => c.claimId.toUpperCase() === claimId.toUpperCase());
  claims = [...claims].sort((a, b) => (b.submittedDate || "").localeCompare(a.submittedDate || ""));
  return NextResponse.json({ ok: true, claims });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body", detail: err instanceof Error ? err.stack : String(err) },
      { status: 400 }
    );
  }

  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const policy = getPolicies().find(
    (p) => p.policyId.toUpperCase() === data.policyNumber.toUpperCase()
  );
  if (!policy) {
    return NextResponse.json(
      { ok: false, error: "No policy found with that number. Please check and try again." },
      { status: 404 }
    );
  }

  const claim: Claim = {
    claimId: newClaimId(),
    policyId: policy.policyId,
    customerName: data.customerName,
    claimType: data.claimType,
    incidentDate: data.incidentDate,
    description: data.description,
    amount: data.amount,
    status: "Submitted",
    submittedDate: new Date().toISOString().slice(0, 10),
    documentName: data.documentName || "",
  };
  await addClaim(claim);

  return NextResponse.json({ ok: true, claim });
}
