import { storageKeys } from "./storage";
import { AuthUser } from "@/types/auth";

export function persistSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(storageKeys.token, token);
  localStorage.setItem(storageKeys.user, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.user);
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(storageKeys.token);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

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
