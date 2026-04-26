import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getSession,
  signOut as apiSignOut,
  type AdminUser,
  type SignInResponse,
} from "@/lib/api/auth";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedSession: boolean;
  isCheckingSession: boolean;
  setAuth: (data: SignInResponse) => void;
  clearAuth: () => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      hasCheckedSession: false,
      isCheckingSession: false,

      setAuth: (data) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("admin-token", data.token);
        }
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          hasCheckedSession: true,
        });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin-token");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          hasCheckedSession: true,
        });
      },

      checkSession: async () => {
        const state = get();

        if (state.isCheckingSession) return;

        if (state.hasCheckedSession && state.user) {
          if (state.isLoading) set({ isLoading: false });
          return;
        }

        if (state.hasCheckedSession && !state.user) {
          set({ hasCheckedSession: false, isLoading: false });
        }

        set({
          isCheckingSession: true,
          hasCheckedSession: true,
          isLoading: true,
        });

        try {
          const session = await getSession();
          set({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            isCheckingSession: false,
          });
        } catch {
          // If /auth/session isn't supported, but we have a persisted token + user,
          // trust them until the next real API call forces a 401 via the interceptor.
          const { token, user } = get();
          if (token && user) {
            set({
              isAuthenticated: true,
              isLoading: false,
              isCheckingSession: false,
            });
            return;
          }

          if (typeof window !== "undefined") {
            localStorage.removeItem("admin-token");
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isCheckingSession: false,
          });
        }
      },

      logout: async () => {
        try {
          await apiSignOut();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem("admin-token");
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedSession: false,
          });
        }
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);

export const selectIsAdmin = (state: AuthState) =>
  state.user?.role === "admin" || state.user?.role === "superadmin";
