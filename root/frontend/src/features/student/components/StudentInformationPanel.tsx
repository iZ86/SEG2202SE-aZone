import profile from "@images/char kuey teow.jpg";
/** TBD: A042.
 * Do whatever you want, iZ86 will handle API.
 */
export default function StudentInformationPanel() {
  /** TODO: Fill in this with the appropriate components. */
  const studentInfo = [
    { label: "Programme", value: "Bachelor of Software Engineering" },
    { label: "Intake", value: "202509" },
    { label: "Study Mode", value: "Full Time" },
    { label: "Current Semester", value: "4" },
    { label: "Semester Period", value: "22 Sep 2025 to 16 Jan 2026" },
  ];

  return (
    <div className="flex text-black m-5 p-6 bg-white shadow-lg rounded-lg w-full gap-4">
      <div>
        <h2 className="font-semibold pb-5">Isaac Yeow Ming (2301838)</h2>

        <div className="space-y-3">
          {studentInfo.map((info) => (
            <div key={info.label} className="grid grid-cols-3 gap-15">
              <span className="text-gray-600">{info.label}</span>
              <span className="font-medium col-span-2 justify-items-end">
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <img
          src={profile}
          alt="profile"
          className="w-40 h-50 rounded-md mt-3"
        />
      </div>
    </div>
  );
}
