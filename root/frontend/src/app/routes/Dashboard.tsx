import SubjectInformationPanel from "@features/subjects/components/SubjectInformationPanel";
import StudentInformationPanel from "@features/student/components/StudentInformationPanel";
import TimetablePanel from "@features/timetable/components/TimetablePanel";
import StudentNavbar from "@components/student/StudentNavbar";
import SmallButton from "@components/SmallButton";

/** TBD: A042 */
export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="dashboard" />
      <div className="shadow-lg m-5 rounded-lg bg-white">
        <div className="flex justify-between items-center m-5 px-2">
          <div>
            <h2 className="text-black font-bold">SUBJECT ENROLLMENT OPEN NOW</h2>
            <p className="text-gray-500">Start Date: 15-OCT-2025 - 25-OCT 2025</p>
          </div>
          <SmallButton buttonText="Enroll" link="/Enrollment" />
        </div>
      </div>
      <div className="flex">
        <SubjectInformationPanel />
        <StudentInformationPanel />
      </div>
      <TimetablePanel />
    </div>
  );
}
