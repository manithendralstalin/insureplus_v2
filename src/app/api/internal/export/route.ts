import { NextResponse } from "next/server";
import { getCustomers, getPolicies, getPayments } from "@/lib/excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Internal data export. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    generatedBy: "internal-export-v1",
    customers: getCustomers(),
    policies: getPolicies(),
    payments: getPayments(),
  });
}
