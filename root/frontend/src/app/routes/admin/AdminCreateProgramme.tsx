import AdminNavbar from "@components/admin/AdminNavbar";
import ProgrammeForm from "@features/admin/components/ProgrammeForm";

export default function AdminCreateProgramme() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="programmes" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <ProgrammeForm type="Add" />
      </main>
    </div>
  );
}
