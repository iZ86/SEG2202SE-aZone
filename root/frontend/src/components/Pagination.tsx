import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number, pageSize: number) => void;
}) {
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [pageSize, setPageSize] = useState<number>(15);

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
      onPageChange(page, pageSize);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    onPageChange(1, newSize);
  };

  return (
    <>
      <div className="items-center flex h-10 gap-x-3">
        <div className="flex items-center gap-x-2 h-full justify-center mr-4">
          <label className="text-gray-700 text-sm font-medium">Rows:</label>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-full border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
          >
            {[5, 10, 15, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`w-10 h-full px-1 rounded border border-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300 items-center justify-center flex ${
            currentPage === 1
              ? "disabled:opacity-50 cursor-not-allowed"
              : "active:scale-95 active:bg-gray-400"
          }`}
          onClick={() => onPageChange(currentPage - 1, pageSize)}
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
          className={`max-w-11 text-center h-full flex items-center justify-center rounded border border-gray-400 active:scale-95 text-md text-black`}
        />
        <p className="text-gray-700 text-center items-center flex justify-center">
          of <span className="font-bold ml-2">{totalPages}</span>
        </p>

        <button
          className={`w-10 h-full px-1 rounded border border-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300 items-center justify-center flex ${
            currentPage === totalPages
              ? "disabled:opacity-50 cursor-not-allowed"
              : "active:scale-95 active:bg-gray-400"
          }`}
          onClick={() => onPageChange(currentPage + 1, pageSize)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="text-sm" />
        </button>
      </div>
    </>
  );
}
