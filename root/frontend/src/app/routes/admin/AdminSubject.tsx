import AdminNavbar from "@components/admin/AdminNavbar";
import SubjectTable from "@features/admin/components/SubjectTable";

export default function AdminSubject() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="subjects" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Subjects</h1>
        <SubjectTable />
      </main>
    </div>
  );
}
