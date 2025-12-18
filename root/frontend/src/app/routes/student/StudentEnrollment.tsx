import StudentNavbar from "@components/student/StudentNavbar";
import { Search, ClipboardList, Trash2, SquarePen, Book, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTrigger, Modal, ModalOverlay, Button } from "react-aria-components";
import MediumButton from "@components/MediumButton";
import Timetable from "@features/timetable/components/Timetable";
import { useStudent } from "@features/student/hooks/useStudent";
import { fetchEnrollmentSubjectsAPI } from "@features/enrollment/api/enrollment-subjects";
import type { StudentEnrolledSubject, StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData } from "@datatypes/enrollmentType";
import { enrollSubjectsAPI, fetchEnrolledSubjectsAPI } from "@features/enrollment/api/enrolled-subjects";
import { StudentError404Panel, StudentError500Panel } from "@components/student/StudentErrorComponent";
import { toast } from "react-toastify";


// TODO: Why do in such a roundabout way when can just map everything and store the keys?
interface SelectedEnrollmentSubjectIdxs { [studentEnrollmentSubjectIndex: number]: { [classTypeIndex: number]: { [enrollmentSubjectTypeIndex: number]: boolean } } };
interface SelectedEnrollmentSubjectIndexModal { [studentEnrollmentSubjectIndex: number]: { [classTypeIndex: number]: { [enrollmentSubjectTypeIndex: number]: boolean } } };
interface StudentEnrolledSubjectMap { [enrollmentSubjectTypeId: number]: StudentEnrolledSubject };
// The value is subjectId of the respective enrollmentSubjectTypeId
interface StudentEnrollmentSubjectsMap {
  [enrollmentSubjectTypeId: number]: {
    subjectId: number;
    subjectCode: string;
    subjectName: string;
    creditHours: number;
    lecturerId: number;
    firstName: string;
    lastName: string;
    lecturerTitleId: number;
    lecturerTitle: string;
    classTypeId: number;
    classType: string;
    enrollmentSubjectTypeId: number;
    grouping: number;
    dayId: number;
    day: string;
    startTime: string;
    endTime: string;
    numberOfStudentsEnrolled: number;
    numberOfSeats: number;
  }
};


/** This button is needed for popping up the modal. */
function ChooseSubjectButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="font-nunito-sans ml-auto px-4 py-2 bg-blue-air-superiority text-white font-bold text-base flex justify-center items-center rounded-sm hover:bg-blue-yinmn cursor-pointer"
      onClick={onClick}>
      Choose
    </Button>
  );
}

function convert24UTCTimeTo12LocalTime(timeString: string): string {
  // Split time into components
  const [h, m, s] = timeString.split(":").map(Number);

  // Create a Date today using UTC time
  const date = new Date();
  date.setUTCHours(h, m, s);

  // Convert to local time using JS
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();

  // Format to 12-hour format
  const period = localHours >= 12 ? "PM" : "AM";
  const hour12 = (localHours % 12) || 12; // 0 → 12
  const minuteStr = localMinutes.toString().padStart(2, "0");

  return `${hour12}:${minuteStr}${period}`;
}

