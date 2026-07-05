import LoadingOverlay from "@components/LoadingOverlay";
import Navbar from "@components/Navbar";
import SideBar from "@components/Sidebar";
import type { NavbarItem, NavItem } from "@datatypes/navItemType";
import { useAdmin } from "@features/admin/hooks/useAdmin";

export default function AdminNavbar({ page }: { page: string }) {

  const { admin, loading } = useAdmin();

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const navbarItems: NavbarItem = {
    dashboard: { label: "Dashboard", to: "/admin" },
    profile: { label: "Profile", to: "/admin/profile" },
    settings: { label: "Settings", to: "/admin/settings" },
    signOut: { label: "Sign Out", to: "/admin/login" }
  }

  const navItems: NavItem[] = [
    {
      to: "/admin",
      label: "Dashboard",
      key: "dashboard",
    },
    {
      to: "/admin/users",
      label: "Users",
      key: "users",
    },
    {
      to: "/admin/programmes",
      label: "Programmes",
      key: "programmes",
    },
    {
      to: "/admin/programme-intakes",
      label: "Programme Intakes",
      key: "programme-intakes",
    },
    {
      to: "/admin/courses",
      label: "Courses",
      key: "courses",
    },
    {
      to: "/admin/subjects",
      label: "Subjects",
      key: "subjects",
    },
    {
      to: "/admin/intakes",
      label: "Intakes",
      key: "intakes",
    },
    {
      to: "/admin/enrollments",
      label: "Enrollment Periods",
      key: "enrollments",
    },
    {
      to: "/admin/enrollment-subjects",
      label: "Enrollment Subjects",
      key: "enrollment-subjects",
    },
    {
      to: "/admin/lecturers",
      label: "Lecturers",
      key: "lecturers",
    },
    {
      to: "/admin/venues",
      label: "Venues",
      key: "venues",
    },
  ]


  const handleSignOut = () => {
    localStorage.removeItem("aZoneAdminAuthToken");
    sessionStorage.removeItem("aZoneAdminAuthToken");
  };

  return (
    <Navbar page={page} user={admin} navItems={navbarItems} handleSignOut={handleSignOut}>
      <SideBar page={page} navItems={navItems} />
    </Navbar>
  );
}
