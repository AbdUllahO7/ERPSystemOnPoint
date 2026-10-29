import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Eye,
  CreditCard,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Layers,
  ArrowRight,
  Receipt,
  RotateCcw,
} from "lucide-react";

import { DataView } from "@/components/data-view/DataView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/context/translate-api";
import { getAllInstallments } from "@/services/accounting";
import PayInstallmentDialog from "./_components/pay-installment-dialog";
import InstallmentDetailsDialog from "./_components/installment-details-dialog";

export default function InstallmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();

  const instT = t?.installments || {};
  const invT = t?.invoices || {};

  // Filters state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDueDate, setFromDueDate] = useState("");
  const [toDueDate, setToDueDate] = useState("");

  const invoiceIdParam = searchParams.get("invoiceId") || "";

  // Modals state
  const [selectedForPay, setSelectedForPay] = useState(null);
  const [selectedIdForDetails, setSelectedIdForDetails] = useState(null);

  // Query Params for GET /api/accounting/Invoices/getallInstallment/getAll-installment
  const params = useMemo(() => {
    const p = {
      PageNumber: page,
      PageSize: pageSize,
    };
    if (search.trim()) p.Search = search.trim();
    if (statusFilter && statusFilter !== "all") p.Status = statusFilter;
    if (fromDueDate) p.FromDueDate = fromDueDate;
    if (toDueDate) p.ToDueDate = toDueDate;
    if (invoiceIdParam) p.InvoiceId = invoiceIdParam;
    return p;
  }, [page, pageSize, search, statusFilter, fromDueDate, toDueDate, invoiceIdParam]);

  const { data: responseData, isLoading, refetch } = useQuery({
    queryKey: ["getAllInstallments", params],
    queryFn: () => getAllInstallments(params),
  });

  const rawData = responseData?.data || {};
  const items = Array.isArray(rawData) ? rawData : rawData?.items || [];
  const totalCount = rawData?.totalCount ?? items.length;
  const totalPages = rawData?.totalPages ?? (Math.ceil(totalCount / pageSize) || 1);
  const currentPage = rawData?.pageNumber ?? page;

  // Compute Summary KPI Stats
  const stats = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let countPaid = 0;
    let countPending = 0;
    let countOverdue = 0;

    const now = new Date();

    items.forEach((item) => {
      const due = Number(
        item.amountDue ?? item.amount_Due ?? item.totalAmount ?? item.amount ?? 0
      );
      const paid = Number(
        item.amountPaid ?? item.amount_Paid ?? item.paidAmount ?? 0
      );
      const remaining = Math.max(0, due - paid);
      const dueDate = item.dueDate || item.due_Date;

      totalDue += due;
      totalPaid += paid;

      if (remaining === 0 && due > 0) {
        countPaid += 1;
      } else if (dueDate && new Date(dueDate) < now && remaining > 0) {
        countOverdue += 1;
      } else {
        countPending += 1;
      }
    });

    const totalRemaining = Math.max(0, totalDue - totalPaid);

    return {
      totalCount: totalCount || items.length,
      totalDue,
      totalPaid,
      totalRemaining,
      countPaid,
      countPending,
      countOverdue,
    };
  }, [items, totalCount]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setFromDueDate("");
    setToDueDate("");
    setPage(1);
    if (invoiceIdParam) {
      searchParams.delete("invoiceId");
      setSearchParams(searchParams);
    }
  };

  // Helper status badge renderer
  const renderStatusBadge = (row) => {
    const due = Number(row.amountDue ?? row.amount_Due ?? row.amount ?? 0);
    const paid = Number(row.amountPaid ?? row.amount_Paid ?? row.paidAmount ?? 0);
    const remaining = Math.max(0, due - paid);
    const dueDate = row.dueDate || row.due_Date;

    const isFullyPaid = remaining === 0 && due > 0;
    const isOverdue = dueDate && new Date(dueDate) < new Date() && remaining > 0;
    const isPartiallyPaid = paid > 0 && remaining > 0;

    if (isFullyPaid) {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-medium">
          <CheckCircle2 className="w-3 h-3" /> {instT.statuses?.paid || "Paid"}
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 text-[11px] font-medium">
          <AlertCircle className="w-3 h-3" /> {instT.statuses?.overdue || "Overdue"}
        </Badge>
      );
    }
    if (isPartiallyPaid) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px] font-medium">
          <Clock className="w-3 h-3" /> {instT.statuses?.partiallyPaid || "Partially Paid"}
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 text-[11px] font-medium">
        <Clock className="w-3 h-3" /> {instT.statuses?.pending || "Pending"}
      </Badge>
    );
  };

  // Row Action Menu for DataView
  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "details",
            label: instT.viewDetails || "View Details",
            icon: Eye,
            onClick: (row) => setSelectedIdForDetails(row.id || row.scheduleId),
          },
          {
            key: "pay",
            label: instT.payInstallment || "Pay Installment",
            icon: CreditCard,
            onClick: (row) => setSelectedForPay(row),
          },
        ],
      },
    ],
    [instT]
  );

  // Table Columns
  const columns = [
    {
      key: "invoice_Number",
      label: instT.invoiceNumber || "Invoice #",
      render: (row) => {
        const invNum =
          row.invoice_Number ||
          row.invoiceNumber ||
          row.invoice?.invoice_Number ||
          "N/A";
        const invId = row.invoiceId || row.invoice_Id;
        return invId ? (
          <Link
            to={`/dashboard/accounting/invoices/${invId}`}
            className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            #{invNum}
          </Link>
        ) : (
          <span className="font-semibold text-foreground">#{invNum}</span>
        );
      },
    },
    {
      key: "description",
      label: instT.scheduleDescription || "Schedule / Description",
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-medium text-foreground text-xs block">
            {row.description || row.desc || (instT.scheduleDescription || "Payment Schedule")}
          </span>
          {row.notes && (
            <span className="text-[11px] text-muted-foreground line-clamp-1">
              {row.notes}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "dueDate",
      label: instT.dueDate || "Due Date",
      render: (row) => {
        const dateVal = row.dueDate || row.due_Date;
        return dateVal ? (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(dateVal).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        );
      },
    },
    {
      key: "amountDue",
      label: instT.amountDue || "Amount Due",
      render: (row) => {
        const amount = Number(
          row.amountDue ?? row.amount_Due ?? row.totalAmount ?? row.amount ?? 0
        );
        return (
          <span className="font-semibold text-foreground text-xs">
            ${amount.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "amountPaid",
      label: instT.amountPaid || "Amount Paid",
      render: (row) => {
        const paid = Number(
          row.amountPaid ?? row.amount_Paid ?? row.paidAmount ?? 0
        );
        return (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
            ${paid.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "remainingAmount",
      label: instT.remaining || "Remaining",
      render: (row) => {
        const due = Number(
          row.amountDue ?? row.amount_Due ?? row.totalAmount ?? row.amount ?? 0
        );
        const paid = Number(
          row.amountPaid ?? row.amount_Paid ?? row.paidAmount ?? 0
        );
        const remaining = Math.max(0, due - paid);
        return (
          <span className="font-bold text-primary text-xs">
            ${remaining.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: instT.status || "Status",
      render: (row) => renderStatusBadge(row),
    },
    {
      key: "actions",
      label: instT.actions || "Actions",
      render: (row) => {
        const due = Number(row.amountDue ?? row.amount_Due ?? row.amount ?? 0);
        const paid = Number(row.amountPaid ?? row.amount_Paid ?? row.paidAmount ?? 0);
        const remaining = Math.max(0, due - paid);

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIdForDetails(row.id || row.scheduleId)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title={instT.viewDetails || "View Details"}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {remaining > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedForPay(row)}
                className="h-8 px-2.5 text-xs gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                title={instT.payInstallment || "Pay Installment"}
              >
                <CreditCard className="w-3.5 h-3.5" />
                {instT.pay || "Pay"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-12">
      {/* Navigation Switcher Tabs (All Invoices vs Installments) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {instT.title || "Invoice Installments"}
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary">
              {invT.title || "Invoices"} / {instT.allInstallments || "Installments"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {instT.subtitle || "Track, manage, and collect invoice payment schedules and installments."}
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border">
          <Link
            to="/dashboard/accounting/invoices"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <Receipt className="w-3.5 h-3.5" />
            {invT.allInvoices || "All Invoices"}
          </Link>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-background text-foreground shadow-xs border border-border">
            <Layers className="w-3.5 h-3.5 text-primary" />
            {instT.allInstallments || "Installments"}
          </div>
        </div>
      </div>

      {/* Filter Info If Filtered by specific invoice */}
      {invoiceIdParam && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Filter className="w-4 h-4" />
            <span>{instT.filteredForInvoice || "Showing installments filtered for Invoice ID:"}</span>
            <span className="font-mono font-bold">{invoiceIdParam}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="w-3.5 h-3.5" /> {instT.clearFilter || "Clear Filter"}
          </Button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              {instT.totalInstallments || "Total Installments"}
            </span>
            <span className="text-2xl font-bold text-foreground">
              {stats.totalCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              {instT.totalDue || "Total Due"}
            </span>
            <span className="text-2xl font-bold text-foreground">
              ${stats.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              {instT.totalCollected || "Total Collected"}
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-medium block">
              {instT.outstanding || "Outstanding"}
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${stats.totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="w-44">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full h-9 text-xs">
              <SelectValue placeholder={instT.allStatuses || "All Statuses"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{instT.allStatuses || "All Statuses"}</SelectItem>
              <SelectItem value="Pending">{instT.statuses?.pending || "Pending"}</SelectItem>
              <SelectItem value="PartiallyPaid">{instT.statuses?.partiallyPaid || "Partially Paid"}</SelectItem>
              <SelectItem value="Paid">{instT.statuses?.paid || "Paid"}</SelectItem>
              <SelectItem value="Overdue">{instT.statuses?.overdue || "Overdue"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range: From */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{instT.from || "From:"}</span>
          <Input
            type="date"
            value={fromDueDate}
            onChange={(e) => {
              setFromDueDate(e.target.value);
              setPage(1);
            }}
            className="h-9 w-36 text-xs"
          />
        </div>

        {/* Date Range: To */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{instT.to || "To:"}</span>
          <Input
            type="date"
            value={toDueDate}
            onChange={(e) => {
              setToDueDate(e.target.value);
              setPage(1);
            }}
            className="h-9 w-36 text-xs"
          />
        </div>

        {(statusFilter !== "all" || fromDueDate || toDueDate || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {instT.reset || "Reset"}
          </Button>
        )}
      </div>

      {/* Main DataView Table */}
      <DataView
        data={items}
        isLoading={isLoading}
        getRowId={(row) => row.id || row.scheduleId}
        search={{
          placeholder: instT.searchPlaceholder || "Search by description, invoice #, or notes...",
          value: search,
          onChange: (val) => {
            setSearch(val);
            setPage(1);
          },
        }}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("Exporting installments..."),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Layers,
          title: (row) =>
            row.invoice_Number
              ? `#${row.invoice_Number}`
              : row.description || (instT.scheduleDescription || "Schedule"),
          subtitle: (row) =>
            row.dueDate
              ? `${instT.dueDate || "Due"}: ${new Date(row.dueDate).toLocaleDateString()}`
              : (instT.notSpecified || "No due date"),
          fields: [
            {
              icon: DollarSign,
              label: `${instT.amountDue || "Due"}:`,
              value: (row) => `$${Number(row.amountDue || 0).toFixed(2)}`,
            },
            {
              icon: CheckCircle2,
              label: `${instT.amountPaid || "Paid"}:`,
              value: (row) => `$${Number(row.amountPaid || 0).toFixed(2)}`,
            },
            {
              icon: Clock,
              label: `${instT.remaining || "Remaining"}:`,
              value: (row) =>
                `$${Math.max(0, Number(row.amountDue || 0) - Number(row.amountPaid || 0)).toFixed(2)}`,
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: t?.previous || "Prev",
          nextLabel: t?.next || "Next",
        }}
        emptyMessage={instT.noInstallmentsFound || "No installments or payment schedules found."}
      />

      {/* Pay Installment Modal */}
      {selectedForPay && (
        <PayInstallmentDialog
          isOpen={Boolean(selectedForPay)}
          onClose={() => setSelectedForPay(null)}
          installment={selectedForPay}
          onSuccess={() => refetch()}
        />
      )}

      {/* Installment Details Modal */}
      {selectedIdForDetails && (
        <InstallmentDetailsDialog
          isOpen={Boolean(selectedIdForDetails)}
          onClose={() => setSelectedIdForDetails(null)}
          installmentId={selectedIdForDetails}
          onPay={(inst) => setSelectedForPay(inst)}
        />
      )}
    </div>
  );
}
