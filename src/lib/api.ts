// Small API client wrapper using fetch and Vite env for base URL
const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";

type RequestInitLike = RequestInit & { queryParams?: Record<string, string | number | boolean | undefined> };

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  // Remove leading slash from path to properly concatenate with BASE_URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fullUrl = `${BASE_URL}/${cleanPath}`;
  const url = new URL(fullUrl);
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function request<T>(method: string, path: string, body?: any, opts?: RequestInitLike): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = buildUrl(path, opts?.queryParams);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || res.statusText;
    try {
      const json = JSON.parse(text);
      message = json.message || JSON.stringify(json);
    } catch (e) {
      // ignore
    }
    throw new Error(`Request failed ${res.status}: ${message}`);
  }

  // If no content
  if (res.status === 204) return undefined as unknown as T;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return (res.text() as unknown) as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>("GET", path, undefined, { queryParams: params }),
  post: <T>(path: string, body?: any) => request<T>("POST", path, body),
  put: <T>(path: string, body?: any) => request<T>("PUT", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  baseUrl: BASE_URL,
};

export default api;
