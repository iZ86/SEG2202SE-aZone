import { useContext } from "react";
import type { User } from "@datatypes/userType";
import { createContext } from "react";

type StudentContextType = {
  authToken: string;
  student: User | null;
  loading: boolean;
};

export const StudentContext = createContext<StudentContextType | null>(null);

export function useStudent() {
  const studentContext = useContext(StudentContext);
  if (!studentContext) throw new Error("useStudent must be used inside StudentProvider");
  return studentContext;
}
