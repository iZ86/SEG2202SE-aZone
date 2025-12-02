import LoadingOverlay from "@components/LoadingOverlay";
import { useEffect, useState } from "react";
import { getStudentInformationByIdAPI } from "../api/student";
import { useStudent } from "../hooks/useStudent";
import { toast } from "react-toastify/unstyled";
import type { StudentInformation } from "@datatypes/userType";

export default function StudentProfileCard() {
  const { authToken, student, loading } = useStudent();
  const [information, setInformation] = useState<StudentInformation | null>(
    null
  );

  useEffect(() => {
    async function getAllStudentInformationById() {
      const response = await getStudentInformationByIdAPI(authToken);

      if (!response || !response.ok) {
        setInformation(null);
        toast.error("Failed to fetch student information");
        return;
      }

      const { data } = await response.json();

      if (!data) {
        setInformation(null);
        return;
      }

      setInformation(data);
    }

    if (!student) return;

    getAllStudentInformationById();
  }, [student, authToken]);

  if (loading || !student) {
    return <LoadingOverlay />;
  }
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-4 text-gray-900">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          {student.lastName + " " + student.firstName}'s Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Student ID
          </span>
          <span className="block font-medium">{student.userId}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Email
          </span>
          <span className="block font-medium">{student.email}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Study Mode
          </span>
          <span className="block font-medium">{information?.studyMode}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Intake
          </span>
          <span className="block font-medium">{information?.intake}</span>
        </div>

        <div className="md:col-span-2">
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Course
          </span>
          <span className="block font-medium">{information?.courseName}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Current Semester
          </span>
          <span className="block font-medium">
            Semester {information?.semester}
          </span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Semester Period
          </span>
          <span className="block font-medium">
            {new Date(
              information?.semesterStartDate as Date
            ).toLocaleDateString()}{" "}
            -{" "}
            {new Date(
              information?.semesterEndDate as Date
            ).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
