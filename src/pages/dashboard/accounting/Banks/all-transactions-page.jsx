import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllBankTransactions, getAllBanks } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function AllTransactionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBank, setSelectedBank] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      Search: search,
      SpecificBankId: selectedBank || undefined,
      PageNumber: page,
      PageSize: 10,
    }),
    [page, search, selectedBank],
  );

  const { data: banksData } = useQuery({
    queryKey: ["getAllBanks"],
    queryFn: () => getAllBanks({ PageNumber: 1, PageSize: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["getAllBankTransactions", params],
    queryFn: () => getAllBankTransactions(params),
  });

  const banks = banksData?.data?.items || [];
  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
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
      key: "bankName",
      label: "Bank",
      render: (row) => row.bankName || "-",
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
    <div className="space-y-6">
      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-2 w-full sm:max-w-[250px]">
              <label className="text-sm font-medium text-foreground">
                Filter by Bank
              </label>
              <Select
                value={selectedBank || "all"}
                onValueChange={(val) => {
                  setSelectedBank(val === "all" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-transparent h-10">
                  <SelectValue placeholder="All Banks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {banks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBank("");
                setPage(1);
              }}
              className="w-full sm:w-auto h-10"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.journalEntryId}
        // selectable
        search={{
          placeholder: "Search by ID...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => {}}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/banks/add-movement"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        card={{
          title: (row) => row.transactionNumber || "-",
          subtitle: (row) => row.date ? new Date(row.date).toISOString().split('T')[0] : "-",
          fields: [
            {
              label: "Bank:",
              value: (row) => row.bankName || "-",
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
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No transactions found"
      />
    </div>
  );
}
