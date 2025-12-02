import { useEffect, useState } from "react";
import Pagination from "../../../components/Pagination";
import SubjectFilterBar from "./SemesterFilterBar";
import { useStudent } from "../hooks/useStudent";
import LoadingOverlay from "@components/LoadingOverlay";
import { getAllStudentEnrollmentSubjectByIdAPI } from "../api/student";
import { toast } from "react-toastify";
import type { EnrollmentSubject } from "@datatypes/enrollmentType";

export default function SubjectListingTable() {
  const { authToken, student, loading } = useStudent();
  const [subjects, setSubjects] = useState<EnrollmentSubject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSemester, setSelectedSemester] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  useEffect(() => {
    async function getAllStudentEnrollmentSubjectById() {
      const response = await getAllStudentEnrollmentSubjectByIdAPI(
        authToken,
        selectedSemester,
        pageSize,
        currentPage,
        searchTerm
      );

      if (!response || !response.ok) {
        setSubjects([]);
        toast.error("Failed to fetch subjects");
        return;
      }

      const { data } = await response.json();

      if (!data.subjects || data.subjects.length === 0) {
        setSubjects([]);
        return;
      }

      setSubjects(data.subjects);
      setTotalPages(Math.ceil(data.subjectCount / pageSize));
    }

    if (!student) return;

    getAllStudentEnrollmentSubjectById();
  }, [student, authToken, selectedSemester, currentPage, searchTerm, pageSize]);

  if (loading || !student) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Exempted":
        return (
          <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full">
            EXEMPTED
          </span>
        );
      case "Active":
        return (
          <span className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-full">
            ACTIVE
          </span>
        );
      case "Completed":
        return (
          <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 rounded-full">
            COMPLETED
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <section>
      <SubjectFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedSemester={selectedSemester}
        onSemesterChange={(val) => {
          setSelectedSemester(parseInt(val));
          setCurrentPage(1);
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr className="text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Subject Code</th>
                <th className="px-6 py-4 font-semibold">Subject Name</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Credit Hours
                </th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No subjects found for this semester.
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr
                    key={subject.subjectId}
                    className="text-sm hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-5 font-mono text-blue-600 font-medium">
                      {subject.subjectCode}
                    </td>
                    <td className="px-6 py-5 font-medium">
                      {subject.subjectName}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {subject.creditHours}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(subject.subjectStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
}
