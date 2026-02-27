export const API_URL = "http://localhost:4000";

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return res.json();
}