import axios from "axios";
import { Platform } from "react-native";
import { storage } from "../storage";

export const TOKEN_KEY = "infoagua_token";

/**
 *   Android Emulator  → http://10.0.2.2:3000/v1 
 *   iOS Simulator/Web → http://localhost:3000/v1
 *   Physical device   → set EXPO_PUBLIC_API_URL in .env
 */
function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/v1";
  }
  return "http://localhost:3000/v1";
}

const BASE_URL = resolveBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

type UnauthorizedListener = () => void;

let unauthorizedListener: UnauthorizedListener | null = null;

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListener = listener;
}

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API Response] ${response.status} <- ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}` +
        ` | status: ${error.response?.status ?? "network"}` +
        ` | message: ${error.message}`
      );
    }
    if (error.response?.status === 401) {
      await storage.deleteItem(TOKEN_KEY);
      unauthorizedListener?.();
    }
    return Promise.reject(error);
  }
);
