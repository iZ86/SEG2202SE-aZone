import AdminNavbar from "@components/admin/AdminNavbar";
import LecturerForm from "@features/admin/components/LecturerForm";
import { useParams } from "react-router-dom";

export default function AdminEditLecturer() {
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
      <AdminNavbar page="lecturers" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <LecturerForm type="Edit" id={idNumber} />
      </main>
    </div>
  );
}
