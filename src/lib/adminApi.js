// -------------------------------------------
// Base URL handling (works with or without proxy)
// -------------------------------------------
const RAW_BASE = (process.env.REACT_APP_API_BASE || "").trim();
const BASE = RAW_BASE.replace(/\/+$/, "");

// -------------------------------------------
// Token storage (used only when API returns a JWT)
// -------------------------------------------
const tokenKey = "menty_admin_token";
export const AdminToken = {
  get: () => localStorage.getItem(tokenKey),
  set: (t) => localStorage.setItem(tokenKey, t),
  clear: () => localStorage.removeItem(tokenKey),
};

// -------------------------------------------
// URL builder
// -------------------------------------------
function buildURL(path) {
  return BASE ? `${BASE}${path}` : path;
}

// -------------------------------------------
// Core request helper (JSON/text tolerant)
// - Sends credentials for cookie-based sessions
// - Attaches Authorization when `auth: true` and a token exists
// -------------------------------------------
async function req(path, { method = "GET", json, auth = false, formData } = {}) {
  const url = buildURL(path);
  const headers = {};
  if (!formData) headers["Content-Type"] = "application/json";
  if (auth) {
    const t = AdminToken.get();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const init = { method, headers, credentials: "include", mode: "cors" };
  if (formData) init.body = formData;
  else if (json != null) init.body = JSON.stringify(json);

  const res = await fetch(url, init);

  // Some endpoints may return empty body (204) – handle gracefully
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // non-JSON response
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `${res.status} ${res.statusText}` ||
      "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// -------------------------------------------
// Make a browser-viewable file URL from a stored path
// -------------------------------------------
export const viewURL = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p; // absolute passes through
  const clean = String(p).replace(/^\/?(api\/uploads\/|uploads\/)/i, "");
  const prefix = BASE ? "/uploads/" : "/api/uploads/";
  return `${BASE}${prefix}${clean}`;
};

// -------------------------------------------
// Auth (robust: supports /api/admin/* and /api/auth/* backends)
// -------------------------------------------
export async function login(email, password) {
  // Try /api/admin/login first, then fall back to /api/auth/login
  let data;
  try {
    data = await req("/api/admin/login", {
      method: "POST",
      json: { email, password },
    });
  } catch (e) {
    if (e?.status === 404 || e?.status === 405) {
      data = await req("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
    } else {
      throw e;
    }
  }

  // Common token shapes; null means cookie-only session
  const token =
    data?.token ??
    data?.access_token ??
    data?.jwt ??
    data?.data?.token ??
    null;

  if (token) AdminToken.set(token);
  else AdminToken.clear(); // cookie session path

  // Normalize returned user/admin (optional)
  const user = data?.user ?? data?.admin ?? null;

  return { ok: true, token, user };
}

// Check current session (works with cookie or token)
// Tries /api/admin/me then falls back to /api/auth/me
export async function me() {
  try {
    return await req("/api/admin/me", { method: "GET", auth: true });
  } catch (e) {
    if (e?.status === 404 || e?.status === 405) {
      try {
        return await req("/api/auth/me", { method: "GET", auth: true });
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function logout() {
  // Best-effort server logout if present
  try {
    await req("/api/admin/logout", { method: "POST", auth: true });
  } catch {}
  try {
    await req("/api/auth/logout", { method: "POST", auth: true });
  } catch {}
  AdminToken.clear();
}

// -------------------------------------------
// Tours API
// -------------------------------------------
export function listTours() {
  return req("/api/tours", { method: "GET" });
}
export function getTour(key) {
  return req(`/api/tours/${encodeURIComponent(key)}`, { method: "GET" });
}
export function getTourTitles() {
  return req("/api/tours/titles", { method: "GET" });
}
export function saveTour(payload) {
  return req("/api/tours", { method: "POST", json: payload, auth: true });
}
export function deleteTour(key) {
  return req(`/api/tours/${encodeURIComponent(key)}`, {
    method: "DELETE",
    auth: true,
  });
}

// -------------------------------------------
// Uploads
// -------------------------------------------
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  return req("/api/upload", { method: "POST", formData: fd, auth: true });
}

// -------------------------------------------
// Memories API
// -------------------------------------------
export function listMemoryTags() {
  return req("/api/memories/tags", { method: "GET" });
}
export function listMemories(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.tag) qs.set("tag", params.tag);
  if (typeof params.pinned === "boolean")
    qs.set("pinned", params.pinned ? "true" : "false");
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));
  const path = `/api/memories${qs.toString() ? `?${qs.toString()}` : ""}`;
  return req(path, { method: "GET" });
}
export function getMemory(id) {
  return req(`/api/memories/${encodeURIComponent(id)}`, { method: "GET" });
}
export function saveMemory(payload) {
  const body = {
    title: payload.title,
    place: payload.place || null,
    img:
      /^https?:\/\//i.test(payload.img) ||
      /^\/(images|assets|static)\//i.test(payload.img)
        ? payload.img
        : String(payload.img || "").replace(/^\/?(api\/uploads\/|uploads\/)/i, ""),
    caption: payload.caption || null,
    pin:
      payload.pin === "" ||
      payload.pin == null
        ? null
        : Number(payload.pin),
    tag: payload.tag || null,
  };
  if (payload.id) {
    return req(`/api/memories/${encodeURIComponent(payload.id)}`, {
      method: "PUT",
      json: body,
      auth: true,
    });
  }
  return req("/api/memories", { method: "POST", json: body, auth: true });
}
export function deleteMemory(id) {
  return req(`/api/memories/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}

// -------------------------------------------
// Testimonials API
// -------------------------------------------
export function listTestimonials(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.minRating != null) qs.set("minRating", params.minRating);
  if (params.sort) qs.set("sort", params.sort); // "recent" | "top"
  if (params.source) qs.set("source", params.source); // site|google|tripadvisor|facebook
  if (params.limit) qs.set("limit", params.limit);
  if (params.offset) qs.set("offset", params.offset);
  const s = qs.toString();
  return req(`/api/testimonials${s ? `?${s}` : ""}`, { method: "GET", auth: true });
}
export function getTestimonial(id) {
  return req(`/api/testimonials/${encodeURIComponent(id)}`, { method: "GET", auth: true });
}
function fdFromTestimonial(payload = {}, file) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (v === undefined || v === null) continue;
    fd.append(k, v);
  }
  if (file) fd.append("photo", file); // field name expected by backend
  return fd;
}
export function createTestimonial(payload, file) {
  const fd = fdFromTestimonial(payload, file);
  return req("/api/testimonials", { method: "POST", formData: fd, auth: true });
}
export function updateTestimonial(id, payload, file) {
  const fd = fdFromTestimonial(payload, file);
  return req(`/api/testimonials/${encodeURIComponent(id)}`, {
    method: "PUT",
    formData: fd,
    auth: true,
  });
}
export function deleteTestimonial(id) {
  return req(`/api/testimonials/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}

// -------------------------------------------
// Quotes API
// -------------------------------------------
export function listQuotes({ page = 1, pageSize = 20 } = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return req(`/api/quotes?${qs.toString()}`, { method: "GET", auth: true });
}
export function getQuote(id) {
  return req(`/api/quotes/${encodeURIComponent(id)}`, { method: "GET", auth: true });
}
export function updateQuoteStatus(id, status) {
  return req(`/api/quotes/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    json: { status },
    auth: true,
  });
}

// -------------------------------------------
// Misc
// -------------------------------------------
export function health() {
  return req("/api/health", { method: "GET" });
}

export { req };
