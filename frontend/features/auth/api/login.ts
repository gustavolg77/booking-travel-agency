import { apiFetch } from "@/lib/api";
import { LoginResponse } from "@/types/auth";

interface LoginPayload {
  email: string;
  password: string;
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
