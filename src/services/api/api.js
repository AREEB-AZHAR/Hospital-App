import { NativeModules, Platform } from "react-native";
import { getToken } from "../storage";

const CURRENT_IP = "192.168.2.124";

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

async function request(url, options = {}) {
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
