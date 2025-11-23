import StudentNavbar from "@components/student/StudentNavbar";
import ProfileForm from "@features/auth/components/ProfileForm";

export default function StudentProfile() {
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="dashboard" />
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">Edit Student Profile</h1>
        <ProfileForm userRole="Student" />
      </main>
    </div>
  );
}
