import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  FileText,
  Eye,
  Info,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllInvoicePatterns,
  deleteInvoicePattern,
} from "../../../../lib/api";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";

export default function InvoicePatternsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ Type: "" });
  const [deleteRowId, setDeleteRowId] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const filterConfigs = [
    {
      key: "Type",
      label: t("invoicePatterns.filterByType"),
      placeholder: t("invoicePatterns.allTypes"),
      options: [
        { value: "Sales", label: t("invoicePatterns.types.sales") },
        { value: "Purchases", label: t("invoicePatterns.types.purchases") },
        { value: "Sales_Returns", label: t("invoicePatterns.types.salesReturns") },
        { value: "Purchases_Returns", label: t("invoicePatterns.types.purchasesReturns") },
        { value: "Opening_Balance", label: t("invoicePatterns.types.openingBalance") },
      ],
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInvoicePattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllInvoicePatterns"]);
      toast.success(t("invoicePatterns.deleteSuccess"));
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete invoice pattern", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : t("invoicePatterns.deleteError"));
    },
  });

  const params = useMemo(
    () => ({
      search: search,
      Type: filters.Type || undefined,
      pageNumber: page,
      pageSize: 10,
    }),
    [page, search, filters.Type],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllInvoicePatterns", params],
    queryFn: () => getAllInvoicePatterns(params),
  });

  const rawList = data?.data?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
  const displayRows = Array.isArray(rawList) ? rawList : [];
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
            label: t("common.viewDetails"),
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/accounting/invoice-patterns/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: t("common.edit"),
            icon: Pencil,
            onClick: (row) =>
              navigate(`/dashboard/accounting/invoice-patterns/edit/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: t("common.delete"),
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate, t],
  );

  const columns = [
    {
      key: "pattern_Name",
      label: t("invoicePatterns.name"),
      sortable: true,
    },
    {
      key: "invoiceType",
      label: t("invoicePatterns.type"),
      sortable: true,
    },
    {
      key: "material_Account_Name",
      label: t("invoicePatterns.materialAccount"),
    },
    {
      key: "cash_Account_Name",
      label: t("invoicePatterns.cashAccount"),
    },
    {
      key: "discount_Account_Name",
      label: t("invoicePatterns.discountAccount"),
    },
    {
      key: "warehouse_Name",
      label: t("invoicePatterns.warehouse"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {t("invoicePatterns.title")}
        </h2>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>

      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={filterConfigs}
        filters={filters}
        onFilterChange={(key, val) => {
          setFilters((prev) => ({ ...prev, [key]: val }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ Type: "" });
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: t("invoicePatterns.searchPlaceholder"),
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: t("common.filter"),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllInvoicePatterns"])}
        addButton={{
          label: t("common.add"),
          onClick: () => navigate("/dashboard/accounting/invoice-patterns/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.pattern_Name,
          subtitle: (row) => `${t("invoicePatterns.type")}: ${row.invoiceType}`,
          fields: [
            {
              icon: Info,
              label: `${t("invoicePatterns.materialAccount")}:`,
              value: (row) => row.material_Account_Name || "-",
            },
            {
              icon: Info,
              label: `${t("invoicePatterns.warehouse")}:`,
              value: (row) => row.warehouse_Name || "-",
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: t("common.prev"),
          nextLabel: t("common.next"),
        }}
        emptyMessage={t("invoicePatterns.notFound")}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteRowId);
        }}
        title={t("invoicePatterns.deleteTitle")}
        description={t("invoicePatterns.deleteDesc")}
      />
    </div>
  );
}
