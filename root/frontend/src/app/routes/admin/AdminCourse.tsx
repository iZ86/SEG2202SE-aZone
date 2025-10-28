import AdminNavbar from "@components/admin/AdminNavbar";
import CourseTable from "@features/admin/components/CourseTable";

export default function AdminCourse() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="courses" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
        <CourseTable />
      </main>
    </div>
  );
}
