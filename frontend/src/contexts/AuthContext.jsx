import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { GOOGLE_CLIENT_ID } from "../config";
import { reconnectSocket, disconnectSocket } from "../sockets/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success) {
            setUser(response.data.user);
          }
        } catch (err) {
          // Token invalid, clear it
          localStorage.removeItem("authToken");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Listen for 401 auth:logout events from axios interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setError(null);
      disconnectSocket();
      navigate("/login");
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [navigate]);

  // Load Google Sign-In script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Register with email/password
  const register = useCallback(async ({ email, password, name }) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.register({ email, password, name });
      if (response.success) {
        localStorage.setItem("authToken", response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      throw new Error(response.error || "Registration failed");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Registration failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login with email/password
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        localStorage.setItem("authToken", response.data.token);
        setUser(response.data.user);
        reconnectSocket();
        return { success: true };
      }
      throw new Error(response.error || "Login failed");
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || "Invalid credentials";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Google OAuth login
  const googleLogin = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID || !window.google) {
      setError("Google Sign-In not configured");
      return { success: false, error: "Google Sign-In not configured" };
    }

    return new Promise((resolve) => {
      setError(null);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (response.credential) {
            setIsLoading(true);
            try {
              const authResponse = await authApi.googleAuth(
                response.credential,
              );
              if (authResponse.success) {
                localStorage.setItem("authToken", authResponse.data.token);
                setUser(authResponse.data.user);
                reconnectSocket();
                resolve({ success: true });
              } else {
                throw new Error(authResponse.error || "Google sign-in failed");
              }
            } catch (err) {
              const message =
                err.response?.data?.error ||
                err.message ||
                "Google sign-in failed";
              setError(message);
              resolve({ success: false, error: message });
            } finally {
              setIsLoading(false);
            }
          } else {
            resolve({ success: false, error: "Google sign-in cancelled" });
          }
        },
      });

      window.google.accounts.id.prompt();
    });
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setUser(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    register,
    login,
    googleLogin,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
