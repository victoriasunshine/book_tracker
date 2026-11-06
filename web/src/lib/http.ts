// Client-side helper for calling this app's own API.
//
// Next.js adds the base path to <Link> and next/image, but NOT to fetch().
// Every browser call to the API goes through here so the prefix lives in one place.
//
// Server components and route handlers should not use this: call the lib/
// functions directly (e.g. lookupBook) instead of fetching your own API.

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const API_ROOT = `${BASE_PATH}/api/v1`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// apiFetch("/search?q=hobbit") -> GET /projects/book-tracker/api/v1/search?q=hobbit
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  // Read the body once; it may be empty (e.g. 204 No Content)
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

// Shorthands for the common cases
export const api = {
  get: <T>(path: string) => apiFetch<T>(path),

  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),

  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),

  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
