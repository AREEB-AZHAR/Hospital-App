import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const useSecure = Platform.OS !== "web";

async function setItem(key, value) {
  if (useSecure) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function getItem(key) {
  if (useSecure) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function deleteItem(key) {
  if (useSecure) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

export async function saveSession(token, user, refreshToken) {
  if (token) await setItem(TOKEN_KEY, token);
  if (user) await setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) await setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function saveToken(token) {
  if (token) await setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return getItem(TOKEN_KEY);
}

export async function getRefreshToken() {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function getStoredUser() {
  const raw = await getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearSession() {
  await Promise.all([
    deleteItem(TOKEN_KEY),
    deleteItem(USER_KEY),
    deleteItem(REFRESH_TOKEN_KEY),
  ]);
}
