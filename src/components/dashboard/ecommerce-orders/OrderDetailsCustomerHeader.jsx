import React from "react";
import { RefreshCw } from "lucide-react";

export function OrderDetailsCustomerHeader({
  order,
  onChangeStatus,
}) {
  if (!order) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      {/* Left Customer Info */}
      <div className="flex items-center gap-4">
        {/* Blue Square with initials CN */}
        <div className="w-16 h-16 rounded-2xl bg-[#0066d1] text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
          {order.customerInitials || "CN"}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {order.customerName || "Customer Name"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {order.orderNumber || "0099-77665-002"} •{" "}
            {order.paymentMethod || "Payment Method"} •{" "}
            {order.orderDate || "23/7/2025"}
          </p>
        </div>
      </div>

      {/* Right: Change Status Button */}
      <button
        type="button"
        onClick={onChangeStatus}
        className="px-5 py-2.5 rounded-xl border border-[#0066d1] text-[#0066d1] hover:bg-blue-50/60 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Change Status</span>
      </button>
    </div>
  );
}

export default OrderDetailsCustomerHeader;
