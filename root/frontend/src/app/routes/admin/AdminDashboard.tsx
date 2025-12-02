import InformationPanel from "@features/admin/components/InformationPanel";
import AdminNavbar from "../../../components/admin/AdminNavbar";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="dashboard" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-[#4A739C] mt-4">
          Monitor and track important information easily
        </p>

        <InformationPanel />
      </main>
    </div>
  );
}
