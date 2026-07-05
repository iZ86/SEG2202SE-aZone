import SideBar from "../Sidebar";
import Navbar from "@components/Navbar";
import { GraduationCap, History, LayoutDashboard } from "lucide-react";
import type { NavbarItem, NavItem } from "@datatypes/navItemType";
import { useStudent } from "@features/student/hooks/useStudent";
import LoadingOverlay from "@components/LoadingOverlay";


export default function StudentNavbar({ page }: { page: string }) {

  const { student, loading } = useStudent();

  if (loading || !student) {
    return <LoadingOverlay />;
  }


  const navbarItems: NavbarItem = {
    dashboard: { label: "Dashboard", to: "/" },
    profile: { label: "Profile", to: "/profile" },
    settings: { label: "Settings", to: "/settings" },
    signOut: { label: "Sign Out", to: "/login" }
  }

  const sideBarItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: "/" },
    { key: 'subject-listing', label: 'Subject Listings', icon: GraduationCap, to: "/subject-listing" },
    { key: 'programme-history', label: 'Programme History', icon: History, to: "/programme-history" }
  ];


  const handleSignOut = () => {
    localStorage.removeItem("aZoneStudentAuthToken");
    sessionStorage.removeItem("aZoneStudentAuthToken");
  };

  return (
    <Navbar page={page} user={student} navItems={navbarItems} handleSignOut={handleSignOut}>
      <SideBar page={page} navItems={sideBarItems} />
    </Navbar>
  );
}