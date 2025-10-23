import StudentNavbar from "@components/student/StudentNavbar";
import { Search, ClipboardList } from "lucide-react";
import { useState } from "react";
import MediumButton from "@components/MediumButton";

export default function Enrollment() {
    const [selected, setSelected] = useState(null);

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
                            
                            <MediumButton buttonText="Choose" submit={true} />
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200">
                    <div className="flex justify-between items-center px-10 py-6">
                        <h3 className="text-black">
                            Total Subjects Selected: {selected !== null ? 1 : 0} | Total Credit Hours Selected: {selected !== null ? subjects[selected]?.credits : 0}
                        </h3>
                        <MediumButton buttonText="Submit Enrollment" submit={true} />
                    </div>
                </div>

                <button className="fixed bottom-30 right-10 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all">
                    <ClipboardList className="w-6 h-6" />
                </button>
            </main>
        </div>
    );
}