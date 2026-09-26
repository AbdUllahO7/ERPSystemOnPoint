import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createInventoryRecord,
  getWarehouses,
} from "@/lib/api";
import toast from "react-hot-toast";

export default function AddMaterialReport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      warehouse_Id: "",
      start_Date: "",
      end_Date: "",
      notes: "",
    },
  });

  const { data: warehouseData } = useQuery({
    queryKey: ["getWarehouses"],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
  });
  const warehouses = warehouseData?.data?.items || [];

  const mutation = useMutation({
    mutationFn: (data) => createInventoryRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory-records"]);
      toast.success("Material report added successfully!");
      navigate("/dashboard/inventory/material-reports");
    },
    onError: (error) => {
      console.error("Failed to save material report", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to add material report!");
    },
  });

  const onSubmit = (data) => {
    // Format dates to append time since input type="date" only gives YYYY-MM-DD
    const payload = {
      warehouse_Id: data.warehouse_Id,
      start_Date: data.start_Date ? new Date(data.start_Date).toISOString() : null,
      end_Date: data.end_Date ? new Date(data.end_Date).toISOString() : null,
      notes: data.notes,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Add Material Report</h2>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Inventory</span>
              <span>/</span>
              <span>Material Reports</span>
              <span>/</span>
              <span className="font-medium text-foreground">Add</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isLoading}
          className="px-8"
        >
          {mutation.isLoading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="warehouse_Id"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Warehouse Name
            </label>
            <Controller
              name="warehouse_Id"
              control={control}
              rules={{ required: "Warehouse is required" }}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="warehouse_Id" className="w-full h-9 bg-transparent">
                    <SelectValue placeholder="Select Warehouse Name" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name_Warehouse || warehouse.warehouse_Name || `Warehouse ${warehouse.id.substring(0,4)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.warehouse_Id && (
              <span className="text-red-500 text-xs">{errors.warehouse_Id.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="start_Date"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Start Date
            </label>
            <Input
              id="start_Date"
              type="date"
              className="h-9 bg-transparent"
              {...register("start_Date", { required: "Start date is required" })}
            />
            {errors.start_Date && (
              <span className="text-red-500 text-xs">{errors.start_Date.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="end_Date"
              className="text-sm font-semibold text-foreground leading-none"
            >
              End Date
            </label>
            <Input
              id="end_Date"
              type="date"
              className="h-9 bg-transparent"
              {...register("end_Date", { required: "End date is required" })}
            />
            {errors.end_Date && (
              <span className="text-red-500 text-xs">{errors.end_Date.message}</span>
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
              placeholder="Enter notes"
              className="h-9 bg-transparent"
              {...register("notes")}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
