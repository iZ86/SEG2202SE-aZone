/** TBD: A042.
 * Do whatever you want, iZ86 will handle API.
 */
export default function TimetablePanel() {
  /** TODO: Fill in this with the appropriate components. */
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const classes = [
    {
      day: "Mon",
      time: "8:00 AM - 10:00 AM",
      code: "ABC666",
      name: "Software Engineering",
      venue: "Computer Lab",
      grouping: "1",
      lecturer: "Dr. Isaac",
      color: "text-[#F1A3A3] bg-red-100 border-red-500",
    },
    {
      day: "Tue",
      time: "12:00 PM - 2:00 PM",
      code: "ABC666",
      name: "Software Engineering",
      venue: "Computer Lab",
      grouping: "1",
      lecturer: "Dr. Isaac",
      color: "text-[#A3CEF1] bg-blue-100 border-blue-500",
    },
    {
      day: "Wed",
      time: "10:00 AM - 12:00 PM",
      code: "AYO123",
      name: "Database Fundamentals II",
      venue: "Computer Lab",
      grouping: "6",
      lecturer: "Dr. Isaac",
      color: "text-[#A3CEF1] bg-blue-100 border-blue-500",
    },
    {
      day: "Fri",
      time: "8:00 AM - 10:00 AM",
      code: "AYO123",
      name: "Database Fundamentals II",
      venue: "Computer Lab",
      grouping: "6",
      lecturer: "Dr. Isaac",
      color: "text-[#F1A3A3] bg-red-100 border-red-500",
    },
    {
      day: "Fri",
      time: "12:00 AM - 2:00 PM",
      code: "ABC666",
      name: "Software Engineering",
      venue: "Computer Lab",
      grouping: "1",
      lecturer: "Dr. Isaac",
      color: "text-[#A3CEF1] bg-blue-100 border-blue-500",
    },
    {
      day: "Mon",
      time: "10:00 PM - 12:00 PM",
      code: "AYO123",
      name: "Database Fundamentals II",
      venue: "Computer Lab",
      grouping: "6",
      lecturer: "Dr. Isaac",
      color: "text-[#A3CEF1] bg-blue-100 border-blue-500",
    },
    {
      day: "Wed",
      time: "12:00 PM - 2:00 PM",
      code: "GG717",
      name: "Java Programming",
      venue: "Computer Lab",
      grouping: "7",
      lecturer: "Dr. Isaac",
      color: "text-[#F1A3A3] bg-red-100 border-red-500",
    },
    {
      day: "Mon",
      time: "4:00 PM - 6:00 PM",
      code: "GG717",
      name: "Java Programming",
      venue: "Computer Lab",
      grouping: "7",
      lecturer: "Dr. Isaac",
      color: "text-[#A3CEF1] bg-blue-100 border-blue-500",
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-md p-7">
      <div className="text-black flex flex-col sm:flex-row justify-between mb-8">
        <h2 className="text-black font-bold">
          My Weekly Timetable (13 October 2025 - 17 October 2025)
        </h2>
        <div className="flex mt-4 sm:mt-0">
          <button className="bg-[#E5E5E5] px-6 rounded-l-2xl hover:bg-gray-100 cursor-pointer">
            Previous
          </button>
          <button className="bg-[#E5E5E5] px-4 py-3 hover:bg-gray-100 cursor-pointer">
            Current Week
          </button>
          <button className="bg-[#E5E5E5] px-6 rounded-r-2xl hover:bg-gray-100 cursor-pointer">
            Next
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-x-36 gap-y-6 xl:gap-6  min-w-[700px]">
          {days.map((days) => (
            <div
              key={days}
              className="text-black font-semibold bg-white-antiflash py-3 rounded-t-lg text-center min-w-32"
            >
              {days}
            </div>
          ))}

          {days.map((days) => (
            <div key={days} className="space-y-2 min-w-32">
              {classes
                .filter((c) => c.day === days)
                .map((classItem, index) => (
                  <div
                    key={index}
                    className={`${classItem.color} border-l-5 py-3 px-2 rounded-lg text-sm`}
                  >
                    <p className="font-bold">{classItem.time}</p>
                    <p className="font-bold text-black mt-2">
                      {classItem.code} - {classItem.name}
                    </p>
                    <p className="font-bold text-[#666666] mt-5">
                      Venue: {classItem.venue}
                    </p>
                    <p className="font-bold text-[#666666]">
                      Grouping: {classItem.grouping}
                    </p>
                    <p className="font-bold text-[#666666]">
                      Lecturer: {classItem.lecturer}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
