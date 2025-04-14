import { useQuery } from "@tanstack/react-query";
import { OrderDetails, OrderStatus } from "@/types/order";
import { BASE_URL } from "@/lib/constants";
import { fetchData } from "@/lib/helpers";
import { matchBank } from "@/lib/matchBank";

const getOrderDetails = async (id: string): Promise<OrderDetails> => {
  try {
    const data = await fetchData(`${BASE_URL}/api/p2p/orders/${id}`);
    if (!data) throw new Error("No data returned from API");
    return data;
  } catch (err: any) {
    console.error("Error fetching order details:", err);
    throw err;
  }
};

// Helper function to chunk an array into smaller arrays
const chunkArray = <T = any,>(array: T[], chunkSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

export const useGetOrders = ({
  page,
  size,
  status = OrderStatus.FINISH_ORDER,
  side = 0,
}: {
  page: number;
  size: number;
  status?: OrderStatus;
  side?: number;
}) => {
  const query = useQuery({
    queryKey: ["orders", page, size, status, side],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        const response = await fetch(`${BASE_URL}/api/p2p/orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            size,
            status,
            side,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data?.result?.items || !Array.isArray(data.result.items)) {
          console.warn("API returned unexpected data structure");
          return [];
        }

        const dataArray = data.result.items;
        const orderIds = dataArray.map((item: any) => item.id).filter(Boolean);

        if (orderIds.length === 0) {
          return [];
        }

        // Fetch order details in optimized batches
        const orderDetails = await getBulkOrderDetailsBatched(orderIds);
        return orderDetails;
      } catch (error: any) {
        console.error("Error in useGetOrders:", error);
        throw error;
      }
    },
  });

  return query;
};

// New function to fetch order details in batches
export const getBulkOrderDetailsBatched = async (
  orderIds: string[],
  batchSize = 5 // Adjust this based on server capabilities
): Promise<OrderDetails[]> => {
  try {
    // Split the order IDs into smaller chunks
    const batches = chunkArray(orderIds, batchSize);
    let allOrderDetails: OrderDetails[] = [];

    // Process each batch of order IDs
    for (const batch of batches) {
      // Process this batch concurrently
      const batchPromises = batch.map(async (id) => {
        try {
          const details = await getOrderDetails(id);
          return {
            ...details,
            paymentTermList: Array.isArray(details.paymentTermList)
              ? details.paymentTermList
              : [],
          };
        } catch (error: any) {
          console.error(`Failed to fetch order details for ID ${id}:`, error);
          return null;
        }
      });

      // Wait for the current batch to complete
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(
        (result): result is OrderDetails =>
          result !== null && result !== undefined
      );

      // Add the results to our collection
      allOrderDetails = [...allOrderDetails, ...validResults];

      // Add a small delay between batches to avoid overwhelming the server
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    allOrderDetails.forEach((order) => {
      // Safely access payment term data with null checks
      const paymentList = order.paymentTermList || [];
      const paymentTerm = paymentList.length > 0 ? paymentList[0] : null;

      console.log("Bank Name", paymentTerm?.bankName);
      console.log("Bank Code", matchBank(paymentTerm?.bankName)?.BANK_CODE);
      console.log("Account Number", paymentTerm?.accountNo);
      console.log("Amount", order.amount);
    });

    return allOrderDetails;
  } catch (err: any) {
    console.error("Error fetching bulk order details in batches:", err);
    return [];
  }
};

// Cache results to further improve performance
// This can be a simple in-memory cache
const orderDetailsCache: Record<string, OrderDetails> = {};

// Optional cache wrapper for getOrderDetails
const getCachedOrderDetails = async (id: string): Promise<OrderDetails> => {
  // Check if we have this order in cache
  if (orderDetailsCache[id]) {
    return orderDetailsCache[id];
  }

  // If not in cache, fetch it
  const orderDetails = await getOrderDetails(id);

  // Store in cache for future use
  orderDetailsCache[id] = orderDetails;

  return orderDetails;
};

// Clear cache when it gets too large (optional)
const clearCacheIfNeeded = () => {
  const cacheSize = Object.keys(orderDetailsCache).length;
  if (cacheSize > 100) {
    // Arbitrary limit
    console.log("Clearing order details cache");
    for (const key of Object.keys(orderDetailsCache)) {
      delete orderDetailsCache[key];
    }
  }
};
