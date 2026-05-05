import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem(
            "access_token"
          );

        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const res = await apiFetch("/api/me");

        if (!res.ok) {
          localStorage.clear();
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    loading,
    isAuthenticated,
  };
};