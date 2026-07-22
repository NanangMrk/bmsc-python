export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

interface FetchOptions extends RequestInit {
  data?: any;
}

export const api = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Parse JSON response
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data?.message || data || 'Terjadi kesalahan pada server');
  }

  return data as T;
};
