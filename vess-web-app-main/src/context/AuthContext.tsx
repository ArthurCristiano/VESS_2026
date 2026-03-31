import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../services/api";
import { User } from "../services/AuthService";

type RegisterData = {
  username: string;
  email: string;
  password?: string;
  institution: string;
  country: string;
  state: string;
  city: string;
  admin?: boolean;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (userData: RegisterData) => Promise<void>;
  logoutUser: () => void;
  updateUserContext: (updatedUserData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromStorage() {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          const { data: userData } = await api.get('/users/me');
          setToken(storedToken);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Falha ao validar token, limpando sessão.", error);
          localStorage.clear();
          delete api.defaults.headers.common["Authorization"];
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    loadUserFromStorage();
  }, []);

  const loginUser = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", {
      username: email,
      password,
    });
    setToken(data.token);
    setUser(data.user);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const registerUser = async (userData: RegisterData) => {
    await api.post("/auth/register", userData);
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUserContext = (updatedUserData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}