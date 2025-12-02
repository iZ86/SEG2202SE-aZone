import StudentNavbar from "@components/student/StudentNavbar";
import StudentProfileCard from "@features/student/components/ProfileCard";

export default function StudentFeeSummary() {
    return (
        <div className="flex flex-col min-h-screen bg-white-antiflash">
            <StudentNavbar page="fees-summary" />

            <main className="px-10 py-10 flex-1">
                <h1 className="text-black font-bold">Fees Summary</h1>

                <div className="mt-4">
                    <StudentProfileCard />
                </div>
            </main>
        </div>
    );
}
