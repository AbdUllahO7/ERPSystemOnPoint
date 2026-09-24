import React, { useState } from "react";
import { User, Package, ChevronRight, ArrowLeft } from "lucide-react";
import { MOCK_USER_ORDERS } from "@/features/ecommerce/mock/ecommerce.mock";
import toast from "react-hot-toast";

export function Account() {
  const [activeTab, setActiveTab] = useState("personal"); // 'personal' | 'orders'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State for Personal Information
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSavePersonal = (e) => {
    e.preventDefault();
    toast.success("تم حفظ البيانات الشخصية بنجاح!");
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-8 md:py-10 px-4 sm:px-8 lg:px-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar: My account info */}
        <aside className="lg:col-span-3 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              My account info
            </h2>
          </div>

          <nav className="p-2 space-y-1">
            {/* Personal Information Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("personal");
                setSelectedOrder(null);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-left ${
                activeTab === "personal"
                  ? "bg-[#0066d1] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  activeTab === "personal" ? "bg-white text-[#0066d1]" : "bg-blue-50 text-[#0066d1]"
                }`}
              >
                <User className="w-5 h-5" />
              </div>
              <span>Personal information</span>
            </button>

            {/* Order Archive Tab */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                setSelectedOrder(null);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-left ${
                activeTab === "orders"
                  ? "bg-[#0066d1] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  activeTab === "orders" ? "bg-white text-[#0066d1]" : "bg-blue-50 text-[#0066d1]"
                }`}
              >
                <Package className="w-5 h-5" />
              </div>
              <span>Order archive</span>
            </button>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9">
          {/* VIEW 1: Personal Information Form (Screenshot 3) */}
          {activeTab === "personal" && (
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 sm:p-10 space-y-6">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Personal information
              </h1>

              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* User Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">User Name</label>
                    <input
                      type="text"
                      placeholder="Contract Number"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="w-full bg-[#f8fafc] text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* E-Mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">E-Mail</label>
                    <input
                      type="email"
                      placeholder="E-Mail"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#f8fafc] text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#f8fafc] text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">address</label>
                    <input
                      type="text"
                      placeholder="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[#f8fafc] text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-10 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW 2: Order Archive List (Screenshot 4) */}
          {activeTab === "orders" && !selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {MOCK_USER_ORDERS.map((order, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 space-y-4 hover:border-blue-200 transition-colors"
                >
                  {/* Card Header: Icon + Order Number */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-400/40 bg-blue-50/50 flex items-center justify-center text-[#0066d1] shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        Order Number
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                    </div>
                  </div>

                  {/* Details Row: Order cost & payment method */}
                  <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Order cost</span>
                      <span className="font-bold text-slate-900 text-sm">{order.orderCost}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">payment method</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Action Link: View Details >>> */}
                  <div className="pt-2 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-[#0066d1] hover:text-[#0052a8] flex items-center gap-1 transition-colors"
                    >
                      View Details &gt;&gt;&gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 3: Order Details View (Screenshot 5) */}
          {activeTab === "orders" && selectedOrder && (
            <div className="space-y-6">
              {/* Back Link */}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0066d1] bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Order Archive
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Purchased Order Items */}
                <div className="lg:col-span-8 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {item.quantity}X{item.unitPrice}
                          </p>
                          <p className="text-sm sm:text-base font-extrabold text-[#0066d1] mt-0.5">
                            ${item.quantity * item.unitPrice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-4 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Order Summary
                  </h2>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono text-slate-800">{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Discount</span>
                      <span className="font-mono text-slate-800">{selectedOrder.discount}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee</span>
                      <span className="font-mono text-slate-800">{selectedOrder.deliveryFee}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                      <span className="text-slate-900">Total</span>
                      <span className="text-[#0066d1] font-mono text-sm sm:text-base">
                        {selectedOrder.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Account;
