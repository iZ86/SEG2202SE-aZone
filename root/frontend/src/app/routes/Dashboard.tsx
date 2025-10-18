

/** Use these components. */
import SubjectInformationPanel from "@features/subjects/components/SubjectInformationPanel";
import StudentInformationPanel from "@features/student/components/StudentInformationPanel";
import TimetablePanel from "@features/timetable/components/TimetablePanel";
import StudentNavbar from "@components/student/StudentNavbar";

/** TBD: A042 */
export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="dashboard" />
      <div>
        {/** TODO: Fill in this with the appropriate components. */}
      </div>

    </div>
  );
}
