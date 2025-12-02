import { useEffect, useState, type ReactNode } from "react";
import { getMeAPI } from "@features/general/api/user";
import type { User } from "@datatypes/userType";
import { AdminContext } from "../hooks/useAdmin";
import { useNavigate } from "react-router-dom";

export default function Provider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState("");
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAdmin() {
      const token =
        localStorage.getItem("aZoneAdminAuthToken") ||
        sessionStorage.getItem("aZoneAdminAuthToken");

      if (!token) {
        navigate("/admin/login")
        return;
      }

      setAuthToken(token);

      const response = await getMeAPI(token);

      if (!response || !response.ok) {
        console.error("Failed to fetch admin");

        navigate("/admin/login");
        return;
      }

      const { data } = await response.json();

      setAdmin(data);
      setLoading(false);
    }

    fetchAdmin();
  }, [navigate]);

  return (
    <AdminContext.Provider value={{ authToken, admin, loading }}>
      {children}
    </AdminContext.Provider>
  );
}
