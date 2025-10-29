import AdminNavbar from "@components/admin/AdminNavbar";
import SubjectForm from "@features/admin/components/SubjectForm";
import { useParams } from "react-router-dom";

export default function AdminEditSubject() {
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
      <AdminNavbar page="subjects" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <SubjectForm type="Edit" id={idNumber} />
      </main>
    </div>
  );
}
