import { useState, useMemo } from "react";
import { 
  Building, 
  Users, 
  Phone, 
  Calendar as CalendarIcon,
  List as ListIcon,
  Mail,
  CheckSquare,
  Activity,
  Plus,
  Check,
  X,
  Trash2,
  CheckCircle2,
  ChevronsRight,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getCustomerFollowUpsTimeline, 
  createCustomerFollowUp, 
  completeOrCancelCustomerFollowUp, 
  deleteCustomerFollowUp,
  getAllCustomers 
} from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { toast } from "react-hot-toast";

export default function FollowUpsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, item: null, action: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  const queryClient = useQueryClient();

  const tabs = ["All", "Scheduled", "Completed", "Canceled"];

  // Fetch follow-ups from API
  const { data: followUpsData, isLoading, refetch } = useQuery({
    queryKey: ["follow-ups-timeline", { page, search }],
    queryFn: () => getCustomerFollowUpsTimeline({ 
      PageNumber: page, 
      PageSize: 10, 
      Search: search || undefined 
    }),
  });

  const rawItems = followUpsData?.data?.items || followUpsData?.data || [];
  const totalPages = followUpsData?.data?.totalPages || 1;
  const totalCount = followUpsData?.data?.totalCount || rawItems.length;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCustomerFollowUp(id),
    onSuccess: () => {
      toast.success("Follow-up deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["follow-ups-timeline"] });
      setDeleteDialog({ isOpen: false, id: null });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to delete follow-up");
      setDeleteDialog({ isOpen: false, id: null });
    },
  });

  // Filter items by tab on the client
  const filteredItems = useMemo(() => {
    if (!Array.isArray(rawItems)) return [];
    if (activeTab === "All") return rawItems;
    return rawItems.filter((item) => {
      const status = item.status?.toLowerCase();
      if (activeTab === "Scheduled") return status === "scheduled";
      if (activeTab === "Completed") return status === "completed";
      if (activeTab === "Canceled") return status === "canceled" || status === "cancled";
      return true;
    });
  }, [rawItems, activeTab]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = totalCount || rawItems.length;
    const scheduled = rawItems.filter(i => i.status?.toLowerCase() === "scheduled").length;
    const completed = rawItems.filter(i => i.status?.toLowerCase() === "completed").length;
    const canceled = rawItems.filter(i => i.status?.toLowerCase() === "canceled" || i.status?.toLowerCase() === "cancled").length;

    return [
      {
        title: "Total Follow-Ups",
        value: total.toString(),
        trend: "+5%",
        isUp: true,
        color: "bg-blue-600",
        icon: Activity,
      },
      {
        title: "Scheduled Follow-Ups",
        value: scheduled.toString(),
        trend: "+2%",
        isUp: true,
        color: "bg-amber-500",
        icon: Clock,
      },
      {
        title: "Completed Follow-Ups",
        value: completed.toString(),
        trend: "+8%",
        isUp: true,
        color: "bg-emerald-500",
        icon: UserCheck,
      },
      {
        title: "Canceled Follow-Ups",
        value: canceled.toString(),
        trend: "-1%",
        isUp: false,
        color: "bg-rose-500",
        icon: X,
      },
    ];
  }, [rawItems, totalCount]);

  const getIconForType = (type) => {
    switch (type?.toLowerCase()) {
      case "call": return Phone;
      case "email": return Mail;
      case "meeting": return CalendarIcon;
      case "task": return CheckSquare;
      default: return Activity;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const columns = [
    { 
      key: "type", 
      label: "Type",
      render: (row) => {
        const Icon = getIconForType(row.type);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">{row.type || "General"}</span>
          </div>
        );
      }
    },
    { 
      key: "topic", 
      label: "Topic",
      render: (row) => (
        <div>
          <span className="font-medium text-slate-900">{row.topic || "-"}</span>
          {row.executionNote && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">
              Note: {row.executionNote}
            </p>
          )}
        </div>
      )
    },
    { 
      key: "relatedTo", 
      label: "Related To",
      render: (row) => {
        const customerName = row.customerName || row.customer?.name || row.relatedTo || "Customer";
        const customerId = row.customerId || row.customer?.id;
        return customerId ? (
          <Link 
            to={`/dashboard/crm/customers/${customerId}`} 
            className="text-blue-600 font-medium hover:underline"
          >
            {customerName}
          </Link>
        ) : (
          <span className="text-slate-700 font-medium">{customerName}</span>
        );
      }
    },
    { 
      key: "scheduledDate", 
      label: "Date & Time",
      render: (row) => (
        <span className="text-slate-600 text-xs font-medium">
          {formatDate(row.scheduledDate)}
        </span>
      )
    },
    { 
      key: "status", 
      label: "Status",
      render: (row) => {
        const status = row.status || "Scheduled";
        let colorClass = "bg-blue-50 text-blue-600 border border-blue-200";
        if (status === "Completed") {
          colorClass = "bg-emerald-50 text-emerald-600 border border-emerald-200";
        } else if (status === "Canceled" || status === "Cancled") {
          colorClass = "bg-rose-50 text-rose-600 border border-rose-200";
        }
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const isScheduled = row.status === "Scheduled";
        return (
          <div className="flex items-center gap-1.5 justify-end">
            {isScheduled && (
              <>
                <button
                  type="button"
                  onClick={() => setActionDialog({ isOpen: true, item: row, action: "Completed" })}
                  className="w-8 h-8 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Mark as Completed"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActionDialog({ isOpen: true, item: row, action: "Canceled" })}
                  className="w-8 h-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Mark as Canceled"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setDeleteDialog({ isOpen: true, id: row.id })}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
              title="Delete Follow-up"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Follow-Ups</h1>
          <span 
            className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold" 
            title="CRM Follow-ups Management"
          >
            i
          </span>
        </div>

        <Button 
          onClick={() => setIsAddOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add Follow-Up
        </Button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
                <span className={`text-xs font-bold ${stat.isUp ? "text-emerald-600" : "text-rose-500"}`}>
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Unified Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        {/* Status Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-100 overflow-x-auto -mt-1 pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`pb-3 text-xs font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "text-[#0066d1] font-bold"
                    : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0066d1] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {viewMode === "list" ? (
          <div>
            <DataView
              data={filteredItems}
              getRowId={(row) => row.id}
              search={{
                placeholder: "Search by topic or customer name...",
                value: search,
                onChange: setSearch,
              }}
              filter={{
                label: "Filter",
                onClick: () => refetch(),
              }}
              export={{
                label: "Export",
                onClick: () => toast.success("Exporting follow-ups..."),
              }}
              addButton={{
                label: "Add",
                onClick: () => setIsAddOpen(true),
              }}
              columns={columns}
              pagination={{
                page: page,
                totalPages: totalPages,
                onPageChange: setPage,
                prevLabel: "Pre",
                nextLabel: "Next",
              }}
              toolbarAddon={
                <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list" ? "bg-[#0066d1] text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="List View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("calendar")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "calendar" ? "bg-[#0066d1] text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Calendar View"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <CalendarView 
            items={rawItems} 
            onViewModeChange={setViewMode}
            onOpenAdd={() => setIsAddOpen(true)}
            onAction={(item, action) => setActionDialog({ isOpen: true, item, action })}
            currentDate={currentCalendarDate}
            onDateChange={setCurrentCalendarDate}
          />
        )}
      </div>

      {/* Add Follow-Up Dialog */}
      <AddFollowUpDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Complete or Cancel Dialog */}
      <CompleteOrCancelDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, item: null, action: null })}
        item={actionDialog.item}
        action={actionDialog.action}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={() => deleteDialog.id && deleteMutation.mutate(deleteDialog.id)}
        title="Delete Follow-Up"
        description="Are you sure you want to delete this follow-up record? This action cannot be undone."
      />
    </div>
  );
}

