import React, { useState } from "react";
import { Info } from "lucide-react";
import {
  OrdersMetricsCards,
  OrdersFilterToolbar,
  OrdersTable,
} from "@/components/dashboard/ecommerce-orders";
import { useEcommerceOrders } from "@/features/ecommerce-orders";

export function EcommerceOrdersPage() {
  const [viewMode, setViewMode] = useState("list");
  const {
    metrics,
    orders,
    selectedOrders,
    searchQuery,
    setSearchQuery,
    isLoading,
    refetch,
    handleToggleOrder,
    handleToggleAllOrders,
  } = useEcommerceOrders();

  const handleExport = () => {
    alert("Exporting orders to CSV/Excel...");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Page Header (1:1 with Figma Image 2) */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            E-Commerce Orders
          </h1>
          <button
            type="button"
            className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-300 transition-colors"
            title="Order Management Information"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <OrdersMetricsCards metrics={metrics} />

        {/* Toolbar (Search, Filters, View Modes, Export) */}
        <OrdersFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={refetch}
          onExport={handleExport}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          selectedOrders={selectedOrders}
          onToggleOrder={handleToggleOrder}
          onToggleAllOrders={handleToggleAllOrders}
        />
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>
          Designed By <span className="font-bold text-[#0066d1]">ONPOINT</span>
        </div>
      </footer>
    </div>
  );
}

export default EcommerceOrdersPage;
