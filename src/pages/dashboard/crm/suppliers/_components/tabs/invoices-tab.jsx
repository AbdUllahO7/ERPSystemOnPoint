import { useMemo, useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllInvoices } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Receipt, ShieldCheck } from "lucide-react";
import { useI18n } from "@/context/translate-api";

export function InvoicesTab({ supplierId }) {
  const { locale } = useI18n();
  const isArabic = locale === "ar";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ FromDate: "", ToDate: "", PaymentMethodId: "" });

  const params = useMemo(() => {
    const p = {
      Search: search,
      PageNumber: page,
      PageSize: 10,
    };
    if (supplierId) p.Supplier_Id = supplierId;
    if (filters.FromDate) p.FromDate = filters.FromDate;
    if (filters.ToDate) p.ToDate = filters.ToDate;
    if (filters.PaymentMethodId) p.Payment_Method = filters.PaymentMethodId;
    return p;
  }, [page, search, filters, supplierId]);

  const { data, isLoading } = useQuery({
    queryKey: ["getSupplierInvoices", params],
    queryFn: () => getAllInvoices(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const columns = [
    { 
      key: "invoice_Number", 
      label: "Invoice #", 
      render: (row) => <span className="text-blue-600 font-semibold">{row.invoice_Number}</span> 
    },
    { 
      key: "contractSupplierId", 
      label: "Contract Link (ContractSupplierId)", 
      render: (row) => (
        row.contractSupplierId ? (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              #{row.contractSupplierId.substring(0, 8)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">No contract linked</span>
        )
      )
    },
    { 
      key: "invoice_Date", 
      label: "Date",
      render: (row) => row.invoice_Date ? new Date(row.invoice_Date).toLocaleDateString() : "-"
    },
    { 
      key: "total_Amount", 
      label: "Total Amount", 
      render: (row) => <span className="font-medium text-foreground">${Number(row.total_Amount || 0).toLocaleString()}</span> 
    },
    { 
      key: "net_Amount", 
      label: isArabic ? "صافي الفاتورة" : "Net Consumed", 
      render: (row) => (
        <div>
          <span className="text-emerald-700 font-bold block">${Number(row.net_Amount || 0).toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">{isArabic ? "يخصم من العقد" : "Consumes contract"}</span>
        </div>
      )
    },
    { 
      key: "paid_Amount", 
      label: isArabic ? "المبلغ المدفوع" : "Paid Amount", 
      render: (row) => (
        <div>
          <span className="font-semibold text-blue-600 block">${Number(row.paid_Amount || 0).toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">{isArabic ? "مدفوع نقداً" : "Cash paid"}</span>
        </div>
      )
    },
    { 
      key: "payment_Method_Name", 
      label: "Payment Method",
      render: (row) => (
        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
          {row.payment_Method_Name || row.payment_Method || "N/A"}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Informative Guidance Banner */}
      <div className="p-3.5 bg-teal-50/80 border-r-4 border-teal-600 rounded-lg text-xs space-y-1">
        <p className="font-bold text-teal-900">
          كيف ترتبط الفاتورة بالعقد واستحقاق المشتريات:
        </p>
        <p className="text-teal-800 leading-relaxed">
          صافي الفاتورة (Net Amount) يستهلك سقف عقد المورد المحدد بـ ContractSupplierId، بينما يمثل المدفوع (Paid Amount) السيولة المسددة فعلياً. الفاتورة الآجلة تستهلك سقف العقد فور إصدارها حتى لو كان المدفوع صفراً.
        </p>
      </div>

      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Input
                type="date"
                value={filters.FromDate}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, FromDate: e.target.value }));
                  setPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Input
                type="date"
                value={filters.ToDate}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, ToDate: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ FromDate: "", ToDate: "", PaymentMethodId: "" });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search supplier invoices...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        columns={columns}
        card={{
          icon: Receipt,
          title: (row) => row.invoice_Number,
          subtitle: (row) => `Date: ${row.invoice_Date ? new Date(row.invoice_Date).toLocaleDateString() : "-"}`,
          fields: [
            { label: "Net Amount:", value: (row) => `$${row.net_Amount || 0}` },
            { label: "Paid Amount:", value: (row) => `$${row.paid_Amount || 0}` },
            { 
              label: "Contract:", 
              value: (row) => row.contractSupplierId ? `#${row.contractSupplierId.substring(0, 8)}` : "None" 
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
        emptyMessage="No supplier invoices found"
      />
    </div>
  );
}

