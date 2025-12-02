import { useState } from "react";
import Pagination from "../../../components/Pagination";
import SubjectFilterBar from "./SemesterFilterBar";

interface Subject {
    id: number;
    subjectCode: string;
    subjectName: string;
    creditHours: number;
    status: "EXEMPTED" | "ACTIVE" | "FINISHED";
}

const MOCK_SUBJECTS: Subject[] = [
    {
        id: 1,
        subjectCode: "CSC1024",
        subjectName: "Programming Principles",
        creditHours: 4,
        status: "ACTIVE",
        semester: 1,
    },
    {
        id: 2,
        subjectCode: "MTH1114",
        subjectName: "Computer Mathematics",
        creditHours: 3,
        status: "EXEMPTED",
        semester: 1,
    },
    {
        id: 3,
        subjectCode: "SEG2202",
        subjectName: "Software Engineering",
        creditHours: 4,
        status: "EXEMPTED",
        semester: 4,
    },
    {
        id: 4,
        subjectCode: "MPU3113",
        subjectName: "Hubungan Etnik",
        creditHours: 3,
        status: "FINISHED",
        semester: 2,
    },
    {
        id: 5,
        subjectCode: "CSC3044",
        subjectName: "Artificial Intelligence",
        creditHours: 4,
        status: "EXEMPTED",
        semester: 4,
    },
    {
        id: 6,
        subjectCode: "NET1014",
        subjectName: "Networking Principles",
        creditHours: 4,
        status: "EXEMPTED",
        semester: 2,
    },
];

export default function SubjectListingTable() {
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedSemester, setSelectedSemester] = useState("All");

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const filteredData = MOCK_SUBJECTS.filter((item) => {
        const matchesSearch =
            item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSemester =
            selectedSemester === "All" ||
            item.semester.toString() === selectedSemester;

        return matchesSearch && matchesSemester;
    });

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
            case "EXEMPTED":
                return <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 rounded-full">EXEMPTED</span>;
            case "ACTIVE":
                return <span className="px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-full">ACTIVE</span>;
            case "FINISHED":
                return <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 rounded-full">FINISHED</span>;
            default:
                return status;
        }
    };

    return (
        <section>
            <SubjectFilterBar
                searchTerm={searchTerm}
                onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                selectedSemester={selectedSemester}
                onSemesterChange={(val) => { setSelectedSemester(val); setCurrentPage(1); }}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr className="text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Subject Code</th>
                                <th className="px-6 py-4 font-semibold">Subject Name</th>
                                <th className="px-6 py-4 font-semibold text-center">Credit Hours</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        No subjects found for this semester.
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((row) => (
                                    <tr key={row.id} className="text-sm hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-6 py-5 font-mono text-blue-600 font-medium">{row.subjectCode}</td>
                                        <td className="px-6 py-5 font-medium">{row.subjectName}</td>
                                        <td className="px-6 py-5 text-center">{row.creditHours}</td>
                                        <td className="px-6 py-5 text-center">
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