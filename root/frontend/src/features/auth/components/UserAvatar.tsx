import { useCallback, useEffect, useState } from "react";
import { getMeAPI } from "@features/auth/api/user";
import { useNavigate } from "react-router-dom";

export default function UserAvatar() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const navigate = useNavigate();

  const getMe = useCallback(
    async (token: string) => {
      const userResponse: Response | undefined = await getMeAPI(token);

      if (!userResponse?.ok) {
        navigate("/login");
        return;
      }

      const { data } = await userResponse.json();

      setFirstName(data.firstName);
      setLastName(data.lastName);
      setProfilePictureUrl(data.profilePictureUrl || "");
    },
    [navigate]
  );

  useEffect(() => {
    const token: string = (localStorage.getItem("aZoneStudentAuthToken") ||
      sessionStorage.getItem("aZoneStudentAuthToken")) as string;

    if (!token) {
      navigate("/login");
      return;
    }

    getMe(token);
  }, [navigate, getMe]);

  return (
    <div className="flex items-center gap-5">
      <p className="font-semibold">{lastName + " " + firstName}</p>
      <img
        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-md cursor-pointer hover:opacity-70 transition-opacity"
        src={profilePictureUrl}
        alt={`${lastName + " " + firstName}'s profile`}
      />
    </div>
  );
}
