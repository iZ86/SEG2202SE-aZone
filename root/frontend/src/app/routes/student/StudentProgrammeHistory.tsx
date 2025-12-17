import StudentNavbar from "@components/student/StudentNavbar";
import StudentProfileCard from "@features/student/components/ProfileCard";
import StudentProgrammeHistoryTable from "@features/student/components/ProgrammeHistoryTable";

export default function StudentProgrammeHistory() {
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="programme-history" />

      <main className="px-10 py-10 flex-1">
        <h1 className="text-black font-bold">Programme History</h1>
        <div className="mt-4">
          <StudentProfileCard />
        </div>
        <StudentProgrammeHistoryTable />
      </main>
    </div>
  );
}
