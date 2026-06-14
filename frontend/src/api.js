export const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const userId = localStorage.getItem('userId');
  const headers = {
    'Content-Type': 'application/json',
    ...(userId ? { 'x-user-id': userId } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API Error');
  }

  return response.json();
};
