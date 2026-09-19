import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVoucherById } from "../../../../../lib/api";

export default function JournalEntryDetails() {
  const { id } = useParams();

  const { data: voucherResponse, isLoading } = useQuery({
    queryKey: ["getVoucherById", id],
    queryFn: () => getVoucherById(id),
  });

  const data = voucherResponse?.data || {};
  const lines = data.lines || [];

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading details...</div>;
  }

  // Format voucher type for display
  let typeLabel = data.voucher_Type;
  if (typeLabel === "Journal_Voucher") typeLabel = "General";
  if (typeLabel === "Opening_Entry") typeLabel = "Opening";
  if (typeLabel === "Adjustment_Entry") typeLabel = "Adjustment";

  const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : "";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Journal Entry Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Journal Entries</span>
          <span>/</span>
          <span className="font-medium text-foreground">Journal Entry Details</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-foreground">{data.notes || "-"}</h3>
              <span className="text-xs text-muted-foreground">(It comes from the description)</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium ml-2">{typeLabel}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">Posted</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formattedDate} • {data.bond_Number || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metadata" className="w-full">
        <div className="mb-6">
          <TabsList className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit h-auto">
            <TabsTrigger 
              value="metadata" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              Metadata
            </TabsTrigger>
            <TabsTrigger 
              value="lines"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              Lines
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 overflow-hidden">
            <TabsContent value="metadata" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Date</p>
                  <p className="text-sm text-muted-foreground">{formattedDate || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Reference</p>
                  <p className="text-sm text-muted-foreground">{data.bond_Number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Branch</p>
                  <p className="text-sm text-muted-foreground">-</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Currency</p>
                  <p className="text-sm text-muted-foreground truncate" title={data.currency_Id}>{data.currency_Id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Cost Center</p>
                  <p className="text-sm text-muted-foreground">-</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lines" className="mt-0 outline-none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Account No</th>
                      <th className="px-4 py-3 font-medium">Account Name</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Debit</th>
                      <th className="px-4 py-3 font-medium text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3">{line.account_Number}</td>
                        <td className="px-4 py-3">{line.account_Name}</td>
                        <td className="px-4 py-3">{line.notes}</td>
                        <td className="px-4 py-3 text-right">${line.debit.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${line.credit.toFixed(2)}</td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No lines found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {lines.length > 0 && (
                    <tfoot className="border-t font-semibold">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                        <td className="px-4 py-3 text-right text-green-600">${lines.reduce((s,l)=>s+(l.debit||0),0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-600">${lines.reduce((s,l)=>s+(l.credit||0),0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
}
