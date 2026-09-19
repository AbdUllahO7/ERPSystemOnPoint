import { useState, useMemo } from "react";
import { DataView } from "@/components/data-view/DataView";
import { MinusCircle, DollarSign, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployeeById, getDiscounts, deleteDiscount } from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

export default function EmployeeSalaryDeductions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  
  const [filters, setFilters] = useState({
    DiscountType: "",
    MinAmount: "",
    MaxAmount: "",
    DateFrom: "",
    DateTo: ""
  });

  const params = useMemo(() => ({
    EmployeeId: id,
    PageNumber: page,
    PageSize: 10,
    Search: search || undefined,
    DiscountType: filters.DiscountType || undefined,
    MinAmount: filters.MinAmount || undefined,
    MaxAmount: filters.MaxAmount || undefined,
    DateFrom: filters.DateFrom || undefined,
    DateTo: filters.DateTo || undefined,
  }), [id, page, search, filters]);

  const { data: employeeData } = useQuery({
    queryKey: ["getEmployeeById", id],
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  });

  const { data: discountsData, isLoading, refetch } = useQuery({
    queryKey: ["getDiscounts", params],
    queryFn: () => getDiscounts(params),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (deleteId) => deleteDiscount(deleteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDiscounts"]);
      toast.success("Deduction deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete discount:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete deduction!");
      setDeleteRowId(null);
    },
  });

  const salaryBreakdown = employeeData?.data?.salaryBreakdown || null;
  const displayRows = discountsData?.data?.items || [];
  const totalPages = discountsData?.data?.totalPages || 1;
  const currentPage = discountsData?.data?.pageNumber || page;

  const columns = [
    {
      key: "discountType",
      label: "Discount Type",
      sortable: true,
    },
    { 
      key: "date", 
      label: "Date", 
      render: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true 
    },
    { 
      key: "amount", 
      label: "Amount", 
      render: (row) => <span className="text-red-500 font-medium">-{row.amount}$</span>,
      sortable: true 
    },
    { key: "notes", label: "Notes", sortable: true },
  ];

  const rowActionsMenu = useMemo(() => [
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
  ], []);

  return (
    <div className="space-y-4">
      {/* Salary Breakdown Stats */}
      {salaryBreakdown && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-blue-500">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Basic Salary</p>
              <div className="text-2xl font-bold text-foreground">{salaryBreakdown.basicSalary}</div>
            </div>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-green-500">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Bonuses</p>
              <div className="text-2xl font-bold text-foreground text-green-500">+{salaryBreakdown.totalBonuses}</div>
            </div>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-red-500">
              <MinusCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <div className="text-2xl font-bold text-foreground text-red-500">-{salaryBreakdown.totalDeductions}</div>
            </div>
          </div>
          <div className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white bg-primary">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Net Salary</p>
              <div className="text-2xl font-bold text-foreground">{salaryBreakdown.netSalary}</div>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Discount Type</label>
              <Select
                value={filters.DiscountType || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, DiscountType: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Damage">Damage</SelectItem>
                  <SelectItem value="LoanRepayment">LoanRepayment</SelectItem>
                  <SelectItem value="Tax">Tax</SelectItem>
                  <SelectItem value="Penalty">Penalty</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Min Amount</label>
              <Input
                type="number"
                placeholder="Min"
                value={filters.MinAmount || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, MinAmount: e.target.value }));
                  setPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Max Amount</label>
              <Input
                type="number"
                placeholder="Max"
                value={filters.MaxAmount || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, MaxAmount: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Date From</label>
              <Input
                type="date"
                value={filters.DateFrom || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, DateFrom: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Date To</label>
              <Input
                type="date"
                value={filters.DateTo || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, DateTo: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ DiscountType: "", MinAmount: "", MaxAmount: "", DateFrom: "", DateTo: "" });
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
      selectable
      search={{
        placeholder: "Search deductions...",
        value: search,
        onChange: setSearch,
      }}
      filter={{
        label: "Filter",
        onClick: () => setIsFilterOpen(!isFilterOpen),
      }}
      card={{
        icon: MinusCircle,
        title: (row) => row.discountType,
        subtitle: (row) => new Date(row.date).toLocaleDateString(),
        fields: [
          {
            label: "Amount:",
            value: (row) => <span className="text-red-500 font-medium">-{row.amount}$</span>,
          },
        ],
      }}
      onRefresh={() => refetch()}
      onPrint={() => window.print()}
      export={{
        label: "Export",
        onClick: () => console.log("export"),
      }}
      addButton={{
        label: "Add Deduction",
        onClick: () => navigate(`/dashboard/hr/deductions/add?employeeId=${id}`),
      }}
      onColumnSettings={() => console.log("columns")}
      columns={columns}
      rowActionsMenu={rowActionsMenu}
      pagination={{
        page: currentPage,
        totalPages: totalPages,
        onPageChange: setPage,
        prevLabel: "Pre",
        nextLabel: "Next",
      }}
      emptyMessage="No deductions records found"
    />

    {/* Delete Confirmation Dialog */}
    <DeleteConfirmDialog
      isOpen={!!deleteRowId}
      onClose={() => setDeleteRowId(null)}
      onConfirm={() => {
        if (deleteRowId) {
          deleteMutation.mutate(deleteRowId);
        }
      }}
      isLoading={deleteMutation.isPending || deleteMutation.isLoading}
      title="Delete Discount"
      description="Are you sure you want to delete this discount? This action cannot be undone."
    />
    </div>
  );
}
