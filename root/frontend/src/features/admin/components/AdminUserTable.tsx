import { Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getAllAdminsAPI,
  getAllStudentCourseProgrammeIntakesAPI,
} from "../api/admin-users";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import type { User } from "@datatypes/userType";

export default function AdminUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<User["role"]>("Student");
  const [searchTerm, setSearchTerm] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize: number = 15;
  const navigate = useNavigate();

  const fetchUsers = useCallback(
    async (token: string, page: number = 1) => {
      let response: Response | undefined;

      switch (activeTab) {
        case "Student":
          response = await getAllStudentCourseProgrammeIntakesAPI(
            token,
            pageSize,
            page,
            searchTerm
          );
          break;
        case "Admin":
          response = await getAllAdminsAPI(token, pageSize, page, searchTerm);
          break;
      }

      if (!response || !response.ok) {
        setUsers([]);
        return;
      }

      const { data } = await response.json();

      if (!data.users || data.users.length === 0) {
        setUsers([]);
        return;
      }

      setUsers(data.users);
      setTotalPages(Math.ceil(data.userCount / pageSize));
    },
    [activeTab, searchTerm]
  );

  useEffect(() => {
    const token: string = (localStorage.getItem("aZoneAdminAuthToken") ||
      sessionStorage.getItem("aZoneAdminAuthToken")) as string;

    if (!token) {
      navigate("/admin/login");
      return;
    }
    setAuthToken(token);
  }, [fetchUsers, navigate]);

  useEffect(() => {
    if (!authToken) return;
    fetchUsers(authToken, currentPage);
  }, [authToken, currentPage, fetchUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* Role filtering controls */}
      <div className="flex space-x-8 border-b border-gray-300 mt-6">
        {(["Student", "Admin"] as User["role"][]).map((role) => (
          <button
            key={role}
            className={`pb-2 font-semibold cursor-pointer ${
              activeTab === role
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(role)}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4 mt-4">
        <input
          type="text"
          placeholder={`${
            activeTab === "Student"
              ? "Search with Student ID, name, email or course name..."
              : "Search with Admin ID, name or email..."
          }`}
          className="grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <SmallButton
          buttonText="Create New Student"
          backgroundColor="bg-blue-500"
          hoverBgColor="hover:bg-blue-600"
          link="/admin/users/create"
          textColor="text-white"
          submit={false}
        />
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-[300px] overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  {activeTab === "Student" ? (
                    <th className="px-6 py-4 font-medium">Student ID</th>
                  ) : (
                    <th className="px-6 py-4 font-medium">Admin ID</th>
                  )}
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Phone Number</th>
                  {activeTab === "Student" ? (
                    <>
                      <th className="px-6 py-4 font-medium">Course</th>
                      <th className="px-6 py-4 font-medium">
                        Semester - Intake
                      </th>
                    </>
                  ) : null}
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={`${user.email}`} className="text-sm">
                    <td className="px-6 py-5">{user.userId}</td>
                    <td className="px-6 py-5">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-5 text-indigo-600 hover:underline cursor-pointer">
                      {user.email}
                    </td>
                    <td className="px-6 py-5">{user.phoneNumber}</td>
                    {activeTab === "Student" ? (
                      <>
                        <td className="px-6 py-5">{user.courseName}</td>
                        <td className="px-6 py-5">
                          {user.semester} - {user.intakeId}
                        </td>
                      </>
                    ) : null}
                    <td className="px-6 py-5">
                      <span
                        className={`font-bold px-4 py-2 ${
                          user.userStatus
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        } rounded-xl`}
                      >
                        {user.userStatus ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/users/${user.userId}/edit${
                          activeTab === "Student" ? "" : "?admin=true"
                        }`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages && (
          <div className="mt-4 flex justify-end">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </>
  );
}
