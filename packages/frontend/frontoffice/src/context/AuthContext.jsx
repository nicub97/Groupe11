import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  const login = async (email, password) => {
    await api.get("/sanctum/csrf-cookie");
    const res = await api.post("/login", { email, password });
    const user = res.data.user;

    setUser(user);

    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const completeTutorial = async () => {
    try {
      await api.patch("/user/tutorial");
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
    <AuthContext.Provider value={{ user, login, logout, updateUser, completeTutorial }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
