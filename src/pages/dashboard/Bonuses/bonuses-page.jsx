import { useState, useMemo } from "react";
import { DataView } from "@/components/data-view/DataView";
import { Eye, Edit, Trash2, Building2, Users as UsersIcon, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRewards, deleteReward, getEmployees } from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const stats = [
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0066d1]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#5ebc93]", icon: UsersIcon },
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0b386a]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#ff9548]", icon: UsersIcon }
];

export default function BonusesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  
  const [filters, setFilters] = useState({
    EmployeeId: "",
    RewardCategory: "",
    MinAmount: "",
    MaxAmount: "",
    DateFrom: "",
    DateTo: ""
  });

  const params = useMemo(() => ({
    PageNumber: page,
    PageSize: 10,
    Search: search || undefined,
    EmployeeId: filters.EmployeeId || undefined,
    RewardCategory: filters.RewardCategory || undefined,
    MinAmount: filters.MinAmount || undefined,
    MaxAmount: filters.MaxAmount || undefined,
    DateFrom: filters.DateFrom || undefined,
    DateTo: filters.DateTo || undefined,
  }), [page, search, filters]);

  const { data: employeesResponse } = useQuery({
    queryKey: ["getEmployeesList"],
    queryFn: () => getEmployees({ PageSize: 1000 }),
  });

  const { data: rewardsData, isLoading, refetch } = useQuery({
    queryKey: ["getRewards", params],
    queryFn: () => getRewards(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (deleteId) => deleteReward(deleteId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getRewards"]);
      toast.success("Bonus deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete reward:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete bonus!");
      setDeleteRowId(null);
    },
  });

  const employeeOptions = useMemo(() => employeesResponse?.data?.items?.map(e => ({ value: e.id, label: e.fullName })) || [], [employeesResponse]);
  const displayRows = rewardsData?.data?.items || [];
  const totalPages = rewardsData?.data?.totalPages || 1;
  const currentPage = rewardsData?.data?.pageNumber || page;

  const columns = [
    {
      key: "employeeName",
      label: "Employee Name",
      render: (row) => <span className="text-primary font-medium hover:underline cursor-pointer">{row.employeeName}</span>,
      sortable: true,
    },
    { key: "rewardCategory", label: "Reward Category", sortable: true },
    { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString(), sortable: true },
    { key: "amount", label: "Amount", render: (row) => <span className="text-green-500 font-medium">+{row.amount}$</span>, sortable: true },
    { key: "notes", label: "Notes", sortable: true },
  ];

  const rowActionsMenu = useMemo(() => [
    {
      items: [
        { label: "Delete", icon: Trash2, destructive: true, onClick: (row) => setDeleteRowId(row.id) },
      ],
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend} {stat.isUp ? '↑' : '↓'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              <label className="text-sm font-medium text-foreground">Employee</label>
              <Select
                value={filters.EmployeeId || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, EmployeeId: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employeeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Reward Category</label>
              <Select
                value={filters.RewardCategory || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, RewardCategory: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Bonus">Bonus</SelectItem>
                  <SelectItem value="Commission">Commission</SelectItem>
                  <SelectItem value="Overtime">Overtime</SelectItem>
                  <SelectItem value="Exceptional">Exceptional</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[120px]">
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
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[120px]">
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
              <Button variant="outline" onClick={() => { setFilters({ EmployeeId: "", RewardCategory: "", MinAmount: "", MaxAmount: "", DateFrom: "", DateTo: "" }); setPage(1); }}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DataView */}
      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        
        search={{ placeholder: "Search bonuses...", value: search, onChange: setSearch }}
        filter={{ label: "Filter", onClick: () => setIsFilterOpen(!isFilterOpen) }}
        card={{
          icon: DollarSign,
          title: (row) => row.employeeName,
          subtitle: (row) => new Date(row.date).toLocaleDateString(),
          fields: [
            { label: "Category:", value: (row) => row.rewardCategory },
            { label: "Amount:", value: (row) => <span className="text-green-500 font-medium">+{row.amount}$</span> },
          ],
        }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{ label: "Export", onClick: () => console.log("export") }}
        addButton={{ label: "Add Bonus", onClick: () => navigate("/dashboard/hr/bounces/add") }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{ page: currentPage, totalPages: totalPages, onPageChange: setPage, prevLabel: "Pre", nextLabel: "Next" }}
        emptyMessage="No bonuses found"
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
        title="Delete Bonus"
        description="Are you sure you want to delete this bonus? This action cannot be undone."
      />
    </div>
  );
}
