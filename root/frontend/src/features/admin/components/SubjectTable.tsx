import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import type { Subject } from "@datatypes/subjectType";
import { deleteSubjectByIdAPI, getAllSubjectsAPI } from "../api/subjects";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";
import { toast } from "react-toastify";

export default function SubjectTable() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  const fetchSubjects = useCallback(
    async (token: string, page: number = 1) => {
      const response: Response | undefined = await getAllSubjectsAPI(
        token,
        pageSize,
        page,
        searchTerm
      );

      if (!response || !response.ok) {
        setSubjects([]);
        return;
      }

      const { data } = await response.json();

      if (!data.subjects || data.subjects.length === 0) {
        setSubjects([]);
        return;
      }

      setSubjects(data.subjects);
      setTotalPages(Math.ceil(data.subjectCount / pageSize));
    },
    [searchTerm, pageSize]
  );

  useEffect(() => {
    if (!authToken) return;
    fetchSubjects(authToken, currentPage);
  }, [authToken, currentPage, fetchSubjects]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = async (subjectId: number) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Subject ID ${subjectId}?`
    );
    if (!confirmDelete) return;

    const response = await deleteSubjectByIdAPI(authToken, subjectId);
    if (response && response.ok) {
      navigate("/admin/subjects");
      fetchSubjects(authToken, currentPage);
      toast.success(`Deleted subject ${subjectId}`);
      return;
    } else {
      toast.error(`Failed to delete subject ${subjectId}`);
      return;
    }
  };

  return (
    <>
      <div className="items-center space-x-4 mt-4 sm:flex">
        <input
          type="text"
          placeholder="Search with Subject ID, Subject Name, or Subject Code..."
          className="w-full sm:w-0 sm:grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="mt-4 sm:mt-0">
          <SmallButton
            buttonText="Create New Subject"
            backgroundColor="bg-blue-500"
            hoverBgColor="hover:bg-blue-600"
            link="/admin/subjects/create"
            textColor="text-white"
            submit={false}
          />
        </div>
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-[300px] overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Subject ID</th>
                  <th className="px-6 py-4 font-medium">Subject Name</th>
                  <th className="px-6 py-4 font-medium">Subject Code</th>
                  <th className="px-6 py-4 font-medium">Credit Hours</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                  <th className="px-6 py-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No subject found.
                    </td>
                  </tr>
                )}
                {subjects.map((subject) => (
                  <tr key={`${subject.subjectId}`} className="text-sm">
                    <td className="px-6 py-5">{subject.subjectId}</td>
                    <td className="px-6 py-5">{subject.subjectName}</td>
                    <td className="px-6 py-5">{subject.subjectCode}</td>
                    <td className="px-6 py-5">{subject.creditHours}</td>
                    <td className="px-6 py-5">{subject.description}</td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/subjects/${subject.subjectId}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <button
                        onClick={() => handleDelete(subject.subjectId)}
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
