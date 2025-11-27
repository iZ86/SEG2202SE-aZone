import { useEffect, useState, type ReactNode } from "react";
import { getMeAPI } from "@features/general/api/user";
import type { User } from "@datatypes/userType";
import { StudentContext } from "../hooks/useStudent";
import { Navigate, useNavigate } from "react-router-dom";

export default function Provider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState("");
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStudent() {
      const token =
        localStorage.getItem("aZoneStudentAuthToken") ||
        sessionStorage.getItem("aZoneStudentAuthToken");

      if (!token) {
        navigate("/login");
        return;
      }

      setAuthToken(token);

      const response = await getMeAPI(token);

      if (!response || !response.ok) {
        console.error("Failed to fetch student");

        navigate("/login");
        return;
      }

      const { data } = await response.json();

      setStudent(data);
      setLoading(false);
    }

    fetchStudent();
  }, [navigate]);

  return (
    <StudentContext.Provider value={{ authToken, student, loading }}>
      {children}
    </StudentContext.Provider>
  );
}
