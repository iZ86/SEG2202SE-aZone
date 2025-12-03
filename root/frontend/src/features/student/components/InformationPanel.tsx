import type { User } from "@datatypes/userType";
import type { StudentInformation } from "@datatypes/userType";
import { useEffect, useState } from 'react';
import { fetchStudentInformationAPI } from "../api/studentInformation";

function LabelAndValue({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[150px_auto]">
      <p>{label}</p>
      <p className="text-black">{value}</p>
    </div>
  );
}

export default function InformationPanel({ token, student }: { token: string, student: User | null }) {

  const [data, setData] = useState<StudentInformation | undefined>(undefined);

  useEffect(() => {
    fetchStudentInformation();
  }, []);

  async function fetchStudentInformation() {
    const response: Response | undefined = await fetchStudentInformationAPI(token);

    if (!response || !response.ok) {
      setData(undefined);
      return;
    }

    const responseData = await response.json();

    if (!responseData.data || responseData.data.length === 0) {
      setData(undefined);
      return;
    }

    setData(responseData.data);
  }

  function formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }


  if (!data || !student) {
    return (
      <div className="flex text-black p-6 bg-white shadow-lg rounded-lg gap-4">
        <h1>Data not found.</h1>
      </div>
    );
  }
  return (
    <div className="flex text-black p-6 bg-white shadow-lg rounded-lg gap-4 flex-wrap h-full">

      <div>
        <h2 className="font-semibold pb-5">
          {student.lastName + " " + student.firstName} ({student.userId})
        </h2>
        <div className="flex flex-col font-bold text-gray-charcoal gap-y-2">
          <LabelAndValue label={"Programme:"} value={data.courseName} />
          <LabelAndValue label={"Intake:"} value={data.intake} />
          <LabelAndValue label={"Study Mode:"} value={data.studyMode} />
          <LabelAndValue label={"Current Semester:"} value={data.semester} />
          <LabelAndValue
            label={"Semester Period:"}
            value={`${formatDateToDDMMYYYY(new Date(data.semesterStartDate))} - ${formatDateToDDMMYYYY(new Date(data.semesterEndDate))}`}
          />

        </div>


      </div>

      <div className="sm:m-auto justify-center items-center flex">
        <img
          src={student.profilePictureUrl}
          alt="profile"
          className="w-40 h-50 object-cover rounded-xl mt-3 border-2 border-indigo-400 shadow-md"
        />
      </div>
    </div>
  );
}
