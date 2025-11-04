import AdminNavbar from "@components/admin/AdminNavbar";
import IntakeForm from "@features/admin/components/IntakeForm";

export default function AdminCreateIntake() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="intakes" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <IntakeForm type="Add" />
      </main>
    </div>
  );
}
