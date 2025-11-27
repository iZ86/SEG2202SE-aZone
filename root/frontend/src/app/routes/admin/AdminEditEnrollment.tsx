import AdminNavbar from "@components/admin/AdminNavbar";
import EnrollmentForm from "@features/admin/components/EnrollmentForm";
import { useParams } from "react-router-dom";

export default function AdminEditEnrollment() {
  const { id } = useParams<{ id: string }>();
  let idNumber = 0;

  try {
    if (id) {
      idNumber = parseInt(id);
    }
  } catch (error) {
    console.error("Invalid ID parameter", error);
    idNumber = 0;
  }
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="enrollments" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <EnrollmentForm type="Edit" id={idNumber} />
      </main>
    </div>
  );
}