function EnrollmentSelection({
  name,
  selections,
  selectedEnrollmentSubjectIndexModal,
  setSelectedEnrollmentSubjectIndexModal,
  enrollmentSubjectIndex,
  classTypeIndex,
  studentEnrollmentSubjects,
  selectedEnrollmentSubjectIndex,
  enrolledSubjectsMap
}:
  {
    name: string,
    selections: StudentEnrollmentSubjectOrganizedData["classTypes"][number]["classTypeDetails"],
    selectedEnrollmentSubjectIndexModal: SelectedEnrollmentSubjectIndexModal,
    setSelectedEnrollmentSubjectIndexModal: React.Dispatch<React.SetStateAction<SelectedEnrollmentSubjectIndexModal>>,
    enrollmentSubjectIndex: number,
    classTypeIndex: number,
    studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[],
    selectedEnrollmentSubjectIndex: SelectedEnrollmentSubjectIdxs,
    enrolledSubjectsMap: StudentEnrolledSubjectMap
  }) {




  function test(e: React.ChangeEvent<HTMLInputElement>) {
    let enrollmentSubjectTypeIndex: number = +e.target.value

    setSelectedEnrollmentSubjectIndexModal((prev: SelectedEnrollmentSubjectIndexModal) => {
      const update = { ...prev };

      update[enrollmentSubjectIndex][classTypeIndex] = {};

      if (e.target.checked) {

        update[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex] = true;

      }

      return update;
    })

  }

  function isTimeColliding(
    startOne: string,
    endOne: string,
    dayIdOne: number,
    startTwo: string,
    endTwo: string,
    dayIdTwo: number
  ): boolean {
    const toSeconds = (t: string): number => {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const s1 = toSeconds(startOne);
    const e1 = toSeconds(endOne);
    const s2 = toSeconds(startTwo);
    const e2 = toSeconds(endTwo);

    // Two ranges collide if each starts before the other ends
    return s1 < e2 && s2 < e1 && dayIdOne === dayIdTwo;
  }

  return (
    <div className="flex flex-col gap-y-6">
      {selections.map((classType, enrollmentSubjectTypeIndex) => {
        const clashingEnrollmentSubjects: string[] = [];
        const clashingClassTypeDetailsIdxs: { [Ids: number]: boolean } = {}

        Object.keys(selectedEnrollmentSubjectIndex).map((enrollmentSubjectIdxString: string) => {
          const enrollmentSubjectIdx: number = +enrollmentSubjectIdxString;

          Object.keys(selectedEnrollmentSubjectIndex[enrollmentSubjectIdx]).map((classTypeIdxString: string) => {
            const classTypeIdx: number = +classTypeIdxString;

            Object.keys(selectedEnrollmentSubjectIndex[enrollmentSubjectIdx][classTypeIdx]).map((classTypeDetailsIdxString: string) => {
              const classTypeDetailsIdx: number = +classTypeDetailsIdxString;
              const classTypeDetails: StudentEnrollmentSubjectOrganizedData["classTypes"][number]["classTypeDetails"][number]
                = studentEnrollmentSubjects[enrollmentSubjectIdx].classTypes[classTypeIdx].classTypeDetails[classTypeDetailsIdx];

              // If the time range clashes
              // If they're the same subject and same classType, its fine
              // If they're the same subject but different classType not fine
              // If they're a different subject not fine
              if (isTimeColliding(classTypeDetails.startTime, classTypeDetails.endTime, classTypeDetails.dayId, classType.startTime, classType.endTime, classType.dayId)
                && ((studentEnrollmentSubjects[enrollmentSubjectIndex].subjectId !== studentEnrollmentSubjects[enrollmentSubjectIdx].subjectId)
                  || ((studentEnrollmentSubjects[enrollmentSubjectIndex].subjectId === studentEnrollmentSubjects[enrollmentSubjectIdx].subjectId)
                    && (studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeId !== studentEnrollmentSubjects[enrollmentSubjectIdx].classTypes[classTypeIdx].classTypeId)))
                && classType.enrollmentSubjectTypeId !== classTypeDetails.enrollmentSubjectTypeId) {
                const enrollmentSubject: StudentEnrollmentSubjectOrganizedData = studentEnrollmentSubjects[enrollmentSubjectIdx];

                clashingEnrollmentSubjects.push(enrollmentSubject.subjectCode + " " + enrollmentSubject.subjectName + ", ");
                if (!clashingClassTypeDetailsIdxs[classTypeDetailsIdx]) {
                  clashingClassTypeDetailsIdxs[classTypeDetailsIdx] = true;
                }
              }
            })
          })
        })

        Object.keys(selectedEnrollmentSubjectIndexModal).map((enrollmentSubjectIdxString: string) => {
          const enrollmentSubjectIdx: number = +enrollmentSubjectIdxString;

          Object.keys(selectedEnrollmentSubjectIndexModal[enrollmentSubjectIdx]).map((classTypeIdxString: string) => {
            const classTypeIdx: number = +classTypeIdxString;

            Object.keys(selectedEnrollmentSubjectIndexModal[enrollmentSubjectIdx][classTypeIdx]).map((classTypeDetailsIdxString: string) => {
              const classTypeDetailsIdx: number = +classTypeDetailsIdxString;
              const classTypeDetails: StudentEnrollmentSubjectOrganizedData["classTypes"][number]["classTypeDetails"][number]
                = studentEnrollmentSubjects[enrollmentSubjectIdx].classTypes[classTypeIdx].classTypeDetails[classTypeDetailsIdx];

              // If the time range clashes gone
              // If they're the same subject and same classType, its fine
              // If they're the same subject but different classType not fine
              // If they're a different subject not fine

              if (isTimeColliding(classTypeDetails.startTime, classTypeDetails.endTime, classTypeDetails.dayId, classType.startTime, classType.endTime, classType.dayId)
                && ((studentEnrollmentSubjects[enrollmentSubjectIndex].subjectId !== studentEnrollmentSubjects[enrollmentSubjectIdx].subjectId)
                  || ((studentEnrollmentSubjects[enrollmentSubjectIndex].subjectId === studentEnrollmentSubjects[enrollmentSubjectIdx].subjectId)
                    && (studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeId !== studentEnrollmentSubjects[enrollmentSubjectIdx].classTypes[classTypeIdx].classTypeId)))
                && classType.enrollmentSubjectTypeId !== classTypeDetails.enrollmentSubjectTypeId
                && !clashingClassTypeDetailsIdxs[classTypeDetailsIdx]) {
                const enrollmentSubject: StudentEnrollmentSubjectOrganizedData = studentEnrollmentSubjects[enrollmentSubjectIdx];

                clashingEnrollmentSubjects.push(enrollmentSubject.subjectCode + " " + enrollmentSubject.subjectName + ", ");
                clashingClassTypeDetailsIdxs[classTypeDetailsIdx] = true;
              }
            })
          })
        })


        let clashingEnrollmentSubjectsString: string = clashingEnrollmentSubjects.join("");
        clashingEnrollmentSubjectsString = clashingEnrollmentSubjectsString.slice(0, -2);


        return (
          <label className={`font-nunito-sans flex flex-col p border rounded-xl p-8 ${((clashingEnrollmentSubjects.length > 0) || (classType.numberOfStudentsEnrolled === classType.numberOfSeats && !enrolledSubjectsMap[studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].enrollmentSubjectTypeId])) ? "text-gray-battleship border-gray-charcoal" : "text-gray-battleship border-gray-battleship [&:has(input:checked)]:text-blue-air-superiority [&:has(input:checked)]:border-blue-air-superiority"}
          cursor-pointer select-none`}
            htmlFor={name + classType.grouping}>
            <div className="flex items-center gap-x-8">
              <input className={`border-2 rounded-2xl align-middle min-w-4 min-h-4 appearance-none outline-hidden ${((clashingEnrollmentSubjects.length > 0) || (classType.numberOfStudentsEnrolled === classType.numberOfSeats && !enrolledSubjectsMap[studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].enrollmentSubjectTypeId])) ? "border-gray-charcoal-gray-charcoal" : "border-gray-battleship"} checked:bg-blue-air-superiority checked:border-blue-air-superiority cursor-pointer`}
                id={name + classType.grouping} type="radio" name={name} onChange={(e) => { test(e) }} disabled={((clashingEnrollmentSubjects.length > 0) || (classType.numberOfStudentsEnrolled === classType.numberOfSeats && !enrolledSubjectsMap[studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].enrollmentSubjectTypeId]))} value={enrollmentSubjectTypeIndex} defaultChecked={selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex] && selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex] ? selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex] : false} />
              <div className="flex justify-between w-full items-center flex-wrap gap-y-2">
                <div className="flex flex-col min-w-6/9">
                  <h3 className="font-medium">Group {classType.grouping}</h3>
                  <span>
                    {((classType.numberOfStudentsEnrolled === classType.numberOfSeats) && !enrolledSubjectsMap[studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].enrollmentSubjectTypeId]) ? (<p className="text-red-tomato">Full Capacity</p>) : undefined}
                    {classType.day} {convert24UTCTimeTo12LocalTime(classType.startTime)} - {convert24UTCTimeTo12LocalTime(classType.endTime)}
                  </span>
                  {clashingEnrollmentSubjects.length > 0 ?
                    <p className="text-red-tomato">Clashing schedules with {clashingEnrollmentSubjectsString} </p> : undefined}
                </div>
                <p className={`${classType.numberOfStudentsEnrolled > (classType.numberOfSeats * 0.8) ? 'text-red-tomato' : undefined}`}>
                  {/* Total Number: {classType.numberOfStudentsEnrolled
                    + (selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex] &&
                      selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex] &&
                      selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex] ? 1 : 0)} / {classType.numberOfSeats} */}


                  Total Number: {classType.numberOfStudentsEnrolled
                    + (
                      enrolledSubjectsMap[studentEnrollmentSubjects[enrollmentSubjectIndex].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].enrollmentSubjectTypeId] ?

                        (selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex] &&
                          selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex] &&
                          selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex] ? 0 : -1)
                        :
                        (selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex] &&
                          selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex] &&
                          selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex] ? 1 : 0)

                    )} / {classType.numberOfSeats}
                </p>
              </div>


            </div>


          </label>
        );
      }
      )}
    </div >
  );
}



