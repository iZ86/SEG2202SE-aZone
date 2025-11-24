import { useContext } from "react";
import type { User } from "@datatypes/userType";
import { createContext } from "react";

type AdminContextType = {
  authToken: string;
  admin: User | null;
  loading: boolean;
};

export const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error("useAdmin must be used inside AdminProvider");
  return adminContext;
}
