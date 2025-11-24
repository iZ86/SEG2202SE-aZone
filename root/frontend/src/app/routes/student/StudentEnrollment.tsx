import StudentNavbar from "@components/student/StudentNavbar";
import { Search, ClipboardList, Trash2, SquarePen, Book, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay, Button } from "react-aria-components";
import MediumButton from "@components/MediumButton";
import Timetable from "@features/timetable/components/Timetable";


const LECTURES = [
  ["Group 1", "Monday 10:00 AM - 12.00 PM"]
]

const TUTORIALS = [
  ["Group 1", "Monday 12:00 PM - 2.00 PM"],
  ["Group 2", "Wednesday 12:00 PM - 2.00 PM"]
]

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
  },{
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
function ChooseSubjectButton() {
  return (
    <Button className="font-nunito-sans px-4 py-2 bg-blue-air-superiority text-white font-bold text-base flex justify-center items-center rounded-sm hover:bg-blue-yinmn cursor-pointer">
      Choose
    </Button>
  );
}

function EnrollmentSelection({
  name,
  selections
}:
  {
    name: string,
    selections: string[][]
  }) {
  return (
    <div className="flex flex-col gap-y-6">
      {selections.map(([group, label]) => (
        <label className="font-nunito-sans flex flex-col text-gray-battleship border rounded-xl p-8 border-gray-battleship [&:has(input:checked)]:text-blue-air-superiority
            [&:has(input:checked)]:border-blue-air-superiority cursor-pointer select-none"
          htmlFor={name + group}>
          <div className="flex items-center gap-x-8">
            <input className="border-2 rounded-2xl align-middle min-w-4 min-h-4 appearance-none outline-hidden border-gray-battleship checked:bg-blue-air-superiority checked:border-blue-air-superiority cursor-pointer"
              id={name + group} type="radio" name={name} />
            <div className="flex justify-between w-full items-center flex-wrap gap-y-2">
              <div className="flex flex-col min-w-6/9">
                <h3 className="font-medium">{group}</h3>
                <span>
                  {label}
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
  const [selected, setSelected] = useState(0);

  // for display only
  const subjects = [
    { code: "ABC123", name: "Database Fundamental II", credits: 4, seats: "4/200" },
    { code: "DEF456", name: "Web Programming", credits: 3, seats: "12/200" },
    { code: "GHI789", name: "Data Structures", credits: 3, seats: "50/200" },
    { code: "JKL101", name: "Software Engineering", credits: 3, seats: "18/200" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white-antiflash">
      <StudentNavbar page="enrollment" />


      <main className="px-10 py-10 flex-1">
        <h1 className="text-black font-bold">Available Subjects</h1>
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
            {subjects.map((subj, index) => (
              <div
                key={index}
                onClick={() => setSelected(index)}
                className={`flex items-center justify-between p-6 rounded-xl shadow-sm cursor-pointer transition-all duration-200 bg-white
                            ${selected === index ? "border-2 border-blue-500" : "hover:shadow-md border border-transparent"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <ClipboardList className="text-gray-700 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {subj.code} - {subj.name}
                    </h3>
                    <p className="text-gray-600 text-sm">Credit Hours: {subj.credits}</p>
                    <p className="text-red-500 text-sm font-medium">
                      Total seat left: {subj.seats}
                    </p>
                  </div>
                </div>

                <ChooseSubjectButton />
              </div>
            ))}
            <ModalOverlay isDismissable
              className={({ isEntering, isExiting }) => `
          absolute top-0 left-0 w-full min-h-screen z-20 bg-black/50 isolate flex flex-col justify-center
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
                  {({ close }) => (
                    <div className="flex flex-col">
                      <div className="flex flex-col px-12 py-8 gap-y-8 overflow-auto max-h-256 text-gray-charcoal text-left font-semibold">
                        <h1 className="text-black">Select Groups for ABC123 - Database Fundamental II</h1>

                        <div className="flex flex-col gap-y-6">
                          <h2>Lecture Groups</h2>
                          <EnrollmentSelection name="lecture" selections={LECTURES} />
                        </div>


                        <div className="flex flex-col gap-y-6">
                          <h2>Tutorial Groups</h2>
                          <EnrollmentSelection name="tutorial" selections={TUTORIALS} />
                        </div>


                      </div>
                      <div className="flex flex-col items-end bg-platinum px-8 py-4 rounded-b-2xl">
                        <div className="flex gap-x-4">
                          <MediumButton buttonText="Cancel" backgroundColor="bg-gray-battleship" hoverBgColor="hover:bg-gray-charcoal" onClick={close} />
                          <MediumButton buttonText="Confirm" onClick={close} />
                        </div>


                      </div>
                    </div>
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>

          </DialogTrigger>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200">
          <div className="flex justify-between items-center px-10 py-6">
            <h4 className="text-black font-semibold">
              Total Subjects Selected: {selected !== null ? 1 : 0} | Total Credit Hours Selected: {selected !== null ? subjects[selected]?.credits : 0}
            </h4>
            <MediumButton buttonText="Submit Enrollment" submit={true} />
          </div>
        </div>

        <DialogTrigger>
          <Button className="fixed bottom-30 right-10 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all cursor-pointer">
            <ClipboardList className="w-6 h-6" />
          </Button>
          <ModalOverlay isDismissable
            className={({ isEntering, isExiting }) => `
          absolute top-0 left-0 w-full min-h-screen z-20 bg-black/50 isolate flex pl-[10%]
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
                        <Timetable />
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
