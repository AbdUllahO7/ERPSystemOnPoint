import { useState, useEffect, useCallback } from "react";
import { ecommerceOrdersApi } from "../api/ecommerce-orders.api";
import toast from "react-hot-toast";

export function useEcommerceOrders() {
  const [metrics, setMetrics] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsData, ordersData] = await Promise.all([
        ecommerceOrdersApi.getOrdersMetrics(),
        ecommerceOrdersApi.getOrdersList(),
      ]);
      setMetrics(metricsData);
      setOrders(ordersData);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleToggleOrder = useCallback((orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  }, []);

  const handleToggleAllOrders = useCallback(() => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  }, [orders, selectedOrders.length]);

  const filteredOrders = orders.filter(
    (ord) =>
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    metrics,
    orders: filteredOrders,
    selectedOrders,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetch: fetchOrders,
    handleToggleOrder,
    handleToggleAllOrders,
  };
}

export default useEcommerceOrders;
