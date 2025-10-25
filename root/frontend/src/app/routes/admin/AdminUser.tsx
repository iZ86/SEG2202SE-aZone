import AdminNavbar from "@components/admin/AdminNavbar";
import AdminUserTable from "@features/admin/components/AdminUserTable";

export default function AdminUser() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
          {/* Navbar + Sidebar button */}
          <AdminNavbar page="users"/>

          {/* Main Content */}
          <main className="px-6 py-6 flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Users</h1>
            <AdminUserTable />
          </main>
        </div>
  );
}
