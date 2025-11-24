import SubjectInformationPanel from "@features/subjects/components/SubjectInformationPanel";
import Timetable from "@features/timetable/components/Timetable";
import StudentNavbar from "@components/student/StudentNavbar";
import SmallButton from "@components/SmallButton";
import InformationPanel from "@features/student/components/InformationPanel";


function TimetablePanel() {
  
  return (
    <div className="bg-white shadow-lg rounded-md p-7">
      <div className="text-black flex flex-col sm:flex-row justify-between mb-8">
        <h2 className="text-black font-bold">
          My Weekly Timetable (13 October 2025 - 17 October 2025)
        </h2>
        <div className="flex mt-4 sm:mt-0">
          <button className="bg-[#E5E5E5] px-6 rounded-l-2xl hover:bg-gray-100 cursor-pointer">
            Previous
          </button>
          <button className="bg-[#E5E5E5] px-4 py-3 hover:bg-gray-100 cursor-pointer">
            Current Week
          </button>
          <button className="bg-[#E5E5E5] px-6 rounded-r-2xl hover:bg-gray-100 cursor-pointer">
            Next
          </button>
        </div>
      </div>

      <Timetable headerBgColor="bg-white-antiflash"/>
    </div>
  );
}

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
          <InformationPanel />
        </div>
        <div className="mt-4">
          <TimetablePanel />
        </div>
      </main>
    </div>
  );
}
