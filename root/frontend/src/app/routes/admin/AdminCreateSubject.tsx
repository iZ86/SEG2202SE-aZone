import AdminNavbar from "@components/admin/AdminNavbar";
import SubjectForm from "@features/admin/components/SubjectForm";

export default function AdminCreateSubject() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="subjects" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <SubjectForm type="Add" />
      </main>
    </div>
  );
}
