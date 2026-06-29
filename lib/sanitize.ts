/**
 * Lightweight HTML sanitizer — whitelist-based.
 * Strips all tags/attributes not in the allow-lists.
 *
 * NOTE: For production use with untrusted input, consider replacing
 * the regex-based sanitizer with DOMPurify which is battle-tested.
 * This module provides a reasonable baseline for semi-trusted content.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
  "ul", "ol", "li", "a", "span", "div", "h1", "h2", "h3",
  "h4", "h5", "h6", "blockquote", "hr", "sub", "sup",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  span: new Set(["style"]),
  div: new Set(["style"]),
  p: new Set(["style"]),
};

const DANGEROUS_ATTR_PREFIXES = ["on", "formaction", "action", "xlink:href", "data-"];

function isAllowedAttr(tag: string, attr: string): boolean {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return false;
  return allowed.has(attr);
}

function hasDangerousPrefix(attr: string): boolean {
  return DANGEROUS_ATTR_PREFIXES.some((p) => attr.toLowerCase().startsWith(p));
}

/**
 * Sanitize HTML string — strip disallowed tags and attributes.
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags entirely (including content)
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove style tags entirely
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove event handler attributes that may appear as standalone attributes
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, "");

  // Replace tags not in whitelist with empty string
  cleaned = cleaned.replace(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)\/?>/g, (match: string, tag: string, attrsStr: string) => {
    const tagName = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      // Strip the tag but keep inner content
      return "";
    }
    // Sanitize attributes
    if (!attrsStr.trim()) return match;
    const cleanedAttrs = attrsStr.replace(
      /([a-zA-Z][a-zA-Z0-9-:]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|\S+))?/g,
      (attrMatch: string, attrName: string) => {
        if (hasDangerousPrefix(attrName) || !isAllowedAttr(tagName, attrName)) {
          return "";
        }
        return attrMatch;
      }
    );
    // Rebuild tag with cleaned attrs
    const isSelfClosing = match.endsWith("/>");
    const hasSlash = match.startsWith("</");
    if (hasSlash) return `</${tagName}>`;
    if (isSelfClosing) return `<${tagName} ${cleanedAttrs.trim()}/>`;
    return `<${tagName} ${cleanedAttrs.trim()}>`;
  });

  return cleaned;
}

/**
 * Validate a URL to prevent javascript:, data:, and other dangerous schemes.
 * Returns the URL if safe, or "#" if dangerous.
 */
/** Schemes that are never safe in user-provided URLs. */
const UNSAFE_SCHEMES = ["javascript:", "vbscript:", "data:text/html"];

export function safeUrl(url: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  const stripped = trimmed.replace(/^[\x00-\x20]+/, "").toLowerCase();
  // Block javascript:/vbscript: entirely, and data: only for HTML payloads
  // Allow data:image/* (user photos) and other benign data: types.
  if (
    UNSAFE_SCHEMES.some((s) => stripped.startsWith(s)) ||
    stripped.startsWith("blob:")
  ) {
    return "#";
  }
  return url;
}

/**
 * Validate that a URL is a legitimate API base URL (for SSRF prevention).
 * Only allows https:// or http:// URLs pointing to non-internal addresses.
 */
export function isValidApiBaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;

    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("169.254.") ||  // link-local
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      isPrivate172(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a hostname falls within the RFC 1918 172.16.0.0/12 private range.
 * That is: 172.16.x.x through 172.31.x.x
 */
function isPrivate172(hostname: string): boolean {
  if (!hostname.startsWith("172.")) return false;
  const parts = hostname.split(".");
  if (parts.length < 2) return false;
  const second = parseInt(parts[1]!, 10);
  return second >= 16 && second <= 31;
}
