import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContractsByEmployeeId, deleteContract } from "../../../../lib/api";
import { DataView } from "@/components/data-view/DataView";
import { Eye, Hand, Info, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockContracts = [
  { id: "1", startDate: "23/7/2025", endDate: "23/7/2026", status: "Active" },
  { id: "2", startDate: "23/7/2025", endDate: "23/7/2026", status: "Cancelled" },
  { id: "3", startDate: "23/7/2025", endDate: "23/7/2026", status: "Cancelled" },
  { id: "4", startDate: "23/7/2025", endDate: "23/7/2026", status: "Cancelled" },
  { id: "5", startDate: "23/7/2025", endDate: "23/7/2026", status: "Completed" },
  { id: "6", startDate: "23/7/2025", endDate: "23/7/2026", status: "Completed" },
];

export default function EmployeeContractsTab() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [endingContract, setEndingContract] = useState(null);
  const [confirmName, setConfirmName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ month: "", year: "" });

  const params = useMemo(() => ({
    Search: search || undefined,
    PageNumber: page,
    PageSize: 10,
    month: filters.month || undefined,
    year: filters.year || undefined,
  }), [search, page, filters]);

  const { data, isLoading } = useQuery({
    queryKey: ["getContractsByEmployeeId", id, params],
    queryFn: () => getContractsByEmployeeId(id, params),
    enabled: !!id,
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const deleteMutation = useMutation({
    mutationFn: (contractId) => deleteContract(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getContractsByEmployeeId"]);
      toast.success("Contract ended successfully!");
      setEndingContract(null);
      setConfirmName("");
    },
    onError: (error) => {
      console.error("Failed to end contract:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to end contract!");
    }
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-[#0066d1] font-medium">#{row.id.slice(0, 8)}</span>,
      sortable: true,
    },
    { key: "salary", label: "Salary", render: (row) => `$${row.salary}` },
    { key: "startDate", label: "Start Date", sortable: true },
    { key: "endDate", label: "End Date", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusText = row.status || "Active";
        const bg = statusText === "Cancelled" ? "bg-red-50 text-red-600" : statusText === "Completed" ? "bg-blue-50 text-blue-600" : "bg-blue-50 text-[#0066d1]";
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>
            {statusText}
          </span>
        );
      },
      sortable: true,
    },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          label: "View",
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/hr/employees/${id || 1}/contracts/${row.id}`),
        },
        {
          label: "Ending",
          icon: Hand,
          destructive: true,
          onClick: (row) => setEndingContract(row),
        },
      ],
    },
  ];

  return (
    <div className="mt-4 space-y-4">
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
            {[
              {
                key: "month",
                label: "Filter by Month",
                placeholder: "All Months",
                options: [{ value: "1", label: "January" }, { value: "2", label: "February" }],
              },
              {
                key: "year",
                label: "Filter by Year",
                placeholder: "All Years",
                options: [{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }],
              },
            ].map((config) => (
              <div
                key={config.key}
                className="flex flex-col gap-2 w-full sm:max-w-[200px]"
              >
                <label className="text-sm font-medium text-foreground">
                  {config.label}
                </label>
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    setFilters((prev) => ({
                      ...prev,
                      [config.key]: val === "all" ? "" : val,
                    }));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{config.placeholder}</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ month: "", year: "" });
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
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        card={{
          icon: FileText,
          title: (row) => `Contract #${row.id}`,
          subtitle: (row) => `${row.startDate} - ${row.endDate}`,
          fields: [
            {
              label: "Status:",
              value: (row) => {
                const statusText = row.status || "Active";
                const bg = statusText === "Cancelled" ? "bg-red-50 text-red-600" : statusText === "Completed" ? "bg-blue-50 text-blue-600" : "bg-blue-50 text-[#0066d1]";
                return (
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>
                    {statusText}
                  </span>
                );
              },
            },
          ],
        }}
        onRefresh={() => queryClient.invalidateQueries(["getContractsByEmployeeId"])}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate(`/dashboard/hr/contracts/add?employeeId=${id}`),
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
        emptyMessage="No contracts found"
      />

      {/* Confirm Ending Modal */}
      <Dialog open={!!endingContract} onOpenChange={(open) => {
        if (!open) {
          setEndingContract(null);
          setConfirmName("");
        }
      }}>
        <DialogContent className="sm:max-w-[425px] text-center p-6 rounded-2xl border-0 shadow-lg">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <Hand className="w-8 h-8" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-[#1e293b]">Confirm Ending</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground mt-2 text-sm leading-relaxed">
              You want to end this contract, this cant be undone ,To<br/>end, enter the employee name
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 text-left">
            <label className="text-sm font-semibold text-foreground mb-2 block">Employee Name</label>
            <Input 
              placeholder="Employee Name" 
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="h-11 rounded-lg border-gray-200"
            />
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Button 
              variant="outline" 
              onClick={() => setEndingContract(null)} 
              className="w-24 bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-700 h-10"
            >
              Back
            </Button>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700 w-40 h-10 font-semibold"
              onClick={() => deleteMutation.mutate(endingContract.id)}
              disabled={deleteMutation.isPending}
            >
              Approve and End
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
