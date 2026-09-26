import React from "react";
import { Link } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

export function OrdersTable({
  orders = [],
  selectedOrders = [],
  onToggleOrder,
  onToggleAllOrders,
}) {
  const isAllSelected =
    orders.length > 0 && selectedOrders.length === orders.length;

  return (
    <div className="space-y-4">
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleAllOrders}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                  />
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Order Number</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Customer Name</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <span>Number Of Products</span>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Total</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Payment Method</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Status</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Order Date</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right w-12">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 inline" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((order, idx) => {
                const isSelected = selectedOrders.includes(order.id);

                return (
                  <tr
                    key={order.id || idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleOrder && onToggleOrder(order.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/dashboard/web-service/orders/${order.id}`}
                        className="font-bold text-[#0066d1] hover:underline cursor-pointer"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.numberOfProducts}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0066d1]">
                      {order.total}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {order.status || "New"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {order.orderDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {/* Optional row action icon */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 pt-2 text-xs font-semibold text-slate-600">
        <button type="button" className="px-2 py-1 hover:text-slate-900 cursor-pointer">
          Pre
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-lg bg-[#0066d1] text-white font-bold flex items-center justify-center shadow-xs cursor-pointer"
        >
          1
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          2
        </button>
        <span className="px-1 text-slate-400">....</span>
        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          20
        </button>
        <button
          type="button"
          className="px-2 py-1 text-[#0066d1] font-bold hover:underline cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default OrdersTable;
