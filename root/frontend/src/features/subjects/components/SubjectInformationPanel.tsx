import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { StudentSubjectOverviewData } from "@datatypes/userType";
import { fetchStudentSubjectsAPI } from "@features/subjects/api/studentSubjects";

const CREDITTHEME = [
  "border-blue-digital",
  "border-green-laser",
  "border-yellow-sunbeam",
  "border-orange-amber",
  "border-red",
];

export default function SubjectInformationPanel({ token }: { token: string }) {
  const [data, setData] = useState<StudentSubjectOverviewData[]>([]);

  useEffect(() => {
    fetchStudentSubjects();
  }, []);

  async function fetchStudentSubjects() {
    const response: Response | undefined = await fetchStudentSubjectsAPI(token);

    if (!response || !response.ok) {
      setData([]);
      return;
    }

    const responseData = await response.json();

    if (!responseData.data || responseData.data.length === 0) {
      setData([]);
      return;
    }

    setData(responseData.data);
  }

  return (
    <div className="shadow-lg p-6 rounded-lg bg-white h-full">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-black font-bold">My Subjects</h2>
        <Link to="/subject-listing" className="text-[#666666]">
          more &gt;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-black mt-4">
        {data.length > 0
          ? data.map((subject) => (
              <div
                key={subject.subjectId}
                className={`border-l-4 ${
                  CREDITTHEME[subject.creditHours - 1]
                } p-3 pl-5 shadow-xl rounded-lg bg-black/5`}
              >
                <h5>{subject.creditHours} Credit Hours</h5>
                <p className="font-bold">
                  {subject.subjectCode} - {subject.subjectName}
                </p>
              </div>
            ))
          : undefined}
      </div>
    </div>
  );
}
