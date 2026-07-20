import axios from "axios";
import { getToken } from "./tokenStorage";

// `localhost` is the phone/emulator itself, not the computer running the API.
// Requiring an explicit URL prevents requests from silently being sent to the
// wrong device when an environment file is missing.
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
const API_CONFIGURATION_ERROR =
  "The app API is not configured. Set EXPO_PUBLIC_API_URL and restart Expo.";
const API_TIMEOUT_MS = 120000;

/**
 * Axios instance pre-configured with the backend base URL.
 * Automatically attaches the JWT Bearer token from AsyncStorage
 * to every request via a request interceptor.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  // Render services can take over a minute to wake after being idle. Keep this
  // longer than the cold-start window for uploads and database writes.
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    if (!API_URL) {
      return Promise.reject(new Error(API_CONFIGURATION_ERROR));
    }

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: normalize errors ───────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTimeout =
      error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout");
    const isNetworkError = !error.response && error.message === "Network Error";
    const message =
      error.response?.data?.error ||
      (isTimeout
        ? "The server is taking longer than expected to start. Please try again in a moment."
        : isNetworkError
          ? "Unable to reach the server. Check your internet connection and try again."
          : error.message || "Something went wrong");
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
