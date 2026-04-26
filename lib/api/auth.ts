import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin" | string;
  status: string;
  isEmailVerified: boolean;
}

export interface SignInResponse {
  success: true;
  token: string;
  user: AdminUser;
}

export interface SessionResponse {
  success: true;
  user: AdminUser;
}

export async function signIn(body: {
  email: string;
  password: string;
}): Promise<SignInResponse> {
  const { data } = await apiClient.post<SignInResponse>("/auth/signin", body);
  return data;
}

export async function getSession(): Promise<SessionResponse> {
  const { data } = await apiClient.get<SessionResponse>("/auth/session");
  return data;
}

export async function signOut(): Promise<void> {
  await apiClient.post("/auth/signout").catch(() => {
    // swallow — we clear local state regardless
  });
}
