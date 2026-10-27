import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Loader2 } from "lucide-react";
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
  createSection,
  updateSection,
  getSectionById,
  getDepartments,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditSection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const departmentIdFromState = location.state?.departmentId;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      section_Name: "",
      department_Id: departmentIdFromState ? String(departmentIdFromState) : "",
    },
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => getDepartments({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: sectionData, isLoading: isLoadingSection } = useQuery({
    queryKey: ["getSectionById", id],
    queryFn: () => getSectionById(id),
    enabled: isEdit,
  });

  const isPageLoading = (isEdit && isLoadingSection) || isLoadingDepartments;

  useEffect(() => {
    if (isEdit && sectionData?.data) {
      const section = sectionData.data;
      setValue("section_Name", section.section_name || section.section_Name || "");
      setValue("department_Id", String(section.department_Id || section.department_id || ""));
    }
  }, [isEdit, sectionData, departmentsData, setValue]);

  useEffect(() => {
    if (!isEdit && departmentIdFromState && departmentsData) {
      setValue("department_Id", String(departmentIdFromState));
    }
  }, [isEdit, departmentIdFromState, setValue, departmentsData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateSection({
            section_id: id,
            section_name: data.section_Name,
            department_Id: data.department_Id,
          })
        : createSection(data),
    onSuccess: (res, variables) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || (isEdit ? "Failed to update section!" : "Failed to add section!"));
        return;
      }
      queryClient.invalidateQueries(["getSections"]);
      queryClient.invalidateQueries(["getDepartmentSections"]);
      toast.success(
        res?.message || (isEdit ? "Section updated successfully!" : "Section added successfully!")
      );
      if (variables.department_Id) {
        navigate(`/dashboard/hr/departments/${variables.department_Id}?tab=section`);
      } else {
        navigate("/dashboard/hr/sections");
      }
    },
    onError: (error) => {
      console.error("Failed to save section", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isEdit ? "Failed to update section!" : "Failed to add section!");
      toast.error(errMsg);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const departmentsRaw = departmentsData?.data?.items || [];
  const departments = departmentsRaw.filter(
    (v, i, a) => a.findIndex((t) => (t.id || t.department_Id) === (v.id || v.department_Id)) === i
  );
  const pageTitle = isEdit ? "Edit Section" : "Add Section";

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
            <span>Sections</span>
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
              {isEdit ? "Loading section details & data..." : "Loading form data..."}
            </p>
          </div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="section_Name"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Section Name
              </label>
              <Input
                id="section_Name"
                placeholder="Section Name"
                className="h-11 w-full bg-transparent"
                {...register("section_Name", { required: true })}
              />
              {errors.section_Name && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="department_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Department
              </label>
              <Controller
                name="department_Id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-10 py-5 w-full bg-transparent">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {departments.map((dept) => {
                        const deptId = String(dept.id || dept.department_Id);
                        return (
                          <SelectItem key={deptId} value={deptId}>
                            {dept.departmentName || dept.department_Name || dept.department_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
