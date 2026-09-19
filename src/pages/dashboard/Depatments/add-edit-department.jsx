import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
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

  const { data: managersData } = useQuery({
    queryKey: ["getAllManagers"],
    queryFn: () => getAllManagers({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: branchData } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: departmentData, isLoading: isLoadingDepartment } = useQuery({
    queryKey: ["getDepartmentById", id],
    queryFn: () => getDepartmentById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && departmentData?.data) {
      const dept = departmentData.data;
      setValue(
        "department_Name",
        dept.department_Name || dept.department_name || "",
      );
      setValue("manager_id", dept.manager_Id || "");
      setValue("branch_id", dept.branch_Id || "");
    }
  }, [isEdit, departmentData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateDepartment({ ...data, department_Id: id })
        : createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDepartments"]);
      toast.success(
        isEdit
          ? "Department updated successfully!"
          : "Department added successfully!",
      );
      navigate("/dashboard/hr/departments");
    },
    onError: (error) => {
      console.error("Failed to save department", error);
      toast.error(
        isEdit ? "Failed to update department!" : "Failed to add department!",
      );
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
          disabled={mutation.isLoading || isLoadingDepartment}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingDepartment && isEdit ? (
          <div className="text-sm text-muted-foreground">
            Loading details...
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
                className="h-11 bg-transparent"
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
              <select
                id="manager_id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("manager_id", { required: true })}
              >
                <option value="">Select Manager Name</option>
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
                className="text-sm font-semibold text-foreground leading-none"
              >
                Branch Name
              </label>
              <select
                id="branch_id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("branch_id", { required: true })}
              >
                <option value="">Select Branch Name</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
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
