import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Info, UploadCloud, File as FileIcon, X } from "lucide-react";
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
import { createContract, updateContract, getContractById, getEmployees } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditContractPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const prefillEmployeeId = searchParams.get("employeeId");

  const [form, setForm] = useState({
    employeeId: prefillEmployeeId || "",
    startDate: "",
    endDate: "",
    salary: "",
    contractText: "",
    allowedAbsenceDaysPerMonth: "",
    allowedLeaveHoursPerMonth: "",
    customAnnualLeaveBalance: "",
    attachmentFile: null
  });
  const fileInputRef = useRef(null);

  const { data: employeesResponse } = useQuery({
    queryKey: ["getEmployeesList"],
    queryFn: () => getEmployees({ PageSize: 1000 }),
  });
  const employees = useMemo(() => employeesResponse?.data?.items || [], [employeesResponse]);

  const { data: contractData, isLoading: isLoadingContract } = useQuery({
    queryKey: ["getContractById", id],
    queryFn: () => getContractById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && contractData?.data) {
      const c = contractData.data;
      setForm({
        employeeId: c.employeeId || "",
        startDate: c.startDate ? c.startDate.split("T")[0] : "",
        endDate: c.endDate ? c.endDate.split("T")[0] : "",
        salary: c.salary || "",
        contractText: c.contractText || "",
        allowedAbsenceDaysPerMonth: c.allowedAbsenceDaysPerMonth || "",
        allowedLeaveHoursPerMonth: c.allowedLeaveHoursPerMonth || "",
        customAnnualLeaveBalance: c.customAnnualLeaveBalance || "",
        attachmentFile: null,
        isActive: c.status === "Active"
      });
    }
  }, [isEdit, contractData]);

  const mutation = useMutation({
    mutationFn: (payload) => isEdit ? updateContract({ ...payload, contractId: id }) : createContract(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllContracts"]);
      queryClient.invalidateQueries(["getContractsByEmployeeId"]);
      toast.success(isEdit ? "Contract updated successfully!" : "Contract added successfully!");
      navigate("/dashboard/hr/contractes");
    },
    onError: (error) => {
      console.log("Failed to save contract", error);
      const errorMessage = error?.message && error.message !== "An unexpected error occurred" 
        ? error.message 
        : (isEdit ? "Failed to update contract!" : "Failed to add contract!");
      toast.error(errorMessage);
    }
  });

  const handleSave = () => {
    const formData = new FormData();
    formData.append("EmployeeId", form.employeeId);
    if (form.startDate) formData.append("StartDate", new Date(form.startDate).toISOString());
    if (form.endDate) formData.append("EndDate", new Date(form.endDate).toISOString());
    formData.append("Salary", Number(form.salary) || 0);
    if (form.contractText) formData.append("ContractText", form.contractText);
    formData.append("AllowedAbsenceDaysPerMonth", Number(form.allowedAbsenceDaysPerMonth) || 0);
    formData.append("AllowedLeaveHoursPerMonth", Number(form.allowedLeaveHoursPerMonth) || 0);
    formData.append("CustomAnnualLeaveBalance", Number(form.customAnnualLeaveBalance) || 0);
    
    if (form.attachmentFile) {
      formData.append("AttachmentFile", form.attachmentFile);
    }

    if (isEdit) {
      formData.append("IsActive", form.isActive);
    }
    
    mutation.mutate(formData);
  };

  const pageTitle = isEdit ? "Edit Contract" : "Add Contract";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{pageTitle}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Link to="/dashboard/hr/contractes" className="hover:underline">Contracts</Link>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={mutation.isPending || isLoadingContract} 
          className="px-8"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingContract && isEdit ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-foreground leading-none">Employee Name</label>
                <Select
<<<<<<< Updated upstream
                  value={form.employeeId ? String(form.employeeId) : undefined}
                  onValueChange={(val) => setForm({ ...form, employeeId: val })}
                  disabled={!!prefillEmployeeId}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent disabled:bg-slate-100">
=======
                  value={form.employeeId ? String(form.employeeId) : ""}
                  onValueChange={(val) => setForm({ ...form, employeeId: val })}
                  disabled={!!prefillEmployeeId}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
>>>>>>> Stashed changes
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground leading-none">Allowed Absence Days Per Month</label>
                <Input
                  type="number"
                  className="h-9 bg-transparent"
                  value={form.allowedAbsenceDaysPerMonth}
                  onChange={(e) => setForm({ ...form, allowedAbsenceDaysPerMonth: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground leading-none">Allowed Leave Hours Per Month</label>
                <Input
                  type="number"
                  className="h-9 bg-transparent"
                  value={form.allowedLeaveHoursPerMonth}
                  onChange={(e) => setForm({ ...form, allowedLeaveHoursPerMonth: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground leading-none">Salary</label>
                <Input
                  type="number"
                  className="h-9 bg-transparent"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground leading-none">Custom Annual Leave Balance</label>
                <Input
                  type="number"
                  className="h-9 bg-transparent"
                  value={form.customAnnualLeaveBalance}
                  onChange={(e) => setForm({ ...form, customAnnualLeaveBalance: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground leading-none">Start Date</label>
                <Input
                  type="date"
                  className="h-9 bg-transparent"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground leading-none">End Date</label>
                <Input
                  type="date"
                  className="h-9 bg-transparent"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* File Upload Zone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center mt-6 transition-colors cursor-pointer ${form.attachmentFile ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setForm({ ...form, attachmentFile: e.target.files[0] });
                  }
                }}
              />
              
              {form.attachmentFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1 truncate max-w-xs">{form.attachmentFile.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{(form.attachmentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setForm({ ...form, attachmentFile: null }); }}>
                    <X className="w-4 h-4 mr-2" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-4">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Choose a file or drag & drop it here</h3>
                  <p className="text-xs text-muted-foreground mb-4">JPEG, PNG, PDF, and DOC formats</p>
                  <Button variant="outline" className="px-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}>Browse File</Button>
                </>
              )}
            </div>

            <div className="space-y-2 mt-6">
              <label className="text-sm font-semibold text-foreground leading-none">Notes</label>
              <textarea
                className="flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] bg-transparent resize-none"
                placeholder="Notes"
                value={form.contractText}
                onChange={(e) => setForm({ ...form, contractText: e.target.value })}
              />
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
