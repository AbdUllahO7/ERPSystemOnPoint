import { useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getCustomerProjects,
  deleteCustomerProject,
  createCustomerProject,
  updateProjectPercentage,
  getCustomerById,
  getCustomerContracts,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { FileText, Trash2, X, Edit, FolderKanban, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

export function ProjectsTab({ customerId: propCustomerId }) {
  const params = useParams();
  const customerId = propCustomerId || params.id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [deleteProjectId, setDeleteProjectId] = useState(null);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["customer-projects", customerId, page],
    queryFn: () =>
      getCustomerProjects({
        CustomerId: customerId,
        PageNumber: page,
        PageSize: pageSize,
      }),
    enabled: !!customerId,
  });

  const items = projectsData?.data?.items || [];
  const totalPages = projectsData?.data?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCustomerProject(id),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-projects", customerId] });
      setDeleteProjectId(null);
    },
    onError: () => {
      toast.error("Failed to delete project");
      setDeleteProjectId(null);
    },
  });

  let filteredProjects = items;
  if (search) {
    filteredProjects = filteredProjects.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        p.id?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const columns = [
    {
      key: "projectName",
      label: "Project",
      render: (row) => (
        <div>
          <span className="font-semibold text-foreground block">{row.projectName}</span>
          <span className="text-[11px] text-muted-foreground">ID: #{row.id?.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      key: "contractId",
      label: "Linked Contract",
      render: (row) =>
        row.contractId ? (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              #{row.contractId.substring(0, 8)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">No contract linked</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const colorClasses = {
          Planning: "bg-blue-100 text-blue-700 border-blue-200",
          InProgress: "bg-amber-100 text-amber-700 border-amber-200",
          "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
          Pending: "bg-purple-100 text-purple-700 border-purple-200",
          Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
          Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
          Canceled: "bg-rose-100 text-rose-700 border-rose-200",
        };
        const colorClass = colorClasses[row.status] || "bg-gray-100 text-gray-700 border-gray-200";
        return (
          <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold ${colorClass}`}>
            {row.status || "Planning"}
          </span>
        );
      },
    },
    {
      key: "completionPercentage",
      label: "Operational Progress (نسبة الإنجاز)",
      render: (row) => {
        const perc = Number(row.completionPercentage || 0);
        return (
          <div className="min-w-[140px]">
            <div className="flex items-center justify-between text-xs font-medium mb-1">
              <span className="text-foreground">{perc}%</span>
              <span className="text-[10px] text-muted-foreground">Execution progress</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  perc >= 100
                    ? "bg-emerald-500"
                    : perc >= 50
                    ? "bg-blue-600"
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, perc)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "projectValue",
      label: "Contractual Value",
      render: (row) => (
        <span className="font-bold text-blue-600">
          ${Number(row.projectValue || row.value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "dates",
      label: "Period",
      render: (row) => {
        const start = row.startDate ? new Date(row.startDate).toLocaleDateString() : "-";
        const end = row.endDate ? new Date(row.endDate).toLocaleDateString() : "-";
        return (
          <div className="text-xs text-muted-foreground">
            <span>{start}</span>
            <span className="mx-1">→</span>
            <span>{end}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setProjectToEdit(row)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8"
            title="Edit Progress / Status"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteProjectId(row.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Guidance Callout from Spec */}
      <div className="p-3.5 bg-blue-50/80 border-r-4 border-blue-600 rounded-lg text-xs space-y-1">
        <p className="font-bold text-blue-950 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          الفوترة ليست إنجازاً تشغيلياً (Operational Progress vs Billing):
        </p>
        <p className="text-blue-900 leading-relaxed">
          إصدار فاتورة بقيمة 50% من المشروع لا يثبت إنجاز 50% من العمل. يتم ربط نسبة الإنجاز (CompletionPercentage) بتقدم المهام أو مراحل التنفيذ المعتمدة في الميدان، مع إظهار الفوترة كمؤشر مستقل.
        </p>
      </div>

      <DataView
        data={filteredProjects}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search projects by name or ID...",
          value: search,
          onChange: setSearch,
        }}
        addButton={{
          label: "Add Project",
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
      />

      <AddProjectDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        customerId={customerId}
      />

      {projectToEdit && (
        <EditProjectDialog
          open={!!projectToEdit}
          onOpenChange={(val) => {
            if (!val) setProjectToEdit(null);
          }}
          customerId={customerId}
          project={projectToEdit}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={() => deleteMutation.mutate(deleteProjectId)}
        title="Delete Project"
        description="Are you sure you want to delete this customer project? This action cannot be undone."
      />
    </div>
  );
}

function AddProjectDialog({ open, onOpenChange, customerId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    projectName: "",
    contractId: "",
    status: "InProgress",
    completionPercentage: "0",
    value: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    description: "",
  });

  const { data: customerData } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId && open,
  });

  const { data: contractsData } = useQuery({
    queryKey: ["customerContractsList", customerId],
    queryFn: () => getCustomerContracts({ CustomerId: customerId, PageSize: 50 }),
    enabled: !!customerId && open,
  });

  const customerName = customerData?.data?.customerName || "Customer";
  const contracts = contractsData?.data?.items || [];

  const createMutation = useMutation({
    mutationFn: createCustomerProject,
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({
        queryKey: ["customer-projects", customerId],
      });
      onOpenChange(false);
      setFormData({
        projectName: "",
        contractId: "",
        status: "InProgress",
        completionPercentage: "0",
        value: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        description: "",
      });
    },
    onError: () => toast.error("Failed to create project"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const dataToSubmit = {
      customerId: customerId,
      contractId: formData.contractId || null,
      projectName: formData.projectName,
      description: formData.description,
      completionPercentage: Number(formData.completionPercentage) || 0,
      value: Number(formData.value) || 0,
      status: formData.status,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : new Date().toISOString(),
    };

    createMutation.mutate(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background rounded-2xl border-0 shadow-lg"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-blue-50 text-blue-600">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Add Customer Project</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Define project scope, contract, and operational goals</p>
            </div>
          </div>
          <DialogClose className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted border border-border cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>

        <form
          id="add-project-form"
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0"
        >
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Project Name <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g. تجهيز قاعة لشركة"
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              required
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Customer</Label>
              <Input
                value={customerName}
                disabled
                className="h-10 bg-slate-50 text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Linked Contract (Optional)</Label>
              <Select
                value={formData.contractId || "none"}
                onValueChange={(val) =>
                  setFormData({ ...formData, contractId: val === "none" ? "" : val })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contract link (بدون ربط بعقد)</SelectItem>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title || c.contractNumber || `Contract #${c.id.substring(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
                required
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning (تخطيط)</SelectItem>
                  <SelectItem value="InProgress">In Progress (قيد التنفيذ)</SelectItem>
                  <SelectItem value="Pending">Pending (معلق)</SelectItem>
                  <SelectItem value="Completed">Completed (مكتمل)</SelectItem>
                  <SelectItem value="Cancelled">Cancelled (ملغي)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-sm">Contractual Value ($)</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="h-10"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">
                Operational Progress (%)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.completionPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionPercentage: e.target.value,
                  })
                }
                className="h-10"
                min="0"
                max="100"
              />
              <span className="text-[10px] text-muted-foreground block">مرتبط بتقدم المهام ومراحل التنفيذ</span>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-sm">Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">End Date</Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">Description & Notes</Label>
            <Textarea
              placeholder="Scope of work, milestone details, or notes..."
              className="min-h-[90px] resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border bg-background shrink-0 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-project-form"
            className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-medium"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding..." : "Add Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditProjectDialog({ open, onOpenChange, customerId, project }) {
  const queryClient = useQueryClient();
  const [percentage, setPercentage] = useState(
    project.completionPercentage?.toString() || "0"
  );
  const [status, setStatus] = useState(project.status || "InProgress");

  const updateMutation = useMutation({
    mutationFn: (data) => updateProjectPercentage(data),
    onSuccess: () => {
      toast.success("Project progress updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["customer-projects", customerId],
      });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update project progress"),
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: project.id,
      newPercentage: Number(percentage) || 0,
      status: status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Update Project Progress & Status
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          <div className="p-3 bg-slate-50 border rounded-lg text-sm">
            <span className="text-muted-foreground block text-xs">Project</span>
            <span className="font-semibold text-foreground">{project.projectName}</span>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning (تخطيط)</SelectItem>
                <SelectItem value="InProgress">In Progress (قيد التنفيذ)</SelectItem>
                <SelectItem value="Pending">Pending (معلق)</SelectItem>
                <SelectItem value="Completed">Completed (مكتمل)</SelectItem>
                <SelectItem value="Cancelled">Cancelled (ملغي)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Operational Progress (%)</Label>
              <span className="text-xs text-blue-600 font-bold">{percentage}%</span>
            </div>
            <Input
              type="number"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="h-10"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              نسبة تقدم المهام والمراحل التنفيذية (مستقلة عن نسبة الفوترة).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
