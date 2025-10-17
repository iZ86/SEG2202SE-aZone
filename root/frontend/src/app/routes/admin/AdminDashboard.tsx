import AdminNavbar from "../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../components/admin/AdminSidebar";

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6">
    <div className="text-slate-500 text-sm mb-2">{label}</div>
    <div className="text-3xl font-semibold">{value}</div>
  </div>
);

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar + Sidebar button */}
      <AdminNavbar>
        <AdminSidebar page="dashboard" />
      </AdminNavbar>

      {/* Main Content */}
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-[#4A739C] mt-4">
          Monitor and track important information easily
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-4">
          <StatCard label="Total Job Postings" value={0} />
          <StatCard label="Active Job Postings" value={0} />
          <StatCard label="Total Users" value={0} />
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Recent Job Postings
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Job Role</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Job Type</th>
                  <th className="px-6 py-4 font-medium">Posted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700"></tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
