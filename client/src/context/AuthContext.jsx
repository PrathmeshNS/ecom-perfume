import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth.service";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await authService.getMe();
      setUser(data.data.user);
    } catch {
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const addAddress = async (addressData) => {
    const { data } = await authService.addAddress(addressData);
    setUser((prev) => ({ ...prev, addresses: data.data.addresses }));
    return data.data.addresses;
  };

  const deleteAddress = async (addressId) => {
    const { data } = await authService.deleteAddress(addressId);
    setUser((prev) => ({ ...prev, addresses: data.data.addresses }));
    return data.data.addresses;
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        addAddress,
        deleteAddress,
        isAdmin,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
