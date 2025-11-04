import axios from 'axios';

/**
 * Cache API Client - No authentication required
 * Used to clear backend Redis cache
 */
const cacheClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_WEB_BASE_URL as string}/api/v1/cache`,
});

/**
 * Cache API service for managing backend cache
 */
export const cacheApi = {
  /**
   * Clear all cache entries
   * @returns Promise with deletion result
   */
  clearAll: async () => {
    const response = await cacheClient.delete('/all');
    return response.data;
  },

  /**
   * Clear specific cache key
   * @param key - The cache key to clear
   * @returns Promise with deletion result
   */
  clearByKey: async (key: string) => {
    const response = await cacheClient.delete('/key', {
      data: { key }
    });
    return response.data;
  },

  /**
   * Clear cache entries matching a pattern
   * @param pattern - The pattern to match (e.g., "barbers*")
   * @returns Promise with deletion result
   */
  clearByPattern: async (pattern: string) => {
    const response = await cacheClient.delete('/pattern', {
      data: { pattern }
    });
    return response.data;
  },

  /**
   * Get cache statistics
   * @returns Promise with cache stats
   */
  getStats: async () => {
    const response = await cacheClient.get('/stats');
    return response.data;
  }
};

export default cacheApi;
