export const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '');

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('btm_auth_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('btm_auth_token');
      }
      const errData = await response.json().catch(() => ({}));
      const error = new Error(errData.detail || errData.error || `HTTP error ${response.status}`);
      error.status = response.status;
      error.data = errData;
      throw error;
    }

    // If 204 No Content
    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    console.error(`API request failed [${url}]:`, err);
    throw err;
  }
}
