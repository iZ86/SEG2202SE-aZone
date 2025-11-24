import { useStudent } from "../hooks/useStudent";
import LoadingOverlay from "@components/LoadingOverlay";

export default function Avatar() {
  const { student, loading } = useStudent();

  if (loading || !student) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex items-center gap-5">
      <p className="font-semibold">
        {student.lastName + " " + student.firstName}
      </p>
      <img
        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-md cursor-pointer hover:opacity-70 transition-opacity"
        src={student.profilePictureUrl}
        alt={`${student.lastName + " " + student.firstName}'s profile`}
      />
    </div>
  );
}
