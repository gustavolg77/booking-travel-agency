export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
