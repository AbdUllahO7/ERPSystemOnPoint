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
import { getAllCashBoxTransactions, getAllCashBoxes } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function AllTransactionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCashBox, setSelectedCashBox] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      Search: search,
      SpecificCashBoxId: selectedCashBox || undefined,
      PageNumber: page,
      PageSize: 10,
    }),
    [page, search, selectedCashBox],
  );

  const { data: cashBoxesData } = useQuery({
    queryKey: ["getAllCashBoxes"],
    queryFn: () => getAllCashBoxes({ PageNumber: 1, PageSize: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["getAllCashBoxTransactions", params],
    queryFn: () => getAllCashBoxTransactions(params),
  });

  const cashBoxes = cashBoxesData?.data?.items || [];
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
      key: "cashBoxName",
      label: "Cash Box",
      render: (row) => row.cashBoxName || "-",
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
        const isPositive = row.isReceipt;
        return (
          <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? "+" : "-"}${row.amount?.toLocaleString()}
          </span>
        );
      },
    },
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
                Filter by Cash Box
              </label>
              <Select
                value={selectedCashBox || "all"}
                onValueChange={(val) => {
                  setSelectedCashBox(val === "all" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-transparent h-10">
                  <SelectValue placeholder="All Cash Boxes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cash Boxes</SelectItem>
                  {cashBoxes.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCashBox("");
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
          placeholder: "Search by ID or description...",
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
          onClick: () => navigate("/dashboard/accounting/cash-boxes/add-movement"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        card={{
          title: (row) => row.transactionNumber || "-",
          subtitle: (row) => row.date ? new Date(row.date).toISOString().split('T')[0] : "-",
          fields: [
            {
              label: "Cash Box:",
              value: (row) => row.cashBoxName || "-",
            },
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
