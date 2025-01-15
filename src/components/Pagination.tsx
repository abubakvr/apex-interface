"use client";
import { useRouter } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  currentStatus: number;
  currentSide: number;
}

export const Pagination = ({
  currentPage,
  totalPages,
  currentStatus,
  currentSide,
}: PaginationProps) => {
  const router = useRouter(); // Use useRouter

  const handlePageChange = (page: number) => {
    const query = {
      page: page.toString(),
      status: currentStatus.toString(),
      side: currentSide.toString(),
    };
    router.push(`/orders?${new URLSearchParams(query).toString()}`); // Construct the URL string
  };

  return (
    <div className="mt-6 flex justify-center items-center space-x-2">
      <button
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Previous
      </button>
      <select
        value={currentPage}
        onChange={(e) => handlePageChange(parseInt(e.target.value, 10))}
        className="px-3 py-1 border rounded"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <option key={pageNum} value={pageNum}>
            {pageNum}
          </option>
        ))}
      </select>
      <button
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
