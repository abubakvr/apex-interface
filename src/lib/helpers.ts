import { OrderStatus } from "./constants";

export const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.WAITING_FOR_CHAIN]: "Waiting for Chain",
    [OrderStatus.WAITING_FOR_BUY_PAY]: "Waiting for Payment",
    [OrderStatus.WAITING_FOR_SELLER_RELEASE]: "Waiting for Release",
    [OrderStatus.APPEALING]: "Appealing",
    [OrderStatus.CANCEL_ORDER]: "Cancelled",
    [OrderStatus.FINISH_ORDER]: "Completed",
    [OrderStatus.PAYING]: "Paying",
    [OrderStatus.PAY_FAIL]: "Payment Failed",
    [OrderStatus.EXCEPTION_CANCELED]: "Exception Cancelled",
    [OrderStatus.WAITING_BUYER_SELECT_TOKEN]: "Waiting Token Selection",
    [OrderStatus.OBJECTING]: "Objecting",
    [OrderStatus.WAITING_FOR_OBJECTION]: "Waiting for Objection",
  };
  return statusMap[status] || "Unknown";
};

export const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const rawData = await response.json();
  return rawData.data.result;
};

/**
 * Formats a date string or timestamp into a readable format.
 * @param {string | number | Date} dateInput - The date value to format (ISO string, timestamp, or Date object).
 * @param {string} locale - The locale for formatting (default is 'en-US').
 * @param {Object} options - Optional formatting options for the date (e.g., year, month, day).
 * @returns {string} - The formatted date or 'Invalid Date' if the input is not valid.
 */
export function formatDate(
  dateInput: string,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
) {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleDateString(locale, options);
}

export const getStatusBadgeColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.FINISH_ORDER:
      return "bg-green-100 text-green-800";
    case OrderStatus.PAYING:
    case OrderStatus.WAITING_FOR_BUY_PAY:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.APPEALING:
    case OrderStatus.OBJECTING:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
