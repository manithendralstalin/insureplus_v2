import { NextResponse } from "next/server";
import { buySchema } from "@/lib/schemas";
import { getPlan } from "@/lib/plans";
import {
  upsertCustomer,
  addPolicy,
  addPayment,
  addDocument,
  newPolicyId,
  newPaymentId,
  newDocumentId,
} from "@/lib/excel";
import type { Policy, Payment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `REF-${s}`;
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

  const parsed = buySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { planId, term, personal, nominee, amount, last4, method } = parsed.data;
  const plan = getPlan(planId);
  if (!plan) {
    return NextResponse.json({ ok: false, error: "Unknown plan" }, { status: 404 });
  }

  const customer = await upsertCustomer({
    name: personal.name,
    email: personal.email,
    phone: personal.phone,
    address: personal.address,
    password: personal.password,
  });

  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const end = new Date(today.getFullYear() + term, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  const policyId = newPolicyId();
  const policy: Policy = {
    policyId,
    customerId: customer.customerId,
    policyName: plan.name,
    category: plan.category,
    coverage: plan.coverage,
    premium: plan.premium,
    duration: `${term} Year${term > 1 ? "s" : ""}`,
    status: "Active",
    startDate: start,
    endDate: end,
    nominee: `${nominee.nomineeName} (${nominee.nomineeRelation})`,
    createdAt: start,
  };
  await addPolicy(policy);

  const reference = randomRef();
  const payment: Payment = {
    paymentId: newPaymentId(),
    policyId,
    amount,
    date: start,
    status: "Success",
    last4,
    method,
    reference,
  };
  await addPayment(payment);

  await addDocument({
    documentId: newDocumentId(),
    policyId,
    name: "Policy Certificate.pdf",
    type: "Certificate",
    uploadedDate: start,
  });
  await addDocument({
    documentId: newDocumentId(),
    policyId,
    name: "Payment Receipt.pdf",
    type: "Receipt",
    uploadedDate: start,
  });

  return NextResponse.json({
    ok: true,
    policyId,
    reference,
    paymentId: payment.paymentId,
    amount,
    customerId: customer.customerId,
    email: customer.email,
    issuedOn: start,
  });
}
