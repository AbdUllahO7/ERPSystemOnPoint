import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderKanban, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCustomers,
  getCustomerContracts,
  createCustomerProject,
  updateCustomerProject,
  getCustomerProjectById,
} from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AddEditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    customerId: "",
    contractId: "",
    projectName: "",
    status: "InProgress",
    completionPercentage: "0",
    value: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    description: "",
  });

  // Load Customers
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["allCustomersList"],
    queryFn: () => getAllCustomers({ PageNumber: 1, PageSize: 1000 }),
  });

  const customers = customersData?.data?.items || customersData?.data || [];

  // Load Contracts for selected Customer
  const { data: contractsData, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["customerContractsForProject", formData.customerId],
    queryFn: () => getCustomerContracts({ CustomerId: formData.customerId, PageSize: 50 }),
    enabled: !!formData.customerId,
  });

  const contracts = contractsData?.data?.items || contractsData?.data || [];

  // Load existing project if edit
  const { data: existingProjectData, isLoading: isLoadingProject } = useQuery({
    queryKey: ["projectDetails", id],
    queryFn: () => getCustomerProjectById(id),
    enabled: isEdit,
  });

  const isPageLoading = (isEdit && isLoadingProject) || isLoadingCustomers;

  useEffect(() => {
    if (existingProjectData) {
      const p = existingProjectData?.data?.data || existingProjectData?.data || existingProjectData;
      if (!p) return;
      setFormData({
        customerId: p.customerId || "",
        customerName: p.customerName || "",
        contractId: p.contractId || "",
        projectName: p.projectName || "",
        status: p.status || "InProgress",
        completionPercentage: (p.completionPercentage ?? 0).toString(),
        value: (p.projectValue ?? p.value ?? "").toString(),
        startDate: p.startDate ? p.startDate.split("T")[0] : "",
        endDate: p.endDate ? p.endDate.split("T")[0] : "",
        description: p.description || "",
      });
    }
  }, [existingProjectData]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateCustomerProject(id, data) : createCustomerProject(data),
    onSuccess: () => {
      toast.success(isEdit ? "Project updated successfully" : "Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["allCustomerProjects"] });
      queryClient.invalidateQueries({ queryKey: ["projectDetails", id] });
      navigate("/dashboard/crm/projects");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        (isEdit ? "Failed to update project" : "Failed to create project")
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    const payload = {
      customerId: formData.customerId,
      contractId: formData.contractId || null,
      projectName: formData.projectName,
      description: formData.description,
      completionPercentage: Number(formData.completionPercentage) || 0,
      value: Number(formData.value) || 0,
      projectValue: Number(formData.value) || 0,
      status: formData.status,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : new Date().toISOString(),
    };

    saveMutation.mutate(payload);
  };

  if (isEdit && isLoadingProject) {
    return <div className="p-8 text-center text-muted-foreground">Loading project details...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate("/dashboard/crm/projects")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? "Edit Customer Project" : "Create Customer Project"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-10">
            {isEdit
              ? "Update project parameters, status, and milestone delivery"
              : "Define project scope, client assignment, value, and timelines"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/crm/projects")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 font-medium"
            disabled={saveMutation.isPending || isPageLoading || !formData.projectName?.trim() || !formData.customerId}
            title={!formData.projectName?.trim() || !formData.customerId ? "Please enter project name and select customer" : ""}
          >
            {saveMutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </div>

    

      {/* Form Card */}
      <div className="bg-card text-card-foreground rounded-2xl border shadow-sm p-6 space-y-6 min-h-[300px]">
        {isPageLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {isEdit ? "Loading project details & customers..." : "Loading customers data..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              name="projectName"
              placeholder="e.g. Office Hall Setup Project"
              value={formData.projectName}
              onChange={handleChange}
              required
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Select
                key={formData.customerId || "customer-select"}
                value={formData.customerId}
                onValueChange={(val) => {
                  setFormData((prev) => ({ ...prev, customerId: val, contractId: "" }));
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {formData.customerId && !customers.some((c) => String(c.id) === String(formData.customerId)) && (
                    <SelectItem value={String(formData.customerId)}>
                      {formData.customerName || `Customer #${String(formData.customerId).substring(0, 8)}`}
                    </SelectItem>
                  )}
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name || c.customerName || c.customer_Name || `Customer #${c.id.substring(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Linked Contract (Optional)</Label>
              <Select
                key={formData.contractId || "contract-select"}
                value={formData.contractId || "none"}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, contractId: val === "none" ? "" : val }))
                }
                disabled={!formData.customerId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={
                      !formData.customerId
                        ? "Select a customer first"
                        : contracts.length === 0
                        ? "No active contracts found"
                        : "Link to Customer Contract (Optional)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contract link</SelectItem>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title || c.contractNumber || `Contract #${c.id.substring(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Status</Label>
              <Select
                key={formData.status || "status-select"}
                value={formData.status}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Contractual Value ($)</Label>
              <Input
                type="number"
                name="value"
                placeholder="e.g. 5000"
                value={formData.value}
                onChange={handleChange}
                min="0"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Progress (%)</Label>
                <span className="text-xs text-blue-600 font-bold">{formData.completionPercentage}%</span>
              </div>
              <Input
                type="number"
                name="completionPercentage"
                placeholder="0"
                value={formData.completionPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="h-11"
              />
              <span className="text-[10px] text-muted-foreground block">
                Based on task delivery milestones, not invoicing.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Start Date</Label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">End Date</Label>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Project Scope & Notes</Label>
            <Textarea
              name="description"
              placeholder="Detailed description of the project deliverables, milestones, and client agreements..."
              value={formData.description}
              onChange={handleChange}
              className="min-h-[120px] resize-none"
            />
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
