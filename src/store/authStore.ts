import { create } from "zustand";
import { AuthUser, syncProfileFromAuthUser } from "../lib/auth";
import { removeToken } from "../lib/tokenStorage";
import { useAppStore } from "./appStore";

interface AuthState {
  user: AuthUser | null;
  isInitialized: boolean;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  setUser: (user) => {
    if (user) {
      syncProfileFromAuthUser(user);
    }
    set({ user });
  },

  signOut: async () => {
    await removeToken();
    set({ user: null });
    // Reset user profile and data in app store
    useAppStore.getState().setUser({
      name: "Kisan Ji",
      email: "",
      phone: "",
      location: "Maharashtra, India",
    });
    // Clear chat state and user identity so nothing bleeds into the next session
    useAppStore.getState().setActiveConversationId(null);
    useAppStore.setState({
      crops: [],
      fields: [],
      scanHistory: [],
      chatHistory: [],
      currentUserId: null,
    });
  },
}));
