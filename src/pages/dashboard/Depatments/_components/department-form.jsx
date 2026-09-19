import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createDepartment,
  updateDepartment,
  getDepartmentById,
  getBranches,
  getAllManagers,
} from "../../../../lib/api";

export function DepartmentForm({ isOpen, onClose, editId }) {
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      department_Name: "",
      manager_id: "",
      branch_Id: "",
      actionTitle: "Update",
      actionDescription: "Update department details",
    },
  });

  const { data: branchData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
    enabled: isOpen,
  });

  const { data: managersData, isLoading: isLoadingManagers } = useQuery({
    queryKey: ["getAllManagers"],
    queryFn: () => getAllManagers({ pageNumber: 1, pageSize: 100 }),
    enabled: isOpen,
  });

  const { data: departmentData, isLoading: isLoadingDepartment } = useQuery({
    queryKey: ["getDepartmentById", editId],
    queryFn: () => getDepartmentById(editId),
    enabled: !!editId && isOpen,
  });    
  console.log(departmentData);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && departmentData?.data) {
        setValue("department_Name", departmentData.data.department_Name || departmentData.data.department_name || "");
        setValue("manager_id", departmentData.data.manager_Id || "");
        setValue("branch_Id", departmentData.data.branch_Id || "");
      } else if (!isEdit) {
        reset();
      }
    }
  }, [isOpen, isEdit, departmentData, managersData, branchData, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateDepartment({ ...data, department_Id: editId })
        : createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDepartments"]);
      onClose();
      reset();
    },
    onError: (error) => {
      console.error("Failed to save department", error);
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
    console.log(payload);
    mutation.mutate(payload);
  };

  const branches = branchData?.data?.items || [];
  const managers = managersData?.data?.items || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Department" : "Add Department"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="department_Name"
              className="text-sm font-medium leading-none"
            >
              Department Name
            </label>
            <Input
              id="department_Name"
              {...register("department_Name", { required: true })}
            />
            {errors.department_Name && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="manager_id"
              className="text-sm font-medium leading-none"
            >
              Manager
            </label>
            <select
              id="manager_id"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("manager_id", { required: true })}
            >
              <option value="">Select Manager...</option>
              {managers.map((manager) => (
                <option key={manager.managerId} value={manager.managerId}>
                  {manager.managerName}
                </option>
              ))}
            </select>
            {errors.manager_id && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="branch_Id"
              className="text-sm font-medium leading-none"
            >
              Branch
            </label>
            <select
              id="branch_Id"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("branch_id", { required: true })}
            >
              <option value="">Select Branch...</option>
              {branches?.map((branch)=> (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
            {errors.branch_id && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isLoading || isLoadingDepartment}
            >
              {mutation.isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
