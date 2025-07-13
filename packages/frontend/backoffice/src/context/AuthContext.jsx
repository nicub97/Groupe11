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

  const login = async (identifiant, password) => {
    await api.get("/sanctum/csrf-cookie", {
      baseURL: api.defaults.baseURL.replace("/api", ""),
    });
    const res = await api.post("/login", { identifiant, password });

    const user = res.data.user;

    // Sécuriser l'accès au backoffice uniquement si l'utilisateur est admin
    if (user.role !== "admin") {
      throw new Error("Accès refusé : vous n'êtes pas administrateur");
    }

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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
