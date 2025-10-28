import AdminNavbar from "@components/admin/AdminNavbar";
import type { User } from "@datatypes/userType";
import UserTable from "@features/admin/components/UserTable";
import { useState } from "react";

export default function AdminUser() {
  const [activeTab, setActiveTab] = useState<User["role"]>("Student");
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="users" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
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
        <UserTable activeTab={activeTab} />
      </main>
    </div>
  );
}
