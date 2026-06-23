import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { connectSocket, disconnectSocket } from "../socket/socket.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("soket-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("soket-token"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("soket-token")));

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("soket-user", JSON.stringify(data.user));
        connectSocket(token);
      } catch (_error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const persistSession = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem("soket-user", JSON.stringify(payload.user));
    localStorage.setItem("soket-token", payload.token);
    connectSocket(payload.token);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    persistSession(data);
  };

  const signup = async (form) => {
    const { data } = await api.post("/auth/signup", form);
    persistSession(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("soket-user");
    localStorage.removeItem("soket-token");
    disconnectSocket();
  };

  const value = useMemo(() => ({ user, setUser, token, loading, login, signup, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
