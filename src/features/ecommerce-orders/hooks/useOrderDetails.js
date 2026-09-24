import { useState, useEffect, useCallback } from "react";
import { ecommerceOrdersApi } from "../api/ecommerce-orders.api";
import toast from "react-hot-toast";

export function useOrderDetails(orderId) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const data = await ecommerceOrdersApi.getOrderById(orderId);
      setOrder(data);
      setItems(data.items || []);
    } catch {
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleToggleItem = useCallback((itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleToggleAllItems = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((i) => i.id));
    }
  }, [items, selectedItems.length]);

  const handleChangeStatus = useCallback(async (newStatus = "Processing") => {
    try {
      await ecommerceOrdersApi.updateOrderStatus(orderId, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  }, [orderId]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    order,
    items: filteredItems,
    selectedItems,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleToggleItem,
    handleToggleAllItems,
    handleChangeStatus,
  };
}

export default useOrderDetails;
