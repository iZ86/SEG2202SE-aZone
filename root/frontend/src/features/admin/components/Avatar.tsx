import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";

export default function Avatar() {
  const { admin, loading } = useAdmin();

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex items-center gap-5">
      <p className="font-semibold">{admin.lastName + " " + admin.firstName}</p>
      <img
        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-md cursor-pointer hover:opacity-70 transition-opacity"
        src={admin.profilePictureUrl}
        alt={`${admin.lastName + " " + admin.firstName}'s profile`}
      />
    </div>
  );
}
