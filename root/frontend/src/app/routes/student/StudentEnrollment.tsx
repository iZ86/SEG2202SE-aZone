/** 
 * Something to research, when I have time.
 * The usual method of API calling is actually not "correct".
 * export default function StudentEnrollment() {
  const { authToken } = useStudent();
  const [selectedViewEnrollmentSubjectIndex, setSelectedViewEnrollmentSubjectIndex] = useState(1);
  const [studentEnrollmentSchedule, setStudentEnrollmentSchedule] = useState<StudentEnrollmentSchedule | undefined>(undefined);
  const [studentEnrollmentSubjects, setStudentEnrollmentSubjects] = useState<StudentEnrollmentSubjectOrganizedData[]>([]);
  const [selectedEnrollmentSubjectsIndexes, setSelectedEnrollmentSubjectsIndexes] = useState<any>({});
  const [selectedEnrollmentSubjectIndexesModal, setSelectedEnrollmentSubjectIndexesModal] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    fetchEnrollmentSubjects();
  }, [authToken]);

  async function fetchEnrollmentSubjects(){
    const response: Response | undefined = await fetchEnrollmentSubjectsAPI(authToken);

    if (!response || !response.ok) {
      // This should go to 404.
      setStudentEnrollmentSchedule(undefined);
      setStudentEnrollmentSubjects([]);
      return;
    }

    const responseData = await response.json();


    setStudentEnrollmentSchedule(responseData.data.studentEnrollmentSchedule);
    setStudentEnrollmentSubjects(responseData.data.studentEnrollmentSubjects);
  }




  if (isLoading) {
    return <div></div>
  }
  console.log(studentEnrollmentSubjects);
  console.log(selectedViewEnrollmentSubjectIndex)
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash pb-40">
      <StudentNavbar page="enrollment" />


      <main className="px-10 py-10 flex-1">
        <h1 className="text-black font-bold">Available Subjects{studentEnrollmentSubjects[selectedViewEnrollmentSubjectIndex].creditHours}</h1>

  This code will fail 100% causing error, because in the first 2 renders studentEnrollmentSubjects is undefined. This is normal due to ReactStrictMode. Hence the need for loading.
  However, this loading doesn't seem to work? That's all more research needs to be done. With that being said, the loading pattern wont be used, cause I think that a loading page is not good
  as compared to just a page that is empty then the data fills in automatically
 */

import StudentNavbar from "@components/student/StudentNavbar";
import { Search, ClipboardList, Trash2, SquarePen, Book, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay, Button } from "react-aria-components";
import MediumButton from "@components/MediumButton";
import Timetable from "@features/timetable/components/Timetable";
import { useStudent } from "@features/student/hooks/useStudent";
import { fetchEnrollmentSubjectsAPI } from "@features/enrollment/api/enrollment-subjects";
import type { StudentEnrollmentSchedule, StudentEnrollmentSubjectOrganizedData } from "@datatypes/enrollmentType";

// const LECTURES = [
//   ["Group 1", "Monday 10:00 AM - 12.00 PM"]
// ]

// const TUTORIALS = [
//   ["Group 1", "Monday 12:00 PM - 2.00 PM"],
//   ["Group 2", "Wednesday 12:00 PM - 2.00 PM"]
// ]

const SELECTED_SUBJECTS = [
  {
    subjectName: "ABC123 - Database Fundamental II",
    creditHours: 4,
    selectedClassTypes: [
      {
        classType: "Lecture",
        group: 1,
        day: "Monday",
        startTime: "10.00AM",
        endTime: "12.00PM"
      },
      {
        classType: "Tutorial",
        group: 2,
        day: "Wednesday",
        startTime: "12.00PM",
        endTime: "2.00PM"
      }
    ]
  },
  {
    subjectName: "ABC123 - Database Fundamental II",
    creditHours: 4,
    selectedClassTypes: [
      {
        classType: "Lecture",
        group: 1,
        day: "Monday",
        startTime: "10.00AM",
        endTime: "12.00PM"
      },
      {
        classType: "Tutorial",
        group: 2,
        day: "Wednesday",
        startTime: "12.00PM",
        endTime: "2.00PM"
      }
    ]
  }, {
    subjectName: "ABC123 - Database Fundamental II",
    creditHours: 4,
    selectedClassTypes: [
      {
        classType: "Lecture",
        group: 1,
        day: "Monday",
        startTime: "10.00AM",
        endTime: "12.00PM"
      },
      {
        classType: "Tutorial",
        group: 2,
        day: "Wednesday",
        startTime: "12.00PM",
        endTime: "2.00PM"
      }
    ]
  }
]

