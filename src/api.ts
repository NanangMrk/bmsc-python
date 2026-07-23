export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) ||
  (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/api\/?$/, '') : '');

export const API_URL = (import.meta.env.VITE_API_URL as string) || (BACKEND_URL ? `${BACKEND_URL}/api` : '/api');

interface FetchOptions extends RequestInit {
  data?: any;
}

export const api = async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const token = localStorage.getItem('token');

  // Normalize endpoint to prevent double /api/api
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  } else if (cleanEndpoint === '/api') {
    cleanEndpoint = '/';
  }

  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = '/' + cleanEndpoint;
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Do not set Content-Type header when sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.data);
  }

  const url = `${API_URL}${cleanEndpoint}`;
  const response = await fetch(url, config);

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = typeof data === 'object' && data?.message ? data.message : (typeof data === 'string' && data ? data : 'Terjadi kesalahan pada server');
    throw new Error(errorMessage);
  }

  return data as T;
};
