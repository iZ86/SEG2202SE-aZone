import AdminNavbar from "@components/admin/AdminNavbar";
import EnrollmentTable from "@features/admin/components/EnrollmentTable";

export default function AdminEnrollment() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="enrollments" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Enrollment Periods</h1>
        <EnrollmentTable />
      </main>
    </div>
  );
}
