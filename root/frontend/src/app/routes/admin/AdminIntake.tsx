import AdminNavbar from "@components/admin/AdminNavbar";
import IntakeTable from "@features/admin/components/IntakeTable";

export default function AdminIntake() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="intakes" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Intakes</h1>
        <IntakeTable />
      </main>
    </div>
  );
}
