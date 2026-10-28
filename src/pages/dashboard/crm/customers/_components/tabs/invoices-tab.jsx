import { useState, useMemo } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getAllInvoices } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, DollarSign, Wallet, CheckCircle2, Filter, ShieldCheck } from "lucide-react";

export function InvoicesTab({ customerId: propCustomerId }) {
  const params = useParams();
  const customerId = propCustomerId || params.id;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ FromDate: "", ToDate: "", PaymentMethod: "", ContractRef: "" });

  const queryParams = useMemo(() => {
    const p = {
      Customer_Id: customerId,
      Search: search || undefined,
      PageNumber: page,
      PageSize: 10,
    };
    if (filters.FromDate) p.FromDate = filters.FromDate;
    if (filters.ToDate) p.ToDate = filters.ToDate;
    if (filters.PaymentMethod) p.Payment_Method = filters.PaymentMethod;
    return p;
  }, [customerId, search, page, filters]);

  const { data, isLoading } = useQuery({
    queryKey: ["customerInvoices", queryParams],
    queryFn: () => getAllInvoices(queryParams),
    enabled: !!customerId,
  });

  const rawRows = data?.data?.items || [];
  const displayRows = useMemo(() => {
    if (!filters.ContractRef) return rawRows;
    return rawRows.filter((r) => {
      const ref =
        r.contractNumber ||
        r.contract_Number ||
        (r.note && r.note.includes("[عقد رقم:")
          ? r.note.split("[عقد رقم:")[1]?.split("]")[0]?.trim()
          : "");
      return ref?.toLowerCase().includes(filters.ContractRef.toLowerCase());
    });
  }, [rawRows, filters.ContractRef]);
  const totalPages = data?.data?.totalPages || 1;

  // Compute Financial Aggregates
  const totalInvoiced = displayRows.reduce((acc, r) => acc + Number(r.total_Amount || r.net_Amount || 0), 0);
  const totalPaid = displayRows.reduce((acc, r) => acc + Number(r.paid_Amount || 0), 0);
  const totalRemaining = Math.max(0, totalInvoiced - totalPaid);

  const columns = [
    {
      key: "invoice_Number",
      label: "Invoice #",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-600">
            {row.invoice_Number || `#INV-${String(row.id).substring(0, 8)}`}
          </span>
        </div>
      ),
    },
    {
      key: "contractRef",
      label: "Contract Ref (مرجع العقد)",
      render: (row) => {
        const contractNum =
          row.contractNumber ||
          row.contract_Number ||
          (row.note && row.note.includes("[عقد رقم:")
            ? row.note.split("[عقد رقم:")[1]?.split("]")[0]?.trim()
            : null);

        if (!contractNum) {
          return <span className="text-muted-foreground text-[11px]">-</span>;
        }

        return (
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {contractNum}
            </span>
          </div>
        );
      },
    },
    {
      key: "invoice_Date",
      label: "Date",
      render: (row) =>
        row.invoice_Date ? new Date(row.invoice_Date).toLocaleDateString() : "-",
    },
    {
      key: "total_Amount",
      label: "Invoice Amount (القيمة)",
      render: (row) => (
        <span className="font-bold text-foreground">
          ${Number(row.total_Amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "paid_Amount",
      label: "Paid (المدفوع)",
      render: (row) => (
        <span className="font-semibold text-emerald-600">
          ${Number(row.paid_Amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "remaining_Amount",
      label: "Remaining (المتبقي عليه)",
      render: (row) => {
        const total = Number(row.total_Amount || 0);
        const paid = Number(row.paid_Amount || 0);
        const remaining = Math.max(0, total - paid);
        return (
          <span
            className={`font-bold ${
              remaining > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            ${remaining.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "payment_Method_Name",
      label: "Payment Method",
      render: (row) => (
        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          {row.payment_Method_Name || row.payment_Method || "Standard"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-blue-50/50 border-blue-200">
          <span className="text-xs text-blue-700 font-semibold block uppercase">Total Invoiced (إجمالي الفواتير)</span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block">
            ${totalInvoiced.toLocaleString()}
          </span>
          <p className="text-[11px] text-blue-700 mt-0.5">Sum of all billed sales invoices</p>
        </div>
        <div className="p-4 border rounded-xl bg-emerald-50/50 border-emerald-200">
          <span className="text-xs text-emerald-700 font-semibold block uppercase">Total Paid (المدفوعات)</span>
          <span className="text-2xl font-bold text-emerald-900 mt-1 block">
            ${totalPaid.toLocaleString()}
          </span>
          <p className="text-[11px] text-emerald-700 mt-0.5">Total cash collected from customer</p>
        </div>
        <div className="p-4 border rounded-xl bg-rose-50/50 border-rose-200">
          <span className="text-xs text-rose-700 font-semibold block uppercase">Outstanding Balance (المتبقي عليه)</span>
          <span className="text-2xl font-bold text-rose-900 mt-1 block">
            ${totalRemaining.toLocaleString()}
          </span>
          <p className="text-[11px] text-rose-700 mt-0.5">Remaining uncollected balance</p>
        </div>
      </div>


      {/* Filter Menu */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          className="gap-2 bg-white"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="w-4 h-4" />
          {isFilterOpen ? "Hide Filters" : "Filter Invoices"}
        </Button>
      </div>

      {isFilterOpen && (
        <div className="bg-slate-50 p-4 rounded-xl border flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-semibold text-foreground">Filter by Contract #</label>
            <Input
              placeholder="e.g. CC-12345"
              value={filters.ContractRef}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, ContractRef: e.target.value }));
                setPage(1);
              }}
              className="h-9 bg-white w-40"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-semibold text-foreground">From Date</label>
            <Input
              type="date"
              value={filters.FromDate}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, FromDate: e.target.value }));
                setPage(1);
              }}
              className="h-9 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            <label className="text-xs font-semibold text-foreground">To Date</label>
            <Input
              type="date"
              value={filters.ToDate}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, ToDate: e.target.value }));
                setPage(1);
              }}
              className="h-9 bg-white"
            />
          </div>
          {(filters.FromDate || filters.ToDate || filters.ContractRef) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ FromDate: "", ToDate: "", PaymentMethod: "", ContractRef: "" });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search invoices by number...",
          value: search,
          onChange: setSearch,
        }}
        columns={columns}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
      />
    </div>
  );
}
