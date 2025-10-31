import AdminNavbar from "@components/admin/AdminNavbar";
import VenueTable from "@features/admin/components/VenueTable";

export default function AdminVenue() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar page="venues" />

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Venues</h1>
        <VenueTable />
      </main>
    </div>
  );
}
