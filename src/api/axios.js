import axios from "axios";

const localApiUrl = "http://localhost:5000/api";
const apiBaseURL = import.meta.env.VITE_API_URL || localApiUrl;

export const isApiConfigured = Boolean(import.meta.env.VITE_API_URL) || import.meta.env.DEV;

export const getAuthErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;

  if (!isApiConfigured) {
    return "Backend URL is not configured. Set VITE_API_URL in your frontend deployment.";
  }

  if (error.request) {
    return "Unable to reach the chat server. Please check the backend deployment and CORS settings.";
  }

  return fallback;
};

const api = axios.create({
  baseURL: apiBaseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("soket-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
