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

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  const displayRows = data?.data?.items || [];
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
            label: "Details",
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/accounting/invoices/${row.id}`),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "invoice_Number",
      label: "Invoice Number",
      
    },
    {
      key: "invoice_Date",
      label: "Date",
      
      render: (row) => new Date(row.invoice_Date).toLocaleString(),
    },
    {
      key: "payment_Method",
      label: "Payment Method",
    },
    {
      key: "net_Amount",
      label: "Net Amount",
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
              Invoices (الفواتير)
            </h1>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage sales and purchase invoices, payment terms, and transactions.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-background text-foreground shadow-xs border border-border">
            <FileText className="w-3.5 h-3.5 text-primary" />
            All Invoices
          </div>
          <Link
            to="/dashboard/accounting/invoices/installments"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            Installments
          </Link>
        </div>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        // selectable
        search={{
          placeholder: "Search invoices...",
          value: search,
          onChange: handleSearch,
        }}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add Invoice",
          onClick: () => navigate("/dashboard/accounting/invoices/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => `Inv: ${row.invoice_Number}`,
          subtitle: (row) => new Date(row.invoice_Date).toLocaleDateString(),
          fields: [
            {
              icon: Info,
              label: "Net Amount:",
              value: (row) => `$${Number(row.net_Amount || 0).toFixed(2)}`,
            },
            {
              icon: Info,
              label: "Payment Method:",
              value: (row) => row.payment_Method || "-",
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
        emptyMessage="No invoices found"
      />
    </div>
  );
}
