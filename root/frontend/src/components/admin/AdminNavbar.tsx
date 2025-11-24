import UserNavbar from "@components/UserNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminNavbar({ page }: { page: string }) {
  return (
    <UserNavbar userRole={2}>
      <AdminSidebar page={page} />
    </UserNavbar>
  );
}
