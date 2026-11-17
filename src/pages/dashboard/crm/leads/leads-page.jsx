import { StatTitle } from "@/components/common/stat-title";
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
import { useI18n } from "@/context/translate-api";

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
  const { t } = useI18n();

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
  const tabLabels = {
    All: t("leads.all"),
    New: t("leads.statuses.new"),
    Contacted: t("leads.statuses.contacted"),
    Qualified: t("leads.statuses.qualified"),
    Quotation: t("leads.statuses.quotation"),
    Converted: t("leads.statuses.converted"),
    Lost: t("leads.statuses.lost"),
  };

  const statusLabels = {
    New: t("leads.statuses.new"),
    Contacted: t("leads.statuses.contacted"),
    Qualified: t("leads.statuses.qualified"),
    Quotation: t("leads.statuses.quotation"),
    Converted: t("leads.statuses.converted"),
    Lost: t("leads.statuses.lost"),
  };

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
      toast.success(t("leads.statusChangeSuccess"));
      queryClient.invalidateQueries(["leads"]);
      setIsStatusDialogOpen(false);
    },
    onError: () => {
      toast.error(t("leads.statusChangeError"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLead(id),
    onSuccess: () => {
      toast.success(t("leads.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setDeleteRowId(null);
    },
    onError: (error) => {
      toast.error(error?.message || t("leads.deleteError"));
      setDeleteRowId(null);
    },
  });

  const handleStatusSubmit = () => {
    if (statusForm.status === "Converted") {
      if (selectedLead?.status === "Converted") {
        toast.error(t("leads.alreadyConvertedError"));
        return;
      }
      if (!statusForm.isPriceOfferAccepted) {
        toast.error(t("leads.confirmOfferError"));
        return;
      }
      if (!statusForm.projectName?.trim()) {
        toast.error(t("leads.projectNameRequired"));
        return;
      }
      if (!statusForm.projectValue || Number(statusForm.projectValue) <= 0) {
        toast.error(t("leads.projectValueRequired"));
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
    { key: "id", label: t("leads.id"), render: (row) => <span className="text-blue-500 font-medium">#{row.id.substring(0, 8)}</span> },
    { key: "name", label: t("leads.name") },
    { key: "company", label: t("leads.company") },
    { key: "phoneNumber", label: t("leads.phone") },
    { key: "expectedValue", label: t("leads.value"), render: (row) => <span className="text-blue-500">${row.expectedValue}</span> },
    { key: "responsible", label: t("leads.responsible"), render: (row) => row.responsible || t("leads.none") },
    { 
      key: "status", 
      label: t("leads.status"),
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
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{statusLabels[row.status] || row.status}</span>;
      }
    },
    { key: "createdAt", label: t("leads.createdAt"), render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  const cardConfig = {
    icon: UsersIcon,
    title: (row) => row.name,
    subtitle: (row) => row.company || t("leads.noCompany"),
    fields: [
      { key: "phoneNumber", label: t("leads.phone"), value: (row) => row.phone || row.phoneNumber || "-" },
      { key: "expectedValue", label: t("leads.value"), value: (row) => <span className="text-blue-500 font-medium">${row.expectedValue || 0}</span> },
      { key: "responsible", label: t("leads.responsible"), value: (row) => row.responsible || t("leads.none") },
      { 
        key: "status", 
        label: t("leads.status"),
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
          return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{statusLabels[row.status] || row.status}</span>;
        }
      },
    ]
  };

  const rowActionsMenu = [
    {
      items: [
        {
          key: "view",
          label: t("leads.view"),
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/crm/leads/${row.id}`),
        },
        {
          key: "changeStatus",
          label: t("leads.changeStatus"),
          icon: RefreshCcw,
          onClick: (row) => {
            setSelectedLead(row);
            setStatusForm({ status: row.status, isPriceOfferAccepted: false, projectName: "", projectValue: "" });
            setIsStatusDialogOpen(true);
          }
        },
        {
          key: "edit",
          label: t("leads.edit"),
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/crm/leads/edit/${row.id}`),
        },
      ]
    },
    {
      items: [
        {
          key: "delete",
          label: t("leads.delete"),
          icon: Trash2,
          destructive: true,
          onClick: (row) => setDeleteRowId(row.id),
        },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm font-semibold">
        <span>{t("leads.title")}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground"><StatTitle>{stat.title}</StatTitle></p>
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
            {tabLabels[tab] || tab}
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
            label: t("leads.leadStatus"),
            placeholder: t("leads.allStatuses"),
            options: [
              { value: "New", label: t("leads.statuses.new") },
              { value: "Contacted", label: t("leads.statuses.contacted") },
              { value: "Qualified", label: t("leads.statuses.qualified") },
              { value: "Quotation", label: t("leads.statuses.quotation") },
              { value: "Converted", label: t("leads.statuses.converted") },
              { value: "Lost", label: t("leads.statuses.lost") },
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
        searchPlaceholder={t("leads.searchPlaceholder")}
        emptyMessage={t("leads.empty")}
        search={{
          placeholder: t("leads.searchPlaceholder"),
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: t("common.filter"),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        addButton={{
          label: t("common.add"),
          onClick: () => navigate("/dashboard/crm/leads/add"),
        }}
        columns={columns}
        card={cardConfig}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: t("common.prev"),
          nextLabel: t("common.next"),
        }}
      />

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("leads.changeStatus")}</DialogTitle>
            <DialogDescription>
              {selectedLead?.name} - {selectedLead?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("leads.status")}</Label>
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
                  <SelectValue placeholder={t("leads.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">{t("leads.statuses.new")}</SelectItem>
                  <SelectItem value="Contacted">{t("leads.statuses.contacted")}</SelectItem>
                  <SelectItem value="Qualified">{t("leads.statuses.qualified")}</SelectItem>
                  <SelectItem value="Quotation">{t("leads.statuses.quotation")}</SelectItem>
                  <SelectItem value="Converted" disabled={selectedLead?.status === "Converted"}>
                    {selectedLead?.status === "Converted" ? t("leads.alreadyConverted") : t("leads.convertToCustomer")}
                  </SelectItem>
                  <SelectItem value="Lost">{t("leads.statuses.lost")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusForm.status === "Converted" && (
              <div className="space-y-4 p-4 border border-teal-200 bg-teal-50/50 rounded-xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-teal-900">
                    {t("leads.whatHappensOnConversion")}
                  </p>
                  <p className="text-xs text-teal-700 leading-relaxed">
                    {t("leads.conversionExplanation")}
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
                    {t("leads.priceOfferAcceptedByClient")} <span className="text-rose-500">*</span>
                  </Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">{t("leads.projectName")} <span className="text-rose-500">*</span></Label>
                  <Input 
                    placeholder={t("leads.projectName")}
                    value={statusForm.projectName}
                    onChange={(e) => setStatusForm(prev => ({...prev, projectName: e.target.value}))}
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">{t("leads.approvedProjectValue")} <span className="text-rose-500">*</span></Label>
                    {selectedLead?.expectedValue ? (
                      <span className="text-[11px] text-muted-foreground">{t("leads.estimated")} ${selectedLead.expectedValue}</span>
                    ) : null}
                  </div>
                  <Input 
                    type="number"
                    placeholder={t("leads.approvedProjectValuePlaceholder")}
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
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={handleStatusSubmit} 
              disabled={
                statusMutation.isPending || 
                (statusForm.status === "Converted" && (!statusForm.isPriceOfferAccepted || !statusForm.projectName?.trim() || !statusForm.projectValue || selectedLead?.status === "Converted"))
              }
            >
              {statusMutation.isPending ? t("common.saving") : (statusForm.status === "Converted" ? t("leads.transformAndCreateProject") : t("leads.changeStatus"))}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        title={t("leads.deleteTitle")}
        description={t("leads.deleteDesc")}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
