import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCS_DIR = path.join(process.cwd(), "data", "documents");

/** Document download, e.g. /api/documents?file=welcome-brochure.txt */
export async function GET(req: Request) {
  const file = new URL(req.url).searchParams.get("file") ?? "";
  const target = path.join(DOCS_DIR, file);

  try {
    const data = fs.readFileSync(target);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${path.basename(target)}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), resolved: target },
      { status: 404 }
    );
  }
}
