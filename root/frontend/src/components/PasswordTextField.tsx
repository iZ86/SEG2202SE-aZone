import { useState } from "react";

import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordTextField({
  password,
  onChange,
  invalidPassword,
  placeholder,
  width = "full",
  minWidth = "48",
  maxWidth = "74",
}: {
  password: string;
  onChange: (value: string) => void;
  invalidPassword: boolean;
  placeholder: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}) {
  const [isVisible, setVisible] = useState(false);
  if (password.length === 0 && isVisible) {
    setVisible(false);
  }
  return (
    <div>
      <div
        className={`relative w-${width} max-w-${maxWidth} min-w-${minWidth} text-base text-gray-battleship`}
      >
        <input
          type={isVisible ? "text" : "password"}
          pattern="^.{8,}$" // Regex: at least 8 characters.
          title="Password must be at least 8 characters long."
          minLength={8}
          className={`min-h-12 w-${width} max-w-${maxWidth} rounded-2xl border-2 px-4 outline-hidden peer
                    ${
                      password.length === 0
                        ? invalidPassword
                          ? "border-red-tomato"
                          : "border-gray-battleship focus:border-blue-air-superiority focus:text-blue-air-superiority"
                        : invalidPassword
                        ? "border-red-tomato text-red-tomato"
                        : "border-blue-air-superiority text-blue-air-superiority"
                    }`}
          onChange={(e) => onChange(e.target.value)}
        />

        <div
          className={`flex justify-center items-center gap-x-2 absolute left-3 bg-white px-1 pointer-events-none
                    ${
                      password.length === 0
                        ? `top-3 transition-all peer-focus:-top-3 ${
                            invalidPassword
                              ? "text-red-tomato"
                              : "peer-focus:text-blue-air-superiority"
                          }`
                        : `peer-focus:transition-all -top-3 ${
                            invalidPassword
                              ? "text-red-tomato"
                              : "text-blue-air-superiority"
                          }`
                    }`}
        >
          <Lock />
          <span>{placeholder}</span>
        </div>
        <div
          className={`absolute top-3 right-4 cursor-pointer ${
            invalidPassword ? "text-red-tomato" : "text-blue-air-superiority"
          }`}
        >
          <div
            className={`${
              password.length === 0 || (password.length !== 0 && isVisible)
                ? "hidden"
                : "block"
            }`}
            onClick={() => setVisible(true)}
          >
            <EyeOff />
          </div>
          <div
            className={`${
              password.length === 0 || (password.length !== 0 && !isVisible)
                ? "hidden"
                : "block"
            }`}
            onClick={() => setVisible(false)}
          >
            <Eye />
          </div>
        </div>
      </div>
    </div>
  );
}
