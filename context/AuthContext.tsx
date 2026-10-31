"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getUser(value: unknown): AuthenticatedUser | null {
  if (!isRecord(value) || !isRecord(value.data) || !isRecord(value.data.user)) {
    return null;
  }

  const user = value.data.user;
  if (
    typeof user.id !== "string" ||
    typeof user.fullName !== "string" ||
    typeof user.email !== "string" ||
    typeof user.role !== "string"
  ) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

function getResponseMessage(value: unknown): string | null {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const initialCheck = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!initialCheck.current) {
      initialCheck.current = fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store",
      })
        .then(async (response) => {
          if (response.status === 401) {
            setUser(null);
            return;
          }
          if (!response.ok) {
            throw new Error("Session verification failed");
          }

          const responseBody: unknown = await response.json();
          const authenticatedUser = getUser(responseBody);
          if (!authenticatedUser) {
            throw new Error("Session response was invalid");
          }

          setUser(authenticatedUser);
        })
        .catch(() => {
          setUser(null);
          setAuthError("We couldn't verify your session. Please sign in again.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);

    let response: Response;
    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("Unable to connect. Please try again.");
    }

    let responseBody: unknown = null;
    try {
      responseBody = await response.json();
    } catch {
      if (response.ok) {
        throw new Error("Unable to sign in. Please try again.");
      }
    }

    if (!response.ok) {
      const backendMessage = getResponseMessage(responseBody);
      if (response.status < 500 && backendMessage) {
        throw new Error(backendMessage);
      }
      throw new Error("Unable to sign in right now. Please try again.");
    }

    const authenticatedUser = getUser(responseBody);
    if (!authenticatedUser) {
      throw new Error("Unable to sign in. Please try again.");
    }

    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(async () => {
    let failureMessage: string | null = null;
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        let responseBody: unknown = null;
        try {
          responseBody = await response.json();
        } catch {
          responseBody = null;
        }
        failureMessage =
          response.status < 500
            ? getResponseMessage(responseBody) ??
              "Unable to confirm logout. Please try again."
            : "Unable to confirm logout. Please try again.";
      }
    } catch {
      failureMessage = "Unable to confirm logout. Please try again.";
    } finally {
      setUser(null);
      setAuthError(failureMessage);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      authError,
      login,
      logout,
    }),
    [user, isLoading, authError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
