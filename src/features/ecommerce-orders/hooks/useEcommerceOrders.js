import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ecommerceOrdersApi } from "../api/ecommerce-orders.api";
import { useDebounce } from "@/hooks/useDebounce";

export const ORDERS_QUERY_KEY = ["ecommerce-orders"];
export const ORDERS_METRICS_QUERY_KEY = ["ecommerce-orders-metrics"];

export function useEcommerceOrders() {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch metrics and orders in parallel with React Query caching
  const {
    data: metrics = [],
    isLoading: isMetricsLoading,
  } = useQuery({
    queryKey: ORDERS_METRICS_QUERY_KEY,
    queryFn: () => ecommerceOrdersApi.getOrdersMetrics(),
    staleTime: 60 * 1000,
  });

  const {
    data: rawOrders = [],
    isLoading: isOrdersLoading,
    refetch,
  } = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => ecommerceOrdersApi.getOrdersList(),
    staleTime: 30 * 1000,
  });

  const handleToggleOrder = useCallback((orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  }, []);

  const handleToggleAllOrders = useCallback(() => {
    if (selectedOrders.length === rawOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(rawOrders.map((o) => o.id));
    }
  }, [rawOrders, selectedOrders.length]);

  // Memoized search filtering using debounced query for maximum UI responsiveness
  const filteredOrders = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return rawOrders;
    const query = debouncedSearchQuery.toLowerCase();
    return rawOrders.filter(
      (ord) =>
        ord.orderNumber.toLowerCase().includes(query) ||
        ord.customerName.toLowerCase().includes(query)
    );
  }, [rawOrders, debouncedSearchQuery]);

  return {
    metrics,
    orders: filteredOrders,
    selectedOrders,
    searchQuery,
    setSearchQuery,
    isLoading: isMetricsLoading || isOrdersLoading,
    refetch,
    handleToggleOrder,
    handleToggleAllOrders,
  };
}

export default useEcommerceOrders;
