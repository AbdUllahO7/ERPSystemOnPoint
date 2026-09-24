import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ecommerceOrdersApi } from "../api/ecommerce-orders.api";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";

export const ORDER_DETAILS_QUERY_KEY = (id) => ["ecommerce-order-details", id];

export function useOrderDetails(orderId) {
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch Order Details with React Query caching
  const {
    data: order = null,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ORDER_DETAILS_QUERY_KEY(orderId),
    queryFn: () => ecommerceOrdersApi.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });

  // Mutate Order Status with optimistic cache update
  const statusMutation = useMutation({
    mutationFn: (newStatus) => ecommerceOrdersApi.updateOrderStatus(orderId, newStatus),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ORDER_DETAILS_QUERY_KEY(orderId) });
      const previousOrder = queryClient.getQueryData(ORDER_DETAILS_QUERY_KEY(orderId));
      queryClient.setQueryData(ORDER_DETAILS_QUERY_KEY(orderId), (old) =>
        old ? { ...old, status: newStatus } : old
      );
      return { previousOrder };
    },
    onError: (err, newStatus, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(ORDER_DETAILS_QUERY_KEY(orderId), context.previousOrder);
      }
      toast.error("Failed to update status");
    },
    onSuccess: (data, newStatus) => {
      toast.success(`Order status updated to ${newStatus}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_DETAILS_QUERY_KEY(orderId) });
      queryClient.invalidateQueries({ queryKey: ["ecommerce-orders"] });
    },
  });

  const handleToggleItem = useCallback((itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const rawItems = useMemo(() => order?.items || [], [order?.items]);

  const handleToggleAllItems = useCallback(() => {
    if (selectedItems.length === rawItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(rawItems.map((i) => i.id));
    }
  }, [rawItems, selectedItems.length]);

  const handleChangeStatus = useCallback(
    (newStatus = "Processing") => {
      statusMutation.mutate(newStatus);
    },
    [statusMutation]
  );

  const filteredItems = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return rawItems;
    const query = debouncedSearchQuery.toLowerCase();
    return rawItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [rawItems, debouncedSearchQuery]);

  return {
    order,
    items: filteredItems,
    selectedItems,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetch,
    handleToggleItem,
    handleToggleAllItems,
    handleChangeStatus,
  };
}

export default useOrderDetails;
