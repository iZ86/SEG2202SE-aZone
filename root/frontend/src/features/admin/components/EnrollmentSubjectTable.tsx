import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import {
  deleteEnrollmentSubjectByIdAPI,
  getAllEnrollmentSubjectsAPI,
} from "../api/enrollments";
import type { EnrollmentSubject } from "@datatypes/enrollmentType";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";
import { toast } from "react-toastify";

export default function EnrollmentSubjectTable() {
  const [enrollmentSubjects, setEnrollmentSubjects] = useState<
    EnrollmentSubject[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  const getAllEnrollmentSubjects = useCallback(
    async (token: string, page: number = 1) => {
      const response: Response | undefined = await getAllEnrollmentSubjectsAPI(
        token,
        pageSize,
        page,
        searchTerm
      );

      if (!response || !response.ok) {
        setEnrollmentSubjects([]);
        return;
      }

      const { data } = await response.json();

      if (!data || data.enrollmentSubjects.length === 0) {
        setEnrollmentSubjects([]);
        return;
      }

      setEnrollmentSubjects(data.enrollmentSubjects);
      setTotalPages(Math.ceil(data.enrollmentSubjectCount / pageSize));
    },
    [searchTerm, pageSize]
  );

  useEffect(() => {
    if (!authToken) return;
    getAllEnrollmentSubjects(authToken, currentPage);
  }, [authToken, currentPage, getAllEnrollmentSubjects]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = async (enrollmentSubjectId: number) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Enrollment Subject ID ${enrollmentSubjectId}?`
    );
    if (!confirmDelete) return;

    const response = await deleteEnrollmentSubjectByIdAPI(
      authToken,
      enrollmentSubjectId
    );
    if (response && response.ok) {
      navigate("/admin/enrollment-subjects");
      getAllEnrollmentSubjects(authToken, currentPage);
      toast.success(`Deleted Enrollment Subject ${enrollmentSubjectId}`);
      return;
    } else {
      toast.error(`Failed to delete enrollment subject ${enrollmentSubjectId}`);
      return;
    }
  };

  return (
    <>
      <div className="items-center space-x-4 mt-4 sm:flex">
        <input
          type="text"
          placeholder="Search with Enrollment Subject ID, Subject Name, or Lecturer Name..."
          className="w-full sm:w-0 sm:grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="mt-4 sm:mt-0">
          <SmallButton
            buttonText="Create New Enrollment Subject"
            backgroundColor="bg-blue-500"
            hoverBgColor="hover:bg-blue-600"
            link="/admin/enrollment-subjects/create"
            textColor="text-white"
            submit={false}
          />
        </div>
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-72 overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">
                    Enrollment Subject ID
                  </th>
                  <th className="px-6 py-4 font-medium">Subject Name</th>
                  <th className="px-6 py-4 font-medium">Subject Code</th>
                  <th className="px-6 py-4 font-medium">Lecturer Name</th>
                  <th className="px-6 py-4 font-medium">Enrollment Period</th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                  <th className="px-6 py-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrollmentSubjects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      No enrollment subject found.
                    </td>
                  </tr>
                )}
                {enrollmentSubjects.map((enrollmentSubject) => (
                  <tr
                    key={`${enrollmentSubject.enrollmentSubjectId}`}
                    className="text-sm"
                  >
                    <td className="px-6 py-5">
                      {enrollmentSubject.enrollmentSubjectId}
                    </td>
                    <td className="px-6 py-5">
                      {enrollmentSubject.subjectName}
                    </td>
                    <td className="px-6 py-5">
                      {enrollmentSubject.subjectCode}
                    </td>
                    <td className="px-6 py-5">
                      {(enrollmentSubject.lecturerTitle === "None"
                        ? ""
                        : enrollmentSubject.lecturerTitle + " ") +
                        enrollmentSubject.lastName +
                        " " +
                        enrollmentSubject.firstName}
                    </td>
                    <td className="px-6 py-5">
                      {new Date(
                        enrollmentSubject.enrollmentStartDateTime
                      ).toLocaleString() +
                        " - " +
                        new Date(
                          enrollmentSubject.enrollmentEndDateTime
                        ).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/enrollment-subjects/${enrollmentSubject.enrollmentSubjectId}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <button
                        onClick={() =>
                          handleDelete(enrollmentSubject.enrollmentSubjectId)
                        }
                        className="text-red-600 hover:text-red-500 hover:underline cursor-pointer"
                      >
                        <Trash2 size={16} className="inline-block ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages && (
          <div className="mt-4 flex justify-end">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </>
  );
}
