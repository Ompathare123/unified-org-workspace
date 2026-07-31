import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  organizations: Organization[];
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization) => void;
  login: (token: string, user: User, orgs: Organization[]) => void;
  register: (token: string, user: User, org: Organization) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrgState] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const res = await api.get("/auth/me");
        const userData = res.data;
        const orgsList: Organization[] = userData.organizations || [];
        
        setUser(userData);
        setOrganizations(orgsList);
        localStorage.setItem("orgs", JSON.stringify(orgsList));

        const savedActive = localStorage.getItem("activeOrgId");
        let found = orgsList.find((o) => o.id === savedActive) || orgsList[0] || null;
        setActiveOrgState(found);
        if (found) {
          api.defaults.headers.common["x-organization-id"] = found.id;
          localStorage.setItem("activeOrgId", found.id);
        }
      } catch {
        logout();
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshAuth();
      setLoading(false);
    };

    initAuth();
  }, []);

  const setActiveOrg = (org: Organization) => {
    setActiveOrgState(org);
    localStorage.setItem("activeOrgId", org.id);
    api.defaults.headers.common["x-organization-id"] = org.id;
  };

  const login = (newToken: string, newUser: User, orgs: Organization[]) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("orgs", JSON.stringify(orgs));
    setToken(newToken);
    setUser(newUser);
    setOrganizations(orgs);
    if (orgs.length > 0) {
      setActiveOrg(orgs[0]);
    }
  };

  const register = (newToken: string, newUser: User, org: Organization) => {
    const orgs = [org];
    localStorage.setItem("token", newToken);
    localStorage.setItem("orgs", JSON.stringify(orgs));
    setToken(newToken);
    setUser(newUser);
    setOrganizations(orgs);
    setActiveOrg(org);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("orgs");
    localStorage.removeItem("activeOrgId");
    delete api.defaults.headers.common["x-organization-id"];
    setToken(null);
    setUser(null);
    setOrganizations([]);
    setActiveOrgState(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        organizations,
        activeOrg,
        setActiveOrg,
        login,
        register,
        logout,
        refreshAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
