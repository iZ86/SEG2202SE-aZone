import AdminNavbar from "@components/admin/AdminNavbar";
import AdminProgrammeTable from "@features/admin/components/ProgrammeTable";

export default function AdminProgramme() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="programmes" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Programmes</h1>
        <AdminProgrammeTable />
      </main>
    </div>
  );
}
