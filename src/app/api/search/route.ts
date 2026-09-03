import { NextResponse } from "next/server";
import { rawAll } from "@/lib/sqldb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Plan search. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";

  const sql =
    `SELECT policyId, policyName, category, premium FROM policies ` +
    `WHERE category = '${q}' OR policyName LIKE '%${q}%'`;

  try {
    const results = rawAll(sql);
    return NextResponse.json({ ok: true, query: sql, results });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), query: sql },
      { status: 500 }
    );
  }
}
