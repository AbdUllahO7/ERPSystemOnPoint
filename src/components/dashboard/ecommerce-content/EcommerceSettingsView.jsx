import React from "react";

export function EcommerceSettingsView({
  paymentMethods = [],
  selectedPaymentMethods = [],
  onTogglePaymentMethod,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
          Choose the payment methods you wish to use :
        </h3>

        {/* Checkbox options in a row (1:1 with Figma Image 4) */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-1">
          {paymentMethods.map((pm) => {
            const isChecked = selectedPaymentMethods.includes(pm.id);
            return (
              <label
                key={pm.id}
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer select-none transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    onTogglePaymentMethod && onTogglePaymentMethod(pm.id)
                  }
                  className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                />
                <span>{pm.label || "Payment Method"}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EcommerceSettingsView;
