import { Link } from "react-router-dom";

/** TBD: A042.
 * Do whatever you want, iZ86 will handle API.
 */
export default function SubjectInformationPanel() {
  /** TODO: Fill in this with the appropriate components. */
  const subjects = [
    { code: "ABC666", name: "Software Engineering", creditHours: 4 , color: "border-pink-500"},
    { code: "AYO123", name: "Database Fundamental II", creditHours: 4 , color: "border-pink-500"},
    { code: "GG717", name: "Java Programming", creditHours: 4 , color: "border-orange-500"}
  ];

  return (
    <div className="shadow-lg p-6 rounded-lg bg-white">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-black font-bold">My Subjects</h2>
        <Link to="/enrollment" className="text-[#666666]">
          more &gt;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-black mt-4">
        {subjects.map((subject) => (
          <div
            key={subject.code}
            className={`border-l-4 ${subject.color} p-3 pl-5 shadow-xl rounded-lg bg-black/5`}
          >
            <h5>{subject.creditHours} Credit Hours</h5>
            <p className="font-bold">
              {subject.code} - {subject.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
