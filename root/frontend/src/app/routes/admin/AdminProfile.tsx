import AdminNavbar from "@components/admin/AdminNavbar";
import ProfileForm from "@features/admin/components/ProfileForm";

export default function AdminProfile() {
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <AdminNavbar page="" />
      <main className="px-6 py-6 flex-1">
        <h1 className="text-3xl font-bold text-slate-900">
          Edit Your Profile
        </h1>
        <ProfileForm />
      </main>
    </div>
  );
}
