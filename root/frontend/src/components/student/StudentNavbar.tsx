import UserNavbar from "@components/UserNavbar";
import StudentSideBar from "./StudentSidebar";


export default function StudentNavbar({page}: {page: string}) {
  return (
    <UserNavbar userRole={1} >
      <StudentSideBar page={page} />
    </UserNavbar>
  );
}