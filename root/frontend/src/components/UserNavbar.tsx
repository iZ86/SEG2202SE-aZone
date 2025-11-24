import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import aZoneLogoWhite from "@images/aZone-logo-white.png";
import StudentAvatar from "@features/student/components/Avatar";
import AdminAvatar from "@features/admin/components/Avatar";

export default function UserNavbar({
  userRole,
  children,
}: {
  userRole: number;
  children?: React.ReactNode;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const handleSignOut = () => {
    if (userRole === 2) {
      localStorage.removeItem("aZoneAdminAuthToken");
      sessionStorage.removeItem("aZoneAdminAuthToken");
      navigate("/admin/login");
    } else {
      localStorage.removeItem("aZoneStudentAuthToken");
      sessionStorage.removeItem("aZoneStudentAuthToken");
      navigate("/login");
    }
  };
  return (
    <nav className="flex items-center justify-between bg-blue-yinmn px-8 py-2 text-white shadow-md">
      <div
        className={`fixed inset-0 transition-opacity duration-300 z-40 ${
          isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsDropdownOpen(false)}
      />
      <div className="flex items-center gap-x-8">
        {children}
        <img src={aZoneLogoWhite} alt="aZone White Logo" />
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none"
        >
          {userRole === 2 ? <AdminAvatar /> : <StudentAvatar />}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-blue-yinmn rounded-md shadow-lg z-50 border border-gray-200 tex-white font-medium">
            <Link
              to={`${userRole === 2 ? "/admin/profile" : "/profile"}`}
              onClick={() => setIsDropdownOpen(false)}
              className="block px-4 py-2 hover:bg-blue-air-superiority transition-colors rounded-t-md"
            >
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 hover:bg-blue-air-superiority transition-colors rounded-b-md"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
