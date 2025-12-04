import AdminNavbar from "@components/admin/AdminNavbar";
import ProgrammeIntakeForm from "@features/admin/components/ProgrammeIntakeForm";

export default function AdminCreateProgrammeIntake() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="courses" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <ProgrammeIntakeForm type="Add" />
      </main>
    </div>
  );
}
