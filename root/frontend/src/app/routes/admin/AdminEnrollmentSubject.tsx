import AdminNavbar from "@components/admin/AdminNavbar";
import EnrollmentSubjectTable from "@features/admin/components/EnrollmentSubjectTable";

export default function AdminEnrollmentSubject() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="enrollment-subjects" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">
          Enrollment Subjects
        </h1>
        <EnrollmentSubjectTable />
      </main>
    </div>
  );
}
