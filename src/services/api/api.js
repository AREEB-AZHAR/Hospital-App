import { NativeModules, Platform } from "react-native";
import { getToken, getRefreshToken, saveToken, clearSession } from "../storage";

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
  onUnauthorizedCallback = callback;
}

const CURRENT_IP = "192.168.1.6";

export function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In development on Android / iOS devices, resolve the Metro host IP automatically
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const host = scriptURL.split("://")[1]?.split("/")[0]?.split(":")[0];
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        return `http://${host}:4000`;
      }
    }
  } catch {
    // fallback
  }

  return `http://${CURRENT_IP}:4000`;
}

export const BASE_URL = getBaseUrl();

async function request(url, options = {}, isRetry = false) {
  const token = await getToken();
  const baseUrl = getBaseUrl();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error(`[API Network Error] Could not connect to ${baseUrl}${url}:`, err.message);
    throw new Error(
      `Network request failed connecting to ${baseUrl}. Make sure your phone and PC are on the same Wi-Fi network.`
    );
  }

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    // 401 Unauthorized handling
    if (res.status === 401) {
      // If we haven't already retried and this isn't an auth endpoint, attempt token refresh
      if (!isRetry && !url.startsWith("/auth/")) {
        try {
          const refreshToken = await getRefreshToken();
          if (refreshToken) {
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData?.token) {
                await saveToken(refreshData.token);
                // Retry with new token
                return request(url, options, true);
              }
            }
          }
        } catch {
          // Refresh failed
        }
      }

      // If refresh failed or was not possible, clear session and notify AuthContext
      try {
        await clearSession();
      } catch {
        // ignore
      }
      if (typeof onUnauthorizedCallback === "function") {
        onUnauthorizedCallback();
      }
    }

    throw new Error(data.message || "API error");
  }

  return data;
}

export const api = {
  health: () => request("/health"),
  get: (url) => request(url),
  post: (url, body) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: (url, body) =>
    request(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (url) =>
    request(url, {
      method: "DELETE",
    }),
};
