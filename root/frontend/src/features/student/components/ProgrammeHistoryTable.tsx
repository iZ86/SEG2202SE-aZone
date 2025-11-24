import { useState } from "react";
import Pagination from "@components/Pagination";

interface StudentProgrammeHistory {
    id: number;
    programmeName: string;
    courseName: string;
    intakeId: number;
    semester: number;
    startDate: string;
    endDate: string;
    status: "Active" | "Completed" | "Exempted";
}

const MOCK_DATA: StudentProgrammeHistory[] = [
    {
        id: 1,
        programmeName: "Bachelors Degree",
        courseName: "Bachelor of Software Engineering (Hons)",
        intakeId: 202509,
        semester: 1,
        startDate: "2025-09-22",
        endDate: "2026-01-16",
        status: "Active",
    },
    {
        id: 2,
        programmeName: "Foundation",
        courseName: "Foundation in Science and Technology",
        intakeId: 202401,
        semester: 3,
        startDate: "2024-01-10",
        endDate: "2024-12-15",
        status: "Completed",
    },
    {
        id: 3,
        programmeName: "Diploma",
        courseName: "Diploma in Information Technology",
        intakeId: 202308,
        semester: 1,
        startDate: "2023-08-16",
        endDate: "2023-12-12",
        status: "Exempted",
    },
];

export default function StudentProgrammeTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const filteredData = MOCK_DATA.filter((item) =>
        item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.programmeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.intakeId.toString().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const currentData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">Active</span>;
            case "Completed":
                return <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">Completed</span>;
            case "Exempted":
                return <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">Exempted</span>;
            default:
                return status;
        }
    };

    return (
        <>
            <div className="flex items-center space-x-4 mt-4 mb-4">
                <input
                    type="text"
                    placeholder="Search Programme, Course, or Intake..."
                    className="grow px-4 py-2 rounded-md border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400 text-black"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
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
                                    <th className="px-6 py-4 font-medium">Sem</th>
                                    <th className="px-6 py-4 font-medium">Duration</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {currentData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-6 text-gray-500">
                                            No programmes found.
                                        </td>
                                    </tr>
                                ) : (
                                    currentData.map((row) => (
                                        <tr key={row.id} className="text-sm hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">{row.programmeName}</td>
                                            <td className="px-6 py-5 font-medium">{row.courseName}</td>
                                            <td className="px-6 py-5">{row.intakeId}</td>
                                            <td className="px-6 py-5">{row.semester}</td>
                                            <td className="px-6 py-5 text-xs text-slate-500">
                                                {row.startDate} <br /> to {row.endDate}
                                            </td>
                                            <td className="px-6 py-5">
                                                {getStatusBadge(row.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
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