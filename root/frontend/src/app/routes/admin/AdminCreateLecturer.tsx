import AdminNavbar from "@components/admin/AdminNavbar";
import LecturerForm from "@features/admin/components/LecturerForm";

export default function AdminCreateLecturer() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="lecturers" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <LecturerForm type="Add" />
      </main>
    </div>
  );
}
