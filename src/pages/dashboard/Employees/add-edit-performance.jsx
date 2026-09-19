import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addPerformance,
  updatePerformance,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditPerformance() {
  const { id } = useParams(); // this is the employee ID
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const editItem = location.state?.editItem;
  const isEdit = !!editItem;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "Positive",
      note: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isEdit && editItem) {
      setValue("type", editItem.type || "Positive");
      setValue("note", editItem.note || "");
      setValue("date", editItem.date ? editItem.date.split("T")[0] : new Date().toISOString().split('T')[0]);
    }
  }, [isEdit, editItem, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updatePerformance({ id: editItem.id, ...data })
        : addPerformance({ employeeId: id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries(["getPerformance"]);
      toast.success(isEdit ? "Performance updated successfully!" : "Performance added successfully!");
      navigate(`/dashboard/hr/employees/${id}?tab=performance`);
    },
    onError: (error) => {
      console.error("Failed to save performance", error);
      toast.error(isEdit ? "Failed to update performance!" : "Failed to add performance!");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      type: data.type,
      note: data.note,
      date: new Date(data.date).toISOString()
    });
  };

  const pageTitle = isEdit ? "Edit Performance" : "Add Performance";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{pageTitle}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="cursor-pointer hover:underline" onClick={() => navigate(`/dashboard/hr/employees/${id}?tab=performance`)}>Performance</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/dashboard/hr/employees/${id}?tab=performance`)} 
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={mutation.isPending}
            className="px-8 bg-[#0066d1] hover:bg-blue-700 text-white"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="type"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Type
            </label>
            <select
              id="type"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("type", { required: true })}
            >
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
            </select>
            {errors.type && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="date"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Date
            </label>
            <Input
              id="date"
              type="date"
              className="h-11 bg-transparent"
              {...register("date", { required: true })}
            />
            {errors.date && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="note"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Notes
            </label>
            <textarea
              id="note"
              className="flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] bg-transparent resize-none"
              placeholder="Write notes here..."
              {...register("note")}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
