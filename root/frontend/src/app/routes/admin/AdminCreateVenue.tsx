import AdminNavbar from "@components/admin/AdminNavbar";
import VenueForm from "@features/admin/components/VenueForm";

export default function AdminCreateVenue() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="venues" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <VenueForm type="Add" />
      </main>
    </div>
  );
}
