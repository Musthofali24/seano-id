import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config";

// Create Context
export const AuthContext = createContext(null);

// Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check if user is authenticated
  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", {
        email,
        endpoint: API_ENDPOINTS.AUTH.LOGIN,
      });

      // Send login request as JSON
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log("Login response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Login failed. Please check your credentials.";
        try {
          const error = await response.json();
          console.error("Login error response:", error);

          // Handle array detail (validation errors)
          if (error.detail && Array.isArray(error.detail)) {
            errorMessage = error.detail
              .map((e) => e.msg || e.message || JSON.stringify(e))
              .join(", ");
          } else if (error.detail) {
            errorMessage =
              typeof error.detail === "string"
                ? error.detail
                : JSON.stringify(error.detail);
          } else if (error.message) {
            errorMessage = error.message;
          }
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log("Login successful, got data:", data);

      // Save tokens to localStorage
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // Check if user data is in the response
      if (data.user) {
        // User data is already in login response
        console.log("Got user data from login response:", data.user);
        setUser(data.user);
        navigate("/dashboard");
        return { success: true };
      }

      // If no user in response, try to get it from /auth/me
      const userResponse = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("Got user data from /auth/me:", userData);
        setUser(userData);

        // Redirect to dashboard
        navigate("/dashboard");
        return { success: true };
      }

      // If still no user data, just redirect anyway
      console.log("No user data available, redirecting anyway");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.message || "Network error. Please check your connection.";
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (token) {
        // Call logout endpoint
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear storage and state
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);

      // Redirect to login
      navigate("/auth/login");
    }
  };

  // Context value
  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
