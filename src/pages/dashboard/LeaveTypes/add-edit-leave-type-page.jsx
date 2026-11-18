import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createLeaveType,
  updateLeaveType,
  getLeaveTypeById,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function AddEditLeaveTypePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      leaveTypeName: "",
      daysLimit: 0,
      isPaid: true,
    },
  });

  const { data: leaveTypeData, isLoading: isLoadingLeaveType } = useQuery({
    queryKey: ["getLeaveTypeById", id],
    queryFn: () => getLeaveTypeById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && leaveTypeData?.data) {
      const item = leaveTypeData.data;
      setValue("leaveTypeName", item.leaveTypeName || item.name || "");
      setValue("daysLimit", item.daysLimit ?? 0);
      setValue("isPaid", item.isPaid ?? true);
    }
  }, [isEdit, leaveTypeData, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        leaveTypeName: data.leaveTypeName.trim(),
        daysLimit: Number(data.daysLimit) || 0,
        isPaid: Boolean(data.isPaid),
      };

      if (isEdit) {
        return updateLeaveType({
          id,
          ...payload,
        });
      }
      return createLeaveType(payload);
    },
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(
          res.message ||
            (isAr
              ? isEdit
                ? "فشل في تحديث نوع الإجازة!"
                : "فشل في إضافة نوع الإجازة!"
              : isEdit
              ? "Failed to update leave type!"
              : "Failed to add leave type!")
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["getLeaveTypes"] });
      toast.success(
        res?.message ||
          (isAr
            ? isEdit
              ? "تم تحديث نوع الإجازة بنجاح!"
              : "تمت إضافة نوع الإجازة بنجاح!"
            : isEdit
            ? "Leave type updated successfully!"
            : "Leave type added successfully!")
      );
      navigate("/dashboard/hr/leave-types");
    },
    onError: (error) => {
      console.error("Failed to save leave type:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isAr
          ? isEdit
            ? "فشل في تحديث نوع الإجازة!"
            : "فشل في إضافة نوع الإجازة!"
          : isEdit
          ? "Failed to update leave type!"
          : "Failed to add leave type!");
      toast.error(errMsg);
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  const pageTitle = isEdit
    ? isAr
      ? "تعديل نوع الإجازة"
      : "Edit Leave Type"
    : isAr
    ? "إضافة نوع إجازة"
    : "Add Leave Type";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{pageTitle}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Link to="/dashboard/hr" className="hover:underline">
              {isAr ? "الموارد البشرية" : "HR"}
            </Link>
            <span>/</span>
            <Link to="/dashboard/hr/leave-types" className="hover:underline">
              {isAr ? "أنواع الإجازات" : "Leave Types"}
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/hr/leave-types")}
            disabled={mutation.isPending}
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending || (isEdit && isLoadingLeaveType)}
            className="px-8"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2 rtl:ml-2 rtl:mr-0" />
                {isAr ? "جارٍ الحفظ..." : "Saving..."}
              </>
            ) : isEdit ? (
              isAr ? "حفظ التعديل" : "Save Changes"
            ) : (
              isAr ? "+ إضافة" : "+ Add"
            )}
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isEdit && isLoadingLeaveType ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {isAr ? "جارٍ تحميل تفاصيل نوع الإجازة..." : "Loading leave type details..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leave Type Name */}
              <div className="space-y-2">
                <Label htmlFor="leaveTypeName" className="text-sm font-semibold text-foreground">
                  {isAr ? "اسم نوع الإجازة" : "Leave Type Name"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="leaveTypeName"
                  placeholder={
                    isAr
                      ? "مثال: إجازة سنوية، إجازة مرضية، إجازة أمومة"
                      : "e.g. Annual Leave, Sick Leave, Maternity Leave"
                  }
                  {...register("leaveTypeName", {
                    required: isAr
                      ? "اسم نوع الإجازة مطلوب"
                      : "Leave type name is required",
                  })}
                  disabled={mutation.isPending}
                />
                {errors.leaveTypeName && (
                  <p className="text-xs text-destructive">
                    {errors.leaveTypeName.message}
                  </p>
                )}
              </div>

              {/* Days Limit */}
              <div className="space-y-2">
                <Label htmlFor="daysLimit" className="text-sm font-semibold text-foreground">
                  {isAr ? "الحد الأقصى للأيام (الرصيد السنوي)" : "Days Limit (Annual Balance)"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="daysLimit"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...register("daysLimit", {
                    required: isAr ? "حد الأيام مطلوب" : "Days limit is required",
                    min: {
                      value: 0,
                      message: isAr
                        ? "يجب أن يكون الرقم 0 أو أكثر"
                        : "Days limit must be 0 or more",
                    },
                  })}
                  disabled={mutation.isPending}
                />
                {errors.daysLimit && (
                  <p className="text-xs text-destructive">
                    {errors.daysLimit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Is Paid Toggle */}
            <div className="p-4 rounded-xl border bg-muted/20 flex items-center justify-between max-w-md">
              <div className="space-y-0.5">
                <Label htmlFor="isPaid" className="text-sm font-semibold cursor-pointer">
                  {isAr ? "إجازة مدفوعة الأجر" : "Paid Leave"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "يتم صرف الراتب للموظف أثناء فترة الإجازة"
                    : "Employee receives compensation during this leave"}
                </p>
              </div>
              <Controller
                name="isPaid"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isPaid"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={mutation.isPending}
                  />
                )}
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/hr/leave-types")}
                disabled={mutation.isPending}
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="px-8">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 rtl:ml-2 rtl:mr-0" />
                    {isAr ? "جارٍ الحفظ..." : "Saving..."}
                  </>
                ) : isEdit ? (
                  isAr ? "حفظ التعديل" : "Save Changes"
                ) : (
                  isAr ? "+ إضافة" : "+ Add"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
