import { storageKeys } from "./storage";
import { AuthUser } from "@/types/auth";

export function persistSession(token: string, user: AuthUser) {
  localStorage.setItem(storageKeys.token, token);
  localStorage.setItem(storageKeys.user, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.user);
}

export function getAccessToken() {
  return localStorage.getItem(storageKeys.token);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(storageKeys.user);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}
