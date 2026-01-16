/**
 * FILE: src/api/events.api.js
 * PURPOSE: API client for event operations including batch upload
 */

import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const eventsApi = {
  // Submit single event
  create: async (eventData) => {
    const response = await api.post("/events", eventData);
    return response.data;
  },

  // Batch upload events via file
  batchUpload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/events/batch`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
