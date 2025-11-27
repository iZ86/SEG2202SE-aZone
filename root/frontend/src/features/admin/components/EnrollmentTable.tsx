import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import {
  deleteEnrollmentByIdAPI,
  getAllEnrollmentsAPI,
} from "../api/enrollments";
import type { Enrollment } from "@datatypes/enrollmentType";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";
import { toast } from "react-toastify";

export default function EnrollmentTable() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  const fetchEnrollments = useCallback(
    async (token: string, page: number = 1) => {
      const response: Response | undefined = await getAllEnrollmentsAPI(
        token,
        pageSize,
        page,
        searchTerm
      );

      if (!response || !response.ok) {
        setEnrollments([]);
        return;
      }

      const { data } = await response.json();

      if (!data.enrollments || data.enrollments.length === 0) {
        setEnrollments([]);
        return;
      }

      setEnrollments(data.enrollments);
      setTotalPages(Math.ceil(data.enrollmentCount / pageSize));
    },
    [searchTerm, pageSize]
  );

  useEffect(() => {
    if (!authToken) return;
    fetchEnrollments(authToken, currentPage);
  }, [authToken, currentPage, fetchEnrollments]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = async (enrollmentId: number) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Enrollment ID ${enrollmentId}?`
    );
    if (!confirmDelete) return;

    const response = await deleteEnrollmentByIdAPI(authToken, enrollmentId);
    if (response && response.ok) {
      navigate("/admin/enrollments");
      fetchEnrollments(authToken, currentPage);
      toast.success(`Deleted enrollent period ${enrollmentId}`);
      return;
    } else {
      toast.error(`Failed to delete enrollment period ${enrollmentId}`);
      return;
    }
  };

  return (
    <>
      <div className="flex items-center space-x-4 mt-4">
        <input
          type="text"
          placeholder="Search with Enrollment ID..."
          className="grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <SmallButton
          buttonText="Create New Enrollment Period"
          backgroundColor="bg-blue-500"
          hoverBgColor="hover:bg-blue-600"
          link="/admin/enrollments/create"
          textColor="text-white"
          submit={false}
        />
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-[300px] overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Enrollment ID</th>
                  <th className="px-6 py-4 font-medium">
                    Enrollment Start Date & Time
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Enrollment End Date & Time
                  </th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                  <th className="px-6 py-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No enrollment found.
                    </td>
                  </tr>
                )}
                {enrollments.map((enrollment) => (
                  <tr key={`${enrollment.enrollmentId}`} className="text-sm">
                    <td className="px-6 py-5">{enrollment.enrollmentId}</td>
                    <td className="px-6 py-5">
                      {new Date(
                        enrollment.enrollmentStartDateTime
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      {new Date(
                        enrollment.enrollmentEndDateTime
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/enrollments/${enrollment.enrollmentId}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <button
                        onClick={() => handleDelete(enrollment.enrollmentId)}
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
