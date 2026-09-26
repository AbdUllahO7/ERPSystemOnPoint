import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCostCenter,
  updateCostCenter,
  getCostCenterById,
  getLeafAccounts,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditCostCenter() {
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
      cost_Center_Number: "",
      cost_Center_Name: "",
      linked_Account_Id: "",
    },
  });

  const { data: accountsData } = useQuery({
    queryKey: ["getLeafAccounts"],
    queryFn: () => getLeafAccounts({ pageNumber: 1, pageSize: 100 }),
  });

  const { data: costCenterData, isLoading: isLoadingCostCenter } = useQuery({
    queryKey: ["getCostCenterById", id],
    queryFn: () => getCostCenterById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && costCenterData?.data) {
      const data = costCenterData.data;
      setValue("cost_Center_Number", data.cost_Center_Number || "");
      setValue("cost_Center_Name", data.cost_Center_Name || "");
      setValue("linked_Account_Id", data.linked_Account_Id || "");
    }
  }, [isEdit, costCenterData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateCostCenter({ ...data, id })
        : createCostCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllCostCenters"]);
      toast.success(isEdit ? "Cost center updated successfully!" : "Cost center added successfully!");
      navigate("/dashboard/accounting/cost-centers");
    },
    onError: (error) => {
      console.error("Failed to save cost center", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save cost center!");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      cost_Center_Number: data.cost_Center_Number,
      cost_Center_Name: data.cost_Center_Name,
      linked_Account_Id: data.linked_Account_Id,
    };
    mutation.mutate(payload);
  };

  const accounts = accountsData?.data?.items || [];
  const pageTitle = isEdit ? "Edit Cost Center" : "Add Cost Center";

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
            <span>Accounting</span>
            <span>/</span>
            <span>Cost Centers</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isLoading || isLoadingCostCenter}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingCostCenter && isEdit ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="cost_Center_Number"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Cost Center Number
              </label>
              <Input
                id="cost_Center_Number"
                placeholder="Number"
                className="h-9 bg-transparent"
                {...register("cost_Center_Number", { required: true })}
              />
              {errors.cost_Center_Number && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="cost_Center_Name"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Cost Center Name
              </label>
              <Input
                id="cost_Center_Name"
                placeholder="Name"
                className="h-9 bg-transparent"
                {...register("cost_Center_Name", { required: true })}
              />
              {errors.cost_Center_Name && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="linked_Account_Id"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Linked Account
              </label>
              <Controller
                name="linked_Account_Id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Linked Account" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.linked_Account_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
