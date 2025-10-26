/**
 * Simplified API client with no duplicate calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Session endpoints
  createSession: (username, password) =>
    fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  registerSession: (username, password) =>
    fetchAPI('/sessions/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getCurrentSession: async () => {
    // Special handling for session check - 401 is expected when not logged in
    const url = `${API_BASE_URL}/sessions/me`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      // Not logged in is expected, return null
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },

  logout: () =>
    fetchAPI('/sessions', {
      method: 'DELETE',
    }),

  // Tank endpoints
  listTanks: () => fetchAPI('/tanks'),

  createTank: (name) =>
    fetchAPI('/tanks', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getTank: (tankId) => fetchAPI(`/tanks/${tankId}`),

  deleteTank: (tankId) =>
    fetchAPI(`/tanks/${tankId}`, {
      method: 'DELETE',
    }),

  // Fish endpoints (tank-specific)
  addFish: (tankId, fishData) =>
    fetchAPI(`/tanks/${tankId}/fish`, {
      method: 'POST',
      body: JSON.stringify(fishData),
    }),

  deleteFish: (tankId, fishId) =>
    fetchAPI(`/tanks/${tankId}/fish/${fishId}`, {
      method: 'DELETE',
    }),
};

