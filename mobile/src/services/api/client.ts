import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "infoagua_token";

/**
 *   Android Emulator  → http://10.0.2.2:3000/v1
 *   Dispositivo real  → http://192.168.x.x:3000/v1
 *   iOS Simulator     → http://localhost:3000/v1
 */
const BASE_URL = "http://192.168.0.2:3000/v1";

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
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API Request] ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} <- ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} | Message: ${error.message} | Data:`,
      error.response?.data
    );
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      unauthorizedListener?.();
    }
    return Promise.reject(error);
  }
);
