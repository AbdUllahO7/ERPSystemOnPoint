import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { getExpenseById } from "../../../../lib/api";

export default function ExpenseDetails() {
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
    return <div className="p-6 text-center text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Expense Details</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Expenses</span>
            <span>/</span>
            <span className="font-medium text-foreground">Expense Details</span>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm space-y-8">
        
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Expense No: {data.expense_No || "-"}</h3>
            <p className="text-sm text-muted-foreground mt-1">Group: {data.group_Name || "-"}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(data.status_Name)}`}>
            {data.status_Name || "Unknown"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Account Name", value: data.expense_Account_Name },
            { label: "Cost Center", value: data.costCenter_Name },
            { label: "Paid To", value: data.paid_To_Account_Name },
            { label: "Amount", value: `$${data.amount?.toLocaleString() || "0"}` },
            { label: "Total Amount", value: `$${data.total_Amount?.toLocaleString() || "0"}` },
            { label: "Currency", value: data.currency_Name },
            { label: "Expense Date", value: data.expense_Date ? new Date(data.expense_Date).toLocaleString() : "-" },
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
