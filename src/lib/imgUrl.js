// src/lib/imgUrl.js
import { viewURL } from "./adminApi";

/**
 * Turn whatever is stored in DB into a browser-loadable URL.
 * - Absolute http(s) => keep
 * - Frontend public assets like "/images/..." => keep
 * - Uploads (bare filename or "uploads/...") => route via /api/uploads (dev) or /uploads (prod)
 */
export function imgURL(p) {
  if (!p) return "";
  const s = String(p).trim();

  // Absolute external URL
  if (/^https?:\/\//i.test(s)) return s;

  // Frontend public assets (do NOT send through /uploads)
  if (/^\/(images|assets|static)\//i.test(s)) return s;

  // Anything else is an uploaded file (may be "uploads/foo.png" or "foo.png")
  return viewURL(s);
}
