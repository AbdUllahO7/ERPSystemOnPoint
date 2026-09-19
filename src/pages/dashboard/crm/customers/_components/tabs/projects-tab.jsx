import { useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getCustomerProjects,
  deleteCustomerProject,
  createCustomerProject,
  updateCustomerProject,
  getCustomerById,
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
import { FileText, Trash2, X, Edit } from "lucide-react";

export function ProjectsTab() {
  const { id } = useParams(); // customerId
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["customer-projects", id, page],
    queryFn: () =>
      getCustomerProjects({
        CustomerId: id,
        PageNumber: page,
        PageSize: pageSize,
      }),
    enabled: !!id,
  });

  const items = projectsData?.data?.items || [];
  const totalPages = projectsData?.data?.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerProject,
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-projects", id] });
    },
    onError: () => toast.error("Failed to delete project"),
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="text-blue-500 font-medium">
          {row.id.substring(0, 8)}
        </span>
      ),
    },
    { key: "projectName", label: "Project Name" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
          {row.status}
        </span>
      ),
    },
    {
      key: "completionPercentage",
      label: "Progress",
      render: (row) => (
        <span className="text-blue-500">{row.completionPercentage}%</span>
      ),
    },
    {
      key: "projectValue",
      label: "Value",
      render: (row) => (
        <span className="text-blue-500">${row.projectValue}</span>
      ),
    },
    {
      key: "endDate",
      label: "Ended At",
      render: (row) => (
        <span>
          {row.endDate ? new Date(row.endDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" onClick={() => setProjectToEdit(row)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
            <Edit className="w-4 h-4" />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(row.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DataView
        data={items}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or project name...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => console.log("Filter clicked"),
        }}
        export={{
          label: "Export",
          onClick: () => console.log("Export clicked"),
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
      />

      <AddProjectDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        customerId={id}
      />

      {/* {projectToEdit && (
        <EditProjectDialog
          open={!!projectToEdit}
          onOpenChange={(val) => { if (!val) setProjectToEdit(null); }}
          customerId={id}
          project={projectToEdit}
        />
      )} */}
    </div>
  );
}

function AddProjectDialog({ open, onOpenChange, customerId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    projectName: "",
    status: "",
    completionPercentage: "",
    value: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const { data: customerData } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId && open,
  });

  const customerName = customerData?.data?.customerName || "Customer";

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
        status: "",
        completionPercentage: "",
        value: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    },
    onError: () => toast.error("Failed to create project"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      customerId: customerId,
      // contractId: customerId,
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
    console.log("Project Data:", dataToSubmit);
    onOpenChange(false);
    setFormData({
      projectName: "",
      status: "",
      completionPercentage: "",
      value: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background rounded-2xl border-0"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold">Add Project</DialogTitle>
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
            <Label className="font-semibold text-sm">Project Name</Label>
            <Input
              placeholder="Project name"
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Customer</Label>
              <Select disabled value={customerId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={customerName} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={customerId}>{customerName}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
                required
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">
                Completion percentage (%)
              </Label>
              <Input
                type="number"
                placeholder="%"
                value={formData.completionPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    completionPercentage: e.target.value,
                  })
                }
                className="h-11"
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Value</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                className="h-11"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                className="h-11"
              />
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
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">Notes</Label>
            <Textarea
              placeholder="Notes"
              className="min-h-[120px] resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </form>
        <div className="px-6 py-4 border-t border-border bg-background shrink-0">
          <Button
            type="submit"
            form="add-project-form"
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium"
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
