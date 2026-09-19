import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, Landmark, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBankById, getAllBankTransactions } from "../../../../lib/api";
import { DataView } from "@/components/data-view/DataView";

export default function BankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: bankResponse, isLoading: isBankLoading } = useQuery({
    queryKey: ["getBankById", id],
    queryFn: () => getBankById(id),
  });

  const { data: movementsResponse, isLoading: isMovementsLoading } = useQuery({
    queryKey: ["getAllBankTransactions", { SpecificBankId: id, Search: search, PageNumber: page, PageSize: 10 }],
    queryFn: () => getAllBankTransactions({ SpecificBankId: id, Search: search, PageNumber: page, PageSize: 10 }),
  });

  const data = bankResponse?.data || {};
  const movements = movementsResponse?.data?.items || [];
  const totalPages = movementsResponse?.data?.totalPages || 1;
  const currentPage = movementsResponse?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  if (isBankLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading details...</div>;
  }

  const columns = [
    {
      key: "transactionNumber",
      label: "ID",
      render: (row) => row.transactionNumber || "-",
    },
    {
      key: "date",
      label: "Date",
      render: (row) => row.date ? new Date(row.date).toISOString().split('T')[0] : "-",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => {
        const isPositive = row.isReceipt;
        return (
          <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? "+" : "-"}${row.amount?.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "isReconciled",
      label: "Reconciled",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isReconciled ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {row.isReconciled ? "Yes" : "No"}
        </span>
      ),
    }
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Bank Details</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Banks</span>
            <span>/</span>
            <span className="font-medium text-foreground">Bank Details</span>
          </div>
        </div>
      </div>

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
              value="movements"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Movements
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 overflow-hidden">
            <TabsContent value="details" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Bank Name", value: data.bankName },
                  { label: "Account Number", value: data.accountNumber },
                  { label: "IBAN", value: data.iban },
                  { label: "SWIFT", value: data.swift },
                  { label: "Currency", value: data.currency },
                  { label: "Branch", value: data.branch },
                  { label: "Opening Balance", value: data.openingBalance },
                  { label: "Book Balance", value: data.bookBalance },
                ].map((detail, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{detail.label}</p>
                    <p className="text-sm font-semibold text-foreground">{detail.value || "-"}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="movements" className="mt-0 outline-none">
              <DataView
                data={movements}
                isLoading={isMovementsLoading}
                getRowId={(row) => row.journalEntryId}
                search={{
                  placeholder: "Search by ID...",
                  value: search,
                  onChange: handleSearch,
                }}
                onRefresh={() => {}}
                onPrint={() => window.print()}
                export={{
                  label: "Export",
                  onClick: () => console.log("export"),
                }}
                addButton={{
                  label: "Add",
                  onClick: () => navigate(`/dashboard/accounting/banks/${id}/add-movement`),
                  icon: <Plus className="w-4 h-4 mr-1" />
                }}
                card={{
                  title: (row) => row.transactionNumber || "-",
                  subtitle: (row) => row.date ? new Date(row.date).toISOString().split('T')[0] : "-",
                  fields: [
                    {
                      label: "Type:",
                      value: (row) => row.type || "-",
                    },
                    {
                      label: "Amount:",
                      value: (row) => {
                        const isPositive = row.isReceipt;
                        return (
                          <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
                            {isPositive ? "+" : "-"}${row.amount?.toLocaleString()}
                          </span>
                        );
                      },
                    },
                  ],
                }}
                onColumnSettings={() => console.log("column settings")}
                columns={columns}
                emptyMessage="No movements found."
                pagination={{
                  page: currentPage,
                  totalPages: totalPages,
                  onPageChange: setPage,
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
    </div>
  );
}
