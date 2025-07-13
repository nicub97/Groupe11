import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    await api.get("/sanctum/csrf-cookie");
    const res = await api.post("/login", { email, password });
    const user = res.data.user;

    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      setUser(null);
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
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, completeTutorial }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
