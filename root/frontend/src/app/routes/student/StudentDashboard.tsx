import SubjectInformationPanel from "@features/subjects/components/SubjectInformationPanel";
import Timetable from "@features/timetable/components/Timetable";
import StudentNavbar from "@components/student/StudentNavbar";
import SmallButton from "@components/SmallButton";
import InformationPanel from "@features/student/components/InformationPanel";
import { useStudent } from "@features/student/hooks/useStudent";
import { useEffect, useState } from "react";
import SubjectEnrollmentPanel from "@features/enrollment/components/SubjectEnrollmentPanel";


function TimetablePanel({ token }: { token: string }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(1970, 0, 1));


  useEffect(() => {
    setCurrentWeek();
  }, []);


  function setCurrentWeek() {
    const d = new Date();       // clone so we don't modify original
    const day = d.getDay();         // 0 = Sun, 1 = Mon, ... 6 = Sat

    // Calculate distance to Monday
    const diff = (day === 0 ? -6 : 1 - day);

    d.setDate(d.getDate() + diff);
    setCurrentDate(d);
  }

  function setPrevWeek(currentDate: Date): void {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }

  function setNextWeek(currentDate: Date): void {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }

  function formatLocalDate(date: Date): string {
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function getEndOfWeek(startDate: Date): Date {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 6);
    return d;
  }




  return (
    <div className="bg-white shadow-lg rounded-md p-7 min-h-150 flex flex-col flex-wrap gap-y-8">
      <div className="flex items-start flex-wrap text-black justify-between">
        <h2 className="text-black font-bold">
          My Weekly Timetable ({formatLocalDate(currentDate)} -  {formatLocalDate(getEndOfWeek(currentDate))})
        </h2>
        <div className="flex mt-4 sm:mt-0">
          <button className="bg-[#E5E5E5] px-6 rounded-l-2xl hover:bg-gray-100 cursor-pointer" onClick={() => { setPrevWeek(currentDate) }}>
            Previous
          </button>
          <button className="bg-[#E5E5E5] px-4 py-3 hover:bg-gray-100 cursor-pointer" onClick={() => { setCurrentWeek() }}>
            Current Week
          </button>
          <button className="bg-[#E5E5E5] px-6 rounded-r-2xl hover:bg-gray-100 cursor-pointer" onClick={() => { setNextWeek(currentDate) }}>
            Next
          </button>
        </div>
      </div>

      <Timetable token={token} headerBgColor="bg-white-antiflash" currentDate={currentDate} />
    </div>
  );
}

export default function Dashboard() {

  const { authToken, student } = useStudent();
  const [error500, setError500] = useState(false);
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="dashboard" />
      <main className="flex-1 p-5 sm:p-10">
        <SubjectEnrollmentPanel authToken={authToken} setError500={setError500} />
        <div className="flex flex-wrap gap-x-5 gap-y-4 mt-4">
          <div className="flex-1">
            {authToken && <SubjectInformationPanel token={authToken} />}
          </div>
          <div className="flex-1">

            {authToken && <InformationPanel token={authToken} student={student} />}
          </div>
        </div>
        <div className="mt-4">
          {authToken && <TimetablePanel token={authToken} />}
        </div>
      </main>
    </div>
  );
}
