import AdminNavbar from "@components/admin/AdminNavbar";
import UserForm from "@features/admin/components/UserForm";

export default function AdminCreateUser() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="users" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <UserForm type="Add" />
      </main>
    </div>
  );
}
