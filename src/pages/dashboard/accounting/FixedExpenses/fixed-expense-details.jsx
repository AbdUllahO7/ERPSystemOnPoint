import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFixedExpenseById } from "../../../../lib/api";

export default function FixedExpenseDetails() {
  const { id } = useParams();

  const { data: expenseResponse, isLoading } = useQuery({
    queryKey: ["getFixedExpenseById", id],
    queryFn: () => getFixedExpenseById(id),
  });

  const data = expenseResponse?.data || {};

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading details...</div>;
  }

  const formattedStartDate = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "";
  const formattedEndDate = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "";
  const nextDue = formattedStartDate; // Temporary calculation or derived from backend

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Fixed Expenses Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Fixed Expenses</span>
          <span>/</span>
          <span className="font-medium text-foreground">Fixed Expenses Details</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-foreground">{data.description || "-"}</h3>
              <span className="text-xs text-muted-foreground">(It comes from the description)</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium ml-2">{data.categoryName || "Rent"}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${data.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {data.isActive ? "Active" : "Inactive"}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">↺ {data.cycle}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.vendorName || "Vendor"} • starts {formattedStartDate}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">${data.totalAmount?.toLocaleString() || "0"}</p>
          <p className="text-sm text-muted-foreground">Per Cycle</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recurrence" className="w-full">
        <div className="mb-6">
          <TabsList className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit h-auto flex-wrap">
            <TabsTrigger 
              value="recurrence" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Recurrence
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Upcoming Occurrences
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 overflow-hidden">
            <TabsContent value="recurrence" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Cycle</p>
                  <p className="text-sm text-muted-foreground">{data.cycle || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Next Due</p>
                  <p className="text-sm text-muted-foreground">{nextDue || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">End Date</p>
                  <p className="text-sm text-muted-foreground">{formattedEndDate || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Auto JE</p>
                  <p className={`text-sm font-medium ${data.autoGenerateJournal ? "text-green-600" : "text-gray-500"}`}>
                    {data.autoGenerateJournal ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-0 outline-none">
              <p className="text-sm text-muted-foreground">No upcoming occurrences calculated yet.</p>
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
}
