import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios interceptor
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("hdv_token");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check for existing session on app start
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem("hdv_token");
        const savedUser = localStorage.getItem("hdv_user");

        if (savedToken && savedUser && savedUser !== "undefined" && savedUser !== "null") {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading saved auth data:", error);
        // Clear invalid data
        localStorage.removeItem("hdv_token");
        localStorage.removeItem("hdv_user");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, authToken) => {
    try {
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("hdv_token", authToken);
      localStorage.setItem("hdv_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hdv_token");
    localStorage.removeItem("hdv_user");
    localStorage.removeItem("hdv_refresh_token")
  };

  const updateUser = (updatedUserData) => {
    try {
      setUser(updatedUserData);
      localStorage.setItem("hdv_user", JSON.stringify(updatedUserData));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
