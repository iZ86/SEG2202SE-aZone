import { useStudent } from "../hooks/useStudent";
import LoadingOverlay from "@components/LoadingOverlay";

export default function InformationPanel() {
  const { student, loading } = useStudent();

  const studentInfo = [
    { label: "Programme", value: "Bachelor of Software Engineering" },
    { label: "Intake", value: "202509" },
    { label: "Study Mode", value: "Full Time" },
    { label: "Current Semester", value: "4" },
    { label: "Semester Period", value: "22 Sep 2025 - 16 Jan 2026" },
  ];

  if (loading || !student) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col sm:flex-row text-black p-6 bg-white shadow-lg rounded-lg gap-4 w-full">
      <div className="sm:order-2 sm:m-auto justify-center items-center flex">
        <img
          src={student.profilePictureUrl}
          alt="profile"
          className="w-40 h-50 object-cover rounded-xl mt-3 border-2 border-indigo-400 shadow-md"
        />
      </div>

      <div className="order-1 sm:order-1">
        <h2 className="font-semibold pb-5">
          {student.lastName + " " + student.firstName} ({student.userId})
        </h2>

        <div className="space-y-3">
          {studentInfo.map((info) => (
            <div key={info.label} className="grid grid-cols-3 gap-15">
              <span className="text-gray-600">{info.label}</span>
              <span className="font-medium col-span-2 justify-items-end">
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
