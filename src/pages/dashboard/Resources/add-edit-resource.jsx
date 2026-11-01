import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Building2,
  AlertTriangle,
  Users,
  DollarSign,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  createResource,
  updateResource,
  getResourceById,
  getResourceLookups,
} from "@/services/resources";

export default function AddEditResourcePage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initial resource state for impact analysis on edits
  const [initialResource, setInitialResource] = useState(null);

  // Form state strictly matching CreateResourceDto & UpdateResourceDto schemas
  const [formData, setFormData] = useState({
    name: "",
    referenceNumber: "",
    maxCapacity: "20",
    ownership: "Owned",
    fixedAssetId: "",
    supplierId: "",
    contractStartDate: "",
    contractEndDate: "",
    dailyRentalCost: "0",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || {
    suppliers: [],
    fixedAssets: [],
    statuses: [],
    ownerships: [
      { id: "Owned", name: isAr ? "مملوك" : "Owned" },
      { id: "Leased", name: isAr ? "مستأجر" : "Leased" },
    ],
  };

  const [manualAssetIdMode, setManualAssetIdMode] = useState(false);

  // Dynamic options ensuring current fixedAssetId is always present
  const fixedAssetOptions = useMemo(() => {
    const list = [...(lookups.fixedAssets || [])];
    if (formData.fixedAssetId && formData.fixedAssetId !== "none") {
      const exists = list.some((fa) => String(fa.id) === String(formData.fixedAssetId));
      if (!exists) {
        list.unshift({
          id: formData.fixedAssetId,
          name: isAr ? `الأصل المحدد (${formData.fixedAssetId})` : `Selected Asset (${formData.fixedAssetId})`,
        });
      }
    }
    return list;
  }, [lookups.fixedAssets, formData.fixedAssetId, isAr]);

  // Fetch resource if in edit mode
  const { data: resourceData, isLoading: isFetching } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && resourceData?.data) {
      const r = resourceData.data;
      const startDate = r.contractStartDate
        ? (r.contractStartDate.includes("T") ? r.contractStartDate.split("T")[0] : r.contractStartDate)
        : "";
      const endDate = r.contractEndDate
        ? (r.contractEndDate.includes("T") ? r.contractEndDate.split("T")[0] : r.contractEndDate)
        : "";

      setFormData({
        name: r.name || r.fullName || "",
        referenceNumber: r.referenceNumber || r.code || "",
        maxCapacity: String(r.maxCapacity ?? r.numericCapacity ?? r.capacity ?? 20),
        ownership: r.rawOwnership === "Leased" || r.ownership === "Leased" ? "Leased" : "Owned",
        fixedAssetId: r.fixedAssetId || "",
        supplierId: r.supplierId || "",
        contractStartDate: startDate,
        contractEndDate: endDate,
        dailyRentalCost: String(r.dailyRentalCost ?? 0),
      });

      setInitialResource({
        maxCapacity: Number(r.maxCapacity ?? r.numericCapacity ?? r.capacity ?? 20),
        contractEndDate: endDate,
      });
    }
  }, [isEdit, resourceData]);

  // Impact Analysis (Page 6: فحص أثر تخفيض السعة أو تقصير عقد الإيجار على الأحداث المرتبطة)
  const isCapacityDecreased = useMemo(() => {
    if (!isEdit || !initialResource) return false;
    const current = Number(formData.maxCapacity) || 0;
    return current > 0 && current < initialResource.maxCapacity;
  }, [isEdit, initialResource, formData.maxCapacity]);

  const isContractShortened = useMemo(() => {
    if (!isEdit || !initialResource?.contractEndDate || formData.ownership !== "Leased") return false;
    if (!formData.contractEndDate) return false;
    return new Date(formData.contractEndDate) < new Date(initialResource.contractEndDate);
  }, [isEdit, initialResource, formData.contractEndDate, formData.ownership]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateResource(id, data) : createResource(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["resources"]);
      toast.success(
        res?.message ||
          (isEdit
            ? isAr
              ? "تم تحديث المورد بنجاح"
              : "Resource updated successfully!"
            : isAr
            ? "تم إنشاء المورد بنجاح"
            : "Resource created successfully!")
      );
      navigate("/dashboard/resources");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (isEdit
          ? isAr
            ? "فشل تحديث المورد"
            : "Failed to update resource"
          : isAr
          ? "فشل إنشاء المورد"
          : "Failed to create resource");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      toast.error(isAr ? "يرجى إدخال اسم المورد" : "Resource name is required");
      return;
    }

    const cap = Number(formData.maxCapacity);
    if (!cap || cap <= 0) {
      toast.error(isAr ? "السعة القصوى يجب أن تكون رقماً موجباً أكبر من صفر" : "Max capacity must be greater than 0");
      return;
    }

    // Validation matching business and schema rules
    if (formData.ownership === "Leased") {
      if (!formData.supplierId || formData.supplierId === "none") {
        toast.error(isAr ? "المورد المستأجر يتطلب تحديد المورّد أو المالك" : "Supplier is required for leased resources");
        return;
      }
      if (!formData.contractStartDate || !formData.contractEndDate) {
        toast.error(isAr ? "يجب تحديد تاريخ بداية ونهاية عقد الاستئجار" : "Contract start and end dates are required");
        return;
      }
      if (new Date(formData.contractEndDate) < new Date(formData.contractStartDate)) {
        toast.error(isAr ? "تاريخ نهاية العقد يجب أن يكون لاحقاً لتاريخ البداية" : "Contract end date must be after start date");
        return;
      }
      const cost = Number(formData.dailyRentalCost);
      if (isNaN(cost) || cost < 0) {
        toast.error(isAr ? "تكلفة الإيجار اليومية يجب أن تكون صفراً أو أكثر" : "Daily rental cost must be 0 or more");
        return;
      }
    }

    saveMutation.mutate(formData);
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const isLeased = formData.ownership === "Leased";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={
            isEdit
              ? isAr
                ? "تعديل المورد"
                : "Edit Resource"
              : isAr
              ? "إضافة مورد جديد"
              : "Add Resource"
          }
          breadcrumbLinks={[
            { label: isAr ? "الموارد والقاعات" : "Resources", href: "/dashboard/resources" },
            { label: isEdit ? (isAr ? "تعديل المورد" : "Edit Resource") : (isAr ? "إضافة مورد" : "Add Resource") },
          ]}
          infoTooltip={
            isAr
              ? "إدارة الموارد المادية مع تحديد السعة، نموذج الملكية، تكلفة الاستئجار، وفترة العقد."
              : "Manage physical resources with capacity, ownership model, rental costs, and contract period."
          }
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/resources")}
            className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || !formData.name?.trim() || !formData.maxCapacity}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
            title={!formData.name?.trim() || !formData.maxCapacity ? (isAr ? "يرجى إدخال اسم المورد والسعة القصوى" : "Please enter resource name and max capacity") : ""}
          >
            {saveMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
            )}
            {isAr ? "حفظ المورد" : "Save Resource"}
          </Button>
        </div>
      </div>

      {/* Impact Analysis Alerts on Edit (Page 6) */}
      {isCapacityDecreased && (
        <div className="p-3.5 bg-amber-50 border-r-4 border-amber-600 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{isAr ? "تحذير أثر تخفيض السعة:" : "Capacity Impact Warning:"}</p>
            <p className="leading-relaxed">
              {isAr
                ? `لقد قمت بتخفيض السعة القصوى من ${initialResource.maxCapacity} إلى ${formData.maxCapacity}. يرجى التحقق من الأحداث والحجوزات المرتبطة مسبقاً بهذا المورد للتأكد من عدم تجاوز الحضور للسعة الجديدة.`
                : `You decreased max capacity from ${initialResource.maxCapacity} to ${formData.maxCapacity}. Please verify linked events and reservations to ensure attendance does not exceed the new capacity.`}
            </p>
          </div>
        </div>
      )}

      {isContractShortened && (
        <div className="p-3.5 bg-amber-50 border-r-4 border-amber-600 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{isAr ? "تحذير أثر تقصير عقد الإيجار:" : "Lease Period Impact Warning:"}</p>
            <p className="leading-relaxed">
              {isAr
                ? `لقد تم تقصير تاريخ نهاية عقد الاستئجار إلى ${formData.contractEndDate} (السابق كان ${initialResource.contractEndDate}). يرجى التحقق من الأحداث المستقبلية المجدولة بعد هذا التاريخ لتفادي التعارض التشغيلي.`
                : `Lease contract end date was shortened to ${formData.contractEndDate} (previously ${initialResource.contractEndDate}). Please check future scheduled events after this date to avoid operational conflicts.`}
            </p>
          </div>
        </div>
      )}

      {/* Resource Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0066d1]" />
          {isAr ? "بيانات ومواصفات المورد" : "Resource Specifications"}
        </h2>

        {/* Row 1: Name, Reference Number, Max Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "اسم المورد" : "Resource Name"} <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder={isAr ? "مثال: قاعة المؤتمرات الرئيسية" : "e.g. Main Conference Hall"}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "الرقم المرجعي / الكود" : "Reference Number"}
            </Label>
            <Input
              placeholder={isAr ? "مثال: RES-001" : "e.g. RES-001"}
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "السعة القصوى" : "Max Capacity"} <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="20"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9"
              />
              <Users className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 2: Ownership Model, Fixed Asset (if owned) OR Supplier & Daily Cost (if leased) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-slate-50">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "نموذج الملكية" : "Ownership Model"} <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.ownership}
              onValueChange={(val) => handleInputChange("ownership", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder={isAr ? "اختر نموذج الملكية" : "Select Ownership"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">{isAr ? "مملوك" : "Owned"}</SelectItem>
                <SelectItem value="Leased">{isAr ? "مستأجر" : "Leased"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isLeased ? (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  {isAr ? "الأصل الثابت المرتبط" : "Linked Fixed Asset"}
                </Label>
                {lookups.fixedAssets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setManualAssetIdMode((prev) => !prev)}
                    className="text-[11px] font-medium text-[#0066d1] hover:underline cursor-pointer"
                  >
                    {manualAssetIdMode
                      ? (isAr ? "اختيار من القائمة" : "Select from list")
                      : (isAr ? "إدخال المعرف يدوياً" : "Enter GUID manually")}
                  </button>
                )}
              </div>

              {manualAssetIdMode || lookups.fixedAssets.length === 0 ? (
                <div className="space-y-1.5">
                  <Input
                    placeholder={isAr ? "معرف الأصل الثابت (GUID)" : "Fixed Asset GUID"}
                    value={formData.fixedAssetId}
                    onChange={(e) => handleInputChange("fixedAssetId", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500">
                    {lookups.fixedAssets.length === 0
                      ? isAr
                        ? "لا توجد أصول ثابتة مسجلة في القائمة حالياً. تم تفعيل الإدخال المباشر لتتمكن من كتابة معرف الأصل."
                        : "No fixed assets found in the list. You can enter the asset GUID directly."
                      : isAr
                      ? "يمكنك إدخال معرف الأصل الثابت مباشرة أو الضغط أعلاه للاختيار من القائمة."
                      : "You can enter the fixed asset GUID directly or select from the list above."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Select
                    value={formData.fixedAssetId || "none"}
                    onValueChange={(val) => handleInputChange("fixedAssetId", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                      <SelectValue placeholder={isAr ? "اختر الأصل الثابت" : "Select Fixed Asset"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {isAr ? "-- غير مرتبط بأصل محدد --" : "-- None / Unlinked --"}
                      </SelectItem>
                      {fixedAssetOptions.map((fa) => (
                        <SelectItem key={fa.id} value={String(fa.id)}>
                          {fa.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400">
                    {isAr
                      ? "المورد المملوك يمكن ربطه بأصل ثابت دفتري، أو تركه فارغاً."
                      : "An owned resource can be linked to a fixed asset or left unlinked."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  {isAr ? "المورّد / المالك المؤجر" : "Supplier / Lessor"} <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.supplierId || "none"}
                  onValueChange={(val) => handleInputChange("supplierId", val === "none" ? "" : val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder={isAr ? "اختر المورّد أو المؤجر" : "Select Supplier / Lessor"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {isAr ? "-- اختر المورّد أو المؤجر --" : "-- Select Supplier --"}
                    </SelectItem>
                    {lookups.suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  {isAr ? "تكلفة الإيجار اليومية" : "Daily Rental Cost"}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.dailyRentalCost}
                    onChange={(e) => handleInputChange("dailyRentalCost", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9 font-semibold"
                  />
                  <DollarSign className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Row 3 (For Leased): Contract Start & End Date */}
        {isLeased && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-50">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                {isAr ? "تاريخ بداية عقد الاستئجار" : "Contract Start Date"} <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => handleInputChange("contractStartDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                {isAr ? "تاريخ نهاية عقد الاستئجار" : "Contract End Date"} <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => handleInputChange("contractEndDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
