import React, { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { getToken, removeToken } from "../lib/tokenStorage";
import apiClient from "../lib/apiClient";
import { AuthUser } from "../lib/auth";

interface Props {
  children: React.ReactNode;
}

/**
 * AuthBootstrap — runs on app launch to restore the user session.
 *
 * Replaces Supabase's getSession() + onAuthStateChange() with:
 *  1. Read the JWT from AsyncStorage
 *  2. If found, call GET /profile/me to validate it
 *  3. If valid → set user in authStore (stays logged in)
 *  4. If missing / expired → clear user (shows Login)
 */
export const AuthBootstrap: React.FC<Props> = ({ children }) => {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setUser = useAuthStore((state) => state.setUser);
  const loadFromStorage = useAppStore((state) => state.loadFromStorage);
  const fetchUserData = useAppStore((state) => state.fetchUserData);
  const setCurrentUserId = useAppStore((state) => state.setCurrentUserId);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await loadFromStorage();

        const token = await getToken();

        if (token) {
          // Validate token by fetching the profile
          const { data } = await apiClient.get<AuthUser>("/profile/me");

          if (isMounted && data) {
            // Set the current user ID first so that loadFromStorage scopes the
            // AsyncStorage key correctly to this user's account.
            setCurrentUserId(data.id);
            // Now load storage using the user's ID to restore only their
            // conversation ID (prevents cross-user chat leakage).
            await loadFromStorage(data.id);
            setUser(data);
            // Pre-fetch crops & scan history
            fetchUserData(data.id).catch((err) =>
              console.warn("[Auth] fetchUserData failed:", err)
            );
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        // Token is invalid or server is unreachable — treat as logged out
        console.warn("[Auth] Bootstrap failed (will show login):", err);
        // A 404/401 means this device has an old token for an account that no
        // longer exists. Clear it so every app launch starts cleanly.
        await removeToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) {
          useAuthStore.setState({ isInitialized: true });
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [loadFromStorage, setUser, fetchUserData, setCurrentUserId]);

  if (!isInitialized) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
};
