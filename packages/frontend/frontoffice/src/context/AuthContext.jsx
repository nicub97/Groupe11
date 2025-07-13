import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    const token = res.data.token;
    const user = res.data.user;

    setToken(token);
    setUser(user);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await api.post(
        "/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const completeTutorial = async () => {
    try {
      await api.patch(
        "/user/tutorial",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser({ tutorial_done: true });
    } catch (err) {
      console.error("Erreur validation tutoriel:", err);
    }
  };

  // 🔄 mise à jour du user après modification de profil
  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, completeTutorial }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
