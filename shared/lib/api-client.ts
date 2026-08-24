import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("meeting-intel-token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("meeting-intel-token");
      }
    }

    return Promise.reject(
      error.response?.data ?? {
        message: error.message ?? "Request failed",
      },
    );
  },
);

export const getApiClient = () => apiClient;

export const api = apiClient;
export type { AxiosRequestConfig };
