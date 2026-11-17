import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";
import {
  createPosition,
  updatePosition,
  getPositionById,
} from "../../../lib/api";
import toast from "react-hot-toast";

export default function AddEditPosition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      position_Name: "",
    },
  });

  const { data: positionData, isLoading: isLoadingPosition } = useQuery({
    queryKey: ["getPositionById", id],
    queryFn: () => getPositionById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && positionData?.data) {
      const position = positionData.data;
      setValue("position_Name", position.position_name || position.position_Name || "");
    }
  }, [isEdit, positionData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updatePosition({
            position_Id: id,
            position_Name: data.position_Name,
          })
        : createPosition({
            namePosition: data.position_Name,
          }),
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || (isAr ? (isEdit ? "فشل في تحديث المنصب!" : "فشل في إضافة المنصب!") : (isEdit ? "Failed to update position!" : "Failed to add position!")));
        return;
      }
      queryClient.invalidateQueries(["getPositions"]);
      toast.success(
        res?.message || (isAr ? (isEdit ? "تم تحديث المنصب بنجاح!" : "تمت إضافة المنصب بنجاح!") : (isEdit ? "Position updated successfully!" : "Position added successfully!"))
      );
      navigate("/dashboard/hr/positions");
    },
    onError: (error) => {
      console.error("Failed to save position", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isAr ? (isEdit ? "فشل في تحديث المنصب!" : "فشل في إضافة المنصب!") : (isEdit ? "Failed to update position!" : "Failed to add position!"));
      toast.error(errMsg);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const pageTitle = isEdit
    ? (isAr ? "تعديل المنصب" : "Edit Position")
    : (isAr ? "إضافة منصب" : "Add Position");

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
            <span
              className="cursor-pointer hover:text-primary"
              onClick={() => navigate("/dashboard/hr/positions")}
            >
              {isAr ? translateErp("Positions", locale) : "Positions"}
            </span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isLoading || isLoadingPosition}
          className="px-8 cursor-pointer"
        >
          {mutation.isLoading ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingPosition && isEdit ? (
          <div className="text-sm text-muted-foreground">{isAr ? "جارٍ تحميل التفاصيل..." : "Loading details..."}</div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="position_Name"
                className="text-sm font-semibold text-foreground leading-none"
              >
                Position Name
              </Label>
              <Input
                id="position_Name"
                placeholder="Position Name"
                className="h-9 bg-transparent max-w-md"
                {...register("position_Name", { required: true })}
              />
              {errors.position_Name && (
                <span className="text-red-500 text-xs">{isAr ? "مطلوب" : "Required"}</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
