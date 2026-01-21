import LoadingOverlay from "@components/LoadingOverlay";
import { useAdmin } from "../hooks/useAdmin";
import { useEffect, useState } from "react";
import { getStudentsCountAPI } from "../api/students";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCoursesCountAPI } from "../api/courses";
import { getSubjectsCountAPI } from "../api/subjects";
import { getAllEnrollmentsAPI } from "../api/enrollments";
import type { Enrollment } from "@datatypes/enrollmentType";
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getProgrammeDistributionAPI } from "../api/programmes";

export default function InformationPanel() {
  const { authToken, admin, loading } = useAdmin();
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [programmeDistribution, setProgrammeDistribution] = useState<
    { programmeName: string; count: number; percentage: number }[]
  >([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getStudentsCount = async (token: string) => {
      const response: Response | undefined = await getStudentsCountAPI(token);

      if (!response?.ok) {
        navigate("/admin/");
        toast.error("Failed to fetch students count");
        return;
      }

      const { data } = await response.json();

      setStudentsCount(data.studentsCount);
    };

    const getCoursesCount = async (token: string) => {
      const response: Response | undefined = await getCoursesCountAPI(token);

      if (!response?.ok) {
        navigate("/admin/");
        toast.error("Failed to fetch courses count");
        return;
      }

      const { data } = await response.json();

      setCoursesCount(data.coursesCount);
    };

    const getSubjectsCount = async (token: string) => {
      const response: Response | undefined = await getSubjectsCountAPI(token);

      if (!response?.ok) {
        navigate("/admin/");
        toast.error("Failed to fetch subjects count");
        return;
      }

      const { data } = await response.json();

      setSubjectsCount(data.subjectsCount);
    };

    const getRecentEnrollments = async (token: string) => {
      const response: Response | undefined = await getAllEnrollmentsAPI(
        token,
        5,
        1
      );

      if (!response?.ok) {
        navigate("/admin/");
        toast.error("Failed to fetch recent enrollments");
        return;
      }

      const { data } = await response.json();

      setEnrollments(data.enrollments);
    };

    const getProgrammeDistribution = async (token: string) => {
      const response: Response | undefined = await getProgrammeDistributionAPI(
        token
      );

      if (!response?.ok) {
        navigate("/admin/");
        toast.error("Failed to fetch programme distribution");
        return;
      }

      const { data } = await response.json();

      const programmeDistribution: {
        programmeName: string;
        count: number;
        percentage: number;
      }[] = data.map(
        (p: { programmeName: string; count: number; percentage: number }) => ({
          programmeName: p.programmeName,
          count: p.count,
          percentage: p.percentage,
        })
      );

      setProgrammeDistribution(programmeDistribution);
    };

    if (!authToken) {
      return;
    }

    getStudentsCount(authToken);
    getSubjectsCount(authToken);
    getCoursesCount(authToken);
    getRecentEnrollments(authToken);
    getProgrammeDistribution(authToken);
  }, [authToken, navigate]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const StatCard = ({
    label,
    value,
  }: {
    label: string;
    value: number | string;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-slate-500 text-sm mb-2">{label}</div>
      <div className="text-3xl text-black font-semibold">{value}</div>
    </div>
  );
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-4">
        <StatCard label="Total Students" value={studentsCount} />
        <StatCard label="Total Courses" value={coursesCount} />
        <StatCard label="Total Subjects" value={subjectsCount} />
      </div>

      <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex-3 flex flex-col">
            <h3 className="text-black mb-4 font-semibold">
              Student's Programme Distribution
            </h3>

            <div>
              {programmeDistribution.map((item) => (
                <div key={item.programmeName} className="mb-4 space-y-1">
                  <div className="flex justify-between text-sm font-medium text-slate-700">
                    <span className="font-semibold">{item.programmeName}</span>
                    <span>{item.percentage}%</span>
                  </div>

                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor:
                          programmeColors[item.programmeName] ?? "#64748B", // fallback
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-auto">
              <Link
                className="text-blue-500 hover:text-blue-600 font-semibold"
                to={"/admin/programmes"}
              >
                View All Programmes
              </Link>
            </div>
      </div>

      <section className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Recent Enrollments
          </h2>
          <span className="text-slate-500">
            <Link to={"/admin/enrollments"}>more &gt;</Link>
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-sm">
                <th className="px-6 py-4 font-medium">Enrollment ID</th>
                <th className="px-6 py-4 font-medium">Start Date & Time</th>
                <th className="px-6 py-4 font-medium">End Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
