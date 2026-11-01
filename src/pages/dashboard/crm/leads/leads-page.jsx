import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Building,
  RefreshCcw,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeads, changeLeadStatus, deleteLead } from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: UsersIcon,
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon,
  },
];

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: "",
    isPriceOfferAccepted: false,
    projectName: "",
    projectValue: "",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tabs = ["All", "New", "Contacted", "Qualified", "Quotation", "Converted", "Lost"];

  const params = useMemo(() => {
    const p = {
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search,
    };
    if (filterStatus !== "all") {
      p.Status = filterStatus;
    } else if (activeTab !== "All") {
      p.Status = activeTab;
    }
    return p;
  }, [page, search, activeTab, filterStatus]);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", params],
    queryFn: () => getLeads(params),
  });

  const leads = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  const statusMutation = useMutation({
    mutationFn: (payload) => changeLeadStatus(payload),
    onSuccess: () => {
      toast.success("Status changed successfully");
      queryClient.invalidateQueries(["leads"]);
      setIsStatusDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to change status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLead(id),
    onSuccess: () => {
      toast.success("Lead deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setDeleteRowId(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete lead!");
      setDeleteRowId(null);
    },
  });

  const handleStatusSubmit = () => {
    if (statusForm.status === "Converted") {
      if (selectedLead?.status === "Converted") {
        toast.error("This opportunity has already been converted to a customer.");
        return;
      }
      if (!statusForm.isPriceOfferAccepted) {
        toast.error("Please confirm acceptance of the price offer by the client.");
        return;
      }
      if (!statusForm.projectName?.trim()) {
        toast.error("Please provide a project name.");
        return;
      }
      if (!statusForm.projectValue || Number(statusForm.projectValue) <= 0) {
        toast.error("Please provide an approved project value.");
        return;
      }
    }

    const payload = {
      leadId: selectedLead.id,
      newStatus: statusForm.status,
      isPriceOfferAccepted: statusForm.status === "Converted" ? statusForm.isPriceOfferAccepted : false,
      projectName: statusForm.status === "Converted" ? statusForm.projectName.trim() : "",
      projectValue: statusForm.status === "Converted" ? Number(statusForm.projectValue) || 0 : 0,
    };
    statusMutation.mutate(payload);
  };


  const columns = [
    { key: "id", label: "ID", render: (row) => <span className="text-blue-500 font-medium">#{row.id.substring(0, 8)}</span> },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "phoneNumber", label: "Phone" },
    { key: "expectedValue", label: "Value", render: (row) => <span className="text-blue-500">${row.expectedValue}</span> },
    { key: "responsible", label: "Responsible", render: (row) => row.responsible || "None" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => {
        let colorClass = "bg-gray-100 text-gray-600";
        switch(row.status) {
          case "New": colorClass = "bg-green-100 text-green-600"; break;
          case "Contacted": colorClass = "bg-blue-100 text-blue-600"; break;
          case "Qualified": colorClass = "bg-teal-100 text-teal-600"; break;
          case "Quotation": colorClass = "bg-yellow-100 text-yellow-600"; break;
          case "Converted": colorClass = "bg-purple-100 text-purple-600"; break;
          case "Lost": colorClass = "bg-red-100 text-red-600"; break;
        }
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{row.status}</span>;
      }
    },
    { key: "createdAt", label: "Created At", render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  const cardConfig = {
    icon: UsersIcon,
    title: (row) => row.name,
    subtitle: (row) => row.company || "No Company",
    fields: [
      { key: "phoneNumber", label: "Phone", value: (row) => row.phone || row.phoneNumber || "-" },
      { key: "expectedValue", label: "Value", value: (row) => <span className="text-blue-500 font-medium">${row.expectedValue || 0}</span> },
      { key: "responsible", label: "Responsible", value: (row) => row.responsible || "None" },
      { 
        key: "status", 
        label: "Status",
        value: (row) => {
          let colorClass = "bg-gray-100 text-gray-600";
          switch(row.status) {
            case "New": colorClass = "bg-green-100 text-green-600"; break;
            case "Contacted": colorClass = "bg-blue-100 text-blue-600"; break;
            case "Qualified": colorClass = "bg-teal-100 text-teal-600"; break;
            case "Quotation": colorClass = "bg-yellow-100 text-yellow-600"; break;
            case "Converted": colorClass = "bg-purple-100 text-purple-600"; break;
            case "Lost": colorClass = "bg-red-100 text-red-600"; break;
          }
          return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{row.status}</span>;
        }
      },
    ]
  };

  const rowActionsMenu = [
    {
      items: [
        {
          key: "view",
          label: "View",
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/crm/leads/${row.id}`),
        },
        {
          key: "changeStatus",
          label: "Change Status",
          icon: RefreshCcw,
          onClick: (row) => {
            setSelectedLead(row);
            setStatusForm({ status: row.status, isPriceOfferAccepted: false, projectName: "", projectValue: "" });
            setIsStatusDialogOpen(true);
          }
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/crm/leads/edit/${row.id}`),
        },
      ]
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
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
        <span>Leads</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? "text-green-500" : "text-red-500"}`}>
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "status",
            label: "Lead Status",
            placeholder: "All Statuses",
            options: [
              { value: "New", label: "New" },
              { value: "Contacted", label: "Contacted" },
              { value: "Qualified", label: "Qualified" },
              { value: "Quotation", label: "Quotation" },
              { value: "Converted", label: "Converted" },
              { value: "Lost", label: "Lost" },
            ],
          },
        ]}
        filters={{
          status: filterStatus !== "all" ? filterStatus : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "status") setFilterStatus(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setFilterStatus("all");
          setPage(1);
        }}
      />

      <DataView
        data={leads}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search leads...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/crm/leads/add"),
        }}
        columns={columns}
        card={cardConfig}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
      />

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              {selectedLead?.name} - {selectedLead?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={statusForm.status} 
                onValueChange={(val) => {
                  setStatusForm(prev => ({
                    ...prev, 
                    status: val,
                    projectValue: val === "Converted" && !prev.projectValue ? String(selectedLead?.expectedValue || "") : prev.projectValue,
                    projectName: val === "Converted" && !prev.projectName ? `Project - ${selectedLead?.company || selectedLead?.name || ""}` : prev.projectName,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Quotation">Quotation</SelectItem>
                  <SelectItem value="Converted" disabled={selectedLead?.status === "Converted"}>
                    {selectedLead?.status === "Converted" ? "Converted (Already Converted)" : "Converted"}
                  </SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusForm.status === "Converted" && (
              <div className="space-y-4 p-4 border border-teal-200 bg-teal-50/50 rounded-xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-teal-900">
                    What happens upon conversion?
                  </p>
                  <p className="text-xs text-teal-700 leading-relaxed">
                    In this conversion flow, an accounting account, customer, and customer project are created. The project value should reflect the approved final agreement value (not necessarily the initial expected estimate).
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-teal-200/60">
                  <input 
                    type="checkbox"
                    id="accept" 
                    checked={statusForm.isPriceOfferAccepted}
                    onChange={(e) => setStatusForm(prev => ({...prev, isPriceOfferAccepted: e.target.checked}))}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <Label htmlFor="accept" className="text-xs font-semibold text-teal-900 cursor-pointer">
                    The price offer was accepted by the client <span className="text-rose-500">*</span>
                  </Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Project Name <span className="text-rose-500">*</span></Label>
                  <Input 
                    placeholder="Project name"
                    value={statusForm.projectName}
                    onChange={(e) => setStatusForm(prev => ({...prev, projectName: e.target.value}))}
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Approved Project Value ($) <span className="text-rose-500">*</span></Label>
                    {selectedLead?.expectedValue ? (
                      <span className="text-[11px] text-muted-foreground">Estimated: ${selectedLead.expectedValue}</span>
                    ) : null}
                  </div>
                  <Input 
                    type="number"
                    placeholder="Approved project value"
                    value={statusForm.projectValue}
                    onChange={(e) => setStatusForm(prev => ({...prev, projectValue: e.target.value}))}
                    className="h-9 text-xs bg-white"
                    min="0.01"
                    step="any"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleStatusSubmit} 
              disabled={
                statusMutation.isPending || 
                (statusForm.status === "Converted" && (!statusForm.isPriceOfferAccepted || !statusForm.projectName?.trim() || !statusForm.projectValue || selectedLead?.status === "Converted"))
              }
            >
              {statusMutation.isPending ? "Saving..." : (statusForm.status === "Converted" ? "Transform & Create Project" : "Change Status")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
