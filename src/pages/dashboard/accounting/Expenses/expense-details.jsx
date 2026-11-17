import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { getExpenseById } from "../../../../lib/api";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function ExpenseDetails() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: expenseResponse, isLoading } = useQuery({
    queryKey: ["getExpenseById", id],
    queryFn: () => getExpenseById(id),
  });

  const data = expenseResponse?.data || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "Posted":
        return "bg-green-100 text-green-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">{isAr ? "جاري تحميل التفاصيل..." : "Loading details..."}</div>;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">
              {isAr ? "تفاصيل المصروف" : "Expense Details"}
            </h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{isAr ? "المصروفات" : "Expenses"}</span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {isAr ? "تفاصيل المصروف" : "Expense Details"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm space-y-8">
        
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {isAr ? `رقم المصروف: ${data.expense_No || "-"}` : `Expense No: ${data.expense_No || "-"}`}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? `المجموعة: ${data.group_Name || "-"}` : `Group: ${data.group_Name || "-"}`}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(data.status_Name)}`}>
            {isAr ? translateErp(data.status_Name, locale) : (data.status_Name || "Unknown")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: isAr ? "اسم الحساب" : "Account Name", value: data.expense_Account_Name },
            { label: isAr ? "مركز التكلفة" : "Cost Center", value: data.costCenter_Name },
            { label: isAr ? "مدفوع إلى" : "Paid To", value: data.paid_To_Account_Name },
            { label: isAr ? "المبلغ" : "Amount", value: `${data.amount?.toLocaleString() || "0"} ${isAr ? "ر.س" : "$"}` },
            { label: isAr ? "المبلغ الإجمالي" : "Total Amount", value: `${data.total_Amount?.toLocaleString() || "0"} ${isAr ? "ر.س" : "$"}` },
            { label: isAr ? "العملة" : "Currency", value: data.currency_Name },
            { label: isAr ? "تاريخ المصروف" : "Expense Date", value: data.expense_Date ? new Date(data.expense_Date).toLocaleString(isAr ? 'ar-SA' : 'en-US') : "-" },
          ].map((detail, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
              <p className="text-sm font-semibold text-foreground">{detail.value || "-"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
