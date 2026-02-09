import { Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAllStudentsAPI } from "../api/students";
import { Link } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import type { User } from "@datatypes/userType";
import { getAllAdminsAPI } from "../api/admins";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";

export default function UserTable({ activeTab }: { activeTab: User["role"] }) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const { authToken, admin, loading } = useAdmin();

  const fetchUsers = useCallback(
    async (token: string, page: number = 1) => {
      let response: Response | undefined;

      switch (activeTab) {
        case "Student":
          response = await getAllStudentsAPI(token, pageSize, page, searchTerm);
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
    [activeTab, searchTerm, pageSize],
  );

  useEffect(() => {
    if (!authToken) return;
    fetchUsers(authToken, currentPage);
  }, [authToken, currentPage, fetchUsers]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <>
      <div className="items-center space-x-4 mt-4 sm:flex">
        <input
          type="text"
          placeholder={`${
            activeTab === "Student"
              ? "Search with Student ID, name, or email..."
              : "Search with Admin ID, name, or email..."
          }`}
          className="w-full sm:w-0 sm:grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {activeTab === "Student" && (
          <div className="mt-4 sm:mt-0">
            <SmallButton
              buttonText="Create New Student"
              backgroundColor="bg-blue-500"
              hoverBgColor="hover:bg-blue-600"
              link="/admin/users/create"
              textColor="text-white"
              submit={false}
            />
          </div>
        )}
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-72 overflow-y-auto">
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
                      {user.lastName} {user.firstName}
                    </td>
                    <td className="px-6 py-5 text-indigo-600 hover:underline cursor-pointer">
                      {user.email}
                    </td>
                    <td className="px-6 py-5">{user.phoneNumber}</td>
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
