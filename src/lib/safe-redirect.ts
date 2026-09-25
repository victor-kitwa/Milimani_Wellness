// The "next" query param on the login/register pages comes straight from
// the URL, which an attacker can craft (e.g. a phishing link like
// /login?next=https://evil.example), so only ever redirect to it if it's
// an internal path - never an absolute URL or a protocol-relative
// "//evil.example" one, both of which browsers happily treat as a
// redirect off the site. Shared by every place that reads that param.
export function safeNextPath(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  try {
    // Resolving against a fixed origin surfaces anything sneaking a
    // scheme/host in (e.g. "/\\evil.example" or "/%09/evil.example"
    // tricks some browsers normalize into an absolute URL).
    const resolved = new URL(value, "http://localhost");
    if (resolved.origin !== "http://localhost") return null;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return null;
  }
}
