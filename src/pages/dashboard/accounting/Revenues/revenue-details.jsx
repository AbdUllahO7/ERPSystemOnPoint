import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { getRevenueById } from "../../../../lib/api";

export default function RevenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: revenueResponse, isLoading } = useQuery({
    queryKey: ["getRevenueById", id],
    queryFn: () => getRevenueById(id),
  });

  const data = revenueResponse?.data || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "Collected":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Partial":
        return "bg-blue-100 text-blue-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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
            <h2 className="text-2xl font-bold text-foreground">Revenue Details</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Revenues</span>
            <span>/</span>
            <span className="font-medium text-foreground">Revenue Details</span>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm space-y-8">
        
        <div className="flex justify-between items-start border-b pb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">{data.referenceNumber || "-"}</h3>
            <p className="text-sm text-muted-foreground mt-1">Customer: {data.customerName || "-"}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(data.status)}`}>
            {data.status || "Unknown"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Amount", value: `$${data.amount?.toLocaleString() || "0"}` },
            { label: "Tax Amount", value: `$${data.taxAmount?.toLocaleString() || "0"}` },
            { label: "Total Amount", value: `$${data.totalAmount?.toLocaleString() || "0"}` },
            { label: "Invoice Number", value: data.invoiceNumber },
            { label: "Collection Account", value: data.collectionAccountName },
            { label: "Due Date", value: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : "-" },
            { label: "Collected Date", value: data.collectedDate ? new Date(data.collectedDate).toISOString().split('T')[0] : "-" },
            { label: "Cost Center", value: data.costCenterName },
            { label: "Project", value: data.projectName },
            { label: "Journal Entry Number", value: data.journalEntryNumber },
          ].map((detail, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
              <p className="text-sm font-semibold text-foreground">{detail.value || "-"}</p>
            </div>
          ))}
        </div>

        {data.description && (
          <div className="space-y-1 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm font-medium text-foreground">{data.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
