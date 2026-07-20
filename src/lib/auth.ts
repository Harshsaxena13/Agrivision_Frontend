import apiClient from "./apiClient";
import { saveToken, removeToken } from "./tokenStorage";
import { useAppStore } from "../store/appStore";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  location: string;
  role: string;
  farmingExperience: string;
  cropType: string;
  avatarUri: string | null;
  landArea: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Sign up a new user and return an authenticated session. */
export async function signup(params: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  role?: "farmer" | "researcher";
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", params);
  await saveToken(data.token);
  syncProfileFromAuthUser(data.user);
  return data;
}

/**
 * Sign in an existing verified user. Saves the JWT and syncs the profile.
 */
export async function login(params: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", params);
  await saveToken(data.token);
  syncProfileFromAuthUser(data.user);
  return data;
}

/**
 * Sign out — remove token and clear local store.
 */
export async function logout(): Promise<void> {
  await removeToken();
}

/**
 * Request a password reset email (stubbed on the server side for now).
 */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

/**
 * Sync an AuthUser into the Zustand app store's user profile.
 */
export function syncProfileFromAuthUser(user: AuthUser): void {
  useAppStore.getState().setUser({
    name: user.fullName || "Farmer",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "India",
    landArea: user.landArea || "Not specified",
    farmingExperience: user.farmingExperience || "",
    cropType: user.cropType || "",
    avatarUri: user.avatarUri ?? undefined,
    crops: user.cropType ? [user.cropType] : undefined,
  });
}
