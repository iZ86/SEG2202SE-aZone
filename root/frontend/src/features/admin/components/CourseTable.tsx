import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "@components/Pagination";
import SmallButton from "@components/SmallButton";
import { deleteCourseByIdAPI, getAllCoursesAPI } from "../api/courses";
import type { CourseProgramme } from "@datatypes/courseType";
import { useAdmin } from "../hooks/useAdmin";
import LoadingOverlay from "@components/LoadingOverlay";
import { toast } from "react-toastify";

export default function CourseTable() {
  const [courses, setCourses] = useState<CourseProgramme[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const navigate = useNavigate();
  const { authToken, admin, loading } = useAdmin();

  const fetchCourses = useCallback(
    async (token: string, page: number = 1) => {
      const response: Response | undefined = await getAllCoursesAPI(
        token,
        pageSize,
        page,
        searchTerm,
      );

      if (!response || !response.ok) {
        setCourses([]);
        return;
      }

      const { data } = await response.json();

      if (!data.courses || data.courses.length === 0) {
        setCourses([]);
        return;
      }

      setCourses(data.courses);
      setTotalPages(Math.ceil(data.courseCount / pageSize));
    },
    [searchTerm, pageSize],
  );

  useEffect(() => {
    if (!authToken) return;
    fetchCourses(authToken, currentPage);
  }, [authToken, currentPage, fetchCourses]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleDelete = async (courseId: number) => {
    if (!authToken) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Course ID ${courseId}?`,
    );
    if (!confirmDelete) return;

    const response = await deleteCourseByIdAPI(authToken, courseId);
    if (response && response.ok) {
      navigate("/admin/courses");
      fetchCourses(authToken, currentPage);
      toast.success(`Deleted Course ${courseId}`);
      return;
    } else {
      toast.error(`Failed to delete course ${courseId}`);
      return;
    }
  };

  return (
    <>
      <div className="items-center space-x-4 mt-4 sm:flex">
        <input
          type="text"
          placeholder="Search with Course ID, Course Name, or Course Code..."
          className="w-full sm:w-0 sm:grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="mt-4 sm:mt-0">
          <SmallButton
            buttonText="Create New Course"
            backgroundColor="bg-blue-500"
            hoverBgColor="hover:bg-blue-600"
            link="/admin/courses/create"
            textColor="text-white"
            submit={false}
          />
        </div>
      </div>

      <section className="mt-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-75 overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="text-sm">
                  <th className="px-6 py-4 font-medium">Course ID</th>
                  <th className="px-6 py-4 font-medium">Course Name</th>
                  <th className="px-6 py-4 font-medium">Course Code</th>
                  <th className="px-6 py-4 font-medium">Programme Name</th>
                  <th className="px-6 py-4 font-medium">Edit</th>
                  <th className="px-6 py-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No course found.
                    </td>
                  </tr>
                )}
                {courses.map((course) => (
                  <tr key={`${course.courseId}`} className="text-sm">
                    <td className="px-6 py-5">{course.courseId}</td>
                    <td className="px-6 py-5">{course.courseName}</td>
                    <td className="px-6 py-5">{course.courseCode}</td>
                    <td className="px-6 py-5">{course.programmeName}</td>
                    <td className="px-6 py-5 text-slate-500">
                      <Link
                        to={`/admin/courses/${course.courseId}/edit`}
                        className="text-indigo-600 hover:text-indigo-500 hover:underline"
                      >
                        <Pencil size={16} className="inline-block ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      <button
                        onClick={() => handleDelete(course.courseId)}
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
