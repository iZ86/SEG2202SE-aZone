import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleBlur = () => {
    // if user leaves input empty or invalid, reset it to currentPage
    const page = Number(inputValue);
    if (inputValue === "" || isNaN(page) || page < 1 || page > totalPages) {
      setInputValue(currentPage.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setInputValue("");
      return;
    }

    const page: number = Number(value);
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setInputValue(value);
      onPageChange(page);
    }
  };

  return (
    <>
      <div className="items-center flex h-10 gap-x-3">
        <button
          className={`w-10 h-full px-1 rounded border border-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300 items-center flex ${
            currentPage === 1
              ? "disabled:opacity-50 cursor-not-allowed"
              : "active:scale-95 active:bg-gray-400"
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="text-sm" />
        </button>

        <input
          type="text"
          max={totalPages}
          value={inputValue}
          onBlur={handleBlur}
          onChange={handleInputChange}
          className={`w-12 text-center h-full rounded border border-gray-400 active:scale-95 text-md text-black`}
        />
        <p className="text-gray-700">
          of <span className="font-bold ml-2">{totalPages}</span>
        </p>

        <button
          className={`w-10 h-full px-1 rounded border border-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300 items-center flex ${
            currentPage === totalPages
              ? "disabled:opacity-50 cursor-not-allowed"
              : "active:scale-95 active:bg-gray-400"
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="text-sm" />
        </button>
      </div>
    </>
  );
}
