/**
 * FILE: api/rules.api.js
 * PURPOSE: Scoring rules API client
 */

import api from "./axios.config";

export const rulesApi = {
  /**
   * Get all scoring rules
   */
  getAll: async () => {
    const response = await api.get("/rules");
    return response.data;
  },

  /**
   * Get single rule by ID
   */
  getById: async (id) => {
    const response = await api.get(`/rules/${id}`);
    return response.data;
  },

  /**
   * Create new scoring rule
   */
  create: async (ruleData) => {
    const response = await api.post("/rules", ruleData);
    return response.data;
  },

  /**
   * Update scoring rule
   */
  update: async (id, ruleData) => {
    const response = await api.put(`/rules/${id}`, ruleData);
    return response.data;
  },

  /**
   * Delete scoring rule
   */
  delete: async (id) => {
    const response = await api.delete(`/rules/${id}`);
    return response.data;
  },
};

export default rulesApi;
