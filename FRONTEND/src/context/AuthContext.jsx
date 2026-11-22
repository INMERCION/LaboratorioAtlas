import { useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../lib/api";
import { AuthContext } from "./authContextInstance";
import { jwtDecode } from "jwt-decode";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem("role");

    return ["administrador", "editor"].includes(savedRole)
      ? savedRole
      : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async ({ nombre_usuario, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/autenticacion/login", {
        nombre_usuario,
        password,
      });
      const newToken = data?.token;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      setAuthToken(newToken);
      
      // Decodificar el token JWT usando jwt-decode
      let decodedToken = null;
      try {
        decodedToken = jwtDecode(newToken);
      } catch (error) {
        console.error('Error al decodificar JWT:', error);
      }
      
      // Crear objeto user con nombre_usuario y todo el contenido descifrado del token
      const userData = {
        nombre_usuario,
        ...(decodedToken || {})
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      // Si el backend provee rol, léelo; por ahora mantenemos localStorage
      
      // Obtener el rol desde el JWT emitido por el backend
      const rolBackend = decodedToken?.rol?.toLowerCase();

      // Validar el rol recibido
      if (!["administrador", "editor"].includes(rolBackend)) {
        throw new Error("El servidor no proporcionó un rol válido");
      }

      // Actualizar el rol autenticado
      setRole(rolBackend);
      localStorage.setItem("role", rolBackend);

    } finally {
      setLoading(false);
    }
  };

  
  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);

    setAuthToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };


  const value = useMemo(
    () => ({ token, user, role, setRole, loading, login, logout }),
    [token, user, role, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
