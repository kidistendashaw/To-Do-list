import React, { createContext, useState, useContext, useEffect } from "react";
import apiClient from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (!isExpired) {
          // We need to store the username here. Since we don't have it on reload,
          // we'll have to either store it in localStorage or re-decode it.
          // For simplicity, let's also store the username in localStorage.
          const storedUsername = localStorage.getItem("username");
          setUser({ id: decoded.user_id, username: storedUsername });
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post("/auth/token/", {
        username,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // This is the key change. We store the username from the form.
      localStorage.setItem("username", username);

      const decoded = jwtDecode(access);
      // Now we set the user state with the username we KNOW is correct.
      setUser({ id: decoded.user_id, username: username });

      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username"); // Also clear the username
    setUser(null);
    navigate("/login");
  };

  const value = { user, login, logout, isAuthenticated: !!user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
