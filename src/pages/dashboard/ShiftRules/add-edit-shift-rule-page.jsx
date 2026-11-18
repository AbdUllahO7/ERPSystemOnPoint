import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Calendar,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createShiftRule,
  updateShiftRule,
  getShiftRuleById,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  WEEK_DAYS,
  ABSENCE_POLICIES,
  timeStringToTicks,
  ticksToTimeString,
  parseWeekendDays,
} from "./_utils/shift-rule-helpers";

export default function AddEditShiftRulePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const isEdit = Boolean(id);

  const [selectedWeekends, setSelectedWeekends] = useState(["Friday", "Saturday"]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rule_Name: "",
      startTime: "09:00",
      endTime: "17:00",
      late_To_lerance_Minutes: 15,
      early_Leave_Tolerance_Minutes: 15,
      required_Logs_Per_Day: 2,
      absence_Policy_Type: "Standard",
      allow_Overtime: false,
      overtime_Rate_Multiplier: 1.5,
      max_Overtime_Hours_Per_Day: 2,
      apply_Late_Deduction: true,
      late_Deduction_Multiplier: 1.0,
    },
  });

  const allowOvertime = watch("allow_Overtime");
  const applyLateDeduction = watch("apply_Late_Deduction");

  const { data: shiftRuleData, isLoading: isLoadingShiftRule } = useQuery({
    queryKey: ["getShiftRuleById", id],
    queryFn: () => getShiftRuleById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && shiftRuleData?.data) {
      const item = shiftRuleData.data;
      setValue("rule_Name", item.rule_Name || item.ruleName || "");
      setValue(
        "startTime",
        ticksToTimeString(item.start_Attendance || item.startAttendance) || "09:00"
      );
      setValue(
        "endTime",
        ticksToTimeString(item.end_Attendance || item.endAttendance) || "17:00"
      );
      setValue(
        "late_To_lerance_Minutes",
        item.late_To_lerance_Minutes ?? item.lateToleranceMinutes ?? 15
      );
      setValue(
        "early_Leave_Tolerance_Minutes",
        item.early_Leave_Tolerance_Minutes ?? item.earlyLeaveToleranceMinutes ?? 15
      );
      setValue(
        "required_Logs_Per_Day",
        item.required_Logs_Per_Day ?? item.requiredLogsPerDay ?? 2
      );
      setValue(
        "absence_Policy_Type",
        item.absence_Policy_Type || item.absencePolicyType || "Standard"
      );
      setValue(
        "allow_Overtime",
        item.allow_Overtime ?? item.allowOvertime ?? false
      );
      setValue(
        "overtime_Rate_Multiplier",
        item.overtime_Rate_Multiplier ?? item.overtimeRateMultiplier ?? 1.5
      );
      setValue(
        "max_Overtime_Hours_Per_Day",
        item.max_Overtime_Hours_Per_Day ?? item.maxOvertimeHoursPerDay ?? 2
      );
      setValue(
        "apply_Late_Deduction",
        item.apply_Late_Deduction ?? item.applyLateDeduction ?? true
      );
      setValue(
        "late_Deduction_Multiplier",
        item.late_Deduction_Multiplier ?? item.lateDeductionMultiplier ?? 1.0
      );
      const days = parseWeekendDays(item.weekend_Days || item.weekendDays);
      setSelectedWeekends(days.length > 0 ? days : ["Friday", "Saturday"]);
    }
  }, [isEdit, shiftRuleData, setValue]);

  const toggleWeekendDay = (dayKey) => {
    setSelectedWeekends((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const mutation = useMutation({
    mutationFn: (formData) => {
      const startTicks = timeStringToTicks(formData.startTime);
      const endTicks = timeStringToTicks(formData.endTime);

      const basePayload = {
        rule_Name: formData.rule_Name.trim(),
        start_Attendance: { ticks: startTicks },
        end_Attendance: { ticks: endTicks },
        late_To_lerance_Minutes: Number(formData.late_To_lerance_Minutes) || 0,
        early_Leave_Tolerance_Minutes: Number(formData.early_Leave_Tolerance_Minutes) || 0,
        required_Logs_Per_Day: Number(formData.required_Logs_Per_Day) || 0,
        absence_Policy_Type: formData.absence_Policy_Type || "Standard",
        allow_Overtime: Boolean(formData.allow_Overtime),
        overtime_Rate_Multiplier: Number(formData.overtime_Rate_Multiplier) || 0,
        max_Overtime_Hours_Per_Day: Number(formData.max_Overtime_Hours_Per_Day) || 0,
        apply_Late_Deduction: Boolean(formData.apply_Late_Deduction),
        late_Deduction_Multiplier: Number(formData.late_Deduction_Multiplier) || 0,
      };

      if (isEdit) {
        return updateShiftRule({
          shift_Rule_id: id,
          ...basePayload,
          weekend_Days: selectedWeekends.join(", "),
        });
      }

      return createShiftRule({
        ...basePayload,
        weekend_Days: selectedWeekends,
      });
    },
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(
          res.message ||
            (isAr
              ? isEdit
                ? "فشل في تحديث قاعدة الوردية!"
                : "فشل في إضافة قاعدة الوردية!"
              : isEdit
              ? "Failed to update shift rule!"
              : "Failed to add shift rule!")
        );
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["getShiftRules"] });
      toast.success(
        res?.message ||
          (isAr
            ? isEdit
              ? "تم تحديث قاعدة الوردية بنجاح!"
              : "تمت إضافة قاعدة الوردية بنجاح!"
            : isEdit
            ? "Shift rule updated successfully!"
            : "Shift rule added successfully!")
      );
      navigate("/dashboard/hr/shift-rules");
    },
    onError: (error) => {
      console.error("Failed to save shift rule:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        (isAr
          ? isEdit
            ? "فشل في تحديث قاعدة الوردية!"
            : "فشل في إضافة قاعدة الوردية!"
          : isEdit
          ? "Failed to update shift rule!"
          : "Failed to add shift rule!");
      toast.error(errMsg);
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const pageTitle = isEdit
    ? isAr
      ? "تعديل قاعدة الوردية"
      : "Edit Shift Rule"
    : isAr
      ? "إضافة قاعدة وردية"
      : "Add Shift Rule";

  if (isEdit && isLoadingShiftRule) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <Link to="/dashboard/hr/shift-rules" className="hover:underline">
              {isAr ? "قواعد الورديات" : "Shift Rules"}
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/hr/shift-rules")}
            disabled={mutation.isPending}
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending || (isEdit && isLoadingShiftRule)}
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

      {/* Main Form Container */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {isAr ? "تفاصيل الوردية وسياسة الدوام" : "Shift Rule Configuration"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "يرجى تعبئة كافة الحقول الإلزامية (*) لحفظ قاعدة الوردية"
              : "Please complete all required fields (*) to save the shift rule."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Basic Info & Shift Timings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {isAr ? "مواعيد الوردية والبصمات" : "Shift Timings & Punches"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="rule_Name">
                  {isAr ? "اسم قاعدة الوردية" : "Rule Name"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rule_Name"
                  placeholder={
                    isAr
                      ? "مثال: دوام صباحي كامل، دوام مسائي، وردية ليلية"
                      : "e.g. Standard Full-Time Morning Shift"
                  }
                  {...register("rule_Name", {
                    required: isAr ? "اسم القاعدة مطلوب" : "Rule name is required",
                  })}
                  disabled={mutation.isPending}
                />
                {errors.rule_Name && (
                  <p className="text-xs text-destructive">{errors.rule_Name.message}</p>
                )}
              </div>

              {/* Start Attendance */}
              <div className="space-y-2">
                <Label htmlFor="startTime">
                  {isAr ? "وقت بدء الحضور" : "Attendance Start Time"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime", {
                    required: isAr ? "وقت الحضور مطلوب" : "Start time is required",
                  })}
                  disabled={mutation.isPending}
                />
              </div>

              {/* End Attendance */}
              <div className="space-y-2">
                <Label htmlFor="endTime">
                  {isAr ? "وقت نهاية الانصراف" : "Attendance End Time"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime", {
                    required: isAr ? "وقت الانصراف مطلوب" : "End time is required",
                  })}
                  disabled={mutation.isPending}
                />
              </div>

              {/* Required Logs */}
              <div className="space-y-2">
                <Label htmlFor="required_Logs_Per_Day">
                  {isAr ? "عدد البصمات اليومية المطلوبة" : "Required Logs Per Day"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="required_Logs_Per_Day"
                  type="number"
                  min="1"
                  max="10"
                  {...register("required_Logs_Per_Day", {
                    required: isAr ? "مطلوب" : "Required",
                    min: 1,
                  })}
                  disabled={mutation.isPending}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tolerances & Policy */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              {isAr ? "فترات السماحية وسياسة الغياب" : "Tolerances & Absence"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="late_To_lerance_Minutes">
                  {isAr ? "سماحية التأخير (بالدقائق)" : "Late Tolerance (Minutes)"}
                </Label>
                <Input
                  id="late_To_lerance_Minutes"
                  type="number"
                  min="0"
                  {...register("late_To_lerance_Minutes", { min: 0 })}
                  disabled={mutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? "الوقت المسموح بالتأخير دون احتساب خصم" : "Grace period allowed for late check-in"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="early_Leave_Tolerance_Minutes">
                  {isAr ? "سماحية الانصراف المبكر (بالدقائق)" : "Early Leave Tolerance (Minutes)"}
                </Label>
                <Input
                  id="early_Leave_Tolerance_Minutes"
                  type="number"
                  min="0"
                  {...register("early_Leave_Tolerance_Minutes", { min: 0 })}
                  disabled={mutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? "الوقت المسموح بالخروج المبكر دون خصم" : "Grace period allowed for early departure"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="absence_Policy_Type">
                  {isAr ? "سياسة التعامل مع الغياب" : "Absence Policy Type"}
                </Label>
                <Controller
                  name="absence_Policy_Type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ABSENCE_POLICIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {isAr ? p.ar : p.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Overtime & Deductions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {isAr ? "قواعد الإضافي والخصومات" : "Overtime & Deductions"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overtime Box */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_Overtime" className="font-semibold cursor-pointer">
                      {isAr ? "السماح بالعمل الإضافي" : "Allow Overtime"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? "تمكين احتساب الساعات الإضافية بعد انتهاء الدوام" : "Enable overtime calculation after shift ends"}
                    </p>
                  </div>
                  <Controller
                    name="allow_Overtime"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="allow_Overtime"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending}
                      />
                    )}
                  />
                </div>

                {allowOvertime && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="space-y-1.5">
                      <Label htmlFor="overtime_Rate_Multiplier" className="text-xs">
                        {isAr ? "معامل الساعة الإضافية" : "Overtime Multiplier"}
                      </Label>
                      <Input
                        id="overtime_Rate_Multiplier"
                        type="number"
                        step="0.1"
                        min="1"
                        placeholder="1.5"
                        {...register("overtime_Rate_Multiplier")}
                        disabled={mutation.isPending}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="max_Overtime_Hours_Per_Day" className="text-xs">
                        {isAr ? "أقصى ساعات يومية" : "Max Hours / Day"}
                      </Label>
                      <Input
                        id="max_Overtime_Hours_Per_Day"
                        type="number"
                        min="1"
                        placeholder="2"
                        {...register("max_Overtime_Hours_Per_Day")}
                        disabled={mutation.isPending}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Late Deduction Box */}
              <div className="p-4 rounded-xl border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="apply_Late_Deduction" className="font-semibold cursor-pointer">
                      {isAr ? "تطبيق خصم التأخير" : "Apply Late Deduction"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? "خصم التأخير من الراتب عند تجاوز السماحية" : "Deduct salary for tardiness exceeding grace period"}
                    </p>
                  </div>
                  <Controller
                    name="apply_Late_Deduction"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="apply_Late_Deduction"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending}
                      />
                    )}
                  />
                </div>

                {applyLateDeduction && (
                  <div className="pt-3 border-t">
                    <div className="space-y-1.5">
                      <Label htmlFor="late_Deduction_Multiplier" className="text-xs">
                        {isAr ? "معامل خصم التأخير" : "Late Deduction Multiplier"}
                      </Label>
                      <Input
                        id="late_Deduction_Multiplier"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="1.0"
                        {...register("late_Deduction_Multiplier")}
                        disabled={mutation.isPending}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Weekend Days */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {isAr ? "أيام العطلة الأسبوعية" : "Weekend Days"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {isAr ? "حدد الأيام التي تعتبر عطلة رسمية لهذه الوردية" : "Select the official weekly rest days for this shift"}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {WEEK_DAYS.map((day) => {
                const isSelected = selectedWeekends.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleWeekendDay(day.key)}
                    disabled={mutation.isPending}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {isAr ? day.ar : day.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/hr/shift-rules")}
              disabled={mutation.isPending}
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit
                ? isAr
                  ? "حفظ التعديلات"
                  : "Save Changes"
                : isAr
                  ? "إنشاء قاعدة الوردية"
                  : "Create Shift Rule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
