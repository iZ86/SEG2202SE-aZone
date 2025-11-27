import AdminNavbar from "@components/admin/AdminNavbar";
import EnrollmentForm from "@features/admin/components/EnrollmentForm";

export default function AdminCreateEnrollment() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="courses" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <EnrollmentForm type="Add" />
      </main>
    </div>
  );
}