// -------------------------------------------------------------
// Calendar View Component
// -------------------------------------------------------------
function CalendarView({ items = [], onViewModeChange, onOpenAdd, onAction, currentDate, onDateChange }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month leading days (fill 35 or 42 grid cells)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  // Group items by date string (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      if (!item.scheduledDate) return;
      const d = new Date(item.scheduledDate);
      if (isNaN(d.getTime())) return;
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(item);
    });
    return map;
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Calendar Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("calendar")}
              className="p-1.5 rounded-lg bg-[#0066d1] text-white transition-colors cursor-pointer"
              title="Calendar View"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>

          <Button 
            onClick={onOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 h-9"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 border border-slate-200/80 rounded-t-2xl bg-slate-50/80 overflow-hidden text-center">
        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
          <div key={d} className="py-2.5 text-[11px] font-bold text-slate-500 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 border-l border-t border-slate-200/80 rounded-b-2xl overflow-hidden bg-slate-100/40">
        {calendarDays.map((cell, idx) => {
          const dateKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, "0")}-${String(cell.date.getDate()).padStart(2, "0")}`;
          const dayItems = itemsByDate[dateKey] || [];
          const isToday = new Date().toDateString() === cell.date.toDateString();

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 border-r border-b border-slate-200/80 bg-white transition-colors flex flex-col justify-between ${
                !cell.isCurrentMonth ? "opacity-40 bg-slate-50/60" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? "bg-[#0066d1] text-white" : "text-slate-700"
                  }`}
                >
                  {cell.day}
                </span>
                {dayItems.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    {dayItems.length}
                  </span>
                )}
              </div>

              {/* Event Tags */}
              <div className="space-y-1 my-1 overflow-y-auto max-h-[80px]">
                {dayItems.map((event) => {
                  const isScheduled = event.status === "Scheduled";
                  const isCompleted = event.status === "Completed";
                  let bgBadge = "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
                  if (isCompleted) bgBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
                  else if (event.status === "Canceled" || event.status === "Cancled") bgBadge = "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100";

                  return (
                    <div
                      key={event.id}
                      onClick={() => isScheduled && onAction(event, "Completed")}
                      className={`text-[10px] font-semibold px-1.5 py-1 rounded-md border truncate cursor-pointer transition-all flex items-center justify-between gap-1 ${bgBadge}`}
                      title={`${event.type}: ${event.topic || "Follow-up"} (${event.status})`}
                    >
                      <span className="truncate">{event.type}: {event.topic || "Follow-up"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Add Follow-Up Dialog Component
// -------------------------------------------------------------
function AddFollowUpDialog({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customerId: "",
    type: "Call",
    status: "Scheduled",
    topic: "",
    date: "",
    time: "",
  });

  // Fetch customers for selection
  const { data: customersData } = useQuery({
    queryKey: ["customers-lookup"],
    queryFn: () => getAllCustomers({ PageSize: 100 }),
    enabled: isOpen,
  });

  const customers = customersData?.data?.items || customersData?.data || [];

  const mutation = useMutation({
    mutationFn: createCustomerFollowUp,
    onSuccess: () => {
      toast.success("Follow-up created successfully");
      queryClient.invalidateQueries({ queryKey: ["follow-ups-timeline"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to create follow-up");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.type || !formData.status || !formData.topic || !formData.date || !formData.time) {
      toast.error("Please fill all required fields");
      return;
    }

    const scheduledDate = new Date(`${formData.date}T${formData.time}`).toISOString();

    mutation.mutate({
      customerId: formData.customerId,
      type: formData.type,
      status: formData.status,
      topic: formData.topic,
      scheduledDate,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <div className="w-12 h-12 rounded-2xl border border-blue-100 bg-blue-50 text-[#0066d1] flex items-center justify-center shrink-0">
            <ChevronsRight className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">Add New Follow-Up</DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Schedule follow-up interactions like calls, meetings, or emails.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Customer <span className="text-rose-500">*</span></Label>
            <Select
              value={formData.customerId}
              onValueChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name || c.companyName || "Unnamed Customer"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Type <span className="text-rose-500">*</span></Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Status <span className="text-rose-500">*</span></Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Topic / Subject <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="e.g. Discuss Q4 renewal proposal"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              className="h-10 text-xs rounded-xl"
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Date <span className="text-rose-500">*</span></Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Time <span className="text-rose-500">*</span></Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Save Follow-Up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// -------------------------------------------------------------
// Complete or Cancel Action Dialog
// -------------------------------------------------------------
function CompleteOrCancelDialog({ isOpen, onClose, item, action }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const isCompleted = action === "Completed";

  const mutation = useMutation({
    mutationFn: completeOrCancelCustomerFollowUp,
    onSuccess: () => {
      toast.success(`Follow-up marked as ${action?.toLowerCase()} successfully`);
      queryClient.invalidateQueries({ queryKey: ["follow-ups-timeline"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.message || `Failed to update follow-up`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Please provide execution notes");
      return;
    }

    mutation.mutate({
      id: item?.id,
      status: isCompleted ? "Completed" : "Canceled",
      executionNote: note,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
              isCompleted ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {isCompleted ? "Complete Follow-Up" : "Cancel Follow-Up"}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Add completion details and execution notes for {item?.topic || "this follow-up"}.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Execution Notes <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              placeholder="Enter meeting notes, call outcome, or reason for cancellation..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[110px] text-xs rounded-xl resize-none"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              Close
            </Button>
            <Button
              type="submit"
              className={`rounded-xl text-white ${
                isCompleted ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : isCompleted ? "Complete Follow-Up" : "Cancel Follow-Up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
