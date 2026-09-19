import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOperationExpenseById } from "../../../../lib/api";

export default function OperatingExpenseDetails() {
  const { id } = useParams();

  const { data: expenseResponse, isLoading } = useQuery({
    queryKey: ["getOperationExpenseById", id],
    queryFn: () => getOperationExpenseById(id),
  });

  const data = expenseResponse?.data || {};

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading details...</div>;
  }

  const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : "";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Operating Expenses Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Operating Expenses</span>
          <span>/</span>
          <span className="font-medium text-foreground">Operating Expenses Details</span>
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
            </div>
            <p className="text-sm text-muted-foreground">
              {formattedDate} • {data.vendorName || "-"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">${data.totalAmount?.toLocaleString() || "0"}</p>
          <p className="text-sm text-muted-foreground">incl. ${(data.taxAmount || 0).toFixed(2)} tax</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <div className="mb-6">
          <TabsList className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit h-auto flex-wrap">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="attachments"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Attachments
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 overflow-hidden">
            <TabsContent value="details" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Date</p>
                  <p className="text-sm text-muted-foreground">{formattedDate || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Category</p>
                  <p className="text-sm text-muted-foreground">{data.categoryName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Vendor</p>
                  <p className="text-sm text-muted-foreground">{data.vendorName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Payment</p>
                  <p className="text-sm text-muted-foreground">{data.paymentMethodName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Branch</p>
                  <p className="text-sm text-muted-foreground">{data.branchName || "-"}</p>
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-foreground mb-1">Project</p>
                  <p className="text-sm text-muted-foreground">{data.projectName || "-"}</p>
                </div> */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Cost Center</p>
                  <p className="text-sm text-muted-foreground">{data.costCenterName || "-"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="mt-0 outline-none">
              {data.attachmentFilePath ? (
                <div className="flex items-center gap-2">
                   <a href={data.attachmentFilePath} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                     View Attachment
                   </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments found.</p>
              )}
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
}
