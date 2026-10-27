import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  createDepartment,
  updateDepartment,
  getDepartmentById,
  getAllManagers,
  getBranches,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditDepartment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      department_Name: "",
      manager_id: "",
      branch_id: "",
      actionTitle: "Update",
      actionDescription: "Update department details",
    },
  });

  const { data: managersData, isLoading: isLoadingManagers } = useQuery({
    queryKey: ["getAllManagers"],
    queryFn: () => getAllManagers({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: branchData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: departmentData, isLoading: isLoadingDepartment } = useQuery({
    queryKey: ["getDepartmentById", id],
    queryFn: () => getDepartmentById(id),
    enabled: isEdit,
  });

  const isLoadingLookups = isLoadingManagers || isLoadingBranches;
  const isPageLoading = (isEdit && isLoadingDepartment) || isLoadingLookups;

  useEffect(() => {
    if (isEdit && departmentData?.data) {
      const dept = departmentData.data;

      setValue(
        "department_Name",
        dept.department_Name || dept.department_name || "",
      );
      const managerId = dept.manager_Id ?? dept.managerId ?? dept.manager_id ?? "";
      setValue("manager_id", managerId ? String(managerId) : "");

      const branchId = dept.branch_Id ?? dept.branchId ?? dept.branch_id ?? "";
      setValue("branch_id", branchId ? String(branchId) : "");
    }
  }, [isEdit, departmentData, managersData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateDepartment({ ...data, department_Id: id })
        : createDepartment(data),
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || (isEdit ? "Failed to update department!" : "Failed to add department!"));
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["getDepartments"] });
      toast.success(
        res?.message ||
        (isEdit
          ? "Department updated successfully!"
          : "Department added successfully!")
      );
      navigate("/dashboard/hr/departments");
    },
    onError: (error) => {
      console.error("Failed to save department", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isEdit ? "Failed to update department!" : "Failed to add department!");
      toast.error(errMsg);
    },
  });

  const onSubmit = (data) => {
    const payload = {
      department_Name: data.department_Name,
      manager_id: data.manager_id,
      branch_id: data.branch_id,
      ...(isEdit && {
        actionTitle: data.actionTitle,
        actionDescription: data.actionDescription,
      }),
    };
    mutation.mutate(payload);
  };

  const managers = managersData?.data?.items || [];
  const branches = branchData?.data?.items || [];
  const pageTitle = isEdit ? "Edit Department" : "Add Department";

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
            <span>Departments</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isLoading || isPageLoading}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm min-h-[300px]">
        {isPageLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {isEdit ? "Loading department details & data..." : "Loading form data..."}
            </p>
          </div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="department_Name"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Department Name
              </label>
              <Input
                id="department_Name"
                placeholder="Department Name"
                className="h-9 bg-transparent"
                {...register("department_Name", { required: true })}
              />
              {errors.department_Name && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="manager_id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Manager Name
              </label>
              <Controller
                name="manager_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  const currentValue = field.value ? String(field.value) : "";
                  const dept = departmentData?.data;
                  const currentManagerName = dept?.manager_Name || dept?.managerName;
                  const hasCurrentInList = managers.some(
                    (m) => String(m.managerId || m.id) === currentValue
                  );

                  return (
                    <Select
                      key={currentValue}
                      value={currentValue || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-11 bg-transparent">
                        <SelectValue placeholder="Select Manager Name" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {/* If current manager is not in the paginated managers list, render it as fallback */}
                        {currentValue && !hasCurrentInList && currentManagerName && (
                          <SelectItem value={currentValue}>
                            {currentManagerName}
                          </SelectItem>
                        )}
                        {managers.map((manager) => {
                          const val = String(manager.managerId || manager.id);
                          const name = manager.managerName || manager.name || manager.employee_Name;
                          return (
                            <SelectItem key={val} value={val}>
                              {name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.manager_id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="branch_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Branch Name
              </label>
              <Controller
                name="branch_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-transparent">
                      <SelectValue placeholder="Select Branch Name" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={String(branch.id)}>
                          {branch.branchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branch_id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
