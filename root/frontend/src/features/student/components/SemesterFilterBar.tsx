import { Search } from "lucide-react";

interface SubjectFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSemester: number;
  onSemesterChange: (value: string) => void;
}

export default function SubjectFilterBar({
  searchTerm,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
}: SubjectFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Search by Subject Code or Subject Name..."
          className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black transition-all"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="absolute left-3 top-2.5 text-gray-400">
          <Search size={20} />
        </span>
      </div>

      <div className="w-full sm:w-1/4">
        <select
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white"
          value={selectedSemester}
          onChange={(e) => onSemesterChange(e.target.value)}
        >
          <option value="0">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
          <option value="9">Semester 9</option>
        </select>
      </div>
    </div>
  );
}
