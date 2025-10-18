import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import aZoneLogoBlueYinmn from "@images/aZone-logo-blue-yinmn.png";
import PasswordTextField from "@components/PasswordTextField";
import { studentLogin } from "../api/student-login";
import NormalTextField from "@components/NormalTextField";
import HeavyButton from "@components/HeavyButton";
import isStudentId from "../utils/isStudentId";

import { User } from "lucide-react";

/** The login form of the login page. */
export default function LoginForm() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [invalidStudentId, setInvalidStudentId] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const navigate = useNavigate();

  /** Sends a POST request to the login API. */
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isInputValid()) {
      return;
    }

    const response: Response | undefined = await studentLogin(
      studentId,
      password
    );
    if (response) {
      const data = await response.json();

      if (response.status === 200) {
        const token = data.token;

        if (rememberMe) {
          sessionStorage.setItem("aZoneStudentAuthToken", token);
        } else {
          localStorage.setItem("aZoneStudentAuthToken", token);
        }
        navigate("/dashboard");
      } else if (response.status === 403) {
        setInvalidStudentId(true);
        setInvalidPassword(true);
      } else if (response.status === 500) {
        // TODO: Add Internal Error Occurred.
      }
    }

  }

  /** This is used to validate the inputs before sending making a request to the backend. */
  function isInputValid(): boolean {
    let inputValid = true;

    if (!studentId || !isStudentId(studentId)) {
      inputValid = false;
    }

    if (!password) {
      inputValid = false;
    }

    if (invalidStudentId && invalidPassword) {
      inputValid = false;
    }

    if (inputValid === false) {
      setInvalidStudentId(true);
      setInvalidPassword(true);
    }

    return inputValid;
  }

  /** This function is called when the student id input is changed. */
  function onChangeStudentId(studentId: string): void {
    setStudentId(studentId);
    setInvalidStudentId(false);
    setInvalidPassword(false);
  }

  /** This function is called when the password input is changed. */
  function onChangePassword(password: string): void {
    setPassword(password);
    setInvalidPassword(false);
    setInvalidStudentId(false);
  }

  return (
    <div className="flex flex-col gap-y-8 justify-center items-center bg-white px-24 py-16 rounded-6xl">
      <img
        src={aZoneLogoBlueYinmn}
        alt="aZone Logo Blue Yinmn"
      />
      <form
        className="flex flex-col gap-y-8 justify-center items-center"
        onSubmit={login}
      >

        <NormalTextField
          text={studentId}
          onChange={onChangeStudentId}
          isInvalid={invalidStudentId}
          Icon={User}
          placeholder={"Student ID"}
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
            {invalidStudentId && invalidPassword ? (
              <p className="text-red-tomato text-base">
                Invalid Student ID and Password
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

        <HeavyButton buttonText="LOG IN" submit={true} />
      </form>
    </div>
  );
}
