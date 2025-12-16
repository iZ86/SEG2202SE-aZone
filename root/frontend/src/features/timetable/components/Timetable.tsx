import { useEffect, useState } from 'react';
import { fetchTimeTableAPI } from '../api/timetable';
import type { StudentClassData } from '@datatypes/userType';
import type { StudentEnrollmentSubjectOrganizedData } from "@datatypes/enrollmentType";


interface SelectedEnrollmentSubjectIds { [studentEnrollmentSubjectIndex: number]: { [classTypeIndex: number]: { [enrollmentSubjectTypeIndex: number]: boolean } } };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Following classtype, first is lecture, second is practical, third is tutorial, fourth is workshop.
const CLASSTHEME = [
  "bg-blush-powder/20 border-blush-powder text-blush-powder",
  "bg-blue-icy/20 border-blue-icy text-blue-icy",
  "bg-blue-icy/20 border-blue-icy text-blue-icy",
  "bg-green-light/20 border-green-light text-green-light"
]

export default function Timetable({ token, headerBgColor = "bg-white", currentDate = undefined, studentEnrollmentSubjects = undefined, selectedEnrollmentSubjectIndex = undefined
}: {
  token: string, headerBgColor?: string, currentDate?: Date, studentEnrollmentSubjects?: StudentEnrollmentSubjectOrganizedData[], selectedEnrollmentSubjectIndex?: SelectedEnrollmentSubjectIds
}) {

  const [data, setData] = useState<StudentClassData[]>([]);
  const [semesterStartDate, setSemesterStartDate] = useState<Date>(new Date(1970, 0, 1));
  const [semesterEndDate, setSemesterEndDate] = useState<Date>(new Date(1970, 0, 1));

  useEffect(() => {
    if (!studentEnrollmentSubjects || !selectedEnrollmentSubjectIndex) {
      fetchTimeTable();
    } else {
      flattenSelectedEnrollmentSubjects(studentEnrollmentSubjects, selectedEnrollmentSubjectIndex);
    }
  }, []);

  async function flattenSelectedEnrollmentSubjects(studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[], selectedEnrollmentSubjectIndex: SelectedEnrollmentSubjectIds) {

    const selectedClasses: StudentClassData[] = [];

    Object.keys(selectedEnrollmentSubjectIndex).map(subjectIdxStr => {
      const subjectIdx = +subjectIdxStr;
      const subject = studentEnrollmentSubjects[subjectIdx];

      Object.keys(selectedEnrollmentSubjectIndex[subjectIdx]).map(classTypeIdxStr => {
        const classTypeIdx = +classTypeIdxStr;
        const classType = subject.classTypes[classTypeIdx];
        if (!classType) return;

        Object.keys(selectedEnrollmentSubjectIndex[subjectIdx][classTypeIdx]).map(detailIdxStr => {
          const detailIdx = +detailIdxStr;
          const detail = classType.classTypeDetails[detailIdx];
          if (!detail) return;

          selectedClasses.push({
            enrollmentSubjectId: detail.enrollmentSubjectTypeId,
            startTime: detail.startTime,
            endTime: detail.endTime,
            subjectId: subject.subjectId,
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            lecturerId: subject.lecturerId,
            lecturerFirstName: subject.firstName,
            lecturerLastName: subject.lastName,
            lecturerTitleId: subject.lecturerTitleId,
            lecturerTitle: subject.lecturerTitle,
            email: "", // if you have email, insert it here
            classTypeId: classType.classTypeId,
            classType: classType.classType,
            venueId: 0,
            venue: "",
            grouping: detail.grouping,
            dayId: detail.dayId,
            day: detail.day,
          });
        });
      });
    });

    setData(selectedClasses);

  }

  async function fetchTimeTable() {
    const response: Response | undefined = await fetchTimeTableAPI(token);

    if (!response || !response.ok) {
      setData([]);
      return;
    }

    const responseData = await response.json();

    if (!responseData.data || !responseData.data.timetable || responseData.data.timetable.length === 0 || !responseData.data.semesterStartDate || !responseData.data.semesterEndDate) {
      setData([]);
      setSemesterStartDate(new Date(1970, 0, 1));
      setSemesterEndDate(new Date(1970, 0, 1));
      return;
    }

    setData(responseData.data.timetable);
    setSemesterStartDate(new Date(responseData.data.semesterStartDate));
    setSemesterEndDate(new Date(responseData.data.semesterEndDate));
  }

  function formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  function convert24UTCTimeTo12LocalTime(timeString: string): string {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, seconds, 0);

    return utcDate
      .toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase()
      .replace(" ", "");
  }

  return (

    <div className="flex-1 flex max-w-full overflow-x-auto">
      <div className="grid grid-cols-7 gap-x-36 gap-y-6 xl:gap-6 grid-rows-[auto_1fr] flex-1">

        {DAYS.map((days, index) => {
          let d = undefined;
          if (currentDate) {
            d = new Date(currentDate);
            d.setDate(d.getDate() + (index));
          }
          return (
            <div
              key={days}
              className={`text-black font-semibold ${headerBgColor} py-3 rounded-t-lg text-center min-w-32 flex flex-col`}
            >
              {days}
              <p>
                {
                  d && formatDateToDDMMYYYY(d)
                }
              </p>
            </div>
          );
        }

        )}

        {data.length > 0 && ((studentEnrollmentSubjects && selectedEnrollmentSubjectIndex && Object.keys(selectedEnrollmentSubjectIndex).length > 0) || (currentDate && currentDate.getTime() < semesterEndDate.getTime() && currentDate.getTime() >= semesterStartDate.getTime()))
          ? (DAYS.map((day, index) => (
            <div key={day} className="space-y-4 min-w-32">
              {data
                .filter((c) => c.dayId === index + 1)
                .map((classData, index) => (
                  <div
                    key={index}
                    className={`${CLASSTHEME[classData.classTypeId - 1]} border-l-5 py-3 px-2 rounded-lg text-sm flex flex-col gap-y-5`}
                  >
                    <div className="flex flex-col flex-wrap font-bold gap-y-2">

                      <p className="font-bold">{convert24UTCTimeTo12LocalTime(classData.startTime)} - {convert24UTCTimeTo12LocalTime(classData.endTime)}</p>
                      <div className="flex flex-col flex-wrap text-black">
                        <p className="text-black">
                          {classData.subjectCode} - {classData.subjectName}
                        </p>

                        <p>{classData.classType}</p>
                      </div>


                    </div>
                    <div className="flex flex-col flex-wrap text-gray-charcoal font-bold">
                      {classData.venue.length > 0 ?
                        <p>
                          Venue: {classData.venue}
                        </p> : undefined}

                      <p>
                        Grouping: {classData.grouping}
                      </p>
                      <p>

                        Lecturer: {`${
                          // lecturerTitleId 1 is None
                          classData.lecturerTitleId === 1 ? "" : classData.lecturerTitle
                          } ${classData.lecturerFirstName} ${classData.lecturerLastName}`}
                      </p>
                      {classData.email.length > 0 ? <p className="break-all">Email: {classData.email}</p> : undefined}

                    </div>


                  </div>
                ))}
            </div>
          ))) :
          <div className="col-span-7 flex justify-center items-center">
            <h3 className="text-black font-bold text-gray-charcoal">
              No subjects chosen.
            </h3>
          </div>
        }
      </div>
    </div>
  );
}
