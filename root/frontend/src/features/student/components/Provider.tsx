import { useEffect, useState, type ReactNode } from "react";
import { getMeAPI } from "@features/general/api/user";
import type { User } from "@datatypes/userType";
import { StudentContext } from "../hooks/useStudent";
import { Navigate } from "react-router-dom";

export default function Provider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState("");
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      const token =
        localStorage.getItem("aZoneStudentAuthToken") ||
        sessionStorage.getItem("aZoneStudentAuthToken");

      if (!token) {
        <Navigate to={"/login"} replace />;
        return;
      }

      setAuthToken(token);

      const response = await getMeAPI(token);

      if (!response || !response.ok) {
        console.error("Failed to fetch student");

        <Navigate to={"/login"} replace />;
        return;
      }

      const { data } = await response.json();

      setStudent(data);
      setLoading(false);
    }

    fetchStudent();
  }, []);

  return (
    <StudentContext.Provider value={{ authToken, student, loading }}>
      {children}
    </StudentContext.Provider>
  );
}
