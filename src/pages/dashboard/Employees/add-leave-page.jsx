import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { applyForLeave, getLeaveTypes } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddLeavePage() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leave_Type_Id: "",
    start_Date: "",
    end_Date: "",
    reason: "",
  });

  const { data: leaveTypesResponse } = useQuery({
    queryKey: ["getLeaveTypes"],
    queryFn: () => getLeaveTypes({ PageSize: 100 }),
  });

  const leaveTypes = leaveTypesResponse?.data?.items || [];

  const applyMutation = useMutation({
    mutationFn: (payload) => applyForLeave(payload),
    onSuccess: () => {
      toast.success("Leave applied successfully!");
      navigate(`/dashboard/hr/employees/${employeeId}?tab=leaves`);
    },
    onError: (error) => {
      console.error("Failed to apply for leave", error);
      toast.error("Failed to apply for leave!");
    },
  });

  const handleAdd = () => {
    applyMutation.mutate({
      employee_Id: employeeId,
      leave_Type_Id: form.leave_Type_Id,
      start_Date: new Date(form.start_Date).toISOString(),
      end_Date: new Date(form.end_Date).toISOString(),
      reason: form.reason,
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
            <Link to="/dashboard/hr/employees" className="hover:underline">
              Employees
            </Link>
            <span>/</span>
            <Link
              to={`/dashboard/hr/employees/${employeeId}?tab=leaves`}
              className="hover:underline"
            >
              Employee Details
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">Add Leave</span>
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={
            applyMutation.isPending ||
            !form.leave_Type_Id ||
            !form.start_Date ||
            !form.end_Date
          }
          className="px-8"
        >
          {applyMutation.isPending ? "Adding..." : "+ Add"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">
              Type
            </label>
            <Select
              value={
                form.leave_Type_Id ? String(form.leave_Type_Id) : undefined
              }
              onValueChange={(val) => setForm({ ...form, leave_Type_Id: val })}
            >
              <SelectTrigger className="h-10 py-5 w-full bg-transparent">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent position="popper">
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.leaveTypeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">
              Start Date
            </label>
            <Input
              type="date"
              className="h-11 w-full bg-transparent"
              value={form.start_Date}
              onChange={(e) => setForm({ ...form, start_Date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground leading-none">
              End Date
            </label>
            <Input
              type="date"
              className="h-11 w-full bg-transparent"
              value={form.end_Date}
              onChange={(e) => setForm({ ...form, end_Date: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-semibold text-foreground leading-none">
              Reason
            </label>
            <Input
              className="h-11 w-full bg-transparent md:max-w-[calc(33.333%-1rem)]"
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
