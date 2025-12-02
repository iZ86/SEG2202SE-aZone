import StudentNavbar from "@components/student/StudentNavbar";
import StudentSubjectListingTable from "@features/student/components/SubjectListingTable";
import StudentProfileCard from "@features/student/components/ProfileCard";

export default function StudentSubjectListing() {
    return (
        <div className="flex flex-col min-h-screen bg-white-antiflash">
            <StudentNavbar page="subject-listing" />

      <main className="px-10 py-10 flex-1">
        <h1 className="text-black font-bold">Subject Listing</h1>

                <div className="mt-4">
                    <StudentProfileCard />
                </div>
                <StudentSubjectListingTable />
            </main>
        </div>
    );
}
