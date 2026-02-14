import LoadingOverlay from "@components/LoadingOverlay";
import { useAdmin } from "../hooks/useAdmin";
import { useEffect, useState } from "react";
import { getStudentsCountAPI } from "../api/students";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCoursesCountAPI } from "../api/courses";
import { getSubjectsCountAPI } from "../api/subjects";
import {
  getAllEnrollmentsAPI,
  getMonthlyEnrollmentCountAPI,
} from "../api/enrollments";
import type { Enrollment } from "@datatypes/enrollmentType";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { getProgrammeDistributionAPI } from "../api/programmes";
import {
  BookMarked,
  Globe,
  GraduationCap,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export default function InformationPanel() {
  const { authToken, admin, loading } = useAdmin();
  const [studentsCount, setStudentsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [monthlyEnrollmentCount, setMonthlyEnrollmentCount] = useState<
    { month: string; count: number }[]
  >([]);
  const [monthlyEnrollmentCountFilter, setMonthlyEnrollmentCountFilter] =
    useState(6);
  const [programmeDistribution, setProgrammeDistribution] = useState<
    { programmeName: string; count: number; percentage: number }[]
  >([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const programmeColors: Record<string, string> = {
    "Bachelors Degree": "#2563EB",
    Diploma: "#16A34A",
    Foundation: "#F97316",
  };

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
        1,
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
      const response: Response | undefined =
        await getProgrammeDistributionAPI(token);

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
          count: Number(p.count),
          percentage: Number(p.percentage),
        }),
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

  useEffect(() => {
    const getMonthlyEnrollmentCount = async (token: string) => {
      const response: Response | undefined = await getMonthlyEnrollmentCountAPI(
        token,
        monthlyEnrollmentCountFilter,
      );

      if (!response?.ok) {
        navigate("/admin/");
        toast.error("Failed to fetch monthly enrollment count");
        return;
      }

      const { data } = await response.json();

      const monthlyEnrollments: { month: string; count: number }[] = data.map(
        (e: { month: string; enrollmentCount: number }) => ({
          month: e.month,
          count: e.enrollmentCount,
        }),
      );

      setMonthlyEnrollmentCount(monthlyEnrollments);
    };

    if (!authToken) {
      return;
    }

    getMonthlyEnrollmentCount(authToken);
  }, [authToken, monthlyEnrollmentCountFilter, navigate]);

  if (loading || !admin) {
    return <LoadingOverlay />;
  }

  const StatCard = ({
    label,
    value,
    trend,
    Icon,
    bgColor,
    iconBg,
    to,
  }: {
    label: string;
    value: number | string;
    trend?: string;
    Icon?: LucideIcon;
    bgColor?: string;
    iconBg?: string;
    to?: string;
  }) => (
    <Link
      to={`/admin/${to}`}
      className={`p-6 rounded-2xl border border-white/50 flex flex-col justify-between ${bgColor} min-w-72 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg hover:border-slate-200`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${iconBg} shadow-inner`}>
          {Icon && <Icon size={24} className="text-slate-700" />}
        </div>
        <div>
          <h3 className="font-medium text-slate-600">{label}</h3>
          <h1 className="font-bold text-slate-900">{value}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <TrendingUp className="w-3 h-3" />
        <span>+{trend}% last month</span>
      </div>
    </Link>
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 mt-6">
        <StatCard
          label="Total Students"
          value={studentsCount}
          Icon={GraduationCap}
          bgColor="bg-gradient-to-r from-blue-50 to-blue-200"
          iconBg="bg-blue-300"
          to="users"
        />
        <StatCard
          label="Total Courses"
          value={coursesCount}
          Icon={BookMarked}
          bgColor="bg-gradient-to-r from-emerald-50 to-emerald-200"
          iconBg="bg-emerald-300"
          to="courses"
        />
        <StatCard
          label="Total Subjects"
          value={subjectsCount}
          Icon={Globe}
          bgColor="bg-gradient-to-r from-orange-50 to-orange-200"
          iconBg="bg-orange-300"
          to="subjects"
        />
      </div>

      <div>
        <h2 className="mt-8 mb-4 text-xl font-semibold text-slate-900">
          Monthly Enrollment Count
        </h2>

        <div className="flex flex-col xl:flex-row gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white py-6 pr-4 flex-3/4 flex flex-col">
            <select
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white self-end mb-6"
              value={monthlyEnrollmentCountFilter}
              onChange={(e) =>
                setMonthlyEnrollmentCountFilter(Number(e.target.value))
              }
            >
              <option value="6">6 Months</option>
              <option value="12">1 Year</option>
            </select>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyEnrollmentCount}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      {/* Increased opacity for better visibility */}
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="0"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    dy={12}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dx={-5}
                  />

                  <Tooltip
                    cursor={{ stroke: "#3B82F6", strokeWidth: 2 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
                      padding: "12px",
                    }}
                    itemStyle={{ color: "#60a5fa", fontWeight: "bold" }}
                    labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="Enrollments"
                    dot={{
                      r: 4,
                      fill: "#3B82F6",
                      strokeWidth: 2,
                      stroke: "#fff",
                      fillOpacity: 1,
                    }}
                    activeDot={{
                      r: 6,
                      strokeWidth: 0,
                      fill: "#2563EB",
                    }}
                    filter="drop-shadow(0px 4px 4px rgba(59, 130, 246, 0.2))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex-1/4 flex flex-col">
            <h3 className="text-black font-semibold">
              Student's Programme Distribution
            </h3>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programmeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="percentage"
                    stroke="none"
                  >
                    {programmeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={programmeColors[entry.programmeName] || "#64748B"}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#1e293b",
                      color: "#fff",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
                      padding: "12px",
                    }}
                    itemStyle={{ color: "#60a5fa", fontWeight: "bold" }}
                    labelStyle={{ display: "none" }}
                    formatter={(value: number | undefined) => {
                      return [`${value ?? 0}%`];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {programmeDistribution.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          programmeColors[item.programmeName] || "#64748B",
                      }}
                    ></div>
                    <span className="text-black font-semibold">
                      {item.programmeName} ({item.count} students)
                    </span>
                  </div>
                  <span className="text-slate-900">{item.percentage}%</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <Link
                className="text-blue-500 hover:text-blue-600 font-semibold"
                to={"/admin/programmes"}
              >
                View All Programmes
              </Link>
            </div>
          </div>
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
                      enrollment.enrollmentStartDateTime,
                    ).toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    {new Date(
                      enrollment.enrollmentEndDateTime,
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
