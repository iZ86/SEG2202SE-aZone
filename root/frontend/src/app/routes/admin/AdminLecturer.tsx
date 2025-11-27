import AdminNavbar from "@components/admin/AdminNavbar";
import LecturerTable from "@features/admin/components/LecturerTable";

export default function AdminLecturer() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="lecturers" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Lecturers</h1>
        <LecturerTable />
      </main>
    </div>
  );
}
