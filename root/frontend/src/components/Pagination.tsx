import { ChevronLeft, ChevronRight} from "lucide-react";

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <>
      <div className="items-center flex h-10">
        <button
          className={`mx-1 h-full px-1 rounded border border-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 active:bg-gray-400 items-center flex ${
            currentPage === 1 ? "disabled:opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="text-sm" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`mx-1 h-full px-4 rounded border border-gray-400 active:scale-95 text-md ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className={`mx-1 h-full px-1 rounded border border-gray-400 bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 active:bg-gray-400 items-center flex ${
            currentPage === totalPages
              ? "disabled:opacity-50 cursor-not-allowed"
              : ""
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