/** This button is needed for popping up the modal. */
function ChooseSubjectButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="font-nunito-sans ml-auto px-4 py-2 bg-blue-air-superiority text-white font-bold text-base flex justify-center items-center rounded-sm hover:bg-blue-yinmn cursor-pointer"
      onClick={onClick}>
      Choose
    </Button>
  );
}

function EnrollmentSelection({
  name,
  selections,
  selectedEnrollmentSubjectIndexesModal,
  setSelectedEnrollmentSubjectIndexesModal,
  subjectId,
  classTypeId
}:
  {
    name: string,
    selections: [{
      enrollmentSubjectTypeId: number;
      grouping: number;
      dayId: number;
      day: string;
      startTime: string;
      endTime: string;
    }],
    selectedEnrollmentSubjectIndexesModal: any,
    setSelectedEnrollmentSubjectIndexesModal: React.Dispatch<React.SetStateAction<any>>,
    subjectId: number,
    classTypeId: number
  }) {

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




  function test(e: React.ChangeEvent<HTMLInputElement>) {


    if (e.target.checked) {

      if (selectedEnrollmentSubjectIndexesModal[subjectId][classTypeId][e.target.value]) {

        return;

      } else {

        selectedEnrollmentSubjectIndexesModal[subjectId][classTypeId][e.target.value] = true;

      }

    } else {

      if (selectedEnrollmentSubjectIndexesModal[subjectId][classTypeId][e.target.value]) {

        selectedEnrollmentSubjectIndexesModal[subjectId][classTypeId][e.target.value] = undefined;

      } else {

        return;
      }

    }
  }

  return (
    <div className="flex flex-col gap-y-6">
      {selections.map((classType) => (
        <label className="font-nunito-sans flex flex-col text-gray-battleship border rounded-xl p-8 border-gray-battleship [&:has(input:checked)]:text-blue-air-superiority
            [&:has(input:checked)]:border-blue-air-superiority cursor-pointer select-none"
          htmlFor={name + classType.grouping}>
          <div className="flex items-center gap-x-8">
            <input className="border-2 rounded-2xl align-middle min-w-4 min-h-4 appearance-none outline-hidden border-gray-battleship checked:bg-blue-air-superiority checked:border-blue-air-superiority cursor-pointer"
              id={name + classType.grouping} type="radio" name={name} onChange={(e) => { test(e) }} value={classType.enrollmentSubjectTypeId} />
            <div className="flex justify-between w-full items-center flex-wrap gap-y-2">
              <div className="flex flex-col min-w-6/9">
                <h3 className="font-medium">Group {classType.grouping}</h3>
                <span>
                  {classType.day} {convert24UTCTimeTo12LocalTime(classType.startTime)} - {convert24UTCTimeTo12LocalTime(classType.endTime)}
                </span>
              </div>
              <span>
                Total Number: 32/40
              </span>
            </div>


          </div>


        </label>
      ))}
    </div>
  );
}



