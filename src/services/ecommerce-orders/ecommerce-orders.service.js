import { apiHandler } from "@/lib/api-handler";
import {
  MOCK_ORDERS_METRICS,
  MOCK_ECOMMERCE_ORDERS,
  MOCK_ORDER_DETAIL_ITEMS,
} from "@/features/ecommerce-orders/mock/ecommerce-orders.mock";

/**
 * خدمة طلبات المتجر الإلكتروني (E-Commerce Orders Service)
 */

// 1. Get orders metrics stats
export async function getOrdersMetrics(params = {}) {
  try {
    const response = await apiHandler({
      endPoint: "ecommerce/orders/metrics",
      params,
    });
    return response?.data || response || MOCK_ORDERS_METRICS;
  } catch {
    return MOCK_ORDERS_METRICS;
  }
}

// 2. Get orders list
export async function getOrdersList(params = {}) {
  try {
    const response = await apiHandler({
      endPoint: "ecommerce/orders",
      params,
    });
    return response?.data || response || MOCK_ECOMMERCE_ORDERS;
  } catch {
    return MOCK_ECOMMERCE_ORDERS;
  }
}

// 3. Get single order details
export async function getOrderById(orderId) {
  try {
    const response = await apiHandler({
      endPoint: `ecommerce/orders/${orderId}`,
    });
    return (
      response?.data ||
      response || {
        ...(MOCK_ECOMMERCE_ORDERS.find((o) => o.id === orderId) || MOCK_ECOMMERCE_ORDERS[0]),
        items: MOCK_ORDER_DETAIL_ITEMS,
      }
    );
  } catch {
    const order = MOCK_ECOMMERCE_ORDERS.find((o) => o.id === orderId) || MOCK_ECOMMERCE_ORDERS[0];
    return {
      ...order,
      items: MOCK_ORDER_DETAIL_ITEMS,
    };
  }
}

// 4. Update order status
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await apiHandler({
      endPoint: `ecommerce/orders/${orderId}/status`,
      method: "PUT",
      body: { status: newStatus },
    });
    return response?.data || response || { success: true, orderId, status: newStatus };
  } catch {
    return { success: true, orderId, status: newStatus };
  }
}

export const ecommerceOrdersApi = {
  getOrdersMetrics,
  getOrdersList,
  getOrderById,
  updateOrderStatus,
};

export default ecommerceOrdersApi;
