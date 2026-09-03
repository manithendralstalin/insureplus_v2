import { NextResponse } from "next/server";
import { changePasswordApiSchema } from "@/lib/schemas";
import { changeCustomerPassword } from "@/lib/excel";
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

  const parsed = changePasswordApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { email, currentPassword, newPassword } = parsed.data;
  const result = await changeCustomerPassword(email, currentPassword, newPassword);
  if (result === "invalid") {
    return NextResponse.json(
      { ok: false, error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
