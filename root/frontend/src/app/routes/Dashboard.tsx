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
      <main className="flex-1 p-5 sm:p-10">
        <div className="shadow-lg rounded-lg bg-white">
          <div className="flex justify-between items-center p-4">
            <div>
              <h2 className="text-black font-bold">
                SUBJECT ENROLLMENT OPEN NOW
              </h2>
              <p className="text-gray-500">
                Start Date: 15-OCT-2025 - 25-OCT 2025
              </p>
            </div>
            <SmallButton buttonText="Enroll" link="/enrollment" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-x-5 gap-y-4 sm:gap-y-0 mt-4 w-full">
          <SubjectInformationPanel />
          <StudentInformationPanel />
        </div>
        <div className="mt-4">
          <TimetablePanel />
        </div>
      </main>
    </div>
  );
}
