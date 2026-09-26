import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEmployees,
  addDiscount,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddDeductionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const employeeIdParam = searchParams.get("employeeId");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: employeeIdParam || "",
      date: new Date().toISOString().split('T')[0],
      amount: "",
      discountType: "Damage",
      notes: "",
    },
  });

  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["getEmployeesList"],
    queryFn: () => getEmployees({ PageSize: 1000 }),
  });

  const mutation = useMutation({
    mutationFn: (data) => addDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDiscounts"]);
      toast.success("Deduction added successfully!");
      if (employeeIdParam) {
        navigate(`/dashboard/hr/employees/${employeeIdParam}?tab=salary`);
      } else {
        navigate("/dashboard/hr/deductions");
      }
    },
    onError: (error) => {
      console.log("Failed to add discount", error);
      const errorMessage = error?.message && error.message !== "An unexpected error occurred" 
        ? error.message 
        : "Failed to add deduction!";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      employeeId: data.employeeId,
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount),
      discountType: data.discountType,
      notes: data.notes,
    };
    mutation.mutate(payload);
  };

  const employees = employeesResponse?.data?.items || [];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Add Deduction</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Deductions</span>
            <span>/</span>
            <span className="font-medium text-foreground">Add Deduction</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isPending || mutation.isLoading}
          className="px-8"
        >
          {(mutation.isPending || mutation.isLoading) ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label
              htmlFor="employeeId"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Employee
            </label>
            <Controller
              name="employeeId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                  disabled={!!employeeIdParam || isLoadingEmployees}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Select Employee"} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employeeId && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="discountType"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Discount Type
            </label>
            <Controller
              name="discountType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Discount Type" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Damage">Damage</SelectItem>
                    <SelectItem value="LoanRepayment">LoanRepayment</SelectItem>
                    <SelectItem value="Tax">Tax</SelectItem>
                    <SelectItem value="Penalty">Penalty</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.discountType && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="date"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Date
            </label>
            <Input
              id="date"
              type="date"
              className="h-9 bg-transparent"
              {...register("date", { required: true })}
            />
            {errors.date && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="h-9 bg-transparent"
              {...register("amount", { required: true, min: 0.01 })}
            />
            {errors.amount && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="notes"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Notes
            </label>
            <Input
              id="notes"
              placeholder="Notes..."
              className="h-9 bg-transparent"
              {...register("notes")}
            />
          </div>

        </form>
      </div>
    </div>
  );
}
