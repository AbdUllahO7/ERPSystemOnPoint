import { useMemo, useState } from "react";
import {
  FileText,
  Eye,
  Info,
  Plus,
  Layers,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllInvoices } from "../../../../lib/api";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "@/context/translate-api";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  const invT = t?.invoices || {};
  const instT = t?.installments || {};

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllInvoices", params],
    queryFn: () => getAllInvoices(params),
  });

  const displayRows = useMemo(() => {
    let rows = data?.data?.items || [];
    if (filterPaymentMethod !== "all") {
      rows = rows.filter((r) =>
        String(r.payment_Method || "")
          .toLowerCase()
          .includes(filterPaymentMethod.toLowerCase())
      );
    }
    if (fromDate) {
      rows = rows.filter((r) => new Date(r.invoice_Date) >= new Date(fromDate));
    }
    if (toDate) {
      rows = rows.filter(
        (r) => new Date(r.invoice_Date) <= new Date(toDate + "T23:59:59")
      );
    }
    return rows;
  }, [data, filterPaymentMethod, fromDate, toDate]);
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "details",
            label: isAr ? "التفاصيل" : "Details",
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/accounting/invoices/${row.id}`),
          },
        ],
      },
    ],
    [navigate, isAr],
  );

  const columns = [
    {
      key: "invoice_Number",
      label: invT.invoiceNumber || (isAr ? "رقم الفاتورة" : "Invoice Number"),
    },
    {
      key: "invoice_Date",
      label: invT.date || (isAr ? "التاريخ" : "Date"),
      render: (row) => new Date(row.invoice_Date).toLocaleString(),
    },
    {
      key: "payment_Method",
      label: invT.paymentMethod || (isAr ? "طريقة الدفع" : "Payment Method"),
    },
    {
      key: "net_Amount",
      label: invT.netAmount || (isAr ? "صافي المبلغ" : "Net Amount"),
      render: (row) => `${Number(row?.net_Amount || 0).toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Switcher Tabs (All Invoices vs Installments) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {invT.title || (isAr ? "الفواتير" : "Invoices")}
            </h1>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {invT.description ||
              (isAr
                ? "إدارة فواتير المبيعات والمشتريات وشروط الدفع والمعاملات."
                : "Manage sales and purchase invoices, payment terms, and transactions.")}
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-background text-foreground shadow-xs border border-border">
            <FileText className="w-3.5 h-3.5 text-primary" />
            {invT.allInvoices || (isAr ? "جميع الفواتير" : "All Invoices")}
          </div>
          <Link
            to="/dashboard/accounting/invoices/installments"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            {instT.allInstallments || (isAr ? "الأقساط" : "Installments")}
          </Link>
        </div>
      </div>

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "paymentMethod",
            label: invT.paymentMethod || (isAr ? "طريقة الدفع" : "Payment Method"),
            placeholder: isAr ? "جميع الطرق" : "All Methods",
            options: [
              { value: "Cash", label: isAr ? "نقدي (Cash)" : "Cash" },
              { value: "Credit", label: isAr ? "آجل (Credit)" : "Credit" },
              { value: "Bank", label: isAr ? "بنك (Bank)" : "Bank" },
            ],
          },
          {
            key: "fromDate",
            label: isAr ? "من تاريخ" : "From Date",
            type: "date",
          },
          {
            key: "toDate",
            label: isAr ? "إلى تاريخ" : "To Date",
            type: "date",
          },
        ]}
        filters={{
          paymentMethod: filterPaymentMethod !== "all" ? filterPaymentMethod : "",
          fromDate,
          toDate,
        }}
        onFilterChange={(key, val) => {
          if (key === "paymentMethod") setFilterPaymentMethod(val || "all");
          if (key === "fromDate") setFromDate(val);
          if (key === "toDate") setToDate(val);
          setPage(1);
        }}
        onClear={() => {
          setFilterPaymentMethod("all");
          setFromDate("");
          setToDate("");
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        // selectable
        filter={{
          label: isAr ? "تصفية" : "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        search={{
          placeholder: invT.searchPlaceholder || (isAr ? "البحث في الفواتير..." : "Search invoices..."),
          value: search,
          onChange: handleSearch,
        }}
        addButton={{
          label: invT.addInvoice || (isAr ? "إضافة فاتورة" : "Add Invoice"),
          onClick: () => navigate("/dashboard/accounting/invoices/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => `${invT.invoiceNumber || (isAr ? "فاتورة" : "Inv")}: ${row.invoice_Number}`,
          subtitle: (row) => new Date(row.invoice_Date).toLocaleDateString(),
          fields: [
            {
              icon: Info,
              label: `${invT.netAmount || (isAr ? "صافي المبلغ" : "Net Amount")}:`,
              value: (row) => `$${Number(row.net_Amount || 0).toFixed(2)}`,
            },
            {
              icon: Info,
              label: `${invT.paymentMethod || (isAr ? "طريقة الدفع" : "Payment Method")}:`,
              value: (row) => row.payment_Method || "-",
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: isAr ? "السابق" : (t?.previous || "Prev"),
          nextLabel: isAr ? "التالي" : (t?.next || "Next"),
        }}
        emptyMessage={invT.noInvoicesFound || (isAr ? "لا توجد فواتير" : "No invoices found")}
      />
    </div>
  );
}
