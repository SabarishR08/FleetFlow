"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fleetflow.role") as UserRole | null;
    if (stored) {
      setRole(stored);
    } else {
      // Set default role to Fleet Manager
      const defaultRole: UserRole = "Fleet Manager";
      setRole(defaultRole);
      localStorage.setItem("fleetflow.role", defaultRole);
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("fleetflow.role", newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
}
