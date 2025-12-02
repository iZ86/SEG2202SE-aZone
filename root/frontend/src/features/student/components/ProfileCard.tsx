interface StudentProfileCardProps {
    name: string;
    studentId: string;
    icNo: string;
    programme: string;
    intake: string;
    studyMode: string;
    semester: number;
    semesterPeriod: string;
}

export default function StudentProfileCard({
    name = "Isaac Yeow Ming",
    studentId = "23049679",
    icNo = "010101-14-1234",
    programme = "Bachelor of Software Engineering (Honours)",
    intake = "202509",
    studyMode = "Full Time",
    semester = 4,
    semesterPeriod = "22 Sep 2025 - 16 Jan 2026"
}: Partial<StudentProfileCardProps>) {
    return (
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-4 text-gray-900">
            <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold uppercase tracking-tight">{name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Student ID</span>
                    <span className="block font-medium">{studentId}</span>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">IC / Passport No</span>
                    <span className="block font-medium">{icNo}</span>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Study Mode</span>
                    <span className="block font-medium">{studyMode}</span>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Intake</span>
                    <span className="block font-medium">{intake}</span>
                </div>

                <div className="md:col-span-2">
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Programme</span>
                    <span className="block font-medium">{programme}</span>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Semester</span>
                    <span className="block font-medium">Semester {semester}</span>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Semester Period</span>
                    <span className="block font-medium">{semesterPeriod}</span>
                </div>

            </div>
        </div>
    );
}