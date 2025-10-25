import { StudentError500Panel } from "@components/student/StudentErrorComponent";
import { StudentLoginForm } from "@features/auth/components/LoginForm";
import { useState } from "react";



export default function GuestLogin() {
  const [error500, setError500] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-white-antiflash font-poppins justify-center items-center">
      {error500 ? <StudentError500Panel /> :
        <StudentLoginForm setError500={setError500} />
      }
    </div>
  );
}
