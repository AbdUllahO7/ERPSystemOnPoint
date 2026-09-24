import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { MOCK_CART_ITEMS } from "@/features/ecommerce/mock/ecommerce.mock";
import toast from "react-hot-toast";

export function Cart() {
  const [items, setItems] = useState(MOCK_CART_ITEMS);
  const [discountCode, setDiscountCode] = useState("");
  const [invoiceDiscount, setInvoiceDiscount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("visa");

  const handleDecrease = (id) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleIncrease = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const handleCheckout = () => {
    toast.success("تم الانتقال لصفحة إتمام الدفع بنجاح!");
  };

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const discountAmount = invoiceDiscount ? (subtotal * Number(invoiceDiscount)) / 100 : 0;
  const deliveryFee = items.length > 0 ? 0 : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-8 md:py-10 px-4 sm:px-8 lg:px-14">
      {/* Page Heading */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Cart
      </h1>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: List of Cart Items */}
          <div className="lg:col-span-8 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-3">
            {items.map((item) => {
              const itemTotal = item.unitPrice * item.quantity;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors bg-white gap-4"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {item.quantity}X{item.unitPrice}
                      </p>
                      <p className="text-sm sm:text-base font-extrabold text-[#0066d1] mt-0.5">
                        ${itemTotal}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-blue-50/60 p-1 rounded-xl border border-blue-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDecrease(item.id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 flex items-center justify-center font-bold transition-colors active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-6 sm:w-7 text-center font-bold text-slate-800 text-xs sm:text-sm select-none">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleIncrease(item.id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0066d1] hover:bg-[#0052a8] text-white flex items-center justify-center font-bold transition-colors active:scale-95 shadow-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-6 space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Order Summary
            </h2>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono text-slate-800">{subtotal.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Discount</span>
                <span className="font-mono text-slate-800">{discountAmount.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-mono text-slate-800">{deliveryFee.toFixed(2)} $</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-[#0066d1] font-mono text-sm sm:text-base">
                  {total.toFixed(2)} $
                </span>
              </div>
            </div>

            {/* Discount Inputs */}
            <div className="space-y-2 pt-1">
              <input
                type="text"
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="w-full bg-[#f8fafc] text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1]"
              />
              <input
                type="number"
                placeholder="Invoice discount (%):"
                value={invoiceDiscount}
                onChange={(e) => setInvoiceDiscount(e.target.value)}
                className="w-full bg-[#f8fafc] text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1]"
              />
            </div>

            {/* Payment Methods */}
            <div className="space-y-2 pt-1">
              <span className="text-xs text-slate-600 font-medium block">
                Choose a payment method
              </span>
              <div className="flex items-center gap-2">
                {/* Visa / Master */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment("visa")}
                  className={`flex-1 py-1.5 px-2 rounded-lg border flex items-center justify-center transition-all ${
                    selectedPayment === "visa"
                      ? "border-[#0066d1] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-[#0a1e3f] text-white"
                  }`}
                >
                  <span className="text-xs font-black tracking-widest text-white italic">
                    VISA
                  </span>
                </button>

                {/* PayPal */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment("paypal")}
                  className={`flex-1 py-1.5 px-2 rounded-lg border flex items-center justify-center transition-all ${
                    selectedPayment === "paypal"
                      ? "border-[#0066d1] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-slate-100 text-[#003087]"
                  }`}
                >
                  <span className="text-xs font-bold text-[#003087]">PayPal</span>
                </button>

                {/* Knet / Local */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment("knet")}
                  className={`flex-1 py-1.5 px-2 rounded-lg border flex items-center justify-center transition-all ${
                    selectedPayment === "knet"
                      ? "border-[#0066d1] bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-cyan-100/60 text-cyan-800"
                  }`}
                >
                  <span className="text-xs font-bold text-cyan-800">KNET</span>
                </button>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Check Out
            </button>
          </div>
        </div>
      ) : (
        /* Empty Cart State matching Screenshot 2 */
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-12 sm:p-20 text-center max-w-2xl mx-auto my-8 space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          {/* Blue Cart Graphic */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto relative flex items-center justify-center">
            {/* Background sparkle icons */}
            <span className="absolute -top-1 left-4 text-[#00b4d8] text-2xl font-black select-none animate-pulse">
              +
            </span>
            <span className="absolute top-6 right-2 text-[#0066d1] text-3xl font-black select-none animate-bounce">
              +
            </span>

            {/* Blue Shopping Cart SVG Graphic */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-blue-50/80 flex items-center justify-center border-4 border-blue-100 shadow-inner">
              <ShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 text-[#0066d1] stroke-[1.75]" />
            </div>
          </div>

          {/* Texts */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">
              Explore our products and add your favorites to the cart
            </p>
          </div>

          {/* Action */}
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
