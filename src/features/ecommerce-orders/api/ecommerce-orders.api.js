import {
  MOCK_ORDERS_METRICS,
  MOCK_ECOMMERCE_ORDERS,
  MOCK_ORDER_DETAIL_ITEMS,
} from "../ecommerce-orders.constants";

export const ecommerceOrdersApi = {
  getOrdersMetrics: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_ORDERS_METRICS);
      }, 100);
    });
  },

  getOrdersList: async (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_ECOMMERCE_ORDERS);
      }, 150);
    });
  },

  getOrderById: async (orderId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = MOCK_ECOMMERCE_ORDERS.find((o) => o.id === orderId) || MOCK_ECOMMERCE_ORDERS[0];
        resolve({
          ...order,
          items: MOCK_ORDER_DETAIL_ITEMS,
        });
      }, 120);
    });
  },

  updateOrderStatus: async (orderId, newStatus) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, orderId, status: newStatus });
      }, 100);
    });
  },
};

export default ecommerceOrdersApi;
