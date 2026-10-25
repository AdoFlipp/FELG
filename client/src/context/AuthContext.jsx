import { createContext, useContext, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("felg_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("felg_token");
  });

  console.log("FELG authentication check:", {
  hasToken: Boolean(token),
  hasUser: Boolean(user),
});

  const register = async (userData) => {
    const data = await api.register(userData);

    localStorage.setItem("felg_token", data.token);
    localStorage.setItem("felg_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const login = async (credentials) => {
    const data = await api.login(credentials);

    localStorage.setItem("felg_token", data.token);
    localStorage.setItem("felg_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("felg_token");
    localStorage.removeItem("felg_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}