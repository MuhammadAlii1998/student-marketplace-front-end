// Small API client wrapper using fetch and Vite env for base URL
const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';

type RequestInitLike = RequestInit & {
  queryParams?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  // Remove leading slash from path to properly concatenate with BASE_URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Handle relative URLs (like /api) by using window.location.origin as the base
  let fullUrl: string;
  if (BASE_URL.startsWith('/')) {
    fullUrl = `${window.location.origin}${BASE_URL}/${cleanPath}`;
  } else {
    fullUrl = `${BASE_URL}/${cleanPath}`;
  }
  
  const url = new URL(fullUrl);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts?: RequestInitLike
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = buildUrl(path, opts?.queryParams);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...opts,
    });

    if (!res.ok) {
      const text = await res.text();
      let errorMessage = res.statusText;
      let errorData: unknown = null;

      try {
        errorData = JSON.parse(text);
        // Extract the message from common backend response formats
        if (
          errorData &&
          typeof errorData === 'object' &&
          ('message' in errorData || 'error' in errorData || 'msg' in errorData)
        ) {
          const data = errorData as {
            message?: string;
            error?: string;
            msg?: string;
          };
          errorMessage = data.message || data.error || data.msg || text;
        }
      } catch (e) {
        // If not JSON, use the text as is
        errorMessage = text || res.statusText;
      }

      // Create a custom error with additional properties
      const error = new Error(errorMessage) as Error & {
        status: number;
        statusText: string;
        data: unknown;
        isNetworkError: boolean;
      };
      error.status = res.status;
      error.statusText = res.statusText;
      error.data = errorData;
      error.isNetworkError = false;
      throw error;
    }

    // If no content
    if (res.status === 204) return undefined as unknown as T;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text() as unknown as T;
  } catch (error: unknown) {
    // If it's already our custom error, rethrow it
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }

    // Network error or fetch failure
    const networkError = new Error('Network error. Please check your connection.') as Error & {
      status: number;
      isNetworkError: boolean;
    };
    networkError.status = 0;
    networkError.isNetworkError = true;
    throw networkError;
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>('GET', path, undefined, { queryParams: params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
  baseUrl: BASE_URL,
};

export default api;
