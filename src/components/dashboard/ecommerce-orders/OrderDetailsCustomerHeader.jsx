import React from "react";
import { RefreshCw } from "lucide-react";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function OrderDetailsCustomerHeader({
  order,
  onChangeStatus,
}) {
  const { locale, t } = useI18n();
  const isAr = locale === "ar";

  if (!order) return null;

  const paymentMethodDisplay = isAr && order.paymentMethod
    ? translateErp(order.paymentMethod, locale)
    : (order.paymentMethod || t("ecommerceOrders.paymentMethod"));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      {/* Left Customer Info */}
      <div className="flex items-center gap-4">
        {/* Blue Square with initials */}
        <div className="w-16 h-16 rounded-2xl bg-[#0066d1] text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
          {order.customerInitials || "CN"}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {order.customerName || t("ecommerceOrders.customerName")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {order.orderNumber || "0099-77665-002"} •{" "}
            {paymentMethodDisplay} •{" "}
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
        <span>{t("ecommerceOrders.changeStatus")}</span>
      </button>
    </div>
  );
}

export default OrderDetailsCustomerHeader;
