/**
 * API Client for Cozy Aquarium Game
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
  // ============================================
  // SESSION ENDPOINTS
  // ============================================
  
  authenticate: (username, password) =>
    fetchAPI('/sessions', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getCurrentSession: async () => {
    const url = `${API_BASE_URL}/sessions/me`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
  },

  logout: () =>
    fetchAPI('/sessions', { method: 'DELETE' }),

  // ============================================
  // GAME STATE ENDPOINTS
  // ============================================
  
  /**
   * Get full game state (tank, fish, gameState, happiness)
   */
  getGameState: () => fetchAPI('/game'),

  /**
   * Update game state (hunger decay, poop generation)
   * Called periodically during active play
   */
  gameTick: () =>
    fetchAPI('/game/tick', { method: 'POST' }),

  /**
   * Feed the tank
   */
  feed: () =>
    fetchAPI('/game/feed', { method: 'POST' }),

  /**
   * Clean all poop from tank
   */
  cleanAll: () =>
    fetchAPI('/game/clean', { method: 'POST' }),

  /**
   * Remove single poop by clicking
   */
  cleanPoop: (poopId) =>
    fetchAPI(`/game/poop/${poopId}`, { method: 'DELETE' }),

  /**
   * Add coins (e.g., from collecting in the lake)
   */
  addCoins: (amount) =>
    fetchAPI(`/game/coins?amount=${amount}`, { method: 'POST' }),

  // ============================================
  // FISH ENDPOINTS
  // ============================================
  
  /**
   * Manually add a fish (for testing/debug)
   */
  addFish: (fishData) =>
    fetchAPI('/fish', {
      method: 'POST',
      body: JSON.stringify(fishData),
    }),

  /**
   * Release a fish from the tank
   */
  releaseFish: (fishId) =>
    fetchAPI(`/fish/${fishId}`, { method: 'DELETE' }),

  /**
   * Apply accessory to a fish
   */
  applyAccessory: (fishId, slot, itemId) =>
    fetchAPI(`/fish/${fishId}/accessory`, {
      method: 'POST',
      body: JSON.stringify({ slot, itemId }),
    }),

  // ============================================
  // FISHING ENDPOINTS
  // ============================================
  
  /**
   * Get fish silhouettes in the lake
   */
  getFishingSpawns: () => fetchAPI('/fishing/spawn'),

  /**
   * Attempt to catch a fish
   * Pass spawn data to ensure caught fish matches silhouette
   */
  attemptCatch: (spawnId, spawnData = {}) => {
    const params = new URLSearchParams();
    if (spawnData.species) params.append('species', spawnData.species);
    if (spawnData.size) params.append('size', spawnData.size);
    if (spawnData.rarity) params.append('rarity', spawnData.rarity);
    const queryString = params.toString();
    const url = `/fishing/catch/${spawnId}${queryString ? '?' + queryString : ''}`;
    return fetchAPI(url, { method: 'POST' });
  },

  /**
   * Keep a caught fish (add to tank)
   */
  keepFish: (fishData) =>
    fetchAPI('/fishing/keep', {
      method: 'POST',
      body: JSON.stringify(fishData),
    }),

  /**
   * Release caught fish for coins
   */
  releaseForCoins: (fishData) =>
    fetchAPI('/fishing/release', {
      method: 'POST',
      body: JSON.stringify(fishData),
    }),

  /**
   * Swap caught fish with one in tank
   */
  swapFish: (caughtFish, releaseFishId) =>
    fetchAPI(`/fishing/swap?release_fish_id=${releaseFishId}`, {
      method: 'POST',
      body: JSON.stringify(caughtFish),
    }),

  // ============================================
  // SHOP ENDPOINTS
  // ============================================
  
  /**
   * Get all shop items with status
   */
  getShopItems: () => fetchAPI('/shop/items'),

  /**
   * Purchase an item
   */
  buyItem: (itemId) =>
    fetchAPI(`/shop/buy/${itemId}`, { method: 'POST' }),

  /**
   * Get owned items by category
   */
  getOwnedItems: () => fetchAPI('/shop/owned'),
};
