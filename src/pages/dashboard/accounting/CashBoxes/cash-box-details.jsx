import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, WalletCards, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCashBoxById, getAllCashBoxTransactions } from "../../../../lib/api";
import { DataView } from "@/components/data-view/DataView";

export default function CashBoxDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: cashBoxResponse, isLoading: isBoxLoading } = useQuery({
    queryKey: ["getCashBoxById", id],
    queryFn: () => getCashBoxById(id),
  });

  const { data: movementsResponse, isLoading: isMovementsLoading } = useQuery({
    queryKey: ["getAllCashBoxTransactions", { SpecificCashBoxId: id, Search: search, PageNumber: page, PageSize: 10 }],
    queryFn: () => getAllCashBoxTransactions({ SpecificCashBoxId: id, Search: search, PageNumber: page, PageSize: 10 }),
  });

  const data = cashBoxResponse?.data || {};
  const movements = movementsResponse?.data?.items || [];
  const totalPages = movementsResponse?.data?.totalPages || 1;
  const currentPage = movementsResponse?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  if (isBoxLoading) {
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
      key: "description",
      label: "Description",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "counterAccountName",
      label: "Counter Account",
      render: (row) => row.counterAccountName || "-",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => {
        const isPositive = row.isReceipt; // Receipt adds to cash
        return (
          <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? "+" : "-"}${row.amount?.toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Cash Box Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Cash Boxes</span>
          <span>/</span>
          <span className="font-medium text-foreground">Cash Box Details</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
            <WalletCards className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-foreground">{data.name || "-"}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Current Balance
            </p>
            <p className="text-xl font-bold text-foreground mt-1">
              ${data.currentBalance?.toLocaleString() || "0"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">$1000.000</p>
          <p className="text-sm text-muted-foreground">Opening Balance</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <div className="mb-6">
          <TabsList className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit h-auto flex-wrap">
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Box Info
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
            <TabsContent value="info" className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Code</p>
                  <p className="text-sm text-muted-foreground">{data.code || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Branch</p>
                  <p className="text-sm text-muted-foreground">{data.branchId || "HQ"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Currency</p>
                  <p className="text-sm text-muted-foreground">{data.currencyId || "USD"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Responsible</p>
                  <p className="text-sm text-muted-foreground">{data.responsiblePersonId || "-"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="movements" className="mt-0 outline-none">
              <DataView
                data={movements}
                isLoading={isMovementsLoading}
                getRowId={(row) => row.journalEntryId}
                search={{
                  placeholder: "Search by ID or description...",
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
                  onClick: () => navigate(`/dashboard/accounting/cash-boxes/${id}/add-movement`),
                  icon: <Plus className="w-4 h-4 mr-1" />
                }}
                card={{
                  title: (row) => row.transactionNumber || "-",
                  subtitle: (row) => row.date ? new Date(row.date).toISOString().split('T')[0] : "-",
                  fields: [
                    {
                      label: "Counter Account:",
                      value: (row) => row.counterAccountName || "-",
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
