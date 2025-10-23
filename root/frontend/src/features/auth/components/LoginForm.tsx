import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import aZoneLogoBlueYinmn from "@images/aZone-logo-blue-yinmn.png";
import PasswordTextField from "@components/PasswordTextField";
import { loginAPI } from "../api/login";
import NormalTextField from "@components/NormalTextField";
import isUserId from "../utils/isUserId";

import { User } from "lucide-react";
import MediumButton from "@components/MediumButton";

/** Student Login Form. */
export function StudentLoginForm() {
  return <LoginForm userRole={1} />
}

export function AdminLoginForm() {
  return <LoginForm userRole={2} />
}

/** The login form of the login page. */
function LoginForm({ userRole }: { userRole: 1 | 2 }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [invalidUserId, setInvalidUserId] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const navigate = useNavigate();

  /** Sends a POST request to the login API. */
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isInputValid()) {
      return;
    }


    const response: Response | undefined = await loginAPI(
      userId,
      password,
      userRole
    );
    if (response) {
      const data = await response.json();

      if (response.status === 200) {
        const token = data.data.token;
        console.log(token + "hello");
        if (rememberMe) {
          sessionStorage.setItem(userRole === 1 ? "aZoneStudentAuthToken" : "aZoneAdminAuthToken", token);
        } else {
          localStorage.setItem(userRole === 1 ? "aZoneStudentAuthToken" : "aZoneAdminAuthToken", token);
        }
        navigate(userRole === 1 ? "/dashboard" : "/admin/dashboard");
      } else if (response.status === 403) {
        setInvalidUserId(true);
        setInvalidPassword(true);
      } else if (response.status === 500) {
        // TODO: Add Internal Error Occurred.
      }
    }
  }

  /** This is used to validate the inputs before sending making a request to the backend. */
  function isInputValid(): boolean {
    let inputValid = true;

    if (!userId || !isUserId(userId)) {
      inputValid = false;
    }

    if (!password) {
      inputValid = false;
    }

    if (invalidUserId && invalidPassword) {
      inputValid = false;
    }

    if (inputValid === false) {
      setInvalidUserId(true);
      setInvalidPassword(true);
    }

    return inputValid;
  }

  /** This function is called when the user id input is changed. */
  function onChangeUserId(userId: string): void {
    setUserId(userId);
    setInvalidUserId(false);
    setInvalidPassword(false);
  }

  /** This function is called when the password input is changed. */
  function onChangePassword(password: string): void {
    setPassword(password);
    setInvalidPassword(false);
    setInvalidUserId(false);
  }

  return (
    <div className="flex flex-col gap-y-8 justify-center items-center bg-white px-24 py-16 rounded-6xl">
      <img
        src={aZoneLogoBlueYinmn}
        alt="aZone Logo Blue Yinmn"
      />
      {userRole === 2 ? <h1 className="text-blue-yinmn font-bold">ADMIN LOGIN</h1> : undefined}
      <form
        className="flex flex-col gap-y-8"
        onSubmit={login}
      >

        <NormalTextField
          text={userId}
          onChange={onChangeUserId}
          isInvalid={invalidUserId}
          Icon={User}
          placeholder={userRole === 1 ? "Student Id" : "Admin Id"}
          minWidth="74"
        />
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <PasswordTextField
              placeholder={"Password"}
              password={password}
              onChange={onChangePassword}
              invalidPassword={invalidPassword}
            />
            {invalidUserId && invalidPassword ? (
              <p className="text-red-tomato text-base">
                Invalid {userRole === 1 ? "Student" : "Admin"} Id and Password
              </p>
            ) : undefined}
          </div>

          <div className="flex justify-between">
            <label className="flex items-center gap-x-2 text-gray-battleship select-none cursor-pointer">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="border-2 rounded-2xl align-middle w-4 h-4 appearance-none outline-hidden border-gray-battleship checked:bg-gray-battleship cursor-pointer"
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                }}
              />
              <span>
                Remember Me
              </span>
            </label>

            <p className="text-blue-air-superiority">Forgot Password?</p>

          </div>
        </div>

        <MediumButton buttonText="LOG IN" submit={true} />
      </form>
    </div>
  );
}
