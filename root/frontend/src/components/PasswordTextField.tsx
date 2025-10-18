import { useState } from 'react';


import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordTextField({ password, onChange, invalidPassword, placeholder }: { password: string, onChange: Function, invalidPassword: boolean, placeholder: string }) {
  const [isVisible, setVisible] = useState(false)
  if (password.length === 0 && isVisible) {
    setVisible(false);
  }
  return (
    <div>
      <div className="relative text-base text-gray-battleship">
        <input type={isVisible ? "text" : "password"} className={`min-w-74 min-h-12 rounded-2xl border-2 px-4 outline-hidden peer
                    ${password.length === 0 ? (invalidPassword ? "border-red-tomato" : "border-gray-battleship focus:border-blue-air-superiority focus:text-blue-air-superiority")
            : (invalidPassword ? "border-red-tomato text-red-tomato" : "border-blue-air-superiority text-blue-air-superiority")}`}
          onChange={(e) => onChange(e.target.value)} />

        <div className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none
                    ${password.length === 0 ? (`top-3 transition-all peer-focus:-top-3 ${invalidPassword ? "text-red-tomato" : "peer-focus:text-blue-air-superiority"}`)
            : (`peer-focus:transition-all -top-3 ${invalidPassword ? "text-red-tomato" : "text-blue-air-superiority"}`)

          }`}>
          <Lock />
          <span>{placeholder}</span>
        </div>
        <div className={`absolute top-3 right-4 cursor-pointer ${invalidPassword ? "text-red-tomato" : "text-blue-air-superiority"}`}>
          <div className={`${password.length === 0 || (password.length !== 0 && isVisible) ? "hidden" : "block"}`} onClick={() => setVisible(true)}>
            <EyeOff />
          </div>
          <div className={`${password.length === 0 || (password.length !== 0 && !isVisible) ? "hidden" : "block"}`} onClick={() => setVisible(false)}>
            <Eye />
          </div>
        </div>


      </div>
    </div>

  );
}
