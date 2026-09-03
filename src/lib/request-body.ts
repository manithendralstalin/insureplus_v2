/**
 * Forgiving request-body parser for the credential endpoints.
 *
 * Accepts, in order of preference:
 *   1. `application/x-www-form-urlencoded` / `multipart/form-data` — form fields.
 *   2. Strict JSON — `{"email":"a@b.com","password":"secret"}`.
 *   3. "Loose" JSON — the same object shape but with UNQUOTED string values,
 *      e.g. `{"email": a@b.com, "password": secret}`. This is not valid JSON,
 *      but tolerating it lets requests be hand-written / edited in tools like
 *      Burp Repeater and Intruder without fighting quote escaping.
 *
 * Always returns a plain string-keyed object (missing keys simply absent), so
 * the caller's schema validation still decides what is acceptable.
 */
export async function parseCredentialBody(req: Request): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const out: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  }

  const raw = (await req.text()).trim();
  if (!raw) return {};

  // Strict JSON first.
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, string>;
  } catch {
    // fall through to loose parsing
  }

  return parseLooseObject(raw);
}

/**
 * Parse a brace-wrapped, comma-separated list of `key: value` pairs where keys
 * and/or values may be unquoted. Values are returned verbatim (trimmed, with a
 * single layer of surrounding quotes removed).
 */
function parseLooseObject(raw: string): Record<string, string> {
  const inner = raw.replace(/^\s*\{/, "").replace(/\}\s*$/, "");
  const out: Record<string, string> = {};
  for (const segment of inner.split(",")) {
    const idx = segment.indexOf(":");
    if (idx === -1) continue;
    const key = stripQuotes(segment.slice(0, idx).trim());
    const value = stripQuotes(segment.slice(idx + 1).trim());
    if (key) out[key] = value;
  }
  return out;
}

function stripQuotes(s: string): string {
  if (s.length >= 2 && ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'"))) {
    return s.slice(1, -1);
  }
  return s;
}
