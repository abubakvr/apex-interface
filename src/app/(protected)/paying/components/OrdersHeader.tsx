// OrdersHeader.tsx
import { FaDownload, FaMoneyBillWave, FaMoneyCheck } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";

interface OrdersHeaderProps {
  ordersCount: number;
  refetch: () => void;
  handlePayAllOrders: () => void;
  payAllLoading: boolean;
}

export function OrdersHeader({
  ordersCount,
  refetch,
  handlePayAllOrders,
  payAllLoading,
}: OrdersHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex space-x-4 items-center">
        <div className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
          Total Orders: {ordersCount}
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-blue-300/50 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reload
        </button>

        <a
          href={`/api/export-orders?token=${localStorage.getItem(
            "accessToken"
          )}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-blue-300/50 flex items-center gap-2"
        >
          <FaDownload className="w-4 h-4" />
          Download CSV
        </a>
      </div>

      <button
        onClick={handlePayAllOrders}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-blue-300/50 flex items-center gap-2"
        disabled={payAllLoading}
      >
        {payAllLoading ? (
          <>
            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
            Paying...
          </>
        ) : (
          <>
            <FaMoneyCheck className="w-4 h-4" />
            Pay All
          </>
        )}
      </button>
    </div>
  );
}