export default function StudentEnrollment() {
  const { authToken } = useStudent();
  const [viewEnrollmentSubjectIndex, setViewEnrollmentSubjectIndex] = useState(1);
  const [studentEnrollmentSchedule, setStudentEnrollmentSchedule] = useState<StudentEnrollmentSchedule | undefined>(undefined);
  const [studentEnrollmentSubjects, setStudentEnrollmentSubjects] = useState<StudentEnrollmentSubjectOrganizedData[]>([]);
  const [selectedEnrollmentSubjectsIndex, setSelectedEnrollmentSubjectsIndex] = useState<SelectedEnrollmentSubjectIdxs>({});
  const [selectedEnrollmentSubjectIndexModal, setSelectedEnrollmentSubjectIndexModal] = useState<SelectedEnrollmentSubjectIndexModal>({});
  const [enrolledSubjects, setEnrolledSubjects] = useState<StudentEnrolledSubject[]>([]);
  const [enrolledSubjectsMap, setEnrolledSubjectsMap] = useState<StudentEnrolledSubjectMap>({});
  const [error500, setError500] = useState(false);
  const [error404, setError404] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    if (!authToken) {
      return;
    }
    fetchEnrollmentSubjects();
    fetchEnrolledSubjects();

  }, [authToken]);

  // TODO: Is there a better way to do this?
  useEffect(() => {
    initializeStudentEnrollSubjects(enrolledSubjects, studentEnrollmentSubjects)
  }, [studentEnrollmentSubjects, enrolledSubjects])


  async function fetchEnrolledSubjects() {
    const response: Response | undefined = await fetchEnrolledSubjectsAPI(authToken);

    if (!response || (!response.ok && response.status === 500)) {
      setError500(true);
      return;
    }

    if (!response.ok && response.status === 404) {
      setError404(true);
      return;
    }

    const responseData = await response.json();


    setEnrolledSubjects(responseData.data.studentEnrolledSubjects);
  }

  async function fetchEnrollmentSubjects() {
    const response: Response | undefined = await fetchEnrollmentSubjectsAPI(authToken);

    if (!response || (!response.ok && response.status === 500)) {
      setError500(true);
      return;
    }

    if (!response.ok && response.status === 400) {
      setError404(true);
      return;
    }

    const responseData = await response.json();


    setStudentEnrollmentSchedule(responseData.data.studentEnrollmentSchedule);
    setStudentEnrollmentSubjects(responseData.data.studentEnrollmentSubjects);
  }

  function initializeStudentEnrollSubjects(studentEnrolledSubjects: StudentEnrolledSubject[], studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]) {



    const enrolledSubjectsMap: StudentEnrolledSubjectMap = {};
    for (const studentEnrolledSubject of studentEnrolledSubjects) {
      enrolledSubjectsMap[studentEnrolledSubject.enrollmentSubjectTypeId] = studentEnrolledSubject;
    }

    const selectedEnrollmentSubjectIndex: SelectedEnrollmentSubjectIdxs = {};

    studentEnrollmentSubjects.map((subject, subjectIdx) => {
      subject.classTypes.map((classType, classTypeIdx) => {
        classType.classTypeDetails.map((classTypeDetail, classTypeDetailIdx) => {
          if (enrolledSubjectsMap[classTypeDetail.enrollmentSubjectTypeId]) {
            if (classTypeDetail.enrollmentSubjectTypeId === enrolledSubjectsMap[classTypeDetail.enrollmentSubjectTypeId].enrollmentSubjectTypeId) {

              if (!selectedEnrollmentSubjectIndex[subjectIdx]) {
                selectedEnrollmentSubjectIndex[subjectIdx] = {};
              }
              if (!selectedEnrollmentSubjectIndex[subjectIdx][classTypeIdx]) {
                selectedEnrollmentSubjectIndex[subjectIdx][classTypeIdx] = {};
              }
              if (!selectedEnrollmentSubjectIndex[subjectIdx][classTypeIdx][classTypeDetailIdx]) {
                selectedEnrollmentSubjectIndex[subjectIdx][classTypeIdx][classTypeDetailIdx] = true;
              }
            }
          }

        })
      })
    })

    setEnrolledSubjectsMap(enrolledSubjectsMap);

    setSelectedEnrollmentSubjectsIndex(selectedEnrollmentSubjectIndex);
  }

  async function enrollSubjects(studentEnrollmentSchedule: StudentEnrollmentSchedule | undefined, selectedEnrollmentSubjectsIndex: SelectedEnrollmentSubjectIdxs, studentEnrollmentSubjects: StudentEnrollmentSubjectOrganizedData[]) {

    const currDate = new Date();
    if (!studentEnrollmentSchedule || currDate < new Date(studentEnrollmentSchedule.enrollmentStartDateTime) || currDate > new Date(studentEnrollmentSchedule.enrollmentEndDateTime)) {
      setError404(true);
      return;

    }

    const studentEnrollSubjects: number[] = [];

    Object.keys(selectedEnrollmentSubjectsIndex).map((subjectIdxString: string) => {
      const subjectIdx: number = +subjectIdxString;
      Object.keys(selectedEnrollmentSubjectsIndex[subjectIdx]).map((classTypeIdxString: string) => {
        const classTypeIdx: number = +classTypeIdxString;
        Object.keys(selectedEnrollmentSubjectsIndex[subjectIdx][classTypeIdx]).map((classTypeDetailIdxString: string) => {
          const classTypeDetailIdx: number = +classTypeDetailIdxString;
          const classTypeDetail = studentEnrollmentSubjects[subjectIdx].classTypes[classTypeIdx].classTypeDetails[classTypeDetailIdx];
          studentEnrollSubjects.push(classTypeDetail.enrollmentSubjectTypeId);
        })
      })
    })


    const response: Response | undefined = await enrollSubjectsAPI(authToken, studentEnrollSubjects);

    if (!response || (!response.ok && response.status === 500)) {
      setError500(true);
      return;
    }

    if (!response.ok && response.status === 400) {
      setError404(true);
      return;
    }

    const responseData = await response.json();

    // If backend got problem 409 send back here and toast, and useEffect again
    if (!response.ok && response.status === 409) {

      const studentEnrollmentSubjectsMap: StudentEnrollmentSubjectsMap = {};


      studentEnrollmentSubjects.map((studentEnrollmentSubject) => {

        studentEnrollmentSubject.classTypes.map((classType) => {

          classType.classTypeDetails.map((classTypeDetail) => {
            studentEnrollmentSubjectsMap[classTypeDetail.enrollmentSubjectTypeId] = {
              subjectId: studentEnrollmentSubject.subjectId,
              subjectCode: studentEnrollmentSubject.subjectCode,
              subjectName: studentEnrollmentSubject.subjectName,
              creditHours: studentEnrollmentSubject.creditHours,
              lecturerId: studentEnrollmentSubject.lecturerId,
              firstName: studentEnrollmentSubject.firstName,
              lastName: studentEnrollmentSubject.lastName,
              lecturerTitleId: studentEnrollmentSubject.lecturerTitleId,
              lecturerTitle: studentEnrollmentSubject.lecturerTitle,
              classTypeId: classType.classTypeId,
              classType: classType.classType,
              enrollmentSubjectTypeId: classTypeDetail.enrollmentSubjectTypeId,
              grouping: classTypeDetail.grouping,
              dayId: classTypeDetail.dayId,
              day: classTypeDetail.day,
              startTime: classTypeDetail.startTime,
              endTime: classTypeDetail.endTime,
              numberOfStudentsEnrolled: classTypeDetail.numberOfStudentsEnrolled,
              numberOfSeats: classTypeDetail.numberOfSeats
            }
          })

        })
      })


      const enrollmentSubjectTypeIds: number[] = responseData.data.enrollmentSubjectTypeIds;
      const clashingEnrollmentSubjects: string[] = [];

      for (const enrollmentSubjectTypeId of enrollmentSubjectTypeIds) {
        const enrollmentSubject = studentEnrollmentSubjectsMap[enrollmentSubjectTypeId]
        clashingEnrollmentSubjects.push(enrollmentSubject.subjectCode
          + " " + enrollmentSubject.subjectName + " - " + enrollmentSubject.classType + " " + enrollmentSubject.grouping + ", ");
      }

      let clashingEnrollmentSubjectsString: string = clashingEnrollmentSubjects.join("");
      clashingEnrollmentSubjectsString = clashingEnrollmentSubjectsString.slice(0, -2);

      const errorMessage = responseData.message;
      toast.error(`${errorMessage}: ${clashingEnrollmentSubjectsString}`);


      return;
    }

    navigate("/");
    return;
  }

  function chooseSubjectType(enrollmentSubjectIndex: number, classTypes: StudentEnrollmentSubjectOrganizedData["classTypes"]) {
    setSelectedEnrollmentSubjectIndexModal((prev: SelectedEnrollmentSubjectIndexModal) => {
      const updated: SelectedEnrollmentSubjectIndexModal = {};

      if (!updated[enrollmentSubjectIndex]) {
        updated[enrollmentSubjectIndex] = {};
      }
      classTypes.map((classType, classTypeIndex) => {
        if (!updated[enrollmentSubjectIndex][classTypeIndex]) {
          updated[enrollmentSubjectIndex][classTypeIndex] = {}
          if (selectedEnrollmentSubjectsIndex[enrollmentSubjectIndex] && selectedEnrollmentSubjectsIndex[enrollmentSubjectIndex][classTypeIndex]) {


            Object.keys(selectedEnrollmentSubjectsIndex[enrollmentSubjectIndex][classTypeIndex]).map((key: string) => {
              const enrollmentSubjectTypeIndex: number = +key

              updated[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex] = selectedEnrollmentSubjectsIndex[enrollmentSubjectIndex][classTypeIndex][enrollmentSubjectTypeIndex];
            })

          }
        }
      })

      return updated;
    });

    setViewEnrollmentSubjectIndex(enrollmentSubjectIndex);
  }


  function closeChooseSubjectModal() {
    // GO through selectedEnrollmentSubjectIndexesModal and put them in the actual thing. If it doesnt exist here, means remove it.
    setSelectedEnrollmentSubjectIndexModal({});
  }

  function confirmChooseSubjectModal() {
    setSelectedEnrollmentSubjectsIndex((prev: SelectedEnrollmentSubjectIdxs) => {
      const enrollmentSubjects = { ...prev };

      Object.keys(selectedEnrollmentSubjectIndexModal).map((key: string) => {
        const enrollmentSubjectIndex = +key;

        enrollmentSubjects[enrollmentSubjectIndex] = selectedEnrollmentSubjectIndexModal[enrollmentSubjectIndex];
      })

      return enrollmentSubjects;
    })
    closeChooseSubjectModal();
  }

  function removeSelectedEnrollmentSubjectIndex(removeSubjectIdx: number) {
    const enrollmentSubjects: SelectedEnrollmentSubjectIdxs = {};
    Object.keys(selectedEnrollmentSubjectsIndex).map((subjectIdxString: string) => {
      const subjectIdx: number = +subjectIdxString;
      if (subjectIdx !== removeSubjectIdx) {
        enrollmentSubjects[subjectIdx] = selectedEnrollmentSubjectsIndex[subjectIdx];
      }
    })
    setSelectedEnrollmentSubjectsIndex(enrollmentSubjects);
  }

  if (error404) {
    return (
      <div className="flex min-h-screen bg-white-antiflash font-poppins justify-center items-center">
        <StudentError404Panel />
      </div>
    );
  }

  if (error500) {
    return (
      <div className="flex min-h-screen bg-white-antiflash font-poppins justify-center items-center">
        <StudentError500Panel />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash pb-40">
      <StudentNavbar page="enrollment" />


      <main className="px-10 py-10 flex-1">
        <h1 className="text-black font-bold">Available Subjects</h1>
        <p className="text-gray-500 font-normal mt-3">Select your subjects for the upcoming semester</p>

        {/* <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by subject code or subject name..."
            className="text-black pl-12 p-4 text-lg font-normal rounded-lg w-full border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div> */}



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <DialogTrigger>
            {studentEnrollmentSubjects.map((subj, index) => (
              <div
                // onClick={() => setSelectedSubjectIndex(index)}
                // className={`flex flex-wrap gap-y-4 items-center p-6 rounded-xl shadow-sm cursor-pointer transition-all duration-200 bg-white
                //             ${viewEnrollmentSubjectIndex === index ? "border-2 border-blue-500" : "hover:shadow-md border border-transparent"}`}
                className={`flex flex-wrap gap-y-4 items-center p-6 rounded-xl shadow-sm cursor-pointer transition-all duration-200 bg-white`}
              >
                <div className="flex items-start gap-4 mr-auto w-sm">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <ClipboardList className="text-gray-700 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {subj.subjectCode} - {subj.subjectName}
                    </h3>
                    <p className="text-gray-600 text-sm">Credit Hours: {subj.creditHours}</p>
                  </div>
                </div>

                <ChooseSubjectButton onClick={() => { chooseSubjectType(index, subj.classTypes) }} />
              </div>
            ))}
            <ModalOverlay isDismissable
              className={({ isEntering, isExiting }) => `
          fixed inset-0 w-full min-h-screen z-20 bg-black/50 isolate flex flex-col justify-center
          ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
          `}>
              <Modal
                className={({ isEntering, isExiting }) => `
            flex flex-col text-center max-h-screen overflow-auto pointer-events-none
            ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
            ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
          `}>
                <Dialog
                  role="alertdialog"
                  className="bg-white rounded-2xl flex flex-col mx-auto pointer-events-auto"
                >
                  <div className="flex flex-col">
                    {studentEnrollmentSubjects.length > 0 && (
                      <div className="flex flex-col px-12 py-8 gap-y-8 overflow-auto max-h-256 text-gray-charcoal text-left font-semibold">
                        <h1 className="text-black">Select Groups for {studentEnrollmentSubjects[viewEnrollmentSubjectIndex].subjectCode} - {studentEnrollmentSubjects[viewEnrollmentSubjectIndex].subjectName}</h1>

                        {
                          studentEnrollmentSubjects[viewEnrollmentSubjectIndex].classTypes.map((classType, classTypeIndex) => {
                            return (
                              <div className="flex flex-col gap-y-6">
                                <h2>{classType.classType} Groups</h2>
                                <EnrollmentSelection name={classType.classType} selections={classType.classTypeDetails} enrollmentSubjectIndex={viewEnrollmentSubjectIndex} classTypeIndex={classTypeIndex} selectedEnrollmentSubjectIndexModal={selectedEnrollmentSubjectIndexModal}
                                  setSelectedEnrollmentSubjectIndexModal={setSelectedEnrollmentSubjectIndexModal}
                                  studentEnrollmentSubjects={studentEnrollmentSubjects}
                                  selectedEnrollmentSubjectIndex={selectedEnrollmentSubjectsIndex}
                                  enrolledSubjectsMap={enrolledSubjectsMap}
                                />
                              </div>
                            )
                          })
                        }
                      </div>
                    )
                    }

                    <div className="flex flex-col items-end bg-platinum px-8 py-4 rounded-b-2xl">
                      <div className="flex gap-x-4">
                        <Button slot="close" className="font-nunito-sans px-6 py-3 bg-gray-battleship text-white font-bold text-xl flex gap-x-2 justify-center items-center rounded-md hover:bg-gray-charcoal cursor-pointer" onClick={closeChooseSubjectModal}>
                          Cancel
                        </Button>
                        <Button slot="close" className="font-nunito-sans px-6 py-3 bg-blue-air-superiority text-white font-bold text-xl flex gap-x-2 justify-center items-center rounded-md hover:bg-blue-yinmn cursor-pointer" onClick={confirmChooseSubjectModal}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </div>

                </Dialog>
              </Modal>
            </ModalOverlay>

          </DialogTrigger>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200">
          <div className="flex justify-between items-center px-10 py-6">
            <h4 className="text-black font-semibold">
            </h4>
            <DialogTrigger>
              <Button className="font-nunito-sans px-6 py-3 bg-blue-air-superiority text-white font-bold text-xl flex gap-x-2 justify-center items-center rounded-md hover:bg-blue-yinmn  cursor-pointer">
                Submit Enrollment
              </Button>
              <ModalOverlay isDismissable
                className={({ isEntering, isExiting }) => `
          fixed inset-0 w-full min-h-screen z-20 bg-black/50 isolate flex flex-col justify-center
          ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
          `}>
                <Modal
                  className={({ isEntering, isExiting }) => `
            flex flex-col text-center max-h-screen overflow-auto pointer-events-none mx-6
            ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
            ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
          `}>
                  <Dialog
                    className="bg-white rounded-2xl flex flex-col mx-auto pointer-events-auto"
                  >
                    <div className="flex flex-col items-center text-black gap-y-8 p-8">
                      <div className="flex flex-col items-center gap-y-4">
                        <h2 className="font-bold">Are you sure you want to enroll in these subjects?</h2>
                        <p>You may change your choice after confirmation.</p>
                      </div>
                      <div className="flex flex-wrap gap-x-4">
                        <Button slot="close" className="font-nunito-sans px-6 py-3 bg-red-tomato text-white font-bold text-xl flex gap-x-2 justify-center items-center rounded-md hover:bg-red-500 cursor-pointer">
                          Cancel
                        </Button>
                        <Button slot="close" className="font-nunito-sans px-6 py-3 bg-blue-air-superiority text-white font-bold text-xl flex gap-x-2 justify-center items-center rounded-md hover:bg-blue-yinmn cursor-pointer" onClick={() => { enrollSubjects(studentEnrollmentSchedule, selectedEnrollmentSubjectsIndex, studentEnrollmentSubjects) }}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </Dialog>
                </Modal>
              </ModalOverlay>

            </DialogTrigger>
          </div>
        </div>

        <DialogTrigger>
          <Button className="fixed bottom-30 right-10 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all cursor-pointer">
            <ClipboardList className="w-6 h-6" />
          </Button>
          <ModalOverlay isDismissable
            className={({ isEntering, isExiting }) => `
          fixed inset-0 left-0 w-full min-h-screen z-20 bg-black/50 isolate flex pl-[10%]
          ${isEntering ? 'animate-in fade-in duration-300 ease-out' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
        `}>
            <Modal
              className={({ isEntering, isExiting }) => `
            flex text-center w-full
            ${isEntering ? 'animate-in zoom-in-95 ease-out duration-300' : ''}
            ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
          `}>
              <Dialog
                role="alertdialog"
                className="bg-white-antiflash w-full flex flex-col overflow-auto"
              >
                {({ close }) => (
                  <div className="flex flex-col px-12 py-8 gap-y-8 text-black max-h-screen overflow-auto text-left font-semibold">
                    <div className="flex justify-start">
                      <MediumButton buttonText="Back" textColor="text-gray-battleship" backgroundColor="bg-white-antiflash" hoverBgColor="hover:bg-white-antiflash" Icon={ChevronLeft} hasPadding={false} onClick={close} />
                    </div>
                    <div className="flex flex-col gap-y-16">
                      <div className="flex flex-col gap-y-8">
                        <h1>Preview Timetable</h1>
                        <Timetable token={authToken} studentEnrollmentSubjects={studentEnrollmentSubjects} selectedEnrollmentSubjectIndex={selectedEnrollmentSubjectsIndex} />
                      </div>
                      <div className="flex flex-col gap-y-8">
                        <h1>Selected Subjects</h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.keys(selectedEnrollmentSubjectsIndex).map((subjectIdxString: string) => {
                            const subjectIdx: number = +subjectIdxString

                            return (
                              <div className="bg-white p-8 flex flex-col gap-y-8 rounded-2xl mr-4">
                                <div className="flex flex-wrap gap-y-4">
                                  <div className="flex gap-x-8 flex-wrap items-start mr-auto gap-y-4">
                                    <div className="bg-white-antiflash p-2 rounded-sm">
                                      <Book className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                      <p>{studentEnrollmentSubjects[subjectIdx].subjectName}</p>
                                      <p className="text-gray-battleship">{"Credit Hours: " + studentEnrollmentSubjects[subjectIdx].creditHours}</p>
                                    </div>
                                  </div>

                                  <Button onClick={() => { removeSelectedEnrollmentSubjectIndex(subjectIdx) }}>
                                    <Trash2 className="w-6 h-6 text-red-tomato ml-auto cursor-pointer" />
                                  </Button>

                                </div>

                                <div className="flex flex-wrap gap-y-4">
                                  <div className="flex flex-col gap-y-2 max-w-xs mr-auto">


                                    {Object.keys(selectedEnrollmentSubjectsIndex[subjectIdx]).map((key: string) => {
                                      const classTypeIndex: number = +key;
                                      return (
                                        <div>

                                          {Object.keys(selectedEnrollmentSubjectsIndex[subjectIdx][classTypeIndex]).map((key: string) => {
                                            const enrollmentSubjectTypeIndex: number = +key;
                                            return (
                                              <p>
                                                {studentEnrollmentSubjects[subjectIdx].classTypes[classTypeIndex].classType
                                                  + " Group " + studentEnrollmentSubjects[subjectIdx].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].grouping
                                                  + ", " + studentEnrollmentSubjects[subjectIdx].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].day
                                                  + " " + convert24UTCTimeTo12LocalTime(studentEnrollmentSubjects[subjectIdx].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].startTime)
                                                  + " - " + convert24UTCTimeTo12LocalTime(studentEnrollmentSubjects[subjectIdx].classTypes[classTypeIndex].classTypeDetails[enrollmentSubjectTypeIndex].endTime)
                                                }
                                              </p>
                                            );
                                          })}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {/* <SquarePen className="w-6 h-6 ml-auto" /> */}

                                </div>
                              </div>
                            );
                          })}


                        </div>

                      </div>
                    </div>


                  </div>
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>

        </DialogTrigger>

      </main>

    </div>
  );
}
