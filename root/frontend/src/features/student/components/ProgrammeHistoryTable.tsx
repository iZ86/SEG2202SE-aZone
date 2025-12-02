import { useEffect, useState } from "react";
import { getStudentCourseProgrammeIntakeByStudentIdAPI } from "@features/admin/api/students";
import { useStudent } from "../hooks/useStudent";
import { toast } from "react-toastify";
import LoadingOverlay from "@components/LoadingOverlay";

interface StudentProgrammeHistory {
  studentId: number;
  courseId: number;
  courseName: string;
  programmeIntakeId: number;
  programmeId: number;
  programmeName: string;
  intakeId: number;
  semester: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  courseStatus: number;
  status: string;
}

export default function StudentProgrammeHistoryTable() {
  const { authToken, student, loading } = useStudent();
  const [programmeHistories, setProgrammeHistories] = useState<
    StudentProgrammeHistory[] | []
  >([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProgrammeHistories = programmeHistories.filter((ph) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const programme = (ph.programmeName || "")
      .toString()
      .replace(/\r?\n|\r/g, "")
      .toLowerCase();
    const course = (ph.courseName || "")
      .toString()
      .replace(/\r?\n|\r/g, "")
      .toLowerCase();
    const intake = (ph.intakeId || "").toString().toLowerCase();

    return (
      programme.includes(term) || course.includes(term) || intake.includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
            {status}
          </span>
        );
      case "Finished":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
            {status}
          </span>
        );
      case "Completed":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
            {status}
          </span>
        );
      case "Dropped":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
            {status}
          </span>
        );
      default:
        return status;
    }
  };

  async function getStudentCourseProgrammeIntakeByStudentId(
    token: string,
    studentId: number
  ) {
    const studentCourseProgrammeIntakeResponse: Response | undefined =
      await getStudentCourseProgrammeIntakeByStudentIdAPI(token, studentId);

    if (
      !studentCourseProgrammeIntakeResponse ||
      !studentCourseProgrammeIntakeResponse.ok
    ) {
      setProgrammeHistories([]);
      toast.error("Failed to fetch programme history");
      return;
    }

    const { data } = await studentCourseProgrammeIntakeResponse.json();
    setProgrammeHistories(data);
  }

  useEffect(() => {
    if (!authToken || !student?.userId) return;

    getStudentCourseProgrammeIntakeByStudentId(authToken, student.userId);
  }, [authToken, student?.userId]);

  if (loading || !student) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <div className="flex items-center space-x-2 mt-4 mb-4">
        <div className="flex items-center w-full">
          <input
            type="text"
            placeholder="Search Programme, Course or Intake..."
            className="w-full px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 bg-blue-500 border border-l-0 border-gray-300 rounded-r-md hover:bg-blue-600 cursor-pointer transition font-semibold"
            aria-label="Clear search"
          >
            Clear
          </button>
        </div>
      </div>

      <section>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Programme</th>
                  <th className="px-6 py-4 font-medium">Course Name</th>
                  <th className="px-6 py-4 font-medium">Intake</th>
                  <th className="px-6 py-4 font-medium">Semester</th>
                  <th className="px-6 py-4 font-medium">Semester Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProgrammeHistories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No programme history found.
                    </td>
                  </tr>
                ) : (
                  filteredProgrammeHistories.map(
                    (programmeHistory: StudentProgrammeHistory) => (
                      <tr
                        key={`${programmeHistory.programmeIntakeId}-${programmeHistory.courseId}-${programmeHistory.semester}`}
                        className="text-sm hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-5">
                          {programmeHistory.programmeName}
                        </td>
                        <td className="px-6 py-5 font-medium">
                          {programmeHistory.courseName}
                        </td>
                        <td className="px-6 py-5">
                          {programmeHistory.intakeId}
                        </td>
                        <td className="px-6 py-5">
                          {programmeHistory.semester}
                        </td>
                        <td className="px-6 py-5 text-xs text-slate-500">
                          {new Date(
                            programmeHistory.semesterStartDate
                          ).toLocaleDateString()}{" "}
                          <br /> to
                          <br />
                          {new Date(
                            programmeHistory.semesterEndDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(programmeHistory.status)}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