export default function StudentEnrollment() {
  const { authToken } = useStudent();
  const [selectedViewEnrollmentSubjectIndex, setSelectedViewEnrollmentSubjectIndex] = useState(1);
  const [studentEnrollmentSchedule, setStudentEnrollmentSchedule] = useState<StudentEnrollmentSchedule | undefined>(undefined);
  const [studentEnrollmentSubjects, setStudentEnrollmentSubjects] = useState<StudentEnrollmentSubjectOrganizedData[]>([]);
  const [selectedEnrollmentSubjectsIndexes, setSelectedEnrollmentSubjectsIndexes] = useState<any>({});
  const [selectedEnrollmentSubjectIndexesModal, setSelectedEnrollmentSubjectIndexesModal] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    fetchEnrollmentSubjects();
  }, [authToken]);

  async function fetchEnrollmentSubjects(){
    const response: Response | undefined = await fetchEnrollmentSubjectsAPI(authToken);

    if (!response || !response.ok) {
      // This should go to 404.
      setStudentEnrollmentSchedule(undefined);
      setStudentEnrollmentSubjects([]);
      return;
    }

    const responseData = await response.json();


    setStudentEnrollmentSchedule(responseData.data.studentEnrollmentSchedule);
    setStudentEnrollmentSubjects(responseData.data.studentEnrollmentSubjects);
  }




  if (isLoading) {
    return <div></div>
  }
  console.log(studentEnrollmentSubjects);
  console.log(selectedViewEnrollmentSubjectIndex)
  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash pb-40">
      <StudentNavbar page="enrollment" />


      <main className="px-10 py-10 flex-1">
        <h1 className="text-black font-bold">Available Subjects{studentEnrollmentSubjects[selectedViewEnrollmentSubjectIndex].creditHours}</h1>
        <p className="text-gray-500 font-normal mt-3">Select your subjects for the upcoming semester</p>

        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by subject code or subject name..."
            className="text-black pl-12 p-4 text-lg font-normal rounded-lg w-full border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <DialogTrigger>
            {studentEnrollmentSubjects.map((subj, index) => (
              <div
                key={index}
                // onClick={() => setSelectedSubjectIndex(index)}
                className={`flex flex-wrap gap-y-4 items-center p-6 rounded-xl shadow-sm cursor-pointer transition-all duration-200 bg-white
                            ${selectedViewEnrollmentSubjectIndex === index ? "border-2 border-blue-500" : "hover:shadow-md border border-transparent"}`}
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
                    <p className="text-red-500 text-sm font-medium">
                      {/* Total seat left: {subj.} */}
                    </p>
                  </div>
                </div>

                <ChooseSubjectButton onClick={() => { setSelectedViewEnrollmentSubjectIndex(index) }} />
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
                    {/* <div className="flex flex-col px-12 py-8 gap-y-8 overflow-auto max-h-256 text-gray-charcoal text-left font-semibold">
                      <h1 className="text-black">Select Groups for {studentEnrollmentSubjects[selectedViewEnrollmentSubjectIndex].subjectCode} - {studentEnrollmentSubjects[selectedViewEnrollmentSubjectIndex].subjectName}</h1>

                      {
                        studentEnrollmentSubjects[selectedViewEnrollmentSubjectIndex].classTypes.map((classType) => {
                          return (
                            <div className="flex flex-col gap-y-6">
                              <h2>{classType.classType} Groups</h2>
                              <EnrollmentSelection name={classType.classType} selections={classType.classTypeDetails} subjectId={studentEnrollmentSubjects[selectedViewEnrollmentSubjectIndex].subjectId} classTypeId={classType.classTypeId} selectedEnrollmentSubjectIndexesModal={selectedEnrollmentSubjectIndexesModal}
                                setSelectedEnrollmentSubjectIndexesModal={setSelectedEnrollmentSubjectIndexesModal} />
                            </div>
                          )
                        })
                      }
                    </div> */}
                    <div className="flex flex-col items-end bg-platinum px-8 py-4 rounded-b-2xl">
                      <div className="flex gap-x-4">
                        <MediumButton buttonText="Cancel" backgroundColor="bg-gray-battleship" hoverBgColor="hover:bg-gray-charcoal" onClick={close} />
                        {/* <MediumButton buttonText="Confirm" onClick={anotherTest} /> */}
                        <Button slot="close">TEST</Button>
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
              {/* Total Subjects Selected: {selected !== null ? 1 : 0} | Total Credit Hours Selected: {selected !== null ? subjects[selected]?.credits : 0} */}
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
                    role="alertdialog"
                    className="bg-white rounded-2xl flex flex-col mx-auto pointer-events-auto"
                  >
                    {({ close }) => (
                      <div className="flex flex-col items-center text-black gap-y-8 p-8">
                        <div className="flex flex-col items-center gap-y-4">
                          <h2 className="font-bold">Are you sure you want to enroll in these subjects?</h2>
                          <p>You may change your choice after confirmation.</p>
                        </div>
                        <div className="flex flex-wrap gap-x-4">
                          <MediumButton buttonText="Cancel" backgroundColor="bg-red-tomato" hoverBgColor="hover:bg-red-500" onClick={close} />
                          <MediumButton buttonText="Confirm" onClick={close} />
                        </div>
                      </div>
                    )}
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
                        <Timetable token={authToken} />
                      </div>
                      <div className="flex flex-col gap-y-8">
                        <h1>Selected Subjects</h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {SELECTED_SUBJECTS.map((subject, index) => {
                            return (
                              <div className="bg-white p-8 flex flex-col gap-y-8 rounded-2xl mr-4">
                                <div className="flex flex-wrap gap-y-4">
                                  <div className="flex gap-x-8 flex-wrap items-start mr-auto gap-y-4">
                                    <div className="bg-white-antiflash p-2 rounded-sm">
                                      <Book className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col">
                                      <p>{subject.subjectName}</p>
                                      <p className="text-gray-battleship">{"Credit Hours: " + subject.creditHours}</p>
                                    </div>
                                  </div>

                                  <Trash2 className="w-6 h-6 text-red-tomato ml-auto" />
                                </div>

                                <div className="flex flex-wrap gap-y-4">
                                  <div className="flex flex-col gap-y-2 max-w-xs mr-auto">
                                    {subject.selectedClassTypes.map((selectedClassType) => {
                                      return (
                                        <p>
                                          {selectedClassType.classType + " Group " + selectedClassType.group +
                                            ", " + selectedClassType.day + " " + selectedClassType.startTime + " - " + selectedClassType.endTime
                                          }
                                        </p>
                                      );
                                    })}
                                  </div>
                                  <SquarePen className="w-6 h-6 ml-auto" />

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
