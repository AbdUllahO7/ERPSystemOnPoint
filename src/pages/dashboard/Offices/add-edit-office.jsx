import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  createOffice,
  updateOffice,
  getOfficeById,
  getDepartments,
  getDepartmentSections,
  getSectionById,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditOffice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const sectorIdFromState = location.state?.sectorId;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name_Office: "",
      department_id: "",
      sector_id: "",
    },
  });

  const departmentId = watch("department_id");

  const { data: departmentsData } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => getDepartments({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: sectionsData, isFetching: isFetchingSections } = useQuery({
    queryKey: ["getDepartmentSections", departmentId],
    queryFn: () => getDepartmentSections({ department_id: departmentId }),
    enabled: !!departmentId,
  });

  const { data: sectionDataForAutoFill } = useQuery({
    queryKey: ["getSectionById", sectorIdFromState],
    queryFn: () => getSectionById(sectorIdFromState),
    enabled: !!sectorIdFromState && !isEdit,
  });

  const { data: officeData, isLoading: isLoadingOffice } = useQuery({
    queryKey: ["getOfficeById", id],
    queryFn: () => getOfficeById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && officeData?.data) {
      const office = officeData.data;
      setValue("name_Office", office.office_name || office.name_Office || office.office_Name || "");
      setValue("department_id", String(office.department_id || office.department_Id || ""));
    }
  }, [isEdit, officeData, setValue]);

  useEffect(() => {
    if (isEdit && officeData?.data && sectionsData) {
      const office = officeData.data;
      setValue("sector_id", String(office.sector_id || office.section_Id || office.section_id || ""));
    }
  }, [isEdit, officeData, sectionsData, setValue]);

  useEffect(() => {
    if (sectionDataForAutoFill?.data && !isEdit) {
      const depId = sectionDataForAutoFill.data.department_Id || sectionDataForAutoFill.data.department_id || "";
      setValue("department_id", String(depId));
    }
  }, [sectionDataForAutoFill, isEdit, setValue]);

  useEffect(() => {
    if (sectionDataForAutoFill?.data && !isEdit && sectionsData) {
      setValue("sector_id", String(sectorIdFromState || ""));
    }
  }, [sectionDataForAutoFill, isEdit, sectionsData, setValue, sectorIdFromState]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateOffice({
            office_Id: id,
            office_Name: data.name_Office,
            department_id: data.department_id,
            sector_id: data.sector_id,
          })
        : createOffice(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["getOffices"] });
      queryClient.invalidateQueries({ queryKey: ["getSectionOffices"] });
      toast.success(isEdit ? "Office updated successfully!" : "Office added successfully!");
      if (variables.sector_id) {
        navigate(`/dashboard/hr/sections/${variables.sector_id}?tab=office`);
      } else {
        navigate("/dashboard/hr/offices");
      }
    },
    onError: (error) => {
      console.error("Failed to save office", error);
      toast.error(isEdit ? "Failed to update office!" : "Failed to add office!");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const departmentsRaw = departmentsData?.data?.items || [];
  const departments = departmentsRaw.filter(
    (v, i, a) => a.findIndex((t) => (t.id || t.department_Id) === (v.id || v.department_Id)) === i
  );
  const sectionsRaw = sectionsData?.data?.items || [];
  const sections = sectionsRaw.filter(
    (v, i, a) => a.findIndex((t) => (t.id || t.section_Id) === (v.id || v.section_Id)) === i
  );
  const pageTitle = isEdit ? "Edit Office" : "Add Office";
  console.log("sections", sections.length);
  console.log("departments", departments);

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
            <span>Offices</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isLoading || isLoadingOffice}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {(isLoadingOffice && isEdit) || !departmentsData ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="name_Office"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Office Name
              </label>
              <Input
                id="name_Office"
                placeholder="Office Name"
                className="h-9 bg-transparent max-w-md"
                {...register("name_Office", { required: true })}
              />
              {errors.name_Office && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="department_id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Department
              </label>
              <Controller
                name="department_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-transparent">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {departments.map((dept) => {
                        const deptId = String(dept.id || dept.department_Id);
                        return (
                          <SelectItem key={deptId} value={deptId}>
                            {dept.departmentName || ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department_id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="sector_id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Section
              </label>
              <Controller
                name="sector_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                    disabled={!departmentId || isFetchingSections || (departmentId && sections.length === 0 && !isFetchingSections)}
                  >
                    <SelectTrigger className="w-full h-11 bg-transparent">
                      <SelectValue
                        placeholder={
                          !departmentId
                            ? "Select Section"
                            : isFetchingSections
                              ? "Loading sections..."
                              : "Select Section"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Array.isArray(sections) &&
                        sections.map((sec) => {
                          const secId = String(sec.id || sec.section_Id);
                          return (
                            <SelectItem key={secId} value={secId}>
                              {sec.name || sec.section_Name || sec.section_name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                )}
              />
              {!isFetchingSections && sections.length === 0 && departmentId && (
                <p className="text-sm text-muted-foreground mt-1">
                  No sections available for this department
                </p>
              )}
              {errors.sector_id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
