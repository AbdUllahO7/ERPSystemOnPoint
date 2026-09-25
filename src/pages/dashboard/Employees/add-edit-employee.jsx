import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createEmployee,
  updateEmployee,
  getEmployeeById,
  getDepartmentSections,
  getLookupPositions,
  getJobTitles,
  getShiftRules,
  getOffices,
  getAllManagers,
  getEmployeeStatus,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      fatherName: "",
      motherName: "",
      email: "",
      phone: "",
      sectionId: "",
      positionId: "",
      officeId: "",
      jobTitleId: "",
      statusId: "",
      jobNumber: "",
      managerId: "",
      shiftRules: "", // shiftRules in Create, shift_Id in Edit
      location: "", // from screenshot
      birthDate: "", // from screenshot
    },
  });

  const { data: sectionsData } = useQuery({
    queryKey: ["getDepartmentSections"],
    queryFn: () => getDepartmentSections({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: positionsData } = useQuery({
    queryKey: ["getLookupPositions"],
    queryFn: () => getLookupPositions({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: jobTitlesData } = useQuery({
    queryKey: ["getJobTitles"],
    queryFn: () => getJobTitles({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: shiftRulesData } = useQuery({
    queryKey: ["getShiftRules"],
    queryFn: () => getShiftRules({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: officesData } = useQuery({
    queryKey: ["getOffices"],
    queryFn: () => getOffices({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: managersData } = useQuery({
    queryKey: ["getAllManagers"],
    queryFn: () => getAllManagers({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: statusData } = useQuery({
    queryKey: ["getEmployeeStatus"],
    queryFn: () => getEmployeeStatus({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["getEmployeeById", id],
    queryFn: () => getEmployeeById(id),
    enabled: isEdit,
  });

 

  useEffect(() => {
    if (isEdit && employeeData?.data) {
      const emp = employeeData.data;
      setValue("firstName", emp.firstName || "");
      setValue("lastName", emp.lastName || "");
      setValue("fatherName", emp.fatherName || "");
      setValue("motherName", emp.motherName || "");
      setValue("email", emp.email || "");
      setValue("phone", emp.phone || "");
      setValue("sectionId", emp.sectionId || "");
      setValue("positionId", emp.positionId || "");
      setValue("officeId", emp.officeId || "");
      setValue("jobTitleId", emp.jobTitleId || "");
      setValue("statusId", emp.statusId || "");
      setValue("jobNumber", emp.jobNumber || "");
      setValue("managerId", emp.managerId || "");
      setValue("shiftRules", emp.shiftRuleId || emp.shiftRules || ""); // API uses shift_Id in response/update
      setValue("location", emp.location || "");
      if (emp.birthDate) {
        setValue("birthDate", emp.birthDate.split("T")[0]);
      }
    }
  }, [isEdit, employeeData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateEmployee({ ...data, id, shift_Id: data.shiftRules }) // update expects shift_Id
        : createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getEmployees"]);
      toast.success(isEdit ? "Employee updated successfully!" : "Employee added successfully!");
      navigate("/dashboard/hr/employees");
    },
    onError: (error) => {
      const errorMessage = error?.message && error.message !== "An unexpected error occurred" 
        ? error.message 
        : (isEdit ? "Failed to update employee!" : "Failed to add employee!");
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const sections = sectionsData?.data?.items || [];
  const positions = positionsData?.data?.items || [];
  const jobTitles = jobTitlesData?.data?.items || [];
  const shiftRules = shiftRulesData?.data?.items || [];
  const offices = officesData?.data?.items || [];
  const managers = managersData?.data?.items || [];
  const statuses = statusData?.data?.items || [];
  console.log(offices);

  const pageTitle = isEdit ? "Edit Employee" : "Add Employee";

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
            <span>Employees</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isLoading || isLoadingEmployee}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : isEdit ? "Update" : "+ Add"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {(isLoadingEmployee && isEdit) || !sectionsData || !positionsData || !jobTitlesData || !shiftRulesData || !officesData || !managersData || !statusData ? (
          <div className="text-sm text-muted-foreground">
            Loading details...
          </div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                First Name
              </label>
              <Input
                placeholder="First Name"
                className="h-9 bg-transparent"
                {...register("firstName", { required: true })}
              />
              {errors.firstName && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Last name
              </label>
              <Input
                placeholder="Last name"
                className="h-9 bg-transparent"
                {...register("lastName", { required: true })}
              />
              {errors.lastName && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Father name
              </label>
              <Input
                placeholder="Father name"
                className="h-9 bg-transparent"
                {...register("fatherName", { required: true })}
              />
              {errors.fatherName && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Mother name
              </label>
              <Input
                placeholder="Mother name"
                className="h-9 bg-transparent"
                {...register("motherName")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Birth date
              </label>
              <Input
                type="date"
                className="h-9 bg-transparent"
                {...register("birthDate")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Sector / Department
              </label>
              <Controller
                name="sectionId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Sector" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {sections.map((sec) => (
                        <SelectItem key={sec.id} value={String(sec.id)}>
                          {sec.name || sec.sectionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sectionId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Office
              </label>
              <Controller
                name="officeId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Office" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {offices?.map((office) => (
                        <SelectItem key={office.id} value={String(office.id)}>
                          {office?.office_name || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.officeId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Position
              </label>
              <Controller
                name="positionId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={String(pos.id)}>
                          {pos.name || pos.positionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.positionId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Job Title
              </label>
              <Controller
                name="jobTitleId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Job Title" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {jobTitles.map((job) => (
                        <SelectItem key={job.id} value={String(job.id)}>
                          {job.jobTitleName || job.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.jobTitleId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Email
              </label>
              <Input
                type="email"
                placeholder="Email"
                className="h-9 bg-transparent"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Phone Number
              </label>
              <Input
                placeholder="+965"
                className="h-9 bg-transparent"
                {...register("phone", { required: true })}
              />
              {errors.phone && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Location
              </label>
              <Input
                placeholder="Location"
                className="h-9 bg-transparent"
                {...register("location")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Job Number
              </label>
              <Input
                placeholder="Job Number"
                className="h-9 bg-transparent"
                {...register("jobNumber", { required: true })}
              />
              {errors.jobNumber && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            {/* Hidden or additional fields required by API */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Manager
              </label>
              <Controller
                name="managerId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {managers.map((m) => (
                        <SelectItem key={m.managerId || m.id} value={String(m.managerId || m.id)}>
                          {m.managerName || m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.managerId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Shift Rule
              </label>
              <Controller
                name="shiftRules"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Shift Rule" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {shiftRules.map((rule) => (
                        <SelectItem key={rule.shift_Rule_id} value={String(rule.shift_Rule_id)}>
                          {rule.rule_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shiftRules && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground leading-none">
                Status
              </label>
              <Controller
                name="statusId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={String(status.id)}>
                          {status.statusName || status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.statusId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
