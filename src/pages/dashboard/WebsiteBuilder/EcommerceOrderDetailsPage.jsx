import React from "react";
import { useParams, Link } from "react-router-dom";
import { Info, ChevronRight, Loader2 } from "lucide-react";
import {
  OrderDetailsCustomerHeader,
  OrderDetailsItemsTable,
} from "@/components/dashboard/ecommerce-orders";
import { useOrderDetails } from "@/features/ecommerce-orders";
import { useI18n } from "@/context/translate-api";

export function EcommerceOrderDetailsPage() {
  const { orderId } = useParams();
  const { t } = useI18n();

  const {
    order,
    items,
    selectedItems,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleToggleItem,
    handleToggleAllItems,
    handleChangeStatus,
  } = useOrderDetails(orderId || "ord-1");

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Header and Breadcrumb */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t("ecommerceOrders.orderDetails")}
            </h1>
            <button
              type="button"
              className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-300 transition-colors"
              title={t("ecommerceOrders.orderDetailsInfo")}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link
              to="/dashboard/web-service/orders"
              className="hover:text-[#0066d1] transition-colors"
            >
              {t("ecommerceOrders.title")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <span className="text-slate-600 font-bold">
              {t("ecommerceOrders.orderDetails")}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80">
            <Loader2 className="w-8 h-8 animate-spin text-[#0066d1]" />
            <span className="text-sm font-bold text-slate-500">
              {t("ecommerceOrders.loadingDetails")}
            </span>
          </div>
        )}

        {!isLoading && (
          <>
            {/* Top Customer Info Card */}
            <OrderDetailsCustomerHeader
              order={order}
              onChangeStatus={() => handleChangeStatus("Completed")}
            />

            {/* Products / Items Table */}
            <OrderDetailsItemsTable
              items={items}
              selectedItems={selectedItems}
              onToggleItem={handleToggleItem}
              onToggleAllItems={handleToggleAllItems}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>
          {t("ecommerceOrders.designedBy")}{" "}
          <span className="font-bold text-[#0066d1]">ONPOINT</span>
        </div>
      </footer>
    </div>
  );
}

export default EcommerceOrderDetailsPage;
