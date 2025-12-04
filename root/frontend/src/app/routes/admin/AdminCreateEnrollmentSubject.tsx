import AdminNavbar from "@components/admin/AdminNavbar";
import EnrollmentSubjectForm from "@features/admin/components/EnrollmentSubjectForm";

export default function AdminCreateEnrollmentSubject() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="enrollment-subjects" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <EnrollmentSubjectForm type="Add" />
      </main>
    </div>
  );
}
