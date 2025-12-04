import AdminNavbar from "@components/admin/AdminNavbar";
import ProgrammeIntakeTable from "@features/admin/components/ProgrammeIntakeTable";

export default function AdminProgrammeIntake() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="programme-intakes" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Programme Intakes</h1>
        <ProgrammeIntakeTable />
      </main>
    </div>
  );
}
