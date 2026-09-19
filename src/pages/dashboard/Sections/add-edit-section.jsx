import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      section_Name: "",
      department_Id: departmentIdFromState || "",
    },
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => getDepartments({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: sectionData, isLoading: isLoadingSection } = useQuery({
    queryKey: ["getSectionById", id],
    queryFn: () => getSectionById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && sectionData?.data) {
      const section = sectionData.data;
      setValue("section_Name", section.section_name || "");
      setValue("department_Id", section.department_Id || "");
    }
  }, [isEdit, sectionData, setValue]);

  useEffect(() => {
    if (!isEdit && departmentIdFromState && departmentsData) {
      setValue("department_Id", departmentIdFromState);
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["getSections"]);
      queryClient.invalidateQueries(["getDepartmentSections"]);
      toast.success(isEdit ? "Section updated successfully!" : "Section added successfully!");
      if (variables.department_Id) {
        navigate(`/dashboard/hr/departments/${variables.department_Id}?tab=section`);
      } else {
        navigate("/dashboard/hr/sections");
      }
    },
    onError: (error) => {
      console.error("Failed to save section", error);
      toast.error(isEdit ? "Failed to update section!" : "Failed to add section!");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const departments = departmentsData?.data?.items || [];
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
          disabled={mutation.isLoading || isLoadingSection}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingSection && isEdit ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
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
                className="h-11 bg-transparent max-w-md"
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
              <select
                id="department_Id"
                className="flex h-11 w-full max-w-md items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("department_Id", { required: true })}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.department_Id} value={dept.id || dept.department_Id}>
                    {dept.departmentName || dept.department_Name || dept.department_name}
                  </option>
                ))}
              </select>
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
