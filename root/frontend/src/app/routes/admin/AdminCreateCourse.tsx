import AdminNavbar from "@components/admin/AdminNavbar";
import CourseForm from "@features/admin/components/CourseForm";

export default function AdminCreateCourse() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="courses" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <CourseForm type="Add" />
      </main>
    </div>
  );
}
