import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
<<<<<<< Updated upstream
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
=======
>>>>>>> Stashed changes
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
      setValue("section_Name", section.section_name || section.section_Name || "");
      setValue("department_Id", String(section.department_Id || section.department_id || ""));
    }
  }, [isEdit, sectionData, setValue]);

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
          disabled={mutation.isLoading || isLoadingSection}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {(isLoadingSection && isEdit) || !departmentsData ? (
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
<<<<<<< Updated upstream
                className="h-9 bg-transparent max-w-md"
=======
                className="h-11  w-full bg-transparent"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                    <SelectTrigger className="w-full max-w-md h-9 bg-transparent">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id || dept.department_Id} value={String(dept.id || dept.department_Id)}>
                          {dept.departmentName || dept.department_Name || dept.department_name}
                        </SelectItem>
                      ))}
=======
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
>>>>>>> Stashed changes
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
