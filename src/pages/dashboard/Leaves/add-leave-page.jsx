import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { applyForLeave, getLeaveTypes, getEmployees } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddLeavePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_Id: "",
    leave_Type_Id: "",
    start_Date: "",
    end_Date: "",
    reason: ""
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ["getEmployeesList"],
    queryFn: () => getEmployees({ PageSize: 1000 }), // large page size for dropdown
  });
  
  const employeeOptions = useMemo(() => employeesResponse?.data?.items || [], [employeesResponse]);

  const { data: leaveTypesResponse } = useQuery({
    queryKey: ["getLeaveTypes"],
    queryFn: () => getLeaveTypes({ PageSize: 100 }),
  });
  
  const leaveTypes = leaveTypesResponse?.data?.items || [];

  const applyMutation = useMutation({
    mutationFn: (payload) => applyForLeave(payload),
    onSuccess: () => {
      toast.success("Leave applied successfully!");
      navigate(`/dashboard/hr/leaves`);
    },
    onError: (error) => {
      console.log("Failed to apply for leave", error);
      const errorMessage = error?.message && error.message !== "An unexpected error occurred" 
        ? error.message 
        : "Failed to apply for leave!";
      toast.error(errorMessage);
    }
  });

  const handleAdd = () => {
    applyMutation.mutate({
      employee_Id: form.employee_Id,
      leave_Type_Id: form.leave_Type_Id,
      start_Date: new Date(form.start_Date).toISOString(),
      end_Date: new Date(form.end_Date).toISOString(),
      reason: form.reason
    });
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add Leave</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Link to="/dashboard/hr/leaves" className="hover:underline">Leaves</Link>
            <span>/</span>
            <span className="font-medium text-foreground">Add Leave</span>
          </div>
        </div>
        <Button 
          onClick={handleAdd} 
          disabled={applyMutation.isPending || !form.employee_Id || !form.leave_Type_Id || !form.start_Date || !form.end_Date} 
          className="px-8"
        >
          {applyMutation.isPending ? "Adding..." : "+ Add"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Employee</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.employee_Id}
              onChange={(e) => setForm({ ...form, employee_Id: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Type</label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={form.leave_Type_Id}
              onChange={(e) => setForm({ ...form, leave_Type_Id: e.target.value })}
            >
              <option value="">Select Type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.leaveTypeName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">Start Date</label>
            <Input
              type="date"
              className="h-11 bg-transparent"
              value={form.start_Date}
              onChange={(e) => setForm({ ...form, start_Date: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">End Date</label>
            <Input
              type="date"
              className="h-11 bg-transparent"
              value={form.end_Date}
              onChange={(e) => setForm({ ...form, end_Date: e.target.value })}
            />
          </div>

          <div className="space-y-2 lg:col-span-4">
            <label className="text-sm font-semibold text-foreground leading-none">Reason</label>
            <Input
              className="h-11 bg-transparent lg:max-w-[calc(25%-1.125rem)]"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Enter reason for leave..."
            />
          </div>
        </form>
      </div>
    </div>
  );
}
