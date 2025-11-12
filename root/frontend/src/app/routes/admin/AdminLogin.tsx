import { AdminLoginForm } from "@features/auth/components/LoginForm";
import { AdminError500Panel } from "@components/admin/AdminErrorComponent";
import { useState } from "react";


/** TBD: A042 */
export default function AdminLogin() {
  const [error500, setError500] = useState(false);
  return (
    <div className="flex min-h-screen bg-white-antiflash font-poppins justify-center items-center">
      
      {error500 ? <AdminError500Panel /> :
        <AdminLoginForm setError500={setError500} />
      }
    </div>
  );
}
