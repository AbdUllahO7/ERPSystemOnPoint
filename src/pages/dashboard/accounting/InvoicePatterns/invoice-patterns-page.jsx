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

export default function InvoicePatternsPage() {
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
      label: "Filter by Invoice Type",
      placeholder: "All Types",
      options: [
        { value: "Sales", label: "Sales" },
        { value: "Purchases", label: "Purchases" },
        { value: "Sales_Returns", label: "Sales Returns" },
        { value: "Purchases_Returns", label: "Purchases Returns" },
        { value: "Opening_Balance", label: "Opening Balance" },
      ],
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInvoicePattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllInvoicePatterns"]);
      toast.success("Invoice pattern deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete invoice pattern", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete invoice pattern!");
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
            label: "Details",
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
            label: "Edit",
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
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "pattern_Name",
      label: "Name",
      sortable: true,
    },
    {
      key: "invoiceType",
      label: "Type",
      sortable: true,
    },
    {
      key: "material_Account_Name",
      label: "Material Account",
    },
    {
      key: "cash_Account_Name",
      label: "Cash Account",
    },
    {
      key: "discount_Account_Name",
      label: "Discount Account",
    },
    {
      key: "warehouse_Name",
      label: "Warehouse",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          Invoice Patterns
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
          placeholder: "Search invoice patterns...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllInvoicePatterns"])}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/invoice-patterns/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.pattern_Name,
          subtitle: (row) => `Type: ${row.invoiceType}`,
          fields: [
            {
              icon: Info,
              label: "Material Account:",
              value: (row) => row.material_Account_Name || "-",
            },
            {
              icon: Info,
              label: "Warehouse:",
              value: (row) => row.warehouse_Name || "-",
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
        emptyMessage="No invoice patterns found"
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteRowId);
        }}
        title="Delete Invoice Pattern"
        description="Are you sure you want to delete this pattern? This action cannot be undone."
      />
    </div>
  );
}
