import SmallButton from "@components/SmallButton";
import type { StudentEnrollmentSchedule } from "@datatypes/enrollmentType";
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { fetchEnrollmentScheduleAPI } from "../api/enrollment-schedule";

export default function SubjectEnrollmentPanel({ authToken, setError500 }: { authToken: string, setError500: Dispatch<SetStateAction<boolean>> }) {


  const [studentEnrollmentSchedule, setStudentEnrollmentSchedule] = useState<StudentEnrollmentSchedule | undefined>(undefined);

  useEffect(() => {

    if (!authToken) {
      return;
    }
    fetchEnrollmentSchedule();

  }, [authToken]);

  async function fetchEnrollmentSchedule() {
    const response: Response | undefined = await fetchEnrollmentScheduleAPI(authToken);

    if (!response || (!response.ok && response.status === 500)) {
      setError500(true);
      return;
    }

    const responseData = await response.json();


    setStudentEnrollmentSchedule(responseData.data);
  }


  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    const monthNames = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];

    const month = monthNames[date.getMonth()];

    return `${day}-${month}-${year}`;
  }





  const currDate = new Date();
  if (!studentEnrollmentSchedule || !studentEnrollmentSchedule.enrollmentId || currDate < new Date(studentEnrollmentSchedule.enrollmentStartDateTime) || currDate > new Date(studentEnrollmentSchedule.enrollmentEndDateTime)) {
    return (<></>);
  }

  return (
    <div className="shadow-lg rounded-lg bg-white">
      <div className="flex justify-between items-center p-4">
        <div>
          <h2 className="text-black font-bold">
            SUBJECT ENROLLMENT OPEN NOW
          </h2>
          <p className="text-gray-500">
            Start Date: {formatDate(new Date(studentEnrollmentSchedule.enrollmentStartDateTime))} - {formatDate(new Date(studentEnrollmentSchedule.enrollmentEndDateTime))}
          </p>
        </div>
        <SmallButton buttonText="Enroll" link="/enrollment" />
      </div>
    </div>
  );
}