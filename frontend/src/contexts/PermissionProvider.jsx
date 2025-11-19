import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { API_ENDPOINTS } from "../config";
import { PermissionContext } from "./PermissionContext";

// Provider Component
export function PermissionProvider({ children }) {
  const { user, isAuthenticated } = useAuthContext();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch permissions when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions();
    } else {
      setPermissions([]);
    }
  }, [isAuthenticated, user]);

  // Function to fetch user permissions from backend
  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(API_ENDPOINTS.PERMISSIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract permission names and store them
        const permissionNames = data.map((p) => p.name);
        setPermissions(permissionNames);
        // Cache in localStorage
        localStorage.setItem("permissions", JSON.stringify(permissionNames));
      } else if (response.status === 403) {
        // User doesn't have permission to view all permissions
        // Try to get permissions from localStorage
        const cached = localStorage.getItem("permissions");
        if (cached) {
          setPermissions(JSON.parse(cached));
        }
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError(err.message);
      // Fallback to cached permissions
      const cached = localStorage.getItem("permissions");
      if (cached) {
        setPermissions(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function: Check if user has a specific permission
  const hasPermission = (permissionName) => {
    if (!isAuthenticated) return false;
    return permissions.includes(permissionName);
  };

  // Helper function: Check if user has ANY of the given permissions
  const hasAnyPermission = (permissionNames) => {
    if (!isAuthenticated) return false;
    return permissionNames.some((p) => permissions.includes(p));
  };

  // Helper function: Check if user has ALL of the given permissions
  const hasAllPermissions = (permissionNames) => {
    if (!isAuthenticated) return false;
    return permissionNames.every((p) => permissions.includes(p));
  };

  // Helper function: Check if user is Admin
  const isAdmin = () => {
    if (!isAuthenticated || !user) return false;
    // Admin users have all CRUD permissions
    return permissions.includes("users.read");
  };

  // Context value
  const value = {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}
