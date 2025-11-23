import StudentNavbar from "@components/student/StudentNavbar";
import StudentProgrammeTable from "@features/student/components/ProgrammeHistoryTable";

export default function StudentProgramme() {
    return (
        <div className="flex flex-col min-h-screen bg-white-antiflash">
            <StudentNavbar page="programmes" />

            <main className="px-10 py-10 flex-1">
                <h1 className="text-black font-bold">Programme History</h1>
                <StudentProgrammeTable />
            </main>
        </div>
    );
}